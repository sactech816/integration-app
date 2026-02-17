'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { MarketplaceReview } from '@/lib/types';

interface ReviewListProps {
  reviews: MarketplaceReview[];
}

export default function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-4">レビューはまだありません</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
          <div className="flex items-center gap-2 mb-1">
            {/* 星 */}
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`w-3.5 h-3.5 ${
                    n <= review.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">
              {new Date(review.created_at).toLocaleDateString('ja-JP')}
            </span>
          </div>
          {review.comment && (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
}
