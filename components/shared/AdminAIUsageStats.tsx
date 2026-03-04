/**
 * 管理者向けAI使用統計コンポーネント
 * サービス別（集客メーカー/Kindle）のAI使用量とコストを表示
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, DollarSign, Users, Loader2,
  RefreshCw, Calendar, Zap, BookOpen, Sparkles, ChevronDown, ChevronRight
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface ServiceStats {
  service: string;
  total_requests: number;
  total_users: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost_jpy: number;
  avg_requests_per_user: number;
}

interface ModelStats {
  model: string;
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost_jpy: number;
}

// プロバイダー別統計（モデル別詳細を含む）
interface ProviderStats {
  provider: string;
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost_jpy: number;
  models: ModelStats[];
}

interface AdminAIUsageStatsProps {
  userId: string;
}

export default function AdminAIUsageStats({ userId }: AdminAIUsageStatsProps) {
  const [stats, setStats] = useState<ServiceStats[]>([]);
  const [modelStats, setModelStats] = useState<ModelStats[]>([]);
  const [providerStats, setProviderStats] = useState<ProviderStats[]>([]);
  const [providerStatsByService, setProviderStatsByService] = useState<Record<string, ProviderStats[]>>({});
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set());
  const [expandedServices, setExpandedServices] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // 統計データを取得
  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const session = await supabase?.auth.getSession();
      const token = session?.data.session?.access_token;
      const response = await fetch(
        `/api/admin/ai-usage-stats?startDate=${startDate.toISOString().split('T')[0]}&endDate=${new Date().toISOString().split('T')[0]}`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      if (!response.ok) {
        throw new Error('統計データの取得に失敗しました');
      }

      const data = await response.json();
      setStats(data.stats || []);
      setModelStats(data.modelStats || []);
      setProviderStats(data.providerStats || []);
      setProviderStatsByService(data.providerStatsByService || {});
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('AI usage stats fetch error:', err);
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  // サービス名を日本語に変換
  const getServiceName = (service: string): string => {
    switch (service) {
      case 'makers':
        return '集客メーカー';
      case 'kdl':
        return 'Kindle執筆';
      default:
        return service;
    }
  };

  // サービスアイコンを取得
  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'makers':
        return <Sparkles size={20} className="text-indigo-500" />;
      case 'kdl':
        return <BookOpen size={20} className="text-amber-500" />;
      default:
        return <Zap size={20} className="text-gray-500" />;
    }
  };

  // プロバイダー情報を取得
  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case 'OpenAI':
        return {
          name: 'OpenAI (ChatGPT)',
          bgColor: 'from-green-50 to-emerald-50',
          borderColor: 'border-green-200 hover:border-green-300',
          badgeColor: 'bg-green-100 text-green-700',
          barColor: 'bg-green-500',
          icon: '🤖',
        };
      case 'Gemini':
        return {
          name: 'Google Gemini',
          bgColor: 'from-amber-50 to-yellow-50',
          borderColor: 'border-amber-200 hover:border-amber-300',
          badgeColor: 'bg-amber-100 text-amber-700',
          barColor: 'bg-amber-500',
          icon: '✨',
        };
      case 'Claude':
        return {
          name: 'Anthropic Claude',
          bgColor: 'from-purple-50 to-violet-50',
          borderColor: 'border-purple-200 hover:border-purple-300',
          badgeColor: 'bg-purple-100 text-purple-700',
          barColor: 'bg-purple-500',
          icon: '🎭',
        };
      default:
        return {
          name: 'その他',
          bgColor: 'from-gray-50 to-slate-50',
          borderColor: 'border-gray-200 hover:border-gray-300',
          badgeColor: 'bg-gray-100 text-gray-700',
          barColor: 'bg-gray-500',
          icon: '🔧',
        };
    }
  };

  // プロバイダーの展開/折りたたみをトグル
  const toggleProvider = (provider: string) => {
    setExpandedProviders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(provider)) {
        newSet.delete(provider);
      } else {
        newSet.add(provider);
      }
      return newSet;
    });
  };

  // サービスの展開/折りたたみをトグル
  const toggleService = (service: string) => {
    setExpandedServices(prev => {
      const newSet = new Set(prev);
      if (newSet.has(service)) {
        newSet.delete(service);
      } else {
        newSet.add(service);
      }
      return newSet;
    });
  };

  // プロバイダー全体のコスト合計を計算
  const totalProviderCost = providerStats.reduce((sum, p) => sum + p.total_cost_jpy, 0);

  // 合計を計算
  const totals = stats.reduce(
    (acc, stat) => ({
      requests: acc.requests + stat.total_requests,
      users: acc.users + stat.total_users,
      cost: acc.cost + stat.total_cost_jpy,
      inputTokens: acc.inputTokens + stat.total_input_tokens,
      outputTokens: acc.outputTokens + stat.total_output_tokens,
    }),
    { requests: 0, users: 0, cost: 0, inputTokens: 0, outputTokens: 0 }
  );

  // コストをフォーマット（小数点以下2桁まで表示）
  const formatCost = (cost: number): string => {
    if (cost < 0.01) {
      return '¥0';
    }
    if (cost < 1) {
      return `¥${cost.toFixed(2)}`;
    }
    if (cost < 100) {
      return `¥${cost.toFixed(1)}`;
    }
    return `¥${Math.round(cost).toLocaleString()}`;
  };

  // トークン数をフォーマット
  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`;
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI使用統計</h2>
            <p className="text-sm text-gray-600">サービス別の使用量とコスト</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 期間選択 */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range === '7d' ? '7日' : range === '30d' ? '30日' : '90日'}
              </button>
            ))}
          </div>

          {/* 更新ボタン */}
          <button
            onClick={fetchStats}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="更新"
          >
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 最終更新日時 */}
      {lastUpdated && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <Calendar size={14} />
          <span>最終更新: {lastUpdated.toLocaleString('ja-JP')}</span>
        </div>
      )}

      {/* ローディング */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      )}

      {/* エラー */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* 統計データ */}
      {!isLoading && !error && (
        <>
          {/* 全体サマリー */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap size={18} className="text-blue-600" />
                <span className="text-sm text-gray-600">総リクエスト</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {totals.requests.toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={18} className="text-green-600" />
                <span className="text-sm text-gray-600">利用ユーザー</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {totals.users.toLocaleString()}
              </p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-amber-600" />
                <span className="text-sm text-gray-600">総トークン</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatTokens(totals.inputTokens + totals.outputTokens)}
              </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign size={18} className="text-red-600" />
                <span className="text-sm text-gray-600">推定コスト</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {formatCost(totals.cost)}
              </p>
            </div>
          </div>

          {/* サービス別詳細 */}
          <h3 className="font-bold text-gray-900 mb-4">サービス別内訳</h3>
          
          {stats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BarChart3 size={48} className="mx-auto mb-3 text-gray-300" />
              <p>選択期間のデータがありません</p>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.map((stat) => {
                const isServiceExpanded = expandedServices.has(stat.service);
                const serviceProviders = providerStatsByService[stat.service] || [];
                const serviceTotalCost = serviceProviders.reduce((sum, p) => sum + p.total_cost_jpy, 0);

                return (
                  <div
                    key={stat.service}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-colors"
                  >
                    {/* サービスヘッダー（クリックで展開） */}
                    <button
                      onClick={() => toggleService(stat.service)}
                      className="w-full p-4 text-left"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getServiceIcon(stat.service)}
                          <span className="font-bold text-gray-900">
                            {getServiceName(stat.service)}
                          </span>
                          {serviceProviders.length > 0 && (
                            <span className="text-xs text-gray-500">
                              ({serviceProviders.length} プロバイダー)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-red-600">
                            {formatCost(stat.total_cost_jpy)}
                          </span>
                          {isServiceExpanded ? (
                            <ChevronDown size={20} className="text-gray-400" />
                          ) : (
                            <ChevronRight size={20} className="text-gray-400" />
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">リクエスト数</p>
                          <p className="font-bold text-gray-900">
                            {stat.total_requests.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">利用ユーザー</p>
                          <p className="font-bold text-gray-900">
                            {stat.total_users.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">入力トークン</p>
                          <p className="font-bold text-gray-900">
                            {formatTokens(stat.total_input_tokens)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">出力トークン</p>
                          <p className="font-bold text-gray-900">
                            {formatTokens(stat.total_output_tokens)}
                          </p>
                        </div>
                      </div>

                      {/* 使用率バー */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>コスト比率</span>
                          <span>
                            {totals.cost > 0
                              ? `${Math.round((stat.total_cost_jpy / totals.cost) * 100)}%`
                              : '0%'}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              stat.service === 'makers'
                                ? 'bg-indigo-500'
                                : stat.service === 'kdl'
                                ? 'bg-amber-500'
                                : 'bg-gray-500'
                            }`}
                            style={{
                              width: `${
                                totals.cost > 0
                                  ? (stat.total_cost_jpy / totals.cost) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </button>

                    {/* サービス内のプロバイダー別統計（展開時のみ表示） */}
                    {isServiceExpanded && serviceProviders.length > 0 && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <h4 className="text-sm font-medium text-gray-700 mb-3">
                          {getServiceName(stat.service)} のAIプロバイダー別内訳
                        </h4>
                        <div className="space-y-3">
                          {serviceProviders.map((providerStat) => {
                            const info = getProviderInfo(providerStat.provider);
                            const providerKey = `${stat.service}-${providerStat.provider}`;
                            const isProviderExpanded = expandedProviders.has(providerKey);
                            const costPercentage = serviceTotalCost > 0
                              ? (providerStat.total_cost_jpy / serviceTotalCost) * 100
                              : 0;

                            return (
                              <div
                                key={providerKey}
                                className={`border rounded-lg overflow-hidden ${info.borderColor}`}
                              >
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleProvider(providerKey);
                                  }}
                                  className={`w-full p-3 text-left bg-gradient-to-br ${info.bgColor}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{info.icon}</span>
                                      <span className="font-medium text-gray-900 text-sm">{info.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-red-600 text-sm">
                                        {formatCost(providerStat.total_cost_jpy)}
                                      </span>
                                      <span className="text-xs text-gray-500">
                                        ({Math.round(costPercentage)}%)
                                      </span>
                                      {isProviderExpanded ? (
                                        <ChevronDown size={16} className="text-gray-400" />
                                      ) : (
                                        <ChevronRight size={16} className="text-gray-400" />
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                                    <span>{providerStat.total_requests.toLocaleString()} リクエスト</span>
                                    <span>{formatTokens(providerStat.total_input_tokens + providerStat.total_output_tokens)} トークン</span>
                                  </div>
                                </button>

                                {/* モデル別詳細（展開時） */}
                                {isProviderExpanded && providerStat.models.length > 0 && (
                                  <div className="p-3 border-t border-gray-200 bg-white">
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="border-b border-gray-200">
                                          <th className="text-left py-1 px-2 font-medium text-gray-600">モデル</th>
                                          <th className="text-right py-1 px-2 font-medium text-gray-600">リクエスト</th>
                                          <th className="text-right py-1 px-2 font-medium text-gray-600">トークン</th>
                                          <th className="text-right py-1 px-2 font-medium text-gray-600">コスト</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {providerStat.models.map((model) => (
                                          <tr key={model.model} className="border-b border-gray-100">
                                            <td className="py-1 px-2">
                                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${info.badgeColor}`}>
                                                {model.model || 'unknown'}
                                              </span>
                                            </td>
                                            <td className="text-right py-1 px-2 font-medium text-gray-900">
                                              {model.total_requests.toLocaleString()}
                                            </td>
                                            <td className="text-right py-1 px-2 text-gray-600">
                                              {formatTokens(model.total_input_tokens + model.total_output_tokens)}
                                            </td>
                                            <td className="text-right py-1 px-2 font-medium text-red-600">
                                              {formatCost(model.total_cost_jpy)}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* プロバイダー別統計（サービス別に分けて表示） */}
          {Object.keys(providerStatsByService).length > 0 && (
            <>
              <h3 className="font-bold text-gray-900 mb-4 mt-8">AIプロバイダー別内訳（サービス別）</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {(['makers', 'kdl'] as const).map((service) => {
                  const serviceProviders = providerStatsByService[service] || [];
                  if (serviceProviders.length === 0) return null;
                  
                  const serviceTotalCost = serviceProviders.reduce((sum, p) => sum + p.total_cost_jpy, 0);
                  const serviceTotalRequests = serviceProviders.reduce((sum, p) => sum + p.total_requests, 0);
                  const serviceTotalTokens = serviceProviders.reduce((sum, p) => sum + p.total_input_tokens + p.total_output_tokens, 0);

                  return (
                    <div
                      key={service}
                      className={`border rounded-xl overflow-hidden ${
                        service === 'makers' ? 'border-indigo-200' : 'border-amber-200'
                      }`}
                    >
                      {/* サービスヘッダー */}
                      <div className={`p-4 ${
                        service === 'makers' 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
                          : 'bg-gradient-to-r from-amber-500 to-orange-500'
                      }`}>
                        <div className="flex items-center gap-3">
                          {service === 'makers' ? (
                            <Sparkles size={24} className="text-white" />
                          ) : (
                            <BookOpen size={24} className="text-white" />
                          )}
                          <div>
                            <h4 className="font-bold text-white">
                              {getServiceName(service)}
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-white/80 mt-1">
                              <span>{serviceTotalRequests.toLocaleString()} リクエスト</span>
                              <span>{formatTokens(serviceTotalTokens)} トークン</span>
                              <span className="font-bold text-white">{formatCost(serviceTotalCost)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* プロバイダー一覧 */}
                      <div className="p-4 space-y-3 bg-white">
                        {serviceProviders.map((providerStat) => {
                          const info = getProviderInfo(providerStat.provider);
                          const providerKey = `provider-${service}-${providerStat.provider}`;
                          const isExpanded = expandedProviders.has(providerKey);
                          const costPercentage = serviceTotalCost > 0
                            ? (providerStat.total_cost_jpy / serviceTotalCost) * 100
                            : 0;

                          return (
                            <div
                              key={providerKey}
                              className={`border rounded-lg overflow-hidden ${info.borderColor}`}
                            >
                              <button
                                onClick={() => toggleProvider(providerKey)}
                                className={`w-full p-3 text-left bg-gradient-to-br ${info.bgColor}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{info.icon}</span>
                                    <span className="font-medium text-gray-900 text-sm">{info.name}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-red-600 text-sm">
                                      {formatCost(providerStat.total_cost_jpy)}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      ({Math.round(costPercentage)}%)
                                    </span>
                                    {isExpanded ? (
                                      <ChevronDown size={16} className="text-gray-400" />
                                    ) : (
                                      <ChevronRight size={16} className="text-gray-400" />
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                                  <span>{providerStat.total_requests.toLocaleString()} リクエスト</span>
                                  <span>{formatTokens(providerStat.total_input_tokens + providerStat.total_output_tokens)} トークン</span>
                                </div>
                                {/* コスト比率バー */}
                                <div className="mt-2">
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div
                                      className={`h-1.5 rounded-full transition-all ${info.barColor}`}
                                      style={{ width: `${costPercentage}%` }}
                                    />
                                  </div>
                                </div>
                              </button>

                              {/* モデル別詳細（展開時） */}
                              {isExpanded && providerStat.models.length > 0 && (
                                <div className="p-3 border-t border-gray-200 bg-white">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="border-b border-gray-200">
                                        <th className="text-left py-1 px-2 font-medium text-gray-600">モデル</th>
                                        <th className="text-right py-1 px-2 font-medium text-gray-600">リクエスト</th>
                                        <th className="text-right py-1 px-2 font-medium text-gray-600">トークン</th>
                                        <th className="text-right py-1 px-2 font-medium text-gray-600">コスト</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {providerStat.models.map((model) => (
                                        <tr key={model.model} className="border-b border-gray-100">
                                          <td className="py-1 px-2">
                                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium ${info.badgeColor}`}>
                                              {model.model || 'unknown'}
                                            </span>
                                          </td>
                                          <td className="text-right py-1 px-2 font-medium text-gray-900">
                                            {model.total_requests.toLocaleString()}
                                          </td>
                                          <td className="text-right py-1 px-2 text-gray-600">
                                            {formatTokens(model.total_input_tokens + model.total_output_tokens)}
                                          </td>
                                          <td className="text-right py-1 px-2 font-medium text-red-600">
                                            {formatCost(model.total_cost_jpy)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* モデル別統計（フラット表示・折りたたみセクション） */}
          {modelStats.length > 0 && (
            <details className="mt-8">
              <summary className="font-bold text-gray-900 cursor-pointer hover:text-gray-700">
                全モデル一覧（{modelStats.length}件）
              </summary>
              <div className="overflow-x-auto mt-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 font-medium text-gray-600">モデル</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">リクエスト</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">入力トークン</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">出力トークン</th>
                      <th className="text-right py-2 px-3 font-medium text-gray-600">コスト</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modelStats.map((model) => (
                      <tr key={model.model} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            model.model.startsWith('gpt-') || model.model.startsWith('o1') || model.model.startsWith('o3') ? 'bg-green-100 text-green-700' :
                            model.model.startsWith('gemini') ? 'bg-amber-100 text-amber-700' :
                            model.model.startsWith('claude') ? 'bg-purple-100 text-purple-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {model.model || 'unknown'}
                          </span>
                        </td>
                        <td className="text-right py-2 px-3 font-medium text-gray-900">
                          {model.total_requests.toLocaleString()}
                        </td>
                        <td className="text-right py-2 px-3 text-gray-600">
                          {formatTokens(model.total_input_tokens)}
                        </td>
                        <td className="text-right py-2 px-3 text-gray-600">
                          {formatTokens(model.total_output_tokens)}
                        </td>
                        <td className="text-right py-2 px-3 font-medium text-red-600">
                          {formatCost(model.total_cost_jpy)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          )}
        </>
      )}
    </div>
  );
}
