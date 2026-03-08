'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Search, Loader2, Download, BarChart3,
  ArrowUpDown, ArrowLeft, ChevronDown, ChevronRight, Globe,
  Sparkles, Clock, X, Filter,
  TrendingUp, Lightbulb, Users, Type, AlertCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { GoogleKeywordData } from '@/lib/google-search';
import { formatNumber, getCompetitionLevel, calcOpportunityScore } from '@/lib/google-search';

type Props = {
  user: { id: string; email?: string };
  isAdmin: boolean;
};

type SortKey = 'keyword' | 'allintitleCount' | 'opportunityScore' | 'source';
type SortOrder = 'asc' | 'desc';
type ExpansionType = 'alphabet' | 'hiragana' | 'both' | 'none';
type AnalysisType = 'full' | 'competition' | 'content-ideas' | 'long-tail' | 'persona' | 'title-pattern';
type MobileTab = 'editor' | 'preview';

type SearchHistoryItem = {
  keyword: string;
  expansionType: ExpansionType;
  resultCount: number;
  timestamp: string;
  results: GoogleKeywordData[];
};

const ANALYSIS_TYPES: { id: AnalysisType; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'full', label: '総合分析', icon: BarChart3, description: '市場・競合・戦略を総合分析' },
  { id: 'competition', label: '競合分析', icon: TrendingUp, description: 'allintitle詳細分析' },
  { id: 'content-ideas', label: 'コンテンツ提案', icon: Lightbulb, description: 'ブログ記事アイデア' },
  { id: 'long-tail', label: 'ロングテール', icon: Search, description: 'ロングテールKW発掘' },
  { id: 'persona', label: 'ペルソナ分析', icon: Users, description: '検索ユーザー分析' },
  { id: 'title-pattern', label: 'タイトル最適化', icon: Type, description: 'SEOタイトル提案' },
];

const HISTORY_KEY = 'google-keyword-research-history';
const MAX_HISTORY = 20;

