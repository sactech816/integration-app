'use client';

import React, { useState } from 'react';
import { ContentType } from '@/app/actions/analytics';
import { Heart, Loader2, X } from 'lucide-react';

interface DonationButtonProps {
  contentId: string;
  contentType: ContentType;
  className?: string;
  buttonText?: string;
  variant?: 'default' | 'compact' | 'floating';
}

const DONATION_AMOUNTS = [100, 300, 500, 1000, 3000, 5000];

/**
 * 寄付ボタンコンポーネント
 */
export function DonationButton({
  contentId,
  contentType,
  className = '',
  buttonText = '応援する',
  variant = 'default'
}: DonationButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDonate = async () => {
    const amount = selectedAmount || parseInt(customAmount, 10);
    
    if (!amount || amount < 100) {
      setError('100円以上で金額を指定してください');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          contentId,
          contentType,
          successUrl: `${window.location.origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: window.location.href
        })
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || '決済ページへの移動に失敗しました');
        setIsLoading(false);
      }
    } catch {
      setError('エラーが発生しました');
      setIsLoading(false);
    }
  };

  // バリアント別のボタンスタイル
  const buttonStyles = {
    default: 'bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2',
    compact: 'bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-lg text-sm flex items-center gap-1',
    floating: 'fixed bottom-6 right-6 bg-pink-500 hover:bg-pink-600 text-white font-bold py-4 px-6 rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center gap-2 z-50'
  };

  return (
    <>
      {/* 寄付ボタン */}
      <button
        onClick={() => setIsModalOpen(true)}
        className={`${buttonStyles[variant]} ${className}`}
      >
        <Heart size={variant === 'compact' ? 16 : 20} />
        {buttonText}
      </button>

      {/* モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-scale-in">
            {/* 閉じるボタン */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            {/* ヘッダー */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="text-pink-500" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">作成者を応援する</h3>
              <p className="text-gray-600 text-sm mt-2">
                このコンテンツが役に立った場合は、ぜひ作成者を応援してください！
              </p>
            </div>

            {/* 金額選択 */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-3">金額を選択</p>
              <div className="grid grid-cols-3 gap-2">
                {DONATION_AMOUNTS.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount('');
                    }}
                    className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                      selectedAmount === amount
                        ? 'bg-pink-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    ¥{amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* カスタム金額 */}
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 mb-2">またはカスタム金額</p>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">¥</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => {
                    setCustomAmount(e.target.value);
                    setSelectedAmount(null);
                  }}
                  placeholder="500"
                  min="100"
                  className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <p className="text-red-500 text-sm text-center mb-4">{error}</p>
            )}

            {/* 送信ボタン */}
            <button
              onClick={handleDonate}
              disabled={isLoading || (!selectedAmount && !customAmount)}
              className="w-full bg-pink-500 text-white font-bold py-4 rounded-xl hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  処理中...
                </>
              ) : (
                <>
                  <Heart size={20} />
                  ¥{(selectedAmount || parseInt(customAmount, 10) || 0).toLocaleString()} で応援する
                </>
              )}
            </button>

            {/* 注意書き */}
            <p className="text-xs text-gray-500 text-center mt-4">
              決済はStripeで安全に処理されます
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default DonationButton;





























