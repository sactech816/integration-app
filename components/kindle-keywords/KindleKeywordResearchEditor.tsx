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
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  BarChart3,
} from 'lucide-react';
import type { KindleBookResult } from '@/app/api/kindle-keywords/scrape/route';
import type { KindleAnalysisResult } from '@/app/api/kindle-keywords/analyze/route';

type Props = {
  user: { id: string; email?: string } | null;
  setShowAuth: (show: boolean) => void;
};

export default function KindleKeywordResearchEditor({ user, setShowAuth }: Props) {
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

  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showBooks, setShowBooks] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(true);
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

    // 書籍データが取得できたらAI分析を実行
    if (booksData.length > 0) {
      // suggestionsはstateが更新される前なので、直接fetchして取得
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
    // 自動で検索実行
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="text-orange-500" size={28} />
          Kindleキーワードリサーチ
        </h1>
        <p className="text-gray-600 mt-2">
          Amazonのデータを元に、Kindle出版で売れるキーワード・タイトル・カテゴリを分析します
        </p>
      </div>

      {/* 検索バー */}
      <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6 mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSearch()}
              placeholder="キーワードを入力（例: 副業, ダイエット, 英語学習）"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              disabled={isLoading}
            />
          </div>
          <button
            id="kindle-search-btn"
            onClick={handleSearch}
            disabled={isLoading || !keyword.trim()}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[120px] justify-center"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <Search size={20} />
            )}
            {isLoading ? '分析中...' : 'リサーチ'}
          </button>
        </div>

        {/* ローディング状態 */}
        {isLoading && (
          <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
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
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-red-700">
          {error}
        </div>
      )}

      {!hasSearched && (
        <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-12 text-center">
          <BookOpen className="mx-auto text-gray-300 mb-4" size={64} />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">キーワードを入力して分析を開始</h2>
          <p className="text-gray-500 text-sm max-w-md mx-auto">
            出版したいジャンルやテーマのキーワードを入力すると、Amazonの実データに基づいた市場分析・タイトル提案・カテゴリ推奨が得られます
          </p>
        </div>
      )}

      {hasSearched && (
        <>
          {/* サジェストキーワード */}
          {suggestions.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md mb-6">
              <button
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="w-full px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Tag className="text-orange-500" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">
                    関連キーワード
                  </h2>
                  <span className="text-sm text-gray-500">({suggestions.length}件)</span>
                </div>
                {showSuggestions ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {showSuggestions && (
                <div className="px-6 pb-5">
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
            </div>
          )}

          {/* 検索結果一覧 */}
          {books.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md mb-6">
              <button
                onClick={() => setShowBooks(!showBooks)}
                className="w-full px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="text-blue-500" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">
                    検索結果
                  </h2>
                  <span className="text-sm text-gray-500">
                    (上位{books.length}件 / 約{totalResults.toLocaleString()}件)
                  </span>
                </div>
                {showBooks ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {showBooks && (
                <div className="px-6 pb-5">
                  {/* 統計サマリー */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <StatCard
                      label="平均評価"
                      value={
                        books.filter((b) => b.rating !== null).length > 0
                          ? (
                              books.filter((b) => b.rating !== null).reduce((sum, b) => sum + (b.rating || 0), 0) /
                              books.filter((b) => b.rating !== null).length
                            ).toFixed(1)
                          : '-'
                      }
                      icon={<Star className="text-yellow-500" size={16} />}
                    />
                    <StatCard
                      label="平均レビュー数"
                      value={
                        books.length > 0
                          ? Math.round(books.reduce((sum, b) => sum + b.reviewCount, 0) / books.length).toLocaleString()
                          : '-'
                      }
                      icon={<TrendingUp className="text-green-500" size={16} />}
                    />
                    <StatCard
                      label="KU対応率"
                      value={
                        books.length > 0
                          ? `${Math.round((books.filter((b) => b.isKindleUnlimited).length / books.length) * 100)}%`
                          : '-'
                      }
                      icon={<BookOpen className="text-blue-500" size={16} />}
                    />
                    <StatCard
                      label="検索結果数"
                      value={totalResults.toLocaleString()}
                      icon={<Search className="text-gray-500" size={16} />}
                    />
                  </div>

                  {/* 書籍テーブル */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-2 text-gray-600 font-medium w-8">#</th>
                          <th className="text-left py-2 px-2 text-gray-600 font-medium">表紙</th>
                          <th className="text-left py-2 px-2 text-gray-600 font-medium">タイトル / 著者</th>
                          <th className="text-right py-2 px-2 text-gray-600 font-medium">価格</th>
                          <th className="text-right py-2 px-2 text-gray-600 font-medium">評価</th>
                          <th className="text-right py-2 px-2 text-gray-600 font-medium">レビュー</th>
                          <th className="text-center py-2 px-2 text-gray-600 font-medium">KU</th>
                        </tr>
                      </thead>
                      <tbody>
                        {books.map((book, i) => (
                          <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-2 px-2 text-gray-400">{i + 1}</td>
                            <td className="py-2 px-2">
                              {book.imageUrl ? (
                                <img
                                  src={book.imageUrl}
                                  alt={book.title}
                                  className="w-10 h-14 object-cover rounded"
                                />
                              ) : (
                                <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center">
                                  <BookOpen size={14} className="text-gray-400" />
                                </div>
                              )}
                            </td>
                            <td className="py-2 px-2">
                              <a
                                href={book.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-900 hover:text-orange-600 font-medium line-clamp-2 transition-colors"
                              >
                                {book.title}
                              </a>
                              <p className="text-gray-500 text-xs mt-0.5">{book.author}</p>
                            </td>
                            <td className="py-2 px-2 text-right text-gray-900 whitespace-nowrap">
                              {book.price}
                            </td>
                            <td className="py-2 px-2 text-right">
                              {book.rating !== null ? (
                                <span className="flex items-center justify-end gap-1">
                                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                  <span className="text-gray-900">{book.rating}</span>
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-2 px-2 text-right text-gray-900">
                              {book.reviewCount.toLocaleString()}
                            </td>
                            <td className="py-2 px-2 text-center">
                              {book.isKindleUnlimited ? (
                                <span className="inline-flex items-center px-1.5 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">
                                  KU
                                </span>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AI分析結果 */}
          {analysis && (
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md mb-6">
              <button
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="w-full px-6 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="text-purple-500" size={20} />
                  <h2 className="text-lg font-semibold text-gray-900">AI市場分析レポート</h2>
                </div>
                {showAnalysis ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </button>
              {showAnalysis && (
                <div className="px-6 pb-6 space-y-6">
                  {/* 総合サマリー */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-100">
                    <p className="text-gray-800 leading-relaxed">{analysis.summary}</p>
                  </div>

                  {/* 市場概況 */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <TrendingUp size={18} className="text-green-500" />
                      市場概況
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">飽和度</p>
                        <p className="text-lg font-bold text-gray-900">{analysis.marketOverview.saturationLevel}</p>
                        <div className="mt-1 h-2 bg-gray-200 rounded-full overflow-hidden">
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
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">価格帯</p>
                        <p className="text-sm font-semibold text-gray-900">{analysis.marketOverview.priceRange}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">平均評価</p>
                        <p className="text-lg font-bold text-gray-900 flex items-center gap-1">
                          <Star size={16} className="text-yellow-500 fill-yellow-500" />
                          {analysis.marketOverview.avgRating}
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3">
                        <p className="text-xs text-gray-500 mb-1">平均レビュー数</p>
                        <p className="text-lg font-bold text-gray-900">
                          {analysis.marketOverview.avgReviewCount}件
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 col-span-2 md:col-span-2">
                        <p className="text-xs text-gray-500 mb-1">KU対応率</p>
                        <p className="text-sm font-semibold text-gray-900">{analysis.marketOverview.kuRatio}</p>
                      </div>
                    </div>
                  </div>

                  {/* タイトル提案 */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Lightbulb size={18} className="text-amber-500" />
                      タイトル提案
                    </h3>
                    <div className="space-y-3">
                      {analysis.titleSuggestions.map((ts, i) => (
                        <div key={i} className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-bold text-gray-900 text-base">{ts.title}</p>
                              {ts.subtitle && (
                                <p className="text-gray-700 text-sm mt-0.5">〜 {ts.subtitle} 〜</p>
                              )}
                              <p className="text-gray-500 text-xs mt-2">{ts.reason}</p>
                            </div>
                            <button
                              onClick={() => handleCopyTitle(`${ts.title}${ts.subtitle ? ` 〜${ts.subtitle}〜` : ''}`)}
                              className="p-2 hover:bg-amber-100 rounded-lg transition-colors shrink-0"
                              title="コピー"
                            >
                              {copiedTitle === `${ts.title}${ts.subtitle ? ` 〜${ts.subtitle}〜` : ''}` ? (
                                <Check size={16} className="text-green-500" />
                              ) : (
                                <Copy size={16} className="text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 表紙デザイントレンド */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Palette size={18} className="text-pink-500" />
                      表紙デザイントレンド
                    </h3>
                    <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 space-y-3">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">カラートレンド</p>
                        <p className="text-gray-800 text-sm">{analysis.coverTrends.colorTrends}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">デザインパターン</p>
                        <p className="text-gray-800 text-sm">{analysis.coverTrends.designPatterns}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">おすすめ</p>
                        <ul className="space-y-1">
                          {analysis.coverTrends.recommendations.map((r, i) => (
                            <li key={i} className="text-gray-800 text-sm flex items-start gap-2">
                              <span className="text-pink-500 mt-0.5">•</span>
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* カテゴリ推奨 */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FolderOpen size={18} className="text-blue-500" />
                      おすすめカテゴリ
                    </h3>
                    <div className="space-y-2">
                      {analysis.categoryRecommendations.map((cr, i) => (
                        <div key={i} className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-start gap-3">
                          <span
                            className={`shrink-0 mt-0.5 px-2 py-0.5 text-xs font-medium rounded-full ${
                              cr.difficulty === '低'
                                ? 'bg-green-100 text-green-700'
                                : cr.difficulty === '中'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            難易度: {cr.difficulty}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{cr.category}</p>
                            <p className="text-gray-600 text-xs mt-0.5">{cr.reason}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* キーワードTips */}
                  <div>
                    <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Tag size={18} className="text-orange-500" />
                      キーワード最適化Tips
                    </h3>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <ul className="space-y-2">
                        {analysis.keywordTips.map((tip, i) => (
                          <li key={i} className="text-gray-800 text-sm flex items-start gap-2">
                            <span className="bg-orange-200 text-orange-700 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* 再分析ボタン */}
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => runAnalysis(keyword, books, suggestions)}
                      disabled={isLoadingAnalysis}
                      className="flex items-center gap-2 px-5 py-2.5 bg-purple-500 hover:bg-purple-600 text-white font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
                    >
                      {isLoadingAnalysis ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : (
                        <RefreshCw size={18} />
                      )}
                      再分析する
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 分析中の表示 */}
          {isLoadingAnalysis && !analysis && books.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-12 text-center">
              <Loader2 className="animate-spin text-purple-500 mx-auto mb-4" size={40} />
              <h3 className="text-lg font-semibold text-gray-700 mb-1">AI分析中...</h3>
              <p className="text-gray-500 text-sm">
                検索結果を分析して、最適なタイトル・カテゴリ・戦略を提案しています
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs text-gray-500">{label}</span>
      </div>
      <p className="text-lg font-bold text-gray-900">{value}</p>
    </div>
  );
}
