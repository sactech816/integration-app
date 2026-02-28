'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUserPlan } from '@/lib/hooks/useUserPlan';
import { ArrowLeft, Plus, Loader2, Lock } from 'lucide-react';
import Link from 'next/link';

export default function NewListPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { userPlan, isLoading: planLoading } = useUserPlan(userId);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      setAuthLoading(false);
    };
    init();
  }, []);

  const handleCreate = async () => {
    if (!userId || !name) return;
    setCreating(true);

    const res = await fetch('/api/newsletter-maker/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, name, description, fromName, fromEmail }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/newsletter/lists/${data.list.id}`);
    } else {
      alert('リスト作成に失敗しました');
    }
    setCreating(false);
  };

  if (authLoading || planLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!userId || !userPlan.isProUser) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">PROプラン限定機能</h2>
          <p className="text-gray-600 mb-6">メルマガ機能はPROプランでご利用いただけます。</p>
          <Link href="/newsletter" className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl shadow-md hover:bg-violet-700 transition-all min-h-[44px]">
            詳しく見る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.push('/newsletter/dashboard')} className="p-2 text-gray-500 hover:text-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">新しい読者リスト</h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">リスト名 <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例: メインニュースレター"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">説明（任意）</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="リストの説明（購読フォームにも表示されます）"
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">差出人名（任意）</label>
          <input
            type="text"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            placeholder="例: 田中太郎"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">差出人メールアドレス（任意）</label>
          <input
            type="email"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="例: info@example.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
          />
          <p className="text-xs text-gray-500 mt-1">設定しない場合はシステムの既定アドレスから送信されます。</p>
        </div>

        <button
          onClick={handleCreate}
          disabled={creating || !name}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 transition-all min-h-[44px]"
        >
          {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
          {creating ? '作成中...' : 'リストを作成'}
        </button>
      </div>
    </div>
  );
}
