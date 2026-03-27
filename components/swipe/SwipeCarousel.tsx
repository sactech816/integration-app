'use client';

import React, { useState, useRef, useEffect, useCallback, TouchEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { SwipeCard, SwipeCarouselSettings, SwipeAspectRatio } from '@/lib/types';

interface SwipeCarouselProps {
  cards: SwipeCard[];
  settings: SwipeCarouselSettings;
  aspectRatio: SwipeAspectRatio;
  isPreview?: boolean;
}

const ASPECT_SIZES: Record<SwipeAspectRatio, { width: number; height: number; label: string }> = {
  '9:16': { width: 1080, height: 1920, label: '縦長（9:16）推奨: 1080×1920px' },
  '1:1': { width: 1080, height: 1080, label: '正方形（1:1）推奨: 1080×1080px' },
  '16:9': { width: 1280, height: 720, label: '横長（16:9）推奨: 1280×720px' },
};

export { ASPECT_SIZES };

// カード1枚分のレンダリング
function CardContent({ card, index }: { card: SwipeCard; index: number }) {
  const hasTextOverlay = card.textOverlay && (card.textOverlay.title || card.textOverlay.subtitle);
  const bgImage = card.imageUrl || card.textOverlay?.backgroundImageUrl;

  if (bgImage && !hasTextOverlay) {
    return <img src={bgImage} alt={`カード ${index + 1}`} className="w-full h-full object-cover" />;
  }

  if (bgImage && hasTextOverlay) {
    return (
      <div className="w-full h-full relative">
        <img src={bgImage} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center p-6 text-center">
          {card.textOverlay?.title && (
            <p className="text-white font-bold text-xl leading-tight drop-shadow-lg">{card.textOverlay.title}</p>
          )}
          {card.textOverlay?.subtitle && (
            <p className="text-white/90 text-sm mt-2 drop-shadow-md">{card.textOverlay.subtitle}</p>
          )}
        </div>
      </div>
    );
  }

  if (hasTextOverlay) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900 flex flex-col items-center justify-center p-6 text-center">
        {card.textOverlay?.title && (
          <p className="text-white font-bold text-xl leading-tight">{card.textOverlay.title}</p>
        )}
        {card.textOverlay?.subtitle && (
          <p className="text-white/80 text-sm mt-2">{card.textOverlay.subtitle}</p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 text-lg">
      カード {index + 1}
    </div>
  );
}

export default function SwipeCarousel({ cards, settings, aspectRatio, isPreview }: SwipeCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  // モバイル判定
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // 自動再生
  useEffect(() => {
    if (!settings.autoPlay || isPaused || cards.length <= 1) return;
    // モバイルで全表示モードなら自動再生しない
    if (isMobile && settings.mobileDisplay === 'all') return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % cards.length);
    }, settings.intervalSeconds * 1000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [settings.autoPlay, settings.intervalSeconds, settings.mobileDisplay, isPaused, cards.length, isMobile]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(0, Math.min(index, cards.length - 1)));
  }, [cards.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + cards.length) % cards.length);
  }, [cards.length]);

  const goNext = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % cards.length);
  }, [cards.length]);

  // タッチスワイプ
  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  if (cards.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-2xl p-12 text-gray-400">
        カードがありません
      </div>
    );
  }

  const aspect = ASPECT_SIZES[aspectRatio];
  const paddingTop = `${(aspect.height / aspect.width) * 100}%`;

  // モバイルで「全表示」モードの場合
  if (isMobile && settings.mobileDisplay === 'all' && !isPreview) {
    return (
      <div className="space-y-3">
        {cards.map((card, i) => (
          <div key={card.id} className="relative w-full rounded-xl overflow-hidden shadow-md" style={{ paddingTop }}>
            <div className="absolute inset-0">
              <CardContent card={card} index={i} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // カルーセルモード（PC常時 or モバイルスワイプ）
  return (
    <div
      className="relative select-none"
      onMouseEnter={() => settings.pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => settings.pauseOnHover && setIsPaused(false)}
    >
      {/* メインカルーセル */}
      <div
        className="relative w-full overflow-hidden rounded-2xl shadow-lg"
        style={{ paddingTop }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0">
          {cards.map((card, i) => (
            <div
              key={card.id}
              className="absolute inset-0 transition-all duration-500 ease-in-out"
              style={{
                opacity: i === currentIndex ? 1 : 0,
                transform: `translateX(${(i - currentIndex) * 100}%)`,
                pointerEvents: i === currentIndex ? 'auto' : 'none',
              }}
            >
              <CardContent card={card} index={i} />
            </div>
          ))}
        </div>

        {/* SWIPE → テキスト */}
        <div className="absolute bottom-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10">
          SWIPE <ChevronRight className="w-3 h-3" />
        </div>

        {/* ページインジケーター */}
        {settings.showIndicator && (
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full z-10">
            {currentIndex + 1} / {cards.length}
          </div>
        )}
      </div>

      {/* 左右矢印 */}
      {settings.showArrows && cards.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all z-10"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all z-10"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}

      {/* ドットインジケーター */}
      <div className="flex justify-center gap-1.5 mt-3">
        {cards.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === currentIndex ? 'bg-blue-500 w-6' : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
