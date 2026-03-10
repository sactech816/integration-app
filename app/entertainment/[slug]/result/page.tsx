import { supabase } from '@/lib/supabase';
import { Metadata } from 'next';
import type { QuizResult, EntertainmentMeta } from '@/lib/types';
import { Sparkles, Star, Crown, Gem, Zap } from 'lucide-react';
import LineAddFriendButton from '@/components/line/LineAddFriendButton';

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

  const aspectRatio = meta?.imageAspectRatio || '1:1';
  const aspectClasses: Record<string, string> = {
    '1:1': 'aspect-square',
    '3:4': 'aspect-[3/4]',
    '4:3': 'aspect-[4/3]',
    '9:16': 'aspect-[9/16]',
  };
  const aspectClass = aspectClasses[aspectRatio] || 'aspect-square';

  const rarityConfigs: Record<string, { label: string; color: string; text: string; border: string }> = {
    common: { label: 'COMMON', color: 'from-gray-400 to-gray-500', text: 'text-gray-100', border: 'border-gray-400/50' },
    rare: { label: 'RARE', color: 'from-blue-400 to-blue-600', text: 'text-blue-100', border: 'border-blue-400/50' },
    super_rare: { label: 'SUPER RARE', color: 'from-purple-400 to-purple-600', text: 'text-purple-100', border: 'border-purple-400/50' },
    legendary: { label: 'LEGENDARY', color: 'from-yellow-400 to-amber-500', text: 'text-yellow-100', border: 'border-yellow-400/50' },
  };

  const barGradients: Record<string, string> = {
    vibrant: 'from-pink-400 to-orange-400',
    cute: 'from-pink-400 to-purple-400',
    cool: 'from-indigo-400 to-purple-400',
    pop: 'from-pink-400 to-indigo-400',
  };
  const barGrad = barGradients[ogStyle] || barGradients.vibrant;

  const rarityConfig = result?.rarity ? rarityConfigs[result.rarity] : null;
  const RarityIconMap: Record<string, typeof Crown> = { rare: Gem, super_rare: Zap, legendary: Crown };
  const RarityIcon = result?.rarity ? RarityIconMap[result.rarity] : null;

  const compatibleResult = result?.compatibleType
    ? results.find(r => r.type === result.compatibleType)
    : null;

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
            {/* レア度バッジ */}
            {rarityConfig && (
              <div className="flex justify-center">
                <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r ${rarityConfig.color} border ${rarityConfig.border} shadow-lg`}>
                  {RarityIcon && <RarityIcon className={`w-4 h-4 ${rarityConfig.text}`} />}
                  <span className={`text-xs font-black tracking-widest ${rarityConfig.text}`}>
                    {rarityConfig.label}
                  </span>
                </div>
              </div>
            )}

            {/* 画像メイン */}
            {resultImage ? (
              <div className="relative">
                <div className={`absolute inset-3 bg-gradient-to-br ${g.card} rounded-3xl blur-3xl opacity-50`} />
                <div className="relative rounded-3xl shadow-2xl overflow-hidden ring-4 ring-white/20">
                  <div className={`relative w-full ${aspectClass} bg-gray-200`}>
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
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_40%)]" />
                  <div className="text-center px-8 relative z-10 space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <Star className="w-6 h-6 text-yellow-300 fill-yellow-300 drop-shadow" />
                      <Star className="w-8 h-8 text-yellow-300 fill-yellow-300 drop-shadow" />
                      <Star className="w-6 h-6 text-yellow-300 fill-yellow-300 drop-shadow" />
                    </div>
                    <p className="text-sm font-bold text-white/70 tracking-widest uppercase">
                      わたしのタイプは
                    </p>
                    <h2 className="text-4xl font-black text-white drop-shadow-lg leading-tight">
                      {result.title}
                    </h2>
                    <div className="w-16 h-1 bg-white/40 rounded-full mx-auto" />
                  </div>
                </div>
              </div>
            )}

            {/* タイトル + おもしろ一言 */}
            <div className="text-center space-y-1">
              <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-purple-300' : 'text-white/70'}`}>
                わたしのタイプは
              </p>
              <h2 className="text-2xl font-extrabold text-white drop-shadow-lg leading-tight">
                {result.title}
              </h2>
              {result.funFact && (
                <p className={`text-sm font-bold ${isDark ? 'text-yellow-300' : 'text-yellow-200'} drop-shadow mt-1`}>
                  {result.funFact}
                </p>
              )}
            </div>

            {/* 説明 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-md">
              <p className="text-xs text-gray-600 leading-relaxed">{result.description}</p>
            </div>

            {/* 特性バー */}
            {result.traits && result.traits.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-4 shadow-md space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">あなたの特性</p>
                {result.traits.map((trait, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-700">{trait.label}</span>
                      <span className="text-xs font-black text-gray-900">{trait.value}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${barGrad} rounded-full`}
                        style={{ width: `${trait.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 相性タイプ */}
            {compatibleResult && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-4 shadow-md">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">相性ぴったりのタイプ</p>
                <div className="flex items-center gap-3">
                  {meta?.resultImages?.[compatibleResult.type] ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-white shadow">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={meta.resultImages[compatibleResult.type]}
                        alt={compatibleResult.title}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${g.card} flex items-center justify-center flex-shrink-0 shadow`}>
                      <Star className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-black text-gray-900 truncate">{compatibleResult.title}</p>
                    <p className="text-xs text-gray-500 truncate">{compatibleResult.type}タイプ</p>
                  </div>
                </div>
              </div>
            )}

            {/* LINE友だち追加ボタン（オーナーがLINE連携済みの場合のみ表示） */}
            {quiz.user_id && (
              <LineAddFriendButton
                ownerId={quiz.user_id}
                sourceType="entertainment_quiz"
                sourceId={quiz.id}
              />
            )}

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
