import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import OpenAI from 'openai';
import { checkAIUsageLimitForFeature, logAIUsage } from '@/lib/ai-usage';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    // 1. 認証チェック
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => 
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (!user || authError) {
      return NextResponse.json(
        { error: 'LOGIN_REQUIRED', message: 'AI機能を利用するにはログインが必要です' },
        { status: 401 }
      );
    }

    // 2. AI使用量チェック（機能タイプごと）
    const featureType = 'profile';
    const usageCheck = await checkAIUsageLimitForFeature(user.id, featureType);
    
    if (!usageCheck.isWithinLimit) {
      return NextResponse.json(
        { 
          error: 'LIMIT_EXCEEDED', 
          message: `本日のプロフィールAI生成上限に達しました（残り: ${usageCheck.featureRemaining}回）`,
          usage: {
            featureUsage: usageCheck.featureUsage,
            featureLimit: usageCheck.featureLimit,
            featureRemaining: usageCheck.featureRemaining,
            totalUsage: usageCheck.dailyUsage,
            totalLimit: usageCheck.dailyLimit,
          }
        },
        { status: 429 }
      );
    }

    // 3. リクエストボディの取得
    const { theme, prompt, name, profession } = await request.json();

    if (!theme && !prompt && !name) {
      return NextResponse.json({ error: 'テーマまたはプロンプトが必要です' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: 'OpenAI APIキーが設定されていません' }, { status: 500 });
    }

    const systemPrompt = `あなたはプロフィールLP作成の専門家です。
ユーザーの情報に基づいて、魅力的なプロフィールページのコンテンツを作成してください。

以下の形式でJSONを返してください：
{
  "blocks": [
    {
      "type": "header",
      "data": {
        "avatar": "",
        "name": "名前",
        "title": "肩書き・キャッチコピー",
        "category": "other"
      }
    },
    {
      "type": "text_card",
      "data": {
        "title": "自己紹介",
        "text": "自己紹介文（200-300文字程度、共感を呼ぶ内容）",
        "align": "center"
      }
    },
    {
      "type": "text_card",
      "data": {
        "title": "提供サービス",
        "text": "提供しているサービスや価値の説明",
        "align": "center"
      }
    },
    {
      "type": "links",
      "data": {
        "links": [
          { "label": "Instagram", "url": "", "style": "" },
          { "label": "X (Twitter)", "url": "", "style": "" }
        ]
      }
    },
    {
      "type": "line_card",
      "data": {
        "title": "公式LINE登録で特典GET!",
        "description": "無料相談や限定情報をお届けします",
        "url": "",
        "buttonText": "LINEで登録する"
      }
    }
  ],
  "theme": {
    "gradient": "linear-gradient(-45deg, #6366f1, #8b5cf6, #a78bfa, #8b5cf6)"
  }
}

使用可能なブロックタイプ：
- header: ヘッダー（プロフィール画像、名前、肩書き）
- text_card: テキストカード（タイトル、本文、配置）
- image: 画像（url, caption）
- youtube: YouTube動画（url）
- links: リンク集（複数のリンク）
- kindle: 書籍紹介（asin, imageUrl, title, description）
- line_card: LINE登録カード（title, description, url, buttonText）
- faq: よくある質問（items配列）
- pricing: 料金表（plans配列）
- testimonial: お客様の声（items配列）
- lead_form: リードフォーム（title, buttonText）
- google_map: 地図（embedUrl, address, title）

グラデーションの選択肢:
- パープル: linear-gradient(-45deg, #6366f1, #8b5cf6, #a78bfa, #8b5cf6)
- グリーン: linear-gradient(-45deg, #10b981, #34d399, #6ee7b7, #34d399)
- オレンジ: linear-gradient(-45deg, #f59e0b, #fbbf24, #fcd34d, #fbbf24)
- ブルー: linear-gradient(-45deg, #3b82f6, #60a5fa, #93c5fd, #60a5fa)
- ピンク: linear-gradient(-45deg, #ec4899, #f472b6, #f9a8d4, #f472b6)
- ダーク: linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)
- サンセット: linear-gradient(-45deg, #f472b6, #ec4899, #fbbf24, #f59e0b)
- オーシャン: linear-gradient(-45deg, #06b6d4, #0891b2, #3b82f6, #1d4ed8)

ユーザーの職業やテーマに合ったグラデーションを選んでください。
必ず5〜8個のブロックを含めて、魅力的で完成度の高いプロフィールを作成してください。`;

    const userPrompt = theme || prompt || `名前: ${name}\n職業: ${profession || '未設定'}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `以下のテーマでプロフィールLPを作成してください：\n${userPrompt}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI応答が空です');
    }

    const profile = JSON.parse(content);

    // blocksが存在しない場合はcontentから変換（後方互換性）
    if (!profile.blocks && profile.content) {
      profile.blocks = profile.content;
    }

    // ブロックIDを追加
    if (profile.blocks) {
      profile.blocks = profile.blocks.map((block, index) => ({
        ...block,
        id: `block_${Date.now()}_${index}`,
      }));
    }

    // 4. 使用量を記録
    await logAIUsage({
      userId: user.id,
      actionType: 'profile_generate',
      service: 'profile',
      featureType: featureType,
      modelUsed: 'gpt-4o-mini',
      metadata: { theme, prompt, name, profession }
    });

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error('Generate profile error:', error);
    return NextResponse.json(
      { error: 'プロフィールの生成に失敗しました: ' + error.message },
      { status: 500 }
    );
  }
}
