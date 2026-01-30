'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

type KdlDashboardLayoutProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
};

export default function KdlDashboardLayout({ sidebar, children }: KdlDashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* モバイル用ハンバーガーメニューボタン */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-amber-200"
        aria-label="メニューを開く"
      >
        {isSidebarOpen ? <X size={24} className="text-amber-600" /> : <Menu size={24} className="text-amber-600" />}
      </button>

      {/* オーバーレイ（モバイル時） */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* サイドバー */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-amber-100 shadow-lg
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full overflow-y-auto">
          {sidebar}
        </div>
      </aside>

      {/* メインコンテンツエリア */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
