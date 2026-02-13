'use client';

import React, { useState, useEffect } from 'react';
import {
  Users, Search, Loader2, ChevronDown, ChevronUp,
  CreditCard, BarChart3, Calendar, Mail, Crown, Filter, UserCog
} from 'lucide-react';

interface UserUsage {
  dailyUsage: number;
  monthlyUsage: number;
  totalCost: number;
  detailedStats?: {
    byModel: { gemini: number; openai: number; claude: number; unknown: number };
    byAction: { generate_title: number; generate_toc: number; generate_chapters: number; generate_section: number; rewrite: number; other: number };
  };
}

interface Subscriber {
  id: string;
  user_id: string;
  email: string;
  status: string;
  period: 'monthly' | 'yearly';
  amount: number;
  plan_tier: string;
  plan_tier_label: string;
  plan_name: string;
  current_period_end?: string;
  next_payment_date?: string;
  created_at: string;
  usage: UserUsage;
  is_monitor?: boolean;
  monitor_expires_at?: string | null;
  monitor_notes?: string | null;
}

interface Stats {
  totalSubscribers: number;
  monthlyPlanCount: number;
  yearlyPlanCount: number;
  tierStats: Record<string, number>;
  totalMonthlyAIUsage: number;
  totalMonthlyCost: number;
  monthlyRevenue: number;
  activeMonitorCount?: number;
  modelUsageStats?: { gemini: number; openai: number; claude: number; unknown: number };
  modelCostStats?: { gemini: number; openai: number; claude: number };
}

interface AdminUserListProps {
  userId: string;
  accessToken: string;
}

const PLAN_COLORS: Record<string, string> = {
  lite: 'bg-blue-100 text-blue-700',
  standard: 'bg-green-100 text-green-700',
  pro: 'bg-purple-100 text-purple-700',
  business: 'bg-amber-100 text-amber-700',
  enterprise: 'bg-red-100 text-red-700',
};

