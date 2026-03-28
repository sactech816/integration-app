'use client';

import React, { useState } from 'react';
import {
  Search,
  Eye,
  ThumbsUp,
  MessageCircle,
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  Loader2,
  PlayCircle,
  BarChart3,
  ArrowLeft,
  Users,
  TrendingUp,
  Plus,
  X,
  ScanText,
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

type AnalysisMode = 'single' | 'compare';

type Props = {
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
};

export default function YouTubeAnalysisEditor({ user }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<AnalysisMode>('single');
  const [url, setUrl] = useState('');
  const [compareUrls, setCompareUrls] = useState<string[]>(['', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoData, setVideoData] = useState<YouTubeVideoData | null>(null);
  const [compareData, setCompareData] = useState<YouTubeVideoData[]>([]);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [ocrLoading, setOcrLoading] = useState(false);

  const handleAnalyze = async () => {
    if (mode === 'single') {
      if (!url.trim()) {
        setError('URLを入力してください');
        return;
      }
      setIsLoading(true);
      setError('');
      setVideoData(null);
      setOcrText(null);

      try {
        const res = await fetch('/api/youtube-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: url.trim() }),
        });
        const result = await res.json();
        if (!res.ok) { setError(result.error || 'エラーが発生しました'); return; }
        setVideoData(result.data);
        setMobileTab('preview');
      } catch {
        setError('通信エラーが発生しました。もう一度お試しください');
      } finally {
        setIsLoading(false);
      }
    } else {
      const validUrls = compareUrls.filter((u) => u.trim());
      if (validUrls.length < 2) {
        setError('比較するには2つ以上のURLを入力してください');
        return;
      }
      setIsLoading(true);
      setError('');
      setCompareData([]);

      try {
        const res = await fetch('/api/youtube-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ urls: validUrls }),
        });
        const result = await res.json();
        if (!res.ok) { setError(result.error || 'エラーが発生しました'); return; }
        setCompareData(result.data);
        setMobileTab('preview');
      } catch {
        setError('通信エラーが発生しました。もう一度お試しください');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const handleThumbnailOCR = async (thumbnailUrl: string) => {
    setOcrLoading(true);
    setOcrText(null);
    try {
      const res = await fetch('/api/youtube-analysis/thumbnail-ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thumbnailUrl }),
      });
      const result = await res.json();
      if (!res.ok) { setOcrText('解析に失敗しました'); return; }
      setOcrText(result.text);
    } catch {
      setOcrText('通信エラーが発生しました');
    } finally {
      setOcrLoading(false);
    }
  };

  const addCompareUrl = () => {
    if (compareUrls.length < 5) {
      setCompareUrls([...compareUrls, '']);
    }
  };

  const removeCompareUrl = (index: number) => {
    if (compareUrls.length > 2) {
      setCompareUrls(compareUrls.filter((_, i) => i !== index));
    }
  };

  const updateCompareUrl = (index: number, value: string) => {
    const updated = [...compareUrls];
    updated[index] = value;
    setCompareUrls(updated);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calcEngagementRate = (data: YouTubeVideoData) => {
    if (data.viewCount === 0) return '0';
    return (((data.likeCount + data.commentCount) / data.viewCount) * 100).toFixed(2);
  };

  const hasResults = mode === 'single' ? !!videoData : compareData.length > 0;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* エディタヘッダー */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard?view=youtube-analysis')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-red-600" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">YouTube競合分析</h1>
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
          URL入力
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
            mobileTab === 'preview'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          分析結果
        </button>
      </div>

      {/* メインコンテンツ: 左右分割 */}
      <div className="flex flex-col lg:flex-row">
        {/* 左パネル */}
        <div className={`w-full lg:w-1/2 overflow-y-auto p-4 md:p-6 bg-gray-50 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>
          <div className="max-w-xl mx-auto space-y-6">
            {/* モード切替 */}
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-2 flex gap-1">
              <button
                onClick={() => { setMode('single'); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
                  mode === 'single'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                単体分析
              </button>
              <button
                onClick={() => { setMode('compare'); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
                  mode === 'compare'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                比較分析
              </button>
            </div>

            {/* URL入力カード */}
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">
                  {mode === 'single' ? '動画URLを入力' : '比較する動画URLを入力'}
                </h2>
              </div>

              {mode === 'single' ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => { setUrl(e.target.value); if (error) setError(''); }}
                    onKeyDown={handleKeyDown}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {compareUrls.map((u, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={u}
                        onChange={(e) => updateCompareUrl(i, e.target.value)}
                        placeholder={`動画URL ${i + 1}`}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                      {compareUrls.length > 2 && (
                        <button
                          onClick={() => removeCompareUrl(i)}
                          className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors min-w-[44px] flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  {compareUrls.length < 5 && (
                    <button
                      onClick={addCompareUrl}
                      className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors flex items-center justify-center gap-1 text-sm min-h-[44px]"
                    >
                      <Plus className="w-4 h-4" />
                      URLを追加（最大5件）
                    </button>
                  )}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="w-full mt-4 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />分析中...</>
                ) : (
                  <><BarChart3 className="w-5 h-5" />分析する</>
                )}
              </button>
            </div>

            {/* 分析サマリー（単体モード） */}
            {mode === 'single' && videoData && (
              <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">分析サマリー</h3>
                <div className="space-y-2 text-sm">
                  <SummaryRow label="チャンネル登録者数" value={formatNumber(videoData.subscriberCount)} />
                  <SummaryRow label="再生倍率（再生数/登録者数）" value={`${videoData.viewRatio}x`} />
                  <SummaryRow label="エンゲージメント率" value={`${calcEngagementRate(videoData)}%`} />
                  <SummaryRow
                    label="高評価率"
                    value={`${videoData.viewCount > 0 ? ((videoData.likeCount / videoData.viewCount) * 100).toFixed(2) : '0'}%`}
                  />
                  <SummaryRow
                    label="コメント率"
                    value={`${videoData.viewCount > 0 ? ((videoData.commentCount / videoData.viewCount) * 100).toFixed(3) : '0'}%`}
                  />
                </div>
              </div>
            )}

            {/* 使い方ガイド */}
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">対応URL形式</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">-</span>
                  <span>youtube.com/watch?v=...</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">-</span>
                  <span>youtu.be/...</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">-</span>
                  <span>youtube.com/shorts/...</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 右パネル: 分析結果 */}
        <div className={`w-full lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] lg:z-10 flex-col bg-gray-800 border-l border-gray-700 ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {!hasResults && !isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <PlayCircle className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">分析結果がここに表示されます</p>
                <p className="text-sm">左側にYouTube URLを入力して「分析する」をクリック</p>
              </div>
            )}

            {isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="text-lg font-semibold">データを取得中...</p>
              </div>
            )}

            {/* 単体分析結果 */}
            {mode === 'single' && videoData && (
              <SingleVideoResult
                data={videoData}
                formatDate={formatDate}
                calcEngagementRate={calcEngagementRate}
                ocrText={ocrText}
                ocrLoading={ocrLoading}
                onThumbnailOCR={handleThumbnailOCR}
              />
            )}

            {/* 比較分析結果 */}
            {mode === 'compare' && compareData.length > 0 && (
              <CompareResults data={compareData} formatDate={formatDate} />
            )}
          </div>
        </div>

        {/* 右パネルのスペーサー */}
        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50"></div>
      </div>
    </div>
  );
}

