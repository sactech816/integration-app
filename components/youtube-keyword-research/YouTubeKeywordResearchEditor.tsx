'use client';

import React, { useState } from 'react';
import {
  Search, Eye, ThumbsUp, MessageCircle, Calendar,
  AlertCircle, Loader2, BarChart3, ArrowLeft, Users, TrendingUp, AlertTriangle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { YouTubeVideoData } from '@/lib/youtube';
import { formatNumber, formatDuration } from '@/lib/youtube';

type SortKey = 'viewCount' | 'likeCount' | 'commentCount' | 'subscriberCount' | 'viewRatio' | 'publishedAt';
type ChartMetric = 'viewCount' | 'likeCount' | 'commentCount' | 'viewRatio';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'viewCount', label: '再生数' },
  { key: 'likeCount', label: '高評価' },
  { key: 'commentCount', label: 'コメント' },
  { key: 'subscriberCount', label: '登録者数' },
  { key: 'viewRatio', label: '再生倍率' },
  { key: 'publishedAt', label: '公開日' },
];

const CHART_METRICS: { key: ChartMetric; label: string }[] = [
  { key: 'viewCount', label: '再生数' },
  { key: 'likeCount', label: '高評価' },
  { key: 'commentCount', label: 'コメント' },
  { key: 'viewRatio', label: '再生倍率' },
];

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#f97316', '#14b8a6', '#6366f1'];

type Props = {
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
};

