import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import { Download, ArrowLeft, BookOpen } from 'lucide-react';
import Link from 'next/link';

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

type KindleCover = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  author_name: string | null;
  image_url: string | null;
  genre: string;
  image_size: string;
  views_count: number;
  created_at: string;
};

async function getCover(slug: string): Promise<KindleCover | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { data } = await supabase
    .from('kindle_covers')
    .select('id, slug, title, subtitle, author_name, image_url, genre, image_size, views_count, created_at')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cover = await getCover(slug);

  if (!cover) {
    return { title: 'Kindle表紙が見つかりません' };
  }

  return {
    title: `${cover.title} - Kindle表紙 | 集客メーカー`,
    description: `${cover.title}のKindle表紙デザイン`,
    openGraph: {
      title: `${cover.title} - Kindle表紙`,
      description: `${cover.title}のKindle表紙デザイン`,
      images: cover.image_url ? [{ url: cover.image_url, width: 1600, height: 2560 }] : [],
    },
  };
}

export default async function KindleCoverViewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cover = await getCover(slug);

  if (!cover) {
    notFound();
  }

  // 閲覧数を更新（fire-and-forget）
  const supabaseForUpdate = getSupabaseAdmin();
  if (supabaseForUpdate) {
    supabaseForUpdate
      .from('kindle_covers')
      .update({ views_count: (cover.views_count || 0) + 1 } as Record<string, unknown>)
      .eq('slug', slug)
      .then(() => {});
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/kindle/cover/editor"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            表紙を作成する
          </Link>
          <div className="flex items-center gap-2 text-amber-600">
            <BookOpen size={18} />
            <span className="text-sm font-semibold">Kindle表紙メーカー</span>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        <div className="flex flex-col items-center">
          {/* タイトル */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {cover.title}
            </h1>
            {cover.subtitle && (
              <p className="text-gray-600 text-lg">{cover.subtitle}</p>
            )}
            {cover.author_name && (
              <p className="text-gray-500 text-sm mt-2">著者: {cover.author_name}</p>
            )}
          </div>

          {/* 表紙画像 */}
          {cover.image_url && (
            <div className="relative group">
              <div className="rounded-xl overflow-hidden shadow-2xl border border-gray-200 max-w-md">
                <img
                  src={cover.image_url}
                  alt={`${cover.title} - Kindle表紙`}
                  className="w-full h-auto"
                  style={{ maxHeight: '70vh' }}
                />
              </div>

              {/* ダウンロードボタン */}
              <div className="mt-6 flex justify-center">
                <a
                  href={cover.image_url}
                  download={`kindle-cover-${cover.title}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200"
                >
                  <Download size={20} />
                  表紙をダウンロード
                </a>
              </div>
            </div>
          )}

          {/* 情報 */}
          <div className="mt-8 text-center text-sm text-gray-400">
            <p>KDP推奨サイズ: {cover.image_size === '4K' ? '3200×5120px' : '1600×2560px'}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
