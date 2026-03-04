import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import WebinarViewer from '@/components/webinar/WebinarViewer';
import RelatedContent from '@/components/shared/RelatedContent';
import { generateBreadcrumbSchema } from '@/components/shared/Breadcrumb';
import { shouldHideFooter } from '@/lib/utils/checkCreatorPlanPermission';
import { generateUGCMetadata } from '@/lib/seo/generateUGCMetadata';
import { generateUGCSchema } from '@/lib/seo/generateUGCSchema';

// ISR: 5分キャッシュ + On-Demand Revalidation
export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  if (!supabase) {
    return { title: 'ウェビナーLP' };
  }

  const { data: lp } = await supabase
    .from('webinar_lps')
    .select('settings, content, title')
    .eq('slug', slug)
    .single();

  if (!lp) {
    return { title: 'ページが見つかりません' };
  }

  const heroBlock = lp.content?.find((b: { type: string }) => b.type === 'hero');
  const title = lp.settings?.title
    || lp.title
    || heroBlock?.data?.headline
    || 'ウェビナーLP';
  const description = lp.settings?.description || heroBlock?.data?.subheadline || '';
  const heroImage = heroBlock?.data?.backgroundImage || null;

  return generateUGCMetadata({
    title,
    description,
    type: 'webinar',
    slug,
    imageUrl: heroImage,
  });
}

export default async function WebinarPage({ params }: Props) {
  const { slug } = await params;

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>設定エラー</p>
      </div>
    );
  }

  const { data: lp } = await supabase
    .from('webinar_lps')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!lp) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">ページが見つかりません</h1>
          <p className="text-gray-400 mb-8">URLをご確認ください</p>
          <a href="/" className="text-violet-400 font-semibold hover:underline">
            トップページへ戻る
          </a>
        </div>
      </div>
    );
  }

  const canHideFooter = await shouldHideFooter(lp.settings?.hideFooter, lp.user_id);
  const canHideRelated = await shouldHideFooter(lp.settings?.hideRelatedContent, lp.user_id);

  const theme = lp.settings?.theme;

  const webinarLP = {
    id: lp.id,
    slug: lp.slug,
    title: lp.title || 'ウェビナーLP',
    description: lp.description || '',
    content: lp.content || [],
    settings: {
      ...lp.settings,
      theme: theme,
      hideFooter: canHideFooter,
    },
    user_id: lp.user_id,
    created_at: lp.created_at,
    updated_at: lp.updated_at,
  };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';
  const lpTitle = lp.settings?.title || lp.title || 'ウェビナーLP';
  const lpDescription = lp.settings?.description || '';

  const webPageSchema = generateUGCSchema({
    schemaType: 'WebPage',
    name: lpTitle,
    description: lpDescription,
    url: `${siteUrl}/webinar/${slug}`,
    datePublished: lp.created_at,
    dateModified: lp.updated_at,
    additionalProps: {
      mainEntity: {
        '@type': 'Event',
        name: lpTitle,
        description: lpDescription,
        eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode',
      },
    },
  });

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'ウェビナー一覧', href: '/portal?tab=webinar' },
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
      <WebinarViewer lp={webinarLP} />
      <RelatedContent contentType="webinar" currentSlug={slug} hide={canHideRelated} />
    </>
  );
}
