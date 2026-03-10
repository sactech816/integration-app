import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import SiteViewer from '@/components/site/SiteViewer';
import RelatedContent from '@/components/shared/RelatedContent';
import { shouldHideFooter } from '@/lib/utils/checkCreatorPlanPermission';
import { generateUGCMetadata } from '@/lib/seo/generateUGCMetadata';
import { SitePage } from '@/lib/types';

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string; page: string }>;
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

  if (site.site_pages) {
    site.pages = (site.site_pages as SitePage[]).sort((a: SitePage, b: SitePage) => a.sort_order - b.sort_order);
    delete site.site_pages;
  }

  return site;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, page: pageSlug } = await params;
  const site = await getSiteData(slug);

  if (!site) {
    return { title: 'ページが見つかりません' };
  }

  const targetPage = site.pages?.find((p: SitePage) => p.slug === pageSlug);
  const pageTitle = targetPage?.title || 'ページ';

  return generateUGCMetadata({
    title: `${pageTitle} | ${site.title}`,
    description: targetPage?.description || site.description || '',
    type: 'site',
    slug: `${slug}/${pageSlug}`,
    imageUrl: site.logo_url || null,
  });
}

export default async function SiteSubPage({ params }: Props) {
  const { slug, page: pageSlug } = await params;
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

  const targetPage = site.pages?.find((p: SitePage) => p.slug === pageSlug);

  if (!targetPage) {
    // ページが見つからない場合はトップにリダイレクト表示
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ページが見つかりません</h1>
          <p className="text-gray-500 mb-8">URLをご確認ください</p>
          <a href={`/site/${slug}`} className="text-cyan-600 font-semibold hover:underline">
            トップページへ戻る
          </a>
        </div>
      </div>
    );
  }

  const canHideFooter = await shouldHideFooter(site.settings?.hideFooter, site.user_id);
  const canHideRelated = await shouldHideFooter(site.settings?.hideRelatedContent, site.user_id);

  return (
    <>
      <SiteViewer site={site} currentPage={targetPage} hideFooter={canHideFooter} />
      <RelatedContent contentType="site" currentSlug={slug} hide={canHideRelated} />
    </>
  );
}
