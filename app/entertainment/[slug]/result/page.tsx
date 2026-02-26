import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import type { QuizResult, EntertainmentMeta } from '@/lib/types';
import { Sparkles, Star } from 'lucide-react';

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
  const ogStyle = (meta?.ogStyle as string) || 'vibrant';

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';
  const quizUrl = `${siteUrl}/entertainment/${slug}`;

  // スタイル別グラデーション
  const gradients: Record<string, { bg: string; card: string }> = {
    vibrant: { bg: 'from-red-400 via-pink-400 to-yellow-300', card: 'from-pink-500 to-orange-400' },
    cute: { bg: 'from-pink-300 via-purple-300 to-pink-200', card: 'from-pink-400 to-purple-400' },
    cool: { bg: 'from-indigo-900 via-purple-900 to-indigo-800', card: 'from-indigo-600 to-purple-600' },
    pop: { bg: 'from-pink-400 via-purple-400 to-indigo-400', card: 'from-pink-500 to-purple-500' },
  };
  const g = gradients[ogStyle] || gradients.vibrant;
  const isDark = ogStyle === 'cool';

  return (
    <div className={`min-h-screen bg-gradient-to-b ${g.bg}`}>
      {/* 装飾 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-2 h-2 bg-white/40 rounded-full animate-pulse" />
        <div className="absolute top-[15%] right-[10%] w-3 h-3 bg-white/30 rounded-full animate-pulse" />
        <div className="absolute top-[25%] left-[15%] w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse" />
      </div>

      <div className="relative max-w-md mx-auto px-4 py-8 space-y-6">
        {result ? (
          <>
            {/* ヘッダー */}
            <div className="text-center">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full mb-3">
                <Sparkles className={`w-4 h-4 ${isDark ? 'text-purple-300' : 'text-white'}`} />
                <span className={`text-sm font-bold ${isDark ? 'text-purple-200' : 'text-white'}`}>
                  {quiz.title}
                </span>
              </div>
              <p className={`text-base font-semibold ${isDark ? 'text-purple-200' : 'text-white/90'}`}>
                診断結果
              </p>
            </div>

            {/* 結果カード: 画像メイン */}
            <div className="relative">
              <div className={`absolute inset-2 bg-gradient-to-br ${g.card} rounded-3xl blur-2xl opacity-40`} />
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
                {resultImage ? (
                  <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resultImage}
                      alt={result.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      </div>
                      <h2 className="text-3xl font-extrabold leading-tight drop-shadow-lg">
                        {result.title}
                      </h2>
                    </div>
                  </div>
                ) : (
                  <div className={`relative w-full aspect-[4/3] bg-gradient-to-br ${g.card} flex items-center justify-center`}>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.15),transparent_50%)]" />
                    <div className="text-center px-8 relative z-10">
                      <div className="text-6xl mb-4">
                        {ogStyle === 'cool' ? '🌌' : ogStyle === 'cute' ? '🌸' : '🎉'}
                      </div>
                      <h2 className="text-3xl font-extrabold text-white leading-tight drop-shadow-lg">
                        {result.title}
                      </h2>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <p className="text-base text-gray-700 leading-relaxed">{result.description}</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <a
              href={quizUrl}
              className={`block w-full text-center px-6 py-4 bg-gradient-to-r ${g.card}
                text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all min-h-[48px] active:scale-95`}
            >
              あなたも診断してみる
            </a>
          </>
        ) : (
          <div className="text-center py-12">
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-white'}`}>
              {quiz.title}
            </h2>
            <p className={`mb-6 ${isDark ? 'text-purple-200' : 'text-white/80'}`}>
              この診断に挑戦してみよう！
            </p>
            <a
              href={quizUrl}
              className={`inline-block px-8 py-4 bg-gradient-to-r ${g.card}
                text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all min-h-[48px]`}
            >
              診断をはじめる
            </a>
          </div>
        )}

        <div className="text-center py-4">
          <p className={`text-xs ${isDark ? 'text-white/40' : 'text-white/50'}`}>
            Powered by{' '}
            <a href="https://makers.tokyo" className="hover:underline">
              集客メーカー
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
