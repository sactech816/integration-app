'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Edit3, MessageSquare, Lightbulb, CheckCircle, AlertTriangle,
  Loader2, AlertCircle, Filter, Plus, X, RefreshCw
} from 'lucide-react';
import FeedbackPanel from './FeedbackPanel';

type FeedbackType = 'comment' | 'suggestion' | 'approval' | 'revision_request';
type FeedbackStatus = 'pending' | 'read' | 'resolved' | 'dismissed';

interface Feedback {
  id: string;
  book_id: string;
  section_id: string | null;
  agency_user_id: string;
  feedback_type: FeedbackType;
  content: string;
  quoted_text: string | null;
  status: FeedbackStatus;
  user_response: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
  book_title: string;
  section_title: string;
  user_email: string;
}

interface AgencyFeedbackViewProps {
  agencyId: string;
  accessToken: string;
  initialBookId?: string;
  initialSectionId?: string;
}

const FEEDBACK_TYPE_CONFIG: Record<FeedbackType, { label: string; icon: React.ReactNode; color: string }> = {
  comment: { label: 'コメント', icon: <MessageSquare size={14} />, color: 'blue' },
  suggestion: { label: '提案', icon: <Lightbulb size={14} />, color: 'amber' },
  approval: { label: '承認', icon: <CheckCircle size={14} />, color: 'green' },
  revision_request: { label: '修正依頼', icon: <AlertTriangle size={14} />, color: 'red' },
};

const STATUS_CONFIG: Record<FeedbackStatus, { label: string; color: string }> = {
  pending: { label: '未読', color: 'bg-gray-100 text-gray-600' },
  read: { label: '既読', color: 'bg-blue-100 text-blue-600' },
  resolved: { label: '解決', color: 'bg-green-100 text-green-600' },
  dismissed: { label: '却下', color: 'bg-red-100 text-red-600' },
};

