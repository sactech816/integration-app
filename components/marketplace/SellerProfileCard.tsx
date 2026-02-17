'use client';

import React from 'react';
import { Star, Clock, ShoppingBag, ExternalLink } from 'lucide-react';
import { MarketplaceProfile } from '@/lib/types';

interface SellerProfileCardProps {
  profile: MarketplaceProfile;
  compact?: boolean;
}

export default function SellerProfileCard({ profile, compact = false }: SellerProfileCardProps) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-start gap-4">
        {/* アバター */}
        <div className={`${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold ${compact ? 'text-lg' : 'text-xl'} overflow-hidden flex-shrink-0`}>
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            profile.display_name.charAt(0)
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-gray-900 ${compact ? 'text-base' : 'text-lg'}`}>
            {profile.display_name}
          </h3>

          {/* 評価・実績 */}
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            {profile.avg_rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {profile.avg_rating}
                <span className="text-gray-400">({profile.total_reviews})</span>
              </span>
            )}
            {profile.total_orders > 0 && (
              <span className="flex items-center gap-1">
                <ShoppingBag className="w-4 h-4" />
                {profile.total_orders}件の実績
              </span>
            )}
            {profile.response_time && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {profile.response_time}
              </span>
            )}
          </div>
        </div>
      </div>

      {!compact && (
        <>
          {/* 自己紹介 */}
          {profile.bio && (
            <p className="mt-4 text-gray-600 text-sm whitespace-pre-wrap">{profile.bio}</p>
          )}

          {/* スキル */}
          {profile.skills.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {profile.skills.map((skill, i) => (
                <span key={i} className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs">
                  {skill}
                </span>
              ))}
            </div>
          )}

          {/* ポートフォリオ */}
          {profile.portfolio_urls.length > 0 && (
            <div className="mt-4 space-y-1">
              <span className="text-xs font-medium text-gray-500">ポートフォリオ</span>
              {profile.portfolio_urls.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  {url}
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
