'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { RefreshCw, Share2, Users, Heart, Sparkles, Star, Download } from 'lucide-react';
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

  const gradients: Record<string, { bg: string; card: string; accent: string }> = {
    vibrant: { bg: 'from-red-400 via-pink-400 to-yellow-300', card: 'from-pink-500 to-orange-400', accent: 'text-pink-500' },
    cute: { bg: 'from-pink-300 via-purple-300 to-pink-200', card: 'from-pink-400 to-purple-400', accent: 'text-pink-500' },
    cool: { bg: 'from-indigo-900 via-purple-900 to-indigo-800', card: 'from-indigo-600 to-purple-600', accent: 'text-purple-400' },
    pop: { bg: 'from-pink-400 via-purple-400 to-indigo-400', card: 'from-pink-500 to-purple-500', accent: 'text-purple-500' },
  };
  const g = gradients[ogStyle] || gradients.vibrant;
  const isDark = ogStyle === 'cool';

  useEffect(() => {
    fireConfetti();
  }, []);

  const fireConfetti = () => {
    const colors = isDark
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

  const handleSaveImage = () => {
    if (!resultImage) return;
    const a = document.createElement('a');
    a.href = resultImage;
    a.download = `${quiz.title}-${result.title}.png`;
    a.target = '_blank';
    a.click();
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b ${g.bg}`}>
      {/* 装飾 */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[8%] left-[5%] w-2 h-2 bg-white/40 rounded-full animate-pulse" />
        <div className="absolute top-[12%] right-[8%] w-3 h-3 bg-white/30 rounded-full animate-pulse" />
        <div className="absolute top-[20%] left-[12%] w-1.5 h-1.5 bg-white/50 rounded-full animate-pulse" />
      </div>

      <div className="relative max-w-md mx-auto px-4 py-4 space-y-4">

        {/* 小さなヘッダー */}
        <div className="text-center pt-2">
          <p className={`text-sm font-bold tracking-wide ${isDark ? 'text-purple-200' : 'text-white/90'}`}>
            {quiz.title}
          </p>
        </div>

        {/* ===== メイン: 画像がヒーロー ===== */}
        {resultImage ? (
          <>
            {/* 画像カード: 画面幅いっぱい、角丸、影 */}
            <div className="relative">
              <div className={`absolute inset-3 bg-gradient-to-br ${g.card} rounded-3xl blur-3xl opacity-50`} />
              <div className="relative rounded-3xl shadow-2xl overflow-hidden ring-4 ring-white/20">
                <div className="relative w-full aspect-square bg-gray-200">
                  <Image
                    src={resultImage}
                    alt={result.title}
                    fill
                    className={`object-cover transition-all duration-700 ${imageLoaded ? 'scale-100 opacity-100' : 'scale-110 opacity-0'}`}
                    sizes="(max-width: 640px) 100vw, 448px"
                    onLoad={() => setImageLoaded(true)}
                    priority
                  />
                </div>
              </div>
            </div>

            {/* タイトル: 画像の下にドーンと */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-5 h-5 text-yellow-300 fill-yellow-300 drop-shadow" />
                <Star className="w-6 h-6 text-yellow-300 fill-yellow-300 drop-shadow" />
                <Star className="w-5 h-5 text-yellow-300 fill-yellow-300 drop-shadow" />
              </div>
              <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-purple-300' : 'text-white/70'}`}>
                あなたのタイプは
              </p>
              <h2 className="text-3xl font-extrabold text-white drop-shadow-lg leading-tight">
                {result.title}
              </h2>
            </div>

            {/* 説明 */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
              <p className="text-sm text-gray-700 leading-relaxed">{result.description}</p>
            </div>

            {/* 画像保存ボタン */}
            <button
              onClick={handleSaveImage}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/20 backdrop-blur-sm
                text-white font-bold rounded-2xl hover:bg-white/30 transition-all min-h-[44px] active:scale-95"
            >
              <Download className="w-4 h-4" />
              画像を保存
            </button>
          </>
        ) : (
          /* 画像なしフォールバック */
          <>
            <div className="relative">
              <div className={`absolute inset-3 bg-gradient-to-br ${g.card} rounded-3xl blur-3xl opacity-50`} />
              <div className={`relative rounded-3xl shadow-2xl overflow-hidden bg-gradient-to-br ${g.card} aspect-square flex items-center justify-center`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.15),transparent_50%)]" />
                <div className="text-center px-8 relative z-10">
                  <div className="text-8xl mb-4">
                    {ogStyle === 'cool' ? '🌌' : ogStyle === 'cute' ? '🌸' : '🎉'}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="w-5 h-5 text-yellow-300 fill-yellow-300 drop-shadow" />
                <Star className="w-6 h-6 text-yellow-300 fill-yellow-300 drop-shadow" />
                <Star className="w-5 h-5 text-yellow-300 fill-yellow-300 drop-shadow" />
              </div>
              <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-purple-300' : 'text-white/70'}`}>
                あなたのタイプは
              </p>
              <h2 className="text-3xl font-extrabold text-white drop-shadow-lg leading-tight">
                {result.title}
              </h2>
            </div>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
              <p className="text-sm text-gray-700 leading-relaxed">{result.description}</p>
            </div>
          </>
        )}

        {/* SNSシェア */}
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

        {/* いいね + 友達 */}
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
