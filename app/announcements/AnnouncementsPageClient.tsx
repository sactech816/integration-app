'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bell, Calendar, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'update' | 'feature' | 'maintenance' | 'info';
}

// サンプルのお知らせデータ
const sampleAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Kindle執筆システムに執筆スタイル選択機能を追加',
    content: 'AI執筆時に「説明文」「物語」「対話形式」「Q&A」「ワークブック」の5種類のスタイルから選択できるようになりました。目次で選んだスタイルがデフォルトで適用されます。',
    date: '2026-01-02',
    category: 'feature',
  },
  {
    id: '2',
    title: 'システムメンテナンスのお知らせ',
    content: '定期メンテナンスを実施いたします。ご不便をおかけしますが、ご理解のほどよろしくお願いいたします。',
    date: '2025-12-28',
    category: 'maintenance',
  },
  {
    id: '3',
    title: '集客メーカーをリリースしました',
    content: '診断クイズ・プロフィールLP・ビジネスLPが簡単に作成できる「集客メーカー」をリリースしました。ぜひご利用ください。',
    date: '2025-12-01',
    category: 'info',
  },
];

const categoryLabels = {
  update: { label: 'アップデート', color: 'bg-blue-100 text-blue-700' },
  feature: { label: '新機能', color: 'bg-green-100 text-green-700' },
  maintenance: { label: 'メンテナンス', color: 'bg-orange-100 text-orange-700' },
  info: { label: 'お知らせ', color: 'bg-gray-100 text-gray-700' },
};

export default function AnnouncementsPageClient() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [announcements] = useState<Announcement[]>(sampleAnnouncements);

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
    router.push(page === '' ? '/' : `/${page}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex flex-col">
      <Header
        setPage={navigateTo}
        user={user}
        onLogout={handleLogout}
        setShowAuth={() => router.push('/?auth=true')}
      />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
        {/* ページヘッダー */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors mb-4"
          >
            <ArrowLeft size={20} />
            <span>トップに戻る</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bell className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">お知らせ</h1>
              <p className="text-gray-600">集客メーカーからの最新情報</p>
            </div>
          </div>
        </div>

        {/* お知らせ一覧 */}
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <article
              key={announcement.id}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${categoryLabels[announcement.category].color}`}>
                    {categoryLabels[announcement.category].label}
                  </span>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Calendar size={14} />
                    <time>{announcement.date}</time>
                  </div>
                </div>
              </div>
              
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                {announcement.title}
              </h2>
              
              <p className="text-gray-600 leading-relaxed">
                {announcement.content}
              </p>
            </article>
          ))}
        </div>

        {/* 問い合わせリンク */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            ご不明な点がございましたらお気軽にお問い合わせください
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            お問い合わせ
            <ExternalLink size={16} />
          </Link>
        </div>
      </main>

      <Footer setPage={navigateTo} />
    </div>
  );
}
