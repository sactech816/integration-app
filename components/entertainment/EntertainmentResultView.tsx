'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { RefreshCw, Share2, Users, Heart } from 'lucide-react';
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

  const meta = quiz.entertainment_meta as EntertainmentMeta | undefined;
  const resultImage = meta?.resultImages?.[result.type] || result.image_url;

  useEffect(() => {
    // 全結果で紙吹雪
    fireConfetti();
  }, []);

  const fireConfetti = () => {
    const duration = 2500;
    const end = Date.now() + duration;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#ec4899', '#a855f7', '#f59e0b'] });
      confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#ec4899', '#a855f7', '#f59e0b'] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const resultPageUrl = `${siteUrl}/entertainment/${quiz.slug}/result?type=${encodeURIComponent(result.type)}`;
  const quizUrl = `${siteUrl}/entertainment/${quiz.slug}`;

  // シェアテキスト生成
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
      try {
        await supabase.rpc('increment_shares', { row_id: quiz.id });
      } catch {}
    }
  };

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    if (supabase) {
      try {
        await supabase.rpc('increment_likes', { row_id: quiz.id });
      } catch {}
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-purple-50 to-white">
      <div className="max-w-md mx-auto px-4 py-8 space-y-6">
        {/* 結果カード */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
          {/* 結果画像 */}
          {resultImage && (
            <div className="relative w-full aspect-square bg-gradient-to-br from-pink-100 to-purple-100">
              <Image
                src={resultImage}
                alt={result.title}
                fill
                className="object-contain p-6"
                sizes="(max-width: 640px) 100vw, 400px"
              />
            </div>
          )}

          {/* 結果テキスト */}
          <div className="p-6 text-center">
            <p className="text-xs font-semibold text-pink-500 uppercase tracking-wider mb-2">
              あなたのタイプは...
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{result.title}</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{result.description}</p>
          </div>
        </div>

        {/* SNSシェアボタン */}
        <div className="space-y-3">
          <p className="text-center text-sm font-semibold text-gray-700">結果をシェアしよう！</p>
          <div className="flex gap-3">
            {/* X (Twitter) */}
            <button
              onClick={handleShareX}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-black text-white
                font-bold rounded-xl shadow-md hover:bg-gray-800 transition-all min-h-[44px]"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              でシェア
            </button>
            {/* LINE */}
            <button
              onClick={handleShareLine}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3.5 bg-[#06C755] text-white
                font-bold rounded-xl shadow-md hover:bg-[#05b04c] transition-all min-h-[44px]"
            >
              LINE
            </button>
          </div>

          {/* URLコピー */}
          <button
            onClick={handleCopyUrl}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300
              text-gray-700 font-semibold rounded-xl shadow-sm hover:bg-gray-50 transition-all min-h-[44px]"
          >
            <Share2 className="w-4 h-4" />
            {shared ? 'コピーしました！' : 'リンクをコピー'}
          </button>
        </div>

        {/* いいね + 友達に診断させる */}
        <div className="flex gap-3">
          <button
            onClick={handleLike}
            className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl shadow-sm
              font-semibold transition-all min-h-[44px] ${
                liked
                  ? 'bg-pink-100 text-pink-600 border border-pink-300'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-pink-50 hover:border-pink-300 hover:text-pink-600'
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
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-pink-500 to-purple-500
              text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all min-h-[44px]"
          >
            <Users className="w-5 h-5" />
            友達にも診断させる
          </button>
        </div>

        {/* もう一度 */}
        <button
          onClick={onRetry}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-600
            font-semibold rounded-xl hover:bg-gray-200 transition-all min-h-[44px]"
        >
          <RefreshCw className="w-4 h-4" />
          もう一度診断する
        </button>

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
