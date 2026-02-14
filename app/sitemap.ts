import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

// サイトのベースURL（環境変数で設定するか、本番環境のURLを設定）
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

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
      url: `${BASE_URL}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/sitemap-html`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
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
    // デモサブページ - Quiz
    { url: `${BASE_URL}/quiz/demo/teacher`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/quiz/demo/shop`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/quiz/demo/consultant`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/quiz/demo/kindle-author`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    // デモサブページ - Profile
    { url: `${BASE_URL}/profile/demo/cafe`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/profile/demo/coach`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/profile/demo/consultant`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/profile/demo/ec`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/profile/demo/full-set`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/profile/demo/shop`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    // デモサブページ - Business
    { url: `${BASE_URL}/business/demo/pasona`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/business/demo/shop`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/business/demo/cafe`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/business/demo/aidoma`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/business/demo/quest`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/business/demo/fullset`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    // デモサブページ - Survey
    { url: `${BASE_URL}/survey/demo/customer-satisfaction`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/survey/demo/employee-engagement`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/survey/demo/event-seminar`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/survey/demo/nps`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/survey/demo/product-service`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    { url: `${BASE_URL}/survey/demo/training`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.5 },
    // アンケートツール
    {
      url: `${BASE_URL}/survey`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/survey/new`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/survey/editor`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // 予約システム
    {
      url: `${BASE_URL}/booking`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/booking/new`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    // ゲーミフィケーションツール
    {
      url: `${BASE_URL}/gamification`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/fukubiki`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/gacha`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/slot`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/scratch`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/stamp-rally`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/login-bonus`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/point-quiz`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/arcade`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  // 動的コンテンツをSupabaseから取得
  let quizPages: MetadataRoute.Sitemap = [];
  let profilePages: MetadataRoute.Sitemap = [];
  let businessPages: MetadataRoute.Sitemap = [];
  let surveyPages: MetadataRoute.Sitemap = [];
  let bookingPages: MetadataRoute.Sitemap = [];
  let salesLetterPages: MetadataRoute.Sitemap = [];

  if (supabase) {
    try {
      // 公開されている診断クイズを取得
      const { data: quizzes } = await supabase
        .from('quizzes')
        .select('slug, updated_at, views_count, completions_count')
        .eq('show_in_portal', true)
        .not('slug', 'is', null);

      quizPages = quizzes?.map(quiz => {
        // 人気コンテンツは優先度を高く設定
        const isPopular = (quiz.views_count || 0) > 10 || (quiz.completions_count || 0) > 5;
        return {
          url: `${BASE_URL}/quiz/${quiz.slug}`,
          lastModified: new Date(quiz.updated_at),
          changeFrequency: 'weekly' as const,
          priority: isPopular ? 0.8 : 0.6,
        };
      }) || [];

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

      // 公開されているアンケートを取得
      const { data: surveys } = await supabase
        .from('surveys')
        .select('slug, updated_at')
        .not('slug', 'is', null);

      surveyPages = surveys?.map(survey => ({
        url: `${BASE_URL}/survey/${survey.slug}`,
        lastModified: new Date(survey.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })) || [];

      // アクティブな予約メニューを取得
      const { data: bookingMenus } = await supabase
        .from('booking_menus')
        .select('id, updated_at')
        .eq('is_active', true);

      bookingPages = bookingMenus?.map(menu => ({
        url: `${BASE_URL}/booking/${menu.id}`,
        lastModified: new Date(menu.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })) || [];

      // 公開されているセールスレターを取得
      const { data: salesLetters } = await supabase
        .from('sales_letters')
        .select('slug, updated_at')
        .not('slug', 'is', null);

      salesLetterPages = salesLetters?.map(sl => ({
        url: `${BASE_URL}/s/${sl.slug}`,
        lastModified: new Date(sl.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })) || [];
    } catch (error) {
      console.error('Sitemap: Failed to fetch dynamic content', error);
    }
  }

  return [...staticPages, ...quizPages, ...profilePages, ...businessPages, ...surveyPages, ...bookingPages, ...salesLetterPages];
}
















































