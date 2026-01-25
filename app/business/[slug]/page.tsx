import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import BusinessViewer from '@/components/business/BusinessViewer';
import { generateBreadcrumbSchema } from '@/components/shared/Breadcrumb';

// 動的レンダリングを強制（常に最新のデータを取得）
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

// 静的パラメータ生成（SSG対応）
export async function generateStaticParams() {
  if (!supabase) {
    return [];
  }

  try {
    const { data: businessLPs } = await supabase
      .from('business_projects')
      .select('slug')
      .not('slug', 'is', null);

    return businessLPs?.map((lp) => ({
      slug: lp.slug,
    })) || [];
  } catch (error) {
    console.error('Failed to generate static params for business LPs:', error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

  if (!supabase) {
    return { title: 'ビジネスLP' };
  }

  const { data: lp } = await supabase
    .from('business_projects')
    .select('settings, content')
    .eq('slug', slug)
    .single();

  if (!lp) {
    return { title: 'ページが見つかりません' };
  }

  const title = lp.settings?.title || 'ビジネスLP';
  const description = lp.settings?.description || '';
  
  // heroブロックから背景画像を取得
  const heroBlock = lp.content?.find((b: { type: string }) => b.type === 'hero');
  const heroImage = heroBlock?.data?.backgroundImage || null;

  // OGP画像: hero画像があればそれを使用、なければ動的生成
  const ogImage = heroImage || 
    `${siteUrl}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&type=business`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/business/${slug}`,
    },
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function BusinessPage({ params }: Props) {
  const { slug } = await params;

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>設定エラー</p>
      </div>
    );
  }

  const { data: lp } = await supabase
    .from('business_projects')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!lp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ページが見つかりません</h1>
          <p className="text-gray-600 mb-8">URLをご確認ください</p>
          <a href="/" className="text-amber-600 font-semibold hover:underline">
            トップページへ戻る
          </a>
        </div>
      </div>
    );
  }

  // business_projectsのデータをBusinessLPの形式に変換
  // 後方互換性: themeが直接カラムにある場合とsettings内にある場合の両方をサポート
  const theme = lp.theme || lp.settings?.theme;
  
  const businessLP = {
    id: lp.id,
    slug: lp.slug,
    title: lp.settings?.title || 'ビジネスLP',
    description: lp.settings?.description || '',
    content: lp.content || [],
    settings: {
      ...lp.settings,
      theme: theme, // themeを確実に含める
    },
    user_id: lp.user_id,
    created_at: lp.created_at,
    updated_at: lp.updated_at,
  };

  // 構造化データ - WebPage + Service
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';
  const lpTitle = lp.settings?.title || 'ビジネスLP';
  const lpDescription = lp.settings?.description || '';
  
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: lpTitle,
    description: lpDescription,
    url: `${siteUrl}/business/${slug}`,
    mainEntity: {
      '@type': 'Service',
      name: lpTitle,
      description: lpDescription,
      provider: {
        '@type': 'Organization',
        name: lpTitle,
      },
    },
  };

  // パンくずリスト構造化データ
  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'ビジネスLP一覧', href: '/portal?tab=business' },
      { name: lpTitle },
    ],
    siteUrl
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BusinessViewer lp={businessLP} />
    </>
  );
}