export default function AdminUserList({ userId, accessToken }: AdminUserListProps) {
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterType, setFilterType] = useState<'all' | 'subscriber' | 'monitor'>('all');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'created_at' | 'usage' | 'cost'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchSubscribers();
  }, [accessToken]);

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/kdl-subscribers', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch subscribers');
      }

      const data = await response.json();
      setSubscribers(data.subscribers || []);
      setStats(data.stats || null);
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
    } finally {
      setLoading(false);
    }
  };

  // フィルター・検索・ソート
  const filteredSubscribers = subscribers
    .filter(sub => {
      const matchesSearch = sub.email?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = filterTier === 'all' || sub.plan_tier === filterTier;
      const matchesType = filterType === 'all'
        || (filterType === 'subscriber' && sub.status !== 'monitor')
        || (filterType === 'monitor' && (sub.status === 'monitor' || sub.is_monitor));
      return matchesSearch && matchesTier && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'usage':
          comparison = (a.usage?.monthlyUsage || 0) - (b.usage?.monthlyUsage || 0);
          break;
        case 'cost':
          comparison = (a.usage?.totalCost || 0) - (b.usage?.totalCost || 0);
          break;
        case 'created_at':
        default:
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg p-6">
        <div className="flex items-center gap-3 mb-2">
          <Users size={32} />
          <h2 className="text-2xl font-bold">KDLユーザー管理</h2>
        </div>
        <p className="text-purple-100">
          全サブスクリプションユーザーとモニターユーザーのAI使用状況を管理します
        </p>
      </div>

      {/* 統計サマリー */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Users size={18} />
              <span className="text-sm font-medium">総加入者数</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalSubscribers}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <UserCog size={18} />
              <span className="text-sm font-medium">モニター</span>
            </div>
            <p className="text-3xl font-bold text-teal-600">{stats.activeMonitorCount || 0}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <CreditCard size={18} />
              <span className="text-sm font-medium">月間売上</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.monthlyRevenue)}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <BarChart3 size={18} />
              <span className="text-sm font-medium">今月のAI使用</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats.totalMonthlyAIUsage.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Crown size={18} />
              <span className="text-sm font-medium">AIコスト</span>
            </div>
            <p className="text-3xl font-bold text-amber-600">¥{stats.totalMonthlyCost.toLocaleString()}</p>
          </div>
        </div>
      )}

      {/* プラン別統計 */}
      {stats && stats.tierStats && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-bold text-gray-900 mb-3">プラン別分布</h3>
          <div className="flex flex-wrap gap-3">
            {Object.entries(stats.tierStats).map(([tier, count]) => (
              <div key={tier} className={`px-4 py-2 rounded-lg ${PLAN_COLORS[tier] || 'bg-gray-100 text-gray-700'}`}>
                <span className="font-bold">{tier}</span>
                <span className="ml-2">{count}人</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 検索・フィルター */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="メールアドレスで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'subscriber' | 'monitor')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="all">全タイプ</option>
              <option value="subscriber">購読者のみ</option>
              <option value="monitor">モニターのみ</option>
            </select>
            <select
              value={filterTier}
              onChange={(e) => setFilterTier(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            >
              <option value="all">全プラン</option>
              <option value="lite">Lite</option>
              <option value="standard">Standard</option>
              <option value="pro">Pro</option>
              <option value="business">Business</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [by, order] = e.target.value.split('-');
              setSortBy(by as 'created_at' | 'usage' | 'cost');
              setSortOrder(order as 'asc' | 'desc');
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
          >
            <option value="created_at-desc">登録日（新しい順）</option>
            <option value="created_at-asc">登録日（古い順）</option>
            <option value="usage-desc">使用量（多い順）</option>
            <option value="usage-asc">使用量（少ない順）</option>
            <option value="cost-desc">コスト（高い順）</option>
            <option value="cost-asc">コスト（低い順）</option>
          </select>
        </div>
      </div>

      {/* ユーザー一覧 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">ユーザー</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">プラン</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">ステータス</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">今月の使用</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">累計コスト</th>
                <th className="px-4 py-3 text-left text-sm font-bold text-gray-900">登録日</th>
                <th className="px-4 py-3 text-center text-sm font-bold text-gray-900">詳細</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    該当するユーザーがいません
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => (
                  <React.Fragment key={sub.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Mail size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-900">{sub.email}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${PLAN_COLORS[sub.plan_tier] || 'bg-gray-100 text-gray-700'}`}>
                            {sub.plan_tier_label || sub.plan_tier}
                          </span>
                          {sub.is_monitor && (
                            <span className="px-2 py-1 rounded text-xs font-bold bg-teal-100 text-teal-700">
                              モニター
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          sub.status === 'active' ? 'bg-green-100 text-green-700'
                          : sub.status === 'monitor' ? 'bg-teal-100 text-teal-700'
                          : 'bg-gray-100 text-gray-700'
                        }`}>
                          {sub.status === 'active' ? '有効' : sub.status === 'monitor' ? 'モニター' : sub.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-purple-600">{sub.usage?.monthlyUsage || 0}</span>
                        <span className="text-gray-400 text-xs ml-1">回</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-amber-600">¥{Math.round(sub.usage?.totalCost || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar size={14} />
                          {formatDate(sub.created_at)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setExpandedUser(expandedUser === sub.id ? null : sub.id)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          {expandedUser === sub.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>
                      </td>
                    </tr>
                    {/* 詳細展開行 */}
                    {expandedUser === sub.id && (
                      <tr className="bg-purple-50">
                        <td colSpan={7} className="px-4 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* 基本情報 */}
                            <div className="bg-white rounded-lg p-4 border border-purple-200">
                              <h4 className="font-bold text-gray-900 mb-2">基本情報</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="text-gray-500">プラン:</span> {sub.plan_name || sub.plan_tier}</p>
                                <p><span className="text-gray-500">期間:</span> {sub.status === 'monitor' ? 'モニター' : sub.period === 'yearly' ? '年額' : '月額'}</p>
                                <p><span className="text-gray-500">金額:</span> {sub.status === 'monitor' ? '¥0（モニター特典）' : formatCurrency(sub.amount)}</p>
                                {sub.status !== 'monitor' && (
                                  <p><span className="text-gray-500">次回更新:</span> {formatDate(sub.next_payment_date || '')}</p>
                                )}
                              </div>
                            </div>
                            {/* モニター情報 */}
                            {(sub.is_monitor || sub.status === 'monitor') && (
                              <div className="bg-white rounded-lg p-4 border border-teal-200">
                                <h4 className="font-bold text-gray-900 mb-2">モニター情報</h4>
                                <div className="space-y-1 text-sm">
                                  {sub.monitor_expires_at && (
                                    <p><span className="text-gray-500">有効期限:</span> {formatDate(sub.monitor_expires_at)}</p>
                                  )}
                                  {sub.monitor_notes && (
                                    <p><span className="text-gray-500">メモ:</span> {sub.monitor_notes}</p>
                                  )}
                                </div>
                              </div>
                            )}
                            {/* AI使用統計 */}
                            <div className="bg-white rounded-lg p-4 border border-purple-200">
                              <h4 className="font-bold text-gray-900 mb-2">AI使用統計</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="text-gray-500">今日:</span> {sub.usage?.dailyUsage || 0}回</p>
                                <p><span className="text-gray-500">今月:</span> {sub.usage?.monthlyUsage || 0}回</p>
                                <p><span className="text-gray-500">累計コスト:</span> ¥{Math.round(sub.usage?.totalCost || 0).toLocaleString()}</p>
                              </div>
                            </div>
                            {/* モデル別使用 */}
                            {sub.usage?.detailedStats?.byModel && (
                              <div className="bg-white rounded-lg p-4 border border-purple-200">
                                <h4 className="font-bold text-gray-900 mb-2">モデル別使用</h4>
                                <div className="space-y-1 text-sm">
                                  <p><span className="text-blue-600">Gemini:</span> {sub.usage.detailedStats.byModel.gemini}回</p>
                                  <p><span className="text-green-600">OpenAI:</span> {sub.usage.detailedStats.byModel.openai}回</p>
                                  <p><span className="text-orange-600">Claude:</span> {sub.usage.detailedStats.byModel.claude}回</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ページネーション（シンプル版） */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>全 {filteredSubscribers.length} 件を表示</span>
      </div>
    </div>
  );
}
