'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

type RightPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  width?: 'normal' | 'wide' | 'full';
};

export default function RightPanel({
  isOpen,
  onClose,
  title,
  children,
  width = 'normal',
}: RightPanelProps) {
  // ESCキーでパネルを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // パネルが開いているときはbodyのスクロールを防止
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

  // 幅のクラスを決定
  const getWidthClass = () => {
    switch (width) {
      case 'wide':
        return 'w-full md:w-3/4 lg:w-2/3';
      case 'full':
        return 'w-full';
      case 'normal':
      default:
        return 'w-full md:w-[600px] lg:w-[700px]';
    }
  };

  return (
    <>
      {/* オーバーレイ背景 */}
      <div
        className={`
          fixed inset-0 bg-black/50 z-40 transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      {/* 右側パネル */}
      <div
        className={`
          fixed top-0 right-0 h-full bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          ${getWidthClass()}
          flex flex-col
        `}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          {title && (
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          )}
          {!title && <div />}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="閉じる"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
