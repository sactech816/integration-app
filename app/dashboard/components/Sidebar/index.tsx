'use client';

import React from 'react';
import { Heart, Users } from 'lucide-react';
import SidebarUserInfo from './SidebarUserInfo';
import SidebarNav from './SidebarNav';

type SidebarProps = {
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
  activeItem: string;
  onItemClick: (itemId: string) => void;
  contentCounts: {
    quiz: number;
    profile: number;
    business: number;
    salesletter: number;
    booking: number;
    attendance: number;
    survey: number;
    gamification: number;
  };
  totalViews: number;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  hasKdlSubscription?: boolean;
  isKdlMonitor?: boolean;
};

export default function Sidebar({
  user,
  isAdmin,
  activeItem,
  onItemClick,
  contentCounts,
  totalViews,
  onLogout,
  onNavigate,
  hasKdlSubscription = false,
  isKdlMonitor = false,
}: SidebarProps) {
  const totalContentCount = Object.values(contentCounts).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col h-full">
      {/* ロゴ/タイトル */}
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-lg font-bold text-gray-900">マイページ</h1>
        <p className="text-xs text-gray-500">集客メーカー</p>
      </div>

      {/* ユーザー情報 */}
      <SidebarUserInfo
        user={user}
        isAdmin={isAdmin}
        contentCount={totalContentCount}
        totalViews={totalViews}
      />

      {/* ナビゲーション */}
      <SidebarNav
        activeItem={activeItem}
        onItemClick={onItemClick}
        isAdmin={isAdmin}
        contentCounts={contentCounts}
        onLogout={onLogout}
        hasKdlSubscription={hasKdlSubscription}
        isKdlMonitor={isKdlMonitor}
      />

      {/* フッターリンク */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {/* みんなの作品を見る */}
        <button
          onClick={() => window.open('https://makers.tokyo/portal', '_blank')}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-3 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2"
        >
          <div className="bg-white/20 p-1.5 rounded-full">
            <Users size={16} />
          </div>
          <div className="text-left">
            <p className="font-bold text-xs">みんなの作品を見る</p>
            <p className="text-[10px] text-white/80">ポータルサイト</p>
          </div>
        </button>

        {/* 開発支援 */}
        <button
          onClick={() => onNavigate('donation')}
          className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white p-3 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2"
        >
          <div className="bg-white/20 p-1.5 rounded-full">
            <Heart size={16} />
          </div>
          <div className="text-left">
            <p className="font-bold text-xs">サービスを応援する</p>
            <p className="text-[10px] text-white/80">開発支援</p>
          </div>
        </button>
      </div>
    </div>
  );
}
