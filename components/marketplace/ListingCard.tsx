'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, ShoppingBag } from 'lucide-react';
import { MarketplaceListing } from '@/lib/types';
import { CATEGORY_MAP, PRICE_TYPE_LABELS } from '@/constants/marketplace';

interface ListingCardProps {
  listing: MarketplaceListing;
}

function formatPrice(listing: MarketplaceListing): string {
  if (listing.price_type === 'negotiable') return '要相談';
  const min = listing.price_min.toLocaleString();
  if (listing.price_type === 'range' && listing.price_max) {
    return `¥${min}〜¥${listing.price_max.toLocaleString()}`;
  }
  return `¥${min}`;
}

function ListingCard({ listing }: ListingCardProps) {
  const category = CATEGORY_MAP[listing.category];
  const profile = listing.seller_profile;

  return (
    <Link
      href={`/marketplace/${listing.id}`}
      className="block bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all overflow-hidden"
    >
      {/* サムネイル */}
      {listing.thumbnail_url ? (
        <div className="aspect-video bg-gray-100 overflow-hidden relative">
          <Image
            src={listing.thumbnail_url}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="aspect-video bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
          <span className="text-4xl opacity-30">
            {category?.isToolLinked ? '🔧' : '📋'}
          </span>
        </div>
      )}

      <div className="p-4">
        {/* カテゴリタグ */}
        {category && (
          <span className={`inline-block text-xs px-2 py-0.5 rounded-full mb-2 ${
            category.isToolLinked
              ? 'bg-indigo-50 text-indigo-600'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {category.label}
          </span>
        )}

        {/* タイトル */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 text-sm leading-snug">
          {listing.title}
        </h3>

        {/* 出品者情報 */}
        {profile && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs overflow-hidden">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                profile.display_name.charAt(0)
              )}
            </div>
            <span className="text-xs text-gray-600 truncate">{profile.display_name}</span>
            {profile.avg_rating > 0 && (
              <div className="flex items-center gap-0.5 ml-auto">
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                <span className="text-xs text-gray-600">{profile.avg_rating}</span>
              </div>
            )}
          </div>
        )}

        {/* 価格・納期 */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{formatPrice(listing)}</span>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {listing.delivery_days && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {listing.delivery_days}日
              </span>
            )}
            {listing.order_count > 0 && (
              <span className="flex items-center gap-1">
                <ShoppingBag className="w-3 h-3" />
                {listing.order_count}件
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default React.memo(ListingCard);
