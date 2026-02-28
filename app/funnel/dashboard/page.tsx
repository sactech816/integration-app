'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useUserPlan } from '@/lib/hooks/useUserPlan';
import { GitBranch, Plus, Trash2, ChevronRight, Lock, Loader2, Eye } from 'lucide-react';

interface Funnel {
  id: string;
  name: string;
  slug: string;
  status: string;
  step_count: number;
  created_at: string;
}

export default function FunnelDashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { userPlan, isLoading: planLoading } = useUserPlan(userId);
  const [funnels, setFunnels] = useState<Funnel[]>([]);

  useEffect(() => {
    const init = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchFunnels(user.id);
      }
      setAuthLoading(false);
    };
    init();
  }, []);

  const fetchFunnels = async (uid: string) => {
    const res = await fetch(`/api/funnel?userId=${uid}`);
    if (res.ok) {
      const data = await res.json();
      setFunnels(data.funnels || []);
    }
  };

  const handleDelete = async (funnelId: string) => {
    if (!userId || !confirm('このファネルを削除しますか？')) return;
    const res = await fetch(`/api/funnel/${funnelId}?userId=${userId}`, { method: 'DELETE' });
    if (res.ok) setFunnels((prev) => prev.filter((f) => f.id !== funnelId));
  };

  if (authLoading || planLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <GitBranch className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ログインが必要です</h2>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-semibold rounded-xl shadow-md hover:bg-amber-700 transition-all min-h-[44px]">ログインページへ</Link>
        </div>
      </div>
    );
  }

  if (!userPlan.isProUser) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">PROプラン限定機能</h2>
          <p className="text-gray-600 mb-6">ファネル機能はPROプラン（月額3,980円）でご利用いただけます。</p>
          <Link href="/funnel" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white font-semibold rounded-xl shadow-md hover:bg-amber-700 transition-all min-h-[44px]">詳しく見る</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">ファネルダッシュボード</h1>
          <p className="text-gray-600 mt-1">集客ファネルの作成・管理</p>
        </div>
        <Link href="/funnel/new" className="inline-flex items-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all min-h-[44px]">
          <Plus className="w-4 h-4" />新しいファネル
        </Link>
      </div>

      {funnels.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8 text-center">
          <GitBranch className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">まだファネルがありません</p>
          <Link href="/funnel/new" className="inline-flex items-center gap-2 px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]">
            <Plus className="w-4 h-4" />最初のファネルを作成
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {funnels.map((funnel) => (
            <div key={funnel.id} className="bg-white border border-gray-200 rounded-2xl shadow-md p-5 hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <Link href={`/funnel/editor/${funnel.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-lg truncate">{funnel.name}</h3>
                    {funnel.status === 'active' ? (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">公開中</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full">下書き</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{funnel.step_count} ステップ</p>
                </Link>
                <div className="flex items-center gap-2 ml-4">
                  {funnel.status === 'active' && (
                    <a href={`/funnel/${funnel.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-amber-600 hover:text-amber-800 min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                  <button onClick={() => handleDelete(funnel.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link href={`/funnel/editor/${funnel.id}`} className="p-2 text-gray-400 hover:text-amber-600 min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
