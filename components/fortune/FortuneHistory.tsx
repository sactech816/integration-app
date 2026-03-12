'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, Download, ExternalLink, Loader2, Share2, Crown, Clock, Sparkles } from 'lucide-react';
import { STAR_INFO } from '@/lib/fortune';
import type { NineStar } from '@/lib/fortune/nine-star';

interface FortuneHistoryResult {
  id: string;
  birth_year: number;
  birth_month: number;
  birth_day: number;
  result_snapshot: {
    nineStar: { year: string; month: string };
    numerology: { lifePath: string };
    fourPillars: { heavenlyStem: string; sexagenaryCycle: number };
  };
  is_public: boolean;
  report_purchased: boolean;
  created_at: string;
}

// ライフパスキーから数字を抽出
function getLifePathNumber(key: string): string {
  const match = key.match(/lp_(\d+)/);
  return match ? match[1] : key;
}

// 天干キーから名前を取得
const STEM_NAMES: Record<string, string> = {
  stem_1: '甲（きのえ）',
  stem_2: '乙（きのと）',
  stem_3: '丙（ひのえ）',
  stem_4: '丁（ひのと）',
  stem_5: '戊（つちのえ）',
  stem_6: '己（つちのと）',
  stem_7: '庚（かのえ）',
  stem_8: '辛（かのと）',
  stem_9: '壬（みずのえ）',
  stem_10: '癸（みずのと）',
};

export default function FortuneHistory() {
  const [results, setResults] = useState<FortuneHistoryResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/fortune/history?limit=50');
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (err) {
      console.error('Failed to fetch fortune history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = useCallback(async (resultId: string) => {
    setDownloading(resultId);
    try {
      const res = await fetch(`/api/fortune/download-pdf?id=${resultId}`);
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
            <Star className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">生年月日占い</h2>
            <p className="text-sm text-gray-500">鑑定履歴とレポート管理</p>
          </div>
        </div>
        <a
          href="/fortune"
          className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all text-sm"
        >
          新しい鑑定をする
        </a>
      </div>

      {/* 結果リスト */}
      {results.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">まだ鑑定結果がありません</p>
          <a
            href="/fortune"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-600 transition-all text-sm"
          >
            <Sparkles className="w-4 h-4" />
            占いを始める
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((r) => {
            const snapshot = r.result_snapshot;
            const starInfo = STAR_INFO[snapshot.nineStar.year as NineStar];
            const starName = starInfo?.name || snapshot.nineStar.year;
            const lpNumber = getLifePathNumber(snapshot.numerology.lifePath);
            const stemName = STEM_NAMES[snapshot.fourPillars.heavenlyStem] || snapshot.fourPillars.heavenlyStem;

            return (
              <div key={r.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <Star className="text-white w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          {r.birth_year}年{r.birth_month}月{r.birth_day}日
                        </span>
                        {r.report_purchased && (
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
                    {r.report_purchased && (
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
                      href={`/fortune/result/${r.id}`}
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
                          navigator.clipboard.writeText(`${window.location.origin}/fortune/result/${r.id}`);
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* 3占術のミニサマリー */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-blue-600 mb-1 font-medium">九星気学</p>
                    <p className="text-sm font-bold text-blue-900">{starName}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-purple-600 mb-1 font-medium">数秘術</p>
                    <p className="text-sm font-bold text-purple-900">ライフパス {lpNumber}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2.5 text-center">
                    <p className="text-xs text-green-600 mb-1 font-medium">四柱推命</p>
                    <p className="text-sm font-bold text-green-900">{stemName.split('（')[0]}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
