'use client';

import React, { useState, useCallback } from 'react';
import {
  Search,
  Loader2,
  TrendingUp,
  BookOpen,
  Star,
  Sparkles,
  Tag,
  Lightbulb,
  Palette,
  FolderOpen,
  ChevronDown,
  ChevronUp,

  Copy,
  Check,
  RefreshCw,
  BarChart3,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { KindleBookResult } from '@/app/api/kindle-keywords/scrape/route';
import type { KindleAnalysisResult } from '@/app/api/kindle-keywords/analyze/route';

type Props = {
  user: { id: string; email?: string } | null;
  setShowAuth: (show: boolean) => void;
};

export default function KindleKeywordResearchEditor({ user, setShowAuth }: Props) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [books, setBooks] = useState<KindleBookResult[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [analysis, setAnalysis] = useState<KindleAnalysisResult | null>(null);

  const [isLoadingSuggest, setIsLoadingSuggest] = useState(false);
  const [isLoadingScrape, setIsLoadingScrape] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);

  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [hasSearched, setHasSearched] = useState(false);

  // サジェスト取得
  const fetchSuggestions = useCallback(async (kw: string) => {
    setIsLoadingSuggest(true);
    try {
      const res = await fetch('/api/kindle-keywords/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: kw }),
      });
      const data = await res.json();
      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (e) {
      console.error('Suggest error:', e);
    } finally {
      setIsLoadingSuggest(false);
    }
  }, []);

  // スクレイピング取得
  const fetchBooks = useCallback(async (kw: string) => {
    setIsLoadingScrape(true);
    try {
      const res = await fetch('/api/kindle-keywords/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: kw }),
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setBooks(data.books || []);
      setTotalResults(data.totalResults || 0);
      return data.books || [];
    } catch (e: any) {
      console.error('Scrape error:', e);
      setError(e.message || 'データ取得に失敗しました');
      return [];
    } finally {
      setIsLoadingScrape(false);
    }
  }, []);

  // AI分析実行
  const runAnalysis = useCallback(
    async (kw: string, booksData: KindleBookResult[], suggestionsData: string[]) => {
      setIsLoadingAnalysis(true);
      try {
        const res = await fetch('/api/kindle-keywords/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            keyword: kw,
            books: booksData,
            suggestions: suggestionsData,
            userId: user?.id,
            userPlan: 'free',
          }),
        });
        const data = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        setAnalysis(data.analysis);
      } catch (e: any) {
        console.error('Analysis error:', e);
        setError(e.message || 'AI分析に失敗しました');
      } finally {
        setIsLoadingAnalysis(false);
      }
    },
    [user]
  );

  // 検索実行
  const handleSearch = async () => {
    if (!keyword.trim()) return;

    if (!user) {
      setShowAuth(true);
      return;
    }

    setError(null);
    setAnalysis(null);
    setHasSearched(true);

    // サジェストとスクレイピングを並列実行
    const [, booksData] = await Promise.all([
      fetchSuggestions(keyword.trim()),
      fetchBooks(keyword.trim()),
    ]);

    setMobileTab('preview');

    // 書籍データが取得できたらAI分析を実行
    if (booksData.length > 0) {
      const suggestRes = await fetch('/api/kindle-keywords/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });
      const suggestData = await suggestRes.json();
      await runAnalysis(keyword.trim(), booksData, suggestData.suggestions || []);
    }
  };

  // サジェストキーワードで再検索
  const handleSuggestionClick = (suggestion: string) => {
    setKeyword(suggestion);
    setTimeout(() => {
      const searchBtn = document.getElementById('kindle-search-btn');
      if (searchBtn) searchBtn.click();
    }, 100);
  };

  // タイトルコピー
  const handleCopyTitle = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTitle(text);
    setTimeout(() => setCopiedTitle(null), 2000);
  };

  const isLoading = isLoadingSuggest || isLoadingScrape || isLoadingAnalysis;
  const hasResults = books.length > 0;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* エディタヘッダー */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard?view=kindle-keywords')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-orange-600" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Kindleキーワードリサーチ</h1>
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
              ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          キーワード入力
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
            mobileTab === 'preview'
              ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50/50'
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
            {/* キーワード入力カード */}
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <Search className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-bold text-gray-900">リサーチキーワード</h2>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSearch()}
                  placeholder="例: 副業, ダイエット, 英語学習"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  disabled={isLoading}
                />
              </div>

              {/* ローディング状態 */}
              {isLoading && (
                <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex gap-1">
                    <div className={`w-2 h-2 rounded-full ${isLoadingSuggest ? 'bg-orange-500 animate-pulse' : suggestions.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div className={`w-2 h-2 rounded-full ${isLoadingScrape ? 'bg-orange-500 animate-pulse' : books.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <div className={`w-2 h-2 rounded-full ${isLoadingAnalysis ? 'bg-orange-500 animate-pulse' : analysis ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                  {isLoadingSuggest && 'サジェストキーワード取得中...'}
                  {isLoadingScrape && '検索結果を取得中...'}
                  {isLoadingAnalysis && 'AI分析中...'}
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                id="kindle-search-btn"
                onClick={handleSearch}
                disabled={isLoading || !keyword.trim()}
                className="w-full mt-4 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
              >
                {isLoading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />リサーチ中...</>
                ) : (
                  <><Search className="w-5 h-5" />リサーチ開始</>
                )}
              </button>
            </div>

            {/* サジェストキーワード（左パネル） */}
            {suggestions.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-orange-600" />
                  関連キーワード ({suggestions.length}件)
                </h3>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(s)}
                      className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 rounded-lg text-sm transition-all cursor-pointer"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 統計サマリー（左パネル） */}
            {books.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-orange-600" />
                  市場概要
                </h3>
                <div className="space-y-2 text-sm">
                  <SummaryRow
                    label="検索結果数"
                    value={`約${totalResults.toLocaleString()}件`}
                  />
                  <SummaryRow
                    label="平均評価"
                    value={
                      books.filter((b) => b.rating !== null).length > 0
                        ? `${(
                            books.filter((b) => b.rating !== null).reduce((sum, b) => sum + (b.rating || 0), 0) /
                            books.filter((b) => b.rating !== null).length
                          ).toFixed(1)}点`
                        : '-'
                    }
                  />
                  <SummaryRow
                    label="平均レビュー数"
                    value={
                      books.length > 0
                        ? `${Math.round(books.reduce((sum, b) => sum + b.reviewCount, 0) / books.length).toLocaleString()}件`
                        : '-'
                    }
                  />
                  <SummaryRow
                    label="KU対応率"
                    value={
                      books.length > 0
                        ? `${Math.round((books.filter((b) => b.isKindleUnlimited).length / books.length) * 100)}%`
                        : '-'
                    }
                  />
                </div>
              </div>
            )}

            {/* AI再分析ボタン（左パネル） */}
            {analysis && (
              <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-gray-900">AI市場分析</h3>
                </div>
                <p className="text-xs text-gray-600 mb-4">
                  検索結果を分析して、最適なタイトル・カテゴリ・戦略を提案します。
                </p>
                <button
                  onClick={() => runAnalysis(keyword, books, suggestions)}
                  disabled={isLoadingAnalysis}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {isLoadingAnalysis ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />AI分析中...</>
                  ) : (
                    <><RefreshCw className="w-5 h-5" />再分析する</>
                  )}
                </button>
              </div>
            )}

            {/* 使い方ガイド */}
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">使い方</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">1.</span>
                  <span>出版したいジャンルのキーワードを入力</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">2.</span>
                  <span>Amazonの実データから市場規模・競合を分析</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">3.</span>
                  <span>AIがタイトル提案・カテゴリ推奨を生成</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-0.5">4.</span>
                  <span>表紙デザイントレンドも分析</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 右パネル: 分析結果 */}
        <div className={`w-full lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] flex-col bg-gray-800 border-l border-gray-700 ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {!hasResults && !isLoading && !hasSearched && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <BookOpen className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">分析結果がここに表示されます</p>
                <p className="text-sm">左側にキーワードを入力して「リサーチ開始」をクリック</p>
              </div>
            )}

            {isLoading && !hasResults && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="text-lg font-semibold">Amazonデータを取得中...</p>
                <p className="text-sm mt-2">サジェスト・書籍データ・AI分析を実行しています</p>
              </div>
            )}

            {hasResults && (
              <ResultsPanel
                keyword={keyword}
                books={books}
                totalResults={totalResults}
                analysis={analysis}
                isLoadingAnalysis={isLoadingAnalysis}
                copiedTitle={copiedTitle}
                handleCopyTitle={handleCopyTitle}
              />
            )}
          </div>
        </div>

        {/* 右パネルのスペーサー */}
        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50"></div>
      </div>
    </div>
  );
}

