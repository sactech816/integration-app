'use client';

import { ExternalLink, FileText, Award, TrendingUp, ArrowRight } from 'lucide-react';
import type { SubsidyMatch } from '@/lib/subsidy/types';
import { getMatchLabel, getDifficultyLabel } from '@/lib/subsidy/scoring';

interface Props {
  matches: SubsidyMatch[];
  resultId: string | null;
  onPurchase?: (subsidyKey: string) => void;
}

export default function SubsidyResultCards({ matches, resultId, onPurchase }: Props) {
  if (matches.length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-8 text-center">
        <p className="text-gray-600">条件に合う補助金が見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Award className="text-teal-600" size={20} />
        <h2 className="text-lg font-bold text-gray-900">あなたにおすすめの補助金</h2>
      </div>

      {matches.map((match, index) => {
        const matchLabel = getMatchLabel(match.score);
        const diffLabel = getDifficultyLabel(match.difficulty);

        return (
          <div
            key={match.subsidyKey}
            className={`bg-white border rounded-2xl shadow-md overflow-hidden transition-all ${
              index === 0 ? 'border-teal-300 ring-2 ring-teal-100' : 'border-gray-300'
            }`}
          >
            {/* ヘッダー */}
            <div className={`px-6 py-4 border-b ${
              index === 0 ? 'bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200' : 'bg-gray-50 border-gray-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                      index === 0 ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {match.rank}位
                    </span>
                    <span className={`text-xs font-medium ${matchLabel.color}`}>
                      適合度: {matchLabel.label}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">{match.name}</h3>
                </div>
                <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium ${diffLabel.bg} ${diffLabel.color}`}>
                  {diffLabel.label}
                </span>
              </div>
            </div>

            {/* コンテンツ */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700 leading-relaxed">{match.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-teal-50 rounded-xl p-3">
                  <p className="text-xs text-teal-600 font-medium mb-1">補助上限額</p>
                  <p className="text-lg font-bold text-teal-900">{match.maxAmount}</p>
                </div>
                <div className="bg-cyan-50 rounded-xl p-3">
                  <p className="text-xs text-cyan-600 font-medium mb-1">補助率</p>
                  <p className="text-lg font-bold text-cyan-900">{match.subsidyRate}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 font-medium mb-1">対象者</p>
                <p className="text-sm text-gray-700">{match.eligibilitySummary}</p>
              </div>

              {/* アクションボタン */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                {onPurchase && resultId && (
                  <button
                    onClick={() => onPurchase(match.subsidyKey)}
                    className="flex-1 h-12 px-4 font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 rounded-xl shadow-md hover:shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
                  >
                    <FileText size={16} />
                    申請書をAIで作成する
                    <ArrowRight size={14} />
                  </button>
                )}
                {match.officialUrl && (
                  <a
                    href={match.officialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-12 px-4 font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={14} />
                    公式サイト
                  </a>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* スコアの注意書き */}
      <p className="text-xs text-gray-400 text-center mt-4">
        ※ この診断結果は参考情報です。実際の申請要件は各補助金の公式サイトでご確認ください。
      </p>
    </div>
  );
}
