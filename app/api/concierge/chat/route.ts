/**
 * コンシェルジュ AIチャット
 * GET  /api/concierge/chat?sessionId=xxx&visitorId=xxx — チャット履歴取得
 * POST /api/concierge/chat — メッセージ送信 + AI応答
 * Body: { message, sessionId?, visitorId?, currentPage?, timezone?, language? }
 * PATCH /api/concierge/chat — フィードバック（👍👎）
 * Body: { messageId, feedback: 1|-1 }
 *
 * ゲスト（未ログイン）: visitorId で識別、1日5回まで
 * ログインユーザー: user_id で識別、プラン別制限
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAIProvider } from '@/lib/ai-provider';
import { logAIUsage } from '@/lib/ai-usage';
import { buildConciergeSystemPrompt, buildCustomConciergePrompt } from '@/lib/concierge/system-prompt';
import { parseToolActions } from '@/lib/concierge/tool-actions';
import { getMakersSubscriptionStatus } from '@/lib/subscription';
import type { AIMessage } from '@/lib/ai-provider';
import { createClient } from '@supabase/supabase-js';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

function jsonResponse(data: any, init?: { status?: number }) {
  return NextResponse.json(data, { ...init, headers: CORS_HEADERS });
}

const MAX_HISTORY = 10;

// プラン別の日次メッセージ制限
const DAILY_LIMITS: Record<string, number> = {
  guest: 5,
  free: 10,
  standard: 30,
  business: 100,
  premium: 100,
};

// Haiku のトークン単価（USD per 1M tokens）
const HAIKU_COST = { input: 0.80, output: 4.00 };

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/** 今日のメッセージ送信数を取得（ユーザーID or ビジターID） */
async function getDailyUsage(
  serviceClient: any,
  identifier: { userId?: string; visitorId?: string }
): Promise<number> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  let query = serviceClient
    .from('concierge_messages')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'user')
    .gte('created_at', todayStart.toISOString());

  if (identifier.userId) {
    query = query.eq('user_id', identifier.userId);
  } else if (identifier.visitorId) {
    query = query.eq('visitor_id', identifier.visitorId);
  }

  const { count } = await query;
  return count || 0;
}

