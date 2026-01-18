'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, Link as LinkIcon, Loader2, Copy, Check, Eye } from 'lucide-react';

type AffiliateStats = {
  totalClicks: number;
  totalConversions: number;
  totalEarnings: number;
  conversionRate: number;
};

type Affiliate = {
  id: string;
  user_id: string;
  affiliate_code: string;
  commission_rate: number;
  is_active: boolean;
  created_at: string;
};

type AffiliateClick = {
  id: string;
  affiliate_id: string;
  clicked_at: string;
};

type AffiliateConversion = {
  id: string;
  affiliate_id: string;
  order_id: string;
  amount: number;
  commission: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  converted_at: string;
};

export default function AffiliateManager() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AffiliateStats>({
    totalClicks: 0,
    totalConversions: 0,
    totalEarnings: 0,
    conversionRate: 0,
  });
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [clicks, setClicks] = useState<AffiliateClick[]>([]);
  const [conversions, setConversions] = useState<AffiliateConversion[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showClickDetails, setShowClickDetails] = useState<string | null>(null);

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    setLoading(true);
    try {
      // アフィリエイト一覧を取得
      const affiliatesResponse = await fetch('/api/affiliates');
      if (affiliatesResponse.ok) {
        const affiliatesData = await affiliatesResponse.json();
        setAffiliates(affiliatesData.affiliates || []);
      }

      // クリック数を取得
      const clicksResponse = await fetch('/api/affiliates/clicks');
      if (clicksResponse.ok) {
        const clicksData = await clicksResponse.json();
        setClicks(clicksData.clicks || []);
      }

      // コンバージョンを取得
      const conversionsResponse = await fetch('/api/affiliates/conversions');
      if (conversionsResponse.ok) {
        const conversionsData = await conversionsResponse.json();
        setConversions(conversionsData.conversions || []);
      }

      // 統計を計算
      const totalClicks = clicks.length;
      const totalConversions = conversions.length;
      const totalEarnings = conversions.reduce((sum, c) => sum + (c.commission || 0), 0);
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

      setStats({
        totalClicks,
        totalConversions,
        totalEarnings,
        conversionRate,
      });
    } catch (error) {
      console.error('Failed to fetch affiliate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleUpdateCommissionRate = async (affiliateId: string, newRate: number) => {
    try {
      const response = await fetch(`/api/affiliates/${affiliateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commission_rate: newRate }),
      });
      if (response.ok) {
        await fetchAffiliateData();
      }
    } catch (error) {
      console.error('Failed to update commission rate:', error);
    }
  };

  const handleToggleActive = async (affiliateId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/affiliates/${affiliateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });
      if (response.ok) {
        await fetchAffiliateData();
      }
    } catch (error) {
      console.error('Failed to toggle active status:', error);
    }
  };

  const handleUpdateConversionStatus = async (
    conversionId: string,
    newStatus: 'pending' | 'approved' | 'rejected' | 'paid'
  ) => {
    try {
      const response = await fetch(`/api/affiliates/conversions/${conversionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) {
        await fetchAffiliateData();
      }
    } catch (error) {
      console.error('Failed to update conversion status:', error);
    }
  };

  const getAffiliateClicks = (affiliateId: string) => {
    return clicks.filter((c) => c.affiliate_id === affiliateId).length;
  };

  const getAffiliateConversions = (affiliateId: string) => {
    return conversions.filter((c) => c.affiliate_id === affiliateId);
  };

  const getAffiliateEarnings = (affiliateId: string) => {
    return getAffiliateConversions(affiliateId).reduce((sum, c) => sum + (c.commission || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">アフィリエイト管理</h2>
        <p className="text-sm text-gray-500">
          アフィリエイター数: <span className="font-bold">{affiliates.length}</span>
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users size={20} />
            <span className="text-sm font-medium opacity-90">総クリック数</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalClicks}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} />
            <span className="text-sm font-medium opacity-90">総コンバージョン</span>
          </div>
          <p className="text-3xl font-bold">{stats.totalConversions}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={20} />
            <span className="text-sm font-medium opacity-90">総報酬額</span>
          </div>
          <p className="text-3xl font-bold">¥{stats.totalEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} />
            <span className="text-sm font-medium opacity-90">コンバージョン率</span>
          </div>
          <p className="text-3xl font-bold">{stats.conversionRate.toFixed(2)}%</p>
        </div>
      </div>

      {/* アフィリエイター一覧 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">アフィリエイター一覧</h3>
        </div>
        {affiliates.length === 0 ? (
          <div className="p-12 text-center">
            <LinkIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">アフィリエイターがいません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {affiliates.map((affiliate) => {
              const affiliateClicks = getAffiliateClicks(affiliate.id);
              const affiliateConversions = getAffiliateConversions(affiliate.id);
              const affiliateEarnings = getAffiliateEarnings(affiliate.id);
              const affiliateConversionRate =
                affiliateClicks > 0 ? (affiliateConversions.length / affiliateClicks) * 100 : 0;

              return (
                <div key={affiliate.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-gray-900">{affiliate.affiliate_code}</span>
                        <button
                          onClick={() => handleCopyCode(affiliate.affiliate_code)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="コピー"
                        >
                          {copiedCode === affiliate.affiliate_code ? (
                            <Check size={14} className="text-green-600" />
                          ) : (
                            <Copy size={14} className="text-gray-500" />
                          )}
                        </button>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-bold ${
                            affiliate.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {affiliate.is_active ? '有効' : '無効'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>クリック: {affiliateClicks}</span>
                        <span>成約: {affiliateConversions.length}</span>
                        <span>報酬: ¥{affiliateEarnings.toLocaleString()}</span>
                        <span>率: {affiliateConversionRate.toFixed(2)}%</span>
                        <span>手数料: {affiliate.commission_rate}%</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(affiliate.id, affiliate.is_active)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          affiliate.is_active
                            ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            : 'bg-green-100 hover:bg-green-200 text-green-700'
                        }`}
                      >
                        {affiliate.is_active ? '無効化' : '有効化'}
                      </button>
                      <button
                        onClick={() =>
                          setShowClickDetails(showClickDetails === affiliate.id ? null : affiliate.id)
                        }
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                        title="詳細"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>

                  {/* クリック詳細 */}
                  {showClickDetails === affiliate.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <h4 className="font-bold text-sm text-gray-900 mb-2">コンバージョン詳細</h4>
                      {affiliateConversions.length === 0 ? (
                        <p className="text-sm text-gray-500">コンバージョンがありません</p>
                      ) : (
                        <div className="space-y-2">
                          {affiliateConversions.map((conversion) => (
                            <div
                              key={conversion.id}
                              className="flex items-center justify-between text-sm bg-white p-2 rounded border border-gray-200"
                            >
                              <div>
                                <span className="font-medium text-gray-900">
                                  ¥{conversion.amount.toLocaleString()}
                                </span>
                                <span className="text-gray-500 ml-2">
                                  (報酬: ¥{conversion.commission.toLocaleString()})
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full font-bold ${
                                    conversion.status === 'approved'
                                      ? 'bg-green-100 text-green-700'
                                      : conversion.status === 'paid'
                                      ? 'bg-blue-100 text-blue-700'
                                      : conversion.status === 'rejected'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}
                                >
                                  {conversion.status === 'approved'
                                    ? '承認済み'
                                    : conversion.status === 'paid'
                                    ? '支払済み'
                                    : conversion.status === 'rejected'
                                    ? '却下'
                                    : '保留中'}
                                </span>
                                {conversion.status === 'pending' && (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleUpdateConversionStatus(conversion.id, 'approved')}
                                      className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs"
                                    >
                                      承認
                                    </button>
                                    <button
                                      onClick={() => handleUpdateConversionStatus(conversion.id, 'rejected')}
                                      className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs"
                                    >
                                      却下
                                    </button>
                                  </div>
                                )}
                                {conversion.status === 'approved' && (
                                  <button
                                    onClick={() => handleUpdateConversionStatus(conversion.id, 'paid')}
                                    className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs"
                                  >
                                    支払済み
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
