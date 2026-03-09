'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { X, Menu } from 'lucide-react';
import RightPanel from './RightPanel';
import { MobileBottomNav } from './MobileNav';

type DashboardLayoutProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  // 右側パネル用のprops
  rightPanel?: {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    content?: React.ReactNode;
    width?: 'normal' | 'wide' | 'full';
  };
  // モバイルボトムナビ用
  activeView?: string;
  onItemClick?: (itemId: string) => void;
};

const SIDEBAR_MIN = 220;
const SIDEBAR_MAX = 360;
const SIDEBAR_DEFAULT = 256;
const SIDEBAR_STORAGE_KEY = 'dashboard-sidebar-width';

export default function DashboardLayout({ sidebar, children, rightPanel, activeView, onItemClick }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      if (saved) {
        const w = parseInt(saved, 10);
        if (w >= SIDEBAR_MIN && w <= SIDEBAR_MAX) return w;
      }
    }
    return SIDEBAR_DEFAULT;
  });
  // activeView変更時にモバイルサイドバーを自動で閉じる
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [activeView]);

  const isResizing = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(SIDEBAR_DEFAULT);
  const currentWidth = useRef(sidebarWidth);
  currentWidth.current = sidebarWidth;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current = e.clientX;
    startWidth.current = currentWidth.current;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      const diff = e.clientX - startX.current;
      const newWidth = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, startWidth.current + diff));
      setSidebarWidth(newWidth);
    };
    const handleMouseUp = () => {
      if (!isResizing.current) return;
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(currentWidth.current));
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50" style={{ '--sidebar-w': `${sidebarWidth}px` } as React.CSSProperties}>
      {/* オーバーレイ（モバイル時） */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* サイドバー */}
      <aside
        style={{ width: sidebarWidth }}
        className={`
          fixed top-0 left-0 z-40 h-full bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full overflow-y-auto">
          {sidebar}
        </div>
        {/* リサイズハンドル */}
        <div
          onMouseDown={handleMouseDown}
          className="hidden lg:block absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-indigo-400 active:bg-indigo-500 transition-colors group"
        >
          <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-8 rounded-full bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </aside>

      {/* メインコンテンツエリア */}
      <main className="min-h-screen lg:ml-[var(--sidebar-w)]">
        <div className="p-4 lg:p-8 pb-28 lg:pb-8">
          {children}
        </div>
      </main>

      {/* モバイル用ボトムナビ */}
      {activeView && onItemClick && (
        <MobileBottomNav
          activeView={activeView}
          onItemClick={(itemId: string) => {
            setIsSidebarOpen(false);
            onItemClick(itemId);
          }}
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        />
      )}

      {/* 右側パネル */}
      {rightPanel && (
        <RightPanel
          isOpen={rightPanel.isOpen}
          onClose={rightPanel.onClose}
          title={rightPanel.title}
          width={rightPanel.width}
        >
          {rightPanel.content}
        </RightPanel>
      )}
    </div>
  );
}
