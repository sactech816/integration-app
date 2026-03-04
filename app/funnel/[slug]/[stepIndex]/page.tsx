import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { generateUGCMetadata } from '@/lib/seo/generateUGCMetadata';
import { generateUGCSchema } from '@/lib/seo/generateUGCSchema';
import { generateBreadcrumbSchema } from '@/components/shared/Breadcrumb';
import FunnelStepViewer from '@/components/funnel/FunnelStepViewer';

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string; stepIndex: string }>;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, stepIndex } = await params;

  if (!supabase) {
    return { title: 'ファネル' };
  }

  const { data: funnel } = await supabase
    .from('funnels')
    .select('name, description')
    .eq('slug', slug)
    .single();

  if (!funnel) {
    return { title: 'ファネルが見つかりません' };
  }

  return generateUGCMetadata({
    title: funnel.name,
    description: funnel.description || '',
    type: 'funnel',
    slug,
  });
}

export default async function FunnelStepPage({ params }: Props) {
  const { slug, stepIndex } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

  // 構造化データ用にファネル情報を取得
  let schemaScripts = null;
  if (supabase) {
    const { data: funnel } = await supabase
      .from('funnels')
      .select('name, description, created_at, updated_at')
      .eq('slug', slug)
      .single();

    if (funnel) {
      const pageSchema = generateUGCSchema({
        schemaType: 'WebPage',
        name: funnel.name,
        description: funnel.description || `${funnel.name}の集客ファネル`,
        url: `${siteUrl}/funnel/${slug}`,
        datePublished: funnel.created_at,
        dateModified: funnel.updated_at,
      });

      const breadcrumbSchema = generateBreadcrumbSchema([
        { name: 'ファネルメーカー', href: '/funnel' },
        { name: funnel.name },
      ], siteUrl);

      schemaScripts = (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
          />
        </>
      );
    }
  }

  return (
    <>
      {schemaScripts}
      <FunnelStepViewer slug={slug} stepIndex={stepIndex} />
    </>
  );
}
