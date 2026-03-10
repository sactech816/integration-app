'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, Briefcase, ArrowRight } from 'lucide-react';
import { MarketplaceProfile } from '@/lib/types';
import { SUPPORTED_TOOLS_MAP } from '@/constants/marketplace';

interface CreatorCardProps {
  creator: MarketplaceProfile & { listing_count?: number };
}

export default function CreatorCard({ creator }: CreatorCardProps) {
  return (
    <Link
      href={`/marketplace/creators/${creator.user_id}`}
      className="group bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-indigo-200 transition-all"
    >
      {/* ヘッダー: アバター + 名前 */}
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-xl overflow-hidden flex-shrink-0">
          {creator.avatar_url ? (
            <Image src={creator.avatar_url} alt="" width={56} height={56} className="w-full h-full object-cover" />
          ) : (
            creator.display_name.charAt(0)
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base group-hover:text-indigo-600 transition-colors truncate">
            {creator.display_name}
          </h3>
          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
            {creator.avg_rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                {creator.avg_rating}
                <span className="text-gray-400">({creator.total_reviews})</span>
              </span>
            )}
            {creator.total_orders > 0 && (
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                {creator.total_orders}件
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 自己紹介（2行まで） */}
      {creator.bio && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{creator.bio.replace(/<[^>]+>/g, '')}</p>
      )}

      {/* 対応ツール */}
      {creator.supported_tools && creator.supported_tools.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {creator.supported_tools.slice(0, 4).map(toolId => {
            const tool = SUPPORTED_TOOLS_MAP[toolId];
            if (!tool) return null;
            return (
              <span key={toolId} className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-xs">
                {tool.label}
              </span>
            );
          })}
          {creator.supported_tools.length > 4 && (
            <span className="text-xs text-gray-400">+{creator.supported_tools.length - 4}</span>
          )}
        </div>
      )}

      {/* スキルタグ */}
      {creator.skills && creator.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {creator.skills.slice(0, 3).map((skill, i) => (
            <span key={i} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs">
              {skill}
            </span>
          ))}
          {creator.skills.length > 3 && (
            <span className="text-xs text-gray-400">+{creator.skills.length - 3}</span>
          )}
        </div>
      )}

      {/* フッター */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {creator.response_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {creator.response_time}
            </span>
          )}
          {(creator as any).listing_count > 0 && (
            <span>{(creator as any).listing_count}件出品中</span>
          )}
        </div>
        <span className="text-indigo-500 group-hover:text-indigo-600 transition-colors">
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}
