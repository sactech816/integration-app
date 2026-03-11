'use client';

import { useState, useEffect, useCallback } from 'react';
import { Brain, Download, ExternalLink, Loader2, Share2, Crown, Clock, Sparkles } from 'lucide-react';

interface BigFiveHistoryResult {
  id: string;
  test_type: 'simple' | 'full';
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
  mbti_code: string | null;
  is_public: boolean;
  pdf_purchased: boolean;
  pdf_storage_path: string | null;
  created_at: string;
}

const TRAIT_LABELS: Record<string, { label: string; emoji: string }> = {
  openness: { label: '開放性', emoji: '🎨' },
  conscientiousness: { label: '誠実性', emoji: '🎯' },
  extraversion: { label: '外向性', emoji: '🌟' },
  agreeableness: { label: '協調性', emoji: '🤝' },
  neuroticism: { label: '情緒安定性', emoji: '🧘' },
};

export default function BigFiveHistory() {
  const [results, setResults] = useState<BigFiveHistoryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/bigfive/history?limit=50');
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (err) {
      console.error('Failed to fetch bigfive history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = useCallback(async (resultId: string) => {
    setDownloading(resultId);
    try {
      const res = await fetch(`/api/bigfive/download-pdf?id=${resultId}`);
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
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Big Five 性格診断</h2>
            <p className="text-sm text-gray-500">診断履歴とレポート管理</p>
          </div>
        </div>
        <a
          href="/bigfive"
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
        >
          新しい診断を受ける
        </a>
      </div>

      {/* 結果リスト */}
      {results.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <Brain className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">まだ診断結果がありません</p>
          <a
            href="/bigfive"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-600 transition-all text-sm"
          >
            <Sparkles className="w-4 h-4" />
            診断を受ける
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((r) => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {r.mbti_code && (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-bold text-xs">{r.mbti_code}</span>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      {r.mbti_code && <span className="font-bold text-gray-900">{r.mbti_code}</span>}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
                        {r.test_type === 'full' ? '本格版（50問）' : '簡易版（10問）'}
                      </span>
                      {r.pdf_purchased && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 font-medium flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          プレミアム
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(r.created_at).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {r.pdf_purchased && (
                    <button
                      onClick={() => handleDownloadPdf(r.id)}
                      disabled={downloading === r.id}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all disabled:opacity-50"
                    >
                      {downloading === r.id ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" />生成中</>
                      ) : (
                        <><Download className="w-3.5 h-3.5" />PDF</>
                      )}
                    </button>
                  )}
                  <a
                    href={`/bigfive/result/${r.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    詳細
                  </a>
                  {r.is_public && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/bigfive/result/${r.id}`);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* 5特性のミニバー */}
              <div className="grid grid-cols-5 gap-2">
                {(['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const).map((key) => {
                  const pct = r[key];
                  const { label, emoji } = TRAIT_LABELS[key];
                  return (
                    <div key={key} className="text-center">
                      <p className="text-xs text-gray-500 mb-1">{emoji} {label}</p>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
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
          ))}
        </div>
      )}
    </div>
  );
}
