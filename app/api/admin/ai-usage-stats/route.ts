/**
 * 管理者向けAI使用統計API
 * サービス別の使用量とコストを取得
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminEmails } from '@/lib/constants';

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
};

/**
 * GET: AI使用統計取得（管理者のみ）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || getDefaultStartDate();
    const endDate = searchParams.get('endDate') || new Date().toISOString().split('T')[0];

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // RPC関数を使用してサービス別統計を取得
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      'get_ai_usage_stats_by_service',
      {
        p_start_date: startDate,
        p_end_date: endDate,
      }
    );

    // RPC関数が存在しない場合は直接クエリ
    if (rpcError && rpcError.code === '42883') {
      console.warn('get_ai_usage_stats_by_service function not found, using direct query');
      
      const { data, error } = await supabase
        .from('ai_usage_logs')
        .select('service, user_id, input_tokens, output_tokens, estimated_cost_jpy, model_used')
        .gte('created_at', startDate)
        .lt('created_at', addOneDay(endDate));

      if (error) {
        console.error('Failed to fetch AI usage stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
      }

      // 手動でサービス別に集計
      const stats = aggregateByService(data || []);
      // モデル別の統計も追加
      const modelStats = aggregateByModel(data || []);
      // プロバイダー別の統計を追加
      const providerStats = aggregateByProvider(data || []);
      return NextResponse.json({ stats, modelStats, providerStats });
    }

    if (rpcError) {
      console.error('Failed to fetch AI usage stats:', rpcError);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    // RPC成功時もモデル別・プロバイダー別統計を追加取得
    const { data: modelData } = await supabase
      .from('ai_usage_logs')
      .select('model_used, input_tokens, output_tokens, estimated_cost_jpy')
      .gte('created_at', startDate)
      .lt('created_at', addOneDay(endDate));

    const modelStats = aggregateByModel(modelData || []);
    const providerStats = aggregateByProvider(modelData || []);

    return NextResponse.json({ stats: rpcData || [], modelStats, providerStats });
  } catch (error: any) {
    console.error('GET AI usage stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// デフォルトの開始日（30日前）
function getDefaultStartDate(): string {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split('T')[0];
}

// 日付に1日追加
function addOneDay(dateStr: string): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
}

// モデル名からプロバイダーを判定
function getProviderFromModel(model: string): string {
  if (!model) return 'Other';
  
  // OpenAI系モデル
  if (model.startsWith('gpt-') || model.startsWith('o1') || model.startsWith('o3')) {
    return 'OpenAI';
  }
  // Gemini系モデル
  if (model.startsWith('gemini-')) {
    return 'Gemini';
  }
  // Claude系モデル
  if (model.startsWith('claude-')) {
    return 'Claude';
  }
  return 'Other';
}

// プロバイダー別に集計（モデル別詳細を含む）
function aggregateByProvider(data: any[]): any[] {
  const providerMap: Record<string, {
    provider: string;
    total_requests: number;
    total_input_tokens: number;
    total_output_tokens: number;
    total_cost_jpy: number;
    models: Record<string, {
      model: string;
      total_requests: number;
      total_input_tokens: number;
      total_output_tokens: number;
      total_cost_jpy: number;
    }>;
  }> = {};

  for (const row of data) {
    const model = row.model_used || 'unknown';
    const provider = getProviderFromModel(model);

    // プロバイダーが存在しない場合は初期化
    if (!providerMap[provider]) {
      providerMap[provider] = {
        provider,
        total_requests: 0,
        total_input_tokens: 0,
        total_output_tokens: 0,
        total_cost_jpy: 0,
        models: {},
      };
    }

    const providerStat = providerMap[provider];
    providerStat.total_requests++;
    providerStat.total_input_tokens += row.input_tokens || 0;
    providerStat.total_output_tokens += row.output_tokens || 0;
    providerStat.total_cost_jpy += parseFloat(row.estimated_cost_jpy) || 0;

    // モデル別の詳細も記録
    if (!providerStat.models[model]) {
      providerStat.models[model] = {
        model,
        total_requests: 0,
        total_input_tokens: 0,
        total_output_tokens: 0,
        total_cost_jpy: 0,
      };
    }

    const modelStat = providerStat.models[model];
    modelStat.total_requests++;
    modelStat.total_input_tokens += row.input_tokens || 0;
    modelStat.total_output_tokens += row.output_tokens || 0;
    modelStat.total_cost_jpy += parseFloat(row.estimated_cost_jpy) || 0;
  }

  // プロバイダー順序を定義（OpenAI, Gemini, Claude, Other）
  const providerOrder = ['OpenAI', 'Gemini', 'Claude', 'Other'];
  
  return providerOrder
    .filter(p => providerMap[p])
    .map(p => ({
      ...providerMap[p],
      // modelsを配列に変換してリクエスト数でソート
      models: Object.values(providerMap[p].models).sort(
        (a, b) => b.total_requests - a.total_requests
      ),
    }));
}

// モデル別に集計
function aggregateByModel(data: any[]): any[] {
  const modelMap: Record<string, {
    model: string;
    total_requests: number;
    total_input_tokens: number;
    total_output_tokens: number;
    total_cost_jpy: number;
  }> = {};

  for (const row of data) {
    const model = row.model_used || 'unknown';

    if (!modelMap[model]) {
      modelMap[model] = {
        model,
        total_requests: 0,
        total_input_tokens: 0,
        total_output_tokens: 0,
        total_cost_jpy: 0,
      };
    }

    const stat = modelMap[model];
    stat.total_requests++;
    stat.total_input_tokens += row.input_tokens || 0;
    stat.total_output_tokens += row.output_tokens || 0;
    stat.total_cost_jpy += parseFloat(row.estimated_cost_jpy) || 0;
  }

  return Object.values(modelMap).sort((a, b) => b.total_requests - a.total_requests);
}

// サービス別に集計
function aggregateByService(data: any[]): any[] {
  const serviceMap: Record<string, {
    service: string;
    total_requests: number;
    users: Set<string>;
    total_input_tokens: number;
    total_output_tokens: number;
    total_cost_jpy: number;
  }> = {};

  for (const row of data) {
    // サービス名を正規化（quiz, profile, business → makers）
    const normalizedService = ['quiz', 'profile', 'business'].includes(row.service)
      ? 'makers'
      : row.service;

    if (!serviceMap[normalizedService]) {
      serviceMap[normalizedService] = {
        service: normalizedService,
        total_requests: 0,
        users: new Set(),
        total_input_tokens: 0,
        total_output_tokens: 0,
        total_cost_jpy: 0,
      };
    }

    const stat = serviceMap[normalizedService];
    stat.total_requests++;
    if (row.user_id) stat.users.add(row.user_id);
    stat.total_input_tokens += row.input_tokens || 0;
    stat.total_output_tokens += row.output_tokens || 0;
    stat.total_cost_jpy += parseFloat(row.estimated_cost_jpy) || 0;
  }

  return Object.values(serviceMap).map((stat) => ({
    service: stat.service,
    total_requests: stat.total_requests,
    total_users: stat.users.size,
    total_input_tokens: stat.total_input_tokens,
    total_output_tokens: stat.total_output_tokens,
    total_cost_jpy: stat.total_cost_jpy,
    avg_requests_per_user: stat.users.size > 0
      ? stat.total_requests / stat.users.size
      : 0,
  }));
}
