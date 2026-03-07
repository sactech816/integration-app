const fs = require('fs');
const path = require('path');

// 1. API Route
const apiRoute = `import { NextRequest, NextResponse } from 'next/server';
import { calcViewRatio } from '@/lib/youtube';
import type { YouTubeVideoData } from '@/lib/youtube';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

async function fetchYouTubeAPI(endpoint: string, params: Record<string, string>, apiKey: string) {
  const searchParams = new URLSearchParams({ ...params, key: apiKey });
  const res = await fetch(\`\${YOUTUBE_API_BASE}/\${endpoint}?\${searchParams}\`);

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(\`YouTube API error (\${endpoint}):\`, res.status, errorBody);
    throw { status: res.status, body: errorBody };
  }

  return res.json();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, maxResults = 20, publishedAfter } = body;

    if (!keyword || typeof keyword !== 'string' || !keyword.trim()) {
      return NextResponse.json(
        { error: 'キーワードを入力してください' },
        { status: 400 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'YouTube APIが設定されていません。管理者にお問い合わせください' },
        { status: 500 }
      );
    }

    const searchParams: Record<string, string> = {
      part: 'snippet',
      type: 'video',
      q: keyword.trim(),
      maxResults: String(Math.min(maxResults, 50)),
      order: 'relevance',
    };

    if (publishedAfter) {
      searchParams.publishedAfter = publishedAfter;
    }

    let searchData;
    try {
      searchData = await fetchYouTubeAPI('search', searchParams, apiKey);
    } catch (err: any) {
      if (err.status === 403) {
        return NextResponse.json(
          { error: 'API利用制限に達しました。しばらく時間をおいてお試しください' },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { error: \`YouTube APIエラー: \${err.body || '不明なエラー'}\` },
        { status: err.status || 500 }
      );
    }

    if (!searchData.items || searchData.items.length === 0) {
      return NextResponse.json(
        { error: '検索結果が見つかりませんでした。別のキーワードをお試しください' },
        { status: 404 }
      );
    }

    const videoIds = searchData.items.map((item: any) => item.id.videoId).filter(Boolean);

    if (videoIds.length === 0) {
      return NextResponse.json(
        { error: '動画データを取得できませんでした' },
        { status: 404 }
      );
    }

    const videosData = await fetchYouTubeAPI('videos', {
      part: 'snippet,statistics,contentDetails',
      id: videoIds.join(','),
    }, apiKey);

    if (!videosData.items || videosData.items.length === 0) {
      return NextResponse.json(
        { error: '動画の詳細データを取得できませんでした' },
        { status: 404 }
      );
    }

    const channelIds = [...new Set(videosData.items.map((item: any) => item.snippet.channelId))] as string[];
    const channelStatsMap: Record<string, number> = {};

    try {
      const channelsData = await fetchYouTubeAPI('channels', {
        part: 'statistics',
        id: channelIds.join(','),
      }, apiKey);

      for (const ch of channelsData.items || []) {
        channelStatsMap[ch.id] = parseInt(ch.statistics.subscriberCount || '0');
      }
    } catch (err) {
      console.error('Channel data fetch failed:', err);
    }

    const results: YouTubeVideoData[] = videosData.items.map((item: any) => {
      const channelId = item.snippet.channelId;
      const subscriberCount = channelStatsMap[channelId] || 0;
      const viewCount = parseInt(item.statistics.viewCount || '0');

      return {
        videoId: item.id,
        title: item.snippet.title,
        channelId,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl:
          item.snippet.thumbnails?.maxres?.url ||
          item.snippet.thumbnails?.high?.url ||
          item.snippet.thumbnails?.medium?.url ||
          '',
        viewCount,
        likeCount: parseInt(item.statistics.likeCount || '0'),
        commentCount: parseInt(item.statistics.commentCount || '0'),
        subscriberCount,
        viewRatio: calcViewRatio(viewCount, subscriberCount),
        description: item.snippet.description || '',
        tags: item.snippet.tags || [],
        categoryId: item.snippet.categoryId || '',
        duration: item.contentDetails?.duration || '',
      };
    });

    return NextResponse.json({ data: results, keyword: keyword.trim() });
  } catch (error) {
    console.error('YouTube keyword research error:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました。もう一度お試しください' },
      { status: 500 }
    );
  }
}
`;

