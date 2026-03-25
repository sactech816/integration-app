'use client';

import { useState } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { FUNNEL_STAGES } from '@/lib/tools-data';

export default function FunnelStageShowcase() {
  const [activeTab, setActiveTab] = useState(1); // default: 集める (index 1)

  const activeStage = FUNNEL_STAGES[activeTab];

  return (
    <section className="py-20" style={{ backgroundColor: '#fffbf0' }}>
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black mb-4" style={{ color: '#5d4037' }}>
            集客の流れに沿って、必要なツールが全部そろう
          </h2>
          <p className="text-gray-600 text-sm max-w-2xl mx-auto">
            「知ってもらう」から「売る」まで、ステップごとに最適なツールを用意しています
          </p>
        </div>

        {/* タブナビゲーション */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center bg-white rounded-2xl border border-gray-200 shadow-sm p-1.5 overflow-x-auto max-w-full">
            {FUNNEL_STAGES.map((stage, idx) => {
              const isActive = idx === activeTab;
              return (
                <button
                  key={stage.id}
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">{stage.emoji}</span>
                  <span className="hidden sm:inline">{stage.subtitle}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* フロー矢印（デスクトップのみ） */}
        <div className="hidden md:flex justify-center items-center gap-1 mb-6">
          {FUNNEL_STAGES.map((stage, idx) => (
            <div key={stage.id} className="flex items-center gap-1">
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full transition-all ${
                  idx === activeTab
                    ? 'bg-orange-100 text-orange-600'
                    : 'text-gray-400'
                }`}
              >
                {stage.emoji} {stage.subtitle}
              </span>
              {idx < FUNNEL_STAGES.length - 1 && (
                <ChevronRight size={14} className="text-gray-300" />
              )}
            </div>
          ))}
        </div>

        {/* ツールカードリスト */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          {/* ステージヘッダー */}
          <div className={`bg-gradient-to-r ${activeStage.gradient} px-6 py-4 text-white`}>
            <h3 className="text-lg font-black flex items-center gap-2">
              <span className="text-xl">{activeStage.emoji}</span>
              {activeStage.subtitle}
            </h3>
            <p className="text-sm opacity-90 mt-1">{activeStage.description}</p>
          </div>

          {/* ツールリスト */}
          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeStage.tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <a
                    key={tool.name}
                    href={tool.href}
                    className="flex items-start gap-3 p-4 rounded-2xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/50 transition-all group"
                  >
                    <div className={`w-10 h-10 rounded-xl ${tool.iconBg} ${tool.iconColor} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={20} />
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
                );
              })}
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <a
            href="/tools"
            className="inline-flex items-center gap-2 text-sm font-bold hover:underline transition"
            style={{ color: '#f97316' }}
          >
            全ツール一覧で目的に合ったものを探す <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
