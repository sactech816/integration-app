'use client';

import { useState } from 'react';
import { Compass, ArrowRight } from 'lucide-react';
import ToolGuideModal from './ToolGuideModal';

export default function ToolGuideBanner() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group relative overflow-hidden rounded-3xl border-2 p-8 md:p-10 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between min-h-[220px] text-left w-full"
        style={{ borderColor: '#6366f1', background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 50%, #c7d2fe 100%)' }}
      >
        <div className="absolute top-4 right-4 w-20 h-20 rounded-full opacity-20 bg-indigo-500" />
        <div className="absolute bottom-[-20px] right-[-20px] w-32 h-32 rounded-full opacity-10 bg-indigo-500" />
        <div>
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur px-3 py-1 rounded-full mb-4 shadow-sm">
            <Compass size={16} className="text-indigo-500" />
            <span className="text-xs font-bold text-indigo-500">はじめての方におすすめ</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-black mb-2" style={{ color: '#5d4037' }}>
            集客メーカーガイド
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            全ツールを目的別にステップで紹介。<br />
            あなたに合うツールが見つかります
          </p>
        </div>
        <div className="flex items-center gap-2 font-bold text-sm mt-4 text-indigo-500 group-hover:gap-3 transition-all">
          ガイドを見る <ArrowRight size={16} />
        </div>
      </button>

      <ToolGuideModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
