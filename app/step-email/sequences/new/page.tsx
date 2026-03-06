'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Plus, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';

export default function NewSequencePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [listId, setListId] = useState('');
  const [lists, setLists] = useState<{ id: string; name: string }[]>([]);
  const [creating, setCreating] = useState(false);
  const [loadingLists, setLoadingLists] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!supabase) {
        setAuthLoading(false);
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setAuthLoading(false);
    };
    init();
  }, []);

  // リスト一覧を取得
  useEffect(() => {
    if (!user) return;
    const fetchLists = async () => {
      setLoadingLists(true);
      const res = await fetch(`/api/newsletter-maker/lists?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setLists(data.lists || []);
        if (data.lists?.length > 0) {
          setListId(data.lists[0].id);
        }
      }
      setLoadingLists(false);
    };
    fetchLists();
  }, [user]);

  const handleCreate = async () => {
    if (!user || !name.trim() || !listId) return;
    setCreating(true);

    const res = await fetch('/api/step-email-maker/sequences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        listId,
        name: name.trim(),
        description: description.trim() || null,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/step-email/sequences/${data.sequence.id}`);
    } else {
      const data = await res.json();
      alert(data.error || 'シーケンス作成に失敗しました');
      setCreating(false);
    }
  };

  const navigateTo = (page: string) => {
    window.location.href = page.startsWith('/') ? page : `/${page}`;
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header setPage={navigateTo} user={user} onLogout={handleLogout} setShowAuth={setShowAuth} currentService="step-email" />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header setPage={navigateTo} user={user} onLogout={handleLogout} setShowAuth={setShowAuth} currentService="step-email" />
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">ログインが必要です</h2>
            <button
              onClick={() => setShowAuth(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl shadow-md hover:bg-teal-700 transition-all min-h-[44px]"
            >
              ログイン / 新規登録
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header setPage={navigateTo} user={user} onLogout={handleLogout} setShowAuth={setShowAuth} currentService="step-email" />
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />

      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/step-email/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-teal-700 mb-6 min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          ダッシュボードに戻る
        </Link>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">新しいシーケンスを作成</h1>

          {loadingLists ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
            </div>
          ) : lists.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">まず読者リストを作成してください。</p>
              <p className="text-sm text-gray-500 mb-6">ステップメールは読者リストに紐づけて配信します。メルマガメーカーの読者リストと共有されます。</p>
              <Link
                href="/newsletter/lists/new"
                className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]"
              >
                <Plus className="w-4 h-4" />
                読者リストを作成
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">読者リスト <span className="text-red-500">*</span></label>
                <select
                  value={listId}
                  onChange={(e) => setListId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                >
                  {lists.map((list) => (
                    <option key={list.id} value={list.id}>{list.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">メルマガメーカーの読者リストと共有されます</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">シーケンス名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="例: 新規登録者向けウェルカムメール"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">説明（任意）</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  placeholder="シーケンスの目的や内容の説明"
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={creating || !name.trim() || !listId}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all min-h-[44px]"
              >
                {creating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    シーケンスを作成
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
