'use client';

import React, { useState } from 'react';
import { 
  MessageSquare, Send, CheckCircle, AlertTriangle, 
  Lightbulb, Check, X, Loader2 
} from 'lucide-react';

type FeedbackType = 'comment' | 'suggestion' | 'approval' | 'revision_request';

interface FeedbackPanelProps {
  bookId: string;
  sectionId?: string;
  sectionTitle?: string;
  quotedText?: string;
  onSubmit: (data: {
    feedbackType: FeedbackType;
    content: string;
    quotedText?: string;
  }) => Promise<void>;
  onClose?: () => void;
}

const FEEDBACK_TYPES: { type: FeedbackType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: 'comment', label: 'コメント', icon: <MessageSquare size={16} />, color: 'blue' },
  { type: 'suggestion', label: '提案', icon: <Lightbulb size={16} />, color: 'amber' },
  { type: 'approval', label: '承認', icon: <CheckCircle size={16} />, color: 'green' },
  { type: 'revision_request', label: '修正依頼', icon: <AlertTriangle size={16} />, color: 'red' },
];

export default function FeedbackPanel({
  bookId,
  sectionId,
  sectionTitle,
  quotedText: initialQuotedText,
  onSubmit,
  onClose,
}: FeedbackPanelProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('comment');
  const [content, setContent] = useState('');
  const [quotedText, setQuotedText] = useState(initialQuotedText || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQuoteInput, setShowQuoteInput] = useState(!!initialQuotedText);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        feedbackType,
        content: content.trim(),
        quotedText: quotedText.trim() || undefined,
      });
      
      // 送信成功後にフォームをリセット
      setContent('');
      setQuotedText('');
      setShowQuoteInput(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeStyles = (type: FeedbackType) => {
    const config = FEEDBACK_TYPES.find(t => t.type === type);
    const isSelected = feedbackType === type;
    
    switch (config?.color) {
      case 'blue':
        return isSelected 
          ? 'bg-blue-100 border-blue-400 text-blue-700' 
          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-blue-50';
      case 'amber':
        return isSelected 
          ? 'bg-amber-100 border-amber-400 text-amber-700' 
          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-amber-50';
      case 'green':
        return isSelected 
          ? 'bg-green-100 border-green-400 text-green-700' 
          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-green-50';
      case 'red':
        return isSelected 
          ? 'bg-red-100 border-red-400 text-red-700' 
          : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-red-50';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
      {/* ヘッダー */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div>
          <h3 className="font-bold text-gray-900">フィードバック</h3>
          {sectionTitle && (
            <p className="text-sm text-gray-500">対象: {sectionTitle}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={18} className="text-gray-500" />
          </button>
        )}
      </div>

      {/* コンテンツ */}
      <div className="p-4 space-y-4">
        {/* フィードバックタイプ選択 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            種類
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FEEDBACK_TYPES.map((type) => (
              <button
                key={type.type}
                onClick={() => setFeedbackType(type.type)}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${getTypeStyles(type.type)}`}
              >
                {type.icon}
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 引用テキスト */}
        {showQuoteInput ? (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                引用箇所（任意）
              </label>
              <button
                onClick={() => {
                  setShowQuoteInput(false);
                  setQuotedText('');
                }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >
                削除
              </button>
            </div>
            <textarea
              value={quotedText}
              onChange={(e) => setQuotedText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              rows={2}
              placeholder="該当箇所のテキストを貼り付け"
            />
          </div>
        ) : (
          <button
            onClick={() => setShowQuoteInput(true)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            + 引用箇所を追加
          </button>
        )}

        {/* フィードバック内容 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            内容 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="フィードバックを入力してください..."
          />
        </div>
      </div>

      {/* フッター */}
      <div className="flex items-center justify-end gap-3 px-4 py-3 bg-gray-50 border-t border-gray-200">
        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
          >
            キャンセル
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || !content.trim()}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isSubmitting || !content.trim()
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              送信中...
            </>
          ) : (
            <>
              <Send size={16} />
              送信
            </>
          )}
        </button>
      </div>
    </div>
  );
}