export default function AgencyFeedbackView({
  agencyId,
  accessToken,
  initialBookId,
  initialSectionId,
}: AgencyFeedbackViewProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | ''>('');
  const [showNewFeedback, setShowNewFeedback] = useState(false);
  const [selectedBookId, setSelectedBookId] = useState(initialBookId || '');
  const [selectedSectionId, setSelectedSectionId] = useState(initialSectionId || '');

  const fetchFeedbacks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(
        `/api/kdl/agency/feedbacks?${params.toString()}`,
        { headers: { 'Authorization': `Bearer ${accessToken}` } }
      );
      if (!response.ok) throw new Error('フィードバックの取得に失敗しました');
      const data = await response.json();
      setFeedbacks(data.feedbacks || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, statusFilter]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  // 初期表示でbook_idが指定されていた場合、新規作成パネルを開く
  useEffect(() => {
    if (initialBookId) {
      setShowNewFeedback(true);
    }
  }, [initialBookId]);

  const handleSubmitFeedback = async (data: {
    feedbackType: FeedbackType;
    content: string;
    quotedText?: string;
  }) => {
    const response = await fetch('/api/kdl/agency/feedbacks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        book_id: selectedBookId,
        section_id: selectedSectionId || null,
        feedback_type: data.feedbackType,
        content: data.content,
        quoted_text: data.quotedText,
      }),
    });

    if (!response.ok) throw new Error('フィードバックの送信に失敗しました');

    setShowNewFeedback(false);
    setSelectedBookId('');
    setSelectedSectionId('');
    fetchFeedbacks();
  };

  const getTypeBadgeStyles = (type: FeedbackType) => {
    const color = FEEDBACK_TYPE_CONFIG[type]?.color || 'gray';
    switch (color) {
      case 'blue': return 'bg-blue-100 text-blue-700';
      case 'amber': return 'bg-amber-100 text-amber-700';
      case 'green': return 'bg-green-100 text-green-700';
      case 'red': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 統計
  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter(f => f.status === 'pending').length,
    read: feedbacks.filter(f => f.status === 'read').length,
    resolved: feedbacks.filter(f => f.status === 'resolved').length,
  };

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">添削・フィードバック</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>合計 {stats.total}件</span>
              <span className="text-amber-600">未読 {stats.pending}件</span>
              <span className="text-green-600">解決 {stats.resolved}件</span>
            </div>
          </div>
          <button
            onClick={() => setShowNewFeedback(!showNewFeedback)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
          >
            {showNewFeedback ? <X size={16} /> : <Plus size={16} />}
            {showNewFeedback ? '閉じる' : '新規フィードバック'}
          </button>
        </div>
      </div>

      {/* 新規フィードバック作成パネル */}
      {showNewFeedback && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">書籍ID</label>
              <input
                type="text"
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="対象書籍のIDを入力"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">節ID（任意）</label>
              <input
                type="text"
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="対象節のID（任意）"
              />
            </div>
          </div>
          {selectedBookId && (
            <FeedbackPanel
              bookId={selectedBookId}
              sectionId={selectedSectionId || undefined}
              onSubmit={handleSubmitFeedback}
              onClose={() => {
                setShowNewFeedback(false);
                setSelectedBookId('');
                setSelectedSectionId('');
              }}
            />
          )}
        </div>
      )}

      {/* フィルター */}
      <div className="flex items-center gap-3">
        <Filter size={16} className="text-gray-400" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FeedbackStatus | '')}
          className="text-sm text-gray-900 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">すべてのステータス</option>
          <option value="pending">未読</option>
          <option value="read">既読</option>
          <option value="resolved">解決</option>
          <option value="dismissed">却下</option>
        </select>
        <button
          onClick={fetchFeedbacks}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="更新"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* フィードバック一覧 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-amber-500" size={32} />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertCircle className="text-red-400 mx-auto mb-2" size={32} />
          <p className="text-red-600">{error}</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-12 text-center">
          <Edit3 className="text-gray-300 mx-auto mb-4" size={48} />
          <h3 className="text-lg font-bold text-gray-700 mb-2">フィードバックはまだありません</h3>
          <p className="text-gray-500">「新規フィードバック」からフィードバックを追加できます</p>
        </div>
      ) : (
        <div className="space-y-3">
          {feedbacks.map(feedback => (
            <div
              key={feedback.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:border-amber-200 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeStyles(feedback.feedback_type)}`}>
                    {FEEDBACK_TYPE_CONFIG[feedback.feedback_type]?.icon}
                    {FEEDBACK_TYPE_CONFIG[feedback.feedback_type]?.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_CONFIG[feedback.status]?.color}`}>
                    {STATUS_CONFIG[feedback.status]?.label}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDate(feedback.created_at)}
                </span>
              </div>

              <div className="text-xs text-gray-500 mb-2">
                <span className="font-medium">{feedback.user_email}</span>
                {' / '}
                <span>{feedback.book_title}</span>
                {feedback.section_title && (
                  <span> / {feedback.section_title}</span>
                )}
              </div>

              {feedback.quoted_text && (
                <div className="bg-amber-50 border-l-2 border-amber-300 px-3 py-2 rounded-r-lg mb-2">
                  <p className="text-sm text-amber-800 italic">"{feedback.quoted_text}"</p>
                </div>
              )}

              <p className="text-sm text-gray-700 whitespace-pre-wrap">{feedback.content}</p>

              {feedback.user_response && (
                <div className="mt-3 bg-blue-50 border-l-2 border-blue-300 px-3 py-2 rounded-r-lg">
                  <p className="text-xs text-blue-600 font-medium mb-1">ユーザーからの返信:</p>
                  <p className="text-sm text-blue-800">{feedback.user_response}</p>
                  {feedback.responded_at && (
                    <p className="text-xs text-blue-600 mt-1">{formatDate(feedback.responded_at)}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
