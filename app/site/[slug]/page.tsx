import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import SiteViewer from '@/components/site/SiteViewer';
import RelatedContent from '@/components/shared/RelatedContent';
import { generateBreadcrumbSchema } from '@/components/shared/Breadcrumb';
import { shouldHideFooter } from '@/lib/utils/checkCreatorPlanPermission';
import { generateUGCMetadata } from '@/lib/seo/generateUGCMetadata';
import { generateUGCSchema } from '@/lib/seo/generateUGCSchema';
import { SitePage } from '@/lib/types';

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [];
}

async function getSiteData(slug: string) {
  if (!supabase) return null;

  const { data: site } = await supabase
    .from('sites')
    .select('*, site_pages(*)')
    .eq('slug', slug)
    .single();

  if (!site) return null;

  // ページをsort_orderでソート
  if (site.site_pages) {
    site.pages = (site.site_pages as SitePage[]).sort((a: SitePage, b: SitePage) => a.sort_order - b.sort_order);
    delete site.site_pages;
  }

  return site;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const site = await getSiteData(slug);

  if (!site) {
    return { title: 'ページが見つかりません' };
  }

  return generateUGCMetadata({
    title: site.title,
    description: site.description || '',
    type: 'site',
    slug,
    imageUrl: site.logo_url || null,
  });
}

export default async function SiteTopPage({ params }: Props) {
  const { slug } = await params;
  const site = await getSiteData(slug);

  if (!site) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">サイトが見つかりません</h1>
          <p className="text-gray-500 mb-8">URLをご確認ください</p>
          <a href="/" className="text-cyan-600 font-semibold hover:underline">
            トップページへ戻る
          </a>
        </div>
      </div>
    );
  }

  // トップページ（is_home: true）を取得
  const homePage = site.pages?.find((p: SitePage) => p.is_home) || site.pages?.[0];

  if (!homePage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">ページがありません</p>
      </div>
    );
  }

  const canHideFooter = await shouldHideFooter(site.settings?.hideFooter, site.user_id);
  const canHideRelated = await shouldHideFooter(site.settings?.hideRelatedContent, site.user_id);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

  const webPageSchema = generateUGCSchema({
    schemaType: 'WebSite',
    name: site.title,
    description: site.description || '',
    url: `${siteUrl}/site/${slug}`,
    datePublished: site.created_at,
    dateModified: site.updated_at,
  });

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'サイト一覧', href: '/portal?tab=site' },
      { name: site.title },
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
      <SiteViewer site={site} currentPage={homePage} hideFooter={canHideFooter} />
      <RelatedContent contentType="site" currentSlug={slug} hide={canHideRelated} />
    </>
  );
}
