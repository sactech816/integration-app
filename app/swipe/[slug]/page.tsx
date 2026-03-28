import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import SwipeViewer from '@/components/swipe/SwipeViewer';
import RelatedContent from '@/components/shared/RelatedContent';
import { shouldHideFooter } from '@/lib/utils/checkCreatorPlanPermission';

export const revalidate = 300;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

function getSupabase() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return [];
}

async function getSwipePage(slug: string) {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from('swipe_pages')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;

  // 閲覧数を加算
  supabase
    .from('swipe_pages')
    .update({ views_count: (data.views_count || 0) + 1 })
    .eq('id', data.id)
    .then(() => {});

  return data;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const swipePage = await getSwipePage(slug);

  if (!swipePage) {
    return { title: 'ページが見つかりません' };
  }

  const firstCardImage = swipePage.cards?.[0]?.imageUrl;

  return {
    title: `${swipePage.title} | 集客メーカー`,
    description: swipePage.description || swipePage.title,
    openGraph: {
      title: swipePage.title,
      description: swipePage.description || swipePage.title,
      ...(firstCardImage && { images: [{ url: firstCardImage }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: swipePage.title,
      description: swipePage.description || swipePage.title,
      ...(firstCardImage && { images: [firstCardImage] }),
    },
  };
}

export default async function SwipePublicPage({ params }: Props) {
  const { slug } = await params;
  const swipePage = await getSwipePage(slug);

  if (!swipePage) {
    notFound();
  }

  // フッター・関連コンテンツの非表示権限チェック
  const canHideFooter = await shouldHideFooter(
    swipePage.settings?.hideFooter,
    swipePage.user_id,
    swipePage.id,
    'footer_hide'
  );
  const canHideRelated = await shouldHideFooter(
    swipePage.settings?.hideRelatedContent,
    swipePage.user_id,
    swipePage.id,
    'related_content_hide'
  );

  return (
    <>
      <SwipeViewer swipePage={swipePage} hideFooter={canHideFooter} />
      <RelatedContent contentType="swipe" currentSlug={slug} hide={canHideRelated} />
    </>
  );
}
