import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import FunnelStepStandalone from '@/components/funnel/FunnelStepStandalone';

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getServiceClient();
  if (!supabase) return { title: 'ファネル' };

  const { data: step } = await supabase
    .from('funnel_steps')
    .select('name, funnels!inner(name, description)')
    .eq('slug', slug)
    .single();

  if (!step) return { title: 'ページが見つかりません' };

  const funnel = (step as any).funnels;
  return {
    title: `${step.name} | ${funnel.name}`,
    description: funnel.description || '',
  };
}

export default async function FunnelStepStandalonePage({ params }: Props) {
  const { slug } = await params;
  return <FunnelStepStandalone stepSlug={slug} />;
}
