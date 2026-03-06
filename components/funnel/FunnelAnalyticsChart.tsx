'use client';

import { useState, useEffect } from 'react';
import { BarChart2, Loader2, Lock, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

interface StepAnalytics {
  stepId: string;
  name: string;
  orderIndex: number;
  views: number;
  clicks: number;
  completes: number;
}

interface FunnelAnalyticsChartProps {
  funnelId: string;
  funnelName: string;
  userId: string;
  isUnlocked: boolean;
  onNavigate?: (path: string) => void;
}

export default function FunnelAnalyticsChart({
  funnelId,
  funnelName,
  userId,
  isUnlocked,
  onNavigate,
}: FunnelAnalyticsChartProps) {
  const [analytics, setAnalytics] = useState<StepAnalytics[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded && isUnlocked && analytics.length === 0) {
      fetchAnalytics();
    }
  }, [expanded, isUnlocked]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/funnel/${funnelId}/analytics?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.analytics || []);
      }
    } catch {
      // silent
    }
    setLoading(false);
  };

  // 最大PVを基準にバーの幅を計算
  const maxViews = Math.max(...analytics.map((s) => s.views), 1);

  // 遷移率計算
  const getTransitionRate = (index: number): number | null => {
    if (index === 0) return null;
    const prev = analytics[index - 1];
    const curr = analytics[index];
    if (!prev || prev.views === 0) return null;
    return Math.round((curr.views / prev.views) * 100);
  };

  // 離脱率計算
  const getDropoffRate = (index: number): number | null => {
    const rate = getTransitionRate(index);
    if (rate === null) return null;
    return 100 - rate;
  };

  // 全体コンバージョン率
  const overallConversion =
    analytics.length >= 2 && analytics[0].views > 0
      ? Math.round((analytics[analytics.length - 1].views / analytics[0].views) * 100)
      : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* 折りたたみヘッダー */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BarChart2 size={16} className="text-amber-600" />
          <span className="font-semibold text-sm text-gray-700">{funnelName}</span>
          {!isUnlocked && (
            <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5">
              <Lock size={9} /> Pro
            </span>
          )}
          {overallConversion !== null && isUnlocked && expanded && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
              CV {overallConversion}%
            </span>
          )}
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {/* コンテンツ */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100">
          {!isUnlocked ? (
            <div className="py-6 text-center">
              <div className="bg-amber-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart2 size={24} className="text-amber-600" />
              </div>
              <p className="text-gray-600 text-sm mb-3">
                ステップごとの詳細解析は有料プランでご利用いただけます。
              </p>
              <button
                onClick={() => onNavigate?.('/#create-section')}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-2 px-5 rounded-lg text-sm flex items-center gap-2 mx-auto transition-all shadow-md"
              >
                <Sparkles size={14} />
                料金プランを見る
              </button>
            </div>
          ) : loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
            </div>
          ) : analytics.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">データがありません</p>
          ) : (
            <div className="pt-3 space-y-1">
              {/* サマリー行 */}
              <div className="flex items-center justify-between text-xs text-gray-500 px-1 pb-2 border-b border-gray-100">
                <span>ステップ</span>
                <div className="flex items-center gap-4">
                  <span className="w-14 text-right">PV</span>
                  <span className="w-14 text-right">CTA</span>
                  <span className="w-14 text-right">遷移率</span>
                  <span className="w-14 text-right">離脱率</span>
                </div>
              </div>

              {/* ファネルバー */}
              {analytics.map((step, i) => {
                const barWidth = Math.max((step.views / maxViews) * 100, 4);
                const transitionRate = getTransitionRate(i);
                const dropoffRate = getDropoffRate(i);
                const ctaRate = step.views > 0 ? Math.round((step.clicks / step.views) * 100) : 0;

                return (
                  <div key={step.stepId}>
                    {/* 離脱インジケーター（2ステップ目以降） */}
                    {dropoffRate !== null && dropoffRate > 0 && (
                      <div className="flex justify-end pr-1 -my-0.5">
                        <span className="text-[10px] text-red-400 font-medium">
                          -{dropoffRate}%
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 py-1.5">
                      {/* ステップ番号 */}
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>

                      {/* ファネルバー + 名前 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-gray-800 truncate">
                            {step.name}
                          </span>
                        </div>
                        <div className="relative h-6 bg-gray-100 rounded-lg overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 rounded-lg transition-all duration-500 ease-out"
                            style={{
                              width: `${barWidth}%`,
                              background: `linear-gradient(90deg, #f59e0b ${0}%, #d97706 ${100}%)`,
                            }}
                          />
                          <div className="absolute inset-0 flex items-center px-2">
                            <span className="text-xs font-bold text-white drop-shadow-sm">
                              {step.views.toLocaleString()} PV
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 数値列 */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <span className="w-14 text-right text-sm font-bold text-blue-600">
                          {step.views.toLocaleString()}
                        </span>
                        <span className="w-14 text-right text-sm text-gray-600">
                          {step.clicks}
                          {ctaRate > 0 && (
                            <span className="text-[10px] text-green-600 ml-0.5">({ctaRate}%)</span>
                          )}
                        </span>
                        <span className="w-14 text-right text-sm font-bold">
                          {transitionRate !== null ? (
                            <span className={transitionRate >= 50 ? 'text-green-600' : transitionRate >= 25 ? 'text-amber-600' : 'text-red-500'}>
                              {transitionRate}%
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </span>
                        <span className="w-14 text-right text-sm">
                          {dropoffRate !== null ? (
                            <span className={dropoffRate <= 25 ? 'text-green-600' : dropoffRate <= 50 ? 'text-amber-600' : 'text-red-500'}>
                              {dropoffRate}%
                            </span>
                          ) : (
                            <span className="text-gray-300">-</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 全体コンバージョン */}
              {overallConversion !== null && (
                <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    全体コンバージョン率
                  </span>
                  <span className={`text-lg font-bold ${overallConversion >= 10 ? 'text-green-600' : overallConversion >= 5 ? 'text-amber-600' : 'text-red-500'}`}>
                    {overallConversion}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
