import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import SubscribeForm from '@/components/newsletter/SubscribeForm';

export const revalidate = 300;

interface Props {
  params: Promise<{ listId: string }>;
}

export async function generateStaticParams() {
  return [];
}

async function getListData(listId: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return undefined;

  const supabase = createClient(url, key);
  const { data } = await supabase
    .from('newsletter_lists')
    .select('name, description')
    .eq('id', listId)
    .single();

  return data || undefined;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { listId } = await params;
  const list = await getListData(listId);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

  if (!list) {
    return { title: 'メルマガ購読' };
  }

  const title = `${list.name}｜メルマガ購読`;
  const description = list.description || `「${list.name}」のメルマガに登録して最新情報を受け取りましょう。`;

  return {
    title,
    description,
    keywords: ['メルマガ', 'メールマガジン', 'ニュースレター', '購読'],
    alternates: { canonical: `${siteUrl}/newsletter/subscribe/${listId}` },
    openGraph: {
      type: 'website',
      locale: 'ja_JP',
      url: `${siteUrl}/newsletter/subscribe/${listId}`,
      siteName: '集客メーカー',
      title: `${list.name}｜メルマガ購読｜集客メーカー`,
      description,
      images: [{ url: `${siteUrl}/api/og?title=${encodeURIComponent(list.name)}&type=newsletter`, width: 1200, height: 630, alt: list.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${list.name}｜メルマガ購読｜集客メーカー`,
      description,
      creator: '@syukaku_maker',
    },
  };
}

export default async function SubscribePage({ params }: Props) {
  const { listId } = await params;
  const list = await getListData(listId);

  return <SubscribeForm listId={listId} listName={list?.name} />;
}
