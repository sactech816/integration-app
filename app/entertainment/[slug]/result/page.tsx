import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { Quiz, QuizResult, EntertainmentMeta } from '@/lib/types';

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ type?: string }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { type } = await searchParams;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

  if (!supabase || !type) {
    return { title: 'エンタメ診断結果' };
  }

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('title, description, results, entertainment_meta')
    .eq('slug', slug)
    .single();

  if (!quiz) {
    return { title: 'エンタメ診断結果が見つかりません' };
  }

  const results: QuizResult[] = typeof quiz.results === 'string' ? JSON.parse(quiz.results) : quiz.results;
  const result = results.find((r) => r.type === type);
  const meta = quiz.entertainment_meta as EntertainmentMeta | undefined;

  if (!result) {
    return { title: quiz.title };
  }

  const resultTitle = `わたしは「${result.title}」タイプでした！`;
  const ogImageUrl = `${siteUrl}/api/entertainment/og?quiz=${slug}&result=${encodeURIComponent(type)}&title=${encodeURIComponent(result.title)}&quizTitle=${encodeURIComponent(quiz.title)}`;
  const resultImage = meta?.resultImages?.[type] || result.image_url;

  return {
    title: `${resultTitle} | ${quiz.title}`,
    description: result.description,
    openGraph: {
      title: resultTitle,
      description: `${quiz.title} - ${result.description}`,
      url: `${siteUrl}/entertainment/${slug}/result?type=${encodeURIComponent(type)}`,
      images: [
        {
          url: resultImage || ogImageUrl,
          width: 1200,
          height: 630,
          alt: resultTitle,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: resultTitle,
      description: `${quiz.title} - ${result.description}`,
      images: [resultImage || ogImageUrl],
    },
  };
}

export default async function EntertainmentResultPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { type } = await searchParams;

  if (!supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>設定エラー</p>
      </div>
    );
  }

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-pink-50 to-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">診断が見つかりません</h1>
          <a href="/" className="text-pink-600 font-semibold hover:underline">トップページへ</a>
        </div>
      </div>
    );
  }

  const results: QuizResult[] = typeof quiz.results === 'string' ? JSON.parse(quiz.results) : quiz.results;
  const result = type ? results.find((r) => r.type === type) : null;
  const meta = quiz.entertainment_meta as EntertainmentMeta | undefined;
  const resultImage = result ? (meta?.resultImages?.[result.type] || result.image_url) : null;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';
  const quizUrl = `${siteUrl}/entertainment/${slug}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white">
      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        {result ? (
          <>
            {/* 結果カード */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
              {resultImage && (
                <div className="relative w-full aspect-square bg-gradient-to-br from-pink-100 to-purple-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resultImage}
                    alt={result.title}
                    className="w-full h-full object-contain p-6"
                  />
                </div>
              )}
              <div className="p-6 text-center">
                <p className="text-xs font-semibold text-pink-500 uppercase tracking-wider mb-2">
                  診断結果
                </p>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">{result.title}</h2>
                <p className="text-sm text-gray-600 leading-relaxed">{result.description}</p>
              </div>
            </div>

            {/* CTA */}
            <a
              href={quizUrl}
              className="block w-full text-center px-6 py-4 bg-gradient-to-r from-pink-500 to-purple-500
                text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all min-h-[44px]"
            >
              あなたも診断してみる
            </a>
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold text-gray-900 mb-4">{quiz.title}</h2>
            <p className="text-gray-600 mb-6">この診断に挑戦してみよう！</p>
            <a
              href={quizUrl}
              className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500
                text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all min-h-[44px]"
            >
              診断をはじめる
            </a>
          </div>
        )}

        {/* フッター */}
        <div className="text-center py-4">
          <p className="text-xs text-gray-400">
            Powered by{' '}
            <a href="https://makers.tokyo" className="text-pink-500 hover:underline">
              集客メーカー
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
