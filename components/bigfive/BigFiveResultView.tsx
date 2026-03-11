'use client';

import { BigFiveResult, FACET_LABELS } from '@/lib/bigfive';
import { getTraitDetail } from '@/lib/bigfive/trait-details';
import { Brain, Users, Target, Heart, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface BigFiveResultViewProps {
  result: BigFiveResult;
  showFacets?: boolean;
}

const TRAIT_CONFIG = {
  openness: { label: '開放性', icon: Brain, color: 'purple', gradient: 'from-purple-500 to-violet-500' },
  conscientiousness: { label: '誠実性', icon: Target, color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
  extraversion: { label: '外向性', icon: Users, color: 'amber', gradient: 'from-amber-500 to-orange-500' },
  agreeableness: { label: '協調性', icon: Heart, color: 'green', gradient: 'from-green-500 to-emerald-500' },
  neuroticism: { label: '情緒安定性', icon: Zap, color: 'rose', gradient: 'from-rose-500 to-pink-500' },
} as const;

const LEVEL_LABELS = {
  very_low: { text: 'とても低い', color: 'text-blue-600' },
  low: { text: '低い', color: 'text-cyan-600' },
  medium: { text: '中程度', color: 'text-gray-600' },
  high: { text: '高い', color: 'text-orange-600' },
  very_high: { text: 'とても高い', color: 'text-red-600' },
};

export default function BigFiveResultView({ result, showFacets = true }: BigFiveResultViewProps) {
  const [expandedTrait, setExpandedTrait] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      {/* MBTI風タイプ表示 */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white text-center shadow-lg">
        <p className="text-sm font-medium text-indigo-200 mb-2">あなたのタイプ</p>
        <p className="text-4xl sm:text-5xl font-bold tracking-wider mb-2">{result.mbtiType.code}</p>
        <p className="text-xl font-semibold text-indigo-100 mb-4">{result.mbtiType.name}</p>
        <p className="text-sm text-indigo-100 leading-relaxed max-w-lg mx-auto">{result.mbtiType.description}</p>

        {/* MBTI 4次元バー */}
        <div className="grid grid-cols-2 gap-3 mt-6 max-w-md mx-auto">
          {Object.entries(result.mbtiType.dimensions).map(([key, dim]) => (
            <div key={key} className="bg-white/15 rounded-xl px-3 py-2">
              <p className="text-xs text-indigo-200">{key}</p>
              <p className="text-sm font-bold">{dim.label}</p>
              <div className="w-full h-1.5 bg-white/20 rounded-full mt-1">
                <div
                  className="h-full bg-white rounded-full"
                  style={{ width: `${Math.min(dim.score, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5特性スコア一覧 */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Big Five スコア</h3>

        {(Object.keys(TRAIT_CONFIG) as (keyof typeof TRAIT_CONFIG)[]).map((traitKey) => {
          const config = TRAIT_CONFIG[traitKey];
          const trait = result.traits[traitKey];
          const detail = getTraitDetail(traitKey, trait.percentage);
          const levelInfo = LEVEL_LABELS[trait.level];
          const isExpanded = expandedTrait === traitKey;
          const Icon = config.icon;

          return (
            <div key={traitKey} className="bg-white border border-gray-300 rounded-2xl shadow-md overflow-hidden">
              {/* ヘッダー */}
              <button
                onClick={() => setExpandedTrait(isExpanded ? null : traitKey)}
                className="w-full flex items-center gap-4 p-4 sm:p-5 text-left hover:bg-gray-50 transition-all"
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900">{config.label}</span>
                    <span className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${levelInfo.color}`}>{levelInfo.text}</span>
                      <span className="text-lg font-bold text-gray-900">{trait.percentage}%</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-700 ease-out`}
                      style={{ width: `${trait.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </button>

              {/* 展開部分 */}
              {isExpanded && (
                <div className="px-4 sm:px-5 pb-5 border-t border-gray-100">
                  {/* タイプ名と説明 */}
                  <div className="mt-4 mb-4">
                    <h4 className="font-bold text-gray-900 mb-2">{detail.title}</h4>
                    <p className="text-sm text-gray-700 leading-relaxed">{detail.description}</p>
                  </div>

                  {/* ファセット詳細 */}
                  {showFacets && result.testType === 'full' && trait.facets.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-semibold text-gray-600 mb-2">ファセット分析</h5>
                      <div className="space-y-2">
                        {trait.facets.filter(f => f.maxScore > 0).map((facet) => (
                          <div key={facet.name} className="flex items-center gap-3">
                            <span className="text-xs text-gray-600 w-20 flex-shrink-0">{facet.label}</span>
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${config.gradient} rounded-full`}
                                style={{ width: `${facet.percentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-500 w-8 text-right">{facet.percentage}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 強み */}
                  <div className="mb-3">
                    <h5 className="text-sm font-semibold text-gray-600 mb-1">強み</h5>
                    <ul className="space-y-1">
                      {detail.strengths.map((s, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">●</span>{s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 成長のヒント */}
                  <div className="mb-3">
                    <h5 className="text-sm font-semibold text-gray-600 mb-1">成長のヒント</h5>
                    <ul className="space-y-1">
                      {detail.growthTips.map((t, i) => (
                        <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">▸</span>{t}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 適職 */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-600 mb-1">適した職業</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {detail.careers.map((c, i) => (
                        <span key={i} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-lg">{c}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
