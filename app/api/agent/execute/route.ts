/**
 * 集客エージェント プラン実行API
 * POST /api/agent/execute
 *
 * プランカードのステップを順番に実行し、
 * 各ツールのコンテンツをAI生成→DB保存する。
 *
 * Body: {
 *   plan: { name: string, steps: { toolId: string, description: string }[] },
 *   context?: { business: string, target?: string, strength?: string, goal?: string, name?: string },
 *   conversationHistory?: { role: string, content: string }[]
 * }
 *
 * Response (streaming NDJSON):
 *   { type: 'progress', stepIndex: number, toolId: string, status: 'generating' | 'saving' | 'done' | 'error', message: string }
 *   { type: 'result', stepIndex: number, toolId: string, contentId: string, url: string, title: string }
 *   { type: 'complete', results: [...] }
 *   { type: 'error', message: string }
 */

import { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAIProvider } from '@/lib/ai-provider';
import { logAIUsage } from '@/lib/ai-usage';
import { getMakersSubscriptionStatus } from '@/lib/subscription';
import { createClient } from '@supabase/supabase-js';
import type { AIMessage } from '@/lib/ai-provider';

/** プラン別のエージェント実行月間制限 */
const AGENT_MONTHLY_LIMITS: Record<string, number> = {
  guest: 0,
  free: 1,      // 初回1回無料体験
  standard: 5,
  business: 20,
  premium: 100,
};

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function generateSlug(prefix: string = ''): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = prefix ? `${prefix}-` : '';
  for (let i = 0; i < 8; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return slug;
}

interface AgentContext {
  business: string;
  target?: string;
  strength?: string;
  goal?: string;
  name?: string;
}

/**
 * 会話履歴からビジネスコンテキストをAIで抽出する
 * Haikuを使ってコスト最小限
 */
async function extractContextFromConversation(
  conversationHistory: { role: string; content: string }[],
): Promise<AgentContext> {
  const provider = createAIProvider({
    preferProvider: 'anthropic',
    model: 'claude-haiku-4-5-20251001',
  });

  const conversationText = conversationHistory
    .map(m => `${m.role === 'user' ? 'ユーザー' : 'AI'}: ${m.content}`)
    .join('\n');

  const messages: AIMessage[] = [
    {
      role: 'system',
      content: `会話履歴からビジネス情報を抽出し、以下のJSON形式で返してください。余分なテキストは含めないでください。
推測で補完してOKですが、会話に明示された情報を優先してください。

{
  "business": "業種・サービス内容（必須）",
  "name": "ビジネス名・屋号（わかれば）",
  "target": "ターゲット顧客（わかれば）",
  "strength": "強み・特徴（わかれば）",
  "goal": "集客の目的（わかれば）"
}`,
    },
    { role: 'user', content: conversationText },
  ];

  try {
    const response = await provider.generate({
      messages,
      temperature: 0.3,
      maxTokens: 512,
      responseFormat: 'text',
    });

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] || '{}');
    return {
      business: parsed.business || '未設定',
      name: parsed.name || undefined,
      target: parsed.target || undefined,
      strength: parsed.strength || undefined,
      goal: parsed.goal || undefined,
    };
  } catch {
    return { business: '未設定' };
  }
}

interface StepResult {
  stepIndex: number;
  toolId: string;
  contentId: string;
  url: string;
  title: string;
}

