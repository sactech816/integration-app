'use client';

import { useState } from 'react';
import { getReferralCode } from '@/components/affiliate/AffiliateTracker';
import {
  Crown,
  X,
  Sparkles,
  Check,
  CreditCard,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface ProPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { email?: string; id?: string } | null;
  onShowAuth: () => void;
}

export default function ProPlanModal({ isOpen, onClose, user, onShowAuth }: ProPlanModalProps) {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  if (!isOpen) return null;

  const handleProPlanCheckout = async () => {
    setIsProcessingPayment(true);
    try {
      const email = user?.email;
      const referralCode = getReferralCode();
      if (referralCode && email) {
        try {
          await fetch('/api/affiliate/pending', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              referralCode,
              service: 'makers',
              planTier: 'pro',
              planPeriod: 'monthly',
              userId: user?.id || null,
            }),
          });
        } catch (err) {
          console.warn('Failed to save pending affiliate:', err);
        }
      }
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: 'makers_pro_monthly',
          userId: user?.id || null,
          email: email || null,
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        alert('決済ページの準備中です。しばらくお待ちください。');
      }
    } catch (error) {
      console.error('決済エラー:', error);
      alert('決済の開始に失敗しました。もう一度お試しください。');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="sticky top-0 text-white px-6 py-5 flex justify-between items-center z-10 rounded-t-3xl"
          style={{ backgroundColor: '#f97316' }}
        >
          <div className="flex items-center gap-3">
            <Crown size={24} />
            <h3 className="font-bold text-xl">プロプラン</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition p-1"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <div className="text-center mb-6">
            <div className="text-4xl font-black" style={{ color: '#5d4037' }}>
              ¥3,980
              <span className="text-lg font-normal text-gray-500">/月</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">税込 / いつでも解約可能</p>
          </div>
          <div className="rounded-2xl p-5 mb-6" style={{ backgroundColor: '#fffbf0' }}>
            <h4
              className="font-bold mb-4 flex items-center gap-2"
              style={{ color: '#5d4037' }}
            >
              <Sparkles size={18} style={{ color: '#f97316' }} />
              プロプランで使える機能
            </h4>
            <ul className="space-y-3">
              {[
                { text: 'フリープランの全機能', highlight: false },
                { text: 'アクセス解析', highlight: true },
                { text: 'AI利用（優先・回数無制限）', highlight: true },
                { text: 'HTMLダウンロード', highlight: true },
                { text: '埋め込みコード発行', highlight: true },
                { text: '広告非表示', highlight: true },
                { text: '優先サポート', highlight: true },
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <Check
                    size={18}
                    style={{ color: item.highlight ? '#f97316' : '#84cc16' }}
                  />
                  <span
                    className={`text-sm ${item.highlight ? 'font-bold' : ''}`}
                    style={{ color: '#5d4037' }}
                  >
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
          {!user && (
            <div
              className="border rounded-2xl p-4 mb-6"
              style={{ backgroundColor: '#fffbf0', borderColor: '#ffedd5' }}
            >
              <p className="text-sm" style={{ color: '#5d4037' }}>
                <span className="font-bold">ヒント：</span>
                ログインすると、購入履歴がアカウントに紐付けられます。
              </p>
              <button
                onClick={onShowAuth}
                className="mt-2 text-sm font-bold hover:underline"
                style={{ color: '#f97316' }}
              >
                ログイン / 新規登録はこちら →
              </button>
            </div>
          )}
          <button
            onClick={handleProPlanCheckout}
            disabled={isProcessingPayment}
            className="w-full text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1 transform"
            style={{ backgroundColor: '#f97316' }}
          >
            {isProcessingPayment ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                処理中...
              </>
            ) : (
              <>
                <CreditCard size={20} />
                決済ページへ進む
                <ExternalLink size={16} />
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 text-center mt-4">
            Stripeによる安全な決済処理。カード情報は当サイトに保存されません。
          </p>
        </div>
      </div>
    </div>
  );
}
