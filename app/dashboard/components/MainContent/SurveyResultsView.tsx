'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  BarChart3,
  Users,
  Loader2,
  ExternalLink,
  Copy,
  Check,
  Star,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Survey, SurveyResultData } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// グラフ用のカラーパレット
const COLORS = [
  '#0d9488', // teal-600
  '#06b6d4', // cyan-500
  '#8b5cf6', // violet-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#10b981', // emerald-500
  '#6366f1', // indigo-500
  '#ec4899', // pink-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
];

type SurveyResultsViewProps = {
  survey: Survey;
  onBack: () => void;
};

export default function SurveyResultsView({ survey, onBack }: SurveyResultsViewProps) {
  const [results, setResults] = useState<SurveyResultData[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/survey-results?survey_id=${survey.id}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '結果の取得に失敗しました');
      }

      setResults(data.results || []);
      setTotalResponses(data.total_responses || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [survey.id]);

  const handleCopyUrl = () => {
    const url = `${window.location.origin}/survey/${survey.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = () => {
    fetchResults();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="font-bold text-lg">{survey.title}</h2>
              <p className="text-sm text-purple-200">アンケート結果</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
              title="更新"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => window.open(`/survey/${survey.slug}`, '_blank')}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="アンケートを開く"
            >
              <ExternalLink size={18} />
            </button>
            <button
              onClick={handleCopyUrl}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="URLをコピー"
            >
              {copied ? <Check size={18} className="text-green-300" /> : <Copy size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600 mb-4" />
            <p className="text-gray-600">結果を集計中...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700"
            >
              再試行
            </button>
          </div>
        ) : (
          <>
            {/* 統計サマリー */}
            <div className="mb-8 p-4 bg-purple-50 rounded-xl border border-purple-200">
              <div className="flex items-center justify-center gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                    <Users size={20} />
                    <span className="text-2xl font-bold">{totalResponses}</span>
                  </div>
                  <p className="text-sm text-purple-700">総回答数</p>
                </div>
                <div className="w-px h-12 bg-purple-200" />
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 text-purple-600 mb-1">
                    <BarChart3 size={20} />
                    <span className="text-2xl font-bold">{survey.questions?.length || 0}</span>
                  </div>
                  <p className="text-sm text-purple-700">質問数</p>
                </div>
              </div>
            </div>

            {/* 結果グラフ */}
            {results.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 mb-2">まだ回答がありません</p>
                <p className="text-sm text-gray-400">
                  アンケートURLを共有して回答を集めましょう
                </p>
                <button
                  onClick={handleCopyUrl}
                  className="mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700 inline-flex items-center gap-2"
                >
                  <Copy size={14} /> URLをコピー
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {results.map((result, index) => (
                  <ResultCard key={result.question_id} result={result} index={index} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// 個別の結果カード
function ResultCard({ result, index }: { result: SurveyResultData; index: number }) {
  // グラフ用データを作成
  const chartData = Object.entries(result.counts).map(([key, count], i) => ({
    name: key,
    count,
    percentage: result.total > 0 ? Math.round((count / result.total) * 100) : 0,
    fill: COLORS[i % COLORS.length],
  }));

  // 評価式の場合はソート
  if (result.question_type === 'rating') {
    chartData.sort((a, b) => Number(a.name) - Number(b.name));
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* 質問ヘッダー */}
      <div className="bg-gray-50 px-5 py-4 border-b border-gray-200">
        <h3 className="font-bold text-gray-800 flex items-start gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-100 text-purple-700 rounded-full text-sm flex-shrink-0">
            {index + 1}
          </span>
          <span>{result.question_text}</span>
        </h3>
        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
          <span>{result.total} 件の回答</span>
          {result.question_type === 'rating' && result.average !== undefined && (
            <span className="flex items-center gap-1 text-amber-600 font-bold">
              <Star size={14} className="fill-amber-400" />
              平均 {result.average}
            </span>
          )}
        </div>
      </div>

      {/* グラフ */}
      <div className="p-5">
        {result.total === 0 ? (
          <p className="text-center text-gray-400 py-4">回答がありません</p>
        ) : (
          <>
            {/* 棒グラフ */}
            <div className="h-48 mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" domain={[0, 'dataMax']} tickFormatter={(v) => `${v}`} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value, _name, props) => {
                      const percentage = (props.payload as { percentage?: number })?.percentage ?? 0;
                      return [`${value} 票 (${percentage}%)`, '回答数'];
                    }}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* テキストでの表示（補足） */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {chartData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-2"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <span className="truncate text-gray-700">{item.name}</span>
                  <span className="ml-auto font-bold text-gray-900">{item.percentage}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