/** プロフィールLP生成・保存 */
async function executeProfile(
  serviceClient: any,
  userId: string,
  ctx: AgentContext,
  provider: any,
): Promise<{ contentId: string; url: string; title: string }> {
  const businessName = ctx.name || ctx.business;
  const prompt = `以下の情報をもとに、プロフィールLPの各セクション内容をJSON形式で生成してください。

ビジネス: ${ctx.business}
名前/屋号: ${businessName}
ターゲット: ${ctx.target || '一般'}
強み: ${ctx.strength || '未設定'}
目的: ${ctx.goal || '集客'}

以下のJSON形式で返してください。余分なテキストは含めないでください:
{
  "title": "キャッチコピー（20文字以内）",
  "subtitle": "サブタイトル（40文字以内）",
  "description": "自己紹介文（200文字程度）",
  "services": ["提供サービス1", "提供サービス2", "提供サービス3"],
  "strengths": ["強み1", "強み2", "強み3"]
}`;

  const messages: AIMessage[] = [
    { role: 'system', content: 'あなたはプロフィールLP作成の専門家です。日本語で回答してください。JSONのみ返してください。' },
    { role: 'user', content: prompt },
  ];

  const response = await provider.generate({
    messages,
    temperature: 0.7,
    maxTokens: 1024,
    responseFormat: 'text',
  });

  let profileData: any;
  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    profileData = JSON.parse(jsonMatch?.[0] || '{}');
  } catch {
    profileData = { title: businessName, subtitle: ctx.business, description: '', services: [], strengths: [] };
  }

  // Block形式でコンテンツを構成
  const blocks = [
    {
      id: `block_${Date.now()}_1`,
      type: 'header',
      data: {
        title: profileData.title || businessName,
        subtitle: profileData.subtitle || ctx.business,
      },
    },
    {
      id: `block_${Date.now()}_2`,
      type: 'text_card',
      data: {
        title: '自己紹介',
        text: profileData.description || '',
      },
    },
    {
      id: `block_${Date.now()}_3`,
      type: 'text_card',
      data: {
        title: '提供サービス',
        text: (profileData.services || []).map((s: string) => `・${s}`).join('\n'),
      },
    },
  ];

  const slug = generateSlug('p');
  const { data, error } = await serviceClient
    .from('profiles')
    .insert({
      user_id: userId,
      content: blocks,
      settings: {
        title: profileData.title || businessName,
        theme: 'gradient-blue',
      },
      slug,
    })
    .select('id')
    .single();

  if (error) throw new Error(`プロフィール保存エラー: ${error.message}`);

  return {
    contentId: data.id,
    url: `/profile/${slug}`,
    title: profileData.title || businessName,
  };
}

/** 診断クイズ生成・保存 */
async function executeQuiz(
  serviceClient: any,
  userId: string,
  ctx: AgentContext,
  provider: any,
  description: string,
): Promise<{ contentId: string; url: string; title: string }> {
  // 既存の generate-quiz API と同じプロンプト構造
  const prompt = `以下のテーマで診断クイズを作成してください。

テーマ: ${description}
ビジネス: ${ctx.business}
ターゲット: ${ctx.target || '一般'}

以下のJSON形式で返してください。余分なテキストは含めないでください:
{
  "title": "診断タイトル",
  "description": "診断の説明文（50文字程度）",
  "questions": [
    {
      "text": "質問文",
      "options": [
        { "label": "選択肢1", "score": { "A": 3, "B": 1, "C": 0 } },
        { "label": "選択肢2", "score": { "A": 1, "B": 3, "C": 0 } },
        { "label": "選択肢3", "score": { "A": 0, "B": 1, "C": 3 } }
      ]
    }
  ],
  "results": [
    {
      "type": "A",
      "title": "結果タイプA",
      "description": "結果の説明（100文字程度）"
    },
    {
      "type": "B",
      "title": "結果タイプB",
      "description": "結果の説明（100文字程度）"
    },
    {
      "type": "C",
      "title": "結果タイプC",
      "description": "結果の説明（100文字程度）"
    }
  ]
}

質問は5問、結果は3タイプで作成してください。`;

  const messages: AIMessage[] = [
    { role: 'system', content: 'あなたは診断クイズ作成の専門家です。日本語で回答してください。JSONのみ返してください。' },
    { role: 'user', content: prompt },
  ];

  const response = await provider.generate({
    messages,
    temperature: 0.7,
    maxTokens: 2048,
    responseFormat: 'text',
  });

  let quizData: any;
  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    quizData = JSON.parse(jsonMatch?.[0] || '{}');
  } catch {
    throw new Error('診断クイズの生成に失敗しました');
  }

  const slug = generateSlug('q');
  const { data, error } = await serviceClient
    .from('quizzes')
    .insert({
      user_id: userId,
      title: quizData.title || description,
      description: quizData.description || '',
      questions: quizData.questions || [],
      results: quizData.results || [],
      slug,
      mode: 'diagnosis',
      layout: 'card',
      color: '#3B82F6',
      theme: 'default',
      category: ctx.business,
      collect_email: false,
      show_in_portal: false,
    })
    .select('id')
    .single();

  if (error) throw new Error(`診断クイズ保存エラー: ${error.message}`);

  return {
    contentId: data.id,
    url: `/quiz/${slug}`,
    title: quizData.title || description,
  };
}

