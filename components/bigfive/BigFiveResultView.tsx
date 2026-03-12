'use client';

import { BigFiveResult, FACET_LABELS } from '@/lib/bigfive';
import type { EnneagramResult } from '@/lib/bigfive';
import { getTraitDetail } from '@/lib/bigfive/trait-details';
import { getPersonalityTypeDetail } from '@/lib/bigfive/personality-types';
import { Brain, Users, Target, Heart, Zap, ChevronDown, ChevronUp, Compass, Star, Sparkles, ThumbsUp, AlertCircle, HeartHandshake, User } from 'lucide-react';
import { useState } from 'react';

interface BigFiveResultViewProps {
  result: BigFiveResult;
  enneagramResult?: EnneagramResult;
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

const DISC_CONFIG = {
  D: { label: '主導型', color: 'from-red-500 to-rose-600', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' },
  I: { label: '感化型', color: 'from-yellow-500 to-amber-600', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' },
  S: { label: '安定型', color: 'from-green-500 to-emerald-600', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' },
  C: { label: '慎重型', color: 'from-blue-500 to-indigo-600', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
};

const TRIAD_LABELS = {
  gut: { name: '本能センター', color: 'text-red-600', bg: 'bg-red-50' },
  heart: { name: '感情センター', color: 'text-pink-600', bg: 'bg-pink-50' },
  head: { name: '思考センター', color: 'text-blue-600', bg: 'bg-blue-50' },
};

export default function BigFiveResultView({ result, enneagramResult, showFacets = true }: BigFiveResultViewProps) {
  const [expandedTrait, setExpandedTrait] = useState<string | null>(null);
  const hasFacets = result.testType === 'full' || result.testType === 'detailed';
  const typeDetail = getPersonalityTypeDetail(result.mbtiType.code);

  return (
    <div className="space-y-8">
      {/* 16パーソナリティタイプ表示 */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 sm:p-8 text-white text-center shadow-lg">
        <p className="text-sm font-medium text-indigo-200 mb-2">あなたの16パーソナリティタイプ</p>
        <p className="text-4xl sm:text-5xl font-bold tracking-wider mb-1">{result.mbtiType.code}</p>
        <p className="text-xl font-semibold text-indigo-100">{result.mbtiType.name}</p>
        {typeDetail && (
          <p className="text-sm font-medium text-indigo-200 mb-3">— {typeDetail.nickname} —</p>
        )}
        <p className="text-sm text-indigo-100 leading-relaxed max-w-lg mx-auto">
          {typeDetail?.description || result.mbtiType.description}
        </p>

        {/* キーワードタグ */}
        {typeDetail && (
          <div className="flex flex-wrap gap-2 justify-center mt-4">
            {typeDetail.keywords.map((kw, i) => (
              <span key={i} className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium text-white">
                {kw}
              </span>
            ))}
          </div>
        )}

        {/* 4次元バー */}
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

      {/* タイプ詳細情報 */}
      {typeDetail && (
        <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-gray-900">{result.mbtiType.code} タイプの特徴</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-5">
            {/* 強み */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <ThumbsUp className="w-4 h-4 text-green-600" />
                <h4 className="text-sm font-bold text-green-800">強み</h4>
              </div>
              <ul className="space-y-1.5">
                {typeDetail.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5 flex-shrink-0">+</span>{s}
                  </li>
                ))}
              </ul>
            </div>

            {/* 弱み */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <h4 className="text-sm font-bold text-amber-800">注意点</h4>
              </div>
              <ul className="space-y-1.5">
                {typeDetail.weaknesses.map((w, i) => (
                  <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5 flex-shrink-0">!</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 相性の良いタイプ & 有名人 */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <HeartHandshake className="w-4 h-4 text-purple-600" />
                <h4 className="text-sm font-bold text-purple-800">相性の良いタイプ</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {typeDetail.compatibleTypes.map((ct, i) => (
                  <span key={i} className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm font-bold">
                    {ct}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-indigo-800">同じタイプの有名人</h4>
              </div>
              <ul className="space-y-1">
                {typeDetail.famousPeople.map((fp, i) => (
                  <li key={i} className="text-sm text-indigo-700">{fp}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* DISC行動スタイル */}
      {result.discType && (
        <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Compass className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">DISC 行動スタイル</h3>
          </div>

          {/* プライマリタイプ */}
          <div className={`${DISC_CONFIG[result.discType.primary].bgColor} ${DISC_CONFIG[result.discType.primary].borderColor} border rounded-xl p-4 mb-4`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${DISC_CONFIG[result.discType.primary].color} flex items-center justify-center`}>
                <span className="text-white font-bold text-lg">{result.discType.primary}</span>
              </div>
              <div>
                <p className={`font-bold ${DISC_CONFIG[result.discType.primary].textColor}`}>
                  {result.discType.name}
                </p>
                <p className="text-xs text-gray-500">
                  サブスタイル: {DISC_CONFIG[result.discType.secondary].label}（{result.discType.secondary}）
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{result.discType.description}</p>
          </div>

          {/* 4タイプスコアバー */}
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(DISC_CONFIG) as ('D' | 'I' | 'S' | 'C')[]).map((key) => {
              const config = DISC_CONFIG[key];
              const score = result.discType.scores[key];
              const isPrimary = key === result.discType.primary;
              return (
                <div key={key} className={`rounded-xl p-3 ${isPrimary ? `${config.bgColor} ${config.borderColor} border` : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-sm font-semibold ${isPrimary ? config.textColor : 'text-gray-600'}`}>
                      {key} - {config.label}
                    </span>
                    <span className={`text-sm font-bold ${isPrimary ? config.textColor : 'text-gray-500'}`}>{score}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${config.color} rounded-full transition-all duration-700`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* エニアグラム */}
      {enneagramResult && (
        <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-gray-900">エニアグラム</h3>
          </div>

          {/* メインタイプ */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <span className="text-white font-bold text-xl">{enneagramResult.primaryType}</span>
              </div>
              <div>
                <p className="font-bold text-gray-900 text-lg">{enneagramResult.name}</p>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-amber-700">ウィング: {enneagramResult.wing}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${TRIAD_LABELS[enneagramResult.triad].bg} ${TRIAD_LABELS[enneagramResult.triad].color} font-medium`}>
                    {TRIAD_LABELS[enneagramResult.triad].name}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{enneagramResult.description}</p>
          </div>

          {/* 9タイプスコア */}
          <div className="space-y-2">
            {Object.entries(enneagramResult.scores)
              .sort(([, a], [, b]) => b - a)
              .map(([typeNum, score]) => {
                const isPrimary = parseInt(typeNum) === enneagramResult.primaryType;
                return (
                  <div key={typeNum} className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isPrimary ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {typeNum}
                    </span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isPrimary ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gray-300'
                        }`}
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium w-8 text-right ${isPrimary ? 'text-amber-700' : 'text-gray-500'}`}>
                      {score}%
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

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
                  {showFacets && hasFacets && trait.facets.length > 0 && (
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
