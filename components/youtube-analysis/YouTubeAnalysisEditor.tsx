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
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { YouTubeVideoData } from '@/lib/youtube';
import { formatNumber, formatDuration } from '@/lib/youtube';

type Props = {
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
};

export default function YouTubeAnalysisEditor({ user }: Props) {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [videoData, setVideoData] = useState<YouTubeVideoData | null>(null);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('URLを入力してください');
      return;
    }

    setIsLoading(true);
    setError('');
    setVideoData(null);

    try {
      const res = await fetch('/api/youtube-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'エラーが発生しました');
        return;
      }

      setVideoData(result.data);
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
      handleAnalyze();
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // エンゲージメント率の計算
  const calcEngagementRate = (data: YouTubeVideoData) => {
    if (data.viewCount === 0) return '0';
    const rate = ((data.likeCount + data.commentCount) / data.viewCount) * 100;
    return rate.toFixed(2);
  };

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
        {/* 左パネル: 入力エリア */}
        <div className={`w-full lg:w-1/2 overflow-y-auto p-4 md:p-6 bg-gray-50 ${mobileTab === 'preview' ? 'hidden lg:block' : ''}`}>
          <div className="max-w-xl mx-auto space-y-6">
            {/* URL入力カード */}
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">動画URLを入力</h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                分析したいYouTube動画のURLを貼り付けてください
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError('');
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />

                {error && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={isLoading || !url.trim()}
                  className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      分析中...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-5 h-5" />
                      分析する
                    </>
                  )}
                </button>
              </div>
            </div>

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

            {/* 分析済みデータの概要（左パネルにもサマリー表示） */}
            {videoData && (
              <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3">分析サマリー</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">エンゲージメント率</span>
                    <span className="font-bold text-gray-900">{calcEngagementRate(videoData)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">高評価 / 再生数</span>
                    <span className="font-bold text-gray-900">
                      {videoData.viewCount > 0
                        ? ((videoData.likeCount / videoData.viewCount) * 100).toFixed(2)
                        : '0'}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">コメント / 再生数</span>
                    <span className="font-bold text-gray-900">
                      {videoData.viewCount > 0
                        ? ((videoData.commentCount / videoData.viewCount) * 100).toFixed(3)
                        : '0'}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 右パネル: 分析結果 */}
        <div className={`w-full lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] flex-col bg-gray-800 border-l border-gray-700 ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {!videoData && !isLoading && (
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

            {videoData && (
              <div className="max-w-lg mx-auto space-y-4">
                {/* サムネイル */}
                <div className="rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={videoData.thumbnailUrl}
                    alt={videoData.title}
                    className="w-full aspect-video object-cover"
                  />
                </div>

                {/* タイトル・チャンネル */}
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <h2 className="text-white font-bold text-lg leading-snug mb-2">
                    {videoData.title}
                  </h2>
                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <span className="font-medium">{videoData.channelTitle}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(videoData.publishedAt)}
                    </span>
                    {videoData.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDuration(videoData.duration)}
                      </span>
                    )}
                  </div>
                </div>

                {/* 統計カード */}
                <div className="grid grid-cols-3 gap-3">
                  <StatCard
                    icon={Eye}
                    label="再生回数"
                    value={formatNumber(videoData.viewCount)}
                    color="blue"
                  />
                  <StatCard
                    icon={ThumbsUp}
                    label="高評価数"
                    value={formatNumber(videoData.likeCount)}
                    color="green"
                  />
                  <StatCard
                    icon={MessageCircle}
                    label="コメント数"
                    value={formatNumber(videoData.commentCount)}
                    color="amber"
                  />
                </div>

                {/* エンゲージメント */}
                <div className="bg-gray-700/50 rounded-xl p-4">
                  <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                    エンゲージメント分析
                  </h3>
                  <div className="space-y-3">
                    <EngagementBar
                      label="エンゲージメント率"
                      value={parseFloat(calcEngagementRate(videoData))}
                      maxValue={10}
                      suffix="%"
                    />
                    <EngagementBar
                      label="高評価率"
                      value={videoData.viewCount > 0 ? (videoData.likeCount / videoData.viewCount) * 100 : 0}
                      maxValue={10}
                      suffix="%"
                    />
                    <EngagementBar
                      label="コメント率"
                      value={videoData.viewCount > 0 ? (videoData.commentCount / videoData.viewCount) * 100 : 0}
                      maxValue={1}
                      suffix="%"
                    />
                  </div>
                </div>

                {/* タグ */}
                {videoData.tags.length > 0 && (
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                      <Tag className="w-4 h-4 text-purple-400" />
                      タグ
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {videoData.tags.slice(0, 20).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-gray-600/50 text-gray-300 text-xs rounded-full border border-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                      {videoData.tags.length > 20 && (
                        <span className="px-2.5 py-1 text-gray-500 text-xs">
                          +{videoData.tags.length - 20}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* 説明文 */}
                {videoData.description && (
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <h3 className="text-white font-bold text-sm mb-3">説明文</h3>
                    <p className="text-gray-300 text-sm whitespace-pre-wrap line-clamp-10 leading-relaxed">
                      {videoData.description}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 右パネルのスペーサー（デスクトップ用） */}
        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50"></div>
      </div>
    </div>
  );
}

// 統計カードコンポーネント
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'blue' | 'green' | 'amber';
}) {
  const colors = {
    blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: 'text-blue-400' },
    green: { bg: 'bg-green-500/20', text: 'text-green-400', icon: 'text-green-400' },
    amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', icon: 'text-amber-400' },
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

// エンゲージメントバーコンポーネント
function EngagementBar({
  label,
  value,
  maxValue,
  suffix,
}: {
  label: string;
  value: number;
  maxValue: number;
  suffix: string;
}) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-300">{label}</span>
        <span className="text-white font-semibold">
          {value.toFixed(2)}{suffix}
        </span>
      </div>
      <div className="h-2 bg-gray-600 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
