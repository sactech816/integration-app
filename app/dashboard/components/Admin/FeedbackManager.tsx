'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquareHeart, Trash2, Star, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Feedback = {
  id: string;
  user_id: string | null;
  user_email: string | null;
  rating: number;
  message: string | null;
  tool_urls: string | null;
  created_at: string;
};

const ITEMS_PER_PAGE = 10;

export default function FeedbackManager() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const fetchFeedbacks = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const response = await fetch('/api/admin/feedbacks', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setFeedbacks(result.data || []);
      }
    } catch (error) {
      console.error('Feedback fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  const handleDelete = async (id: string) => {
    if (!confirm('このフィードバックを削除しますか？')) return;
    if (!supabase) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      const response = await fetch('/api/admin/feedbacks', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setFeedbacks(prev => prev.filter(f => f.id !== id));
      }
    } catch (error) {
      console.error('Feedback delete error:', error);
    }
  };

  const filtered = filterRating
    ? feedbacks.filter(f => f.rating === filterRating)
    : feedbacks;

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const avgRating = feedbacks.length > 0
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : '-';

  const ratingCounts = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: feedbacks.filter(f => f.rating === r).length,
  }));

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-black border-l-4 border-red-600 pl-4 flex items-center gap-2">
          <MessageSquareHeart size={20} className="text-red-600" /> ご意見箱
          <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">ADMIN</span>
        </h2>
        <button
          onClick={fetchFeedbacks}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700"
        >
          更新
        </button>
      </div>

      {/* サマリー */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-2xl font-black text-gray-900">{feedbacks.length}</p>
          <p className="text-xs text-gray-500">総件数</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center">
          <p className="text-2xl font-black text-amber-500">{avgRating}</p>
          <p className="text-xs text-gray-500">平均評価</p>
        </div>
        {ratingCounts.slice(0, 2).map(({ rating, count }) => (
          <div key={rating} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-center">
            <p className="text-2xl font-black text-gray-900">{count}</p>
            <p className="text-xs text-gray-500">{'★'.repeat(rating)} ({rating})</p>
          </div>
        ))}
      </div>

      {/* 評価フィルタ */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => { setFilterRating(null); setPage(1); }}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
            filterRating === null ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          すべて ({feedbacks.length})
        </button>
        {ratingCounts.map(({ rating, count }) => (
          <button
            key={rating}
            onClick={() => { setFilterRating(rating); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${
              filterRating === rating ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {'★'.repeat(rating)} ({count})
          </button>
        ))}
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
          {filterRating ? `★${filterRating} のフィードバック: ${filtered.length} 件` : `全 ${feedbacks.length} 件`}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            フィードバックはまだありません
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {paginated.map((feedback) => (
              <div key={feedback.id} className="p-4 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* 評価と日時 */}
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(n => (
                          <Star
                            key={n}
                            size={16}
                            fill={n <= feedback.rating ? '#f59e0b' : 'none'}
                            stroke={n <= feedback.rating ? '#f59e0b' : '#d1d5db'}
                            strokeWidth={1.5}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(feedback.created_at).toLocaleDateString('ja-JP', {
                          year: 'numeric', month: 'short', day: 'numeric',
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* メールアドレス */}
                    <p className="text-xs text-gray-500 mb-1">{feedback.user_email || '不明'}</p>

                    {/* メッセージ */}
                    {feedback.message && (
                      <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-xl p-3 mb-2">
                        {feedback.message}
                      </p>
                    )}

                    {/* ツールURL */}
                    {feedback.tool_urls && (
                      <div className="flex flex-wrap gap-2">
                        {feedback.tool_urls.split('\n').filter(Boolean).map((url, i) => (
                          <a
                            key={i}
                            href={url.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline bg-indigo-50 px-2 py-1 rounded"
                          >
                            <ExternalLink size={12} />
                            {url.trim().length > 50 ? url.trim().slice(0, 50) + '...' : url.trim()}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 削除ボタン */}
                  <button
                    onClick={() => handleDelete(feedback.id)}
                    className="text-gray-300 hover:text-red-500 transition p-1 flex-shrink-0"
                    title="削除"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ページネーション */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 text-xs font-bold rounded bg-white border border-gray-200 disabled:opacity-40"
            >
              前へ
            </button>
            <span className="text-xs text-gray-500">{page} / {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1 text-xs font-bold rounded bg-white border border-gray-200 disabled:opacity-40"
            >
              次へ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
