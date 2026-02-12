'use client';

import { useState, useEffect } from 'react';
import {
  Users, Bell, Shield, Settings, DollarSign, RefreshCw, Loader2,
  CheckCircle2, AlertTriangle, XCircle, ArrowRight,
  Star, Gamepad2, ArrowRightLeft, Trash2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type HealthStatus = 'ok' | 'warning' | 'error';

type DashboardData = {
  users: { total: number; partners: number };
  announcements: { total: number; active: number };
  monitors: { active: number; expiringSoon: number; expired: number };
  health: { overall: HealthStatus; aiModels: HealthStatus; planSettings: HealthStatus };
  affiliate: { totalAffiliates: number; activeAffiliates: number; thisMonthEarnings: number; thisMonthConversions: number };
  checkedAt: string;
};

interface AdminOverviewProps {
  onNavigate: (viewId: string) => void;
  service?: 'makers' | 'kdl';
}

export default function AdminOverview({ onNavigate, service = 'makers' }: AdminOverviewProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const session = await supabase?.auth.getSession();
      const token = session?.data.session?.access_token;
      if (!token) return;

      const response = await fetch(`/api/admin/dashboard-summary?service=${service}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setData(await response.json());
      }
    } catch (err) {
      console.error('Dashboard summary error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [service]);

  const healthIcon = (status: HealthStatus) => {
    switch (status) {
      case 'ok': return <CheckCircle2 size={16} className="text-green-500" />;
      case 'warning': return <AlertTriangle size={16} className="text-yellow-500" />;
      case 'error': return <XCircle size={16} className="text-red-500" />;
    }
  };

  const healthLabel = (status: HealthStatus) => {
    switch (status) {
      case 'ok': return '正常';
      case 'warning': return '要確認';
      case 'error': return 'エラー';
    }
  };

  const healthColor = (status: HealthStatus) => {
    switch (status) {
      case 'ok': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">管理者ダッシュボード</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-200 rounded w-16 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        データの取得に失敗しました。
        <button onClick={fetchSummary} className="ml-2 text-indigo-600 hover:underline">再試行</button>
      </div>
    );
  }

  type CardConfig = {
    id: string;
    title: string;
    icon: typeof Users;
    viewId: string;
    content: React.ReactNode;
    accent: string;
    makersOnly?: boolean;
  };

  const cards: CardConfig[] = [
    {
      id: 'users',
      title: 'ユーザー管理',
      icon: Users,
      viewId: 'admin-users',
      accent: 'border-blue-200 hover:border-blue-400',
      content: (
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">{data.users.total.toLocaleString()}<span className="text-sm font-normal text-gray-500 ml-1">名</span></div>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold">PT {data.users.partners}名</span>
          </div>
        </div>
      ),
    },
    {
      id: 'announcements',
      title: 'お知らせ管理',
      icon: Bell,
      viewId: 'admin-announcements',
      accent: 'border-purple-200 hover:border-purple-400',
      content: (
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">{data.announcements.active}<span className="text-sm font-normal text-gray-500 ml-1">件 有効</span></div>
          <div className="text-sm text-gray-500">全 {data.announcements.total} 件</div>
        </div>
      ),
    },
    {
      id: 'monitors',
      title: 'モニター管理',
      icon: Shield,
      viewId: 'admin-monitor',
      accent: data.monitors.expiringSoon > 0
        ? 'border-yellow-200 hover:border-yellow-400'
        : 'border-green-200 hover:border-green-400',
      content: (
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">{data.monitors.active}<span className="text-sm font-normal text-gray-500 ml-1">名 有効</span></div>
          <div className="flex flex-wrap gap-2 text-xs">
            {data.monitors.expiringSoon > 0 && (
              <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
                {data.monitors.expiringSoon}名 期限切れ間近
              </span>
            )}
            {data.monitors.expired > 0 && (
              <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                {data.monitors.expired}名 期限切れ
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      id: 'service',
      title: 'サービス設定',
      icon: Settings,
      viewId: 'admin-service',
      accent: data.health.overall === 'error'
        ? 'border-red-200 hover:border-red-400'
        : data.health.overall === 'warning'
          ? 'border-yellow-200 hover:border-yellow-400'
          : 'border-green-200 hover:border-green-400',
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {healthIcon(data.health.overall)}
            <span className={`text-lg font-bold ${healthColor(data.health.overall)}`}>
              {healthLabel(data.health.overall)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="flex items-center gap-1 text-gray-600">
              {healthIcon(data.health.aiModels)} AIモデル
            </span>
            <span className="flex items-center gap-1 text-gray-600">
              {healthIcon(data.health.planSettings)} プラン設定
            </span>
          </div>
        </div>
      ),
    },
    {
      id: 'affiliate',
      title: 'アフィリエイト',
      icon: DollarSign,
      viewId: 'admin-affiliate',
      accent: 'border-emerald-200 hover:border-emerald-400',
      content: (
        <div className="space-y-2">
          <div className="text-3xl font-bold text-gray-900">
            {data.affiliate.thisMonthEarnings > 0
              ? `¥${data.affiliate.thisMonthEarnings.toLocaleString()}`
              : '¥0'
            }
            <span className="text-sm font-normal text-gray-500 ml-1">今月</span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            <span>CV {data.affiliate.thisMonthConversions}件</span>
            <span>有効 {data.affiliate.activeAffiliates}/{data.affiliate.totalAffiliates}名</span>
          </div>
        </div>
      ),
    },
  ];

  // Makers専用カード
  if (service === 'makers') {
    cards.push({
      id: 'others',
      title: 'その他の管理',
      icon: Star,
      viewId: '',
      accent: 'border-gray-200 hover:border-gray-400',
      makersOnly: true,
      content: (
        <div className="space-y-2">
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate('admin-featured'); }}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 transition-colors w-full"
          >
            <Star size={14} /> ピックアップ管理 <ArrowRight size={12} className="ml-auto" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate('admin-gamification'); }}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 transition-colors w-full"
          >
            <Gamepad2 size={14} /> ゲーミフィケーション <ArrowRight size={12} className="ml-auto" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate('admin-transfer'); }}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 transition-colors w-full"
          >
            <ArrowRightLeft size={14} /> 所有権の移動 <ArrowRight size={12} className="ml-auto" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onNavigate('admin-cleanup'); }}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-indigo-600 transition-colors w-full"
          >
            <Trash2 size={14} /> データクリーンアップ <ArrowRight size={12} className="ml-auto" />
          </button>
        </div>
      ),
    });
  }

  // KDL専用: monitors viewIdを調整
  if (service === 'kdl') {
    const monitorCard = cards.find(c => c.id === 'monitors');
    if (monitorCard) monitorCard.viewId = 'admin-monitors';
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">管理者ダッシュボード</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {new Date(data.checkedAt).toLocaleString('ja-JP')}
          </span>
          <button
            onClick={fetchSummary}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="更新"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              onClick={() => card.viewId && onNavigate(card.viewId)}
              className={`bg-white rounded-xl border-2 ${card.accent} p-5 text-left transition-all hover:shadow-md ${card.viewId ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                    <Icon size={18} className="text-gray-600" />
                  </div>
                  <h3 className="font-bold text-gray-700 text-sm">{card.title}</h3>
                </div>
                {card.viewId && <ArrowRight size={16} className="text-gray-300" />}
              </div>
              {card.content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
