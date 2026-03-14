'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GitBranch, Plus, Trash2, ChevronRight, Loader2, Eye, BarChart2,
} from 'lucide-react';
import FunnelAnalyticsChart from '@/components/funnel/FunnelAnalyticsChart';

interface Funnel {
  id: string;
  name: string;
  slug: string;
  status: string;
  step_count: number;
  created_at: string;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return '今日';
  if (diffDays === 1) return '昨日';
  if (diffDays < 7) return `${diffDays}日前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
  return `${Math.floor(diffDays / 30)}ヶ月前`;
}

export default function FunnelList({
  userId,
  isAdmin,
  hasMakersProAccess = false,
  onNavigate,
}: {
  userId: string;
  isAdmin: boolean;
  hasMakersProAccess?: boolean;
  onNavigate?: (path: string) => void;
}) {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFunnels();
  }, [userId]);

  const fetchFunnels = async () => {
    setLoading(true);
    const res = await fetch(`/api/funnel?userId=${userId}`);
    if (res.ok) {
      const data = await res.json();
      setFunnels(data.funnels || []);
    }
    setLoading(false);
  };

  const handleDelete = async (funnelId: string) => {
    if (!confirm('このファネルを削除しますか？')) return;
    const res = await fetch(`/api/funnel/${funnelId}?userId=${userId}`, { method: 'DELETE' });
    if (res.ok) {
      setFunnels((prev) => prev.filter((f) => f.id !== funnelId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const activeCount = funnels.filter((f) => f.status === 'active').length;
  const totalSteps = funnels.reduce((sum, f) => sum + f.step_count, 0);
  const funnelLimit = (isAdmin || hasMakersProAccess) ? -1 : 1;
  const isAtLimit = funnelLimit !== -1 && funnels.length >= funnelLimit;

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="bg-amber-50 p-2 rounded-xl">
              <GitBranch className="w-6 h-6 text-amber-600" />
            </span>
            ファネルメーカー
          </h2>
          <p className="text-gray-600 mt-1 text-sm">集客ファネルの作成・管理</p>
        </div>
        {isAtLimit ? (
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-400 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4" />上限に達しました（ビジネスプランで無制限）
          </Link>
        ) : (
          <Link
            href="/funnel/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4" />新しいファネル
          </Link>
        )}
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ファネル数</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{funnels.length}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">公開中</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{activeCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">総ステップ数</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalSteps}</p>
        </div>
      </div>

      {/* ローディング */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      )}

      {/* 空状態 */}
      {!loading && funnels.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
          <div className="bg-amber-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <GitBranch className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">まだファネルがありません</h3>
          <p className="text-gray-500 mb-6 text-sm">既存のLP・クイズ・フォームを繋いで集客ファネルを構築しましょう</p>
          <Link
            href="/funnel/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]"
          >
            <Plus className="w-4 h-4" />最初のファネルを作成
          </Link>
        </div>
      )}

      {/* ファネル一覧 */}
      {!loading && funnels.length > 0 && (
        <div className="grid gap-3">
          {funnels.map((funnel) => (
            <div key={funnel.id} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 shadow-sm">
              <div className="flex items-center justify-between">
                <Link href={`/funnel/editor/${funnel.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 truncate">{funnel.name}</h3>
                    {funnel.status === 'active' ? (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full flex-shrink-0">公開中</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full flex-shrink-0">下書き</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <span>{funnel.step_count} ステップ</span>
                    <span>{formatRelativeDate(funnel.created_at)}</span>
                  </div>
                </Link>
                <div className="flex items-center gap-1 ml-4">
                  {funnel.status === 'active' && (
                    <a href={`/funnel/${funnel.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                  <button onClick={() => handleDelete(funnel.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link href={`/funnel/editor/${funnel.id}`} className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ファネル解析 */}
      {!loading && funnels.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            <BarChart2 size={18} /> ステップ別アクセス解析
          </h3>
          {funnels.map((funnel) => (
            <FunnelAnalyticsChart
              key={`analytics-${funnel.id}`}
              funnelId={funnel.id}
              funnelName={funnel.name}
              userId={userId}
              isUnlocked={isAdmin || hasMakersProAccess}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
