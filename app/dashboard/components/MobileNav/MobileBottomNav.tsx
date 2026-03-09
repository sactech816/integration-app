'use client';

import { Home, LayoutGrid, Settings } from 'lucide-react';
import { TOOL_ITEMS } from '../Sidebar/menuItems';

type MobileBottomNavProps = {
  activeView: string;
  onItemClick: (itemId: string) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
};

export default function MobileBottomNav({ activeView, onItemClick, isSidebarOpen, onToggleSidebar }: MobileBottomNavProps) {
  const isHome = activeView === 'dashboard';
  const isSettings = activeView === 'settings';
  const toolIds = TOOL_ITEMS.map((t) => t.id);
  const isTool = toolIds.includes(activeView);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-slate-700 border-t border-slate-600 shadow-[0_-2px_10px_rgba(0,0,0,0.3)]">
      <div
        className="flex justify-around items-center h-16 px-2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* ホーム */}
        <button
          onClick={() => onItemClick('dashboard')}
          className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
            isHome ? 'text-sky-300' : 'text-sky-400/70'
          }`}
        >
          <Home size={22} strokeWidth={isHome ? 2.5 : 2} />
          <span className={`text-[10px] ${isHome ? 'font-bold' : 'font-medium'}`}>ホーム</span>
        </button>
        <div className="w-px h-8 bg-slate-500" />
        {/* 作成ツール（編集） → 左サイドバーを開閉 */}
        <button
          onClick={onToggleSidebar}
          className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
            isTool || isSidebarOpen ? 'text-amber-300' : 'text-amber-400/70'
          }`}
        >
          <LayoutGrid size={22} strokeWidth={isTool || isSidebarOpen ? 2.5 : 2} />
          <span className={`text-[10px] ${isTool || isSidebarOpen ? 'font-bold' : 'font-medium'}`}>作成ツール（編集）</span>
        </button>
        <div className="w-px h-8 bg-slate-500" />

        {/* 設定 */}
        <button
          onClick={() => onItemClick('settings')}
          className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
            isSettings ? 'text-emerald-300' : 'text-emerald-400/70'
          }`}
        >
          <Settings size={22} strokeWidth={isSettings ? 2.5 : 2} />
          <span className={`text-[10px] ${isSettings ? 'font-bold' : 'font-medium'}`}>設定</span>
        </button>
      </div>
    </nav>
  );
}