// --- 分析結果パネル（ダーク背景） ---
function ResultsPanel({
  keyword,
  books,
  totalResults,
  analysis,
  isLoadingAnalysis,
  copiedTitle,
  handleCopyTitle,
}: {
  keyword: string;
  books: KindleBookResult[];
  totalResults: number;
  analysis: KindleAnalysisResult | null;
  isLoadingAnalysis: boolean;
  copiedTitle: string | null;
  handleCopyTitle: (text: string) => void;
}) {
  const [showBooks, setShowBooks] = useState(true);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* 検索結果ヘッダー */}
      <div className="bg-gradient-to-r from-orange-600/30 to-amber-600/30 rounded-xl p-4 border border-orange-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-orange-400" />
            <span className="text-white font-bold text-lg">「{keyword}」</span>
          </div>
          <span className="text-gray-300 text-sm">約{totalResults.toLocaleString()}件ヒット</span>
        </div>
      </div>

      {/* 市場スコアカード */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          icon={Search}
          label="検索結果数"
          value={totalResults.toLocaleString()}
          color="orange"
        />
        <StatCard
          icon={Star}
          label="平均評価"
          value={
            books.filter((b) => b.rating !== null).length > 0
              ? (
                  books.filter((b) => b.rating !== null).reduce((sum, b) => sum + (b.rating || 0), 0) /
                  books.filter((b) => b.rating !== null).length
                ).toFixed(1)
              : '-'
          }
          color="amber"
        />
        <StatCard
          icon={TrendingUp}
          label="平均レビュー"
          value={
            books.length > 0
              ? Math.round(books.reduce((sum, b) => sum + b.reviewCount, 0) / books.length).toLocaleString()
              : '-'
          }
          color="green"
        />
        <StatCard
          icon={BookOpen}
          label="KU対応率"
          value={
            books.length > 0
              ? `${Math.round((books.filter((b) => b.isKindleUnlimited).length / books.length) * 100)}%`
              : '-'
          }
          color="blue"
        />
      </div>

      {/* AI分析ローディング */}
      {isLoadingAnalysis && !analysis && (
        <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <span className="text-purple-300 font-semibold">AIが市場を分析中...</span>
          </div>
        </div>
      )}

      {/* AI分析結果 */}
      {analysis && (
        <>
          {/* 総合サマリー */}
          <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-xl p-4 border border-purple-500/30">
            <p className="text-gray-200 text-sm leading-relaxed">{analysis.summary}</p>
          </div>

          {/* 市場概況 */}
          <div className="bg-gray-700/50 rounded-xl p-4">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-400" />
              市場概況
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="bg-gray-600/30 rounded-lg px-3 py-2">
                <p className="text-gray-400 text-[10px]">飽和度</p>
                <p className="text-green-300 text-sm font-bold">{analysis.marketOverview.saturationLevel}</p>
                <div className="mt-1 h-1.5 bg-gray-600 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      analysis.marketOverview.saturationScore <= 3
                        ? 'bg-green-500'
                        : analysis.marketOverview.saturationScore <= 6
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${analysis.marketOverview.saturationScore * 10}%` }}
                  />
                </div>
              </div>
              <div className="bg-gray-600/30 rounded-lg px-3 py-2">
                <p className="text-gray-400 text-[10px]">価格帯</p>
                <p className="text-cyan-300 text-sm font-bold">{analysis.marketOverview.priceRange}</p>
              </div>
              <div className="bg-gray-600/30 rounded-lg px-3 py-2">
                <p className="text-gray-400 text-[10px]">平均評価</p>
                <p className="text-amber-300 text-sm font-bold flex items-center gap-1">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  {analysis.marketOverview.avgRating}
                </p>
              </div>
              <div className="bg-gray-600/30 rounded-lg px-3 py-2">
                <p className="text-gray-400 text-[10px]">平均レビュー数</p>
                <p className="text-cyan-300 text-sm font-bold">{analysis.marketOverview.avgReviewCount}件</p>
              </div>
              <div className="bg-gray-600/30 rounded-lg px-3 py-2 col-span-2 sm:col-span-2">
                <p className="text-gray-400 text-[10px]">KU対応率</p>
                <p className="text-cyan-300 text-sm font-bold">{analysis.marketOverview.kuRatio}</p>
              </div>
            </div>
          </div>

          {/* タイトル提案 */}
          <div className="bg-gray-700/50 rounded-xl p-4">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              タイトル提案
            </h3>
            <div className="space-y-2">
              {analysis.titleSuggestions.map((ts, i) => (
                <div key={i} className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/20">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">{ts.title}</p>
                      {ts.subtitle && (
                        <p className="text-amber-300 text-xs mt-0.5">〜 {ts.subtitle} 〜</p>
                      )}
                      <p className="text-gray-400 text-xs mt-1.5">{ts.reason}</p>
                    </div>
                    <button
                      onClick={() => handleCopyTitle(`${ts.title}${ts.subtitle ? ` 〜${ts.subtitle}〜` : ''}`)}
                      className="p-1.5 hover:bg-amber-500/20 rounded-lg transition-colors shrink-0"
                      title="コピー"
                    >
                      {copiedTitle === `${ts.title}${ts.subtitle ? ` 〜${ts.subtitle}〜` : ''}` ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 表紙デザイントレンド */}
          <div className="bg-gray-700/50 rounded-xl p-4">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <Palette className="w-4 h-4 text-pink-400" />
              表紙デザイントレンド
            </h3>
            <div className="space-y-3">
              <div className="bg-gray-600/30 rounded-lg px-3 py-2">
                <p className="text-gray-400 text-[10px]">カラートレンド</p>
                <p className="text-gray-200 text-sm">{analysis.coverTrends.colorTrends}</p>
              </div>
              <div className="bg-gray-600/30 rounded-lg px-3 py-2">
                <p className="text-gray-400 text-[10px]">デザインパターン</p>
                <p className="text-gray-200 text-sm">{analysis.coverTrends.designPatterns}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1.5">おすすめ</p>
                <ul className="space-y-1">
                  {analysis.coverTrends.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="text-pink-400 mt-0.5">•</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* カテゴリ推奨 */}
          <div className="bg-gray-700/50 rounded-xl p-4">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-blue-400" />
              おすすめカテゴリ
            </h3>
            <div className="space-y-2">
              {analysis.categoryRecommendations.map((cr, i) => (
                <div key={i} className="bg-gray-600/30 rounded-lg p-3 flex items-start gap-3">
                  <span
                    className={`shrink-0 mt-0.5 px-2 py-0.5 text-[10px] font-bold rounded-full ${
                      cr.difficulty === '低'
                        ? 'bg-green-500/20 text-green-300'
                        : cr.difficulty === '中'
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    難易度: {cr.difficulty}
                  </span>
                  <div>
                    <p className="font-semibold text-white text-sm">{cr.category}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{cr.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* キーワードTips */}
          <div className="bg-gray-700/50 rounded-xl p-4">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <Tag className="w-4 h-4 text-orange-400" />
              キーワード最適化Tips
            </h3>
            <ol className="space-y-2">
              {analysis.keywordTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-500/30 text-orange-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="text-gray-300">{tip}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      {/* 書籍一覧 */}
      {books.length > 0 && (
        <div className="bg-gray-700/50 rounded-xl p-4">
          <button
            onClick={() => setShowBooks(!showBooks)}
            className="w-full flex items-center justify-between mb-3"
          >
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-orange-400" />
              上位書籍一覧（{books.length}件）
            </h3>
            {showBooks ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {showBooks && (
            <div className="space-y-2">
              {books.map((book, i) => (
                <div key={i} className="bg-gray-600/30 rounded-xl p-3 flex gap-3 border border-gray-600/50">
                  {/* 順位 */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{i + 1}</span>
                  </div>

                  {/* 表紙画像 */}
                  {book.imageUrl ? (
                    <div className="flex-shrink-0 w-10 h-14 rounded overflow-hidden bg-white">
                      <img src={book.imageUrl} alt={book.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-10 h-14 rounded bg-gray-600 flex items-center justify-center">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                    </div>
                  )}

                  {/* 書籍情報 */}
                  <div className="flex-1 min-w-0">
                    <a
                      href={book.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white text-sm font-medium line-clamp-1 hover:text-orange-300 transition-colors"
                    >
                      {book.title}
                    </a>
                    <p className="text-gray-500 text-xs mt-0.5">{book.author}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <span className="text-orange-300 font-bold text-sm">{book.price}</span>
                      {book.rating !== null && (
                        <span className="text-gray-400 text-xs flex items-center gap-0.5">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                          {book.rating} ({book.reviewCount.toLocaleString()})
                        </span>
                      )}
                      {book.isKindleUnlimited && (
                        <span className="text-blue-400 text-[10px] px-1.5 py-0.5 bg-blue-500/20 rounded">KU</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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
  color: 'orange' | 'amber' | 'green' | 'blue';
}) {
  const colors = {
    orange: { bg: 'bg-orange-500/20', icon: 'text-orange-400' },
    amber: { bg: 'bg-amber-500/20', icon: 'text-amber-400' },
    green: { bg: 'bg-green-500/20', icon: 'text-green-400' },
    blue: { bg: 'bg-blue-500/20', icon: 'text-blue-400' },
  };
  const c = colors[color];

  return (
    <div className={`${c.bg} rounded-xl p-4 text-center`}>
      <Icon className={`w-5 h-5 ${c.icon} mx-auto mb-1.5`} />
      <p className="text-white font-bold text-base">{value}</p>
      <p className="text-gray-400 text-xs mt-0.5">{label}</p>
    </div>
  );
}
