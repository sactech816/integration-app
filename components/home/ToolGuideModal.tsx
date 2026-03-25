'use client';

import { useState } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { FUNNEL_STAGES } from '@/lib/tools-data';

export default function ToolGuideModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [currentPage, setCurrentPage] = useState(0);

  if (!isOpen) return null;

  const page = FUNNEL_STAGES[currentPage];
  const totalPages = FUNNEL_STAGES.length;
  const isFirst = currentPage === 0;
  const isLast = currentPage === totalPages - 1;

  const handleNext = () => {
    if (!isLast) setCurrentPage((p) => p + 1);
  };

  const handleBack = () => {
    if (!isFirst) setCurrentPage((p) => p - 1);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
      setCurrentPage(0);
    }
  };

  const handleClose = () => {
    onClose();
    setCurrentPage(0);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-fade-in">
        {/* Header with gradient */}
        <div className={`bg-gradient-to-r ${page.gradient} px-6 py-5 text-white relative flex-shrink-0`}>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
          >
            <X size={16} />
          </button>
          <div className="text-xs font-medium opacity-80 mb-1">
            集客メーカーガイド — {currentPage + 1} / {totalPages}
          </div>
          <h3 className="text-xl font-black flex items-center gap-2">
            <span className="text-2xl">{page.emoji}</span>
            {page.subtitle}
          </h3>
          <p className="text-sm opacity-90 mt-1">{page.description}</p>
          {/* Progress dots */}
          <div className="flex gap-1.5 mt-3">
            {FUNNEL_STAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentPage
                    ? 'w-6 bg-white'
                    : idx < currentPage
                    ? 'w-3 bg-white/60'
                    : 'w-3 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Tool list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {page.tools.map((tool, idx) => (
            <a
              key={idx}
              href={tool.href}
              className="flex items-start gap-3 p-3 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl ${tool.iconBg} ${tool.iconColor} flex items-center justify-center flex-shrink-0`}>
                <tool.icon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm" style={{ color: '#5d4037' }}>
                  {tool.name}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  {tool.desc}
                </div>
              </div>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-orange-400 flex-shrink-0 mt-1 transition" />
            </a>
          ))}
        </div>

        {/* Footer navigation */}
        <div className="flex-shrink-0 px-5 py-4 border-t border-gray-100 flex items-center justify-between">
          {!isFirst ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-gray-600 transition"
            >
              <ArrowLeft size={16} />
              戻る
            </button>
          ) : (
            <div />
          )}
          {!isLast ? (
            <button
              onClick={handleNext}
              className={`flex items-center gap-1.5 text-sm font-bold text-white px-5 py-2.5 rounded-xl shadow-md transition bg-gradient-to-r ${page.gradient} hover:opacity-90`}
            >
              次へ
              <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleClose}
              className="flex items-center gap-1.5 text-sm font-bold text-white px-5 py-2.5 rounded-xl shadow-md transition bg-gradient-to-r from-orange-500 to-amber-500 hover:opacity-90"
            >
              閉じる
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
