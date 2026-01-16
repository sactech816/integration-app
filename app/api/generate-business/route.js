import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { checkAIUsageLimitForFeature, logAIUsage } from '@/lib/ai-usage';

// Gemini または OpenAI を使用
const genAI = process.env.GOOGLE_GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

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
    const featureType = 'business';
    const usageCheck = await checkAIUsageLimitForFeature(user.id, featureType);
    
    if (!usageCheck.isWithinLimit) {
      return NextResponse.json(
        { 
          error: 'LIMIT_EXCEEDED', 
          message: `本日のビジネスLP AI生成上限に達しました（残り: ${usageCheck.featureRemaining}回）`,
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
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json({ error: 'プロンプトが必要です' }, { status: 400 });
    }

    if (!genAI && !openai) {
      return NextResponse.json({ error: 'AI APIキーが設定されていません' }, { status: 500 });
    }

    const systemPrompt = `あなたはビジネスLP作成の専門家です。
ユーザーのビジネス情報に基づいて、CV率が高いランディングページのコンテンツを作成してください。

以下の形式でJSONを返してください：
{
  "title": "LPタイトル",
  "description": "LPの説明（SEO用）",
  "content": [
    {
      "type": "hero",
      "data": {
        "headline": "メインキャッチコピー",
        "subheadline": "サブテキスト",
        "ctaText": "ボタンテキスト",
        "ctaUrl": "#contact",
        "backgroundColor": "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)"
      }
    },
    {
      "type": "features",
      "data": {
        "title": "セクションタイトル",
        "columns": 3,
        "items": [
          { "icon": "🚀", "title": "特徴1", "description": "説明" }
        ]
      }
    },
    {
      "type": "testimonial",
      "data": {
        "items": [
          { "name": "お客様名", "role": "肩書き", "comment": "コメント" }
        ]
      }
    },
    {
      "type": "pricing",
      "data": {
        "plans": [
          { "title": "プラン名", "price": "¥10,000", "features": ["機能1", "機能2"], "isRecommended": false }
        ]
      }
    },
    {
      "type": "faq",
      "data": {
        "items": [
          { "question": "質問", "answer": "回答" }
        ]
      }
    },
    {
      "type": "cta_section",
      "data": {
        "title": "CTAタイトル",
        "description": "説明文",
        "buttonText": "ボタンテキスト",
        "buttonUrl": "#contact",
        "backgroundGradient": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
      }
    }
  ]
}

ブロックは以下から適切に選んでください：
- hero: ヒーローセクション
- features: 特徴・ベネフィット（3つ程度）
- testimonial: お客様の声（2-3個）
- pricing: 料金プラン（2-3個）
- faq: よくある質問（3-5個）
- cta_section: CTAセクション

必ず hero と cta_section は含めてください。`;

    let result;

    // Gemini を優先的に使用
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const geminiResponse = await model.generateContent([
        systemPrompt,
        `以下のビジネスでLPを作成してください：\n${prompt}`
      ]);
      
      const text = geminiResponse.response.text();
      // JSONを抽出
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSONの解析に失敗しました');
      }
    } else if (openai) {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `以下のビジネスでLPを作成してください：\n${prompt}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('AI応答が空です');
      }
      result = JSON.parse(content);
    }

    // ブロックIDを追加
    if (result.content) {
      result.content = result.content.map((block, index) => ({
        ...block,
        id: `block_${Date.now()}_${index}`,
        ...(block.type === 'features' && block.data?.items ? {
          data: {
            ...block.data,
            items: block.data.items.map((item, i) => ({
              ...item,
              id: `item_${Date.now()}_${i}`,
            })),
          },
        } : {}),
        ...(block.type === 'testimonial' && block.data?.items ? {
          data: {
            ...block.data,
            items: block.data.items.map((item, i) => ({
              ...item,
              id: `item_${Date.now()}_${i}`,
            })),
          },
        } : {}),
        ...(block.type === 'pricing' && block.data?.plans ? {
          data: {
            ...block.data,
            plans: block.data.plans.map((plan, i) => ({
              ...plan,
              id: `plan_${Date.now()}_${i}`,
            })),
          },
        } : {}),
        ...(block.type === 'faq' && block.data?.items ? {
          data: {
            ...block.data,
            items: block.data.items.map((item, i) => ({
              ...item,
              id: `faq_${Date.now()}_${i}`,
            })),
          },
        } : {}),
      }));
    }

    // 4. 使用量を記録
    const modelUsed = genAI ? 'gemini-1.5-flash' : 'gpt-4o-mini';
    await logAIUsage({
      userId: user.id,
      actionType: 'business_generate',
      service: 'business',
      featureType: featureType,
      modelUsed: modelUsed,
      metadata: { prompt }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Generate business LP error:', error);
    return NextResponse.json(
      { error: 'ビジネスLPの生成に失敗しました: ' + error.message },
      { status: 500 }
    );
  }
}