export default function YouTubeKeywordResearchEditor({ user }: Props) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [maxResults, setMaxResults] = useState<10 | 20>(10);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<YouTubeVideoData[]>([]);
  const [searchedKeyword, setSearchedKeyword] = useState('');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [sortKey, setSortKey] = useState<SortKey>('viewCount');
  const [chartMetric, setChartMetric] = useState<ChartMetric>('viewCount');

  const handleSearch = async () => {
    if (!keyword.trim()) { setError('キーワードを入力してください'); return; }
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
      setSearchedKeyword(result.keyword);
      setMobileTab('preview');
    } catch {
      setError('通信エラーが発生しました。もう一度お試しください');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); handleSearch(); }
  };

  const sortedResults = [...results].sort((a, b) => {
    if (sortKey === 'publishedAt') return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    return (b[sortKey] as number) - (a[sortKey] as number);
  });

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });

  const chartData = sortedResults.slice(0, 10).map((d, i) => ({
    name: d.title.length > 10 ? d.title.slice(0, 10) + '...' : d.title,
    value: chartMetric === 'viewRatio' ? d.viewRatio : (d[chartMetric] as number),
    color: COLORS[i % COLORS.length],
  }));

  const chartLabel = CHART_METRICS.find(m => m.key === chartMetric)?.label || '';
  const avgViews = results.length > 0 ? Math.round(results.reduce((s, d) => s + d.viewCount, 0) / results.length) : 0;
  const avgRatio = results.length > 0 ? (results.reduce((s, d) => s + d.viewRatio, 0) / results.length).toFixed(2) : '0';
  const maxViews = results.length > 0 ? Math.max(...results.map(d => d.viewCount)) : 0;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard?view=youtube-keyword-research')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-rose-600" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">YouTubeキーワードリサーチ</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:hidden sticky top-[121px] z-30 bg-white border-b border-gray-200 flex">
        <button onClick={() => setMobileTab('editor')} className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${mobileTab === 'editor' ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50/50' : 'text-gray-500 hover:text-gray-700'}`}>キーワード入力</button>
        <button onClick={() => setMobileTab('preview')} className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${mobileTab === 'preview' ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50/50' : 'text-gray-500 hover:text-gray-700'}`}>検索結果</button>
      </div>

      <div className="flex flex-col lg:flex-row">
        <div className={`w-full lg:w-1/2 overflow-y-auto p-4 md:p-6 bg-gray-50 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-rose-600" />
                <h2 className="text-lg font-bold text-gray-900">キーワードを入力</h2>
              </div>
              <input type="text" value={keyword} onChange={(e) => { setKeyword(e.target.value); if (error) setError(''); }} onKeyDown={handleKeyDown} placeholder="例: ダイエット 筋トレ 料理" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all" />
              <div className="flex items-center gap-3 mt-4">
                <span className="text-sm text-gray-600 font-medium">取得件数:</span>
                <div className="flex gap-2">
                  {[10, 20].map((n) => (
                    <button key={n} onClick={() => setMaxResults(n as 10 | 20)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all min-h-[44px] ${maxResults === n ? 'bg-rose-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{n}件</button>
                  ))}
                </div>
              </div>
              {error && (<div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-3"><AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span></div>)}
              <button onClick={handleSearch} disabled={isLoading} className="w-full mt-4 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]">
                {isLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />検索中...</>) : (<><Search className="w-5 h-5" />検索する</>)}
              </button>
            </div>

            {results.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">ソート</h3>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((opt) => (<button key={opt.key} onClick={() => setSortKey(opt.key)} className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all min-h-[36px] ${sortKey === opt.key ? 'bg-rose-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{opt.label}</button>))}
                </div>
              </div>
            )}

            {results.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">サマリー</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">検索キーワード</span><span className="font-bold text-gray-900">{searchedKeyword}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">取得動画数</span><span className="font-bold text-gray-900">{results.length}件</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">平均再生数</span><span className="font-bold text-gray-900">{formatNumber(avgViews)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">最高再生数</span><span className="font-bold text-gray-900">{formatNumber(maxViews)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">平均再生倍率</span><span className="font-bold text-gray-900">{avgRatio}x</span></div>
                </div>
              </div>
            )}

            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-amber-800 font-semibold">APIクオータについて</p>
                <p className="text-xs text-amber-700 mt-1">キーワード検索は1回あたりYouTube APIクオータを多く消費します。1日の検索回数には上限があります。</p>
              </div>
            </div>
          </div>
        </div>

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
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {CHART_METRICS.map((m) => (<button key={m.key} onClick={() => setChartMetric(m.key)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${chartMetric === m.key ? 'bg-rose-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>{m.label}</button>))}
                </div>

                <div className="bg-gray-700/50 rounded-xl p-4">
                  <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-rose-400" />
                    TOP {Math.min(sortedResults.length, 10)} - {chartLabel}
                  </h3>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={chartData} margin={{ left: 10, right: 10, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} axisLine={{ stroke: '#4b5563' }} angle={-30} textAnchor="end" height={60} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#4b5563' }} tickFormatter={(v: number) => chartMetric === 'viewRatio' ? `${v}x` : v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} formatter={(value: number) => [chartMetric === 'viewRatio' ? `${value}x` : formatNumber(value), chartLabel]} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                        {chartData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {sortedResults.map((d, i) => (
                  <div key={d.videoId} className="bg-gray-700/50 rounded-xl p-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-36">
                        <div className="rounded-lg overflow-hidden relative">
                          <img src={d.thumbnailUrl} alt={d.title} className="w-full aspect-video object-cover" />
                          {d.duration && (<span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded">{formatDuration(d.duration)}</span>)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <span className="text-xs font-bold text-gray-500 flex-shrink-0 mt-0.5">#{i + 1}</span>
                          <h3 className="text-white font-bold text-sm leading-snug line-clamp-2">{d.title}</h3>
                        </div>
                        <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
                          {d.channelTitle}<span className="mx-1">&middot;</span><Calendar className="w-3 h-3" />{formatDate(d.publishedAt)}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <MetricBadge icon={Eye} value={formatNumber(d.viewCount)} color="blue" />
                          <MetricBadge icon={ThumbsUp} value={formatNumber(d.likeCount)} color="green" />
                          <MetricBadge icon={MessageCircle} value={formatNumber(d.commentCount)} color="amber" />
                          <MetricBadge icon={Users} value={formatNumber(d.subscriberCount)} color="red" />
                          <MetricBadge icon={TrendingUp} value={`${d.viewRatio}x`} color="purple" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50"></div>
      </div>
    </div>
  );
}

function MetricBadge({ icon: Icon, value, color }: { icon: React.ElementType; value: string; color: 'blue' | 'green' | 'amber' | 'red' | 'purple' }) {
  const colorMap = { blue: 'text-blue-400', green: 'text-green-400', amber: 'text-amber-400', red: 'text-red-400', purple: 'text-purple-400' };
  return (<span className="flex items-center gap-1 text-[11px] text-gray-300"><Icon className={`w-3 h-3 ${colorMap[color]}`} />{value}</span>);
}
