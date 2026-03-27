'use client';

import React, { useState } from 'react';
import { ShoppingCart, ExternalLink } from 'lucide-react';
import type { SwipePage } from '@/lib/types';
import SwipeCarousel from './SwipeCarousel';
import BlockRenderer from '@/components/shared/BlockRenderer';

interface SwipeViewerProps {
  swipePage: SwipePage;
}

export default function SwipeViewer({ swipePage }: SwipeViewerProps) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { settings } = swipePage;

  const handlePayment = async () => {
    if (settings.payment.paymentProvider === 'external' && settings.payment.paymentUrl) {
      window.location.href = settings.payment.paymentUrl;
      return;
    }

    if (settings.payment.paymentProvider === 'stripe') {
      setCheckoutLoading(true);
      try {
        const res = await fetch('/api/swipe/stripe-checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            swipePageId: swipePage.id,
            title: swipePage.title,
            price: settings.payment.price,
            stripePriceId: settings.payment.stripePriceId,
          }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          alert('決済ページの作成に失敗しました');
        }
      } catch {
        alert('決済処理中にエラーが発生しました');
      } finally {
        setCheckoutLoading(false);
      }
    }
  };

  const backgroundStyle = settings.theme?.gradient
    ? { background: settings.theme.gradient }
    : {};

  return (
    <div
      className={`min-h-screen ${settings.theme?.gradient ? '' : 'bg-gray-50'}`}
      style={backgroundStyle}
    >
      <div className="max-w-lg mx-auto px-4 py-8">
        {/* タイトル */}
        {swipePage.title && (
          <h1 className="text-xl font-bold text-gray-900 text-center mb-6">
            {swipePage.title}
          </h1>
        )}

        {/* カルーセル */}
        <SwipeCarousel
          cards={swipePage.cards}
          settings={settings.carousel}
          aspectRatio={swipePage.aspect_ratio}
        />

        {/* 決済ボタン（カルーセル直下） */}
        {settings.payment.paymentType === 'payment' && (
          <div className="mt-6">
            <button
              onClick={handlePayment}
              disabled={checkoutLoading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {checkoutLoading ? (
                '処理中...'
              ) : (
                <>
                  {settings.payment.paymentProvider === 'external' ? (
                    <ExternalLink className="w-5 h-5" />
                  ) : (
                    <ShoppingCart className="w-5 h-5" />
                  )}
                  {settings.payment.ctaText || '購入する'}
                  {settings.payment.price ? ` - ¥${settings.payment.price.toLocaleString()}` : ''}
                </>
              )}
            </button>
          </div>
        )}

        {/* LP部分（ブロック） */}
        {swipePage.content && swipePage.content.length > 0 && (
          <div className="mt-8 space-y-4">
            {swipePage.content.map(block => (
              <BlockRenderer
                key={block.id}
                block={block}
                variant="profile"
              />
            ))}
          </div>
        )}

        {/* フッター */}
        {!settings.hideFooter && (
          <footer className="mt-12 text-center text-xs text-gray-400 pb-8">
            <p>Powered by 集客メーカー</p>
          </footer>
        )}
      </div>
    </div>
  );
}
