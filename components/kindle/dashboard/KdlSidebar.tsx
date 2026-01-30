'use client';

import React from 'react';
import { BookOpen, ExternalLink, HelpCircle } from 'lucide-react';
import KdlSidebarNav, { KdlUserRole } from './KdlSidebarNav';

type KdlSidebarProps = {
  user: { id: string; email?: string } | null;
  userRole: KdlUserRole;
  activeItem: string;
  onItemClick: (itemId: string) => void;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  bookCount?: number;
  // 代理店用: 担当ユーザー数
  assignedUserCount?: number;
  // 管理者用: 統計
  adminStats?: {
    totalUsers: number;
    totalBooks: number;
  };
};

export default function KdlSidebar({
  user,
  userRole,
  activeItem,
  onItemClick,
  onNavigate,
  onLogout,
  bookCount = 0,
  assignedUserCount = 0,
  adminStats,
}: KdlSidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* ロゴ/タイトル */}
      <div className="p-4 border-b border-amber-100 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2 rounded-lg">
            <BookOpen size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-gray-900">KDL</h1>
            <p className="text-[10px] text-gray-500">キンドルダイレクトライト</p>
          </div>
        </div>
        {/* ロールバッジ */}
        {userRole !== 'user' && (
          <div className="mt-2">
            <span className={`
              text-xs px-2 py-0.5 rounded-full font-bold
              ${userRole === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}
            `}>
              {userRole === 'admin' ? '管理者' : '代理店'}
            </span>
          </div>
        )}
      </div>

      {/* ユーザー情報 */}
      <div className="p-4 border-b border-amber-100 bg-amber-50/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-white font-bold text-sm">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.email || 'ゲスト'}
            </p>
            <p className="text-xs text-gray-500">
              {userRole === 'admin' && adminStats 
                ? `${adminStats.totalUsers}ユーザー / ${adminStats.totalBooks}冊`
                : userRole === 'agency'
                ? `担当: ${assignedUserCount}名`
                : `${bookCount}冊の書籍`
              }
            </p>
          </div>
        </div>
      </div>

      {/* ナビゲーション */}
      <KdlSidebarNav
        userRole={userRole}
        activeItem={activeItem}
        onItemClick={onItemClick}
        onLogout={onLogout}
        bookCount={bookCount}
        assignedUserCount={assignedUserCount}
      />

      {/* フッターリンク */}
      <div className="p-4 border-t border-amber-100 space-y-2 mt-auto">
        {/* 集客メーカーに戻る（別タブで開く） */}
        <button
          onClick={() => window.open('/dashboard', '_blank')}
          className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 p-3 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2"
        >
          <div className="bg-gray-300 p-1.5 rounded-full">
            <ExternalLink size={14} className="text-gray-600" />
          </div>
          <div className="text-left">
            <p className="font-bold text-xs">集客メーカーに戻る</p>
            <p className="text-[10px] text-gray-500">ダッシュボード</p>
          </div>
        </button>

        {/* サポート */}
        <button
          onClick={() => onNavigate('/kindle/guide')}
          className="w-full bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 p-3 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2"
        >
          <div className="bg-amber-200 p-1.5 rounded-full">
            <HelpCircle size={14} className="text-amber-600" />
          </div>
          <div className="text-left">
            <p className="font-bold text-xs">ヘルプ・サポート</p>
            <p className="text-[10px] text-amber-600">使い方ガイド</p>
          </div>
        </button>
      </div>
    </div>
  );
}
