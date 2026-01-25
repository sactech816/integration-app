'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, Users, TrendingUp, Link as LinkIcon, Loader2, Copy, Check, Eye, Filter, Settings, Globe, BookOpen, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type AffiliateManagerProps = {
  user: { id: string; email?: string } | null;
};

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
  service_type?: string;
  plan_tier?: string;
};

type ServiceSetting = {
  id: string;
  service_type: string;
  display_name: string;
  commission_rate: number;
  signup_points: number;
  enabled: boolean;
  description: string | null;
  landing_page: string | null;
};

// サービスタイプのアイコンと色
const SERVICE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bgColor: string }> = {
  main: { icon: <Globe size={14} />, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  kdl: { icon: <BookOpen size={14} />, color: 'text-amber-600', bgColor: 'bg-amber-50' },
  quiz: { icon: <Settings size={14} />, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  profile: { icon: <Users size={14} />, color: 'text-green-600', bgColor: 'bg-green-50' },
  business: { icon: <TrendingUp size={14} />, color: 'text-red-600', bgColor: 'bg-red-50' },
};

export default function AffiliateManager({ user }: AffiliateManagerProps) {
  console.log('[AffiliateManager] Component mounted, user:', user);
  
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
  const [serviceSettings, setServiceSettings] = useState<ServiceSetting[]>([]);
  const [serviceStats, setServiceStats] = useState<Record<string, { clicks: number; conversions: number; earnings: number }>>({});
  const [affiliateServiceStats, setAffiliateServiceStats] = useState<Record<string, Record<string, { clicks: number; conversions: number; earnings: number }>>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [savingSettings, setSavingSettings] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [affiliateStatusFilter, setAffiliateStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');
  const [conversionStatusFilter, setConversionStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'paid' | 'cancelled'>('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>('all');

  // セッションの準備を待つ
  useEffect(() => {
    const checkAuth = async () => {
      // userがpropsで渡されている場合は、セッションチェックをスキップ
      if (user) {
        setAuthReady(true);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setAuthReady(true);
      } else {
        // セッションがない場合、少し待ってから再試行
        setTimeout(async () => {
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession) {
            setAuthReady(true);
          } else {
            console.error('[AffiliateManager] セッションを確立できませんでした');
            setLoading(false);
          }
        }, 1000);
      }
    };
    checkAuth();
  }, [user]);

  useEffect(() => {
    if (authReady) {
      fetchAffiliateData();
    }
  }, [authReady]);

  const fetchAffiliateData = async () => {
    setLoading(true);
    try {
      console.log('[AffiliateManager] Fetching session...');
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        console.error('[AffiliateManager] 認証トークンがありません');
        return;
      }

      console.log('[AffiliateManager] Fetching affiliate data from API...');
      const response = await fetch('/api/admin/affiliates', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      console.log('[AffiliateManager] API Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[AffiliateManager] API Response data:', data);
        setAffiliates(data.affiliates || []);
        setConversions(data.conversions || []);
        setServiceSettings(data.serviceSettings || []);
        setServiceStats(data.serviceStats || {});
        setAffiliateServiceStats(data.affiliateServiceStats || {});
        setStats(data.stats || {
          totalAffiliates: 0,
          activeAffiliates: 0,
          thisMonthClicks: 0,
          thisMonthConversions: 0,
          thisMonthEarnings: 0,
          pendingPayouts: 0,
        });
      } else {
        const errorData = await response.json();
        console.error('[AffiliateManager] API Error:', errorData);
      }
    } catch (error) {
      console.error('[AffiliateManager] Failed to fetch affiliate data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyAffiliateLink = (code: string, serviceType: 'main' | 'kdl') => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://makers.tokyo';
    const landingPage = serviceType === 'kdl' ? '/kindle/lp' : '/';
    const separator = landingPage.includes('?') ? '&' : '?';
    const affiliateLink = `${baseUrl}${landingPage}${separator}ref=${code}`;
    navigator.clipboard.writeText(affiliateLink);
    setCopiedCode(`${code}-${serviceType}`);
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

  // サービス設定を更新
  const handleUpdateServiceSetting = async (serviceType: string, updates: Partial<ServiceSetting>) => {
    setSavingSettings(true);
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
          action: 'update_service_setting',
          serviceType,
          ...updates,
        }),
      });

      if (response.ok) {
        await fetchAffiliateData();
      } else {
        alert('設定の更新に失敗しました');
      }
    } catch (error) {
      console.error('Update service setting error:', error);
      alert('設定の更新に失敗しました');
    } finally {
      setSavingSettings(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  if (!authReady) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <p className="text-gray-600">認証エラー: セッションを確立できませんでした</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          再読み込み
        </button>
      </div>
    );
  }

  const filteredAffiliates = affiliateStatusFilter === 'all'
    ? affiliates
    : affiliates.filter((aff) => aff.status === affiliateStatusFilter);

  // サービスタイプとステータスでフィルタ
  const filteredConversions = conversions.filter((conv) => {
    const statusMatch = conversionStatusFilter === 'all' || conv.status === conversionStatusFilter;
    const serviceMatch = serviceTypeFilter === 'all' || conv.service_type === serviceTypeFilter;
    return statusMatch && serviceMatch;
  });

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

      {/* サービス別統計 */}
      {Object.keys(serviceStats).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-bold text-gray-900">サービス別統計（累計）</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* メインサイト */}
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <Globe size={18} className="text-blue-600" />
                  <span className="font-bold text-gray-900">メインサイト</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-500">クリック</p>
                    <p className="text-xl font-bold text-blue-600">{serviceStats.main?.clicks || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">成約</p>
                    <p className="text-xl font-bold text-purple-600">{serviceStats.main?.conversions || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">報酬</p>
                    <p className="text-xl font-bold text-emerald-600">¥{(serviceStats.main?.earnings || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              {/* Kindle */}
              <div className="border border-amber-200 rounded-lg p-4 bg-amber-50/50">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={18} className="text-amber-600" />
                  <span className="font-bold text-gray-900">Kindle執筆</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-gray-500">クリック</p>
                    <p className="text-xl font-bold text-blue-600">{serviceStats.kdl?.clicks || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">成約</p>
                    <p className="text-xl font-bold text-purple-600">{serviceStats.kdl?.conversions || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">報酬</p>
                    <p className="text-xl font-bold text-emerald-600">¥{(serviceStats.kdl?.earnings || 0).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* サービス別設定 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <Settings size={18} />
            サービス別アフィリエイト設定
          </h3>
          <p className="text-xs text-gray-500 mt-1">各サービスの報酬率と登録ポイントを設定できます</p>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceSettings.map((setting) => {
              const config = SERVICE_CONFIG[setting.service_type] || SERVICE_CONFIG.main;
              return (
                <div
                  key={setting.id}
                  className={`border rounded-lg p-4 ${setting.enabled ? 'border-gray-200' : 'border-gray-100 bg-gray-50 opacity-60'}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`${config.bgColor} ${config.color} p-1.5 rounded`}>
                        {config.icon}
                      </span>
                      <span className="font-bold text-gray-900">{setting.display_name}</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <span className="text-xs text-gray-500">有効</span>
                      <input
                        type="checkbox"
                        checked={setting.enabled}
                        onChange={(e) => handleUpdateServiceSetting(setting.service_type, { enabled: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={savingSettings}
                      />
                    </label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">報酬率</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          defaultValue={setting.commission_rate}
                          min="0"
                          max="100"
                          step="0.5"
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 bg-white"
                          onBlur={(e) => {
                            const newRate = parseFloat(e.target.value);
                            if (newRate !== setting.commission_rate) {
                              handleUpdateServiceSetting(setting.service_type, { commission_rate: newRate });
                            }
                          }}
                          disabled={savingSettings || !setting.enabled}
                        />
                        <span className="text-sm text-gray-500">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">登録ポイント</label>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          defaultValue={setting.signup_points}
                          min="0"
                          step="100"
                          className="w-full border border-gray-300 rounded px-2 py-1.5 text-sm text-gray-900 bg-white"
                          onBlur={(e) => {
                            const newPoints = parseInt(e.target.value);
                            if (newPoints !== setting.signup_points) {
                              handleUpdateServiceSetting(setting.service_type, { signup_points: newPoints });
                            }
                          }}
                          disabled={savingSettings || !setting.enabled}
                        />
                        <span className="text-sm text-gray-500">pt</span>
                      </div>
                    </div>
                  </div>
                  
                  {setting.description && (
                    <p className="text-xs text-gray-400 mt-2">{setting.description}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* アフィリエイター一覧 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">アフィリエイター一覧</h3>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-500" />
            <select
              value={affiliateStatusFilter}
              onChange={(e) => setAffiliateStatusFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 bg-white"
            >
              <option value="all">全て</option>
              <option value="active">アクティブ</option>
              <option value="suspended">停止中</option>
            </select>
          </div>
        </div>
        {filteredAffiliates.length === 0 ? (
          <div className="p-12 text-center">
            <LinkIcon size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">アフィリエイターがいません</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left bg-gray-50 font-bold text-gray-900">メールアドレス</th>
                  <th className="px-4 py-3 text-center bg-gray-50 font-bold text-gray-900">紹介リンク</th>
                  <th className="px-4 py-3 text-center bg-gray-50 font-bold text-gray-900">ステータス</th>
                  <th className="px-4 py-3 text-center bg-gray-50 font-bold text-gray-900">サービス</th>
                  <th className="px-4 py-3 text-right bg-gray-50 font-bold text-gray-900">クリック</th>
                  <th className="px-4 py-3 text-right bg-gray-50 font-bold text-gray-900">成約</th>
                  <th className="px-4 py-3 text-right bg-gray-50 font-bold text-gray-900">報酬</th>
                </tr>
              </thead>
              <tbody>
                {filteredAffiliates.map((aff) => {
                  const statusColors: Record<string, string> = {
                    active: 'bg-green-100 text-green-700',
                    suspended: 'bg-red-100 text-red-700',
                    pending: 'bg-yellow-100 text-yellow-700',
                  };
                  const affStats = affiliateServiceStats[aff.id] || {};
                  const mainStats = affStats.main || { clicks: 0, conversions: 0, earnings: 0 };
                  const kdlStats = affStats.kdl || { clicks: 0, conversions: 0, earnings: 0 };
                  
                  return (
                    <React.Fragment key={aff.id}>
                      {/* メインサイト行 */}
                      <tr className="border-b border-gray-100 hover:bg-gray-50">
                        <td rowSpan={2} className="px-4 py-3 text-gray-900 font-medium align-top border-r border-gray-100">
                          {aff.email}
                        </td>
                        <td rowSpan={2} className="px-4 py-3 align-top border-r border-gray-100">
                          <div className="flex flex-col items-center gap-2">
                            <code className="bg-emerald-50 border border-emerald-200 px-3 py-1 rounded text-sm font-bold text-emerald-700">
                              {aff.referral_code}
                            </code>
                            {/* メインサイト用リンク */}
                            <button
                              onClick={() => handleCopyAffiliateLink(aff.referral_code, 'main')}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 transition-colors bg-blue-50 px-2 py-1 rounded"
                            >
                              <Globe size={10} />
                              {copiedCode === `${aff.referral_code}-main` ? (
                                <>
                                  <Check size={10} />
                                  <span>コピー済み</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={10} />
                                  <span>メイン</span>
                                </>
                              )}
                            </button>
                            {/* Kindle用リンク */}
                            <button
                              onClick={() => handleCopyAffiliateLink(aff.referral_code, 'kdl')}
                              className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 transition-colors bg-amber-50 px-2 py-1 rounded"
                            >
                              <BookOpen size={10} />
                              {copiedCode === `${aff.referral_code}-kdl` ? (
                                <>
                                  <Check size={10} />
                                  <span>コピー済み</span>
                                </>
                              ) : (
                                <>
                                  <Copy size={10} />
                                  <span>Kindle</span>
                                </>
                              )}
                            </button>
                          </div>
                        </td>
                        <td rowSpan={2} className="px-4 py-3 text-center align-top border-r border-gray-100">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              statusColors[aff.status] || 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {aff.status === 'active' ? 'アクティブ' : aff.status === 'suspended' ? '停止中' : '保留'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            <Globe size={10} />
                            メイン
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right text-blue-600 font-bold">{mainStats.clicks}</td>
                        <td className="px-4 py-2 text-right text-purple-600 font-bold">{mainStats.conversions}</td>
                        <td className="px-4 py-2 text-right text-emerald-600 font-bold">
                          ¥{mainStats.earnings.toLocaleString()}
                        </td>
                      </tr>
                      {/* Kindle行 */}
                      <tr className="border-b border-gray-200 hover:bg-gray-50 bg-amber-50/30">
                        <td className="px-4 py-2 text-center">
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                            <BookOpen size={10} />
                            Kindle
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right text-blue-600 font-bold">{kdlStats.clicks}</td>
                        <td className="px-4 py-2 text-right text-purple-600 font-bold">{kdlStats.conversions}</td>
                        <td className="px-4 py-2 text-right text-emerald-600 font-bold">
                          ¥{kdlStats.earnings.toLocaleString()}
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* コンバージョン一覧 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold text-gray-900">成果（コンバージョン）一覧</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={16} className="text-gray-500" />
            {/* サービスタイプフィルター */}
            <select
              value={serviceTypeFilter}
              onChange={(e) => setServiceTypeFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 bg-white"
            >
              <option value="all">全サービス</option>
              <option value="main">メインサイト</option>
              <option value="kdl">Kindle執筆</option>
              <option value="quiz">診断クイズ</option>
              <option value="profile">プロフィールLP</option>
              <option value="business">ビジネスLP</option>
            </select>
            {/* ステータスフィルター */}
            <select
              value={conversionStatusFilter}
              onChange={(e) => setConversionStatusFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 text-gray-900 bg-white"
            >
              <option value="all">全ステータス</option>
              <option value="pending">保留中</option>
              <option value="confirmed">確定</option>
              <option value="paid">支払済</option>
              <option value="cancelled">キャンセル</option>
            </select>
          </div>
        </div>
        {filteredConversions.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">コンバージョンがありません</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left bg-gray-50 font-bold text-gray-900">アフィリエイター</th>
                  <th className="px-4 py-3 text-left bg-gray-50 font-bold text-gray-900">サービス</th>
                  <th className="px-4 py-3 text-right bg-gray-50 font-bold text-gray-900">契約金額</th>
                  <th className="px-4 py-3 text-right bg-gray-50 font-bold text-gray-900">報酬額</th>
                  <th className="px-4 py-3 text-center bg-gray-50 font-bold text-gray-900">ステータス</th>
                  <th className="px-4 py-3 text-center bg-gray-50 font-bold text-gray-900">日時</th>
                  <th className="px-4 py-3 text-center bg-gray-50 font-bold text-gray-900">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredConversions.map((conv) => {
                  const statusColors: Record<string, string> = {
                    pending: 'bg-yellow-100 text-yellow-700',
                    confirmed: 'bg-green-100 text-green-700',
                    paid: 'bg-blue-100 text-blue-700',
                    cancelled: 'bg-red-100 text-red-700',
                  };
                  return (
                    <tr key={conv.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">
                        <div className="text-sm font-medium">{conv.affiliate_email || '不明'}</div>
                        <div className="text-xs text-gray-500">{conv.affiliate_code || ''}</div>
                      </td>
                      <td className="px-4 py-3 text-gray-900 text-sm">{conv.service_label || conv.service_type}</td>
                      <td className="px-4 py-3 text-right text-gray-900 font-medium">
                        ¥{(conv.plan_amount || 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-600 font-bold">
                        ¥{conv.commission_amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${statusColors[conv.status]}`}>
                          {conv.status_label || conv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {new Date(conv.converted_at).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          {conv.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateConversionStatus(conv.id, 'confirm_conversion')}
                                className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-medium"
                              >
                                承認
                              </button>
                              <button
                                onClick={() => handleUpdateConversionStatus(conv.id, 'cancel_conversion')}
                                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium"
                              >
                                却下
                              </button>
                            </>
                          )}
                          {conv.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateConversionStatus(conv.id, 'mark_paid')}
                              className="px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium"
                            >
                              支払済み
                            </button>
                          )}
                          {(conv.status === 'paid' || conv.status === 'cancelled') && (
                            <span className="text-xs text-gray-400">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
