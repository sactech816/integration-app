import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logAIUsage } from '@/lib/ai-usage';
import { getTemplateById } from '@/constants/templates/thumbnail';
import { getMakersSubscriptionStatus } from '@/lib/subscription';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// ユーザーのサムネイル生成回数を取得
async function getThumbnailGenerateCount(userId: string): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 0;

  const { count } = await supabase
    .from('ai_usage_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action_type', 'thumbnail_generate');

  return count || 0;
}

const FREE_TRIAL_LIMIT = 1; // 無料ユーザーは1回だけ

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { templateId, title, subtitle, colorThemeId, platform, aspectRatio, userId } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 });
    }

    // ログイン必須チェック
    if (!userId) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    // Pro制限チェック: Proユーザーは無制限、無料ユーザーは1回まで
    const subStatus = await getMakersSubscriptionStatus(userId);
    const isPro = subStatus.planTier === 'pro';

    if (!isPro) {
      const generateCount = await getThumbnailGenerateCount(userId);
      if (generateCount >= FREE_TRIAL_LIMIT) {
        return NextResponse.json(
          {
            error: 'FREE_TRIAL_EXCEEDED',
            message: 'サムネイルメーカーはPro機能です。無料トライアル（1回）を使い切りました。',
            usedCount: generateCount,
            limit: FREE_TRIAL_LIMIT,
          },
          { status: 403 }
        );
      }
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini APIキーが設定されていません' }, { status: 500 });
    }

    // テンプレートからプロンプト構築
    const template = templateId ? getTemplateById(templateId) : null;
    let prompt = template?.promptTemplate ||
      `Create a professional thumbnail image with the text "{{title}}" prominently displayed in large, bold Japanese text. Dynamic and eye-catching design. The text must be clearly readable.`;

    prompt = prompt.replace(/\{\{title\}\}/g, title);
    prompt = prompt.replace(/\{\{subtitle\}\}/g, subtitle ? `Subtitle text: "${subtitle}" displayed below the main text.` : '');

    // カラーテーマ適用
    const colorTheme = template?.colorThemes.find(t => t.id === colorThemeId);
    prompt = prompt.replace(/\{\{colorModifier\}\}/g, colorTheme?.promptModifier || '');

    // 日本語テキスト描画の指示を強化
    prompt += '\nCRITICAL: All Japanese text (日本語) must be rendered accurately and clearly. The text is the most important element of this image.';

    // Gemini画像生成
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
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
      return NextResponse.json({ error: '画像の生成に失敗しました' }, { status: 500 });
    }

    const imagePart = parts.find(
      (part: Record<string, unknown>) => part.inlineData && typeof part.inlineData === 'object'
    );

    if (!imagePart?.inlineData?.data) {
      return NextResponse.json({ error: '画像データの取得に失敗しました' }, { status: 500 });
    }

    // Base64 → Buffer → Supabase Storage にアップロード
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'ストレージの接続に失敗しました' }, { status: 500 });
    }

    const imageBuffer = Buffer.from(imagePart.inlineData.data as string, 'base64');
    const mimeType = (imagePart.inlineData.mimeType as string) || 'image/png';
    const ext = mimeType.includes('jpeg') ? 'jpg' : 'png';
    const filePath = `${userId || 'anonymous'}/${Date.now()}.${ext}`;

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
        actionType: 'thumbnail_generate',
        service: 'makers',
        modelUsed: 'gemini-2.5-flash-image',
        usageType: 'standard',
        metadata: { templateId, platform, title, aspectRatio },
      }).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      imageUrl: urlData.publicUrl,
      prompt,
    });
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    const message = error instanceof Error ? error.message : '不明なエラー';
    return NextResponse.json({ error: 'サムネイルの生成に失敗しました: ' + message }, { status: 500 });
  }
}
