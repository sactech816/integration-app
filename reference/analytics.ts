'use server';

import { supabase } from '@/lib/supabase';

export async function saveAnalytics(
  profileId: string, 
  eventType: 'view' | 'click' | 'scroll' | 'time' | 'read', 
  eventData?: { 
    url?: string; 
    scrollDepth?: number; 
    timeSpent?: number; 
    readPercentage?: number;
  },
  contentType?: 'profile' | 'business'
) {
  if (!supabase) {
    console.error('[Analytics] Supabase not available for analytics');
    console.error('[Analytics] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
    console.error('[Analytics] NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
    return { error: 'Database not available' };
  }

  // UUIDの形式チェック
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(profileId)) {
    console.error('[Analytics] Invalid UUID format:', profileId);
    return { error: 'Invalid profile ID format' };
  }

  try {
    console.log('[Analytics] Saving:', { profileId, eventType, eventData });
    
    const insertData = {
      profile_id: profileId,
      event_type: eventType,
      event_data: eventData || {},
      content_type: contentType || 'profile', // デフォルトはプロフィールLP
      created_at: new Date().toISOString()
    };
    
    console.log('[Analytics] Insert data:', insertData);
    
    const { data, error } = await supabase
      .from('analytics')
      .insert([insertData])
      .select();

    if (error) {
      console.error('[Analytics] Save error:', error);
      console.error('[Analytics] Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { error: error.message };
    }

    console.log('[Analytics] Saved successfully:', data);
    return { success: true, data };
  } catch (error: any) {
    console.error('[Analytics] Exception:', error);
    console.error('[Analytics] Exception stack:', error.stack);
    return { error: error.message };
  }
}

export async function getAnalytics(profileId: string) {
  if (!supabase) {
    console.error('[Analytics] Supabase not available for analytics');
    return { views: 0, clicks: 0, avgScrollDepth: 0, avgTimeSpent: 0, readRate: 0, clickRate: 0 };
  }

  try {
    console.log('[Analytics] Fetching for profile:', profileId);
    
    // プロフィールLPのアナリティクスのみを取得
    const { data: allEvents, error } = await supabase
      .from('analytics')
      .select('*')
      .eq('profile_id', profileId)
      .eq('content_type', 'profile'); // プロフィールLPのデータのみ取得

    if (error) {
      console.error('[Analytics] Fetch error:', error);
      console.error('[Analytics] Fetch error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { views: 0, clicks: 0, avgScrollDepth: 0, avgTimeSpent: 0, readRate: 0, clickRate: 0 };
    }

    console.log('[Analytics] Fetched events:', allEvents?.length || 0);
    if (allEvents && allEvents.length > 0) {
      console.log('[Analytics] Sample event:', allEvents[0]);
    }

    const views = allEvents?.filter(e => e.event_type === 'view') || [];
    const clicks = allEvents?.filter(e => e.event_type === 'click') || [];
    const scrolls = allEvents?.filter(e => e.event_type === 'scroll') || [];
    const times = allEvents?.filter(e => e.event_type === 'time') || [];
    const reads = allEvents?.filter(e => e.event_type === 'read') || [];

    console.log('[Analytics] Event counts:', {
      views: views.length,
      clicks: clicks.length,
      scrolls: scrolls.length,
      times: times.length,
      reads: reads.length
    });

    // 平均スクロール深度を計算
    const scrollDepths = scrolls
      .map(e => e.event_data?.scrollDepth || 0)
      .filter(d => d > 0);
    const avgScrollDepth = scrollDepths.length > 0
      ? Math.round(scrollDepths.reduce((a, b) => a + b, 0) / scrollDepths.length)
      : 0;

    // 平均滞在時間を計算（秒）
    const timeSpents = times
      .map(e => e.event_data?.timeSpent || 0)
      .filter(t => t > 0);
    const avgTimeSpent = timeSpents.length > 0
      ? Math.round(timeSpents.reduce((a, b) => a + b, 0) / timeSpents.length)
      : 0;

    // 精読率を計算（readPercentage > 50%のビュー数 / 総ビュー数）
    const readPercentages = reads
      .map(e => e.event_data?.readPercentage || 0)
      .filter(r => r > 0);
    const readCount = readPercentages.filter(r => r >= 50).length;
    const readRate = views.length > 0 ? Math.round((readCount / views.length) * 100) : 0;

    // クリック率を計算（クリック数 / ビュー数）
    const clickRate = views.length > 0 ? Math.round((clicks.length / views.length) * 100) : 0;

    const result = {
      views: views.length,
      clicks: clicks.length,
      avgScrollDepth,
      avgTimeSpent,
      readRate,
      clickRate
    };

    console.log('[Analytics] Calculated result:', result);
    return result;
  } catch (error: any) {
    console.error('[Analytics] Fetch exception:', error);
    console.error('[Analytics] Exception stack:', error.stack);
    return { views: 0, clicks: 0, avgScrollDepth: 0, avgTimeSpent: 0, readRate: 0, clickRate: 0 };
  }
}

