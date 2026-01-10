'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Zap, TrendingUp, AlertCircle } from 'lucide-react';

interface AIUsageDisplayProps {
  userId: string;
  planType: 'monthly' | 'yearly' | 'none';
}

interface UsageData {
  daily: {
    total_calls: number;
    limit: number;
  };
  monthly: {
    total_calls: number;
    limit: number;
  };
}

export default function AIUsageDisplay({ userId, planType }: AIUsageDisplayProps) {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch(`/api/kdl/usage?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch AI usage');
        }
        const data = await response.json();
        setUsage(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUsage();
    } else {
      setIsLoading(false);
    }
  }, [userId]);

  // プランに応じた制限を取得
  const getLimits = () => {
    switch (planType) {
      case 'yearly':
        return { daily: 100, monthly: -1 }; // -1 = 無制限
      case 'monthly':
        return { daily: 50, monthly: 500 };
      default:
        return { daily: 3, monthly: 10 }; // 無料ユーザー
    }
  };

  const limits = getLimits();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="animate-spin text-amber-500" size={20} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-sm flex items-center gap-2">
        <AlertCircle size={16} />
        <span>使用量の取得に失敗しました</span>
      </div>
    );
  }

  const dailyCalls = usage?.daily?.total_calls || 0;
  const monthlyCalls = usage?.monthly?.total_calls || 0;

  const dailyLimit = limits.daily;
  const monthlyLimit = limits.monthly;

  const dailyPercentage = dailyLimit > 0 ? Math.min((dailyCalls / dailyLimit) * 100, 100) : 0;
  const monthlyPercentage = monthlyLimit > 0 ? Math.min((monthlyCalls / monthlyLimit) * 100, 100) : 0;

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Zap size={18} className="text-amber-600" />
        <h3 className="font-bold text-gray-900 text-sm">AI使用量</h3>
      </div>

      <div className="space-y-4">
        {/* 今日の使用量 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-600 font-medium">今日の使用量</span>
            <span className="text-xs font-bold text-gray-900">
              {dailyCalls} / {dailyLimit === -1 ? '∞' : dailyLimit}
            </span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${getProgressColor(dailyPercentage)}`}
              style={{ width: `${dailyLimit === -1 ? 0 : dailyPercentage}%` }}
            />
          </div>
        </div>

        {/* 今月の使用量 */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-600 font-medium">今月の使用量</span>
            <span className="text-xs font-bold text-gray-900">
              {monthlyCalls} / {monthlyLimit === -1 ? '∞' : monthlyLimit}
            </span>
          </div>
          {monthlyLimit === -1 ? (
            <div className="h-2 bg-gradient-to-r from-green-200 to-emerald-300 rounded-full" />
          ) : (
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${getProgressColor(monthlyPercentage)}`}
                style={{ width: `${monthlyPercentage}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* プラン表示 */}
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">現在のプラン</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            planType === 'yearly'
              ? 'bg-amber-100 text-amber-700'
              : planType === 'monthly'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-600'
          }`}>
            {planType === 'yearly' ? '年間プラン' : planType === 'monthly' ? '月額プラン' : 'お試し'}
          </span>
        </div>
      </div>
    </div>
  );
}