/** ステップメール シーケンス作成 */
async function executeStepEmail(
  serviceClient: any,
  userId: string,
  ctx: AgentContext,
  provider: any,
  description: string,
): Promise<{ contentId: string; url: string; title: string }> {
  // まずメーリングリストがあるか確認、なければ作成
  let listId: string;
  const { data: existingList } = await serviceClient
    .from('newsletter_lists')
    .select('id')
    .eq('user_id', userId)
    .limit(1)
    .single();

  if (existingList) {
    listId = existingList.id;
  } else {
    const { data: newList, error: listError } = await serviceClient
      .from('newsletter_lists')
      .insert({
        user_id: userId,
        name: `${ctx.name || ctx.business} メーリングリスト`,
        description: `${ctx.business}のメール配信リスト`,
      })
      .select('id')
      .single();
    if (listError) throw new Error(`メーリングリスト作成エラー: ${listError.message}`);
    listId = newList.id;
  }

  // シーケンス作成
  const sequenceName = `${ctx.name || ctx.business} ステップメール`;
  const { data: sequence, error: seqError } = await serviceClient
    .from('step_email_sequences')
    .insert({
      user_id: userId,
      list_id: listId,
      name: sequenceName,
      description,
      status: 'draft',
    })
    .select('id')
    .single();

  if (seqError) throw new Error(`シーケンス作成エラー: ${seqError.message}`);

  // AIでステップメール内容を生成
  const emailPrompt = `以下のビジネス向けに3通のステップメールを作成してください。

ビジネス: ${ctx.business}
ターゲット: ${ctx.target || '一般'}
目的: ${ctx.goal || '集客'}
メール全体のテーマ: ${description}

以下のJSON形式で返してください:
{
  "emails": [
    {
      "subject": "件名",
      "body": "本文（HTMLタグ使用可、200文字程度）",
      "delayDays": 0
    },
    {
      "subject": "件名",
      "body": "本文",
      "delayDays": 2
    },
    {
      "subject": "件名",
      "body": "本文",
      "delayDays": 5
    }
  ]
}`;

  const messages: AIMessage[] = [
    { role: 'system', content: 'あなたはメールマーケティングの専門家です。日本語で回答してください。JSONのみ返してください。' },
    { role: 'user', content: emailPrompt },
  ];

  const response = await provider.generate({
    messages,
    temperature: 0.7,
    maxTokens: 2048,
    responseFormat: 'text',
  });

  let emailData: any;
  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    emailData = JSON.parse(jsonMatch?.[0] || '{}');
  } catch {
    emailData = { emails: [] };
  }

  // 各ステップを保存
  const emails = emailData.emails || [];
  for (let i = 0; i < emails.length; i++) {
    await serviceClient
      .from('step_email_steps')
      .insert({
        sequence_id: sequence.id,
        step_order: i + 1,
        delay_days: emails[i].delayDays ?? i * 2,
        subject: emails[i].subject || `ステップ${i + 1}`,
        html_content: emails[i].body || '',
        text_content: (emails[i].body || '').replace(/<[^>]*>/g, ''),
      });
  }

  return {
    contentId: sequence.id,
    url: `/dashboard?view=step-email`,
    title: sequenceName,
  };
}

