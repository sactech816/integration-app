'use client';

import React from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer
} from 'recharts';
import { Sparkles, TrendingUp, Shield, AlertTriangle, Target } from 'lucide-react';
import { DiagnosisAnalysis, AuthorTraitScores, AUTHOR_TRAIT_LABELS } from './types';

interface DiagnosisAnalysisSectionProps {
  analysis: DiagnosisAnalysis;
}

export const DiagnosisAnalysisSection: React.FC<DiagnosisAnalysisSectionProps> = ({ analysis }) => {
  // recharts用データ変換
  const radarData = Object.entries(analysis.authorTraits).map(([key, value]) => ({
    dimension: AUTHOR_TRAIT_LABELS[key as keyof AuthorTraitScores],
    score: value,
    fullMark: 5,
  }));

  return (
    <div className="space-y-6">
      {/* 著者タイプバッジ */}
      <div className="text-center">
        <div className="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full text-lg font-bold shadow-lg mb-3">
          {analysis.authorType}
        </div>
        <p className="text-gray-600 text-sm leading-relaxed max-w-md mx-auto">
          {analysis.authorTypeDescription}
        </p>
      </div>

      {/* レーダーチャート */}
      <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 rounded-xl p-4">
        <h3 className="text-sm font-bold text-gray-700 mb-2 text-center">著者特性チャート</h3>
        <ResponsiveContainer width="100%" height={260}>
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: '#92400e', fontSize: 12, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 5]}
              tickCount={6}
              tick={{ fill: '#9ca3af', fontSize: 10 }}
            />
            <Radar
              name="スコア"
              dataKey="score"
              stroke="#d97706"
              fill="#f59e0b"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
        {/* スコアバッジ */}
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {radarData.map((item) => (
            <div key={item.dimension} className="flex items-center gap-1 bg-white rounded-full px-3 py-1 text-xs border border-amber-200">
              <span className="font-bold text-amber-700">{item.dimension}</span>
              <span className="text-gray-500">{item.score}/5</span>
            </div>
          ))}
        </div>
      </div>

      {/* SWOT分析 */}
      <div>
        <h3 className="text-sm font-bold text-gray-700 mb-3 text-center">SWOT分析</h3>
        <div className="grid grid-cols-2 gap-0.5 bg-gray-200 rounded-xl overflow-hidden">
          {/* 強み */}
          <div className="bg-green-50 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <TrendingUp className="text-green-600" size={16} />
              <span className="font-bold text-green-800 text-sm">強み</span>
            </div>
            <ul className="space-y-1">
              {analysis.swot.strengths.map((item, i) => (
                <li key={i} className="text-xs text-green-700 leading-relaxed">・{item}</li>
              ))}
            </ul>
          </div>
          {/* 機会 */}
          <div className="bg-blue-50 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Target className="text-blue-600" size={16} />
              <span className="font-bold text-blue-800 text-sm">機会</span>
            </div>
            <ul className="space-y-1">
              {analysis.swot.opportunities.map((item, i) => (
                <li key={i} className="text-xs text-blue-700 leading-relaxed">・{item}</li>
              ))}
            </ul>
          </div>
          {/* 課題 */}
          <div className="bg-yellow-50 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <AlertTriangle className="text-yellow-600" size={16} />
              <span className="font-bold text-yellow-800 text-sm">課題</span>
            </div>
            <ul className="space-y-1">
              {analysis.swot.weaknesses.map((item, i) => (
                <li key={i} className="text-xs text-yellow-700 leading-relaxed">・{item}</li>
              ))}
            </ul>
          </div>
          {/* リスク */}
          <div className="bg-red-50 p-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Shield className="text-red-600" size={16} />
              <span className="font-bold text-red-800 text-sm">リスク</span>
            </div>
            <ul className="space-y-1">
              {analysis.swot.threats.map((item, i) => (
                <li key={i} className="text-xs text-red-700 leading-relaxed">・{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 総合分析 */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <div className="bg-amber-100 p-2 rounded-lg flex-shrink-0">
            <Sparkles className="text-amber-600" size={18} />
          </div>
          <div>
            <p className="font-bold text-amber-800 text-sm mb-2">総合分析</p>
            <p className="text-sm text-amber-900 leading-relaxed">{analysis.summary}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisAnalysisSection;