// 2. Editor Component
const editorComponent = `'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Eye,
  ThumbsUp,
  MessageCircle,
  Calendar,
  Clock,
  AlertCircle,
  Loader2,
  BarChart3,
  ArrowLeft,
  Users,
  TrendingUp,
  Download,
  ExternalLink,
  Filter,
  SlidersHorizontal,
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
type ChartMetric = 'viewCount' | 'likeCount' | 'viewRatio' | 'subscriberCount';
type DateRange = '' | '1month' | '3months' | '6months' | '1year';

type Props = {
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
};

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'viewCount', label: '再生数' },
  { key: 'viewRatio', label: '再生倍率' },
  { key: 'subscriberCount', label: '登録者数' },
  { key: 'likeCount', label: '高評価数' },
  { key: 'commentCount', label: 'コメント数' },
  { key: 'publishedAt', label: '公開日' },
];

const DATE_RANGE_OPTIONS: { value: DateRange; label: string }[] = [
  { value: '', label: '指定なし' },
  { value: '1month', label: '1ヶ月以内' },
  { value: '3months', label: '3ヶ月以内' },
  { value: '6months', label: '6ヶ月以内' },
  { value: '1year', label: '1年以内' },
];

const CHART_METRICS: { key: ChartMetric; label: string }[] = [
  { key: 'viewCount', label: '再生数' },
  { key: 'viewRatio', label: '再生倍率' },
  { key: 'subscriberCount', label: '登録者数' },
  { key: 'likeCount', label: '高評価' },
];

function getPublishedAfterISO(range: DateRange): string | undefined {
  if (!range) return undefined;
  const now = new Date();
  switch (range) {
    case '1month': now.setMonth(now.getMonth() - 1); break;
    case '3months': now.setMonth(now.getMonth() - 3); break;
    case '6months': now.setMonth(now.getMonth() - 6); break;
    case '1year': now.setFullYear(now.getFullYear() - 1); break;
  }
  return now.toISOString();
}

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

  // Filters (client-side)
  const [minViewRatio, setMinViewRatio] = useState<number>(0);
  const [maxSubscribers, setMaxSubscribers] = useState<number>(0);

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
        body: JSON.stringify({
          keyword: keyword.trim(),
          maxResults,
          publishedAfter,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'エラーが発生しました');
        return;
      }
      setResults(data.data);
      setSearchedKeyword(data.keyword);
      setMobileTab('preview');
    } catch {
      setError('通信エラーが発生しました。もう一度お試しください');
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

  // Apply client-side filters
  const filteredResults = useMemo(() => {
    let filtered = [...results];
    if (minViewRatio > 0) {
      filtered = filtered.filter(v => v.viewRatio >= minViewRatio);
    }
    if (maxSubscribers > 0) {
      filtered = filtered.filter(v => v.subscriberCount <= maxSubscribers);
    }
    return filtered;
  }, [results, minViewRatio, maxSubscribers]);

  // Sort
  const sortedResults = useMemo(() => {
    const sorted = [...filteredResults];
    sorted.sort((a, b) => {
      if (sortKey === 'publishedAt') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      return (b[sortKey] as number) - (a[sortKey] as number);
    });
    return sorted;
  }, [filteredResults, sortKey]);

  // Chart data (top 10)
  const chartData = useMemo(() => {
    return sortedResults.slice(0, 10).map((v, i) => ({
      name: v.title.length > 15 ? v.title.slice(0, 15) + '...' : v.title,
      value: v[chartMetric] as number,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }));
  }, [sortedResults, chartMetric]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const exportToCSV = () => {
    if (sortedResults.length === 0) return;

    const headers = ['順位', 'タイトル', 'チャンネル名', '再生数', 'チャンネル登録数', '再生倍率', '高評価数', 'コメント数', 'エンゲージメント率(%)', '高評価率(%)', '動画時間', '動画公開日', 'タグ', '動画URL'];

    const rows = sortedResults.map((v, i) => {
      const engRate = v.viewCount > 0 ? (((v.likeCount + v.commentCount) / v.viewCount) * 100).toFixed(2) : '0';
      const likeRate = v.viewCount > 0 ? ((v.likeCount / v.viewCount) * 100).toFixed(2) : '0';
      return [
        i + 1,
        \`"\${v.title.replace(/"/g, '""')}"\`,
        \`"\${v.channelTitle.replace(/"/g, '""')}"\`,
        v.viewCount,
        v.subscriberCount,
        v.viewRatio,
        v.likeCount,
        v.commentCount,
        engRate,
        likeRate,
        formatDuration(v.duration),
        v.publishedAt.split('T')[0],
        \`"\${(v.tags || []).join(', ').replace(/"/g, '""')}"\`,
        \`https://www.youtube.com/watch?v=\${v.videoId}\`,
      ].join(',');
    });

    const bom = '\\uFEFF';
    const csv = bom + headers.join(',') + '\\n' + rows.join('\\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const today = new Date().toISOString().split('T')[0];
    a.href = url;
    a.download = \`youtube_keyword_\${searchedKeyword}_\${today}.csv\`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Editor Header */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard?view=youtube-keyword-research')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-rose-600" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">YouTubeキーワードリサーチ</h1>
            </div>
          </div>
          {sortedResults.length > 0 && (
            <button
              onClick={exportToCSV}
              className="flex items-center gap-1.5 px-4 py-2 bg-green-50 border border-green-200 text-green-700 font-semibold rounded-xl hover:bg-green-100 transition-colors text-sm min-h-[44px] shadow-sm"
            >
              <Download className="w-4 h-4" />
              CSV出力
            </button>
          )}
        </div>
      </div>

      {/* Mobile tabs */}
      <div className="lg:hidden sticky top-[121px] z-30 bg-white border-b border-gray-200 flex">
        <button
          onClick={() => setMobileTab('editor')}
          className={\`flex-1 py-3 text-sm font-semibold text-center transition-colors \${
            mobileTab === 'editor'
              ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50/50'
              : 'text-gray-500 hover:text-gray-700'
          }\`}
        >
          検索条件
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={\`flex-1 py-3 text-sm font-semibold text-center transition-colors \${
            mobileTab === 'preview'
              ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50/50'
              : 'text-gray-500 hover:text-gray-700'
          }\`}
        >
          検索結果
        </button>
      </div>

      {/* Main content */}
      <div className="flex flex-col lg:flex-row">
        {/* Left panel */}
        <div className={\`w-full lg:w-1/2 overflow-y-auto p-4 md:p-6 bg-gray-50 \${mobileTab === 'preview' ? 'hidden lg:block' : ''}\`}>
          <div className="max-w-xl mx-auto space-y-6">
            {/* Keyword input */}
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-rose-600" />
                <h2 className="text-lg font-bold text-gray-900">キーワード検索</h2>
              </div>
              <input
                type="text"
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); if (error) setError(''); }}
                onKeyDown={handleKeyDown}
                placeholder="例: ダイエット 筋トレ 料理"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              />

              {/* Date range + results count */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">公開日</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as DateRange)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  >
                    {DATE_RANGE_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">取得件数</label>
                  <select
                    value={maxResults}
                    onChange={(e) => setMaxResults(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-gray-900 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  >
                    <option value={10}>10件</option>
                    <option value={20}>20件</option>
                    <option value={30}>30件</option>
                    <option value={50}>50件</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="w-full mt-4 py-3 bg-rose-500 hover:bg-rose-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />検索中...</>
                ) : (
                  <><Search className="w-5 h-5" />検索する</>
                )}
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-rose-600" />
                  <h2 className="text-lg font-bold text-gray-900">フィルター</h2>
                </div>
                <Filter className={\`w-4 h-4 text-gray-400 transition-transform \${showFilters ? 'rotate-180' : ''}\`} />
              </button>

              {showFilters && (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                      最低再生倍率
                      <span className="text-gray-400 font-normal ml-1">(0で無効)</span>
                    </label>
                    <input
                      type="number"
                      value={minViewRatio}
                      onChange={(e) => setMinViewRatio(Number(e.target.value))}
                      min={0}
                      step={0.5}
                      placeholder="例: 2.0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">再生倍率 = 再生数 / チャンネル登録者数</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                      最大チャンネル登録者数
                      <span className="text-gray-400 font-normal ml-1">(0で無効)</span>
                    </label>
                    <input
                      type="number"
                      value={maxSubscribers}
                      onChange={(e) => setMaxSubscribers(Number(e.target.value))}
                      min={0}
                      step={10000}
                      placeholder="例: 100000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">大手チャンネルを除外して競合を絞り込めます</p>
                  </div>
                  {(minViewRatio > 0 || maxSubscribers > 0) && results.length > 0 && (
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-sm text-rose-700">
                      {results.length}件中 {filteredResults.length}件がフィルター条件に一致
                    </div>
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
                  <button
                    key={o.key}
                    onClick={() => setSortKey(o.key)}
                    className={\`py-2 px-3 rounded-lg text-xs font-semibold transition-all min-h-[36px] \${
                      sortKey === o.key
                        ? 'bg-rose-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }\`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Summary */}
            {sortedResults.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">検索サマリー</h3>
                <div className="space-y-2 text-sm">
                  <SummaryRow label="キーワード" value={searchedKeyword} />
                  <SummaryRow label="結果件数" value={\`\${sortedResults.length}件\`} />
                  <SummaryRow label="平均再生数" value={formatNumber(Math.round(sortedResults.reduce((s, v) => s + v.viewCount, 0) / sortedResults.length))} />
                  <SummaryRow label="平均再生倍率" value={\`\${(sortedResults.reduce((s, v) => s + v.viewRatio, 0) / sortedResults.length).toFixed(2)}x\`} />
                  <SummaryRow label="平均登録者数" value={formatNumber(Math.round(sortedResults.reduce((s, v) => s + v.subscriberCount, 0) / sortedResults.length))} />
                </div>
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
        <div className={\`w-full lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] flex-col bg-gray-800 border-l border-gray-700 \${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}\`}>
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {!sortedResults.length && !isLoading && (
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

            {sortedResults.length > 0 && (
              <div className="max-w-2xl mx-auto space-y-4">
                {/* Chart metric toggle */}
                <div className="flex gap-2 flex-wrap">
                  {CHART_METRICS.map(m => (
                    <button
                      key={m.key}
                      onClick={() => setChartMetric(m.key)}
                      className={\`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all \${
                        chartMetric === m.key
                          ? 'bg-rose-500 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }\`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                {/* Chart */}
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-rose-400" />
                    TOP 10 {CHART_METRICS.find(m => m.key === chartMetric)?.label}
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData} margin={{ left: 10, right: 10, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} angle={-35} textAnchor="end" axisLine={{ stroke: '#4b5563' }} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#4b5563' }} tickFormatter={(v) => v >= 1000000 ? \`\${(v / 1000000).toFixed(1)}M\` : v >= 1000 ? \`\${(v / 1000).toFixed(0)}K\` : String(v)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                        formatter={(value: number) => [chartMetric === 'viewRatio' ? \`\${value}x\` : formatNumber(value), CHART_METRICS.find(m => m.key === chartMetric)?.label || '']}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={30}>
                        {chartData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Video cards */}
                {sortedResults.map((v, i) => (
                  <div key={v.videoId} className="bg-gray-700/50 rounded-xl p-3">
                    <div className="flex gap-3">
                      <div className="flex-shrink-0 w-36 relative group">
                        <a href={\`https://www.youtube.com/watch?v=\${v.videoId}\`} target="_blank" rel="noopener noreferrer">
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
                          <a
                            href={\`https://www.youtube.com/watch?v=\${v.videoId}\`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white font-bold text-sm leading-snug line-clamp-2 hover:text-rose-300 transition-colors"
                          >
                            {v.title}
                          </a>
                        </div>
                        <a
                          href={\`https://www.youtube.com/channel/\${v.channelId}\`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 text-xs mb-2 block hover:text-rose-300 transition-colors"
                        >
                          {v.channelTitle} / {formatDate(v.publishedAt)}
                          {v.duration && \` / \${formatDuration(v.duration)}\`}
                        </a>
                        <div className="flex flex-wrap gap-2">
                          <MetricBadge icon={Eye} value={formatNumber(v.viewCount)} color="blue" />
                          <MetricBadge icon={Users} value={formatNumber(v.subscriberCount)} color="red" />
                          <MetricBadge icon={TrendingUp} value={\`\${v.viewRatio}x\`} color={v.viewRatio >= 2 ? 'green' : 'gray'} />
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

        {/* Spacer */}
        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50"></div>
      </div>
    </div>
  );
}

const CHART_COLORS = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#22d3ee', '#818cf8', '#e879f9', '#f472b6', '#a78bfa', '#34d399'];

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
    blue: 'text-blue-400',
    red: 'text-red-400',
    green: 'text-green-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    gray: 'text-gray-400',
  };
  return (
    <span className="flex items-center gap-1 text-xs text-gray-300">
      <Icon className={\`w-3 h-3 \${colorMap[color] || 'text-gray-400'}\`} />
      {value}
    </span>
  );
}
`;

