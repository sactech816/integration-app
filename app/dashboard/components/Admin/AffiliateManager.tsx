'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, Link as LinkIcon, Loader2, Copy, Check, Eye } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type AffiliateStats = {
  totalAffiliates: number;
  activeAffiliates: number;
  thisMonthClicks: number;
  thisMonthConversions: number;
  thisMonthEarnings: number;
  pendingPayouts: number;
};

type Affiliate = {
  id: string;
  user_id: string;
  referral_code: string;
  commission_rate: number;
  status: string;
  created_at: string;
  display_name?: string;
  email?: string;
  total_clicks?: number;
  total_conversions?: number;
  total_earnings?: number;
  unpaid_earnings?: number;
};

type AffiliateConversion = {
  id: string;
  affiliate_id: string;
  subscription_id: string;
  commission_amount: number;
  status: 'pending' | 'confirmed' | 'paid' | 'cancelled';
  converted_at: string;
  plan_amount?: number;
  affiliate_email?: string;
  affiliate_code?: string;
  service_label?: string;
  status_label?: string;
};

export default function AffiliateManager() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AffiliateStats>({
    totalAffiliates: 0,
    activeAffiliates: 0,
    thisMonthClicks: 0,
    thisMonthConversions: 0,
    thisMonthEarnings: 0,
    pendingPayouts: 0,
  });
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [conversions, setConversions] = useState<AffiliateConversion[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showClickDetails, setShowClickDetails] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        console.error('認証トークンがありません');
        return;
      }

      const response = await fetch('/api/admin/affiliates', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAffiliates(data.affiliates || []);
        setConversions(data.conversions || []);
        setStats(data.stats || {
          totalAffiliates: 0,
          activeAffiliates: 0,
          thisMonthClicks: 0,
          thisMonthConversions: 0,
          thisMonthEarnings: 0,
          pendingPayouts: 0,
        });
      }
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
    setUpdatingId(affiliateId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) throw new Error('認証トークンがありません');

      const response = await fetch('/api/admin/affiliates', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_commission_rate',
          affiliateId,
          commissionRate: newRate,
        }),
      });

      if (response.ok) {
        await fetchAffiliateData();
      } else {
        alert('報酬率の更新に失敗しました');
      }
    } catch (error) {
      console.error('Update commission rate error:', error);
      alert('報酬率の更新に失敗しました');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleActive = async (affiliateId: string, currentStatus: string) => {
    setUpdatingId(affiliateId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) throw new Error('認証トークンがありません');

      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';

      const response = await fetch('/api/admin/affiliates', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'update_affiliate_status',
          affiliateId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        await fetchAffiliateData();
      } else {
        alert('ステータスの更新に失敗しました');
      }
    } catch (error) {
      console.error('Toggle active error:', error);
      alert('ステータスの更新に失敗しました');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUpdateConversionStatus = async (
    conversionId: string,
    action: 'confirm_conversion' | 'mark_paid' | 'cancel_conversion'
  ) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) throw new Error('認証トークンがありません');

      const response = await fetch('/api/admin/affiliates', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          conversionId,
        }),
      });

      if (response.ok) {
        await fetchAffiliateData();
      } else {
        alert('ステータスの更新に失敗しました');
      }
    } catch (error) {
      console.error('Update conversion status error:', error);
      alert('ステータスの更新に失敗しました');
    }
  };

  const getAffiliateConversions = (affiliateId: string) => {
    return conversions.filter((c) => c.affiliate_id === affiliateId);
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
          アフィリエイター数: <span className="font-bold">{stats.totalAffiliates}</span>
        </p>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users size={20} />
            <span className="text-sm font-medium opacity-90">今月のクリック</span>
          </div>
          <p className="text-3xl font-bold">{stats.thisMonthClicks}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} />
            <span className="text-sm font-medium opacity-90">今月のコンバージョン</span>
          </div>
          <p className="text-3xl font-bold">{stats.thisMonthConversions}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 p-4 rounded-xl text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={20} />
            <span className="text-sm font-medium opacity-90">今月の報酬額</span>
          </div>
          <p className="text-3xl font-bold">¥{stats.thisMonthEarnings.toLocaleString()}</p>
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
              const affiliateConversions = getAffiliateConversions(affiliate.id);

              return (
                <div key={affiliate.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-gray-900">
                          {affiliate.email || affiliate.display_name || affiliate.referral_code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(affiliate.referral_code)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors"
                          title="コピー"
                        >
                          {copiedCode === affiliate.referral_code ? (
                            <Check size={14} className="text-green-600" />
                          ) : (
                            <Copy size={14} className="text-gray-500" />
                          )}
                        </button>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-bold ${
                            affiliate.status === 'active'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {affiliate.status === 'active' ? '有効' : '無効'}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>クリック: {affiliate.total_clicks || 0}</span>
                        <span>成約: {affiliate.total_conversions || 0}</span>
                        <span>報酬: ¥{(affiliate.total_earnings || 0).toLocaleString()}</span>
                        <span>手数料: {affiliate.commission_rate}%</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(affiliate.id, affiliate.status)}
                        disabled={updatingId === affiliate.id}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                          affiliate.status === 'active'
                            ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                            : 'bg-green-100 hover:bg-green-200 text-green-700'
                        } disabled:opacity-50`}
                      >
                        {affiliate.status === 'active' ? '無効化' : '有効化'}
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
                                  {conversion.service_label || 'サービス'}
                                </span>
                                <span className="text-gray-500 ml-2">
                                  (報酬: ¥{conversion.commission_amount.toLocaleString()})
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full font-bold ${
                                    conversion.status === 'confirmed'
                                      ? 'bg-green-100 text-green-700'
                                      : conversion.status === 'paid'
                                      ? 'bg-blue-100 text-blue-700'
                                      : conversion.status === 'cancelled'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                  }`}
                                >
                                  {conversion.status_label || conversion.status}
                                </span>
                                {conversion.status === 'pending' && (
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleUpdateConversionStatus(conversion.id, 'confirm_conversion')}
                                      className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs"
                                    >
                                      承認
                                    </button>
                                    <button
                                      onClick={() => handleUpdateConversionStatus(conversion.id, 'cancel_conversion')}
                                      className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs"
                                    >
                                      却下
                                    </button>
                                  </div>
                                )}
                                {conversion.status === 'confirmed' && (
                                  <button
                                    onClick={() => handleUpdateConversionStatus(conversion.id, 'mark_paid')}
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
