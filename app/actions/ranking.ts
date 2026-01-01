'use server';

import { createClient } from '@supabase/supabase-js';
import { ContentType } from './analytics';

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

// 人気コンテンツの型定義
export type PopularContent = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  imageUrl?: string;
  type: ContentType;
  views_count: number;
  clicks_count: number;
  completions_count?: number;
  popularityScore: number;
};

/**
 * 複合スコアを計算
 * score = (views × 1.0) + (clicks × 2.0) + (completions × 3.0)
 */
function calculatePopularityScore(
  views: number,
  clicks: number,
  completions: number = 0
): number {
  return (views * 1.0) + (clicks * 2.0) + (completions * 3.0);
}

/**
 * 人気コンテンツを取得（複合スコア順）
 */
export async function getPopularContents(
  contentType: ContentType,
  limit: number = 3,
  days: number = 30
): Promise<{ 
  success: boolean; 
  data?: PopularContent[]; 
  error?: string 
}> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const popularContents: PopularContent[] = [];

    if (contentType === 'quiz') {
      // クイズの場合：quizzesテーブルから直接取得（カウンターカラムを使用）
      const { data: quizzes, error } = await supabase
        .from('quizzes')
        .select('id, slug, title, description, image_url, views_count, clicks_count, completions_count')
        .order('views_count', { ascending: false })
        .limit(limit * 3); // 多めに取得してスコア計算後に絞り込む

      if (error) {
        console.error('[Ranking] Quiz fetch error:', error);
        return { success: false, error: error.message };
      }

      if (quizzes && quizzes.length > 0) {
        // 複合スコアを計算してソート
        const scored = quizzes.map(q => ({
          id: String(q.id),
          slug: q.slug,
          title: q.title,
          description: q.description,
          imageUrl: q.image_url,
          type: 'quiz' as ContentType,
          views_count: q.views_count || 0,
          clicks_count: q.clicks_count || 0,
          completions_count: q.completions_count || 0,
          popularityScore: calculatePopularityScore(
            q.views_count || 0,
            q.clicks_count || 0,
            q.completions_count || 0
          )
        })).sort((a, b) => b.popularityScore - a.popularityScore);

        popularContents.push(...scored.slice(0, limit));
      }
    } else if (contentType === 'profile') {
      // プロフィールLPの場合：analyticsテーブルから集計
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // 全プロフィールを取得
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, slug, nickname, content')
        .eq('featured_on_top', true);

      if (profileError) {
        console.error('[Ranking] Profile fetch error:', profileError);
        return { success: false, error: profileError.message };
      }

      if (profiles && profiles.length > 0) {
        const profileIds = profiles.map(p => p.id);

        // analyticsから集計
        const { data: analytics, error: analyticsError } = await supabase
          .from('analytics')
          .select('profile_id, event_type')
          .in('profile_id', profileIds)
          .eq('content_type', 'profile')
          .gte('created_at', cutoffDate.toISOString());

        if (analyticsError) {
          console.error('[Ranking] Analytics fetch error:', analyticsError);
        }

        // プロフィールごとに集計
        const profileStats: Record<string, { views: number; clicks: number }> = {};
        
        if (analytics) {
          analytics.forEach(a => {
            if (!profileStats[a.profile_id]) {
              profileStats[a.profile_id] = { views: 0, clicks: 0 };
            }
            if (a.event_type === 'view') {
              profileStats[a.profile_id].views++;
            } else if (a.event_type === 'click') {
              profileStats[a.profile_id].clicks++;
            }
          });
        }

        // スコアを計算してソート
        const scored = profiles.map(p => {
          const stats = profileStats[p.id] || { views: 0, clicks: 0 };
          const headerBlock = p.content?.find((b: any) => b.type === 'header');
          
          return {
            id: p.id,
            slug: p.slug,
            title: headerBlock?.data?.name || p.nickname || 'プロフィール',
            description: headerBlock?.data?.title || '',
            imageUrl: headerBlock?.data?.avatar,
            type: 'profile' as ContentType,
            views_count: stats.views,
            clicks_count: stats.clicks,
            popularityScore: calculatePopularityScore(stats.views, stats.clicks, 0)
          };
        }).filter(p => p.popularityScore > 0) // スコアが0より大きいもののみ
          .sort((a, b) => b.popularityScore - a.popularityScore);

        popularContents.push(...scored.slice(0, limit));
      }
    } else if (contentType === 'business') {
      // ビジネスLPの場合：analyticsテーブルから集計
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      // 全ビジネスLPを取得
      const { data: businesses, error: businessError } = await supabase
        .from('business_projects')
        .select('id, slug, settings, content');

      if (businessError) {
        console.error('[Ranking] Business fetch error:', businessError);
        return { success: false, error: businessError.message };
      }

      if (businesses && businesses.length > 0) {
        const businessSlugs = businesses.map(b => b.slug);

        // analyticsから集計（slugで保存されている）
        const { data: analytics, error: analyticsError } = await supabase
          .from('analytics')
          .select('profile_id, event_type')
          .in('profile_id', businessSlugs)
          .eq('content_type', 'business')
          .gte('created_at', cutoffDate.toISOString());

        if (analyticsError) {
          console.error('[Ranking] Analytics fetch error:', analyticsError);
        }

        // ビジネスLPごとに集計
        const businessStats: Record<string, { views: number; clicks: number }> = {};
        
        if (analytics) {
          analytics.forEach(a => {
            if (!businessStats[a.profile_id]) {
              businessStats[a.profile_id] = { views: 0, clicks: 0 };
            }
            if (a.event_type === 'view') {
              businessStats[a.profile_id].views++;
            } else if (a.event_type === 'click') {
              businessStats[a.profile_id].clicks++;
            }
          });
        }

        // スコアを計算してソート
        const scored = businesses.map(b => {
          const stats = businessStats[b.slug] || { views: 0, clicks: 0 };
          const headerBlock = b.content?.find((block: any) => block.type === 'header');
          const heroBlock = b.content?.find((block: any) => 
            block.type === 'hero' || block.type === 'hero_fullwidth'
          );
          
          return {
            id: b.id,
            slug: b.slug,
            title: b.settings?.title 
              || headerBlock?.data?.name 
              || heroBlock?.data?.headline 
              || b.settings?.name
              || 'ビジネスLP',
            description: b.settings?.description 
              || headerBlock?.data?.title 
              || heroBlock?.data?.subheadline 
              || '',
            imageUrl: headerBlock?.data?.avatar 
              || heroBlock?.data?.backgroundImage 
              || heroBlock?.data?.imageUrl,
            type: 'business' as ContentType,
            views_count: stats.views,
            clicks_count: stats.clicks,
            popularityScore: calculatePopularityScore(stats.views, stats.clicks, 0)
          };
        }).filter(b => b.popularityScore > 0) // スコアが0より大きいもののみ
          .sort((a, b) => b.popularityScore - a.popularityScore);

        popularContents.push(...scored.slice(0, limit));
      }
    }

    return { success: true, data: popularContents };
  } catch (error) {
    console.error('[Ranking] Unexpected error:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * 全サービスの人気コンテンツを一括取得
 */
export async function getAllPopularContents(
  limit: number = 3,
  days: number = 30
): Promise<{ 
  success: boolean; 
  data?: {
    quiz: PopularContent[];
    profile: PopularContent[];
    business: PopularContent[];
  }; 
  error?: string 
}> {
  try {
    const [quizResult, profileResult, businessResult] = await Promise.all([
      getPopularContents('quiz', limit, days),
      getPopularContents('profile', limit, days),
      getPopularContents('business', limit, days)
    ]);

    return {
      success: true,
      data: {
        quiz: quizResult.data || [],
        profile: profileResult.data || [],
        business: businessResult.data || []
      }
    };
  } catch (error) {
    console.error('[Ranking] Unexpected error:', error);
    return { success: false, error: 'Unexpected error' };
  }
}