// 3. Editor Page
const editorPage = `'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getAdminEmails } from '@/lib/constants';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import YouTubeKeywordResearchEditor from '@/components/youtube-keyword-research/YouTubeKeywordResearchEditor';
import { Loader2 } from 'lucide-react';

export default function YouTubeKeywordResearchPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const adminEmails = getAdminEmails();
  const isAdmin = !!(user?.email && adminEmails.some(email =>
    user.email?.toLowerCase() === email.toLowerCase()
  ));

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });
      subscription = sub;

      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setIsLoading(false);
    };

    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const navigateTo = (page: string) => {
    window.location.href = page.startsWith('/') ? page : \`/\${page}\`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-rose-500" />
      </div>
    );
  }

  return (
    <>
      <Header
        user={user}
        setShowAuth={setShowAuth}
        onLogout={handleLogout}
        setPage={navigateTo}
      />

      {user ? (
        <YouTubeKeywordResearchEditor user={user} isAdmin={isAdmin} />
      ) : (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-8 max-w-md mx-auto text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ログインが必要です</h2>
            <p className="text-gray-600 mb-6">YouTubeキーワードリサーチを利用するにはログインしてください</p>
            <button
              onClick={() => setShowAuth(true)}
              className="px-6 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]"
            >
              ログイン
            </button>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        setUser={setUser}
      />
    </>
  );
}
`;

