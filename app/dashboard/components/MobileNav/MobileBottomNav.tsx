'use client';

import React, { useState, useEffect } from 'react';
import { Home, LayoutGrid, Settings } from 'lucide-react';
import MobileToolsSheet from './MobileToolsSheet';
import { TOOL_ITEMS } from '../Sidebar/menuItems';

type MobileBottomNavProps = {
  activeView: string;
  onItemClick: (itemId: string) => void;
};

export default function MobileBottomNav({ activeView, onItemClick }: MobileBottomNavProps) {
  const [isToolsSheetOpen, setIsToolsSheetOpen] = useState(false);

  // activeView変更時にシートを自動閉じ
  useEffect(() => {
    setIsToolsSheetOpen(false);
  }, [activeView]);

  const isHome = activeView === 'dashboard';
  const isSettings = activeView === 'settings';
  const toolIds = TOOL_ITEMS.map((t) => t.id);
  const isTool = toolIds.includes(activeView);

  return (
    <>
      <MobileToolsSheet
        isOpen={isToolsSheetOpen}
        onClose={() => setIsToolsSheetOpen(false)}
        onItemClick={onItemClick}
        activeView={activeView}
      />

      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
        <div
          className="flex justify-around items-center h-16 px-2"
          style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          {/* ホーム */}
          <button
            onClick={() => onItemClick('dashboard')}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
              isHome ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <Home size={22} strokeWidth={isHome ? 2.5 : 2} />
            <span className={`text-[10px] ${isHome ? 'font-bold' : 'font-medium'}`}>ホーム</span>
          </button>

          {/* ツール */}
          <button
            onClick={() => setIsToolsSheetOpen(!isToolsSheetOpen)}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
              isTool || isToolsSheetOpen ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <LayoutGrid size={22} strokeWidth={isTool || isToolsSheetOpen ? 2.5 : 2} />
            <span className={`text-[10px] ${isTool || isToolsSheetOpen ? 'font-bold' : 'font-medium'}`}>ツール</span>
          </button>

          {/* 設定 */}
          <button
            onClick={() => onItemClick('settings')}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
              isSettings ? 'text-indigo-600' : 'text-gray-400'
            }`}
          >
            <Settings size={22} strokeWidth={isSettings ? 2.5 : 2} />
            <span className={`text-[10px] ${isSettings ? 'font-bold' : 'font-medium'}`}>設定</span>
          </button>
        </div>
      </nav>
    </>
  );
}
