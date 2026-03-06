'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { TOOL_ITEMS, TOOL_CATEGORIES } from '../Sidebar/menuItems';

type MobileToolsSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onItemClick: (itemId: string) => void;
  activeView: string;
};

export default function MobileToolsSheet({
  isOpen,
  onClose,
  onItemClick,
  activeView,
}: MobileToolsSheetProps) {
  // body scroll防止
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleItemClick = (itemId: string) => {
    onItemClick(itemId);
    onClose();
  };

  return (
    <>
      {/* 背景オーバーレイ */}
      <div
        className={`
          fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 lg:hidden
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* シート本体（ボトムナビの上に表示） */}
      <div
        className={`
          fixed bottom-16 left-0 right-0 z-40 lg:hidden
          bg-white rounded-t-2xl shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ maxHeight: '70vh' }}
      >
        {/* ヘッダー */}
        <div className="sticky top-0 bg-white rounded-t-2xl border-b border-gray-100 px-4 pt-3 pb-2">
          {/* ドラッグハンドル */}
          <div className="flex justify-center mb-2">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
          </div>
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-base">すべてのツール（新規作成）</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* ツールグリッド（カテゴリ別） */}
        <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(70vh - 70px)' }}>
          {TOOL_CATEGORIES.map((category) => {
            const CategoryIcon = category.icon;
            const categoryTools = TOOL_ITEMS.filter(
              (tool) => tool.category === category.id
            );
            if (categoryTools.length === 0) return null;

            return (
              <div key={category.id}>
                <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5 px-1">
                  <CategoryIcon size={12} />
                  {category.label}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {categoryTools.map((tool) => {
                    const Icon = tool.icon;
                    const isActive = activeView === tool.id;

                    return (
                      <button
                        key={tool.id}
                        onClick={() => handleItemClick(tool.id)}
                        className={`
                          flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all
                          ${isActive
                            ? `${tool.color.bg} ${tool.color.border} border-2`
                            : 'border-2 border-transparent hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className={`p-2.5 rounded-xl ${tool.color.bg}`}>
                          <Icon size={22} className={tool.color.text} />
                        </div>
                        <span className={`text-[11px] font-bold text-center leading-tight ${
                          isActive ? tool.color.text : 'text-gray-600'
                        }`}>
                          {tool.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
