'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Eye,
  ThumbsUp,
  MessageCircle,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ArrowUpDown,
  BarChart3,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
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
import type { YouTubeVideoData } from '@/lib/youtube';
import { formatNumber, formatDuration } from '@/lib/youtube';

type SortKey = 'viewCount' | 'likeCount' | 'commentCount' | 'subscriberCount' | 'viewRatio' | 'publishedAt';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'viewCount', label: '再生数' },
  { key: 'likeCount', label: '高評価' },
  { key: 'commentCount', label: 'コメント' },
  { key: 'subscriberCount', label: '登録者数' },
  { key: 'viewRatio', label: '再生倍率' },
  { key: 'publishedAt', label: '公開日' },
];

const CHART_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6'];

type Props = {
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
};

export default function YouTubeKeywordResearchEditor({ user }: Props) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [maxResults, setMaxResults] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<YouTubeVideoData[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>('viewCount');
  const [sortDesc, setSortDesc] = useState(true);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [chartMetric, setChartMetric] = useState<SortKey>('viewCount');

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError('キーワードを入力してください');
      return;
    }

    setIsLoading(true);
    setError('');
    setResults([]);

    try {
      const res = await fetch('/api/youtube-keyword-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim(), maxResults }),
      });
      const result = await res.json();
      if (!res.ok) { setError(result.error || 'エラーが発生しました'); return; }
      setResults(result.data);
      setMobileTab('preview');
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleSortToggle = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc(!sortDesc);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  const sortedResults = useMemo(() => {
    return [...results].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      if (sortKey === 'publishedAt') {
        aVal = new Date(a.publishedAt).getTime();
        bVal = new Date(b.publishedAt).getTime();
      } else {
        aVal = a[sortKey];
        bVal = b[sortKey];
      }

      return sortDesc ? (bVal > aVal ? 1 : -1) : (aVal > bVal ? 1 : -1);
    });
  }, [results, sortKey, sortDesc]);

  const chartData = useMemo(() => {
    const sorted = [...results].sort((a, b) => {
      const aVal = chartMetric === 'publishedAt' ? new Date(a.publishedAt).getTime() : a[chartMetric] as number;
      const bVal = chartMetric === 'publishedAt' ? new Date(b.publishedAt).getTime() : b[chartMetric] as number;
      return bVal - aVal;
    });
    return sorted.slice(0, 10).map((d, i) => ({
      name: d.title.length > 10 ? d.title.slice(0, 10) + '...' : d.title,
      value: chartMetric === 'publishedAt' ? 0 : d[chartMetric] as number,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [results, chartMetric]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const metricLabel = (key: SortKey) => SORT_OPTIONS.find((o) => o.key === key)?.label || '';

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* エディタヘッダー */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-cyan-600" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">YouTubeキーワードリサーチ</h1>
            </div>
          </div>
        </div>
      </div>

      {/* モバイルタブ */}
      <div className="lg:hidden sticky top-[121px] z-30 bg-white border-b border-gray-200 flex">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
            mobileTab === 'editor'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          キーワード入力
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
            mobileTab === 'preview'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          検索結果
        </button>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* 左パネル */}
        <div className={`w-full lg:w-1/2 overflow-y-auto p-4 md:p-6 bg-gray-50 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>
          <div className="max-w-xl mx-auto space-y-6">
            {/* キーワード入力 */}
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-cyan-600" />
                <h2 className="text-lg font-bold text-gray-900">キーワードで検索</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                YouTubeで検索するキーワードを入力すると、上位動画の指標を一覧表示します
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => { setKeyword(e.target.value); if (error) setError(''); }}
                  onKeyDown={handleKeyDown}
                  placeholder="例: プログラミング 初心者"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />

                <div className="flex gap-3 items-center">
                  <label className="text-sm text-gray-600 whitespace-nowrap">表示件数:</label>
                  <select
                    value={maxResults}
                    onChange={(e) => setMaxResults(parseInt(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10件</option>
                    <option value={20}>20件</option>
                    <option value={30}>30件</option>
                  </select>
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleSearch}
                  disabled={isLoading || !keyword.trim()}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />検索中...</>
                  ) : (
                    <><Search className="w-5 h-5" />検索する</>
                  )}
                </button>
              </div>
            </div>

            {/* ソート */}
            {results.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  並べ替え
                </h3>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => handleSortToggle(opt.key)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors min-h-[36px] ${
                        sortKey === opt.key
                          ? 'bg-blue-500 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {opt.label} {sortKey === opt.key && (sortDesc ? '↓' : '↑')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 検索結果サマリー */}
            {results.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">検索結果サマリー</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">検索結果数</span>
                    <span className="font-bold text-gray-900">{results.length}件</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">平均再生回数</span>
                    <span className="font-bold text-gray-900">
                      {formatNumber(Math.round(results.reduce((s, r) => s + r.viewCount, 0) / results.length))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">平均再生倍率</span>
                    <span className="font-bold text-gray-900">
                      {(results.reduce((s, r) => s + r.viewRatio, 0) / results.length).toFixed(2)}x
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">最高再生回数</span>
                    <span className="font-bold text-gray-900">
                      {formatNumber(Math.max(...results.map((r) => r.viewCount)))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* API注意 */}
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4">
              <p className="text-xs text-amber-700">
                YouTube Search APIはクオータを多く消費します（1検索=100ユニット）。1日のAPI利用制限にご注意ください。
              </p>
            </div>
          </div>
        </div>

        {/* 右パネル */}
        <div className={`w-full lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] flex-col bg-gray-800 border-l border-gray-700 ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {results.length === 0 && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Search className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">検索結果がここに表示されます</p>
                <p className="text-sm">左側にキーワードを入力して「検索する」をクリック</p>
              </div>
            )}

            {isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="text-lg font-semibold">検索中...</p>
              </div>
            )}

            {results.length > 0 && (
              <div className="space-y-4">
                {/* チャートメトリック切替 */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-gray-400 text-xs">グラフ指標:</span>
                  {SORT_OPTIONS.filter((o) => o.key !== 'publishedAt').map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => setChartMetric(opt.key)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                        chartMetric === opt.key
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* 比較チャート */}
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    TOP 10 - {metricLabel(chartMetric)}
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData} margin={{ left: 10, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} axisLine={{ stroke: '#4b5563' }} angle={-20} textAnchor="end" height={50} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#4b5563' }} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                        formatter={(value: number) => [chartMetric === 'viewRatio' ? `${value}x` : formatNumber(value), metricLabel(chartMetric)]}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* 動画カードリスト */}
                <div className="space-y-2">
                  {sortedResults.map((d, i) => (
                    <div key={d.videoId} className="bg-gray-700/50 rounded-xl p-3 hover:bg-gray-700/70 transition-colors">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 w-32 sm:w-36">
                          <div className="relative rounded-lg overflow-hidden">
                            <img src={d.thumbnailUrl} alt={d.title} className="w-full aspect-video object-cover" />
                            {d.duration && (
                              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1 rounded">
                                {formatDuration(d.duration)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-1.5 mb-1">
                            <span className="text-gray-500 text-xs font-mono mt-0.5 flex-shrink-0">{i + 1}.</span>
                            <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">{d.title}</h3>
                          </div>
                          <p className="text-gray-400 text-xs mb-2 flex items-center gap-2">
                            <span>{d.channelTitle}</span>
                            <span className="flex items-center gap-0.5">
                              <Calendar className="w-3 h-3" />
                              {formatDate(d.publishedAt)}
                            </span>
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-x-2 gap-y-1 text-[11px]">
                            <MetricBadge icon={Eye} value={formatNumber(d.viewCount)} />
                            <MetricBadge icon={ThumbsUp} value={formatNumber(d.likeCount)} />
                            <MetricBadge icon={MessageCircle} value={formatNumber(d.commentCount)} />
                            <MetricBadge icon={Users} value={formatNumber(d.subscriberCount)} />
                            <MetricBadge icon={TrendingUp} value={`${d.viewRatio}x`} highlight />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* スペーサー */}
        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50"></div>
      </div>
    </div>
  );
}

function MetricBadge({
  icon: Icon,
  value,
  highlight,
}: {
  icon: React.ElementType;
  value: string;
  highlight?: boolean;
}) {
  return (
    <span className={`flex items-center gap-0.5 ${highlight ? 'text-blue-400 font-semibold' : 'text-gray-400'}`}>
      <Icon className="w-3 h-3" />
      <span>{value}</span>
    </span>
  );
}
