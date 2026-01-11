'use client';

import React, { useState } from 'react';
import { saveLead } from '@/app/actions/leads';
import { ContentType } from '@/app/actions/analytics';
import { CheckCircle, Loader2, Mail } from 'lucide-react';

interface LeadFormProps {
  contentId: string;
  contentType: ContentType;
  title?: string;
  buttonText?: string;
  resultType?: string;
  showName?: boolean;
  showPhone?: boolean;
  showMessage?: boolean;
  onSuccess?: () => void;
  className?: string;
  variant?: 'card' | 'inline' | 'modal';
}

/**
 * リード獲得フォームコンポーネント
 */
export function LeadForm({
  contentId,
  contentType,
  title = 'メールアドレスを登録',
  buttonText = '登録する',
  resultType,
  showName = false,
  showPhone = false,
  showMessage = false,
  onSuccess,
  className = '',
  variant = 'card'
}: LeadFormProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await saveLead(contentId, contentType, email, {
        name: showName ? name : undefined,
        phone: showPhone ? phone : undefined,
        message: showMessage ? message : undefined,
        resultType
      });

      if (result.success) {
        setIsSubmitted(true);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.error || '登録に失敗しました');
      }
    } catch {
      setError('エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 送信完了後の表示
  if (isSubmitted) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">登録完了！</h3>
        <p className="text-gray-600">ご登録ありがとうございます。</p>
      </div>
    );
  }

  // バリアント別のスタイル
  const containerClass = {
    card: 'bg-white rounded-2xl shadow-lg p-6',
    inline: 'bg-transparent',
    modal: 'bg-white rounded-2xl p-8'
  }[variant];

  return (
    <div className={`${containerClass} ${className}`}>
      {title && variant !== 'inline' && (
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{title}</h3>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 名前フィールド */}
        {showName && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              お名前
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="山田 太郎"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        )}

        {/* メールフィールド */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@email.com"
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>

        {/* 電話番号フィールド */}
        {showPhone && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              電話番号
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="090-1234-5678"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        )}

        {/* メッセージフィールド */}
        {showMessage && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メッセージ
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="ご質問・ご相談があればお書きください"
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>
        )}

        {/* エラーメッセージ */}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={isSubmitting || !email}
          className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              送信中...
            </>
          ) : (
            buttonText
          )}
        </button>

        {/* プライバシーポリシー */}
        <p className="text-xs text-gray-500 text-center">
          登録することで、プライバシーポリシーに同意したものとみなします。
        </p>
      </form>
    </div>
  );
}

export default LeadForm;








































































































