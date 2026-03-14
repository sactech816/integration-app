'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Brain, Star, Loader2, Download, ExternalLink, Crown, Clock,
  Search, ChevronLeft, ChevronRight, FileText, Eye, Sparkles,
} from 'lucide-react';

type DiagnosisType = 'bigfive' | 'fortune';

interface BigFiveResult {
  id: string;
  user_id: string;
  user_email: string;
  test_type: 'simple' | 'full' | 'detailed';
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  mbti_code: string | null;
  pdf_purchased: boolean;
  has_report: boolean;
  has_pdf: boolean;
  report_generated_at: string | null;
  created_at: string;
}

interface FortuneResult {
  id: string;
  user_id: string;
  user_email: string;
  birth_year: number;
  birth_month: number;
  birth_day: number;
  result_snapshot: {
    nineStar: { year: string; month: string };
    numerology: { lifePath: string };
    fourPillars: { heavenlyStem: string };
  };
  report_purchased: boolean;
  has_report: boolean;
  has_pdf: boolean;
  report_generated_at: string | null;
  created_at: string;
}

const TRAIT_LABELS: Record<string, string> = {
  openness: '開放性',
  conscientiousness: '誠実性',
  extraversion: '外向性',
  agreeableness: '協調性',
  neuroticism: '情緒安定性',
};