/** ビジネスLP生成・保存 */
async function executeBusinessLP(
  serviceClient: any,
  userId: string,
  ctx: AgentContext,
  provider: any,
  description: string,
): Promise<{ contentId: string; url: string; title: string }> {
  const prompt = `以下の情報をもとに、ビジネスLPの各セクション内容をJSON形式で生成してください。

ビジネス: ${ctx.business}
名前/屋号: ${ctx.name || ctx.business}
ターゲット: ${ctx.target || '一般'}
強み: ${ctx.strength || '未設定'}
目的: ${ctx.goal || '集客'}
追加情報: ${description}

以下のJSON形式で返してください:
{
  "title": "LPのメインキャッチコピー",
  "subtitle": "サブキャッチ",
  "problem": "ターゲットの悩み（100文字程度）",
  "solution": "解決策の説明（100文字程度）",
  "features": ["特徴1", "特徴2", "特徴3"],
  "cta": "CTA文言（15文字以内）"
}`;

  const messages: AIMessage[] = [
    { role: 'system', content: 'あなたはランディングページ作成の専門家です。日本語で回答してください。JSONのみ返してください。' },
    { role: 'user', content: prompt },
  ];

  const response = await provider.generate({
    messages,
    temperature: 0.7,
    maxTokens: 1024,
    responseFormat: 'text',
  });

  let lpData: any;
  try {
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    lpData = JSON.parse(jsonMatch?.[0] || '{}');
  } catch {
    lpData = { title: ctx.business, subtitle: '', features: [] };
  }

  const blocks = [
    {
      id: `block_${Date.now()}_1`,
      type: 'hero',
      data: {
        title: lpData.title || ctx.business,
        subtitle: lpData.subtitle || '',
        ctaText: lpData.cta || '詳しくはこちら',
      },
    },
    {
      id: `block_${Date.now()}_2`,
      type: 'text_card',
      data: {
        title: 'こんなお悩みありませんか？',
        text: lpData.problem || '',
      },
    },
    {
      id: `block_${Date.now()}_3`,
      type: 'text_card',
      data: {
        title: '解決策',
        text: lpData.solution || '',
      },
    },
    {
      id: `block_${Date.now()}_4`,
      type: 'text_card',
      data: {
        title: '特徴',
        text: (lpData.features || []).map((f: string) => `・${f}`).join('\n'),
      },
    },
  ];

  const slug = generateSlug('b');
  const { data, error } = await serviceClient
    .from('business_projects')
    .insert({
      user_id: userId,
      content: blocks,
      settings: {
        title: lpData.title || ctx.business,
        description: lpData.subtitle || '',
      },
      slug,
    })
    .select('id')
    .single();

  if (error) throw new Error(`ビジネスLP保存エラー: ${error.message}`);

  return {
    contentId: data.id,
    url: `/business/${slug}`,
    title: lpData.title || ctx.business,
  };
}

/** ファネル作成（作成済みコンテンツをステップとして紐付け） */
async function executeFunnel(
  serviceClient: any,
  userId: string,
  ctx: AgentContext,
  previousResults: StepResult[],
): Promise<{ contentId: string; url: string; title: string }> {
  const funnelName = `${ctx.name || ctx.business} 集客ファネル`;

  const { data: funnel, error: funnelError } = await serviceClient
    .from('funnels')
    .insert({
      user_id: userId,
      name: funnelName,
      slug: generateSlug('f'),
      description: `${ctx.business}の集客ファネル（自動生成）`,
      status: 'draft',
    })
    .select('id, slug')
    .single();

  if (funnelError) throw new Error(`ファネル作成エラー: ${funnelError.message}`);

  // 前のステップの結果をファネルステップとして追加
  if (previousResults.length > 0) {
    const steps = previousResults.map((r, idx) => ({
      funnel_id: funnel.id,
      order_index: idx,
      name: r.title,
      step_type: 'page',
      content_ref: r.url,
      cta_label: idx < previousResults.length - 1 ? '次へ' : 'お申し込み',
      slug: generateSlug('s'),
      cta_enabled: true,
    }));

    await serviceClient.from('funnel_steps').insert(steps);
  }

  return {
    contentId: funnel.id,
    url: `/dashboard?view=funnel`,
    title: funnelName,
  };
}

/** 汎用ツール（未対応ツール向けのフォールバック） */
async function executeGenericRedirect(
  toolId: string,
  description: string,
): Promise<{ contentId: string; url: string; title: string }> {
  const toolUrls: Record<string, string> = {
    newsletter: '/newsletter',
    booking: '/booking',
    survey: '/survey',
    gamification: '/gamification',
    salesletter: '/salesletter',
    'sns-post': '/sns-post',
    webinar: '/webinar',
    'order-form': '/order-form',
    site: '/site',
    thumbnail: '/thumbnail',
    entertainment: '/entertainment',
  };

  return {
    contentId: '',
    url: toolUrls[toolId] || '/dashboard',
    title: `${description}（手動で作成してください）`,
  };
}

// ツール別の実行関数マッピング
type ToolExecutor = (
  serviceClient: any,
  userId: string,
  ctx: AgentContext,
  provider: any,
  description: string,
  previousResults: StepResult[],
) => Promise<{ contentId: string; url: string; title: string }>;

