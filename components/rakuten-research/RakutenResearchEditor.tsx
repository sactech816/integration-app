'use client';

import React, { useState } from 'react';
import {
  Search,
  AlertCircle,
  Loader2,
  ArrowLeft,
  ShoppingBag,
  Star,
  MessageCircle,
  TrendingUp,
  BarChart3,
  Package,
  Truck,
  ArrowUpDown,
  ExternalLink,
  FileText,
  Hash,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Target,
  DollarSign,
  Shield,
  Lightbulb,
  CheckCircle,
  Zap,
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
import type { RakutenSearchResult, RakutenProduct } from '@/lib/rakuten';
import { formatPrice, formatNumber, calcPageQualityScore } from '@/lib/rakuten';

type Props = {
  user: { id: string; email?: string } | null;
  isAdmin: boolean;
};

type AIAnalysis = {
  marketEntry: {
    score: number;
    verdict: string;
    reason: string;
  };
  pricingStrategy: {
    recommendedRange: string;
    strategy: string;
    tips: string[];
  };
  keywordStrategy: {
    mustUseKeywords: string[];
    titleTemplate: string;
    descriptionTips: string[];
  };
  pageOptimization: {
    recommendedCaptionLength: string;
    imageRecommendation: string;
    tips: string[];
  };
  competitionAnalysis: {
    level: string;
    strengths: string[];
    weaknesses: string[];
    differentiationIdeas: string[];
  };
  actionPlan: string[];
};

type SortOption = 'standard' | '-reviewCount' | '-itemPrice' | '+itemPrice' | '-reviewAverage';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'standard', label: '標準（楽天おすすめ順）' },
  { value: '-reviewCount', label: 'レビュー件数が多い順' },
  { value: '-reviewAverage', label: 'レビュー評価が高い順' },
  { value: '-itemPrice', label: '価格が高い順' },
  { value: '+itemPrice', label: '価格が安い順' },
];

