'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bell, Calendar, ChevronRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

// お知らせデータの型
interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'update' | 'feature' | 'maintenance' | 'info';
}

// サンプルのお知らせデータ
const announcements: Announcement[] = [
  {
    id: '1',
    title: 'Kindle執筆システムに執筆スタイル選択機能を追加',
    content: 'AI執筆時に「説明文」「物語」「対話形式」「Q&A」「ワークブック」の5つのスタイルから選択できるようになりました。',
    date: '2025-01-02',
    category: 'feature',
  },
  {
    id: '2',
    title: '集客メーカー サービス開始',
    content: '診断クイズ・プロフィールLP・ビジネスLPを簡単に作成できる集客メーカーがスタートしました。',
    date: '2024-12-01',
    category: 'info',
  },
];

const categoryStyles = {
  update: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'アップデート' },
  feature: { bg: 'bg-green-100', text: 'text-green-700', label: '新機能' },
  maintenance: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'メンテナンス' },
  info: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'お知らせ' },
};

export default function AnnouncementsPageClient() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      }
    };
    init();
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const navigateTo = (page: string) => {
    if (page === '/' || page === '') {
      router.push('/');
    } else if (page === 'dashboard') {
      router.push('/dashboard');
    } else {
      router.push(`/${page}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex flex-col">
      <Header 
        user={user} 
        onLogout={handleLogout} 
        setPage={navigateTo}
        setShowAuth={() => router.push('/?auth=true')}
      />
      
      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* 戻るボタン */}
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>トップに戻る</span>
        </Link>

        {/* ページタイトル */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Bell className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">お知らせ</h1>
            <p className="text-sm text-gray-600">サービスの更新情報・新機能のお知らせ</p>
          </div>
        </div>

        {/* お知らせリスト */}
        <div className="space-y-4">
          {announcements.map((announcement) => {
            const style = categoryStyles[announcement.category];
            return (
              <div 
                key={announcement.id}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                        {style.label}
                      </span>
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar size={14} />
                        {announcement.date}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">
                      {announcement.title}
                    </h2>
                    <p className="text-gray-600 text-sm">
                      {announcement.content}
                    </p>
                  </div>
                  <ChevronRight className="text-gray-400 flex-shrink-0" size={20} />
                </div>
              </div>
            );
          })}
        </div>

        {announcements.length === 0 && (
          <div className="text-center py-12">
            <Bell className="text-gray-300 mx-auto mb-4" size={48} />
            <p className="text-gray-500">お知らせはありません</p>
          </div>
        )}
      </main>

      <Footer setPage={navigateTo} />
    </div>
  );
}
