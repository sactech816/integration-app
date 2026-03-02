import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ThumbnailViewer from '@/components/thumbnail/ThumbnailViewer';
import { generateUGCMetadata } from '@/lib/seo/generateUGCMetadata';

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

// ISRでオンデマンド生成（ビルド時間・デプロイサイズ削減のためビルド時の事前生成を無効化）
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabase();
  if (!supabase) return { title: 'サムネイル' };

  const { data } = await supabase
    .from('thumbnails')
    .select('title, description, image_url')
    .eq('slug', slug)
    .single();

  if (!data) return { title: 'サムネイル' };

  return generateUGCMetadata({
    title: data.title,
    description: data.description || '',
    type: 'thumbnail',
    slug,
    imageUrl: data.image_url,
  });
}

export default async function ThumbnailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = getSupabase();
  if (!supabase) return notFound();

  const { data: thumbnail } = await supabase
    .from('thumbnails')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!thumbnail) return notFound();

  // PV カウント更新
  supabase
    .from('thumbnails')
    .update({ views_count: (thumbnail.views_count || 0) + 1 })
    .eq('id', thumbnail.id)
    .then(() => {});

  return <ThumbnailViewer thumbnail={thumbnail} />;
}
