/**
 * Big Five AIチャットアシスタント
 * GET  /api/bigfive/chat?resultId=xxx — チャット履歴取得
 * POST /api/bigfive/chat — メッセージ送信
 * Body: { resultId, message }
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { createAIProvider } from '@/lib/ai-provider';
import { logAIUsage } from '@/lib/ai-usage';
import { buildChatSystemPrompt } from '@/lib/bigfive/report-prompt';
import { FACET_LABELS } from '@/lib/bigfive/calculate';
import type { BigFiveResult, FacetScore, MBTIType } from '@/lib/bigfive/calculate';
import type { AIMessage } from '@/lib/ai-provider';

const MAX_HISTORY = 20;

// DBの行からBigFiveResultを復元（generate-reportと同じロジック）
function reconstructResult(row: any): BigFiveResult {
  const traitKeys = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const;

  const traits = {} as BigFiveResult['traits'];
  for (const key of traitKeys) {
    const percentage = row[key] as number;
    const level = percentage <= 20 ? 'very_low' : percentage <= 40 ? 'low' : percentage <= 60 ? 'medium' : percentage <= 80 ? 'high' : 'very_high';

    const facets: FacetScore[] = [];
    if (row.facet_scores?.[key]) {
      for (const [facetKey, facetPct] of Object.entries(row.facet_scores[key])) {
        facets.push({
          name: facetKey,
          label: FACET_LABELS[key]?.[facetKey] || facetKey,
          score: 0, maxScore: 0,
          percentage: facetPct as number,
        });
      }
    }

    traits[key] = { score: 0, maxScore: 0, percentage, level, facets };
  }

  const mbtiDimensions = row.mbti_dimensions || {};
  const mbtiType: MBTIType = {
    code: row.mbti_code || 'XXXX',
    name: mbtiDimensions.name || '',
    description: mbtiDimensions.description || '',
    dimensions: {
      EI: mbtiDimensions.EI || { label: '', value: 'I', score: 0 },
      SN: mbtiDimensions.SN || { label: '', value: 'N', score: 0 },
      TF: mbtiDimensions.TF || { label: '', value: 'F', score: 0 },
      JP: mbtiDimensions.JP || { label: '', value: 'J', score: 0 },
    },
  };

  return { traits, mbtiType, testType: row.test_type || 'full' };
}

// GET — チャット履歴取得
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const resultId = request.nextUrl.searchParams.get('resultId');
    if (!resultId) {
      return NextResponse.json({ error: '診断結果IDが必要です' }, { status: 400 });
    }

    const { data: messages } = await supabase
      .from('bigfive_chat_messages')
      .select('id, role, content, created_at')
      .eq('result_id', resultId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    return NextResponse.json({ messages: messages || [] });
  } catch (err: any) {
    console.error('BigFive chat history error:', err);
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

    const { resultId, message } = await request.json();
    if (!resultId || !message?.trim()) {
      return NextResponse.json({ error: '診断結果IDとメッセージが必要です' }, { status: 400 });
    }

    // 結果取得 + 購入チェック
    const { data: row } = await supabase
      .from('bigfive_results')
      .select('*')
      .eq('id', resultId)
      .eq('user_id', user.id)
      .single();

    if (!row) {
      return NextResponse.json({ error: '診断結果が見つかりません' }, { status: 404 });
    }

    if (!row.pdf_purchased) {
      return NextResponse.json({ error: 'プレミアムレポートの購入が必要です' }, { status: 403 });
    }

    // 直近のチャット履歴取得
    const { data: history } = await supabase
      .from('bigfive_chat_messages')
      .select('role, content')
      .eq('result_id', resultId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(MAX_HISTORY);

    const previousMessages = (history || []).reverse();

    // BigFiveResult復元
    const result = reconstructResult(row);
    const systemPrompt = buildChatSystemPrompt(result);

    // メッセージ構築
    const messages: AIMessage[] = [
      { role: 'system', content: systemPrompt },
      ...previousMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message.trim() },
    ];

    // AI呼び出し
    const provider = createAIProvider({
      preferProvider: 'gemini',
      model: 'gemini-2.5-flash',
    });

    const aiResponse = await provider.generate({
      messages,
      temperature: 0.8,
      maxTokens: 1024,
      responseFormat: 'text',
    });

    const reply = aiResponse.content;

    // userメッセージとassistant応答を保存
    await supabase.from('bigfive_chat_messages').insert([
      {
        result_id: resultId,
        user_id: user.id,
        role: 'user',
        content: message.trim(),
      },
      {
        result_id: resultId,
        user_id: user.id,
        role: 'assistant',
        content: reply,
      },
    ]);

    // AI使用量ログ
    await logAIUsage({
      userId: user.id,
      actionType: 'bigfive_chat',
      service: 'bigfive',
      modelUsed: aiResponse.model,
      inputTokens: aiResponse.usage?.inputTokens,
      outputTokens: aiResponse.usage?.outputTokens,
    });

    return NextResponse.json({ reply });
  } catch (err: any) {
    console.error('BigFive chat error:', err);
    return NextResponse.json({ error: err.message || 'チャットに失敗しました' }, { status: 500 });
  }
}
