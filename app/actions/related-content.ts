'use server';

import { createClient } from '@supabase/supabase-js';

function getSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl) return null;
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key) return null;
  return createClient(supabaseUrl, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export type RelatedItem = {
  slug: string;
  title: string;
  description?: string;
  imageUrl?: string;
  type: string;
  views_count?: number;
};

/**
 * 同じカテゴリの関連コンテンツを取得（現在のコンテンツを除外）
 */
export async function getRelatedContents(
  contentType: 'quiz' | 'profile' | 'business' | 'survey' | 'salesletter',
  currentSlug: string,
  limit: number = 4
): Promise<{ success: boolean; data?: RelatedItem[]; error?: string }> {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) return { success: false, error: 'Supabase not configured' };

    const items: RelatedItem[] = [];

    if (contentType === 'quiz') {
      const { data } = await supabase
        .from('quizzes')
        .select('slug, title, description, image_url, views_count')
        .eq('show_in_portal', true)
        .neq('slug', currentSlug)
        .not('slug', 'is', null)
        .order('views_count', { ascending: false })
        .limit(limit);

      if (data) {
        items.push(...data.map(q => ({
          slug: q.slug,
          title: q.title,
          description: q.description,
          imageUrl: q.image_url,
          type: 'quiz',
          views_count: q.views_count,
        })));
      }
    } else if (contentType === 'profile') {
      const { data } = await supabase
        .from('profiles')
        .select('slug, nickname, content')
        .eq('show_in_portal', true)
        .neq('slug', currentSlug)
        .not('slug', 'is', null)
        .limit(limit);

      if (data) {
        items.push(...data.map(p => {
          const headerBlock = p.content?.find((b: { type: string }) => b.type === 'header');
          return {
            slug: p.slug,
            title: headerBlock?.data?.name || p.nickname || 'プロフィール',
            description: headerBlock?.data?.title || '',
            imageUrl: headerBlock?.data?.avatar,
            type: 'profile',
          };
        }));
      }
    } else if (contentType === 'business') {
      const { data } = await supabase
        .from('business_projects')
        .select('slug, settings, content')
        .eq('show_in_portal', true)
        .neq('slug', currentSlug)
        .not('slug', 'is', null)
        .limit(limit);

      if (data) {
        items.push(...data.map(b => {
          const headerBlock = b.content?.find((block: { type: string }) => block.type === 'header');
          const heroBlock = b.content?.find((block: { type: string }) =>
            block.type === 'hero' || block.type === 'hero_fullwidth'
          );
          return {
            slug: b.slug,
            title: b.settings?.title || headerBlock?.data?.name || heroBlock?.data?.headline || 'ビジネスLP',
            description: b.settings?.description || headerBlock?.data?.title || '',
            imageUrl: headerBlock?.data?.avatar || heroBlock?.data?.backgroundImage,
            type: 'business',
          };
        }));
      }
    } else if (contentType === 'survey') {
      const { data } = await supabase
        .from('surveys')
        .select('slug, title, description')
        .eq('show_in_portal', true)
        .neq('slug', currentSlug)
        .not('slug', 'is', null)
        .limit(limit);

      if (data) {
        items.push(...data.map(s => ({
          slug: s.slug,
          title: s.title,
          description: s.description,
          type: 'survey',
        })));
      }
    } else if (contentType === 'salesletter') {
      const { data } = await supabase
        .from('sales_letters')
        .select('slug, title, settings, views_count')
        .eq('show_in_portal', true)
        .neq('slug', currentSlug)
        .not('slug', 'is', null)
        .order('views_count', { ascending: false })
        .limit(limit);

      if (data) {
        items.push(...data.map(s => ({
          slug: s.slug,
          title: s.title || 'セールスレター',
          description: s.settings?.description || '',
          type: 'salesletter',
          views_count: s.views_count,
        })));
      }
    }

    return { success: true, data: items };
  } catch (error) {
    console.error('[RelatedContent] Error:', error);
    return { success: false, error: 'Failed to fetch related content' };
  }
}
