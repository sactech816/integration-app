import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { supabase } from '@/lib/supabase';
import { generateUGCMetadata } from '@/lib/seo/generateUGCMetadata';

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

/**
 * ファネルのエントリーページ — 最初のステップにリダイレクト
 */
export default async function FunnelEntryPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/funnel/${slug}/0`);
}
