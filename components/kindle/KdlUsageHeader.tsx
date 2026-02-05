'use client';

/**
 * KDL 使用量ヘッダー表示コンポーネント
 * 書籍作成数、構成系AI、執筆系AIの残り回数をコンパクトに表示
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BookOpen, Brain, PenTool, RefreshCw, AlertTriangle } from 'lucide-react';

interface UsageData {
  used: number;
  limit: number;
  remaining: number;
  canCreate?: boolean;
  canUse?: boolean;
}

interface KdlUsageLimits {
  bookCreation: UsageData;
  aiOutline: UsageData;
  aiWriting: UsageData;
  aiTotal: UsageData;
  planTier: string;
  isMonitor: boolean;
}

interface KdlUsageHeaderProps {
  userId: string;
  onLimitsChange?: (limits: KdlUsageLimits) => void;
  refreshTrigger?: number; // 外部からリフレッシュをトリガーする用
  className?: string;
}

// 残り回数のテキストを取得
const getRemainingText = (remaining: number, limit: number): string => {
  if (limit === -1) return '∞';
  return remaining.toString();
};

// 残り回数の警告レベルを取得
const getWarningLevel = (remaining: number, limit: number): 'normal' | 'warning' | 'danger' | 'unlimited' => {
  if (limit === -1) return 'unlimited';
  if (remaining <= 0) return 'danger';
  if (remaining <= Math.ceil(limit * 0.2)) return 'warning'; // 20%以下で警告
  return 'normal';
};

// 警告レベルに応じた色を取得
const getColorClass = (level: 'normal' | 'warning' | 'danger' | 'unlimited'): string => {
  switch (level) {
    case 'unlimited':
      return 'text-emerald-600 bg-emerald-50';
    case 'danger':
      return 'text-red-600 bg-red-50';
    case 'warning':
      return 'text-amber-600 bg-amber-50';
    default:
      return 'text-gray-700 bg-gray-100';
  }
};

export default function KdlUsageHeader({
  userId,
  onLimitsChange,
  refreshTrigger,
  className = '',
}: KdlUsageHeaderProps) {
  const [limits, setLimits] = useState<KdlUsageLimits | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 使用量を取得
  const fetchLimits = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/kdl/usage-limits?userId=${userId}`);
      if (!response.ok) {
        throw new Error('使用量の取得に失敗しました');
      }

      const data: KdlUsageLimits = await response.json();
      setLimits(data);
      onLimitsChange?.(data);
    } catch (err: any) {
      console.error('KDL usage limits fetch error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [userId, onLimitsChange]);

  // 初回読み込みとrefreshTriggerの変更時に取得
  useEffect(() => {
    fetchLimits();
  }, [fetchLimits, refreshTrigger]);

  // 読み込み中
  if (isLoading && !limits) {
    return (
      <div className={`flex items-center gap-2 text-xs text-gray-400 ${className}`}>
        <RefreshCw className="animate-spin" size={14} />
        <span>読み込み中...</span>
      </div>
    );
  }

  // エラー
  if (error && !limits) {
    return (
      <div className={`flex items-center gap-2 text-xs text-red-500 ${className}`}>
        <AlertTriangle size={14} />
        <span>取得エラー</span>
      </div>
    );
  }

  if (!limits) return null;

  const bookLevel = getWarningLevel(limits.bookCreation.remaining, limits.bookCreation.limit);
  const outlineLevel = getWarningLevel(limits.aiOutline.remaining, limits.aiOutline.limit);
  const writingLevel = getWarningLevel(limits.aiWriting.remaining, limits.aiWriting.limit);

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2 text-xs ${className}`}>
      {/* 書籍作成数 */}
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-full ${getColorClass(bookLevel)}`}
        title={`書籍: ${limits.bookCreation.used}/${limits.bookCreation.limit === -1 ? '∞' : limits.bookCreation.limit}`}
      >
        <BookOpen size={12} />
        <span className="font-medium">
          {limits.bookCreation.used}/{limits.bookCreation.limit === -1 ? '∞' : limits.bookCreation.limit}
        </span>
      </div>

      {/* 構成系AI */}
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-full ${getColorClass(outlineLevel)}`}
        title={`構成系AI（タイトル・目次等）: 残り${getRemainingText(limits.aiOutline.remaining, limits.aiOutline.limit)}回/日`}
      >
        <Brain size={12} />
        <span className="font-medium">
          {getRemainingText(limits.aiOutline.remaining, limits.aiOutline.limit)}
        </span>
      </div>

      {/* 執筆系AI */}
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-full ${getColorClass(writingLevel)}`}
        title={`執筆系AI（本文生成・書き換え）: 残り${getRemainingText(limits.aiWriting.remaining, limits.aiWriting.limit)}回/日`}
      >
        <PenTool size={12} />
        <span className="font-medium">
          {getRemainingText(limits.aiWriting.remaining, limits.aiWriting.limit)}
        </span>
      </div>

      {/* リフレッシュボタン */}
      <button
        onClick={fetchLimits}
        disabled={isLoading}
        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
        title="更新"
      >
        <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
      </button>
    </div>
  );
}

// 使用量データをエクスポート（他コンポーネントで再利用可能）
export type { KdlUsageLimits, UsageData };