export default function RakutenResearchEditor({ user }: Props) {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState<SortOption>('standard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<RakutenSearchResult | null>(null);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');
  const [expandedProduct, setExpandedProduct] = useState<number | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const handleAIAnalyze = async () => {
    if (!result) return;
    setAiLoading(true);
    setAiError('');
    setAiAnalysis(null);

    try {
      const res = await fetch('/api/rakuten-research/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ searchResult: result }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error || 'AI分析に失敗しました');
        return;
      }
      setAiAnalysis(data.data);
    } catch {
      setAiError('通信エラーが発生しました');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setError('キーワードを入力してください');
      return;
    }
    setIsLoading(true);
    setError('');
    setResult(null);
    setAiAnalysis(null);
    setAiError('');

    try {
      const res = await fetch('/api/rakuten-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim(), sort }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'エラーが発生しました');
        return;
      }
      setResult(data.data);
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

  // 売れ筋判定スコア
  const calcSalesScore = (product: RakutenProduct): number => {
    let score = 0;
    // レビュー数（max 40点）
    score += Math.min(40, product.reviewCount * 2);
    // レビュー評価（max 30点）
    score += Math.min(30, product.reviewAverage * 6);
    // ページ充実度（max 30点）
    const quality = calcPageQualityScore(product);
    score += Math.min(30, quality.totalScore * 0.3);
    return Math.min(100, Math.round(score));
  };

  const getSalesLabel = (score: number): { label: string; color: string } => {
    if (score >= 80) return { label: '非常に売れている', color: 'text-green-400' };
    if (score >= 60) return { label: 'よく売れている', color: 'text-blue-400' };
    if (score >= 40) return { label: 'まあまあ売れている', color: 'text-amber-400' };
    if (score >= 20) return { label: 'あまり売れていない', color: 'text-orange-400' };
    return { label: '売上が少ない', color: 'text-red-400' };
  };

  const hasResults = !!result;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* エディタヘッダー */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard?view=rakuten-research')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-rose-50 rounded-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-rose-600" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">楽天市場リサーチ</h1>
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
              ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50/50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          キーワード入力
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
            mobileTab === 'preview'
              ? 'text-rose-600 border-b-2 border-rose-600 bg-rose-50/50'
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
                <Search className="w-5 h-5 text-rose-600" />
                <h2 className="text-lg font-bold text-gray-900">リサーチキーワード</h2>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => { setKeyword(e.target.value); if (error) setError(''); }}
                  onKeyDown={handleKeyDown}
                  placeholder="例: プロテイン、加湿器、スマホケース..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                />

                {/* ソート選択 */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
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
                  <><Loader2 className="w-5 h-5 animate-spin" />リサーチ中...</>
                ) : (
                  <><Search className="w-5 h-5" />リサーチ開始</>
                )}
              </button>
            </div>

            {/* 市場概要（結果がある場合） */}
            {result && (
              <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
                <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-rose-600" />
                  市場概要
                </h3>
                <div className="space-y-2 text-sm">
                  <SummaryRow label="競合商品数" value={`${formatNumber(result.totalCount)}件`} />
                  <SummaryRow label="平均価格" value={formatPrice(result.marketSummary.avgPrice)} />
                  <SummaryRow label="最安値" value={formatPrice(result.marketSummary.minPrice)} />
                  <SummaryRow label="最高値" value={formatPrice(result.marketSummary.maxPrice)} />
                  <SummaryRow label="中央値" value={formatPrice(result.marketSummary.medianPrice)} />
                  <SummaryRow label="上位10商品の平均価格" value={formatPrice(result.marketSummary.topProductsAvgPrice)} />
                  <SummaryRow label="平均レビュー数" value={`${result.marketSummary.avgReviewCount}件`} />
                  <SummaryRow label="平均レビュー評価" value={`${result.marketSummary.avgReviewScore}点`} />
                  <SummaryRow label="送料無料率" value={`${result.marketSummary.freeShippingRate}%`} />
                </div>
              </div>
            )}

            {/* AI販売戦略分析ボタン */}
            {result && (
              <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-gray-900">AI販売戦略分析</h3>
                </div>
                <p className="text-xs text-gray-600 mb-4">
                  取得したデータをAIが分析し、参入判断・価格戦略・キーワード戦略・ページ最適化のアドバイスを生成します。
                </p>

                {aiError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg mb-3">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{aiError}</span>
                  </div>
                )}

                <button
                  onClick={handleAIAnalyze}
                  disabled={aiLoading}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {aiLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" />AI分析中...</>
                  ) : aiAnalysis ? (
                    <><Sparkles className="w-5 h-5" />再分析する</>
                  ) : (
                    <><Sparkles className="w-5 h-5" />AIで販売戦略を分析</>
                  )}
                </button>

                {/* AI分析サマリー（左パネル） */}
                {aiAnalysis && (
                  <div className="mt-4 space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">参入判定</span>
                      <span className={`font-bold ${
                        aiAnalysis.marketEntry.verdict === '参入推奨' ? 'text-green-600' :
                        aiAnalysis.marketEntry.verdict === '条件付き推奨' ? 'text-blue-600' :
                        aiAnalysis.marketEntry.verdict === '慎重に検討' ? 'text-amber-600' :
                        'text-red-600'
                      }`}>
                        {aiAnalysis.marketEntry.verdict}（{aiAnalysis.marketEntry.score}点）
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">推奨価格帯</span>
                      <span className="font-bold text-gray-900">{aiAnalysis.pricingStrategy.recommendedRange}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">競争レベル</span>
                      <span className="font-bold text-gray-900">{aiAnalysis.competitionAnalysis.level}</span>
                    </div>
                    <p className="text-xs text-gray-500 pt-1">詳細は右パネルで確認できます →</p>
                  </div>
                )}
              </div>
            )}

            {/* 使い方ガイド */}
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">使い方</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">1.</span>
                  <span>販売したい商品のキーワードを入力</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">2.</span>
                  <span>競合数・価格帯・レビュー傾向を確認</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">3.</span>
                  <span>上位商品のページ充実度と頻出キーワードを分析</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 mt-0.5">4.</span>
                  <span>「売れ筋判定」で市場のポテンシャルを判断</span>
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
                <ShoppingBag className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">分析結果がここに表示されます</p>
                <p className="text-sm">左側にキーワードを入力して「リサーチ開始」をクリック</p>
              </div>
            )}

            {isLoading && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="text-lg font-semibold">楽天データを取得中...</p>
                <p className="text-sm mt-2">最大3ページ分のデータを取得します</p>
              </div>
            )}

            {result && (
              <ResultsPanel
                result={result}
                calcSalesScore={calcSalesScore}
                getSalesLabel={getSalesLabel}
                expandedProduct={expandedProduct}
                setExpandedProduct={setExpandedProduct}
                aiAnalysis={aiAnalysis}
                aiLoading={aiLoading}
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

// --- 分析結果パネル ---
function ResultsPanel({
  result,
  calcSalesScore,
  getSalesLabel,
  expandedProduct,
  setExpandedProduct,
  aiAnalysis,
  aiLoading,
}: {
  result: RakutenSearchResult;
  calcSalesScore: (p: RakutenProduct) => number;
  getSalesLabel: (score: number) => { label: string; color: string };
  expandedProduct: number | null;
  setExpandedProduct: (idx: number | null) => void;
  aiAnalysis: AIAnalysis | null;
  aiLoading: boolean;
}) {
  const COLORS = ['#f43f5e', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'];

  // 価格帯分布チャート用データ
  const priceRanges = calcPriceRanges(result.products);

  // レビュー数 Top10
  const top10ByReview = [...result.products]
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 10)
    .map((p) => ({
      name: p.itemName.length > 15 ? p.itemName.slice(0, 15) + '...' : p.itemName,
      reviewCount: p.reviewCount,
      reviewAverage: p.reviewAverage,
    }));

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* 検索結果ヘッダー */}
      <div className="bg-gradient-to-r from-rose-600/30 to-purple-600/30 rounded-xl p-4 border border-rose-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-rose-400" />
            <span className="text-white font-bold text-lg">「{result.keyword}」</span>
          </div>
          <span className="text-gray-300 text-sm">{formatNumber(result.totalCount)}件ヒット</span>
        </div>
      </div>

      {/* 市場スコアカード */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Package} label="競合商品数" value={formatNumber(result.totalCount)} color="rose" />
        <StatCard icon={TrendingUp} label="平均価格" value={formatPrice(result.marketSummary.avgPrice)} color="blue" />
        <StatCard icon={Star} label="平均評価" value={`${result.marketSummary.avgReviewScore}`} color="amber" />
        <StatCard icon={Truck} label="送料無料率" value={`${result.marketSummary.freeShippingRate}%`} color="green" />
      </div>

      {/* AI分析ローディング */}
      {aiLoading && (
        <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
            <span className="text-purple-300 font-semibold">AIが販売戦略を分析中...</span>
          </div>
        </div>
      )}

      {/* AI販売戦略分析結果 */}
      {aiAnalysis && (
        <>
          {/* 参入判定 */}
          <div className={`rounded-xl p-4 border ${
            aiAnalysis.marketEntry.score >= 70 ? 'bg-green-600/20 border-green-500/30' :
            aiAnalysis.marketEntry.score >= 50 ? 'bg-blue-600/20 border-blue-500/30' :
            aiAnalysis.marketEntry.score >= 30 ? 'bg-amber-600/20 border-amber-500/30' :
            'bg-red-600/20 border-red-500/30'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-bold text-sm">参入判定</h3>
              <span className={`ml-auto text-2xl font-bold ${
                aiAnalysis.marketEntry.score >= 70 ? 'text-green-400' :
                aiAnalysis.marketEntry.score >= 50 ? 'text-blue-400' :
                aiAnalysis.marketEntry.score >= 30 ? 'text-amber-400' :
                'text-red-400'
              }`}>{aiAnalysis.marketEntry.score}<span className="text-sm text-gray-400">/100</span></span>
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${
              aiAnalysis.marketEntry.verdict === '参入推奨' ? 'bg-green-500/30 text-green-300' :
              aiAnalysis.marketEntry.verdict === '条件付き推奨' ? 'bg-blue-500/30 text-blue-300' :
              aiAnalysis.marketEntry.verdict === '慎重に検討' ? 'bg-amber-500/30 text-amber-300' :
              'bg-red-500/30 text-red-300'
            }`}>
              {aiAnalysis.marketEntry.verdict}
            </div>
            <p className="text-gray-300 text-sm">{aiAnalysis.marketEntry.reason}</p>
          </div>

          {/* 価格戦略 */}
          <div className="bg-gray-700/50 rounded-xl p-4">
            <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              価格戦略
            </h3>
            <div className="bg-green-500/10 rounded-lg px-3 py-2 mb-2">
              <span className="text-green-300 font-bold text-sm">推奨価格帯: {aiAnalysis.pricingStrategy.recommendedRange}</span>
            </div>
            <p className="text-gray-300 text-sm mb-2">{aiAnalysis.pricingStrategy.strategy}</p>
            <ul className="space-y-1">
              {aiAnalysis.pricingStrategy.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                  <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* キーワード戦略 */}
          <div className="bg-gray-700/50 rounded-xl p-4">
            <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
              <Hash className="w-4 h-4 text-purple-400" />
              キーワード戦略
            </h3>
            <div className="mb-3">
              <p className="text-gray-400 text-xs mb-1.5">必須キーワード</p>
              <div className="flex flex-wrap gap-1.5">
                {aiAnalysis.keywordStrategy.mustUseKeywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30 font-medium">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <p className="text-gray-400 text-xs mb-1">推奨タイトル構成</p>
              <p className="text-gray-200 text-sm bg-gray-600/30 rounded-lg px-3 py-2">{aiAnalysis.keywordStrategy.titleTemplate}</p>
            </div>
            <ul className="space-y-1">
              {aiAnalysis.keywordStrategy.descriptionTips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                  <CheckCircle className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* ページ最適化 */}
          <div className="bg-gray-700/50 rounded-xl p-4">
            <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              ページ最適化
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-gray-600/30 rounded-lg px-3 py-2">
                <p className="text-gray-400 text-[10px]">推奨文章量</p>
                <p className="text-cyan-300 text-sm font-bold">{aiAnalysis.pageOptimization.recommendedCaptionLength}</p>
              </div>
              <div className="bg-gray-600/30 rounded-lg px-3 py-2">
                <p className="text-gray-400 text-[10px]">画像</p>
                <p className="text-cyan-300 text-sm font-bold">{aiAnalysis.pageOptimization.imageRecommendation}</p>
              </div>
            </div>
            <ul className="space-y-1">
              {aiAnalysis.pageOptimization.tips.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                  <CheckCircle className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 競合分析 */}
          <div className="bg-gray-700/50 rounded-xl p-4">
            <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              競合分析
              <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold ${
                aiAnalysis.competitionAnalysis.level === '低' ? 'bg-green-500/20 text-green-300' :
                aiAnalysis.competitionAnalysis.level === '中' ? 'bg-blue-500/20 text-blue-300' :
                aiAnalysis.competitionAnalysis.level === '高' ? 'bg-amber-500/20 text-amber-300' :
                'bg-red-500/20 text-red-300'
              }`}>競争 {aiAnalysis.competitionAnalysis.level}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <p className="text-gray-400 text-xs mb-1">市場の強み</p>
                <ul className="space-y-1">
                  {aiAnalysis.competitionAnalysis.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                      <span className="text-green-400 mt-0.5">+</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-gray-400 text-xs mb-1">チャンス</p>
                <ul className="space-y-1">
                  {aiAnalysis.competitionAnalysis.weaknesses.map((w, i) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                      <span className="text-amber-400 mt-0.5">!</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-gray-400 text-xs mb-1">差別化アイデア</p>
            <ul className="space-y-1">
              {aiAnalysis.competitionAnalysis.differentiationIdeas.map((idea, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                  <Lightbulb className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                  <span>{idea}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* アクションプラン */}
          <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-xl p-4 border border-purple-500/30">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" />
              今すぐやるべきこと
            </h3>
            <ol className="space-y-2">
              {aiAnalysis.actionPlan.map((action, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/30 text-purple-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                  <span className="text-gray-300">{action}</span>
                </li>
              ))}
            </ol>
          </div>
        </>
      )}

      {/* 価格帯分布 */}
      <div className="bg-gray-700/50 rounded-xl p-4">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-rose-400" />
          価格帯分布
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={priceRanges} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="range" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={{ stroke: '#4b5563' }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 11 }} axisLine={{ stroke: '#4b5563' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
              formatter={(value: number) => [`${value}件`, '商品数']}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={30}>
              {priceRanges.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* レビュー数 Top10 */}
      {top10ByReview.length > 0 && (
        <div className="bg-gray-700/50 rounded-xl p-4">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-400" />
            レビュー数 Top10
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={top10ByReview} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#4b5563' }} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#d1d5db', fontSize: 10 }} width={120} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                formatter={(value: number, name: string) => [
                  name === 'reviewCount' ? `${formatNumber(value)}件` : `${value}`,
                  name === 'reviewCount' ? 'レビュー数' : '評価',
                ]}
              />
              <Bar dataKey="reviewCount" radius={[0, 4, 4, 0]} barSize={16} fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* タイトル頻出キーワード */}
      {result.keywordAnalysis.titleKeywords.length > 0 && (
        <div className="bg-gray-700/50 rounded-xl p-4">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4 text-purple-400" />
            タイトル頻出キーワード
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.keywordAnalysis.titleKeywords.map((kw, i) => (
              <span key={i} className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full border border-purple-500/30 flex items-center gap-1">
                {kw.word}
                <span className="bg-purple-500/30 px-1.5 py-0.5 rounded-full text-[10px] font-bold">{kw.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 説明文頻出キーワード */}
      {result.keywordAnalysis.captionKeywords.length > 0 && (
        <div className="bg-gray-700/50 rounded-xl p-4">
          <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            説明文頻出キーワード
          </h3>
          <div className="flex flex-wrap gap-2">
            {result.keywordAnalysis.captionKeywords.map((kw, i) => (
              <span key={i} className="px-2.5 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full border border-cyan-500/30 flex items-center gap-1">
                {kw.word}
                <span className="bg-cyan-500/30 px-1.5 py-0.5 rounded-full text-[10px] font-bold">{kw.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 商品一覧 */}
      <div className="bg-gray-700/50 rounded-xl p-4">
        <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
          <Package className="w-4 h-4 text-rose-400" />
          上位商品一覧（{result.products.length}件）
        </h3>
        <div className="space-y-2">
          {result.products.map((product, i) => {
            const salesScore = calcSalesScore(product);
            const salesLabel = getSalesLabel(salesScore);
            const quality = calcPageQualityScore(product);
            const isExpanded = expandedProduct === i;

            return (
              <div key={i} className="bg-gray-600/30 rounded-xl overflow-hidden border border-gray-600/50">
                {/* 商品サマリー行 */}
                <button
                  onClick={() => setExpandedProduct(isExpanded ? null : i)}
                  className="w-full p-3 flex gap-3 text-left hover:bg-gray-600/20 transition-colors"
                >
                  {/* 順位 */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-white font-bold text-xs">{product.rank}</span>
                  </div>

                  {/* 商品画像 */}
                  {product.imageUrl && (
                    <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-white">
                      <img src={product.imageUrl} alt={product.itemName} className="w-full h-full object-contain" />
                    </div>
                  )}

                  {/* 商品情報 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium line-clamp-1">{product.itemName}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <span className="text-rose-300 font-bold text-sm">{formatPrice(product.itemPrice)}</span>
                      <span className="text-gray-400 text-xs flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-amber-400" />
                        {product.reviewAverage} ({formatNumber(product.reviewCount)})
                      </span>
                      {product.postageFlag && (
                        <span className="text-green-400 text-[10px] px-1.5 py-0.5 bg-green-500/20 rounded">送料無料</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-bold ${salesLabel.color}`}>
                        売れ筋 {salesScore}点
                      </span>
                      <span className="text-gray-500 text-[10px]">{salesLabel.label}</span>
                    </div>
                  </div>

                  {/* 展開アイコン */}
                  <div className="flex-shrink-0 flex items-center">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* 展開時の詳細 */}
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-3 border-t border-gray-600/50 pt-3">
                    {/* ページ充実度 */}
                    <div>
                      <p className="text-gray-300 text-xs font-semibold mb-2">ページ充実度スコア: {quality.totalScore}/100</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <QualityBar label="文章量" score={quality.captionScore} max={30} detail={`${formatNumber(quality.captionLength)}文字`} />
                        <QualityBar label="レビュー数" score={quality.reviewScore} max={30} detail={`${formatNumber(product.reviewCount)}件`} />
                        <QualityBar label="レビュー評価" score={quality.ratingScore} max={20} detail={`${product.reviewAverage}点`} />
                        <QualityBar label="画像数(推定)" score={quality.imageScore} max={20} detail={`${quality.imageScore / 4}枚`} />
                      </div>
                    </div>

                    {/* ショップ情報 */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">ショップ: <span className="text-gray-300">{product.shopName}</span></span>
                      <a
                        href={product.itemUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        楽天で見る <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// --- 価格帯分布計算 ---
function calcPriceRanges(products: RakutenProduct[]) {
  if (products.length === 0) return [];

  const prices = products.map((p) => p.itemPrice).sort((a, b) => a - b);
  const maxPrice = prices[prices.length - 1];
  const minPrice = prices[0];

  // 価格帯を5分割
  const range = maxPrice - minPrice;
  if (range === 0) return [{ range: formatPrice(minPrice), count: products.length }];

  const step = Math.ceil(range / 5);
  const ranges: { range: string; count: number }[] = [];

  for (let i = 0; i < 5; i++) {
    const low = minPrice + step * i;
    const high = i === 4 ? maxPrice : minPrice + step * (i + 1) - 1;
    const count = products.filter((p) => p.itemPrice >= low && (i === 4 ? p.itemPrice <= high : p.itemPrice < low + step)).length;
    if (count > 0) {
      ranges.push({
        range: `${formatPriceShort(low)}~${formatPriceShort(high)}`,
        count,
      });
    }
  }

  return ranges;
}

function formatPriceShort(price: number): string {
  if (price >= 10000) return `${(price / 10000).toFixed(price % 10000 === 0 ? 0 : 1)}万`;
  if (price >= 1000) return `${(price / 1000).toFixed(price % 1000 === 0 ? 0 : 1)}千`;
  return `${price}`;
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
  color: 'rose' | 'blue' | 'amber' | 'green';
}) {
  const colors = {
    rose: { bg: 'bg-rose-500/20', icon: 'text-rose-400' },
    blue: { bg: 'bg-blue-500/20', icon: 'text-blue-400' },
    amber: { bg: 'bg-amber-500/20', icon: 'text-amber-400' },
    green: { bg: 'bg-green-500/20', icon: 'text-green-400' },
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

function QualityBar({ label, score, max, detail }: { label: string; score: number; max: number; detail: string }) {
  const percent = Math.round((score / max) * 100);
  const barColor = percent >= 70 ? 'bg-green-500' : percent >= 40 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div>
      <div className="flex justify-between mb-0.5">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300">{detail}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <div className={`${barColor} h-1.5 rounded-full transition-all`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
