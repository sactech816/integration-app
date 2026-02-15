import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import ScratchClient from './ScratchClient';
import { generateBreadcrumbSchema } from '@/components/shared/Breadcrumb';
import { generateUGCMetadata } from '@/lib/seo/generateUGCMetadata';
import { generateUGCSchema } from '@/lib/seo/generateUGCSchema';

export const revalidate = 300;

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

interface Props {
  params: Promise<{ campaign_id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { campaign_id } = await params;
  const supabase = getSupabase();
  if (!supabase) return { title: 'スクラッチ' };

  const { data } = await supabase
    .from('gamification_campaigns')
    .select('title, description')
    .eq('id', campaign_id)
    .single();

  if (!data) return { title: 'スクラッチが見つかりません' };

  return generateUGCMetadata({
    title: data.title,
    description: data.description || `${data.title} - デジタルスクラッチ`,
    type: 'scratch',
    slug: campaign_id,
  });
}

export default async function ScratchPage({ params }: Props) {
  const { campaign_id } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';
  const supabase = getSupabase();

  let title = 'スクラッチ';
  let description = '';

  if (supabase) {
    const { data } = await supabase
      .from('gamification_campaigns')
      .select('title, description')
      .eq('id', campaign_id)
      .single();
    if (data) {
      title = data.title;
      description = data.description || '';
    }
  }

  const schema = generateUGCSchema({
    schemaType: 'WebApplication',
    name: title,
    description: description || `${title} - デジタルスクラッチ`,
    url: `${siteUrl}/scratch/${campaign_id}`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema(
    [
      { name: 'ゲーミフィケーション', href: '/gamification' },
      { name: 'スクラッチ', href: '/scratch' },
      { name: title },
    ],
    siteUrl
  );

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ScratchClient />
    </>
  );
}
