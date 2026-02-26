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
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[8%] left-[5%] w-2 h-2 bg-white/40 rounded-full animate-pulse" />
        <div className="absolute top-[12%] right-[8%] w-3 h-3 bg-white/30 rounded-full animate-pulse" />
      </div>

      <div className="relative max-w-md mx-auto px-4 py-6 space-y-5">

        {/* ヘッダー */}
        <div className="text-center pt-2">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full mb-1">
            <Sparkles className={`w-4 h-4 ${isDark ? 'text-purple-300' : 'text-white'}`} />
            <span className={`text-sm font-bold ${isDark ? 'text-purple-200' : 'text-white'}`}>
              {quiz.title}
            </span>
          </div>
        </div>

        {result ? (
          <>
            {/* 画像メイン */}
            {resultImage ? (
              <div className="relative">
                <div className={`absolute inset-3 bg-gradient-to-br ${g.card} rounded-3xl blur-3xl opacity-50`} />
                <div className="relative rounded-3xl shadow-2xl overflow-hidden ring-4 ring-white/20">
                  <div className="relative w-full aspect-square bg-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={resultImage}
                      alt={result.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className={`absolute inset-3 bg-gradient-to-br ${g.card} rounded-3xl blur-3xl opacity-50`} />
                <div className={`relative rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-br ${g.card} aspect-square flex items-center justify-center`}>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.15),transparent_50%)]" />
                  <div className="text-8xl">
                    {ogStyle === 'cool' ? '🌌' : ogStyle === 'cute' ? '🌸' : '🎉'}
                  </div>
                </div>
              </div>
            )}

            {/* タイトル */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-5 h-5 text-yellow-300 fill-yellow-300 drop-shadow" />
                <Star className="w-6 h-6 text-yellow-300 fill-yellow-300 drop-shadow" />
                <Star className="w-5 h-5 text-yellow-300 fill-yellow-300 drop-shadow" />
              </div>
              <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-purple-300' : 'text-white/70'}`}>
                わたしのタイプは
              </p>
              <h2 className="text-3xl font-extrabold text-white drop-shadow-lg leading-tight">
                {result.title}
              </h2>
            </div>

            {/* 説明 */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
              <p className="text-sm text-gray-700 leading-relaxed">{result.description}</p>
            </div>

            {/* CTA: あなたも診断 */}
            <a
              href={quizUrl}
              className={`block w-full text-center px-6 py-4 bg-gradient-to-r ${g.card}
                text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all min-h-[48px] active:scale-95`}
            >
              あなたも診断してみる
            </a>
          </>
        ) : (
          <div className="text-center py-12 space-y-6">
            <h2 className="text-xl font-bold text-white">{quiz.title}</h2>
            <p className={`${isDark ? 'text-purple-200' : 'text-white/80'}`}>この診断に挑戦してみよう！</p>
            <a
              href={quizUrl}
              className={`inline-block px-8 py-4 bg-gradient-to-r ${g.card}
                text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all min-h-[48px]`}
            >
              診断をはじめる
            </a>
          </div>
        )}

        <div className="text-center py-3">
          <p className={`text-xs ${isDark ? 'text-white/40' : 'text-white/50'}`}>
            Powered by{' '}
            <a href="https://makers.tokyo" className="hover:underline">集客メーカー</a>
          </p>
        </div>
      </div>
    </div>
  );
}
