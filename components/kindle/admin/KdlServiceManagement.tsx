'use client';

/**
 * KDLサービス管理コンポーネント
 * Kindle執筆サービス専用のAI使用統計を表示
 */

import React, { useState, useEffect } from 'react';
import { 
  PieChart, TrendingUp, DollarSign, Users, Loader2, 
  RefreshCw, Calendar, Zap, BookOpen, BarChart3
} from 'lucide-react';

interface ServiceStats {
  service: string;
  total_requests: number;
  total_users: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost_jpy: number;
  avg_requests_per_user: number;
}

interface DailyStats {
  date: string;
  requests: number;
  users: number;
  cost: number;
}

interface KdlServiceManagementProps {
  userId: string;
  accessToken: string;
}

export default function KdlServiceManagement({ userId, accessToken }: KdlServiceManagementProps) {
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
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
      
      const response = await fetch(
        `/api/admin/ai-usage-stats?startDate=${startDate.toISOString().split('T')[0]}&endDate=${new Date().toISOString().split('T')[0]}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('統計データの取得に失敗しました');
      }

      const data = await response.json();
      
      // KDLの統計のみをフィルタリング
      const kdlStats = (data.stats || []).find((s: ServiceStats) => s.service === 'kdl');
      setStats(kdlStats || null);
      
      // 日別統計（APIが対応している場合）
      if (data.dailyStats) {
        const kdlDailyStats = data.dailyStats.filter((d: any) => d.service === 'kdl');
        setDailyStats(kdlDailyStats);
      }
      
      setLastUpdated(new Date());
    } catch (err: any) {
      console.error('KDL stats fetch error:', err);
      setError(err.message || 'データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [dateRange]);

  // コストをフォーマット
  const formatCost = (cost: number): string => {
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
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <PieChart size={32} />
              <h2 className="text-2xl font-bold">サービス管理</h2>
            </div>
            <p className="text-amber-100">
              Kindle執筆サービスのAI使用統計
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* 期間選択 */}
            <div className="flex items-center gap-1 bg-white/20 rounded-lg p-1">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    dateRange === range
                      ? 'bg-white text-amber-600'
                      : 'text-white hover:bg-white/10'
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
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors disabled:opacity-50"
              title="更新"
            >
              <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* 最終更新日時 */}
      {lastUpdated && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar size={14} />
          <span>最終更新: {lastUpdated.toLocaleString('ja-JP')}</span>
        </div>
      )}

      {/* ローディング */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-amber-600" size={48} />
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
          {/* サービスヘッダー */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <BookOpen className="text-amber-600" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Kindle執筆 (KDL)</h3>
                <p className="text-sm text-gray-500">AI使用量とコスト統計</p>
              </div>
            </div>
          </div>

          {stats ? (
            <>
              {/* 全体サマリー */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap size={18} className="text-amber-600" />
                    <span className="text-sm text-gray-600">総リクエスト</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total_requests.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={18} className="text-green-600" />
                    <span className="text-sm text-gray-600">利用ユーザー</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total_users.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={18} className="text-blue-600" />
                    <span className="text-sm text-gray-600">総トークン</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatTokens(stats.total_input_tokens + stats.total_output_tokens)}
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign size={18} className="text-red-600" />
                    <span className="text-sm text-gray-600">推定コスト</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCost(stats.total_cost_jpy)}
                  </p>
                </div>
              </div>

              {/* 詳細統計 */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center gap-2">
                    <BarChart3 size={20} className="text-gray-600" />
                    <h3 className="font-bold text-gray-900">詳細統計</h3>
                  </div>
                </div>

                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* 入力トークン */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500 mb-1">入力トークン</div>
                      <div className="text-xl font-bold text-gray-900">
                        {formatTokens(stats.total_input_tokens)}
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        {stats.total_input_tokens.toLocaleString()} tokens
                      </div>
                    </div>

                    {/* 出力トークン */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500 mb-1">出力トークン</div>
                      <div className="text-xl font-bold text-gray-900">
                        {formatTokens(stats.total_output_tokens)}
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        {stats.total_output_tokens.toLocaleString()} tokens
                      </div>
                    </div>

                    {/* 平均リクエスト数 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500 mb-1">ユーザーあたり平均リクエスト</div>
                      <div className="text-xl font-bold text-gray-900">
                        {stats.avg_requests_per_user?.toFixed(1) || '0'}
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        requests/user
                      </div>
                    </div>

                    {/* リクエストあたりコスト */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-500 mb-1">リクエストあたりコスト</div>
                      <div className="text-xl font-bold text-gray-900">
                        {stats.total_requests > 0
                          ? formatCost(stats.total_cost_jpy / stats.total_requests)
                          : '¥0'}
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        cost/request
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* コスト推移グラフプレースホルダー */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={20} className="text-gray-600" />
                  <h3 className="font-bold text-gray-900">コスト推移</h3>
                </div>
                
                {dailyStats.length > 0 ? (
                  <div className="h-48 flex items-end gap-1">
                    {dailyStats.map((day, index) => {
                      const maxCost = Math.max(...dailyStats.map(d => d.cost), 1);
                      const height = (day.cost / maxCost) * 100;
                      return (
                        <div
                          key={index}
                          className="flex-1 bg-amber-200 hover:bg-amber-300 rounded-t transition-colors"
                          style={{ height: `${Math.max(height, 2)}%` }}
                          title={`${day.date}: ${formatCost(day.cost)}`}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                      <p>日別データがありません</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <PieChart className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-500">選択期間のKDL統計データがありません</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
