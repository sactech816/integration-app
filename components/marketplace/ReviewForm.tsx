'use client';

import React, { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';

interface ReviewFormProps {
  orderId: string;
  accessToken: string;
  onSubmitted: () => void;
}

export default function ReviewForm({ orderId, accessToken, onSubmitted }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError('評価を選択してください'); return; }

    setSaving(true);
    setError('');

    try {
      const res = await fetch('/api/marketplace/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          order_id: orderId,
          rating,
          comment: comment.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'レビュー投稿に失敗しました');
      }

      onSubmitted();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-yellow-50 rounded-xl p-4 space-y-4">
      <h4 className="font-semibold text-gray-900 text-sm">レビューを投稿</h4>

      {error && (
        <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-sm">{error}</div>
      )}

      {/* 星評価 */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoveredRating(n)}
            onMouseLeave={() => setHoveredRating(0)}
            className="p-0.5"
          >
            <Star
              className={`w-7 h-7 transition-colors ${
                n <= (hoveredRating || rating)
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
        {rating > 0 && <span className="text-sm text-gray-500 ml-2">{rating}/5</span>}
      </div>

      {/* コメント */}
      <textarea
        value={comment}
        onChange={e => setComment(e.target.value)}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
        placeholder="感想やフィードバックを記入してください（任意）"
      />

      <button
        type="submit"
        disabled={saving || rating === 0}
        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        レビューを投稿
      </button>
    </form>
  );
}
