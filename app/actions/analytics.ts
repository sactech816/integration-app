'use server';

import { createClient } from '@supabase/supabase-js';

// サーバーサイド用Supabaseクライアント
function getSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) return null;
  
  // Service Role Keyがあればそれを使用（RLSバイパス）、なければAnon Key
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key) return null;
  
  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// コンテンツタイプの型定義
export type ContentType = 'quiz' | 'profile' | 'business';

// イベントタイプの型定義
export type EventType = 'view' | 'click' | 'scroll' | 'time' | 'read' | 'completion';

// イベントデータの型定義
export type EventData = {
  url?: string;
  scrollDepth?: number;
  timeSpent?: number;
  readPercentage?: number;
  resultType?: string;
};

/**
 * アナリティクスイベントを保存
 */
export async function saveAnalytics(
  contentId: string,
  contentType: ContentType,
  eventType: EventType,
  eventData?: EventData
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      console.warn('[Analytics] Supabase not configured');
      return { success: false, error: 'Supabase not configured' };
    }

    // デモページは記録しない
    if (contentId === 'demo' || !contentId) {
      return { success: true };
    }

    const { error } = await supabase
      .from('analytics')
      .insert([{
        content_id: contentId,
        content_type: contentType,
        event_type: eventType,
        event_data: eventData || {},
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('[Analytics] Insert error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[Analytics] Unexpected error:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * アナリティクスデータを取得・集計
 */
export async function getAnalytics(
  contentId: string,
  contentType: ContentType
): Promise<{
  views: number;
  clicks: number;
  completions: number;
  avgScrollDepth: number;
  avgTimeSpent: number;
  readRate: number;
  clickRate: number;
}> {
  const defaultResult = {
    views: 0,
    clicks: 0,
    completions: 0,
    avgScrollDepth: 0,
    avgTimeSpent: 0,
    readRate: 0,
    clickRate: 0
  };

  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return defaultResult;
    }

    const { data: allEvents, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('content_id', contentId)
      .eq('content_type', contentType);

    if (error) {
      console.error('[Analytics] Fetch error:', error);
      return defaultResult;
    }

    if (!allEvents || allEvents.length === 0) {
      return defaultResult;
    }

    // イベントタイプ別に分類
    const views = allEvents.filter(e => e.event_type === 'view');
    const clicks = allEvents.filter(e => e.event_type === 'click');
    const completions = allEvents.filter(e => e.event_type === 'completion');
    const scrolls = allEvents.filter(e => e.event_type === 'scroll');
    const times = allEvents.filter(e => e.event_type === 'time');
    const reads = allEvents.filter(e => e.event_type === 'read');

    // 平均スクロール深度
    const scrollDepths = scrolls
      .map(e => e.event_data?.scrollDepth || 0)
      .filter(d => d > 0);
    const avgScrollDepth = scrollDepths.length > 0
      ? Math.round(scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length)
      : 0;

    // 平均滞在時間（秒）
    const timeSpents = times
      .map(e => e.event_data?.timeSpent || 0)
      .filter(t => t > 0);
    const avgTimeSpent = timeSpents.length > 0
      ? Math.round(timeSpents.reduce((a, b) => a + b, 0) / timeSpents.length)
      : 0;

    // 精読率（50%以上スクロールした割合）
    const readPercentages = reads
      .map(e => e.event_data?.readPercentage || 0)
      .filter(r => r > 0);
    const readCount = readPercentages.filter(r => r >= 50).length;
    const readRate = views.length > 0 
      ? Math.round((readCount / views.length) * 100) 
      : 0;

    // クリック率
    const clickRate = views.length > 0 
      ? Math.round((clicks.length / views.length) * 100) 
      : 0;

    return {
      views: views.length,
      clicks: clicks.length,
      completions: completions.length,
      avgScrollDepth,
      avgTimeSpent,
      readRate,
      clickRate
    };
  } catch (error) {
    console.error('[Analytics] Unexpected error:', error);
    return defaultResult;
  }
}

/**
 * クイズ用：閲覧数・完了数を増加（RPC関数がある場合）
 */
/**
 * ビジネスLP用のアナリティクスを保存（エイリアス関数）
 */
export async function saveBusinessAnalytics(
  slug: string,
  eventType: EventType,
  eventData?: EventData
): Promise<{ success: boolean; error?: string }> {
  return saveAnalytics(slug, 'business', eventType, eventData);
}

export async function incrementQuizCounter(
  quizId: number,
  counterType: 'views' | 'completions' | 'clicks' | 'likes'
): Promise<{ success: boolean }> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return { success: false };
    }

    const rpcName = `increment_${counterType === 'views' ? 'views' : counterType === 'completions' ? 'completions' : counterType === 'clicks' ? 'clicks' : 'likes'}`;
    
    const { error } = await supabase.rpc(rpcName, { row_id: quizId });
    
    if (error) {
      // RPC関数がない場合は直接更新
      const columnName = `${counterType}_count`;
      const { data: current } = await supabase
        .from('quizzes')
        .select(columnName)
        .eq('id', quizId)
        .single();
      
      if (current) {
        const currentValue = (current as unknown as Record<string, number>)[columnName] || 0;
        await supabase
          .from('quizzes')
          .update({ [columnName]: currentValue + 1 })
          .eq('id', quizId);
      }
    }

    return { success: true };
  } catch (error) {
    console.error('[Analytics] Counter increment error:', error);
    return { success: false };
  }
}

