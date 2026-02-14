import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import BusinessViewer from '@/components/business/BusinessViewer';
import { generateBreadcrumbSchema } from '@/components/shared/Breadcrumb';
import { shouldHideFooter } from '@/lib/utils/checkCreatorPlanPermission';
import { generateUGCMetadata } from '@/lib/seo/generateUGCMetadata';
import { generateUGCSchema } from '@/lib/seo/generateUGCSchema';

// ISR: 5分キャッシュ + On-Demand Revalidation
export const revalidate = 300;

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
  const heroBlock = lp.content?.find((b: { type: string }) => b.type === 'hero');
  const heroImage = heroBlock?.data?.backgroundImage || null;

  return generateUGCMetadata({
    title,
    description,
    type: 'business',
    slug,
    imageUrl: heroImage,
  });
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

  // 作成者のプラン権限をチェックしてフッター非表示を決定
  const canHideFooter = await shouldHideFooter(lp.settings?.hideFooter, lp.user_id);

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
      hideFooter: canHideFooter, // プラン権限チェック済みの値
    },
    user_id: lp.user_id,
    created_at: lp.created_at,
    updated_at: lp.updated_at,
  };

  // 構造化データ - WebPage + Service
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';
  const lpTitle = lp.settings?.title || 'ビジネスLP';
  const lpDescription = lp.settings?.description || '';
  
  const webPageSchema = generateUGCSchema({
    schemaType: 'WebPage',
    name: lpTitle,
    description: lpDescription,
    url: `${siteUrl}/business/${slug}`,
    datePublished: lp.created_at,
    dateModified: lp.updated_at,
    additionalProps: {
      mainEntity: {
        '@type': 'Service',
        name: lpTitle,
        description: lpDescription,
        provider: {
          '@type': 'Organization',
          name: lpTitle,
        },
      },
    },
  });

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
