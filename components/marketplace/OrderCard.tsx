'use client';

import React from 'react';
import Link from 'next/link';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { MarketplaceOrder } from '@/lib/types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/constants/marketplace';

interface OrderCardProps {
  order: MarketplaceOrder & {
    is_buyer?: boolean;
    buyer_profile?: { display_name: string; avatar_url?: string } | null;
    seller_profile?: { display_name: string; avatar_url?: string; user_id: string } | null;
  };
}

export default function OrderCard({ order }: OrderCardProps) {
  const statusStyle = ORDER_STATUS_COLORS[order.status] || ORDER_STATUS_COLORS.requested;
  const counterpart = order.is_buyer ? order.seller_profile : order.buyer_profile;
  const roleLabel = order.is_buyer ? '依頼' : '受注';

  return (
    <Link
      href={`/marketplace/orders/${order.id}`}
      className="block bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition-all p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* ステータスとロール */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle.bg} ${statusStyle.text}`}>
              {ORDER_STATUS_LABELS[order.status]}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              order.is_buyer ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
            }`}>
              {roleLabel}
            </span>
          </div>

          {/* タイトル */}
          <h3 className="font-semibold text-gray-900 text-sm truncate">{order.title}</h3>

          {/* 相手の情報 */}
          {counterpart && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] overflow-hidden">
                {counterpart.avatar_url ? (
                  <img src={counterpart.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  counterpart.display_name.charAt(0)
                )}
              </div>
              <span className="text-xs text-gray-500">{counterpart.display_name}</span>
            </div>
          )}

          {/* 予算・日時 */}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            {order.budget && <span>予算: ¥{order.budget.toLocaleString()}</span>}
            <span>{new Date(order.created_at).toLocaleDateString('ja-JP')}</span>
          </div>
        </div>

        <ArrowRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
      </div>
    </Link>
  );
}