// --- 単体動画結果 ---
function SingleVideoResult({
  data,
  formatDate,
  calcEngagementRate,
  ocrText,
  ocrLoading,
  onThumbnailOCR,
}: {
  data: YouTubeVideoData;
  formatDate: (d: string) => string;
  calcEngagementRate: (d: YouTubeVideoData) => string;
  ocrText: string | null;
  ocrLoading: boolean;
  onThumbnailOCR: (url: string) => void;
}) {
  const engagementData = [
    { name: 'エンゲージメント率', value: parseFloat(calcEngagementRate(data)), fill: '#3b82f6' },
    { name: '高評価率', value: data.viewCount > 0 ? (data.likeCount / data.viewCount) * 100 : 0, fill: '#22c55e' },
    { name: 'コメント率', value: data.viewCount > 0 ? (data.commentCount / data.viewCount) * 100 : 0, fill: '#f59e0b' },
  ];

  return (
    <div className="max-w-lg mx-auto space-y-4">
      {/* サムネイル + OCR */}
      <div className="rounded-xl overflow-hidden shadow-lg">
        <img src={data.thumbnailUrl} alt={data.title} className="w-full aspect-video object-cover" />
      </div>
      <button
        onClick={() => onThumbnailOCR(data.thumbnailUrl)}
        disabled={ocrLoading}
        className="w-full py-2.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 hover:text-white text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[44px] border border-gray-600"
      >
        {ocrLoading ? (
          <><Loader2 className="w-4 h-4 animate-spin" />解析中...</>
        ) : (
          <><ScanText className="w-4 h-4" />サムネ文字解析</>
        )}
      </button>
      {ocrText && (
        <div className="bg-gray-700/50 rounded-xl p-4">
          <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
            <ScanText className="w-4 h-4 text-cyan-400" />
            サムネイルテキスト
          </h3>
          <p className="text-gray-300 text-sm whitespace-pre-wrap">{ocrText}</p>
        </div>
      )}

      {/* タイトル・チャンネル */}
      <div className="bg-gray-700/50 rounded-xl p-4">
        <h2 className="text-white font-bold text-lg leading-snug mb-2">{data.title}</h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-300">
          <span className="font-medium">{data.channelTitle}</span>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(data.publishedAt)}
          </span>
          {data.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatDuration(data.duration)}
            </span>
          )}
        </div>
      </div>

      {/* 統計カード（4列） */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Eye} label="再生回数" value={formatNumber(data.viewCount)} color="blue" />
        <StatCard icon={ThumbsUp} label="高評価数" value={formatNumber(data.likeCount)} color="green" />
        <StatCard icon={MessageCircle} label="コメント数" value={formatNumber(data.commentCount)} color="amber" />
        <StatCard icon={Users} label="登録者数" value={formatNumber(data.subscriberCount)} color="red" />
      </div>

      {/* 再生倍率 */}
      <div className="bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-xl p-4 border border-blue-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <span className="text-gray-300 text-sm font-medium">再生倍率</span>
          </div>
          <span className="text-white font-bold text-2xl">{data.viewRatio}x</span>
        </div>
        <p className="text-gray-400 text-xs mt-1">再生回数 / チャンネル登録者数</p>
      </div>

      {/* エンゲージメントチャート */}
      <div className="bg-gray-700/50 rounded-xl p-4">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          エンゲージメント分析
        </h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={engagementData} layout="vertical" margin={{ left: 20, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
            <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#4b5563' }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#d1d5db', fontSize: 11 }} width={110} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
              formatter={(value: number) => [`${value.toFixed(3)}%`, '']}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
              {engagementData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* タグ */}
      {data.tags.length > 0 && (
        <div className="bg-gray-700/50 rounded-xl p-4">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4 text-purple-400" />
            タグ
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.tags.slice(0, 20).map((tag, i) => (
              <span key={i} className="px-2.5 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-full border border-gray-600">
                {tag}
              </span>
            ))}
            {data.tags.length > 20 && (
              <span className="px-2.5 py-1 text-gray-500 text-xs">+{data.tags.length - 20}</span>
            )}
          </div>
        </div>
      )}

      {/* 説明文 */}
      {data.description && (
        <div className="bg-gray-700/50 rounded-xl p-4">
          <h3 className="text-white font-bold text-sm mb-3">説明文</h3>
          <p className="text-gray-300 text-sm whitespace-pre-wrap line-clamp-10 leading-relaxed">
            {data.description}
          </p>
        </div>
      )}
    </div>
  );
}

