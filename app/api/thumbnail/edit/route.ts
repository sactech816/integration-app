import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logAIUsage } from '@/lib/ai-usage';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { imageUrl, editInstruction, aspectRatio, userId } = body;

    if (!imageUrl) {
      return NextResponse.json({ error: '編集元の画像URLが必要です' }, { status: 400 });
    }
    if (!editInstruction?.trim()) {
      return NextResponse.json({ error: '編集指示を入力してください' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini APIキーが設定されていません' }, { status: 500 });
    }

    // 既存画像をfetchしてbase64に変換
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return NextResponse.json({ error: '元画像の取得に失敗しました' }, { status: 500 });
    }
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageArrayBuffer).toString('base64');
    const contentType = imageResponse.headers.get('content-type') || 'image/png';

    // Geminiにマルチモーダル入力（画像+修正指示）を送信
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: contentType, data: base64Image } },
            { text: `この画像を以下の指示に従って編集してください: ${editInstruction}\n\nIMPORTANT: 日本語テキストは正確に保持してください。指示された変更のみ行い、テキスト内容は変更しないでください。` },
          ],
        },
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: aspectRatio || '16:9',
          imageSize: '2K',
        },
      },
    });

    // レスポンスから画像データ抽出
    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      return NextResponse.json({ error: '画像の編集に失敗しました' }, { status: 500 });
    }

    const imagePart = parts.find(
      (part: Record<string, unknown>) => part.inlineData && typeof part.inlineData === 'object'
    );

    if (!imagePart?.inlineData?.data) {
      return NextResponse.json({ error: '編集画像データの取得に失敗しました' }, { status: 500 });
    }

    // Supabase Storageにアップロード
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'ストレージの接続に失敗しました' }, { status: 500 });
    }

    const imageBuffer = Buffer.from(imagePart.inlineData.data as string, 'base64');
    const mimeType = (imagePart.inlineData.mimeType as string) || 'image/png';
    const ext = mimeType.includes('jpeg') ? 'jpg' : 'png';
    const filePath = `${userId || 'anonymous'}/edit_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('thumbnail-images')
      .upload(filePath, imageBuffer, { contentType: mimeType });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: '画像のアップロードに失敗しました: ' + uploadError.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from('thumbnail-images')
      .getPublicUrl(filePath);

    // AI使用量を記録
    if (userId) {
      logAIUsage({
        userId,
        actionType: 'thumbnail_edit',
        service: 'makers',
        modelUsed: 'gemini-2.5-flash-image',
        usageType: 'standard',
        metadata: { editInstruction },
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      imageUrl: urlData.publicUrl,
      editInstruction,
    });
  } catch (error) {
    console.error('Thumbnail edit error:', error);
    const message = error instanceof Error ? error.message : '不明なエラー';
    return NextResponse.json({ error: 'サムネイルの編集に失敗しました: ' + message }, { status: 500 });
  }
}
