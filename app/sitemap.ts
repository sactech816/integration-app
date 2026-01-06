import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

// サイトのベースURL（環境変数で設定するか、本番環境のURLを設定）
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.makers.tokyo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/portal`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/announcements`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/howto`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/effective-use`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/selling-content`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/donation`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/legal`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    // エディターページ
    {
      url: `${BASE_URL}/quiz/editor`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/profile/editor`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/business/editor`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // デモページ
    {
      url: `${BASE_URL}/quiz/demo`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/profile/demo`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/business/demo`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
  ];

  // 動的コンテンツをSupabaseから取得
  let quizPages: MetadataRoute.Sitemap = [];
  let profilePages: MetadataRoute.Sitemap = [];
  let businessPages: MetadataRoute.Sitemap = [];

  if (supabase) {
    try {
      // 公開されている診断クイズを取得
      const { data: quizzes } = await supabase
        .from('quizzes')
        .select('slug, updated_at')
        .eq('show_in_portal', true)
        .not('slug', 'is', null);

      quizPages = quizzes?.map(quiz => ({
        url: `${BASE_URL}/quiz/${quiz.slug}`,
        lastModified: new Date(quiz.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })) || [];

      // 公開されているプロフィールLPを取得
      const { data: profiles } = await supabase
        .from('profiles')
        .select('slug, updated_at')
        .eq('show_in_portal', true)
        .not('slug', 'is', null);

      profilePages = profiles?.map(profile => ({
        url: `${BASE_URL}/profile/${profile.slug}`,
        lastModified: new Date(profile.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })) || [];

      // 公開されているビジネスLPを取得
      const { data: businessLPs } = await supabase
        .from('business_projects')
        .select('slug, updated_at')
        .eq('show_in_portal', true)
        .not('slug', 'is', null);

      businessPages = businessLPs?.map(lp => ({
        url: `${BASE_URL}/business/${lp.slug}`,
        lastModified: new Date(lp.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })) || [];
    } catch (error) {
      console.error('Sitemap: Failed to fetch dynamic content', error);
    }
  }

  return [...staticPages, ...quizPages, ...profilePages, ...businessPages];
}
















































