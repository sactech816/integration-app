'use client';

import React, { useState } from 'react';

export interface OnboardingItem {
  icon: React.ElementType;
  iconColor: string; // 'blue' | 'purple' | 'teal' | 'amber' | 'green' | 'red' | 'orange'
  title: string;
  description: string | React.ReactNode;
}

export interface OnboardingPage {
  subtitle: string;
  items: OnboardingItem[];
}

interface OnboardingModalProps {
  storageKey: string;
  title: string;
  pages: OnboardingPage[];
  gradientFrom?: string;
  gradientTo?: string;
  onDismiss: () => void;
}

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  violet: { bg: 'bg-violet-100', text: 'text-violet-600' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
};

export default function OnboardingModal({
  storageKey,
  title,
  pages,
  gradientFrom = 'from-amber-500',
  gradientTo = 'to-orange-500',
  onDismiss,
}: OnboardingModalProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = pages.length;

  const handleDismissForever = (checked: boolean) => {
    if (checked) {
      localStorage.setItem(storageKey, 'true');
    } else {
      localStorage.removeItem(storageKey);
    }
  };

  const handleClose = () => {
    onDismiss();
  };

  const page = pages[currentPage];
  if (!page) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white px-6 py-5`}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="text-white/80 text-sm mt-1">{page.subtitle}</p>
            </div>
            {totalPages > 1 && (
              <span className="text-white/70 text-sm font-medium">
                {currentPage + 1} / {totalPages}
              </span>
            )}
          </div>
          {totalPages > 1 && (
            <div className="flex gap-1.5 mt-3">
              {Array.from({ length: totalPages }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full flex-1 transition-colors ${
                    i <= currentPage ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* コンテンツ */}
        <div className="px-6 py-5 space-y-4">
          {page.items.map((item, index) => {
            const colors = COLOR_MAP[item.iconColor] || COLOR_MAP.blue;
            const Icon = item.icon;
            return (
              <div key={index} className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}
                >
                  <Icon size={16} className={colors.text} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.title}</p>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* フッター */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              onChange={(e) => handleDismissForever(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
            />
            <span className="text-sm text-gray-600">次から表示しない</span>
          </label>
          <div className="flex items-center gap-2">
            {currentPage > 0 && (
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
              >
                戻る
              </button>
            )}
            {currentPage < totalPages - 1 ? (
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                className={`px-6 py-2.5 bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-md`}
              >
                次へ
              </button>
            ) : (
              <button
                onClick={handleClose}
                className={`px-6 py-2.5 bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-md`}
              >
                はじめる
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