// --- 比較分析結果 ---
function CompareResults({
  data,
  formatDate,
}: {
  data: YouTubeVideoData[];
  formatDate: (d: string) => string;
}) {
  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  const compareChartData = data.map((d, i) => ({
    name: d.title.length > 12 ? d.title.slice(0, 12) + '...' : d.title,
    viewCount: d.viewCount,
    likeCount: d.likeCount,
    commentCount: d.commentCount,
    subscriberCount: d.subscriberCount,
    viewRatio: d.viewRatio,
    color: COLORS[i % COLORS.length],
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* 比較チャート: 再生回数 */}
      <div className="bg-gray-700/50 rounded-xl p-4">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-400" />
          再生回数 比較
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={compareChartData} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={{ stroke: '#4b5563' }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#4b5563' }} tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
              formatter={(value: number) => [formatNumber(value), '再生回数']}
            />
            <Bar dataKey="viewCount" radius={[4, 4, 0, 0]} barSize={40}>
              {compareChartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 再生倍率 比較 */}
      <div className="bg-gray-700/50 rounded-xl p-4">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-400" />
          再生倍率 比較
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={compareChartData} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={{ stroke: '#4b5563' }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#4b5563' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
              formatter={(value: number) => [`${value}x`, '再生倍率']}
            />
            <Bar dataKey="viewRatio" radius={[4, 4, 0, 0]} barSize={40}>
              {compareChartData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 各動画カード */}
      {data.map((d, i) => (
        <div key={d.videoId} className="bg-gray-700/50 rounded-xl p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-40">
              <div className="rounded-lg overflow-hidden">
                <img src={d.thumbnailUrl} alt={d.title} className="w-full aspect-video object-cover" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2 mb-1">
                <div className="w-3 h-3 rounded-full flex-shrink-0 mt-1" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <h3 className="text-white font-bold text-sm leading-snug line-clamp-2">{d.title}</h3>
              </div>
              <p className="text-gray-400 text-xs mb-2">{d.channelTitle} / {formatDate(d.publishedAt)}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <span className="text-gray-400">再生: <span className="text-white font-semibold">{formatNumber(d.viewCount)}</span></span>
                <span className="text-gray-400">高評価: <span className="text-white font-semibold">{formatNumber(d.likeCount)}</span></span>
                <span className="text-gray-400">登録者: <span className="text-white font-semibold">{formatNumber(d.subscriberCount)}</span></span>
                <span className="text-gray-400">再生倍率: <span className="text-white font-semibold">{d.viewRatio}x</span></span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// --- 共通サブコンポーネント ---
function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-bold text-gray-900">{value}</span>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'amber' | 'red';
}) {
  const colors = {
    blue: { bg: 'bg-blue-500/20', icon: 'text-blue-400' },
    green: { bg: 'bg-green-500/20', icon: 'text-green-400' },
    amber: { bg: 'bg-amber-500/20', icon: 'text-amber-400' },
    red: { bg: 'bg-red-500/20', icon: 'text-red-400' },
  };
  const c = colors[color];

  return (
    <div className={`${c.bg} rounded-xl p-4 text-center`}>
      <Icon className={`w-5 h-5 ${c.icon} mx-auto mb-1.5`} />
      <p className="text-white font-bold text-lg">{value}</p>
      <p className="text-gray-400 text-xs mt-0.5">{label}</p>
    </div>
  );
}
