import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { logAIUsage } from '@/lib/ai-usage';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

interface ResultInput {
  type: string;
  title: string;
  description: string;
}

export async function POST(request: Request) {
  try {
    // 認証チェック
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini APIキーが設定されていません' }, { status: 500 });
    }

    const body = await request.json();
    const { results, style, theme } = body as {
      results: ResultInput[];
      style: string;
      theme: string;
    };

    if (!results || results.length === 0) {
      return NextResponse.json({ error: '結果データが必要です' }, { status: 400 });
    }

    const admin = getSupabaseAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'ストレージ接続に失敗しました' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const stylePrompts: Record<string, string> = {
      cute: 'kawaii, pastel colors, soft, adorable, chibi style, round shapes, gentle lighting',
      cool: 'sleek, modern, dramatic lighting, bold contrasts, stylish, sophisticated',
      pop: 'colorful, energetic, bold, fun, graphic art style, vibrant patterns',
      vibrant: 'extremely colorful, dynamic, exciting, festival-like, celebratory',
    };

    const images: Record<string, string> = {};

    // 各結果に対して画像生成（最大6枚に制限）
    const limitedResults = results.slice(0, 6);

    for (const result of limitedResults) {
      try {
        const prompt = `Create a single character illustration for a fun personality quiz result.
Theme: "${theme}" quiz result type "${result.title}".
Style: ${stylePrompts[style] || stylePrompts.pop}, illustration, digital art.
The image should be a single centered character or icon that represents "${result.title}" - ${result.description}.
IMPORTANT: Do NOT include any text, letters, or words in the image. Only visual elements.
Square format, clean white or transparent background, high quality.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents: prompt,
          config: {
            responseModalities: ['TEXT', 'IMAGE'],
            imageConfig: {
              aspectRatio: '1:1',
              imageSize: '1K',
            },
          },
        });

        const parts = response.candidates?.[0]?.content?.parts;
        const imagePart = parts?.find(
          (part: Record<string, unknown>) => part.inlineData && typeof part.inlineData === 'object'
        );

        if (imagePart?.inlineData?.data) {
          const imageBuffer = Buffer.from(imagePart.inlineData.data as string, 'base64');
          const mimeType = (imagePart.inlineData.mimeType as string) || 'image/png';
          const ext = mimeType.includes('jpeg') ? 'jpg' : 'png';
          const filePath = `${user.id}/${Date.now()}-${result.type}.${ext}`;

          const { error: uploadError } = await admin.storage
            .from('entertainment-images')
            .upload(filePath, imageBuffer, { contentType: mimeType });

          if (!uploadError) {
            const { data: urlData } = admin.storage
              .from('entertainment-images')
              .getPublicUrl(filePath);
            images[result.type] = urlData.publicUrl;
          }
        }
      } catch (imgErr) {
        console.warn(`画像生成スキップ (${result.type}):`, imgErr);
      }
    }

    // AI使用量を記録
    await logAIUsage({
      userId: user.id,
      actionType: 'entertainment_image_generate',
      service: 'quiz',
      featureType: 'quiz',
      modelUsed: 'gemini-3-pro-image-preview',
      inputTokens: 0,
      outputTokens: 0,
      metadata: { imageCount: Object.keys(images).length, style, theme },
    });

    return NextResponse.json({ images });
  } catch (error: unknown) {
    console.error('Entertainment image generation error:', error);
    const message = error instanceof Error ? error.message : '不明なエラー';
    return NextResponse.json(
      { error: '画像生成に失敗しました: ' + message },
      { status: 500 }
    );
  }
}