export default function DiagnosisManager() {
  const [type, setType] = useState<DiagnosisType>('bigfive');
  const [results, setResults] = useState<(BigFiveResult | FortuneResult)[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [generating, setGenerating] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const limit = 20;

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type,
        page: String(page),
        limit: String(limit),
        ...(search && { search }),
      });
      const res = await fetch(`/api/admin/diagnosis-results?${params}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
        setTotal(data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch diagnosis results:', err);
    } finally {
      setLoading(false);
    }
  }, [type, page, search]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleTypeChange = (newType: DiagnosisType) => {
    setType(newType);
    setPage(1);
    setSearch('');
    setSearchInput('');
  };

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleGenerateReport = async (resultId: string) => {
    setGenerating(resultId);
    try {
      const endpoint = type === 'bigfive' ? '/api/bigfive/generate-report' : '/api/fortune/generate-report';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId }),
      });
      const data = await res.json();
      if (data.html) {
        // レポート生成成功 → リスト更新
        fetchResults();
        alert('レポートを生成しました');
      } else {
        alert(data.error || 'レポート生成に失敗しました');
      }
    } catch {
      alert('通信エラーが発生しました');
    } finally {
      setGenerating(null);
    }
  };

  const handleDownloadPdf = async (resultId: string) => {
    setDownloading(resultId);
    try {
      const endpoint = type === 'bigfive' ? '/api/bigfive/download-pdf' : '/api/fortune/download-pdf';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId }),
      });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        alert(data.error || 'PDFダウンロードに失敗しました');
      }
    } catch {
      alert('通信エラーが発生しました');
    } finally {
      setDownloading(null);
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <FileText className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">診断結果管理</h2>
          <p className="text-sm text-gray-500">全ユーザーの診断結果・PDF・レポートを管理</p>
        </div>
      </div>

      {/* タブ切替 */}
      <div className="flex gap-2">
        <button
          onClick={() => handleTypeChange('bigfive')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
            type === 'bigfive'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Brain className="w-4 h-4" />
          Big Five 性格診断
        </button>
        <button
          onClick={() => handleTypeChange('fortune')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
            type === 'fortune'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Star className="w-4 h-4" />
          生年月日占い
        </button>
      </div>

      {/* 検索 + 統計 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="メールアドレス・IDで検索..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all"
          >
            検索
          </button>
        </div>
        <div className="text-sm text-gray-500">
          全 <span className="font-bold text-gray-900">{total}</span> 件
        </div>
      </div>

      {/* 結果リスト */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
      ) : results.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <p className="text-gray-500">結果が見つかりません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {type === 'bigfive'
            ? (results as BigFiveResult[]).map((r) => (
                <BigFiveResultCard
                  key={r.id}
                  result={r}
                  generating={generating}
                  downloading={downloading}
                  onGenerateReport={handleGenerateReport}
                  onDownloadPdf={handleDownloadPdf}
                />
              ))
            : (results as FortuneResult[]).map((r) => (
                <FortuneResultCard
                  key={r.id}
                  result={r}
                  generating={generating}
                  downloading={downloading}
                  onGenerateReport={handleGenerateReport}
                  onDownloadPdf={handleDownloadPdf}
                />
              ))}
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 px-3">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ========== BigFive 結果カード ========== */
function BigFiveResultCard({
  result: r,
  generating,
  downloading,
  onGenerateReport,
  onDownloadPdf,
}: {
  result: BigFiveResult;
  generating: string | null;
  downloading: string | null;
  onGenerateReport: (id: string) => void;
  onDownloadPdf: (id: string) => void;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          {r.mbti_code && (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">{r.mbti_code}</span>
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-500 truncate">{r.user_email}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium flex-shrink-0">
                {r.test_type === 'detailed' ? '詳細版' : r.test_type === 'full' ? '本格版' : '簡易版'}
              </span>
              <StatusBadges purchased={r.pdf_purchased} hasReport={r.has_report} hasPdf={r.has_pdf} />
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <Clock className="w-3 h-3" />
              {new Date(r.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        <AdminActions
          resultId={r.id}
          type="bigfive"
          hasReport={r.has_report}
          hasPdf={r.has_pdf}
          generating={generating}
          downloading={downloading}
          onGenerateReport={onGenerateReport}
          onDownloadPdf={onDownloadPdf}
        />
      </div>

      {/* 5特性バー */}
      <div className="grid grid-cols-5 gap-2">
        {(['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const).map((key) => {
          const pct = r[key];
          return (
            <div key={key} className="text-center">
              <p className="text-xs text-gray-500 mb-1">{TRAIT_LABELS[key]}</p>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="text-xs font-semibold text-gray-700 mt-0.5">{pct}%</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ========== Fortune 結果カード ========== */
function FortuneResultCard({
  result: r,
  generating,
  downloading,
  onGenerateReport,
  onDownloadPdf,
}: {
  result: FortuneResult;
  generating: string | null;
  downloading: string | null;
  onGenerateReport: (id: string) => void;
  onDownloadPdf: (id: string) => void;
}) {
  const snapshot = r.result_snapshot;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center flex-shrink-0">
            <Star className="text-white w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-500">{r.user_email}</span>
              <span className="text-sm font-bold text-gray-900">
                {r.birth_year}年{r.birth_month}月{r.birth_day}日
              </span>
              <StatusBadges purchased={r.report_purchased} hasReport={r.has_report} hasPdf={r.has_pdf} />
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
              <Clock className="w-3 h-3" />
              {new Date(r.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>

        <AdminActions
          resultId={r.id}
          type="fortune"
          hasReport={r.has_report}
          hasPdf={r.has_pdf}
          generating={generating}
          downloading={downloading}
          onGenerateReport={onGenerateReport}
          onDownloadPdf={onDownloadPdf}
        />
      </div>

      {/* 3占術サマリー */}
      {snapshot && (
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <p className="text-xs text-blue-600 font-medium">九星気学</p>
            <p className="text-xs font-bold text-blue-900">{snapshot.nineStar?.year}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-2 text-center">
            <p className="text-xs text-purple-600 font-medium">数秘術</p>
            <p className="text-xs font-bold text-purple-900">{snapshot.numerology?.lifePath}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <p className="text-xs text-green-600 font-medium">四柱推命</p>
            <p className="text-xs font-bold text-green-900">{snapshot.fourPillars?.heavenlyStem}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========== ステータスバッジ ========== */
function StatusBadges({ purchased, hasReport, hasPdf }: { purchased: boolean; hasReport: boolean; hasPdf: boolean }) {
  return (
    <div className="flex items-center gap-1 flex-shrink-0">
      {purchased && (
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-50 text-yellow-700 font-medium flex items-center gap-0.5">
          <Crown className="w-2.5 h-2.5" />
          購入済
        </span>
      )}
      {hasReport && (
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">
          レポート済
        </span>
      )}
      {hasPdf && (
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
          PDF済
        </span>
      )}
    </div>
  );
}

/* ========== 管理者アクション ========== */
function AdminActions({
  resultId,
  type,
  hasReport,
  hasPdf,
  generating,
  downloading,
  onGenerateReport,
  onDownloadPdf,
}: {
  resultId: string;
  type: DiagnosisType;
  hasReport: boolean;
  hasPdf: boolean;
  generating: string | null;
  downloading: string | null;
  onGenerateReport: (id: string) => void;
  onDownloadPdf: (id: string) => void;
}) {
  const resultUrl = type === 'bigfive' ? `/bigfive/result/${resultId}` : `/fortune/result/${resultId}`;

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      {/* レポート生成（未生成の場合） */}
      {!hasReport && (
        <button
          onClick={() => onGenerateReport(resultId)}
          disabled={generating === resultId}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all disabled:opacity-50"
          title="AIレポートを生成"
        >
          {generating === resultId ? (
            <><Loader2 className="w-3 h-3 animate-spin" />生成中</>
          ) : (
            <><Sparkles className="w-3 h-3" />レポート生成</>
          )}
        </button>
      )}

      {/* レポート表示（生成済みの場合） */}
      {hasReport && (
        <a
          href={resultUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-all"
          title="レポートを表示"
        >
          <Eye className="w-3 h-3" />
          表示
        </a>
      )}

      {/* PDFダウンロード（レポート生成済みの場合） */}
      {hasReport && (
        <button
          onClick={() => onDownloadPdf(resultId)}
          disabled={downloading === resultId}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all disabled:opacity-50"
          title="PDFをダウンロード"
        >
          {downloading === resultId ? (
            <><Loader2 className="w-3 h-3 animate-spin" />生成中</>
          ) : (
            <><Download className="w-3 h-3" />PDF</>
          )}
        </button>
      )}

      {/* 詳細ページ */}
      <a
        href={resultUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
        title="結果ページを開く"
      >
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
}
