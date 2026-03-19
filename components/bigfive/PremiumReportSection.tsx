'use client';

import { useState, useCallback, useEffect } from 'react';
import { FileText, Brain, Target, Sparkles, Loader2, ExternalLink, Crown, Printer } from 'lucide-react';
import ChatInterface from './ChatInterface';

interface PremiumReportSectionProps {
  resultId: string;
  isPurchased: boolean;
  existingReportHtml?: string | null;
  onPurchaseStart?: () => void;
  testType?: 'simple' | 'full' | 'detailed';
  isAdmin?: boolean;
}

const PRICE_MAP: Record<string, { price: number; label: string }> = {
  simple: { price: 500, label: '¥500' },
  full: { price: 1000, label: '¥1,000' },
  detailed: { price: 2000, label: '¥2,000' },
};

const FEATURES = [
  {
    icon: FileText,
    title: '専門レポート',
    desc: '15ページ以上の詳細な性格分析',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    icon: Brain,
    title: 'パーソナリティマップ',
    desc: '5特性+30ファセットの可視化',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
  },
  {
    icon: Target,
    title: '実用ガイダンス',
    desc: 'キャリア・人間関係の行動指針',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
  },
  {
    icon: Sparkles,
    title: 'AIアシスタント',
    desc: 'あなた専用の自己探求メンター',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
  },
];

export default function PremiumReportSection({
  resultId,
  isPurchased,
  existingReportHtml,
  onPurchaseStart,
  testType = 'simple',
  isAdmin = false,
}: PremiumReportSectionProps) {
  const priceInfo = PRICE_MAP[testType] || PRICE_MAP.simple;
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
        // URLからパラメータを除去
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
      const res = await fetch('/api/bigfive/purchase-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultId }),
      });
      const data = await res.json();

      if (data.alreadyPurchased) {
        // 既に購入済み → レポート生成へ
        handleGenerateReport();
        return;
      }

      if (data.url) {
        onPurchaseStart?.();
        window.location.href = data.url;
      } else {
        setError(data.error || '購入処理に失敗しました');
      }
    } catch (err) {
      setError('通信エラーが発生しました');
    } finally {
      setPurchasing(false);
    }
  }, [resultId, onPurchaseStart]);

  const handleGenerateReport = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/bigfive/generate-report', {
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
    } catch (err) {
      setError('通信エラーが発生しました');
    } finally {
      setGenerating(false);
    }
  }, [resultId]);

  const handleOpenReport = useCallback(() => {
    window.open(`/bigfive/report/${resultId}`, '_blank');
  }, [resultId]);

  const handleSendEmail = useCallback(async () => {
    setEmailSending(true);
    setError(null);
    try {
      const res = await fetch('/api/bigfive/send-report-email', {
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
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl shadow-md overflow-hidden">
          {/* ヘッダー */}
          <div className="px-6 py-5 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="flex items-center gap-2 mb-1">
              <Crown className="w-5 h-5 text-yellow-300" />
              <h3 className="text-lg font-bold">プレミアムレポート</h3>
            </div>
            <p className="text-sm text-blue-100">
              AIがあなた専用の詳細な性格分析レポートを生成します
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
                <span className="text-3xl font-bold text-gray-900">{priceInfo.label}</span>
                <span className="text-sm text-gray-500 ml-1">（税込）</span>
              </div>
              <button
                onClick={handlePurchase}
                disabled={purchasing}
                className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {purchasing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    処理中...
                  </span>
                ) : (
                  'プレミアムレポートを購入する'
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
            プレミアムレポート
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            AIがあなたの診断結果を深く分析し、専門的なレポートを生成します。
            <br />生成には30秒〜1分程度かかります。
          </p>
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200"
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
      {/* レポート表示 */}
      <div className="bg-white border border-gray-300 rounded-2xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-500" />
            <h3 className="font-bold text-gray-900">プレミアムレポート</h3>
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
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 hover:text-blue-800 bg-blue-50 border border-blue-200 rounded-lg transition-all"
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

      {/* AIチャット */}
      <ChatInterface resultId={resultId} />
    </div>
  );
}
