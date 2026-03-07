const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '..', 'components', 'youtube-keyword-research', 'YouTubeKeywordResearchEditor.tsx');

// Use array join to avoid template literal nesting issues
const lines = [];
lines.push("'use client';");
lines.push("");
lines.push("import React, { useState, useMemo, useEffect, useCallback } from 'react';");
lines.push("import {");
lines.push("  Search, Eye, ThumbsUp, MessageCircle, Calendar, Clock,");
lines.push("  AlertCircle, Loader2, BarChart3, ArrowLeft, Users, TrendingUp,");
lines.push("  Download, ExternalLink, Filter, SlidersHorizontal, History,");
lines.push("  Trash2, ChevronDown, ChevronRight, CheckSquare, Square,");
lines.push("} from 'lucide-react';");
lines.push("import { useRouter } from 'next/navigation';");
lines.push("import {");
lines.push("  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,");
lines.push("  ResponsiveContainer, Cell,");
lines.push("} from 'recharts';");
lines.push("import type { YouTubeVideoData } from '@/lib/youtube';");
lines.push("import { formatNumber, formatDuration } from '@/lib/youtube';");
lines.push("");
lines.push("type SortKey = 'viewCount' | 'likeCount' | 'commentCount' | 'subscriberCount' | 'viewRatio' | 'publishedAt';");
lines.push("type ChartMetric = 'viewCount' | 'likeCount' | 'viewRatio' | 'subscriberCount';");
lines.push("type DateRange = '' | '1month' | '3months' | '6months' | '1year';");
lines.push("");
lines.push("type Props = {");
lines.push("  user: { id: string; email?: string } | null;");
lines.push("  isAdmin: boolean;");
lines.push("};");
lines.push("");
lines.push("type SearchHistoryItem = {");
lines.push("  id: string;");
lines.push("  keyword: string;");
lines.push("  searchedAt: string;");
lines.push("  dateRange: DateRange;");
lines.push("  maxResults: number;");
lines.push("  minViewRatio: number;");
lines.push("  maxSubscribers: number;");
lines.push("  sortKey: SortKey;");
lines.push("  results: YouTubeVideoData[];");
lines.push("  filteredCount: number;");
lines.push("};");
lines.push("");
lines.push("const STORAGE_KEY = 'yt-keyword-research-history';");
lines.push("const MAX_HISTORY = 20;");
lines.push("");
lines.push("const SORT_OPTIONS: { key: SortKey; label: string }[] = [");
lines.push("  { key: 'viewCount', label: '再生数' },");
lines.push("  { key: 'viewRatio', label: '再生倍率' },");
lines.push("  { key: 'subscriberCount', label: '登録者数' },");
lines.push("  { key: 'likeCount', label: '高評価数' },");
lines.push("  { key: 'commentCount', label: 'コメント数' },");
lines.push("  { key: 'publishedAt', label: '公開日' },");
lines.push("];");
lines.push("");
lines.push("const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [");
lines.push("  { value: '', label: '指定なし' },");
lines.push("  { value: '1month', label: '1ヶ月以内' },");
lines.push("  { value: '3months', label: '3ヶ月以内' },");
lines.push("  { value: '6months', label: '6ヶ月以内' },");
lines.push("  { value: '1year', label: '1年以内' },");
lines.push("];");
lines.push("");
lines.push("const CHART_METRICS: { key: ChartMetric; label: string }[] = [");
lines.push("  { key: 'viewCount', label: '再生数' },");
lines.push("  { key: 'viewRatio', label: '再生倍率' },");
lines.push("  { key: 'subscriberCount', label: '登録者数' },");
lines.push("  { key: 'likeCount', label: '高評価' },");
lines.push("];");
lines.push("");
lines.push("function getPublishedAfterISO(range: DateRange): string | undefined {");
lines.push("  if (!range) return undefined;");
lines.push("  const now = new Date();");
lines.push("  switch (range) {");
lines.push("    case '1month': now.setMonth(now.getMonth() - 1); break;");
lines.push("    case '3months': now.setMonth(now.getMonth() - 3); break;");
lines.push("    case '6months': now.setMonth(now.getMonth() - 6); break;");
lines.push("    case '1year': now.setFullYear(now.getFullYear() - 1); break;");
lines.push("  }");
lines.push("  return now.toISOString();");
lines.push("}");
lines.push("");
lines.push("function loadHistory(): SearchHistoryItem[] {");
lines.push("  try {");
lines.push("    const raw = localStorage.getItem(STORAGE_KEY);");
lines.push("    if (!raw) return [];");
lines.push("    return JSON.parse(raw);");
lines.push("  } catch {");
lines.push("    return [];");
lines.push("  }");
lines.push("}");
lines.push("");
lines.push("function saveHistory(history: SearchHistoryItem[]) {");
lines.push("  try {");
lines.push("    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));");
lines.push("  } catch {");
lines.push("    try {");
lines.push("      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 5)));");
lines.push("    } catch {}");
lines.push("  }");
lines.push("}");
lines.push("");
lines.push("const CHART_COLORS = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#22d3ee', '#818cf8', '#e879f9', '#f472b6', '#a78bfa', '#34d399'];");

