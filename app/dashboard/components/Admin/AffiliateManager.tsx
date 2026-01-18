'use client';

import React, { useState, useEffect } from 'react';
import { Share2, Users, TrendingUp, Copy, Check, Loader2 } from 'lucide-react';

type AffiliateData = {
  tableExists: boolean;
  stats: {
    totalAffiliates: number;
    activeAffiliates: number;
    thisMonthClicks: number;
    thisMonthConversions: number;
    thisMonthEarnings: number;
    pendingPayouts: number;
  };
  affiliates: Array<{
    id: string;
    email: string;
    referral_code: string;
    status: string;
    commission_rate: number;
    total_clicks: number;
    total_conversions: number;
    total_earnings: number;
    unpaid_earnings: number;
  }>;
  conversions: Array<{
    id: string;
    affiliate_code: string;
    service_label: string;
    plan_tier: string;
    plan_period: string;
    plan_amount: number;
    commission_amount: number;
    status: string;
    status_label: string;
    converted_at: string;
  }>;
};

export default function AffiliateManager() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AffiliateData | null>(null);
  const [affiliateStatusFilter, setAffiliateStatusFilter] = useState<string>('all');
  const [conversionStatusFilter, setConversionStatusFilter] = useState<string>('all');
  const [updatingAffiliateId, setUpdatingAffiliateId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/affiliates', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Affiliate data fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCommissionRate = async (affiliateId: string, newRate: number) => {
    if (newRate < 0 || newRate > 100) return;
    setUpdatingAffiliateId(affiliateId);
    try {
      const response = await fetch('/api/admin/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_commission',
          affiliateId,
          commissionRate: newRate,
        }),
      });
      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Commission update error:', error);
    } finally {
      setUpdatingAffiliateId(null);
    }
  };

  const handleUpdateConversionStatus = async (conversionId: string, action: string) => {
    try {
      const response = await fetch('/api/admin/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          conversionId,
        }),
      });
      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Conversion status update error:', error);
    }
  };

  const handleCopyLink = (referralCode: string) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${baseUrl}/kindle/lp?ref=${referralCode}`;
    navigator.clipboard.writeText(link);
    setCopiedCode(referralCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-emerald-600" size={32} />
      </div>
    );
  }

  if (!data?.tableExists) {
    return (
      <div className="text-center py-12">
        <Share2 size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 mb-2">アフィリエイト機能が設定されていません</p>
        <p className="text-xs text-gray-400">supabase_affiliate_setup.sql を実行してテーブルを作成してください</p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
  };

  const conversionStatusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    paid: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="space-y-6">
      {/* 統計サマリー */}
      {data.stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-black text-emerald-600">{data.stats.totalAffiliates}</div>
            <div className="text-xs text-gray-500 font-bold">総アフィリエイター</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-black text-green-600">{data.stats.activeAffiliates}</div>
            <div className="text-xs text-gray-500 font-bold">アクティブ</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-black text-blue-600">{data.stats.thisMonthClicks}</div>
            <div className="text-xs text-gray-500 font-bold">今月クリック</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-black text-purple-600">{data.stats.thisMonthConversions}</div>
            <div className="text-xs text-gray-500 font-bold">今月成約</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-black text-amber-600">¥{data.stats.thisMonthEarnings.toLocaleString()}</div>
            <div className="text-xs text-gray-500 font-bold">今月報酬</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-2xl font-black text-red-600">¥{data.stats.pendingPayouts.toLocaleString()}</div>
            <div className="text-xs text-gray-500 font-bold">未払い報酬</div>
          </div>
        </div>
      )}

      {/* アフィリエイター一覧 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Users size={18} className="text-emerald-600" />
            アフィリエイター一覧
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold ml-2">
              {data.affiliates.length}名
            </span>
          </h3>
          <div className="flex gap-2">
            {['all', 'active', 'suspended', 'pending'].map((status) => (
              <button
                key={status}
                onClick={() => setAffiliateStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  affiliateStatusFilter === status
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? '全て' : status === 'active' ? 'アクティブ' : status === 'suspended' ? '停止中' : '保留'}
              </button>
            ))}
          </div>
        </div>
        {data.affiliates.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            まだアフィリエイターがいません
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left bg-gray-50 font-bold text-gray-900">メール</th>
                  <th className="px-4 py-3 text-center bg-gray-50 font-bold text-gray-900">紹介コード</th>
                  <th className="px-4 py-3 text-center bg-gray-50 font-bold text-gray-900">ステータス</th>
                  <th className="px-4 py-3 text-center bg-gray-50 font-bold text-gray-900">報酬率</th>
                  <th className="px-4 py-3 text-right bg-gray-50 font-bold text-gray-900">クリック</th>
                  <th className="px-4 py-3 text-right bg-gray-50 font-bold text-gray-900">成約</th>
                  <th className="px-4 py-3 text-right bg-gray-50 font-bold text-gray-900">総報酬</th>
                  <th className="px-4 py-3 text-right bg-gray-50 font-bold text-gray-900">未払い</th>
                </tr>
              </thead>
              <tbody>
                {data.affiliates
                  .filter(aff => affiliateStatusFilter === 'all' || aff.status === affiliateStatusFilter)
                  .map((aff) => (
                    <tr key={aff.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900 font-medium">{aff.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col items-center gap-1">
                          <code className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded text-sm font-bold text-emerald-700">
                            {aff.referral_code}
                          </code>
                          <button
                            onClick={() => handleCopyLink(aff.referral_code)}
                            className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors"
                          >
                            {copiedCode === aff.referral_code ? (
                              <>
                                <Check size={12} />
                                <span>コピー済み</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>リンクをコピー</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${statusColors[aff.status] || 'bg-gray-100 text-gray-700'}`}>
                          {aff.status === 'active' ? 'アクティブ' : aff.status === 'suspended' ? '停止中' : '保留'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            defaultValue={aff.commission_rate}
                            min="0"
                            max="100"
                            step="0.5"
                            className="w-16 border border-gray-300 rounded px-2 py-1 text-xs text-center text-gray-900 bg-white"
                            onBlur={(e) => {
                              const newRate = parseFloat(e.target.value);
                              if (newRate !== aff.commission_rate) {
                                handleUpdateCommissionRate(aff.id, newRate);
                              }
                            }}
                            disabled={updatingAffiliateId === aff.id}
                          />
                          <span className="text-xs text-gray-500">%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-blue-600 font-bold">
                        {aff.total_clicks || 0}
                      </td>
                      <td className="px-4 py-3 text-right text-purple-600 font-bold">
                        {aff.total_conversions || 0}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-bold">
                        ¥{(aff.total_earnings || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-orange-600 font-bold">
                        ¥{(aff.unpaid_earnings || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 成果（コンバージョン）一覧 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-600" />
            成果一覧
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold ml-2">
              {data.conversions.length}件
            </span>
          </h3>
          <div className="flex gap-2">
            {['all', 'pending', 'confirmed', 'paid', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setConversionStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                  conversionStatusFilter === status
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? '全て' : status === 'pending' ? '保留中' : status === 'confirmed' ? '確定' : status === 'paid' ? '支払済' : 'キャンセル'}
              </button>
            ))}
          </div>
        </div>
        {data.conversions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            まだ成果がありません
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left bg-gray-50 font-bold text-gray-900">日時</th>
                  <th className="px-4 py-3 text-center bg-gray-50 font-bold text-gray-900">紹介者</th>
                  <th className="px-4 py-3 text-center bg-gray-50 font-bold text-gray-900">サービス</th>
                  <th className="px-4 py-3 text-center bg-gray-50 font-bold text-gray-900">プラン</th>
                  <th className="px-4 py-3 text-right bg-gray-50 font-bold text-gray-900">金額</th>
                  <th className="px-4 py-3 text-right bg-gray-50 font-bold text-gray-900">報酬</th>
                  <th className="px-4 py-3 text-center bg-gray-50 font-bold text-gray-900">ステータス</th>
                  <th className="px-4 py-3 text-center bg-gray-50 font-bold text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody>
                {data.conversions
                  .filter(conv => conversionStatusFilter === 'all' || conv.status === conversionStatusFilter)
                  .map((conv) => (
                    <tr key={conv.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 text-xs">
                        {new Date(conv.converted_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <code className="bg-gray-100 px-2 py-1 rounded text-xs">{conv.affiliate_code}</code>
                      </td>
                      <td className="px-4 py-3 text-center text-xs font-medium">
                        {conv.service_label}
                      </td>
                      <td className="px-4 py-3 text-center text-xs">
                        {conv.plan_tier} / {conv.plan_period === 'yearly' ? '年額' : '月額'}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        ¥{(conv.plan_amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">
                        ¥{(conv.commission_amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${conversionStatusColors[conv.status] || 'bg-gray-100 text-gray-700'}`}>
                          {conv.status_label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex gap-1 justify-center">
                          {conv.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateConversionStatus(conv.id, 'confirm_conversion')}
                                className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                              >
                                確定
                              </button>
                              <button
                                onClick={() => handleUpdateConversionStatus(conv.id, 'cancel_conversion')}
                                className="px-2 py-1 bg-gray-400 text-white rounded text-xs hover:bg-gray-500"
                              >
                                取消
                              </button>
                            </>
                          )}
                          {conv.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateConversionStatus(conv.id, 'mark_as_paid')}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                            >
                              支払済みにする
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
