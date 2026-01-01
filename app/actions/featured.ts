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

// ピックアップコンテンツの型定義
export type FeaturedContent = {
  id: string;
  content_id: string;
  content_type: ContentType;
  featured_at: string;
  display_order: number;
  created_at: string;
};

// コンテンツ詳細情報を含む型
export type FeaturedContentWithDetails = FeaturedContent & {
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  views_count?: number;
};

/**
 * ピックアップ済みコンテンツ一覧を取得
 */
export async function getFeaturedContents(): Promise<{ 
  success: boolean; 
  data?: FeaturedContent[]; 
  error?: string 
}> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { data, error } = await supabase
      .from('featured_contents')
      .select('*')
      .order('display_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Featured] Fetch error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('[Featured] Unexpected error:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * コンテンツをピックアップに追加
 */
export async function addFeaturedContent(
  contentId: string,
  contentType: ContentType
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    // 既に10件登録されているかチェック
    const { count } = await supabase
      .from('featured_contents')
      .select('id', { count: 'exact', head: true });

    if (count && count >= 10) {
      return { success: false, error: 'ピックアップは最大10件までです' };
    }

    // 既に登録済みかチェック
    const { data: existing } = await supabase
      .from('featured_contents')
      .select('id')
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .single();

    if (existing) {
      return { success: false, error: '既にピックアップに登録されています' };
    }

    // 追加
    const { error } = await supabase
      .from('featured_contents')
      .insert([{
        content_id: contentId,
        content_type: contentType,
        display_order: count || 0
      }]);

    if (error) {
      console.error('[Featured] Insert error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[Featured] Unexpected error:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * ピックアップから削除
 */
export async function removeFeaturedContent(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    const { error } = await supabase
      .from('featured_contents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Featured] Delete error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('[Featured] Unexpected error:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * ランダムでピックアップコンテンツを取得（詳細情報付き）
 */
export async function getRandomFeaturedContents(
  limit: number = 3
): Promise<{ 
  success: boolean; 
  data?: FeaturedContentWithDetails[]; 
  error?: string 
}> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return { success: false, error: 'Supabase not configured' };
    }

    // ピックアップ一覧を取得
    const { data: featuredList, error: featuredError } = await supabase
      .from('featured_contents')
      .select('*')
      .order('created_at', { ascending: false });

    if (featuredError) {
      console.error('[Featured] Fetch error:', featuredError);
      return { success: false, error: featuredError.message };
    }

    if (!featuredList || featuredList.length === 0) {
      return { success: true, data: [] };
    }

    // ランダムにシャッフル（Fisher-Yates）
    const shuffled = [...featuredList].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(limit, shuffled.length));

    // コンテンツ詳細を取得
    const contentsWithDetails: FeaturedContentWithDetails[] = [];

    for (const featured of selected) {
      try {
        let contentDetails: any = null;

        if (featured.content_type === 'quiz') {
          const { data } = await supabase
            .from('quizzes')
            .select('id, slug, title, description, image_url, views_count')
            .eq('id', parseInt(featured.content_id))
            .single();
          contentDetails = data;
        } else if (featured.content_type === 'profile') {
          const { data } = await supabase
            .from('profiles')
            .select('id, slug, nickname, content, views_count')
            .eq('id', featured.content_id)
            .single();
          
          if (data) {
            // ヘッダーブロックから名前を取得
            const headerBlock = data.content?.find((b: any) => b.type === 'header');
            contentDetails = {
              ...data,
              title: headerBlock?.data?.name || data.nickname || 'プロフィール',
              description: headerBlock?.data?.title || '',
              image_url: headerBlock?.data?.avatar
            };
          }
        } else if (featured.content_type === 'business') {
          const { data } = await supabase
            .from('business_projects')
            .select('id, slug, settings, content')
            .eq('id', featured.content_id)
            .single();
          
          if (data) {
            // ヘッダーブロックから情報を取得
            const headerBlock = data.content?.find((b: any) => b.type === 'header');
            const heroBlock = data.content?.find((b: any) => 
              b.type === 'hero' || b.type === 'hero_fullwidth'
            );
            
            contentDetails = {
              ...data,
              title: data.settings?.title 
                || headerBlock?.data?.name 
                || heroBlock?.data?.headline 
                || data.settings?.name
                || 'ビジネスLP',
              description: data.settings?.description 
                || headerBlock?.data?.title 
                || heroBlock?.data?.subheadline 
                || '',
              image_url: headerBlock?.data?.avatar 
                || heroBlock?.data?.backgroundImage 
                || heroBlock?.data?.imageUrl
            };
          }
        }

        if (contentDetails) {
          contentsWithDetails.push({
            ...featured,
            title: contentDetails.title || 'タイトルなし',
            slug: contentDetails.slug,
            description: contentDetails.description,
            imageUrl: contentDetails.image_url,
            views_count: contentDetails.views_count
          });
        }
      } catch (err) {
        console.error(`[Featured] Error fetching details for ${featured.content_type}:${featured.content_id}`, err);
        // エラーが出てもスキップして続行
      }
    }

    return { success: true, data: contentsWithDetails };
  } catch (error) {
    console.error('[Featured] Unexpected error:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * 特定のコンテンツがピックアップされているかチェック
 */
export async function isFeaturedContent(
  contentId: string,
  contentType: ContentType
): Promise<{ success: boolean; isFeatured: boolean; featuredId?: string }> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return { success: false, isFeatured: false };
    }

    const { data, error } = await supabase
      .from('featured_contents')
      .select('id')
      .eq('content_id', contentId)
      .eq('content_type', contentType)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('[Featured] Check error:', error);
      return { success: false, isFeatured: false };
    }

    return { 
      success: true, 
      isFeatured: !!data,
      featuredId: data?.id
    };
  } catch (error) {
    console.error('[Featured] Unexpected error:', error);
    return { success: false, isFeatured: false };
  }
}

















