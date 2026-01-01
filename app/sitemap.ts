import { MetadataRoute } from 'next';

// サイトのベースURL（環境変数で設定するか、本番環境のURLを設定）
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://shukaku-maker.com';

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

  // 将来的にはSupabaseから公開コンテンツを取得してサイトマップに追加
  // const { data: quizzes } = await supabase.from('quizzes').select('slug, updated_at').eq('is_public', true);
  // const quizPages = quizzes?.map(quiz => ({
  //   url: `${BASE_URL}/quiz/${quiz.slug}`,
  //   lastModified: new Date(quiz.updated_at),
  //   changeFrequency: 'weekly' as const,
  //   priority: 0.6,
  // })) || [];

  return [...staticPages];
}
















































