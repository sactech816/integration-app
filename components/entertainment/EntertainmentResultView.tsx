'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { RefreshCw, Share2, Users, Heart, Sparkles, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { supabase } from '@/lib/supabase';
import type { Quiz, QuizResult, EntertainmentMeta } from '@/lib/types';

interface EntertainmentResultViewProps {
  quiz: Quiz;
  result: QuizResult;
  onRetry: () => void;
  onBack: () => void;
}

export default function EntertainmentResultView({
  quiz,
  result,
  onRetry,
  onBack,
}: EntertainmentResultViewProps) {
  const [liked, setLiked] = useState(false);
  const [shared, setShared] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const meta = quiz.entertainment_meta as EntertainmentMeta | undefined;
  const resultImage = meta?.resultImages?.[result.type] || result.image_url;
  const ogStyle = meta?.ogStyle || 'vibrant';

  // スタイル別グラデーション
  const gradients: Record<string, { bg: string; card: string; accent: string; ring: string }> = {
    vibrant: {
      bg: 'from-red-400 via-pink-400 to-yellow-300',
      card: 'from-pink-500 to-orange-400',
      accent: 'text-pink-500',
      ring: 'ring-pink-400/60',
    },
    cute: {
      bg: 'from-pink-300 via-purple-300 to-pink-200',
      card: 'from-pink-400 to-purple-400',
      accent: 'text-pink-500',
      ring: 'ring-pink-300/60',
    },
    cool: {
      bg: 'from-indigo-900 via-purple-900 to-indigo-800',
      card: 'from-indigo-600 to-purple-600',
      accent: 'text-purple-400',
      ring: 'ring-purple-400/60',
    },
    pop: {
      bg: 'from-pink-400 via-purple-400 to-indigo-400',
      card: 'from-pink-500 to-purple-500',
      accent: 'text-purple-500',
      ring: 'ring-purple-400/60',
    },
  };

  const g = gradients[ogStyle] || gradients.vibrant;
  const isDark = ogStyle === 'cool';

  useEffect(() => {
    fireConfetti();
  }, []);

  const fireConfetti = () => {
    const colors = ogStyle === 'cool'
      ? ['#818cf8', '#a78bfa', '#c4b5fd']
      : ['#ec4899', '#f59e0b', '#a855f7', '#38bdf8'];
    const duration = 3000;
    const end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 65, origin: { x: 0 }, colors });
      confetti({ particleCount: 5, angle: 120, spread: 65, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const resultPageUrl = `${siteUrl}/entertainment/${quiz.slug}/result?type=${encodeURIComponent(result.type)}`;
  const quizUrl = `${siteUrl}/entertainment/${quiz.slug}`;

  const shareTemplate = meta?.shareTemplate || 'わたしは「{{result_title}}」タイプでした！\n{{quiz_title}}\n#エンタメ診断';
  const shareText = shareTemplate
    .replace(/\{\{result_title\}\}/g, result.title)
    .replace(/\{\{quiz_title\}\}/g, quiz.title);

  const handleShareX = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(resultPageUrl)}`,
      '_blank'
    );
    trackShare();
  };

  const handleShareLine = () => {
    window.open(
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(resultPageUrl)}&text=${encodeURIComponent(shareText)}`,
      '_blank'
    );
    trackShare();
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${resultPageUrl}`);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
      trackShare();
    } catch {}
  };

  const trackShare = async () => {
    if (supabase) {
      try { await supabase.rpc('increment_shares', { row_id: quiz.id }); } catch {}
    }
  };

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    fireConfetti();
    if (supabase) {
      try { await supabase.rpc('increment_likes', { row_id: quiz.id }); } catch {}
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${g.bg}`}>
      {/* 装飾用キラキラ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[5%] w-2 h-2 bg-white/40 rounded-full animate-pulse" />
        <div className="absolute top-[15%] right-[10%] w-3 h-3 bg-white/30 rounded-full animate-pulse delay-300" />
        <div className="absolute top-[25%] left-[15%] w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse delay-700" />
        <div className="absolute top-[8%] right-[25%] w-2 h-2 bg-white/35 rounded-full animate-pulse delay-500" />
      </div>

      <div className="relative max-w-md mx-auto px-4 py-6 space-y-5">

        {/* ヘッダー: あなたのタイプは... */}
        <div className="text-center pt-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full mb-3">
            <Sparkles className={`w-4 h-4 ${isDark ? 'text-purple-300' : 'text-white'}`} />
            <span className={`text-sm font-bold ${isDark ? 'text-purple-200' : 'text-white'}`}>
              {quiz.title}
            </span>
          </div>
          <p className={`text-base font-semibold tracking-wide ${isDark ? 'text-purple-200' : 'text-white/90'}`}>
            あなたのタイプは...
          </p>
        </div>

        {/* メイン結果カード: 画像がメイン */}
        <div className="relative">
          {/* カード影 */}
          <div className={`absolute inset-2 bg-gradient-to-br ${g.card} rounded-3xl blur-2xl opacity-40`} />

          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* 画像エリア: 画面いっぱい */}
            {resultImage ? (
              <div className="relative w-full aspect-[4/5] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                <Image
                  src={resultImage}
                  alt={result.title}
                  fill
                  className={`object-cover transition-all duration-700 ${imageLoaded ? 'scale-100 opacity-100' : 'scale-105 opacity-0'}`}
                  sizes="(max-width: 640px) 100vw, 400px"
                  onLoad={() => setImageLoaded(true)}
                  priority
                />
                {/* 画像上にグラデーションオーバーレイ */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                {/* 画像上のテキスト */}
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
              /* 画像なし: グラデーション背景 */
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

            {/* 説明テキスト */}
            <div className="p-6">
              <p className="text-base text-gray-700 leading-relaxed">{result.description}</p>
            </div>
          </div>
        </div>

        {/* SNSシェアボタン */}
        <div className="space-y-3">
          <p className={`text-center text-sm font-bold ${isDark ? 'text-white/80' : 'text-white/90'}`}>
            結果をシェアしよう！
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleShareX}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-black text-white
                font-bold rounded-2xl shadow-lg hover:bg-gray-800 transition-all min-h-[48px] active:scale-95"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              でシェア
            </button>
            <button
              onClick={handleShareLine}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-[#06C755] text-white
                font-bold rounded-2xl shadow-lg hover:bg-[#05b04c] transition-all min-h-[48px] active:scale-95"
            >
              LINE
            </button>
          </div>

          <button
            onClick={handleCopyUrl}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white/90 backdrop-blur-sm
              text-gray-700 font-bold rounded-2xl shadow-md hover:bg-white transition-all min-h-[44px] active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            {shared ? 'コピーしました！' : 'リンクをコピー'}
          </button>
        </div>

        {/* いいね + 友達に診断させる */}
        <div className="flex gap-3">
          <button
            onClick={handleLike}
            className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl shadow-md
              font-bold transition-all min-h-[48px] active:scale-95 ${
                liked
                  ? 'bg-pink-100 text-pink-600 border-2 border-pink-300 ring-4 ring-pink-200/50'
                  : 'bg-white/90 backdrop-blur-sm border-2 border-white/50 text-gray-600 hover:bg-pink-50 hover:text-pink-500'
              }`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
            {liked ? 'ありがとう！' : 'いいね'}
          </button>
          <button
            onClick={() => {
              navigator.clipboard.writeText(quizUrl);
              window.open(quizUrl, '_blank');
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r ${g.card}
              text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all min-h-[48px] active:scale-95`}
          >
            <Users className="w-5 h-5" />
            友達にも診断させる
          </button>
        </div>

        {/* もう一度 */}
        <button
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white/20 backdrop-blur-sm
            text-white font-bold rounded-2xl hover:bg-white/30 transition-all min-h-[44px] active:scale-95"
        >
          <RefreshCw className="w-4 h-4" />
          もう一度診断する
        </button>

        {/* フッター */}
        <div className="text-center py-3">
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
