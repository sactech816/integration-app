import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logAIUsage } from '@/lib/ai-usage';
import { getKindleCoverTemplateById } from '@/constants/templates/kindle-cover';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

// プラン別の表紙生成上限（書籍上限と同じ）
const COVER_LIMITS: Record<string, number> = {
  none: 1,
  initial_trial: 3,
  initial_standard: 10,
  initial_business: -1,
  lite: 3,
  standard: 10,
  pro: -1,
  business: -1,
  enterprise: -1,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getCoverGenerateCount(supabase: any, userId: string): Promise<number> {
  const { count } = await supabase
    .from('ai_usage_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('service', 'kdl')
    .eq('action_type', 'generate_cover');

  return count || 0;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getUserPlanTier(supabase: any, userId: string): Promise<string> {
  // モニター権限をチェック
  const now = new Date().toISOString();
  const { data: monitorData } = await supabase
    .from('monitor_users')
    .select('monitor_plan_type')
    .eq('user_id', userId)
    .eq('service', 'kdl')
    .lte('monitor_start_at', now)
    .gt('monitor_expires_at', now)
    .order('monitor_expires_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (monitorData) return monitorData.monitor_plan_type;

  // サブスクリプションを確認
  const { data: subData } = await supabase
    .from('subscriptions')
    .select('plan_tier')
    .eq('user_id', userId)
    .eq('service', 'kdl')
    .in('status', ['active', 'trialing'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return subData?.plan_tier || 'none';
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      templateId,
      title,
      subtitle,
      authorName,
      colorThemeId,
      additionalPrompt,
      imageSize,
      userId,
      bookId,
    } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: 'タイトルは必須です' }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'データベース接続に失敗しました' }, { status: 500 });
    }

    // プラン制限チェック
    const planTier = await getUserPlanTier(supabase, userId);
    const limit = COVER_LIMITS[planTier] ?? COVER_LIMITS.none;

    if (limit !== -1) {
      const usedCount = await getCoverGenerateCount(supabase, userId);
      if (usedCount >= limit) {
        return NextResponse.json(
          {
            error: 'COVER_LIMIT_EXCEEDED',
            message: `表紙生成の上限（${limit}回）に達しました。プランをアップグレードすると上限が増えます。`,
            usedCount,
            limit,
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
    const template = templateId ? getKindleCoverTemplateById(templateId) : null;
    let prompt = template?.promptTemplate ||
      `Design a professional Kindle book cover (portrait orientation, 1600x2560 pixels ratio).
Title: "{{title}}" displayed prominently in large, bold Japanese text.
{{subtitle}}
{{author}}
Style: Clean, professional book cover design.
{{colorModifier}}
CRITICAL REQUIREMENTS:
- All Japanese text (日本語) MUST be rendered accurately, clearly, and completely readable
- The title is the MOST important visual element
- Professional quality suitable for commercial publication
- Must look compelling at small thumbnail sizes on Amazon/Kindle store
- Do NOT include any placeholder text or lorem ipsum`;

    prompt = prompt.replace(/\{\{title\}\}/g, title);
    prompt = prompt.replace(
      /\{\{subtitle\}\}/g,
      subtitle ? `Subtitle: "${subtitle}" displayed below the main title in smaller text.` : ''
    );
    prompt = prompt.replace(
      /\{\{author\}\}/g,
      authorName ? `Author name: "${authorName}" displayed at the bottom of the cover.` : ''
    );

    // カラーテーマ適用
    const colorTheme = template?.colorThemes.find(t => t.id === colorThemeId);
    prompt = prompt.replace(/\{\{colorModifier\}\}/g, colorTheme?.promptModifier || '');

    // 追加指示
    if (additionalPrompt?.trim()) {
      prompt += `\nAdditional creative direction: ${additionalPrompt.trim()}`;
    }

    // 日本語テキスト描画の強化指示
    prompt += '\n\nFINAL CRITICAL INSTRUCTION: This is a Japanese book cover. All Japanese text (日本語) must be rendered with 100% accuracy. Every character must be correct and clearly legible. The text rendering quality is the single most important aspect of this cover.';

    // Gemini 3 Pro Image で生成
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: '9:16',
          imageSize: imageSize === '4K' ? '4K' : '2K',
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
    const imageBuffer = Buffer.from(imagePart.inlineData.data as string, 'base64');
    const mimeType = (imagePart.inlineData.mimeType as string) || 'image/png';
    const ext = mimeType.includes('jpeg') ? 'jpg' : 'png';
    const filePath = `kindle-covers/${userId}/${bookId || 'general'}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('thumbnail-images')
      .upload(filePath, imageBuffer, { contentType: mimeType });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: '画像のアップロードに失敗しました: ' + uploadError.message },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from('thumbnail-images')
      .getPublicUrl(filePath);

    // bookIdがある場合、kdl_book_lpsのcover_image_urlを更新
    if (bookId) {
      await supabase
        .from('kdl_book_lps')
        .update({ cover_image_url: urlData.publicUrl })
        .eq('book_id', bookId)
        .eq('user_id', userId);
    }

    // AI使用量を記録
    logAIUsage({
      userId,
      actionType: 'generate_cover',
      service: 'kdl',
      modelUsed: 'gemini-3-pro-image-preview',
      usageType: 'standard',
      metadata: {
        templateId,
        colorThemeId,
        title,
        subtitle,
        authorName,
        bookId,
        imageSize: imageSize || '2K',
      },
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      imageUrl: urlData.publicUrl,
      prompt,
    });
  } catch (error) {
    console.error('Kindle cover generation error:', error);
    const message = error instanceof Error ? error.message : '不明なエラー';
    return NextResponse.json(
      { error: '表紙の生成に失敗しました: ' + message },
      { status: 500 }
    );
  }
}
