import { Metadata } from 'next';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import SalesLetterViewer from '@/components/salesletter/SalesLetterViewer';
import { SalesLetter } from '@/lib/types';

interface Props {
  params: Promise<{ slug: string }>;
}

// サーバー用Supabaseクライアント作成
async function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) return null;

  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
    },
  });
}

// メタデータ生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await getSupabase();
  if (!supabase) return { title: 'エラー' };
  
  const { data } = await supabase
    .from('sales_letters')
    .select('title, settings')
    .eq('slug', slug)
    .single();

  if (!data) {
    return {
      title: 'ページが見つかりません',
    };
  }

  return {
    title: data.title || 'セールスレター',
    description: `${data.title || 'セールスレター'}のページです。`,
  };
}

export default async function SalesLetterPublicPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await getSupabase();
  if (!supabase) notFound();

  // データ取得
  const { data: salesLetter, error } = await supabase
    .from('sales_letters')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !salesLetter) {
    notFound();
  }

  // 閲覧数インクリメント（非同期で実行）
  supabase.rpc('increment_sales_letter_views', { letter_slug: slug });

  return <SalesLetterViewer salesLetter={salesLetter as SalesLetter} />;
}
