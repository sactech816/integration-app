'use client';

import { useState } from 'react';
import { X, Star, Loader2, Send, MessageSquareHeart, Link2 } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { email?: string; id?: string } | null;
  onLoginRequest: () => void;
}

export default function FeedbackModal({ isOpen, onClose, user, onLoginRequest }: FeedbackModalProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState('');
  const [toolUrls, setToolUrls] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!user) {
      onLoginRequest();
      return;
    }

    if (rating === 0) {
      setError('満足度を選択してください');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: (user as { id?: string }).id,
          userEmail: user.email,
          rating,
          message,
          toolUrls: toolUrls || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '送信に失敗しました');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setMessage('');
    setToolUrls('');
    setSubmitted(false);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" onClick={handleClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="relative text-center pt-8 pb-4 px-6">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition p-1"
          >
            <X size={20} />
          </button>
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}
          >
            <MessageSquareHeart size={32} className="text-white" />
          </div>
          <h3 className="text-xl font-bold" style={{ color: '#1f2937' }}>ご意見箱</h3>
          <p className="text-sm text-gray-500 mt-1">あなたの声が、次のアップデートにつながります</p>
        </div>

        {submitted ? (
          /* 送信完了 */
          <div className="px-6 pb-8 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#dcfce7' }}>
              <span className="text-3xl">🎉</span>
            </div>
            <h4 className="text-lg font-bold mb-2" style={{ color: '#1f2937' }}>届きました！</h4>
            <p className="text-sm text-gray-600 mb-6">
              貴重なお声をありがとうございます。<br />より良いサービスづくりに役立てます。
            </p>
            <button
              onClick={handleClose}
              className="px-8 py-3 rounded-full font-bold text-white transition hover:-translate-y-0.5"
              style={{ backgroundColor: '#6366f1' }}
            >
              閉じる
            </button>
          </div>
        ) : (
          /* フォーム */
          <div className="px-6 pb-6">
            {/* 満足度 */}
            <div className="mb-6">
              <p className="font-bold text-sm mb-1 text-center" style={{ color: '#1f2937' }}>使ってみてどうでしたか？</p>
              <p className="text-xs text-gray-400 text-center mb-3">星をタップしてください</p>
              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHoverRating(n)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      size={36}
                      fill={(hoverRating || rating) >= n ? '#f59e0b' : 'none'}
                      stroke={(hoverRating || rating) >= n ? '#f59e0b' : '#d1d5db'}
                      strokeWidth={1.5}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* コメント */}
            <div className="mb-4">
              <label className="block font-bold text-sm mb-2" style={{ color: '#1f2937' }}>
                もっとこうなったらいいな <span className="font-normal text-gray-400">(任意)</span>
              </label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                maxLength={500}
                rows={4}
                className="w-full border-2 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-indigo-400 transition"
                style={{ borderColor: '#e5e7eb' }}
                placeholder="「こんな機能がほしい」「ここが使いにくかった」など、なんでもOKです！"
              />
              <p className="text-xs text-gray-400 text-right mt-1">{message.length} / 500</p>
            </div>

            {/* 作成ツールURL */}
            <div className="mb-5">
              <label className="block font-bold text-sm mb-2" style={{ color: '#1f2937' }}>
                <span className="inline-flex items-center gap-1.5">
                  <Link2 size={14} style={{ color: '#f97316' }} />
                  作成したツールのURL <span className="font-normal text-gray-400">(任意・複数可)</span>
                </span>
              </label>
              <textarea
                value={toolUrls}
                onChange={e => setToolUrls(e.target.value)}
                rows={2}
                className="w-full border-2 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-indigo-400 transition"
                style={{ borderColor: '#e5e7eb' }}
                placeholder="https://makers.tokyo/profile/v275Z"
              />
              <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                ご意見の対象となる作品があれば、URLを貼っていただけると確認がスムーズです。
              </p>
            </div>

            {/* エラー */}
            {error && (
              <p className="text-sm text-red-500 text-center mb-4 font-bold">{error}</p>
            )}

            {/* 送信ボタン */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full text-white font-bold py-3.5 px-6 rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}
            >
              {isSubmitting ? (
                <><Loader2 className="animate-spin" size={18} />送信中...</>
              ) : (
                <><Send size={18} />送信する</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