// 4. Landing page
const landingPage = `import type { Metadata } from 'next';
import LandingHeader from '@/components/shared/LandingHeader';
import { Search, BarChart3, TrendingUp, Download, Filter, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'YouTubeキーワードリサーチ | 集客メーカー',
  description: 'YouTubeキーワード検索で上位動画の再生数・登録者数・再生倍率を一括分析。競合調査やコンテンツ戦略に役立つ無料ツール。',
};

export default function YouTubeKeywordResearchLanding() {
  const features = [
    { icon: Search, title: 'キーワード検索', desc: 'YouTubeの検索結果を一括取得し、上位動画の指標を比較分析できます' },
    { icon: BarChart3, title: '指標比較チャート', desc: '再生数・登録者数・再生倍率をビジュアルチャートで直感的に比較' },
    { icon: TrendingUp, title: '再生倍率分析', desc: '登録者数に対する再生倍率で、バズっている動画を即座に発見' },
    { icon: Filter, title: '高度なフィルター', desc: '公開日・再生倍率・登録者数でフィルタリング。競合分析に最適' },
    { icon: Users, title: 'チャンネル分析', desc: 'チャンネル登録者数も自動取得。大手を除外して同規模の競合を分析' },
    { icon: Download, title: 'CSV出力', desc: '分析結果をCSVでエクスポート。Excel・スプレッドシートで詳細分析' },
  ];

  const steps = [
    { num: '1', title: 'キーワードを入力', desc: '調べたいテーマやジャンルのキーワードを入力します' },
    { num: '2', title: '検索結果を分析', desc: '上位動画の再生数・登録者数・再生倍率がグラフ付きで表示されます' },
    { num: '3', title: 'フィルター・エクスポート', desc: '条件でフィルタリングし、CSVで出力して詳細な分析に活用できます' },
  ];

  return (
    <>
      <LandingHeader />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-red-50 pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              <TrendingUp className="w-4 h-4" />
              YouTube競合分析
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
              YouTubeキーワードリサーチ
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              キーワード検索で上位動画の再生数・登録者数・再生倍率を一括分析。<br className="hidden sm:block" />
              競合調査やコンテンツ戦略の策定に最適なツールです。
            </p>
            <a
              href="/youtube-keyword-research/editor"
              className="inline-flex items-center gap-2 px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg min-h-[52px]"
            >
              <Search className="w-5 h-5" />
              無料で使ってみる
            </a>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-black text-gray-900 text-center mb-12">主な機能</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-rose-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-black text-gray-900 text-center mb-12">使い方 3ステップ</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 bg-rose-500 text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4 shadow-lg">
                    {s.num}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-br from-rose-500 to-red-600">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-black text-white mb-4">今すぐ競合分析を始めよう</h2>
            <p className="text-rose-100 mb-8 text-lg">無料でYouTubeキーワードリサーチを体験できます</p>
            <a
              href="/youtube-keyword-research/editor"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-rose-600 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg min-h-[52px]"
            >
              <Search className="w-5 h-5" />
              無料で始める
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
`;

// Write all files
const files = [
  { path: 'app/api/youtube-keyword-research/route.ts', content: apiRoute },
  { path: 'components/youtube-keyword-research/YouTubeKeywordResearchEditor.tsx', content: editorComponent },
  { path: 'app/youtube-keyword-research/editor/page.tsx', content: editorPage },
  { path: 'app/youtube-keyword-research/page.tsx', content: landingPage },
];

const root = path.resolve(__dirname, '..');

for (const file of files) {
  const filePath = path.join(root, file.path);
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, file.content, 'utf-8');
  console.log(`Created: ${file.path}`);
}

console.log('\\nAll files created successfully!');
