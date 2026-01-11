'use client';

import React from 'react';
import { RefreshCw } from 'lucide-react';

interface PhoneMockupProps {
  children: React.ReactNode;
  title?: string;
  onReset?: () => void;
  showResetButton?: boolean;
}

export default function PhoneMockup({
  children,
  title = 'プレビュー',
  onReset,
  showResetButton = true,
}: PhoneMockupProps) {
  return (
    <div className="flex flex-col items-center">
      {/* コントロールバー */}
      <div className="w-full max-w-[320px] flex items-center justify-between mb-3 px-2">
        <span className="text-sm text-gray-400 font-medium">{title}</span>
        {showResetButton && onReset && (
          <button
            onClick={onReset}
            className="text-gray-400 hover:text-white px-3 py-1 rounded text-sm flex items-center gap-1 hover:bg-gray-700 transition-colors"
          >
            <RefreshCw size={14} /> リセット
          </button>
        )}
      </div>

      {/* スマホフレーム */}
      <div className="relative">
        {/* 外枠 */}
        <div className="relative w-[320px] bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl">
          {/* ノッチ */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-6 bg-gray-900 rounded-b-2xl z-10" />
          
          {/* サイドボタン（右） */}
          <div className="absolute right-[-3px] top-24 w-1 h-12 bg-gray-700 rounded-l" />
          <div className="absolute right-[-3px] top-40 w-1 h-8 bg-gray-700 rounded-l" />
          
          {/* サイドボタン（左） */}
          <div className="absolute left-[-3px] top-28 w-1 h-16 bg-gray-700 rounded-r" />

          {/* 画面エリア */}
          <div className="relative w-full h-[568px] bg-white rounded-[2rem] overflow-hidden">
            {/* ステータスバー */}
            <div className="absolute top-0 left-0 right-0 h-11 bg-gradient-to-b from-black/5 to-transparent z-10 flex items-center justify-center">
              <div className="w-20 h-5 bg-black rounded-full" />
            </div>
            
            {/* コンテンツエリア */}
            <div className="h-full overflow-y-auto">
              {children}
            </div>

            {/* ホームインジケーター */}
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}