export default function GoogleKeywordResearchEditor({ user, isAdmin }: Props) {
  const router = useRouter();

  // 検索状態
  const [keyword, setKeyword] = useState('');
  const [expansionType, setExpansionType] = useState<ExpansionType>('alphabet');
  const [checkAllintitle, setCheckAllintitle] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<GoogleKeywordData[]>([]);
  const [searchedKeyword, setSearchedKeyword] = useState('');
  const [error, setError] = useState('');

  // ソート・フィルター
  const [sortKey, setSortKey] = useState<SortKey>('allintitleCount');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [maxAllintitle, setMaxAllintitle] = useState<number | ''>('');
  const [filterText, setFilterText] = useState('');

  // AI分析
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('full');

  // 履歴
  const [history, setHistory] = useState<SearchHistoryItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHistory, setShowHistory] = useState(false);

  // モバイルタブ
  const [mobileTab, setMobileTab] = useState<MobileTab>('editor');

  // 検索実行
  const handleSearch = useCallback(async () => {
    if (!keyword.trim()) return;
    setIsSearching(true);
    setError('');
    setResults([]);
    setAnalysisResult('');

    try {
      const res = await fetch('/api/google-keyword-research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim(), expansionType, checkAllintitle }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'エラーが発生しました');
      }

      const data = await res.json();
      setResults(data.data || []);
      setSearchedKeyword(keyword.trim());

      // 履歴に追加
      const newItem: SearchHistoryItem = {
        keyword: keyword.trim(),
        expansionType,
        resultCount: data.data?.length || 0,
        timestamp: new Date().toISOString(),
        results: data.data || [],
      };

      setHistory((prev) => {
        const filtered = prev.filter((h) => h.keyword !== keyword.trim());
        const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
        return updated;
      });

      setMobileTab('preview');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'エラーが発生しました');
    } finally {
      setIsSearching(false);
    }
  }, [keyword, expansionType, checkAllintitle]);

  // AI分析
  const handleAIAnalysis = useCallback(async (type: AnalysisType) => {
    if (results.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisType(type);
    setAnalysisResult('');

    try {
      const res = await fetch('/api/google-keyword-research/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: searchedKeyword,
          results,
          analysisType: type,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'AI分析に失敗しました');
      }

      const data = await res.json();
      setAnalysisResult(data.analysis || '');
    } catch (e: unknown) {
      setAnalysisResult(`エラー: ${e instanceof Error ? e.message : '不明なエラー'}`);
    } finally {
      setIsAnalyzing(false);
    }
  }, [results, searchedKeyword]);

  // ソート切り替え
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder(key === 'allintitleCount' ? 'asc' : 'desc');
    }
  };

  // フィルタ・ソート済み結果
  const filteredResults = useMemo(() => {
    let filtered = [...results];

    // テキストフィルター
    if (filterText) {
      const lower = filterText.toLowerCase();
      filtered = filtered.filter((r) => r.keyword.toLowerCase().includes(lower));
    }

    // allintitle上限フィルター
    if (maxAllintitle !== '' && maxAllintitle >= 0) {
      filtered = filtered.filter((r) => r.allintitleCount <= maxAllintitle || r.allintitleCount < 0);
    }

    // ソート
    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'keyword':
          cmp = a.keyword.localeCompare(b.keyword, 'ja');
          break;
        case 'allintitleCount':
          // -1(未取得)は最後に
          const aVal = a.allintitleCount < 0 ? Infinity : a.allintitleCount;
          const bVal = b.allintitleCount < 0 ? Infinity : b.allintitleCount;
          cmp = aVal - bVal;
          break;
        case 'opportunityScore':
          cmp = calcOpportunityScore(b.allintitleCount) - calcOpportunityScore(a.allintitleCount);
          break;
        case 'source':
          cmp = a.source.localeCompare(b.source);
          break;
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return filtered;
  }, [results, filterText, maxAllintitle, sortKey, sortOrder]);

  // チャートデータ（allintitle件数あり、上位20件）
  const chartData = useMemo(() => {
    return filteredResults
      .filter((r) => r.allintitleCount >= 0)
      .slice(0, 20)
      .map((r) => ({
        keyword: r.keyword.length > 15 ? r.keyword.slice(0, 15) + '…' : r.keyword,
        allintitle: r.allintitleCount,
        score: calcOpportunityScore(r.allintitleCount),
      }));
  }, [filteredResults]);

  // CSVエクスポート
  const handleExportCSV = () => {
    if (filteredResults.length === 0) return;

    const header = 'キーワード,allintitle件数,穴場スコア,競合レベル,展開元';
    const rows = filteredResults.map((r) => {
      const level = getCompetitionLevel(r.allintitleCount);
      return `"${r.keyword}",${r.allintitleCount >= 0 ? r.allintitleCount : '未取得'},${r.allintitleCount >= 0 ? calcOpportunityScore(r.allintitleCount) : ''},${level.level},"${r.source}"`;
    });

    const bom = '\uFEFF';
    const csv = bom + [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `google-keyword-${searchedKeyword}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 履歴から復元
  const restoreHistory = (item: SearchHistoryItem) => {
    setKeyword(item.keyword);
    setSearchedKeyword(item.keyword);
    setExpansionType(item.expansionType);
    setResults(item.results);
    setShowHistory(false);
    setMobileTab('preview');
  };

  // 履歴削除
  const deleteHistory = (idx: number) => {
    setHistory((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // 簡易Markdownレンダー
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-white mt-6 mb-2">{line.slice(4)}</h3>;
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-white mt-8 mb-3">{line.slice(3)}</h2>;
      if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold text-white mt-8 mb-4">{line.slice(2)}</h1>;
      if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-bold text-white/90 mt-3">{line.slice(2, -2)}</p>;
      if (line.startsWith('- ')) return <li key={i} className="ml-4 text-white/80 list-disc">{formatInlineMarkdown(line.slice(2))}</li>;
      if (line.match(/^\d+\.\s/)) return <li key={i} className="ml-4 text-white/80 list-decimal">{formatInlineMarkdown(line.replace(/^\d+\.\s/, ''))}</li>;
      if (line.trim() === '') return <br key={i} />;
      return <p key={i} className="text-white/80 leading-relaxed">{formatInlineMarkdown(line)}</p>;
    });
  };

  const formatInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="text-white font-bold">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  // チャートのバー色
  const getBarColor = (count: number) => {
    if (count === 0) return '#3b82f6';
    if (count <= 10) return '#22c55e';
    if (count <= 100) return '#10b981';
    if (count <= 1000) return '#eab308';
    if (count <= 10000) return '#f97316';
    return '#ef4444';
  };

  const hasResults = results.length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* エディタヘッダー */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1920px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard?view=google-keyword-research')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-teal-600" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Googleキーワードリサーチ</h1>
            </div>
          </div>
          {hasResults && (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-50 border border-teal-200 text-teal-700 font-semibold rounded-xl hover:bg-teal-100 transition-colors text-sm min-h-[44px] shadow-sm"
            >
              <Download className="w-4 h-4" />
              CSV出力
            </button>
          )}
        </div>
      </div>

      {/* モバイルタブ */}
      <div className="lg:hidden sticky top-[121px] z-30 bg-white border-b border-gray-200 flex">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
            mobileTab === 'editor'
              ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          キーワード入力
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 py-3 text-sm font-semibold text-center transition-colors ${
            mobileTab === 'preview'
              ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50/50'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          分析結果 {results.length > 0 && `(${results.length})`}
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
                <Search className="w-5 h-5 text-teal-600" />
                <h2 className="text-lg font-bold text-gray-900">リサーチキーワード</h2>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="例: ダイエット サプリ"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />

                {/* 展開方式 */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">サジェスト展開方式</label>
                  <select
                    value={expansionType}
                    onChange={(e) => setExpansionType(e.target.value as ExpansionType)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  >
                    <option value="alphabet">アルファベット（a〜z）</option>
                    <option value="hiragana">ひらがな（あ〜わ）</option>
                    <option value="both">両方（a〜z + あ〜わ）</option>
                    <option value="none">展開なし（ベースのみ）</option>
                  </select>
                </div>

                {/* allintitleチェック */}
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checkAllintitle}
                      onChange={(e) => setCheckAllintitle(e.target.checked)}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700">allintitle件数を取得する</span>
                  </label>
                  <span className="text-xs text-gray-500">（API使用量に注意）</span>
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
                disabled={isSearching || !keyword.trim()}
                className="w-full mt-4 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
              >
                {isSearching ? (
                  <><Loader2 className="w-5 h-5 animate-spin" />リサーチ中...</>
                ) : (
                  <><Search className="w-5 h-5" />リサーチ開始</>
                )}
              </button>
            </div>

            {/* フィルター */}
            {results.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-gray-900">フィルター</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">キーワード絞り込み</label>
                    <input
                      type="text"
                      value={filterText}
                      onChange={(e) => setFilterText(e.target.value)}
                      placeholder="含むテキスト"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">allintitle上限</label>
                    <input
                      type="number"
                      value={maxAllintitle}
                      onChange={(e) => setMaxAllintitle(e.target.value ? Number(e.target.value) : '')}
                      placeholder="例: 100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* AI分析ボタン群 */}
            {results.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <h3 className="text-sm font-bold text-gray-900">AI分析</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ANALYSIS_TYPES.map((at) => (
                    <button
                      key={at.id}
                      onClick={() => handleAIAnalysis(at.id)}
                      disabled={isAnalyzing}
                      className="flex flex-col items-center gap-1 p-3 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all text-center disabled:opacity-50"
                    >
                      <at.icon size={18} className="text-purple-500" />
                      <span className="text-xs font-bold text-gray-700">{at.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 検索履歴 */}
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between text-sm font-bold text-gray-900"
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  検索履歴 ({history.length})
                </span>
                {showHistory ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>

              {showHistory && (
                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
                  {history.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">履歴はありません</p>
                  ) : (
                    history.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 group">
                        <button
                          onClick={() => restoreHistory(item)}
                          className="flex-1 text-left"
                        >
                          <span className="text-sm font-medium text-gray-900">{item.keyword}</span>
                          <span className="text-xs text-gray-500 ml-2">{item.resultCount}件</span>
                          <span className="text-xs text-gray-400 ml-2">
                            {new Date(item.timestamp).toLocaleDateString('ja-JP')}
                          </span>
                        </button>
                        <button
                          onClick={() => deleteHistory(idx)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* 使い方ガイド */}
            <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">使い方</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">1.</span>
                  <span>狙いたいキーワードを入力</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">2.</span>
                  <span>サジェスト展開でロングテールKWを自動取得</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">3.</span>
                  <span>allintitle件数で競合の少ないKWを発見</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">4.</span>
                  <span>AI分析で戦略・コンテンツ案を取得</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 右パネル: 分析結果 */}
        <div className={`w-full lg:fixed lg:right-0 lg:top-[138px] lg:w-1/2 lg:h-[calc(100vh-138px)] flex-col bg-gray-800 border-l border-gray-700 ${mobileTab === 'editor' ? 'hidden lg:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            {!hasResults && !isSearching && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Globe className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">分析結果がここに表示されます</p>
                <p className="text-sm">左側にキーワードを入力して「リサーチ開始」をクリック</p>
              </div>
            )}

            {isSearching && (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-12 h-12 animate-spin mb-4" />
                <p className="text-lg font-semibold">キーワードを分析中...</p>
                <p className="text-sm mt-2">サジェスト展開 → allintitle取得</p>
              </div>
            )}

            {hasResults && !isSearching && (
              <div className="max-w-2xl mx-auto space-y-4">
                {/* 検索結果ヘッダー */}
                <div className="bg-gradient-to-r from-teal-600/30 to-cyan-600/30 rounded-xl p-4 border border-teal-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Search className="w-5 h-5 text-teal-400" />
                      <span className="text-white font-bold text-lg">「{searchedKeyword}」</span>
                    </div>
                    <span className="text-gray-300 text-sm">{results.length}キーワード</span>
                  </div>
                </div>

                {/* 市場スコアカード */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-gray-500/20 rounded-xl p-4 text-center">
                    <BarChart3 className="w-5 h-5 text-gray-400 mx-auto mb-1.5" />
                    <p className="text-white font-bold text-base">{results.length}</p>
                    <p className="text-gray-400 text-xs mt-0.5">総キーワード</p>
                  </div>
                  <div className="bg-blue-500/20 rounded-xl p-4 text-center">
                    <TrendingUp className="w-5 h-5 text-blue-400 mx-auto mb-1.5" />
                    <p className="text-white font-bold text-base">{results.filter((r) => r.allintitleCount === 0).length}</p>
                    <p className="text-gray-400 text-xs mt-0.5">ブルーオーシャン</p>
                  </div>
                  <div className="bg-green-500/20 rounded-xl p-4 text-center">
                    <Search className="w-5 h-5 text-green-400 mx-auto mb-1.5" />
                    <p className="text-white font-bold text-base">{results.filter((r) => r.allintitleCount >= 0 && r.allintitleCount <= 100).length}</p>
                    <p className="text-gray-400 text-xs mt-0.5">穴場（〜100件）</p>
                  </div>
                  <div className="bg-red-500/20 rounded-xl p-4 text-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mx-auto mb-1.5" />
                    <p className="text-white font-bold text-base">{results.filter((r) => r.allintitleCount > 1000).length}</p>
                    <p className="text-gray-400 text-xs mt-0.5">激戦区（1000+）</p>
                  </div>
                </div>

                {/* チャート */}
                {chartData.length > 0 && (
                  <div className="bg-gray-700/50 rounded-xl p-4">
                    <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-teal-400" />
                      allintitle件数（上位20件）
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis type="number" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#4b5563' }} />
                          <YAxis type="category" dataKey="keyword" width={120} tick={{ fill: '#d1d5db', fontSize: 11 }} axisLine={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }}
                            formatter={(value: number) => [formatNumber(value), 'allintitle']}
                          />
                          <Bar dataKey="allintitle" radius={[0, 4, 4, 0]}>
                            {chartData.map((entry, idx) => (
                              <Cell key={idx} fill={getBarColor(entry.allintitle)} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* 結果テーブル */}
                <div className="bg-gray-700/50 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-gray-600">
                    <span className="text-sm font-bold text-gray-300">
                      {filteredResults.length}件表示 / {results.length}件中
                    </span>
                  </div>
                  <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-700 sticky top-0">
                        <tr>
                          <th className="text-left px-4 py-3 text-gray-300 font-bold">
                            <button onClick={() => handleSort('keyword')} className="flex items-center gap-1 hover:text-white">
                              キーワード <ArrowUpDown size={12} />
                            </button>
                          </th>
                          <th className="text-right px-4 py-3 text-gray-300 font-bold">
                            <button onClick={() => handleSort('allintitleCount')} className="flex items-center gap-1 hover:text-white ml-auto">
                              allintitle <ArrowUpDown size={12} />
                            </button>
                          </th>
                          <th className="text-center px-4 py-3 text-gray-300 font-bold">競合</th>
                          <th className="text-center px-4 py-3 text-gray-300 font-bold hidden sm:table-cell">
                            <button onClick={() => handleSort('source')} className="flex items-center gap-1 hover:text-white mx-auto">
                              展開元 <ArrowUpDown size={12} />
                            </button>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredResults.map((r, idx) => {
                          const level = getCompetitionLevel(r.allintitleCount);
                          return (
                            <tr key={idx} className="border-t border-gray-600/50 hover:bg-gray-600/20">
                              <td className="px-4 py-2.5 text-white font-medium">{r.keyword}</td>
                              <td className="px-4 py-2.5 text-right">
                                {r.allintitleCount >= 0 ? (
                                  <span className="font-bold text-white">{formatNumber(r.allintitleCount)}</span>
                                ) : (
                                  <span className="text-gray-500 text-xs">未取得</span>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                {r.allintitleCount >= 0 ? (
                                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                                    level.color === 'text-blue-600' ? 'bg-blue-500/20 text-blue-300' :
                                    level.color === 'text-green-600' ? 'bg-green-500/20 text-green-300' :
                                    level.color === 'text-emerald-600' ? 'bg-emerald-500/20 text-emerald-300' :
                                    level.color === 'text-yellow-600' ? 'bg-yellow-500/20 text-yellow-300' :
                                    level.color === 'text-orange-600' ? 'bg-orange-500/20 text-orange-300' :
                                    'bg-red-500/20 text-red-300'
                                  }`}>
                                    {level.level}
                                  </span>
                                ) : (
                                  <span className="text-gray-500 text-xs">-</span>
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-center text-gray-400 text-xs hidden sm:table-cell">{r.source}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI分析結果 */}
                {(isAnalyzing || analysisResult) && (
                  <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-xl p-6 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <h3 className="font-bold text-white">
                        AI分析: {ANALYSIS_TYPES.find((t) => t.id === analysisType)?.label}
                      </h3>
                    </div>
                    {isAnalyzing ? (
                      <div className="flex items-center gap-3 text-white/60">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>AIが分析中...</span>
                      </div>
                    ) : (
                      <div className="prose prose-invert max-w-none">
                        {renderMarkdown(analysisResult)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 右パネルのスペーサー */}
        <div className="hidden lg:block lg:w-1/2 lg:flex-shrink-0 bg-gray-50"></div>
      </div>
    </div>
  );
}