// Now write the main component as a heredoc-style string
const mainComponent = `
export default function YouTubeKeywordResearchEditor({ user }: Props) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [maxResults, setMaxResults] = useState(20);
  const [dateRange, setDateRange] = useState<DateRange>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<YouTubeVideoData[]>([]);
  const [searchedKeyword, setSearchedKeyword] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('viewCount');
  const [chartMetric, setChartMetric] = useState<ChartMetric>('viewCount');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [showFilters, setShowFilters] = useState(false);
  const [minViewRatio, setMinViewRatio] = useState<number>(0);
  const [maxSubscribers, setMaxSubscribers] = useState<number>(0);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<Set<string>>(new Set());
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const addToHistory = useCallback((
    kw: string,
    data: YouTubeVideoData[],
    opts: { dateRange: DateRange; maxResults: number; minViewRatio: number; maxSubscribers: number; sortKey: SortKey; filteredCount: number }
  ) => {
    const item: SearchHistoryItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      keyword: kw,
      searchedAt: new Date().toISOString(),
      dateRange: opts.dateRange,
      maxResults: opts.maxResults,
      minViewRatio: opts.minViewRatio,
      maxSubscribers: opts.maxSubscribers,
      sortKey: opts.sortKey,
      results: data,
      filteredCount: opts.filteredCount,
    };
    const updated = [item, ...history].slice(0, MAX_HISTORY);
    setHistory(updated);
    saveHistory(updated);
    setActiveHistoryId(item.id);
  }, [history]);

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated);
    saveHistory(updated);
    selectedHistoryIds.delete(id);
    setSelectedHistoryIds(new Set(selectedHistoryIds));
    if (activeHistoryId === id) setActiveHistoryId(null);
  };

  const clearAllHistory = () => {
    setHistory([]);
    saveHistory([]);
    setSelectedHistoryIds(new Set());
    setActiveHistoryId(null);
  };

  const restoreFromHistory = (item: SearchHistoryItem) => {
    setResults(item.results);
    setSearchedKeyword(item.keyword);
    setKeyword(item.keyword);
    setDateRange(item.dateRange);
    setSortKey(item.sortKey);
    setMinViewRatio(item.minViewRatio);
    setMaxSubscribers(item.maxSubscribers);
    setActiveHistoryId(item.id);
    setMobileTab('preview');
  };

  const toggleHistorySelect = (id: string) => {
    const next = new Set(selectedHistoryIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedHistoryIds(next);
  };

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError('キーワードを入力してください');
      return;
    }
    setIsLoading(true);
    setError('');
    setResults([]);

    try {
      const publishedAfter = getPublishedAfterISO(dateRange);
      const res = await fetch('/api/youtube-keyword-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim(), maxResults, publishedAfter }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'エラーが発生しました'); return; }
      setResults(data.data);
      setSearchedKeyword(data.keyword);
      setMobileTab('preview');

      let filtered = data.data as YouTubeVideoData[];
      if (minViewRatio > 0) filtered = filtered.filter((v: YouTubeVideoData) => v.viewRatio >= minViewRatio);
      if (maxSubscribers > 0) filtered = filtered.filter((v: YouTubeVideoData) => v.subscriberCount <= maxSubscribers);
      addToHistory(data.keyword, data.data, { dateRange, maxResults, minViewRatio, maxSubscribers, sortKey, filteredCount: filtered.length });
    } catch {
      setError('通信エラーが発生しました。もう一度お試しください');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); handleSearch(); }
  };

  const filteredResults = useMemo(() => {
    let filtered = [...results];
    if (minViewRatio > 0) filtered = filtered.filter(v => v.viewRatio >= minViewRatio);
    if (maxSubscribers > 0) filtered = filtered.filter(v => v.subscriberCount <= maxSubscribers);
    return filtered;
  }, [results, minViewRatio, maxSubscribers]);

  const sortedResults = useMemo(() => {
    const sorted = [...filteredResults];
    sorted.sort((a, b) => {
      if (sortKey === 'publishedAt') return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      return (b[sortKey] as number) - (a[sortKey] as number);
    });
    return sorted;
  }, [filteredResults, sortKey]);

  const chartData = useMemo(() => {
    return sortedResults.slice(0, 10).map((v, i) => ({
      name: v.title.length > 15 ? v.title.slice(0, 15) + '...' : v.title,
      value: v[chartMetric] as number,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [sortedResults, chartMetric]);

  const formatDateStr = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const buildCSV = (data: YouTubeVideoData[], kw: string, opts: { dateRange: DateRange; maxResults: number; minViewRatio: number; maxSubscribers: number; sortKey: SortKey }) => {
    const today = new Date().toISOString().split('T')[0];
    const dateRangeLabel = DATE_RANGE_OPTIONS.find(o => o.value === opts.dateRange)?.label || '指定なし';
    const sortLabel = SORT_OPTIONS.find(o => o.key === opts.sortKey)?.label || opts.sortKey;
    let filtered = [...data];
    if (opts.minViewRatio > 0) filtered = filtered.filter(v => v.viewRatio >= opts.minViewRatio);
    if (opts.maxSubscribers > 0) filtered = filtered.filter(v => v.subscriberCount <= opts.maxSubscribers);
    filtered.sort((a, b) => {
      if (opts.sortKey === 'publishedAt') return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      return (b[opts.sortKey] as number) - (a[opts.sortKey] as number);
    });
    const cond = [
      '# 検索条件',
      'キーワード,"' + kw + '"',
      '検索日,' + today,
      '公開日フィルター,' + dateRangeLabel,
      '取得件数,' + opts.maxResults + '件',
      '並び替え,' + sortLabel,
      '最低再生倍率,' + (opts.minViewRatio > 0 ? opts.minViewRatio + 'x' : '指定なし'),
      '最大チャンネル登録者数,' + (opts.maxSubscribers > 0 ? formatNumber(opts.maxSubscribers) : '指定なし'),
      'フィルター後件数,' + filtered.length + '件',
      '',
    ];
    const headers = ['順位', 'タイトル', 'チャンネル名', '再生数', 'チャンネル登録数', '再生倍率', '高評価数', 'コメント数', 'エンゲージメント率(%)', '高評価率(%)', '動画時間', '動画公開日', 'タグ', '動画URL'];
    const rows = filtered.map((v, i) => {
      const engRate = v.viewCount > 0 ? (((v.likeCount + v.commentCount) / v.viewCount) * 100).toFixed(2) : '0';
      const likeRate = v.viewCount > 0 ? ((v.likeCount / v.viewCount) * 100).toFixed(2) : '0';
      return [i + 1, '"' + v.title.replace(/"/g, '""') + '"', '"' + v.channelTitle.replace(/"/g, '""') + '"', v.viewCount, v.subscriberCount, v.viewRatio, v.likeCount, v.commentCount, engRate, likeRate, formatDuration(v.duration), v.publishedAt.split('T')[0], '"' + (v.tags || []).join(', ').replace(/"/g, '""') + '"', 'https://www.youtube.com/watch?v=' + v.videoId].join(',');
    });
    return cond.join('\\n') + headers.join(',') + '\\n' + rows.join('\\n');
  };

  const exportToCSV = () => {
    if (sortedResults.length === 0) return;
    const csv = '\\uFEFF' + buildCSV(results, searchedKeyword, { dateRange, maxResults, minViewRatio, maxSubscribers, sortKey });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'youtube_keyword_' + searchedKeyword + '_' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSelectedHistory = () => {
    const selected = history.filter(h => selectedHistoryIds.has(h.id));
    if (selected.length === 0) return;
    const sections = selected.map(h => buildCSV(h.results, h.keyword, { dateRange: h.dateRange, maxResults: h.maxResults, minViewRatio: h.minViewRatio, maxSubscribers: h.maxSubscribers, sortKey: h.sortKey }));
    const csv = '\\uFEFF' + sections.join('\\n\\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'youtube_keyword_history_' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) return null;

  const hasResults = sortedResults.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Editor Header */}
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
          <div className="flex items-center gap-2">
            {selectedHistoryIds.size > 0 && (
              <button onClick={exportSelectedHistory} className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 font-semibold rounded-xl hover:bg-blue-100 transition-colors text-sm min-h-[44px] shadow-sm">
                <Download className="w-4 h-4" />
                履歴CSV出力 ({selectedHistoryIds.size})
              </button>
            )}
            {hasResults && (
              <button onClick={exportToCSV} className="flex items-center gap-1.5 px-4 py-2 bg-green-50 border border-green-200 text-green-700 font-semibold rounded-xl hover:bg-green-100 transition-colors text-sm min-h-[44px] shadow-sm">
                <Download className="w-4 h-4" />
                CSV出力
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="lg:hidden sticky top-[121px] z-30 bg-white border-b border-gray-200 flex">
        <button onClick={() => setMobileTab('editor')} className={"flex-1 py-3 text-sm font-semibold text-center transition-colors " + (mobileTab === 'editor' ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50/50' : 'text-gray-500 hover:text-gray-700')}>
          検索条件
        </button>
        <button onClick={() => setMobileTab('preview')} className={"flex-1 py-3 text-sm font-semibold text-center transition-colors " + (mobileTab === 'preview' ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50/50' : 'text-gray-500 hover:text-gray-700')}>
          検索結果
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row">
        {/* Left panel */}
        <div className={"w-full lg:w-1/2 overflow-y-auto p-4 md:p-6 bg-gray-50 " + (mobileTab === 'preview' ? 'hidden lg:block' : '')}>
          <div className="max-w-xl mx-auto space-y-6">
            {/* Keyword input */}
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-rose-600" />
                <h2 className="text-lg font-bold text-gray-900">キーワード検索</h2>
              </div>
              <input type="text" value={keyword} onChange={(e) => { setKeyword(e.target.value); if (error) setError(''); }} onKeyDown={handleKeyDown} placeholder="例: ダイエット 筋トレ 料理" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all" />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">公開日</label>
                  <select value={dateRange} onChange={(e) => setDateRange(e.target.value as DateRange)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent">
                    {DATE_RANGE_OPTIONS.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">取得件数</label>
                  <select value={maxResults} onChange={(e) => setMaxResults(Number(e.target.value))} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent">
                    <option value={10}>10件</option>
                    <option value={20}>20件</option>
                    <option value={30}>30件</option>
                    <option value={50}>50件</option>
                  </select>
                </div>
              </div>
              {error && (<div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-3"><AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span></div>)}
              <button onClick={handleSearch} disabled={isLoading} className="w-full mt-4 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]">
                {isLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />検索中...</>) : (<><Search className="w-5 h-5" />検索する</>)}
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
              <button onClick={() => setShowFilters(!showFilters)} className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-rose-600" />
                  <h2 className="text-lg font-bold text-gray-900">フィルター</h2>
                </div>
                <Filter className={"w-4 h-4 text-gray-400 transition-transform " + (showFilters ? 'rotate-180' : '')} />
              </button>
              {showFilters && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">最低再生倍率<span className="text-gray-400 font-normal ml-1">(0で無効)</span></label>
                    <input type="number" value={minViewRatio} onChange={(e) => setMinViewRatio(Number(e.target.value))} min={0} step={0.5} placeholder="例: 2.0" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all" />
                    <p className="text-xs text-gray-500 mt-1">再生倍率 = 再生数 / チャンネル登録者数</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">最大チャンネル登録者数<span className="text-gray-400 font-normal ml-1">(0で無効)</span></label>
                    <input type="number" value={maxSubscribers} onChange={(e) => setMaxSubscribers(Number(e.target.value))} min={0} step={10000} placeholder="例: 100000" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all" />
                    <p className="text-xs text-gray-500 mt-1">大手チャンネルを除外して競合を絞り込めます</p>
                  </div>
                  {(minViewRatio > 0 || maxSubscribers > 0) && results.length > 0 && (
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-700">{results.length}件中 {filteredResults.length}件がフィルター条件に一致</div>
                  )}
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-5 h-5 text-rose-600" />
                <h2 className="text-sm font-bold text-gray-900">並び替え</h2>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SORT_OPTIONS.map(o => (
                  <button key={o.key} onClick={() => setSortKey(o.key)} className={"py-2 px-3 rounded-lg text-xs font-semibold transition-all min-h-[36px] " + (sortKey === o.key ? 'bg-rose-500 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            {hasResults && (
              <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">検索サマリー</h3>
                <div className="space-y-2 text-sm">
                  <SummaryRow label="キーワード" value={searchedKeyword} />
                  <SummaryRow label="結果件数" value={sortedResults.length + '件'} />
                  <SummaryRow label="平均再生数" value={formatNumber(Math.round(sortedResults.reduce((s, v) => s + v.viewCount, 0) / sortedResults.length))} />
                  <SummaryRow label="平均再生倍率" value={(sortedResults.reduce((s, v) => s + v.viewRatio, 0) / sortedResults.length).toFixed(2) + 'x'} />
                  <SummaryRow label="平均登録者数" value={formatNumber(Math.round(sortedResults.reduce((s, v) => s + v.subscriberCount, 0) / sortedResults.length))} />
                </div>
              </div>
            )}

            {/* Search History */}
            {history.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
                <button onClick={() => setShowHistory(!showHistory)} className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-rose-600" />
                    <h2 className="text-lg font-bold text-gray-900">検索履歴</h2>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">{history.length}</span>
                  </div>
                  {showHistory ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </button>
                {showHistory && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <button onClick={() => { if (selectedHistoryIds.size === history.length) { setSelectedHistoryIds(new Set()); } else { setSelectedHistoryIds(new Set(history.map(h => h.id))); } }} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                        {selectedHistoryIds.size === history.length ? (<><CheckSquare className="w-3.5 h-3.5" />全選択解除</>) : (<><Square className="w-3.5 h-3.5" />全選択</>)}
                      </button>
                      <button onClick={clearAllHistory} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1">
                        <Trash2 className="w-3 h-3" />全削除
                      </button>
                    </div>
                    {history.map(h => {
                      const isActive = activeHistoryId === h.id;
                      const isSelected = selectedHistoryIds.has(h.id);
                      const dateLabel = DATE_RANGE_OPTIONS.find(o => o.value === h.dateRange)?.label;
                      const searchTime = new Date(h.searchedAt);
                      const timeStr = searchTime.toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                      return (
                        <div key={h.id} className={"rounded-xl border p-3 transition-all " + (isActive ? 'border-rose-300 bg-rose-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50')}>
                          <div className="flex items-start gap-2">
                            <button onClick={(e) => { e.stopPropagation(); toggleHistorySelect(h.id); }} className="mt-0.5 flex-shrink-0">
                              {isSelected ? <CheckSquare className="w-4 h-4 text-rose-500" /> : <Square className="w-4 h-4 text-gray-300 hover:text-gray-500" />}
                            </button>
                            <button onClick={() => restoreFromHistory(h)} className="flex-1 text-left min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-gray-900 truncate">{h.keyword}</span>
                                {isActive && <span className="text-[10px] bg-rose-100 text-rose-600 px-1.5 py-0.5 rounded font-bold flex-shrink-0">表示中</span>}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-gray-500">
                                <span>{timeStr}</span>
                                <span>{h.results.length}件取得</span>
                                {dateLabel && dateLabel !== '指定なし' && <span>{dateLabel}</span>}
                                {h.minViewRatio > 0 && <span>倍率{h.minViewRatio}x+</span>}
                                {h.maxSubscribers > 0 && <span>登録{formatNumber(h.maxSubscribers)}以下</span>}
                              </div>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); deleteHistoryItem(h.id); }} className="flex-shrink-0 p-1 text-gray-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* API note */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-700">
                  <p className="font-semibold mb-1">YouTube API クオータについて</p>
                  <p>1回の検索で約100クオータを消費します（1日の上限: 10,000クオータ）。大量の検索はお控えください。</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className={"w-full lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] flex-col bg-gray-800 border-l border-gray-700 " + (mobileTab === 'editor' ? 'hidden lg:flex' : 'flex')}>
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {!hasResults && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Search className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">検索結果がここに表示されます</p>
                <p className="text-sm">左側にキーワードを入力して「検索する」をクリック</p>
              </div>
            )}
            {isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="text-lg font-semibold">YouTube検索中...</p>
              </div>
            )}
            {hasResults && (
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {CHART_METRICS.map(m => (
                    <button key={m.key} onClick={() => setChartMetric(m.key)} className={"px-3 py-1.5 rounded-lg text-xs font-semibold transition-all " + (chartMetric === m.key ? 'bg-rose-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600')}>
                      {m.label}
                    </button>
                  ))}
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-rose-400" />
                    TOP 10 {CHART_METRICS.find(m => m.key === chartMetric)?.label}
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData} margin={{ left: 10, right: 10, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} angle={-35} textAnchor="end" axisLine={{ stroke: '#4b5563' }} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#4b5563' }} tickFormatter={(v) => v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v >= 1000 ? (v / 1000).toFixed(0) + 'K' : String(v)} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} formatter={(value: number) => [chartMetric === 'viewRatio' ? value + 'x' : formatNumber(value), CHART_METRICS.find(m => m.key === chartMetric)?.label || '']} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                        {chartData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {sortedResults.map((v, i) => (
                  <div key={v.videoId} className="bg-gray-700/50 rounded-xl p-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-36 relative group">
                        <a href={'https://www.youtube.com/watch?v=' + v.videoId} target="_blank" rel="noopener noreferrer">
                          <div className="rounded-lg overflow-hidden">
                            <img src={v.thumbnailUrl} alt={v.title} className="w-full aspect-video object-cover" />
                          </div>
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors rounded-lg flex items-center justify-center">
                            <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </a>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <span className="text-rose-400 font-bold text-xs flex-shrink-0 mt-0.5">#{i + 1}</span>
                          <a href={'https://www.youtube.com/watch?v=' + v.videoId} target="_blank" rel="noopener noreferrer" className="text-white font-bold text-sm leading-snug line-clamp-2 hover:text-rose-300 transition-colors">
                            {v.title}
                          </a>
                        </div>
                        <a href={'https://www.youtube.com/channel/' + v.channelId} target="_blank" rel="noopener noreferrer" className="text-gray-400 text-xs mb-2 block hover:text-rose-300 transition-colors">
                          {v.channelTitle} / {formatDateStr(v.publishedAt)}{v.duration ? ' / ' + formatDuration(v.duration) : ''}
                        </a>
                        <div className="flex flex-wrap gap-2">
                          <MetricBadge icon={Eye} value={formatNumber(v.viewCount)} color="blue" />
                          <MetricBadge icon={Users} value={formatNumber(v.subscriberCount)} color="red" />
                          <MetricBadge icon={TrendingUp} value={v.viewRatio + 'x'} color={v.viewRatio >= 2 ? 'green' : 'gray'} />
                          <MetricBadge icon={ThumbsUp} value={formatNumber(v.likeCount)} color="emerald" />
                          <MetricBadge icon={MessageCircle} value={formatNumber(v.commentCount)} color="amber" />
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

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}

function MetricBadge({ icon: Icon, value, color }: { icon: React.ElementType; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-400', red: 'text-red-400', green: 'text-green-400',
    emerald: 'text-emerald-400', amber: 'text-amber-400', gray: 'text-gray-400',
  };
  return (
    <span className="flex items-center gap-1 text-xs text-gray-300">
      <Icon className={"w-3 h-3 " + (colorMap[color] || 'text-gray-400')} />
      {value}
    </span>
  );
}
`;

const finalContent = lines.join('\n') + '\n' + mainComponent;
fs.writeFileSync(filePath, finalContent, 'utf-8');
console.log('YouTubeKeywordResearchEditor.tsx regenerated with search history!');
