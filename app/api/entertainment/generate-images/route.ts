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
  imageHint?: string;
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

    // テーマからどんな画像を作るかを推定
    const themeLower = theme.toLowerCase();
    const isAnimalTheme = /どうぶつ|動物|animal|猫|犬|ペット/.test(themeLower);
    const isBrainTheme = /脳内|脳|brain|頭の中/.test(themeLower);
    const isBodyTheme = /腸内|腸|体内|内臓|gut|body/.test(themeLower);
    const isFoodTheme = /食べ物|料理|ラーメン|スイーツ|food|グルメ/.test(themeLower);
    const isCharacterTheme = /キャラ|推し|アニメ|character/.test(themeLower);
    const isPastLifeTheme = /前世|過去|past life/.test(themeLower);

    function buildImagePrompt(resultItem: ResultInput): string {
      const styleDesc = stylePrompts[style] || stylePrompts.pop;

      // imageHintがある場合は、それをベースにプロンプトを構築
      if (resultItem.imageHint) {
        return `Create a vivid, high-quality illustration based on this description: ${resultItem.imageHint}
This is for a fun "${theme}" personality quiz result type: "${resultItem.title}".
Style: ${styleDesc}, visually striking, social-media-worthy, eye-catching.
IMPORTANT: Do NOT include any text, letters, numbers, or words in the image. Only visual elements.
Square format, beautiful background, high quality digital art.`;
      }

      if (isAnimalTheme) {
        return `Create a beautiful, expressive illustration of an animal character that represents the personality type "${resultItem.title}".
The animal should have human-like expressions and personality. Draw the full animal in a characteristic pose.
Style: ${styleDesc}, cute animal illustration, detailed, expressive eyes.
Theme context: "${theme}" personality quiz.
IMPORTANT: Do NOT include any text, letters, numbers, or words anywhere in the image.
Square format, soft gradient background matching the animal's mood, high quality digital art.`;
      }

      if (isBrainTheme) {
        return `Create a colorful cross-section illustration of a human brain/head silhouette.
The brain should be filled with various colorful icons, symbols, and visual elements that represent "${resultItem.title}" personality.
For example: if the type is emotional, fill with hearts and music notes; if analytical, fill with gears and numbers; if creative, fill with paint splashes and stars.
Personality: "${resultItem.title}" - ${resultItem.description}
Style: ${styleDesc}, infographic style, bold flat colors, fun visual composition.
IMPORTANT: Do NOT include any text, letters, numbers, or readable words. Use only visual symbols and icons.
Square format, clean background, high quality.`;
      }

      if (isBodyTheme) {
        return `Create a colorful, fun illustration showing the inside of a human body (cross-section/cutaway style).
The body interior should be filled with cute, cartoonish elements that represent the personality type "${resultItem.title}".
For example: energetic type = filled with lightning bolts and fire; calm type = filled with flowers and clouds.
Personality: "${resultItem.title}" - ${resultItem.description}
Style: ${styleDesc}, medical-meets-kawaii illustration, educational but fun.
IMPORTANT: Do NOT include any text, letters, numbers, or words. Only visual elements.
Square format, clean background, high quality.`;
      }

      if (isFoodTheme) {
        return `Create a mouth-watering, beautiful illustration of food/dish that represents the personality type "${resultItem.title}".
The food should look delicious and have personality - matching the vibe of "${resultItem.title}".
Style: ${styleDesc}, food illustration, appetizing colors, detailed textures.
Theme: "${theme}" quiz result.
IMPORTANT: Do NOT include any text, letters, numbers, or words in the image.
Square format, clean background with subtle decoration, high quality.`;
      }

      if (isCharacterTheme) {
        return `Create a unique, appealing anime/manga style character design that represents the personality type "${resultItem.title}".
The character should have a distinct look, outfit, and pose that matches their personality.
Personality: "${resultItem.title}" - ${resultItem.description}
Style: ${styleDesc}, anime character design, full body, expressive.
IMPORTANT: Do NOT include any text, letters, numbers, or words in the image.
Square format, simple background, high quality.`;
      }

      if (isPastLifeTheme) {
        return `Create a mystical, atmospheric illustration representing a past life as "${resultItem.title}".
Show a historical/fantasy figure or scene that embodies this past life type.
Style: ${styleDesc}, mystical atmosphere, ethereal lighting, dreamy quality.
IMPORTANT: Do NOT include any text, letters, numbers, or words in the image.
Square format, atmospheric background, high quality.`;
      }

      // デフォルト: テーマに合わせた汎用イラスト
      return `Create a vivid, eye-catching illustration for a fun personality quiz result.
Theme: "${theme}" - Result type: "${resultItem.title}".
Create a visual that instantly communicates the essence of "${resultItem.title}" personality type.
Description: ${resultItem.description}
Style: ${styleDesc}, illustration, bold composition, visually striking, social-media-worthy.
IMPORTANT: Do NOT include any text, letters, numbers, or words in the image. Only visual elements.
Square format, colorful gradient background, high quality digital art.`;
    }

    const images: Record<string, string> = {};

    // 各結果に対して画像生成（最大6枚に制限）
    const limitedResults = results.slice(0, 6);

    for (const result of limitedResults) {
      try {
        const prompt = buildImagePrompt(result);

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
