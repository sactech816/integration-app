'use client';

import React, { useState } from 'react';
import { ArrowLeft, Save, Loader2, Edit3, Eye } from 'lucide-react';

interface EditorLayoutProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  headerActions?: React.ReactNode;
  savedId?: string | null;
}

export default function EditorLayout({
  title,
  subtitle,
  onBack,
  onSave,
  isSaving,
  leftPanel,
  rightPanel,
  headerActions,
  savedId,
}: EditorLayoutProps) {
  // モバイル用タブ切り替え
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900">
      {/* エディタヘッダー */}
      <div className="bg-white border-b px-4 md:px-6 py-4 flex justify-between sticky top-16 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-700"
          >
            <ArrowLeft />
          </button>
          <div>
            <h2 className="font-bold text-lg text-gray-900 line-clamp-1">
              {title}
            </h2>
            {subtitle && (
              <span className="text-xs text-gray-500">{subtitle}</span>
            )}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {headerActions}
          <button
            onClick={onSave}
            disabled={isSaving}
            className="bg-indigo-600 text-white px-4 md:px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-md transition-all whitespace-nowrap"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            <span className="hidden sm:inline">
              {savedId ? '更新' : '保存'}
            </span>
          </button>
        </div>
      </div>

      {/* モバイル用タブバー */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-[121px] z-40">
        <div className="flex">
          <button
            onClick={() => setMobileTab('editor')}
            className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
              mobileTab === 'editor'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Edit3 size={18} /> 編集
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex-1 py-3 px-4 font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
              mobileTab === 'preview'
                ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Eye size={18} /> プレビュー
          </button>
        </div>
      </div>

      {/* メインコンテンツ: 左（編集パネル） + 右（プレビュー） */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左側: 編集パネル */}
        <div
          className={`w-full lg:w-1/2 overflow-y-auto p-4 md:p-6 bg-gray-50 ${
            mobileTab === 'preview' ? 'hidden lg:block' : ''
          }`}
        >
          <div className="max-w-2xl mx-auto space-y-4">{leftPanel}</div>
        </div>

        {/* 右側: リアルタイムプレビュー */}
        <div
          className={`w-full lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] flex-col bg-gray-800 border-l border-gray-700 ${
            mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* PC用ヘッダー */}
          <div className="hidden lg:flex bg-gray-900 px-4 py-3 items-center justify-between border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <span className="text-gray-400 text-sm font-mono">プレビュー</span>
            </div>
          </div>

          {/* プレビューエリア */}
          <div className="flex-1 overflow-y-auto p-4 flex items-start justify-center">
            {rightPanel}
          </div>
        </div>

        {/* PC用：右側のfixed領域分のスペーサー */}
        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50" />
      </div>
    </div>
  );
}














