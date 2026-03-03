'use client';

import React from 'react';
import Link from 'next/link';
import { Loader2, BookOpen, Crown, Sparkles, LayoutGrid, Lock, Users, Play, Heart } from 'lucide-react';
import { TOOL_ITEMS, TOOL_CATEGORIES } from '../Sidebar/menuItems';

import { PlanTier } from '@/lib/subscription';

type KdlSubscription = {
  hasActiveSubscription: boolean;
  planType: 'monthly' | 'yearly' | 'none';
  nextPaymentDate: string | null;
  amount: number | null;
  isMonitor?: boolean;
  monitorExpiresAt?: string;
  planTier?: string;
};

type UserSubscription = {
  planTier: PlanTier;
  gamificationLimit?: number;
  aiDailyLimit?: number;
};

type DashboardHomeProps = {
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
  isPartner: boolean;
  kdlSubscription: KdlSubscription | null;
  loadingKdlSubscription: boolean;
  userSubscription?: UserSubscription | null;
  onNavigate: (path: string, addAdminKey?: boolean) => void;
  onMenuItemClick?: (itemId: string) => void;
};

export default function DashboardHome({
  user,
  isAdmin,
  isPartner,
  kdlSubscription,
  loadingKdlSubscription,
  userSubscription,
  onNavigate,
  onMenuItemClick,
}: DashboardHomeProps) {
  const hasMakersProAccess = userSubscription?.planTier === 'pro';
  return (
    <div className="space-y-6">
      {/* KDLサブスクリプション状態（コンパクト版） */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 sm:p-4 rounded-2xl shadow-sm border border-amber-200">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="bg-amber-100 p-1.5 sm:p-2 rounded-full shrink-0">
              <BookOpen size={16} className="text-amber-600 sm:w-[18px] sm:h-[18px]" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">
                <span className="sm:hidden">KDL</span>
                <span className="hidden sm:inline">Kindle執筆サービス (KDL)</span>
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 hidden sm:block">AI powered 書籍執筆</p>
            </div>
          </div>

          {loadingKdlSubscription ? (
            <Loader2 className="animate-spin text-amber-500 shrink-0" size={20} />
          ) : kdlSubscription?.hasActiveSubscription || isAdmin ? (
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="flex items-center gap-1 sm:gap-2">
                <Crown size={14} className="text-amber-500 hidden sm:block" />
                <span className="bg-green-100 text-green-700 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                  有効
                </span>
              </div>
              <button
                onClick={() => onNavigate('kindle', true)}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 px-2.5 sm:py-2 sm:px-4 rounded-lg text-[10px] sm:text-xs flex items-center gap-1 transition-colors"
              >
                <BookOpen size={12} className="sm:w-[14px] sm:h-[14px]" />
                <span className="sm:hidden">管理</span>
                <span className="hidden sm:inline">書籍を管理</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <span className="text-[10px] sm:text-sm text-gray-500 hidden sm:block">未加入</span>
              <button
                onClick={() => onNavigate('kindle/lp')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-1.5 px-2.5 sm:py-2 sm:px-4 rounded-lg text-[10px] sm:text-xs flex items-center gap-1 transition-all shadow-md"
              >
                <Sparkles size={12} className="sm:w-[14px] sm:h-[14px]" />
                詳細
              </button>
            </div>
          )}
        </div>
        {kdlSubscription?.isMonitor && kdlSubscription?.monitorExpiresAt && (
          <p className="text-[10px] sm:text-xs text-purple-600 font-bold mt-2 ml-9 sm:ml-11">
            モニター期限: {new Date(kdlSubscription.monitorExpiresAt).toLocaleDateString('ja-JP')}まで
          </p>
        )}
      </div>

      {/* バナーセクション */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <a
          href="https://makers.tokyo/portal"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="bg-white/20 p-2 rounded-full shrink-0">
            <Users size={18} />
          </div>
          <div>
            <p className="font-bold text-sm">みんなの作品を見る</p>
            <p className="text-[11px] text-white/80">ポータルサイト</p>
          </div>
        </a>
        <Link
          href="/demos"
          className="flex items-center gap-3 bg-gradient-to-r from-sky-500 to-cyan-500 text-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all"
        >
          <div className="bg-white/20 p-2 rounded-full shrink-0">
            <Play size={18} />
          </div>
          <div>
            <p className="font-bold text-sm">デモを見る</p>
            <p className="text-[11px] text-white/80">各ツールのサンプル</p>
          </div>
        </Link>
        <button
          onClick={() => onNavigate('donation')}
          className="flex items-center gap-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all text-left"
        >
          <div className="bg-white/20 p-2 rounded-full shrink-0">
            <Heart size={18} />
          </div>
          <div>
            <p className="font-bold text-sm">サービスを応援する</p>
            <p className="text-[11px] text-white/80">開発支援</p>
          </div>
        </button>
      </div>

      {/* すべてのツール（カテゴリ別） */}
      {onMenuItemClick && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
            <LayoutGrid size={16} className="text-gray-500" />
            すべてのツール
          </h3>
          <div className="space-y-4">
            {TOOL_CATEGORIES.map((category) => {
              const CategoryIcon = category.icon;
              const categoryTools = TOOL_ITEMS.filter(
                (tool) => tool.category === category.id && !['quiz', 'profile', 'business'].includes(tool.id)
              );
              if (categoryTools.length === 0) return null;

              return (
                <div key={category.id}>
                  <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5 px-1">
                    <CategoryIcon size={12} />
                    {category.label}
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {categoryTools.map((tool) => {
                      const Icon = tool.icon;
                      const isProOnly = tool.id === 'thumbnail';
                      const isProLocked = isProOnly && !hasMakersProAccess && !isAdmin && !isPartner;

                      const iconContent = (
                        <div className="relative">
                          <div className={`p-2 rounded-lg ${tool.color.bg}`}>
                            <Icon size={20} className={tool.color.text} />
                          </div>
                          {isProLocked && (
                            <div className="absolute -top-1 -right-1 bg-pink-500 text-white rounded-full p-0.5">
                              <Lock size={10} />
                            </div>
                          )}
                        </div>
                      );

                      const label = (
                        <span className="text-[11px] font-bold text-gray-600 text-center leading-tight">
                          {tool.description}
                          {isProOnly && (
                            <span className="block text-[9px] font-medium text-pink-500 mt-0.5">Pro</span>
                          )}
                        </span>
                      );

                      if (isProLocked) {
                        return (
                          <Link
                            key={tool.id}
                            href="/pricing"
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-pink-50 active:bg-pink-100 transition-all opacity-75 hover:opacity-100"
                          >
                            {iconContent}
                            {label}
                          </Link>
                        );
                      }

                      if (tool.href) {
                        return (
                          <Link
                            key={tool.id}
                            href={tool.href}
                            className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all"
                          >
                            {iconContent}
                            {label}
                          </Link>
                        );
                      }

                      return (
                        <button
                          key={tool.id}
                          onClick={() => onMenuItemClick(tool.id)}
                          className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-all"
                        >
                          {iconContent}
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
