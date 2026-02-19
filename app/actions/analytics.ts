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
export type ContentType = 'quiz' | 'profile' | 'business' | 'salesletter' | 'survey' | 'gamification' | 'attendance' | 'booking' | 'onboarding';

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
        profile_id: contentId,  // DBカラム名はprofile_id（プロフィール/ビジネス共通）
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
      .eq('profile_id', contentId)  // DBカラム名はprofile_id
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
 * 複数コンテンツのアナリティクスを一括取得
 */
export async function getMultipleAnalytics(
  contentIds: string[],
  contentType: ContentType
): Promise<Array<{
  contentId: string;
  analytics: {
    views: number;
    clicks: number;
    completions: number;
    avgScrollDepth: number;
    avgTimeSpent: number;
    readRate: number;
    clickRate: number;
  };
}>> {
  const defaultResult = {
    views: 0,
    clicks: 0,
    completions: 0,
    avgScrollDepth: 0,
    avgTimeSpent: 0,
    readRate: 0,
    clickRate: 0
  };

  if (!contentIds || contentIds.length === 0) {
    return [];
  }

  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return contentIds.map(id => ({ contentId: id, analytics: defaultResult }));
    }

    // RPC関数でDB側で集計（高速）
    console.log('[Analytics] Fetching via RPC for:', { contentIds: contentIds.length, contentType });
    
    const { data: summaryData, error } = await supabase.rpc('get_analytics_summary', {
      p_content_ids: contentIds,
      p_content_type: contentType
    });

    if (error) {
      console.error('[Analytics] RPC error:', error);
      return contentIds.map(id => ({ contentId: id, analytics: defaultResult }));
    }

    console.log('[Analytics] RPC result:', { 
      resultCount: summaryData?.length || 0
    });

    // 結果をマッピング
    const summaryMap = new Map<string, {
      views: number;
      clicks: number;
      completions: number;
      avg_scroll_depth: number;
      avg_time_spent: number;
      read_rate: number;
      click_rate: number;
    }>();
    
    if (summaryData) {
      for (const row of summaryData) {
        summaryMap.set(row.content_id, row);
      }
    }

    const results = contentIds.map(contentId => {
      const summary = summaryMap.get(contentId);
      
      if (!summary) {
        return { contentId, analytics: defaultResult };
      }

      return {
        contentId,
        analytics: {
          views: Number(summary.views) || 0,
          clicks: Number(summary.clicks) || 0,
          completions: Number(summary.completions) || 0,
          avgScrollDepth: Math.round(Number(summary.avg_scroll_depth) || 0),
          avgTimeSpent: Math.round(Number(summary.avg_time_spent) || 0),
          readRate: Math.round(Number(summary.read_rate) || 0),
          clickRate: Math.round(Number(summary.click_rate) || 0)
        }
      };
    });

    return results;
  } catch (error) {
    console.error('[Analytics] Unexpected error:', error);
    return contentIds.map(id => ({ contentId: id, analytics: defaultResult }));
  }
}

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

