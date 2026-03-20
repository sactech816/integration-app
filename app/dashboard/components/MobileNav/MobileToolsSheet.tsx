'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { X, ListFilter, Compass, LayoutGrid, Plus, Check } from 'lucide-react';
import { TOOL_ITEMS, TOOL_CATEGORIES } from '../Sidebar/menuItems';
import { PersonaId, DISCOVERY_CATEGORIES, getVisibleToolIds } from '@/lib/persona-config';

type MobileToolsSheetProps = {
  isOpen: boolean;
  onClose: () => void;
  onItemClick: (itemId: string) => void;
  activeView: string;
  // ペルソナ関連
  userPersona?: PersonaId | null;
  enabledToolIds?: string[];
  showAllTools?: boolean;
  onAddTool?: (toolId: string) => void;
  onRemoveTool?: (toolId: string) => void;
};

export default function MobileToolsSheet({
  isOpen,
  onClose,
  onItemClick,
  activeView,
  userPersona = null,
  enabledToolIds = [],
  showAllTools = false,
  onAddTool,
  onRemoveTool,
}: MobileToolsSheetProps) {
  const hasPersona = !!userPersona;
  type ToolViewMode = 'my-tools' | 'discover' | 'all';
  const [viewMode, setViewMode] = useState<ToolViewMode>(hasPersona && !showAllTools ? 'my-tools' : 'all');

  const visibleToolIds = useMemo(() => {
    if (!userPersona || viewMode === 'all') return null;
    return getVisibleToolIds(userPersona, enabledToolIds, false);
  }, [userPersona, enabledToolIds, viewMode]);
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
            <h3 className="font-bold text-gray-900 text-base">作成ツール（編集）</h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          </div>

          {/* モード切替タブ（ペルソナ設定済みの場合のみ） */}
          {hasPersona && (
            <div className="flex bg-gray-100 rounded-lg p-0.5 mt-2">
              <button
                onClick={() => setViewMode('my-tools')}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-bold transition-all ${
                  viewMode === 'my-tools' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'
                }`}
              >
                <ListFilter size={12} />
                マイツール
              </button>
              <button
                onClick={() => setViewMode('discover')}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-bold transition-all ${
                  viewMode === 'discover' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'
                }`}
              >
                <Compass size={12} />
                追加
              </button>
              <button
                onClick={() => setViewMode('all')}
                className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-xs font-bold transition-all ${
                  viewMode === 'all' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-500'
                }`}
              >
                <LayoutGrid size={12} />
                全ツール
              </button>
            </div>
          )}
        </div>

        {/* ツールグリッド（my-tools / all モード） */}
        {viewMode !== 'discover' && (
          <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(70vh - 70px)' }}>
            {TOOL_CATEGORIES.map((category) => {
              const CategoryIcon = category.icon;
              const categoryTools = TOOL_ITEMS.filter((tool) => {
                if (tool.category !== category.id) return false;
                if (visibleToolIds && viewMode === 'my-tools') {
                  return visibleToolIds.includes(tool.id);
                }
                return true;
              });
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
        )}

        {/* ツール探索（discover モード） */}
        {viewMode === 'discover' && (
          <div className="overflow-y-auto p-4 space-y-4" style={{ maxHeight: 'calc(70vh - 70px)' }}>
            {DISCOVERY_CATEGORIES.map((cat) => {
              const CatIcon = cat.icon;
              return (
                <div key={cat.id}>
                  <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5 px-1">
                    <CatIcon size={12} />
                    {cat.label}
                  </p>
                  <div className="space-y-1">
                    {cat.toolIds.map((toolId) => {
                      const tool = TOOL_ITEMS.find((t) => t.id === toolId);
                      if (!tool) return null;
                      const Icon = tool.icon;
                      const isEnabled = visibleToolIds ? visibleToolIds.includes(toolId) : true;

                      return (
                        <div
                          key={toolId}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
                        >
                          <div className={`p-2 rounded-lg ${tool.color.bg}`}>
                            <Icon size={16} className={tool.color.text} />
                          </div>
                          <span className="flex-1 text-xs font-bold text-gray-700">{tool.label}</span>
                          {isEnabled ? (
                            <button
                              onClick={() => onRemoveTool?.(toolId)}
                              className="text-[10px] px-2.5 py-1 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center gap-0.5"
                            >
                              <Check size={10} />
                              追加済み
                            </button>
                          ) : (
                            <button
                              onClick={() => onAddTool?.(toolId)}
                              className="text-[10px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-bold flex items-center gap-0.5 transition-colors"
                            >
                              <Plus size={10} />
                              追加
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
