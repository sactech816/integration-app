'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search, ArrowUp, MessageCircle, Clock,
  AlertCircle, Loader2, BarChart3, ArrowLeft, TrendingUp,
  Download, ExternalLink, Filter, SlidersHorizontal, History,
  Trash2, ChevronDown, ChevronRight, CheckSquare, Square, Sparkles, Bot, Copy, Zap, FileText, ChevronUp, Globe, User, Hash, Link2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import type { RedditPostData } from '@/app/api/reddit-keyword-research/route';

type SortKey = 'score' | 'numComments' | 'upvoteRatio' | 'engagementRate' | 'commentScoreRatio' | 'scorePerHour' | 'createdUtc';
type ChartMetric = 'score' | 'numComments' | 'upvoteRatio' | 'engagementRate' | 'scorePerHour';
type TimeFilter = 'hour' | 'day' | 'week' | 'month' | 'year' | 'all';
type SearchSort = 'relevance' | 'hot' | 'top' | 'new' | 'comments';

type Props = {
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
};

type SearchHistoryItem = {
  id: string;
  keyword: string;
  searchedAt: string;
  timeFilter: TimeFilter;
  maxResults: number;
  minScore: number;
  subreddit: string;
  sortKey: SortKey;
  results: RedditPostData[];
  filteredCount: number;
  aiAnalyses?: Record<string, string>;
};

type AIAnalysisType = 'full' | 'subreddit-strategy' | 'keywords' | 'content-ideas' | 'persona' | 'title-pattern';

const AI_ANALYSIS_OPTIONS: { type: AIAnalysisType; label: string; icon: string; desc: string }[] = [
  { type: 'full', label: '総合分析', icon: '📊', desc: '市場概況・トレンド・バイラルパターンを一括分析' },
  { type: 'subreddit-strategy', label: 'サブレディット戦略', icon: '🎯', desc: '最適なサブレディット選定・投稿戦略を提案' },
  { type: 'keywords', label: 'キーワード100選', icon: '🔑', desc: 'ヒットキーワード100選+ニッチキーワード提案' },
  { type: 'content-ideas', label: 'コンテンツ企画', icon: '💡', desc: 'Reddit向け投稿企画・AMA・ディスカッション提案' },
  { type: 'persona', label: 'ペルソナ分析', icon: '👤', desc: 'Redditユーザー層・行動パターンを推定' },
  { type: 'title-pattern', label: 'タイトル分析', icon: '✏️', desc: 'バズるタイトルのパターン分析+テンプレ提案' },
];

const STORAGE_KEY = 'reddit-keyword-research-history';
const MAX_HISTORY = 20;

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'score', label: 'スコア' },
  { key: 'numComments', label: 'コメント数' },
  { key: 'upvoteRatio', label: 'upvote率' },
  { key: 'engagementRate', label: 'エンゲージ率' },
  { key: 'commentScoreRatio', label: 'コメ/スコア比' },
  { key: 'scorePerHour', label: 'スコア/時間' },
  { key: 'createdUtc', label: '投稿日' },
];

const TIME_FILTER_OPTIONS: { value: TimeFilter; label: string }[] = [
  { value: 'all', label: '全期間' },
  { value: 'hour', label: '1時間以内' },
  { value: 'day', label: '24時間以内' },
  { value: 'week', label: '1週間以内' },
  { value: 'month', label: '1ヶ月以内' },
  { value: 'year', label: '1年以内' },
];

const SEARCH_SORT_OPTIONS: { value: SearchSort; label: string }[] = [
  { value: 'relevance', label: '関連性順' },
  { value: 'hot', label: 'Hot' },
  { value: 'top', label: 'Top' },
  { value: 'new', label: '新着順' },
  { value: 'comments', label: 'コメント数順' },
];

const CHART_METRICS: { key: ChartMetric; label: string }[] = [
  { key: 'score', label: 'スコア' },
  { key: 'numComments', label: 'コメント数' },
  { key: 'upvoteRatio', label: 'upvote率' },
  { key: 'engagementRate', label: 'エンゲージ率' },
  { key: 'scorePerHour', label: 'スコア/時間' },
];

function formatNumber(n: number): string {
  if (n >= 10000) return (n / 1000).toFixed(1) + 'K';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

function formatTimeAgo(hoursAgo: number): string {
  if (hoursAgo < 1) return Math.round(hoursAgo * 60) + '分前';
  if (hoursAgo < 24) return Math.round(hoursAgo) + '時間前';
  if (hoursAgo < 24 * 30) return Math.round(hoursAgo / 24) + '日前';
  if (hoursAgo < 24 * 365) return Math.round(hoursAgo / 24 / 30) + 'ヶ月前';
  return Math.round(hoursAgo / 24 / 365 * 10) / 10 + '年前';
}

function loadHistory(): SearchHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch { return []; }
}

