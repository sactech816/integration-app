'use client';

import { useState, useCallback, useEffect } from 'react';
import { FileText, Star, Compass, Sparkles, Loader2, ExternalLink, Crown, Printer, Heart } from 'lucide-react';

interface FortunePremiumReportProps {
  resultId: string;
  isPurchased: boolean;
  existingReportHtml?: string | null;
  onPurchaseStart?: () => void;
  isAdmin?: boolean;
}

const FEATURES = [
  {
    icon: FileText,
    title: '総合鑑定書',
    desc: '3占術を統合した詳細レポート',
    color: 'text-indigo-600',
    bg: 'bg-indigo-50',
  },
  {
    icon: Heart,
    title: '相性分析',
    desc: '相性の良いタイプ・注意点',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
  },
  {
    icon: Compass,
    title: '開運アドバイス',
    desc: 'ラッキーカラー・方位・アイテム',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Star,
    title: '人生指南',
    desc: '仕事・健康・財運・対人運',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
];

export default function FortunePremiumReport({
  resultId,
  isPurchased,
  existingReportHtml,
  onPurchaseStart,
  isAdmin = false,
}: FortunePremiumReportProps) {
  const [reportHtml, setReportHtml] = useState<string | null>(existingReportHtml || null);
  const [generating, setGenerating] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // payment=success パラメータ検知で自動レポート生成
  useEffect(() => {
    if (isPurchased && !reportHtml && !generating) {
      const params = new URLSearchParams(window.location.search);
      if (params.get('payment') === 'success') {
        handleGenerateReport();
        const url = new URL(window.location.href);
        url.searchParams.delete('payment');
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [isPurchased, reportHtml]);

  const handlePurchase = useCallback(async () => {
    setPurchasing(true);
    setError(null);
    try {
      const res = await fetch('/api/fortune/purchase-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId }),
      });
      const data = await res.json();

      if (data.alreadyPurchased) {
        handleGenerateReport();
        return;
      }

      if (data.url) {
        onPurchaseStart?.();
        window.location.href = data.url;
      } else {
        setError(data.error || '購入処理に失敗しました');
      }
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setPurchasing(false);
    }
  }, [resultId, onPurchaseStart]);

  const handleGenerateReport = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/fortune/generate-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId }),
      });
      const data = await res.json();

      if (data.html) {
        setReportHtml(data.html);
        setShowReport(true);
      } else {
        setError(data.error || 'レポート生成に失敗しました');
      }
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setGenerating(false);
    }
  }, [resultId]);

  const handleOpenReport = useCallback(() => {
    window.open(`/fortune/report/${resultId}`, '_blank');
  }, [resultId]);

  const handleSendEmail = useCallback(async () => {
    setEmailSending(true);
    setError(null);
    try {
      const res = await fetch('/api/fortune/send-report-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 5000);
      } else {
        setError(data.error || 'メール送信に失敗しました');
      }
    } catch {
      setError('通信エラーが発生しました');
    } finally {
      setEmailSending(false);
    }
  }, [resultId]);

  // === 未購入: 管理者は直接生成、一般ユーザーは購入CTA ===
  if (!isPurchased && !isAdmin) {
    return (
      <div className="mt-8">
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200 rounded-2xl shadow-md overflow-hidden">
          {/* ヘッダー */}
          <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-yellow-300" />
              <h3 className="text-lg font-bold">プレミアム鑑定レポート</h3>
            </div>
            <p className="text-sm text-indigo-100">
              AIが3つの占術を統合して、あなた専用の詳細レポートを生成します
            </p>
          </div>

          {/* 特徴グリッド */}
          <div className="p-6">
            <div className="grid grid-cols-2 gap-3 mb-6">
              {FEATURES.map((f) => (
                <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
                  <div className={`w-8 h-8 ${f.bg} rounded-lg flex items-center justify-center mb-2`}>
                    <f.icon className={`w-4 h-4 ${f.color}`} />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{f.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* 価格 + CTA */}
            <div className="text-center">
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">¥500</span>
                <span className="text-sm text-gray-500 ml-1">（税込）</span>
              </div>
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {purchasing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    処理中...
                  </span>
                ) : (
                  'プレミアム鑑定レポートを購入する'
                )}
              </button>
              <p className="text-xs text-gray-400 mt-2">Stripeによる安全な決済</p>
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center mt-3">{error}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === 購入済み・レポート未生成 ===
  if (!reportHtml) {
    return (
      <div className="mt-8">
        <div className="bg-white border border-gray-300 rounded-2xl shadow-md p-6 text-center">
          <Crown className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            プレミアム鑑定レポート
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            AIが九星気学・数秘術・四柱推命の結果を統合分析し、詳細なレポートを生成します。
            <br />生成には30秒〜1分程度かかります。
          </p>
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 transition-all duration-200"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                レポートを生成中...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                レポートを生成する
              </span>
            )}
          </button>
          {error && (
            <p className="text-sm text-red-600 mt-3">{error}</p>
          )}
        </div>
      </div>
    );
  }

  // === レポート生成済み ===
  return (
    <div className="mt-8 space-y-6">
      <div className="bg-white border border-gray-300 rounded-2xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-gray-900">プレミアム鑑定レポート</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowReport(!showReport)}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg transition-all"
            >
              {showReport ? '閉じる' : 'レポートを見る'}
            </button>
            <button
              onClick={handleOpenReport}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-indigo-700 hover:text-indigo-800 bg-indigo-50 border border-indigo-200 rounded-lg transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF保存 / </span>印刷
            </button>
          </div>
        </div>

        {emailSent && (
          <div className="mx-6 mt-3 flex items-center gap-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg">
            <ExternalLink className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700">
              レポートページのリンクをメールに送信しました。
            </p>
          </div>
        )}

        {showReport && (
          <div className="p-6 overflow-x-auto">
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: reportHtml }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
