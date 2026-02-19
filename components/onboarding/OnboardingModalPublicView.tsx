'use client';

import React, { useState, useEffect } from 'react';
import { ICON_MAP } from './iconMap';
import type { OnboardingModalData, OnboardingModalPage } from '@/lib/types';

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

interface OnboardingModalPublicViewProps {
  data: OnboardingModalData;
}

export default function OnboardingModalPublicView({ data }: OnboardingModalPublicViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const storageKey = `sm_onboarding_${data.slug}`;

  useEffect(() => {
    // 「次から表示しない」チェック
    if (data.show_dont_show_again && localStorage.getItem(storageKey) === 'dismissed') {
      return;
    }

    // トリガーロジック
    switch (data.trigger_type) {
      case 'immediate':
        setShowModal(true);
        break;
      case 'delay':
        const timer = setTimeout(() => setShowModal(true), data.trigger_delay || 0);
        return () => clearTimeout(timer);
      case 'scroll':
        const handleScroll = () => {
          const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
          if (scrolled >= (data.trigger_scroll_percent || 50)) {
            setShowModal(true);
            window.removeEventListener('scroll', handleScroll);
          }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
      case 'click':
        // ボタンクリックモードでは最初は表示しない
        break;
    }
  }, [data, storageKey]);

  const handleClose = () => {
    setShowModal(false);
    setCurrentPage(0);
  };

  const handleDismissForever = (checked: boolean) => {
    if (checked) {
      localStorage.setItem(storageKey, 'dismissed');
    } else {
      localStorage.removeItem(storageKey);
    }
  };

  const totalPages = data.pages.length;
  const page = data.pages[currentPage];

  // ボタンクリックモード用フローティングボタン
  const positionClasses: Record<string, string> = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ボタンクリックトリガー */}
      {data.trigger_type === 'click' && !showModal && (
        <button
          onClick={() => setShowModal(true)}
          className={`fixed ${positionClasses[data.trigger_button_position] || 'bottom-6 right-6'} z-50 bg-gradient-to-r ${data.gradient_from} ${data.gradient_to} text-white px-5 py-3 rounded-full font-bold shadow-lg hover:opacity-90 transition-all`}
        >
          {data.trigger_button_text || 'ヘルプ'}
        </button>
      )}

      {/* モーダル */}
      {showModal && page && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={data.close_on_overlay_click ? handleClose : undefined}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ヘッダー */}
            <div className={`bg-gradient-to-r ${data.gradient_from} ${data.gradient_to} text-white px-6 py-5`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{data.title}</h3>
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
                const Icon = ICON_MAP[item.iconName] || ICON_MAP.Info;
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full ${colors.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
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
              {data.show_dont_show_again ? (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    onChange={(e) => handleDismissForever(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                  />
                  <span className="text-sm text-gray-600">{data.dont_show_text}</span>
                </label>
              ) : (
                <div />
              )}
              <div className="flex items-center gap-2">
                {currentPage > 0 && (
                  <button
                    onClick={() => setCurrentPage((p) => p - 1)}
                    className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                  >
                    {data.back_button_text}
                  </button>
                )}
                {currentPage < totalPages - 1 ? (
                  <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    className={`px-6 py-2.5 bg-gradient-to-r ${data.gradient_from} ${data.gradient_to} text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-md`}
                  >
                    {data.next_button_text}
                  </button>
                ) : (
                  <button
                    onClick={handleClose}
                    className={`px-6 py-2.5 bg-gradient-to-r ${data.gradient_from} ${data.gradient_to} text-white rounded-xl font-medium hover:opacity-90 transition-all shadow-md`}
                  >
                    {data.start_button_text}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Powered by フッター */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 text-xs text-gray-400">
        Powered by <a href="https://makers.tokyo" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline font-medium">集客メーカー</a>
      </div>
    </div>
  );
}
