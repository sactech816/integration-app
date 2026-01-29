'use server';

import { createClient } from '@supabase/supabase-js';
import { unstable_noStore as noStore, revalidatePath } from 'next/cache';
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
  // キャッシュを無効化
  noStore();
  
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

    // ポータルページのキャッシュを再検証
    revalidatePath('/portal');
    
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

    // ポータルページのキャッシュを再検証
    revalidatePath('/portal');
    
    return { success: true };
  } catch (error) {
    console.error('[Featured] Unexpected error:', error);
    return { success: false, error: 'Unexpected error' };
  }
}

/**
 * ランダムでピックアップコンテンツを取得（詳細情報付き）
 * 
 * ピックアップがlimit件以上登録されている場合は常にlimit件を返す
 * limit件未満の場合は登録件数分だけ返す
 */
export async function getRandomFeaturedContents(
  limit: number = 3
): Promise<{ 
  success: boolean; 
  data?: FeaturedContentWithDetails[]; 
  error?: string 
}> {
  // キャッシュを無効化して常に最新データを取得
  noStore();
  
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
      // フォールバック: featured_contentsが空の場合は人気のクイズを表示
      const { data: popularQuizzes, error: quizError } = await supabase
        .from('quizzes')
        .select('id, slug, title, description, image_url, views_count')
        .eq('show_in_portal', true)
        .order('views_count', { ascending: false, nullsFirst: false })
        .limit(limit);
      
      if (quizError || !popularQuizzes || popularQuizzes.length === 0) {
        return { success: true, data: [] };
      }
      
      // 人気クイズをFeaturedContentWithDetails形式に変換
      const fallbackContents: FeaturedContentWithDetails[] = popularQuizzes.map((quiz, index) => ({
        id: `fallback-${quiz.id}`,
        content_id: String(quiz.id),
        content_type: 'quiz' as ContentType,
        featured_at: new Date().toISOString(),
        display_order: index,
        created_at: new Date().toISOString(),
        title: quiz.title,
        slug: quiz.slug,
        description: quiz.description,
        imageUrl: quiz.image_url,
        views_count: quiz.views_count
      }));
      
      return { success: true, data: fallbackContents };
    }

    // ランダムにシャッフル（Fisher-Yates）
    const shuffled = [...featuredList].sort(() => Math.random() - 0.5);

    // コンテンツ詳細を取得（有効なコンテンツがlimit件になるまで処理）
    const contentsWithDetails: FeaturedContentWithDetails[] = [];

    // シャッフルされた全ピックアップを順に処理し、limit件に達するか全て処理するまで続ける
    for (const featured of shuffled) {
      // 既にlimit件取得できたら終了
      if (contentsWithDetails.length >= limit) {
        break;
      }

      try {
        let contentDetails: any = null;

        if (featured.content_type === 'quiz') {
          // content_idが数値文字列の場合のみparseInt、UUIDの場合はそのまま
          const quizId = /^\d+$/.test(featured.content_id) 
            ? parseInt(featured.content_id) 
            : featured.content_id;
          
          const { data, error } = await supabase
            .from('quizzes')
            .select('id, slug, title, description, image_url, views_count')
            .eq('id', quizId)
            .single();
          
          if (!error) {
            contentDetails = data;
          }
        } else if (featured.content_type === 'profile') {
          // profilesテーブルにはviews_countカラムがないので除外
          const { data, error } = await supabase
            .from('profiles')
            .select('id, slug, nickname, content, settings')
            .eq('id', featured.content_id)
            .single();
          
          if (!error && data) {
            // ヘッダーブロックから名前を取得
            const headerBlock = data.content?.find((b: any) => b.type === 'header');
            contentDetails = {
              ...data,
              title: headerBlock?.data?.name || data.nickname || 'プロフィール',
              description: headerBlock?.data?.title || '',
              image_url: headerBlock?.data?.avatar,
              views_count: 0
            };
          }
        } else if (featured.content_type === 'business') {
          const { data, error } = await supabase
            .from('business_projects')
            .select('id, slug, settings, content')
            .eq('id', featured.content_id)
            .single();
          
          if (!error && data) {
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
                || heroBlock?.data?.imageUrl,
              views_count: 0
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
        // エラーが出てもスキップして次のピックアップを処理
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






























