// GET — チャット履歴取得（ログイン・ゲスト両対応）
export async function GET(request: NextRequest) {
  try {
    const serviceClient = getServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    // ユーザー取得（失敗してもOK = ゲスト）
    let userId: string | null = null;
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
    } catch { /* ゲスト */ }

    const { searchParams } = request.nextUrl;
    const sessionId = searchParams.get('sessionId');
    const visitorId = searchParams.get('visitorId');

    if (!userId && !visitorId) {
      return NextResponse.json({ messages: [], sessionId: `session_${new Date().toISOString().slice(0, 10)}` });
    }

    let query = serviceClient
      .from('concierge_messages')
      .select('id, role, content, metadata, created_at, feedback')
      .order('created_at', { ascending: true })
      .limit(30);

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('visitor_id', visitorId);
    }

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data: messages } = await query;

    const latestSessionId = (messages?.[0] as any)?.session_id ||
      `session_${new Date().toISOString().slice(0, 10)}`;

    return NextResponse.json({
      messages: (messages || []).map((m: any) => ({
        ...m,
        actions: m.metadata?.actions || [],
        suggestions: m.metadata?.suggestions || [],
      })),
      sessionId: sessionId || latestSessionId,
    });
  } catch (err: any) {
    console.error('Concierge chat history error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST — メッセージ送信 + AI応答（ログイン・ゲスト両対応）
export async function POST(request: NextRequest) {
  try {
    // ユーザー取得（失敗してもOK = ゲスト）
    let userId: string | null = null;
    let userEmail: string | null = null;
    try {
      const supabase = await createServerSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id || null;
      userEmail = user?.email || null;
    } catch { /* ゲスト */ }

    const {
      message,
      sessionId: requestSessionId,
      visitorId,
      currentPage,
      timezone,
      language,
      configId,
    } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json({ error: 'メッセージが必要です' }, { status: 400 });
    }

    // ゲストの場合 visitorId 必須
    if (!userId && !visitorId) {
      return NextResponse.json({ error: 'visitorId が必要です' }, { status: 400 });
    }

    const serviceClient = getServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    // セッションID（日付ベース）
    const sessionId = requestSessionId || `session_${new Date().toISOString().slice(0, 10)}`;

    // プランチェック・レート制限・会話履歴を並列取得
    const identifier = userId ? { userId } : { visitorId };

    // カスタムコンシェルジュの場合、作成者のプランで制限を判定
    let subscriptionPromise: Promise<any>;
    let ownerPlanTier: string | null = null;

    if (configId) {
      // configの作成者(user_id)を取得し、そのプランで制限
      subscriptionPromise = Promise.resolve(
        serviceClient
          .from('concierge_configs')
          .select('user_id')
          .eq('id', configId)
          .single()
      ).then(async ({ data: configOwner }: any) => {
          if (configOwner?.user_id) {
            const ownerSub = await getMakersSubscriptionStatus(configOwner.user_id);
            ownerPlanTier = (ownerSub as any).planTier || 'free';
            return ownerSub;
          }
          return { planTier: 'guest' };
        });
    } else if (userId) {
      subscriptionPromise = getMakersSubscriptionStatus(userId);
    } else {
      subscriptionPromise = Promise.resolve({ planTier: 'guest' });
    }

    let historyQuery = serviceClient
      .from('concierge_messages')
      .select('role, content')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(MAX_HISTORY);

    if (userId) {
      historyQuery = historyQuery.eq('user_id', userId);
    } else {
      historyQuery = historyQuery.eq('visitor_id', visitorId);
    }

    const [subscription, dailyUsage, { data: history }] = await Promise.all([
      subscriptionPromise,
      getDailyUsage(serviceClient, identifier),
      historyQuery,
    ]);

    // カスタムコンシェルジュ: 作成者プランで制限、通常: 利用者プランで制限
    const planTier = ownerPlanTier || (subscription as any).planTier || 'guest';
    const userType = userId ? ((subscription as any).planTier || 'guest') : 'guest';
    const dailyLimit = DAILY_LIMITS[planTier] || DAILY_LIMITS.guest;

    if (dailyUsage >= dailyLimit) {
      const limitMsg = configId
        ? `本日のメッセージ上限（${dailyLimit}回）に達しました。また明日お越しください。`
        : userId
          ? `本日のメッセージ上限（${dailyLimit}回）に達しました。`
          : `ゲストの方は1日${dailyLimit}回までご利用いただけます。ログインするとより多くご利用いただけます！`;
      return NextResponse.json({
        error: limitMsg,
        remainingMessages: 0,
      }, { status: 429 });
    }

    const previousMessages = (history || []).reverse();

    // システムプロンプト構築（カスタムconfig or プラットフォーム内蔵）
    let systemPrompt: string;

    if (configId) {
      // カスタムコンシェルジュ: configを取得してカスタムプロンプト構築
      const { data: configData } = await serviceClient
        .from('concierge_configs')
        .select('name, personality, knowledge_text, faq_items, settings')
        .eq('id', configId)
        .eq('is_published', true)
        .single();

      if (configData) {
        systemPrompt = buildCustomConciergePrompt({
          name: configData.name,
          personality: configData.personality,
          knowledge_text: configData.knowledge_text,
          faq_items: configData.faq_items || [],
          settings: configData.settings || {},
        });
      } else {
        // configが見つからない場合はデフォルト
        systemPrompt = buildConciergeSystemPrompt({ currentPage, planTier });
      }
    } else {
      // プラットフォーム内蔵コンシェルジュ（メイカーくん）
      systemPrompt = buildConciergeSystemPrompt({ currentPage, planTier });
    }

    // メッセージ構築
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...previousMessages.map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message.trim() },
    ];

    // AI呼び出し（Claude Haiku）
    const provider = createAIProvider({
      preferProvider: 'anthropic',
      model: 'claude-haiku-4-5-20251001',
    });

    const aiResponse = await provider.generate({
      messages,
      temperature: 0.7,
      maxTokens: 512,
      responseFormat: 'text',
    });

    // ツールアクション抽出
    const { text: replyText, actions, suggestions } = parseToolActions(aiResponse.content);

    const inputTokens = aiResponse.usage?.inputTokens || 0;
    const outputTokens = aiResponse.usage?.outputTokens || 0;

    // コンテキスト情報
    const contextData = {
      page: currentPage || null,
      timezone: timezone || null,
      language: language || null,
    };

    // DB保存（共通フィールド）
    const commonFields = {
      user_id: userId || null,
      visitor_id: visitorId || null,
      session_id: sessionId,
      user_type: userType,
      context: contextData,
      config_id: configId || null,
    };

    // DB保存
    const { error: insertError } = await serviceClient.from('concierge_messages').insert([
      {
        ...commonFields,
        role: 'user',
        content: message.trim(),
      },
      {
        ...commonFields,
        role: 'assistant',
        content: replyText,
        metadata: { actions, suggestions },
        input_tokens: inputTokens,
        output_tokens: outputTokens,
      },
    ]);

    if (insertError) {
      console.error('Concierge message save error:', insertError);
    }

    // ログインユーザーのみAI使用量ログ
    if (userId) {
      await logAIUsage({
        userId,
        actionType: 'concierge_chat',
        service: 'makers',
        modelUsed: aiResponse.model,
        inputTokens,
        outputTokens,
      });
    }

    return NextResponse.json({
      reply: replyText,
      actions,
      suggestions,
      remainingMessages: dailyLimit - dailyUsage - 1,
      sessionId,
    });
  } catch (err: any) {
    console.error('Concierge chat error:', err);
    return NextResponse.json(
      { error: err.message || 'チャットに失敗しました' },
      { status: 500 }
    );
  }
}

// PATCH — フィードバック（👍👎）
export async function PATCH(request: NextRequest) {
  try {
    const { messageId, feedback } = await request.json();

    if (!messageId || ![1, -1].includes(feedback)) {
      return NextResponse.json({ error: 'messageId と feedback (1 or -1) が必要です' }, { status: 400 });
    }

    const serviceClient = getServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    const { error } = await serviceClient
      .from('concierge_messages')
      .update({ feedback })
      .eq('id', messageId)
      .eq('role', 'assistant');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
