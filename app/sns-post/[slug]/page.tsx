import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = getSupabase();
  if (!supabase) return { title: 'SNS投稿' };

  const { data } = await supabase
    .from('sns_posts')
    .select('title')
    .eq('slug', slug)
    .single();

  if (!data) return { title: 'SNS投稿' };

  return {
    title: `${data.title} | SNS投稿メーカー`,
    description: 'AIで作成されたSNS投稿',
  };
}

export default async function SNSPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = getSupabase();

  if (!supabase) return notFound();

  const { data: post } = await supabase
    .from('sns_posts')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!post) return notFound();

  const content = post.content || {};
  const hashtags = (content.hashtags || []) as string[];
  const hashtagText = hashtags.map((t: string) => `#${t}`).join(' ');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-gray-300 shadow-md max-w-lg w-full p-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-sky-50 text-sky-700 text-xs font-semibold rounded-full border border-sky-200">
            {post.platform === 'twitter' ? 'X (Twitter)' : post.platform === 'instagram' ? 'Instagram' : 'Threads'}
          </span>
          <h1 className="text-lg font-bold text-gray-900">{post.title}</h1>
        </div>

        <div className="text-gray-900 whitespace-pre-wrap break-words leading-relaxed">
          {content.text}
        </div>

        {hashtagText && (
          <div className="text-sky-600 text-sm break-words">{hashtagText}</div>
        )}

        <div className="pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            SNS投稿メーカーで作成
          </p>
        </div>
      </div>
    </div>
  );
}