function saveHistory(history: SearchHistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
  } catch {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 5))); } catch {}
  }
}

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h4 class="text-white font-bold text-sm mt-4 mb-2">$1</h4>')
    .replace(/^## (.+)$/gm, '<h3 class="text-white font-bold text-base mt-5 mb-2 pb-1 border-b border-gray-600">$1</h3>')
    .replace(/^# (.+)$/gm, '<h2 class="text-white font-bold text-lg mt-6 mb-3">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal">$2</li>')
    .replace(/`([^`]+)`/g, '<code class="bg-gray-600 px-1.5 py-0.5 rounded text-cyan-300 text-xs">$1</code>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
}

const CHART_COLORS = ['#ea580c', '#f97316', '#fb923c', '#4ade80', '#22d3ee', '#818cf8', '#e879f9', '#f472b6', '#a78bfa', '#34d399'];

export default function RedditKeywordResearchEditor({ user }: Props) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [subreddit, setSubreddit] = useState('');
  const [maxResults, setMaxResults] = useState(25);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchSort, setSearchSort] = useState<SearchSort>('relevance');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<RedditPostData[]>([]);
  const [searchedKeyword, setSearchedKeyword] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('score');
  const [chartMetric, setChartMetric] = useState<ChartMetric>('score');
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [showFilters, setShowFilters] = useState(false);
  const [minScore, setMinScore] = useState<number>(0);
  const [minUpvoteRatio, setMinUpvoteRatio] = useState<number>(0);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(true);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<Set<string>>(new Set());
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);

  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [showAiPanel, setShowAiPanel] = useState(false);

  useEffect(() => { setHistory(loadHistory()); }, []);

  const addToHistory = useCallback((kw: string, data: RedditPostData[], opts: { timeFilter: TimeFilter; maxResults: number; minScore: number; subreddit: string; sortKey: SortKey; filteredCount: number }) => {
    const item: SearchHistoryItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      keyword: kw, searchedAt: new Date().toISOString(),
      timeFilter: opts.timeFilter, maxResults: opts.maxResults, minScore: opts.minScore,
      subreddit: opts.subreddit, sortKey: opts.sortKey, results: data,
      filteredCount: opts.filteredCount, aiAnalyses: {},
    };
    const updated = [item, ...history].slice(0, MAX_HISTORY);
    setHistory(updated); saveHistory(updated); setActiveHistoryId(item.id);
  }, [history]);

  const deleteHistoryItem = (id: string) => {
    const updated = history.filter(h => h.id !== id);
    setHistory(updated); saveHistory(updated);
    selectedHistoryIds.delete(id); setSelectedHistoryIds(new Set(selectedHistoryIds));
    if (activeHistoryId === id) setActiveHistoryId(null);
  };

  const clearAllHistory = () => { setHistory([]); saveHistory([]); setSelectedHistoryIds(new Set()); setActiveHistoryId(null); };

  const restoreFromHistory = (item: SearchHistoryItem) => {
    setResults(item.results); setSearchedKeyword(item.keyword); setKeyword(item.keyword);
    setTimeFilter(item.timeFilter); setSortKey(item.sortKey); setMinScore(item.minScore);
    setSubreddit(item.subreddit); setActiveHistoryId(item.id);
    const analyses = item.aiAnalyses || {};
    const lastAnalysis = Object.values(analyses).pop();
    if (lastAnalysis) { setAiAnalysis(lastAnalysis); setShowAiPanel(true); }
    else { setAiAnalysis(null); setShowAiPanel(false); }
    setAiError(''); setMobileTab('preview');
  };

  const toggleHistorySelect = (id: string) => {
    const next = new Set(selectedHistoryIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedHistoryIds(next);
  };

  const handleSearch = async () => {
    if (!keyword.trim()) { setError('キーワードを入力してください'); return; }
    setIsLoading(true); setError(''); setResults([]);

    try {
      const res = await fetch('/api/reddit-keyword-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: keyword.trim(), maxResults, sort: searchSort,
          timeFilter, subreddit: subreddit.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'エラーが発生しました'); return; }
      setResults(data.data); setSearchedKeyword(data.keyword); setMobileTab('preview');

      let filtered = data.data as RedditPostData[];
      if (minScore > 0) filtered = filtered.filter((p: RedditPostData) => p.score >= minScore);
      if (minUpvoteRatio > 0) filtered = filtered.filter((p: RedditPostData) => p.upvoteRatio >= minUpvoteRatio);
      addToHistory(data.keyword, data.data, { timeFilter, maxResults, minScore, subreddit: subreddit.trim(), sortKey, filteredCount: filtered.length });
    } catch {
      setError('通信エラーが発生しました。もう一度お試しください');
    } finally { setIsLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); handleSearch(); }
  };

  const filteredResults = useMemo(() => {
    let filtered = [...results];
    if (minScore > 0) filtered = filtered.filter(p => p.score >= minScore);
    if (minUpvoteRatio > 0) filtered = filtered.filter(p => p.upvoteRatio >= minUpvoteRatio);
    return filtered;
  }, [results, minScore, minUpvoteRatio]);

  const sortedResults = useMemo(() => {
    const sorted = [...filteredResults];
    sorted.sort((a, b) => {
      if (sortKey === 'createdUtc') return b.createdUtc - a.createdUtc;
      return (b[sortKey] as number) - (a[sortKey] as number);
    });
    return sorted;
  }, [filteredResults, sortKey]);

  const chartData = useMemo(() => {
    return sortedResults.slice(0, 10).map((p, i) => ({
      name: p.title.length > 15 ? p.title.slice(0, 15) + '...' : p.title,
      value: p[chartMetric] as number,
      color: CHART_COLORS[i % CHART_COLORS.length],
      id: p.id,
    }));
  }, [sortedResults, chartMetric]);

  const buildCSV = (data: RedditPostData[], kw: string, opts: { timeFilter: TimeFilter; maxResults: number; minScore: number; subreddit: string; sortKey: SortKey }) => {
    const today = new Date().toISOString().split('T')[0];
    const timeLabel = TIME_FILTER_OPTIONS.find(o => o.value === opts.timeFilter)?.label || '全期間';
    const sortLabel = SORT_OPTIONS.find(o => o.key === opts.sortKey)?.label || opts.sortKey;
    let filtered = [...data];
    if (opts.minScore > 0) filtered = filtered.filter(p => p.score >= opts.minScore);
    filtered.sort((a, b) => {
      if (opts.sortKey === 'createdUtc') return b.createdUtc - a.createdUtc;
      return (b[opts.sortKey] as number) - (a[opts.sortKey] as number);
    });
    const cond = ['# 検索条件', 'キーワード,"' + kw + '"', '検索日,' + today, '期間,' + timeLabel, '取得件数,' + opts.maxResults + '件', '並び替え,' + sortLabel, 'サブレディット,' + (opts.subreddit || '指定なし'), '最低スコア,' + (opts.minScore > 0 ? opts.minScore : '指定なし'), 'フィルター後件数,' + filtered.length + '件', ''];
    const headers = ['順位', 'タイトル', 'サブレディット', 'スコア', 'upvote率', 'コメント数', 'エンゲージメント率(%)', 'スコア/時間', '投稿者', '投稿タイプ', 'フレア', '投稿日時', 'URL'];
    const rows = filtered.map((p, i) => {
      const postType = p.isSelf ? 'テキスト' : p.isVideo ? '動画' : 'リンク';
      const date = new Date(p.createdUtc * 1000).toISOString().split('T')[0];
      return [i + 1, '"' + p.title.replace(/"/g, '""') + '"', 'r/' + p.subreddit, p.score, p.upvoteRatio, p.numComments, p.engagementRate, p.scorePerHour, p.author, postType, '"' + (p.linkFlairText || '').replace(/"/g, '""') + '"', date, 'https://www.reddit.com' + p.permalink].join(',');
    });
    return cond.join('\n') + headers.join(',') + '\n' + rows.join('\n');
  };

  const exportToCSV = () => {
    if (sortedResults.length === 0) return;
    const csv = '\uFEFF' + buildCSV(results, searchedKeyword, { timeFilter, maxResults, minScore, subreddit, sortKey });
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = 'reddit_keyword_' + searchedKeyword + '_' + new Date().toISOString().split('T')[0] + '.csv';
    a.click(); URL.revokeObjectURL(url);
  };

  const exportSelectedHistory = () => {
    const selected = history.filter(h => selectedHistoryIds.has(h.id));
    if (selected.length === 0) return;
    const sections = selected.map(h => buildCSV(h.results, h.keyword, { timeFilter: h.timeFilter, maxResults: h.maxResults, minScore: h.minScore, subreddit: h.subreddit, sortKey: h.sortKey }));
    const csv = '\uFEFF' + sections.join('\n\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = 'reddit_keyword_history_' + new Date().toISOString().split('T')[0] + '.csv';
    a.click(); URL.revokeObjectURL(url);
  };

  const handleAIAnalysis = async (analysisType: AIAnalysisType) => {
    if (sortedResults.length === 0) return;
    setAiLoading(true); setAiError(''); setAiAnalysis(null); setShowAiPanel(true);

    try {
      const res = await fetch('/api/reddit-keyword-research/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: searchedKeyword, results: sortedResults, analysisType }),
      });
      const data = await res.json();
      if (!res.ok) { setAiError(data.error || 'AI分析に失敗しました'); return; }
      setAiAnalysis(data.analysis);
      if (activeHistoryId) {
        const updated = history.map(h => {
          if (h.id === activeHistoryId) {
            return { ...h, aiAnalyses: { ...(h.aiAnalyses || {}), [analysisType]: data.analysis } };
          }
          return h;
        });
        setHistory(updated); saveHistory(updated);
      }
    } catch { setAiError('通信エラーが発生しました'); }
    finally { setAiLoading(false); }
  };

  const copyAiAnalysis = () => { if (aiAnalysis) navigator.clipboard.writeText(aiAnalysis); };

  if (!user) return null;
  const hasResults = sortedResults.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard?view=reddit-keyword-research')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-orange-600" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Redditキーワードリサーチ</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {selectedHistoryIds.size > 0 && (
              <button onClick={exportSelectedHistory} className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 font-semibold rounded-xl hover:bg-blue-100 transition-colors text-sm min-h-[44px] shadow-sm">
                <Download className="w-4 h-4" />履歴CSV出力 ({selectedHistoryIds.size})
              </button>
            )}
            {hasResults && (
              <button onClick={exportToCSV} className="flex items-center gap-1.5 px-4 py-2 bg-green-50 border border-green-200 text-green-700 font-semibold rounded-xl hover:bg-green-100 transition-colors text-sm min-h-[44px] shadow-sm">
                <Download className="w-4 h-4" />CSV出力
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="lg:hidden sticky top-[121px] z-30 bg-white border-b border-gray-200 flex">
        <button onClick={() => setMobileTab('editor')} className={"flex-1 py-3 text-sm font-semibold text-center transition-colors " + (mobileTab === 'editor' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50' : 'text-gray-500 hover:text-gray-700')}>検索条件</button>
        <button onClick={() => setMobileTab('preview')} className={"flex-1 py-3 text-sm font-semibold text-center transition-colors " + (mobileTab === 'preview' ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50' : 'text-gray-500 hover:text-gray-700')}>検索結果</button>
      </div>

      <div className="flex flex-col lg:flex-row">
        <div className={"w-full lg:w-1/2 overflow-y-auto p-4 md:p-6 bg-gray-50 " + (mobileTab === 'preview' ? 'hidden lg:block' : '')}>
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-bold text-gray-900">キーワード検索</h2>
              </div>
              <input type="text" value={keyword} onChange={(e) => { setKeyword(e.target.value); if (error) setError(''); }} onKeyDown={handleKeyDown} placeholder="例: marketing, AI tools, productivity" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" />
              <div className="mt-3">
                <label className="text-xs font-semibold text-gray-600 mb-1 block">サブレディット指定（任意）</label>
                <input type="text" value={subreddit} onChange={(e) => setSubreddit(e.target.value)} placeholder="例: marketing, japan, programming" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all text-sm" />
                <p className="text-xs text-gray-500 mt-1">空欄で全Reddit検索。サブレディット名を入力するとそのサブレディット内を検索</p>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">並び順</label>
                  <select value={searchSort} onChange={(e) => setSearchSort(e.target.value as SearchSort)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    {SEARCH_SORT_OPTIONS.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">期間</label>
                  <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as TimeFilter)} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    {TIME_FILTER_OPTIONS.map(o => (<option key={o.value} value={o.value}>{o.label}</option>))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">取得件数</label>
                  <select value={maxResults} onChange={(e) => setMaxResults(Number(e.target.value))} className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value={10}>10件</option><option value={25}>25件</option><option value={50}>50件</option><option value={100}>100件</option>
                  </select>
                </div>
              </div>
              {error && (<div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-3"><AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{error}</span></div>)}
              <button onClick={handleSearch} disabled={isLoading} className="w-full mt-4 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]">
                {isLoading ? (<><Loader2 className="w-5 h-5 animate-spin" />検索中...</>) : (<><Search className="w-5 h-5" />検索する</>)}
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
              <button onClick={() => setShowFilters(!showFilters)} className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-orange-600" /><h2 className="text-lg font-bold text-gray-900">フィルター</h2></div>
                <Filter className={"w-4 h-4 text-gray-400 transition-transform " + (showFilters ? 'rotate-180' : '')} />
              </button>
              {showFilters && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">最低スコア<span className="text-gray-400 font-normal ml-1">(0で無効)</span></label>
                    <input type="number" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} min={0} step={10} placeholder="例: 100" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">最低upvote率<span className="text-gray-400 font-normal ml-1">(0で無効)</span></label>
                    <input type="number" value={minUpvoteRatio} onChange={(e) => setMinUpvoteRatio(Number(e.target.value))} min={0} max={1} step={0.05} placeholder="例: 0.8" className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" />
                    <p className="text-xs text-gray-500 mt-1">0〜1の値。0.8以上で好評な投稿のみ表示</p>
                  </div>
                  {(minScore > 0 || minUpvoteRatio > 0) && results.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">{results.length}件中 {filteredResults.length}件がフィルター条件に一致</div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
              <div className="flex items-center gap-2 mb-3"><BarChart3 className="w-5 h-5 text-orange-600" /><h2 className="text-sm font-bold text-gray-900">並び替え</h2></div>
              <div className="grid grid-cols-3 gap-2">
                {SORT_OPTIONS.map(o => (
                  <button key={o.key} onClick={() => setSortKey(o.key)} className={"py-2 px-3 rounded-lg text-xs font-semibold transition-all min-h-[36px] " + (sortKey === o.key ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}>{o.label}</button>
                ))}
              </div>
            </div>

            {hasResults && <RedditSummary results={sortedResults} keyword={searchedKeyword} />}
            {hasResults && <TitlePatternCard results={sortedResults} />}

            {history.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
                <button onClick={() => setShowHistory(!showHistory)} className="w-full flex items-center justify-between">
                  <div className="flex items-center gap-2"><History className="w-5 h-5 text-orange-600" /><h2 className="text-lg font-bold text-gray-900">検索履歴</h2><span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">{history.length}</span></div>
                  {showHistory ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                </button>
                {showHistory && (
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <button onClick={() => { if (selectedHistoryIds.size === history.length) setSelectedHistoryIds(new Set()); else setSelectedHistoryIds(new Set(history.map(h => h.id))); }} className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1">
                        {selectedHistoryIds.size === history.length ? (<><CheckSquare className="w-3.5 h-3.5" />全選択解除</>) : (<><Square className="w-3.5 h-3.5" />全選択</>)}
                      </button>
                      <button onClick={clearAllHistory} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1"><Trash2 className="w-3 h-3" />全削除</button>
                    </div>
                    {history.map(h => {
                      const isActive = activeHistoryId === h.id;
                      const isSelected = selectedHistoryIds.has(h.id);
                      const timeLabel = TIME_FILTER_OPTIONS.find(o => o.value === h.timeFilter)?.label;
                      const timeStr = new Date(h.searchedAt).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                      return (
                        <div key={h.id} className={"rounded-xl border p-3 transition-all " + (isActive ? 'border-orange-300 bg-orange-50/50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50')}>
                          <div className="flex items-start gap-2">
                            <button onClick={(e) => { e.stopPropagation(); toggleHistorySelect(h.id); }} className="mt-0.5 flex-shrink-0">
                              {isSelected ? <CheckSquare className="w-4 h-4 text-orange-500" /> : <Square className="w-4 h-4 text-gray-300 hover:text-gray-500" />}
                            </button>
                            <button onClick={() => restoreFromHistory(h)} className="flex-1 text-left min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-gray-900 truncate">{h.keyword}</span>
                                {isActive && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded font-bold flex-shrink-0">表示中</span>}
                              </div>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-xs text-gray-500">
                                <span>{timeStr}</span><span>{h.results.length}件取得</span>
                                {timeLabel && timeLabel !== '全期間' && <span>{timeLabel}</span>}
                                {h.subreddit && <span>r/{h.subreddit}</span>}
                                {h.minScore > 0 && <span>スコア{h.minScore}+</span>}
                              </div>
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); deleteHistoryItem(h.id); }} className="flex-shrink-0 p-1 text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-amber-700">
                  <p className="font-semibold mb-1">Reddit APIについて</p>
                  <p>公開JSONエンドポイントを使用しています。レート制限があるため、過度な連続検索はお控えください。</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={"w-full lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] flex-col bg-gray-800 border-l border-gray-700 " + (mobileTab === 'editor' ? 'hidden lg:flex' : 'flex')}>
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {!hasResults && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Search className="w-16 h-16 mb-4 opacity-50" /><p className="text-lg font-semibold mb-2">検索結果がここに表示されます</p><p className="text-sm">左側にキーワードを入力して「検索する」をクリック</p>
              </div>
            )}
            {isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-12 h-12 animate-spin mb-4" /><p className="text-lg font-semibold">Reddit検索中...</p>
              </div>
            )}
            {hasResults && (
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {CHART_METRICS.map(m => (
                    <button key={m.key} onClick={() => setChartMetric(m.key)} className={"px-3 py-1.5 rounded-lg text-xs font-semibold transition-all " + (chartMetric === m.key ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600')}>{m.label}</button>
                  ))}
                </div>
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-orange-400" />TOP 10 {CHART_METRICS.find(m => m.key === chartMetric)?.label}
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData} margin={{ left: 10, right: 10, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} angle={-35} textAnchor="end" axisLine={{ stroke: '#4b5563' }} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#4b5563' }} tickFormatter={(v) => v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : v >= 1000 ? (v / 1000).toFixed(0) + 'K' : String(v)} />
                      <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} labelStyle={{ color: '#d1d5db' }} itemStyle={{ color: '#fff' }} formatter={(value: number) => [chartMetric === 'upvoteRatio' ? (value * 100).toFixed(0) + '%' : chartMetric === 'engagementRate' ? value + '%' : formatNumber(value), CHART_METRICS.find(m => m.key === chartMetric)?.label || '']} />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30} cursor="pointer" onClick={(data: any) => { if (data?.id) { const el = document.getElementById('post-' + data.id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }); } }}>
                        {chartData.map((entry, index) => (<Cell key={index} fill={entry.color} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-gray-700/50 rounded-xl p-4">
                  <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-yellow-400" />AI分析</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {AI_ANALYSIS_OPTIONS.map(opt => {
                      const currentHistory = activeHistoryId ? history.find(h => h.id === activeHistoryId) : null;
                      const hasCached = !!(currentHistory?.aiAnalyses?.[opt.type]);
                      return (
                        <button key={opt.type} onClick={() => {
                          if (hasCached && !aiLoading) { setAiAnalysis(currentHistory!.aiAnalyses![opt.type]); setShowAiPanel(true); setAiError(''); }
                          else handleAIAnalysis(opt.type);
                        }} disabled={aiLoading} className={"p-3 rounded-lg text-left transition-all min-h-[44px] " + (aiLoading ? 'opacity-50 cursor-not-allowed bg-gray-600/50' : hasCached ? 'bg-cyan-900/30 hover:bg-cyan-900/50 border border-cyan-700/50 cursor-pointer' : 'bg-gray-600/50 hover:bg-gray-600 cursor-pointer')}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm">{opt.icon}</span><span className="text-white font-semibold text-xs">{opt.label}</span>
                            {hasCached && <span className="text-[9px] bg-cyan-800/60 text-cyan-300 px-1.5 py-0.5 rounded font-bold">保存済</span>}
                          </div>
                          <p className="text-gray-400 text-[10px] leading-tight">{hasCached ? 'クリックで表示（再分析は長押し）' : opt.desc}</p>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-gray-500 text-[10px] mt-2 text-center">Gemini 2.5 Flash使用 / 1回約0.3円</p>
                </div>

                {showAiPanel && (
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-bold text-sm flex items-center gap-2"><Bot className="w-4 h-4 text-cyan-400" />AI分析レポート</h3>
                      {aiAnalysis && (<button onClick={copyAiAnalysis} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"><Copy className="w-3.5 h-3.5" />コピー</button>)}
                    </div>
                    {aiLoading && (<div className="flex flex-col items-center justify-center py-8 text-gray-400"><Loader2 className="w-8 h-8 animate-spin mb-3" /><p className="text-sm font-semibold">AI分析中...</p><p className="text-xs mt-1">30秒ほどお待ちください</p></div>)}
                    {aiError && (<div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/30 p-3 rounded-lg"><AlertCircle className="w-4 h-4 flex-shrink-0" /><span>{aiError}</span></div>)}
                    {aiAnalysis && (<div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed ai-analysis-content" dangerouslySetInnerHTML={{ __html: renderMarkdown(aiAnalysis) }} />)}
                  </div>
                )}

                {sortedResults.map((p, i) => (
                  <RedditPostCard key={p.id} post={p} index={i} />
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

function RedditSummary({ results, keyword }: { results: RedditPostData[]; keyword: string }) {
  const stats = useMemo(() => {
    const len = results.length;
    if (len === 0) return null;
    const maxScore = Math.max(...results.map(p => p.score));
    const avgScore = Math.round(results.reduce((s, p) => s + p.score, 0) / len);
    const avgComments = Math.round(results.reduce((s, p) => s + p.numComments, 0) / len);
    const avgUpvoteRatio = (results.reduce((s, p) => s + p.upvoteRatio, 0) / len * 100).toFixed(0);
    const avgEngagement = (results.reduce((s, p) => s + p.engagementRate, 0) / len).toFixed(2);

    // Subreddit distribution
    const subCount: Record<string, number> = {};
    results.forEach(p => { subCount[p.subreddit] = (subCount[p.subreddit] || 0) + 1; });
    const topSubs = Object.entries(subCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([sub, count]) => `r/${sub}(${count})`);

    // Post type distribution
    const selfCount = results.filter(p => p.isSelf).length;
    const videoCount = results.filter(p => p.isVideo).length;
    const linkCount = len - selfCount - videoCount;

    // Average age
    const avgHours = results.reduce((s, p) => s + p.hoursAgo, 0) / len;

    return { maxScore, avgScore, avgComments, avgUpvoteRatio, avgEngagement, topSubs, selfCount, videoCount, linkCount, avgHours, total: len };
  }, [results]);

  if (!stats) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-orange-600" />
        <h3 className="text-sm font-bold text-gray-900">検索サマリー</h3>
      </div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
        <SummaryRow label="キーワード" value={keyword} />
        <SummaryRow label="結果件数" value={stats.total + '件'} />
        <SummaryRow label="最高スコア" value={formatNumber(stats.maxScore)} highlight />
        <SummaryRow label="平均スコア" value={formatNumber(stats.avgScore)} />
        <SummaryRow label="平均コメント数" value={formatNumber(stats.avgComments)} />
        <SummaryRow label="平均upvote率" value={stats.avgUpvoteRatio + '%'} />
        <SummaryRow label="平均エンゲージ率" value={stats.avgEngagement + '%'} />
        <SummaryRow label="平均投稿経過" value={formatTimeAgo(stats.avgHours)} />
        <SummaryRow label="テキスト投稿" value={stats.selfCount + '件'} />
        <SummaryRow label="リンク/動画" value={stats.linkCount + '/' + stats.videoCount + '件'} />
      </div>
      {stats.topSubs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-1">活発なサブレディット</div>
          <div className="flex flex-wrap gap-1">
            {stats.topSubs.map((s, i) => (<span key={i} className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-semibold">{s}</span>))}
          </div>
        </div>
      )}
    </div>
  );
}

function TitlePatternCard({ results }: { results: RedditPostData[] }) {
  const stats = useMemo(() => {
    const titles = results.map(p => p.title);
    const hasNumber = titles.filter(t => /\d/.test(t)).length;
    const hasQuestion = titles.filter(t => /[？?]/.test(t)).length;
    const hasExclamation = titles.filter(t => /[！!]/.test(t)).length;
    const hasBrackets = titles.filter(t => /[\[\(]/.test(t)).length;
    const avgLength = Math.round(titles.reduce((s, t) => s + t.length, 0) / titles.length);
    const maxScorePost = results.reduce((best, p) => p.score > best.score ? p : best, results[0]);
    const maxCommentsPost = results.reduce((best, p) => p.numComments > best.numComments ? p : best, results[0]);
    const pct = (n: number) => Math.round((n / titles.length) * 100);
    return { hasNumber: pct(hasNumber), hasQuestion: pct(hasQuestion), hasExclamation: pct(hasExclamation), hasBrackets: pct(hasBrackets), avgLength, maxScorePost, maxCommentsPost };
  }, [results]);

  return (
    <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
      <div className="flex items-center gap-2 mb-3"><FileText className="w-5 h-5 text-orange-600" /><h3 className="text-sm font-bold text-gray-900">タイトルパターン分析</h3></div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <PatternStat label="数字を含む" value={stats.hasNumber + '%'} />
        <PatternStat label="疑問形（?）" value={stats.hasQuestion + '%'} />
        <PatternStat label="感嘆符（!）" value={stats.hasExclamation + '%'} />
        <PatternStat label="括弧[]（）" value={stats.hasBrackets + '%'} />
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex justify-between text-gray-600"><span>平均タイトル文字数</span><span className="font-bold text-gray-900">{stats.avgLength}文字</span></div>
        <div className="flex justify-between text-gray-600"><span>最高スコアタイトル</span><span className="font-bold text-gray-900 text-right max-w-[60%] truncate" title={stats.maxScorePost.title}>{stats.maxScorePost.title}</span></div>
        <div className="flex justify-between text-gray-600"><span>最多コメントタイトル</span><span className="font-bold text-gray-900 text-right max-w-[60%] truncate" title={stats.maxCommentsPost.title}>{stats.maxCommentsPost.title}</span></div>
      </div>
    </div>
  );
}

function PatternStat({ label, value }: { label: string; value: string }) {
  const pct = parseInt(value);
  return (
    <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="flex items-end gap-1.5">
        <span className="text-lg font-bold text-gray-900">{value}</span>
        <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1.5"><div className="h-full bg-orange-500 rounded-full" style={{ width: Math.min(pct, 100) + '%' }} /></div>
      </div>
    </div>
  );
}

function RedditPostCard({ post: p, index: i }: { post: RedditPostData; index: number }) {
  const [showText, setShowText] = useState(false);
  const hasText = p.isSelf && p.selftext.length > 0;
  const postType = p.isSelf ? 'テキスト' : p.isVideo ? '動画' : 'リンク';
  const postTypeColor = p.isSelf ? 'bg-blue-900/30 text-blue-300' : p.isVideo ? 'bg-purple-900/30 text-purple-300' : 'bg-green-900/30 text-green-300';

  return (
    <div id={'post-' + p.id} className="bg-gray-700/50 rounded-xl p-3 scroll-mt-4">
      <div className="flex gap-3">
        {p.thumbnail && (
          <div className="flex-shrink-0 w-20">
            <a href={'https://www.reddit.com' + p.permalink} target="_blank" rel="noopener noreferrer">
              <img src={p.thumbnail} alt="" className="w-full rounded-lg object-cover" />
            </a>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 mb-1">
            <span className="text-orange-400 font-bold text-xs flex-shrink-0 mt-0.5">#{i + 1}</span>
            <a href={'https://www.reddit.com' + p.permalink} target="_blank" rel="noopener noreferrer" className="text-white font-bold text-sm leading-snug line-clamp-2 hover:text-orange-300 transition-colors">{p.title}</a>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 flex-wrap">
            <span className="flex items-center gap-1"><Hash className="w-3 h-3" />r/{p.subreddit}</span>
            <span className="flex items-center gap-1"><User className="w-3 h-3" />{p.author}</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTimeAgo(p.hoursAgo)}</span>
            <span className={"text-[10px] px-1.5 py-0.5 rounded font-semibold " + postTypeColor}>{postType}</span>
            {p.linkFlairText && <span className="text-[10px] bg-gray-600 text-gray-300 px-1.5 py-0.5 rounded font-semibold">{p.linkFlairText}</span>}
          </div>
          <div className="flex flex-wrap gap-2">
            <MetricBadge icon={ArrowUp} value={formatNumber(p.score)} color="orange" />
            <MetricBadge icon={MessageCircle} value={formatNumber(p.numComments)} color="blue" />
            <MetricBadge icon={TrendingUp} value={(p.upvoteRatio * 100).toFixed(0) + '%'} color={p.upvoteRatio >= 0.9 ? 'green' : p.upvoteRatio >= 0.7 ? 'amber' : 'red'} />
            <MetricBadge icon={Zap} value={p.scorePerHour.toLocaleString() + '/h'} color={p.scorePerHour >= 100 ? 'amber' : 'gray'} />
            <MetricBadge icon={Globe} value={formatNumber(p.subredditSubscribers) + '人'} color="gray" />
          </div>
          {!p.isSelf && p.domain && (
            <div className="mt-1.5 flex items-center gap-1 text-[10px] text-gray-500">
              <Link2 className="w-3 h-3" />{p.domain}
            </div>
          )}
        </div>
      </div>
      {hasText && (
        <div className="mt-2">
          <button onClick={() => setShowText(!showText)} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-gray-200 transition-colors">
            <FileText className="w-3 h-3" />{showText ? '本文を閉じる' : '本文を表示'}
            {showText ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showText && (
            <div className="mt-1.5 p-2.5 bg-gray-800/50 rounded-lg text-[11px] text-gray-400 leading-relaxed whitespace-pre-wrap break-all max-h-40 overflow-y-auto">{p.selftext}</div>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (<div className="flex justify-between"><span className="text-gray-600">{label}</span><span className={"font-bold " + (highlight ? "text-orange-600" : "text-gray-900")}>{value}</span></div>);
}

function MetricBadge({ icon: Icon, value, color }: { icon: React.ElementType; value: string; color: string }) {
  const colorMap: Record<string, string> = { blue: 'text-blue-400', red: 'text-red-400', green: 'text-green-400', emerald: 'text-emerald-400', amber: 'text-amber-400', gray: 'text-gray-400', orange: 'text-orange-400' };
  return (<span className="flex items-center gap-1 text-xs text-gray-300"><Icon className={"w-3 h-3 " + (colorMap[color] || 'text-gray-400')} />{value}</span>);
}
