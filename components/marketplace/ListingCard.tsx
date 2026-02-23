'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Clock, ShoppingBag, ArrowUpRight } from 'lucide-react';
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
      className="group block bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-50 transition-all duration-300 overflow-hidden"
    >
      {/* サムネイル */}
      <div className="relative">
        {listing.thumbnail_url ? (
          <div className="aspect-[16/10] bg-gray-100 overflow-hidden relative">
            <Image
              src={listing.thumbnail_url}
              alt={listing.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="aspect-[16/10] bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center relative">
            <div className="w-14 h-14 bg-white/60 rounded-2xl flex items-center justify-center shadow-sm">
              <span className="text-3xl">
                {category?.isToolLinked ? '🔧' : '📋'}
              </span>
            </div>
          </div>
        )}

        {/* カテゴリバッジ（サムネイル上） */}
        {category && (
          <div className="absolute top-3 left-3">
            <span className={`inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-lg backdrop-blur-md ${
              category.isToolLinked
                ? 'bg-indigo-500/80 text-white'
                : 'bg-white/80 text-gray-700'
            }`}>
              {category.label}
            </span>
          </div>
        )}

        {/* ホバー時の矢印アイコン */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm">
            <ArrowUpRight className="w-4 h-4 text-indigo-600" />
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* タイトル */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-3 text-sm leading-snug group-hover:text-indigo-700 transition-colors">
          {listing.title}
        </h3>

        {/* 出品者情報 */}
        {profile && (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-xs font-semibold text-indigo-600 overflow-hidden ring-2 ring-white">
              {profile.avatar_url ? (
                <Image src={profile.avatar_url} alt="" width={28} height={28} className="w-full h-full object-cover" />
              ) : (
                profile.display_name.charAt(0)
              )}
            </div>
            <span className="text-xs text-gray-600 truncate font-medium">{profile.display_name}</span>
            {profile.avg_rating > 0 && (
              <div className="flex items-center gap-0.5 ml-auto bg-yellow-50 px-1.5 py-0.5 rounded-md">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span className="text-xs text-yellow-700 font-semibold">{profile.avg_rating}</span>
              </div>
            )}
          </div>
        )}

        {/* 区切り線 */}
        <div className="border-t border-gray-100 pt-3">
          {/* 価格・納期 */}
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {formatPrice(listing)}
            </span>
            <div className="flex items-center gap-3 text-xs text-gray-400">
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
      </div>
    </Link>
  );
}

export default React.memo(ListingCard);