const TOOL_EXECUTORS: Record<string, ToolExecutor> = {
  profile: async (sc, uid, ctx, prov) => executeProfile(sc, uid, ctx, prov),
  business: async (sc, uid, ctx, prov, desc) => executeBusinessLP(sc, uid, ctx, prov, desc),
  quiz: async (sc, uid, ctx, prov, desc) => executeQuiz(sc, uid, ctx, prov, desc),
  entertainment: async (sc, uid, ctx, prov, desc) => executeQuiz(sc, uid, ctx, prov, desc),
  'step-email': async (sc, uid, ctx, prov, desc) => executeStepEmail(sc, uid, ctx, prov, desc),
  funnel: async (sc, uid, ctx, _, __, prev) => executeFunnel(sc, uid, ctx, prev),
};

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ type: 'error', message: 'ログインが必要です' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();
    const { plan, context: providedContext, conversationHistory } = body;

    // プランチェック・エージェント使用回数チェック
    const subscription = await getMakersSubscriptionStatus(user.id);
    const planTier = subscription.planTier || 'free';
    const monthlyLimit = AGENT_MONTHLY_LIMITS[planTier] ?? AGENT_MONTHLY_LIMITS.free;

    // 今月のエージェント使用回数を取得
    const serviceClient0 = getServiceClient();
    if (serviceClient0) {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      const { count } = await serviceClient0
        .from('ai_usage')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .like('action_type', 'agent_%')
        .gte('created_at', monthStart.toISOString());

      const usedCount = Math.floor((count || 0) / 3); // 1実行あたり平均3ステップ = 3レコード
      if (usedCount >= monthlyLimit) {
        const tierNames: Record<string, string> = {
          free: 'フリー',
          standard: 'スタンダード',
          business: 'ビジネス',
          premium: 'プレミアム',
        };
        return new Response(JSON.stringify({
          type: 'error',
          message: `今月のAI自動生成の上限（${monthlyLimit}回）に達しました。${
            planTier === 'free' || planTier === 'standard'
              ? `上位プランにアップグレードすると、より多くの自動生成が利用できます。`
              : `上限は毎月1日にリセットされます。`
          }`,
          limitReached: true,
          currentPlan: tierNames[planTier] || planTier,
          monthlyLimit,
        }), {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    if (!plan?.steps?.length) {
      return new Response(JSON.stringify({ type: 'error', message: 'プラン情報が必要です' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // コンテキスト: 明示的に渡された場合はそれを使い、なければ会話履歴からAIで抽出
    let context: AgentContext;
    if (providedContext?.business) {
      context = providedContext;
    } else if (conversationHistory?.length) {
      context = await extractContextFromConversation(conversationHistory);
    } else {
      return new Response(JSON.stringify({ type: 'error', message: 'ビジネス情報または会話履歴が必要です' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const serviceClient = getServiceClient();
    if (!serviceClient) {
      return new Response(JSON.stringify({ type: 'error', message: 'サーバー設定エラー' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // AI プロバイダ（Sonnet を使用）
    const provider = createAIProvider({
      preferProvider: 'anthropic',
      model: 'claude-sonnet-4-20250514',
    });

    // ストリーミングレスポンス
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: any) => {
          controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
        };

        // 抽出されたコンテキストを送信（デバッグ・確認用）
        send({
          type: 'context',
          context,
        });

        const results: StepResult[] = [];

        for (let i = 0; i < plan.steps.length; i++) {
          const step = plan.steps[i];
          const { toolId, description } = step;

          try {
            // 進捗: 生成中
            send({
              type: 'progress',
              stepIndex: i,
              toolId,
              status: 'generating',
              message: `${description} を生成中...`,
            });

            let result: { contentId: string; url: string; title: string };

            const executor = TOOL_EXECUTORS[toolId];
            if (executor) {
              result = await executor(serviceClient, user.id, context, provider, description, results);
            } else {
              result = await executeGenericRedirect(toolId, description);
            }

            // 進捗: 完了
            send({
              type: 'progress',
              stepIndex: i,
              toolId,
              status: 'done',
              message: `${result.title} を作成しました`,
            });

            send({
              type: 'result',
              stepIndex: i,
              toolId,
              contentId: result.contentId,
              url: result.url,
              title: result.title,
            });

            results.push({ stepIndex: i, toolId, ...result });

            // AI使用量ログ
            await logAIUsage({
              userId: user.id,
              actionType: `agent_${toolId}`,
              service: 'makers',
              modelUsed: 'claude-sonnet-4-20250514',
              inputTokens: 0,
              outputTokens: 0,
            });
          } catch (err: any) {
            send({
              type: 'progress',
              stepIndex: i,
              toolId,
              status: 'error',
              message: err.message || `${toolId} の作成に失敗しました`,
            });
          }
        }

        // 完了
        send({ type: 'complete', results });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err: any) {
    console.error('Agent execute error:', err);
    return new Response(JSON.stringify({ type: 'error', message: err.message || 'エラーが発生しました' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
