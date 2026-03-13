/**
 * コンシェルジュ AIチャット
 * GET  /api/concierge/chat?sessionId=xxx — チャット履歴取得
 * POST /api/concierge/chat — メッセージ送信 + AI応答
 * Body: { message, sessionId?, currentPage? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAIProvider } from '@/lib/ai-provider';
import { logAIUsage } from '@/lib/ai-usage';
import { buildConciergeSystemPrompt } from '@/lib/concierge/system-prompt';
import { parseToolActions } from '@/lib/concierge/tool-actions';
import { getMakersSubscriptionStatus } from '@/lib/subscription';
import type { AIMessage } from '@/lib/ai-provider';
import { createClient } from '@supabase/supabase-js';

const MAX_HISTORY = 10;

// プラン別の日次メッセージ制限
const DAILY_LIMITS: Record<string, number> = {
  guest: 0,
  free: 10,
  standard: 30,
  business: 100,
  premium: 100,
};

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/** 今日のメッセージ送信数を取得 */
async function getDailyUsage(serviceClient: any, userId: string): Promise<number> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { count } = await serviceClient
    .from('concierge_messages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'user')
    .gte('created_at', todayStart.toISOString());

  return count || 0;
}

// GET — チャット履歴取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const sessionId = request.nextUrl.searchParams.get('sessionId');

    let query = supabase
      .from('concierge_messages')
      .select('id, role, content, metadata, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })
      .limit(30);

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data: messages } = await query;

    // セッションIDを取得（最新メッセージから）
    const latestSessionId = (messages?.[0] as any)?.session_id ||
      `session_${new Date().toISOString().slice(0, 10)}`;

    return NextResponse.json({
      messages: (messages || []).map(m => ({
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

// POST — メッセージ送信 + AI応答
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const { message, sessionId: requestSessionId, currentPage } = await request.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: 'メッセージが必要です' }, { status: 400 });
    }

    const serviceClient = getServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: 'サーバー設定エラー' }, { status: 500 });
    }

    // セッションID（日付ベース）
    const sessionId = requestSessionId || `session_${new Date().toISOString().slice(0, 10)}`;

    // プランチェック・レート制限・会話履歴を並列取得
    const [subscription, dailyUsage, { data: history }] = await Promise.all([
      getMakersSubscriptionStatus(user.id),
      getDailyUsage(serviceClient, user.id),
      serviceClient
        .from('concierge_messages')
        .select('role, content')
        .eq('user_id', user.id)
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false })
        .limit(MAX_HISTORY),
    ]);

    const planTier = subscription.planTier || 'free';
    const dailyLimit = DAILY_LIMITS[planTier] || DAILY_LIMITS.free;

    if (dailyUsage >= dailyLimit) {
      return NextResponse.json({
        error: `本日のメッセージ上限（${dailyLimit}回）に達しました。`,
        remainingMessages: 0,
      }, { status: 429 });
    }

    const previousMessages = (history || []).reverse();

    // システムプロンプト構築
    const systemPrompt = buildConciergeSystemPrompt({
      currentPage,
      planTier,
    });

    // メッセージ構築
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...previousMessages.map(m => ({
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

    // DB保存 + AI使用量ログを並列実行
    await Promise.all([
      serviceClient.from('concierge_messages').insert([
        {
          user_id: user.id,
          session_id: sessionId,
          role: 'user',
          content: message.trim(),
        },
        {
          user_id: user.id,
          session_id: sessionId,
          role: 'assistant',
          content: replyText,
          metadata: { actions, suggestions },
        },
      ]),
      logAIUsage({
        userId: user.id,
        actionType: 'concierge_chat',
        service: 'makers',
        modelUsed: aiResponse.model,
        inputTokens: aiResponse.usage?.inputTokens,
        outputTokens: aiResponse.usage?.outputTokens,
      }),
    ]);

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
