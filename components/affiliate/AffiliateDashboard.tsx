'use client';

import React, { useState, useEffect } from 'react';
import {
  Share2,
  Copy,
  Check,
  TrendingUp,
  MousePointer,
  Users,
  DollarSign,
  Calendar,
  Loader2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Gift,
} from 'lucide-react';
import {
  getAffiliateInfo,
  getAffiliateStats,
  getAffiliateConversions,
  registerAffiliate,
  AffiliateInfo,
  AffiliateStats,
  AffiliateConversion,
} from '@/app/actions/affiliate';

type Props = {
  userId: string;
  userEmail?: string;
};

const SERVICE_LABELS: Record<string, string> = {
  kdl: 'Kindle執筆',
  quiz: '診断クイズ',
  profile: 'プロフィールLP',
  business: 'ビジネスLP',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: '保留中', color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: '確定', color: 'bg-green-100 text-green-700' },
  paid: { label: '支払済', color: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'キャンセル', color: 'bg-gray-100 text-gray-500' },
};

export default function AffiliateDashboard({ userId, userEmail }: Props) {
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [affiliateInfo, setAffiliateInfo] = useState<AffiliateInfo | null>(null);
  const [stats, setStats] = useState<AffiliateStats | null>(null);
  const [conversions, setConversions] = useState<AffiliateConversion[]>([]);
  const [copied, setCopied] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://makers.tokyo';

  useEffect(() => {
    loadAffiliateData();
  }, [userId]);

  const loadAffiliateData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // アフィリエイト情報を取得
      const infoResult = await getAffiliateInfo(userId);
      if (infoResult.success && infoResult.data) {
        setAffiliateInfo(infoResult.data);

        // 統計を取得
        const statsResult = await getAffiliateStats(userId);
        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data);
        }

        // 成果履歴を取得
        const conversionsResult = await getAffiliateConversions(userId);
        if (conversionsResult.success && conversionsResult.data) {
          setConversions(conversionsResult.data);
        }
      }
    } catch (err: any) {
      console.error('Load affiliate data error:', err);
      setError('データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsRegistering(true);
    setError(null);
    try {
      const result = await registerAffiliate(userId);
      if (result.success && result.data) {
        setAffiliateInfo(result.data);
        // 統計も初期化
        setStats({
          affiliate_id: result.data.id,
          referral_code: result.data.referral_code,
          total_clicks: 0,
          total_conversions: 0,
          total_earnings: 0,
          unpaid_earnings: 0,
          this_month_clicks: 0,
          this_month_conversions: 0,
          this_month_earnings: 0,
        });
      } else {
        setError(result.error || '登録に失敗しました');
      }
    } catch (err: any) {
      console.error('Register affiliate error:', err);
      setError('登録に失敗しました');
    } finally {
      setIsRegistering(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralLink = affiliateInfo
    ? `${baseUrl}/kindle/lp?ref=${affiliateInfo.referral_code}`
    : '';

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl shadow-sm border border-emerald-200">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="animate-spin text-emerald-500" size={24} />
        </div>
      </div>
    );
  }

  // 未登録の場合
  if (!affiliateInfo) {
    return (
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl shadow-sm border border-emerald-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-emerald-100 p-2.5 rounded-full">
            <Share2 size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">アフィリエイトプログラム</p>
            <p className="text-xs text-gray-500">紹介で報酬を獲得</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600 leading-relaxed">
            友人や知人にサービスを紹介して、成約ごとに報酬を獲得できます。
            紹介リンクを共有するだけで簡単に始められます。
          </p>

          <div className="bg-white/60 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Gift size={14} className="text-emerald-500" />
              <span className="text-gray-700">報酬率: <span className="font-bold text-emerald-600">10%</span></span>
            </div>
            <p className="text-xs text-gray-500">
              例: ¥4,980のプランが成約 → ¥498の報酬
            </p>
          </div>

          {error && (
            <p className="text-red-500 text-xs">{error}</p>
          )}

          <button
            onClick={handleRegister}
            disabled={isRegistering}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          >
            {isRegistering ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                登録中...
              </>
            ) : (
              <>
                <Share2 size={16} />
                アフィリエイトを始める
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // 登録済みの場合
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl shadow-sm border border-emerald-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-emerald-100 p-2.5 rounded-full">
          <Share2 size={20} className="text-emerald-600" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">アフィリエイト</p>
          <p className="text-xs text-gray-500">報酬率 {affiliateInfo.commission_rate}%</p>
        </div>
      </div>

      {/* 紹介リンク */}
      <div className="mb-4">
        <label className="text-xs text-gray-500 mb-1 block">あなたの紹介リンク</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 bg-white border border-emerald-200 rounded-lg px-3 py-2 text-xs font-mono text-gray-700 truncate"
          />
          <button
            onClick={() => copyToClipboard(referralLink)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-1"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* 統計サマリー */}
      {stats && (
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
              <MousePointer size={12} />
              <span className="text-xs">クリック</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{stats.this_month_clicks}</p>
            <p className="text-xs text-gray-400">今月</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
              <Users size={12} />
              <span className="text-xs">成約</span>
            </div>
            <p className="text-lg font-bold text-emerald-600">{stats.this_month_conversions}</p>
            <p className="text-xs text-gray-400">今月</p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
              <TrendingUp size={12} />
              <span className="text-xs">今月報酬</span>
            </div>
            <p className="text-lg font-bold text-emerald-600">
              ¥{stats.this_month_earnings.toLocaleString()}
            </p>
          </div>
          <div className="bg-white/60 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-gray-500 mb-1">
              <DollarSign size={12} />
              <span className="text-xs">未払い</span>
            </div>
            <p className="text-lg font-bold text-orange-500">
              ¥{stats.unpaid_earnings.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* 累計 */}
      {stats && (
        <div className="bg-white/40 rounded-lg p-3 mb-4">
          <div className="flex justify-between text-xs text-gray-600">
            <span>累計クリック: <span className="font-bold">{stats.total_clicks}</span></span>
            <span>累計成約: <span className="font-bold">{stats.total_conversions}</span></span>
            <span>累計報酬: <span className="font-bold text-emerald-600">¥{stats.total_earnings.toLocaleString()}</span></span>
          </div>
        </div>
      )}

      {/* 成果履歴トグル */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 transition-colors"
      >
        <span className="flex items-center gap-1">
          <Calendar size={14} />
          成果履歴
        </span>
        {showHistory ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {/* 成果履歴 */}
      {showHistory && (
        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
          {conversions.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-4">まだ成果がありません</p>
          ) : (
            conversions.map((conv) => (
              <div
                key={conv.id}
                className="bg-white/60 rounded-lg p-2 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs font-medium text-gray-700">
                    {SERVICE_LABELS[conv.service_type] || conv.service_type}
                    <span className="text-gray-400 ml-1">
                      ({conv.plan_tier} / {conv.plan_period === 'yearly' ? '年額' : '月額'})
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(conv.converted_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-emerald-600">
                    ¥{conv.commission_amount.toLocaleString()}
                  </p>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${STATUS_LABELS[conv.status]?.color || 'bg-gray-100'}`}>
                    {STATUS_LABELS[conv.status]?.label || conv.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

