'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Bell, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

interface Announcement {
  id: string;
  title: string;
  content: string;
  created_at: string;
  type: 'update' | 'feature' | 'maintenance' | 'info';
  link_url?: string;
  link_text?: string;
  announcement_date?: string;
}

const categoryLabels = {
  update: { label: 'アップデート', color: 'bg-blue-100 text-blue-700' },
  feature: { label: '新機能', color: 'bg-green-100 text-green-700' },
  maintenance: { label: 'メンテナンス', color: 'bg-orange-100 text-orange-700' },
  info: { label: 'お知らせ', color: 'bg-gray-100 text-gray-700' },
};

export default function AnnouncementsPageClient() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        
        // お知らせを取得
        const { data, error } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setAnnouncements(data);
        }
      }
      setLoading(false);
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              現在お知らせはありません
            </div>
          ) : (
            announcements.map((announcement) => {
              const category = categoryLabels[announcement.type] || categoryLabels.info;
              // announcement_dateがあればそれを使用、なければcreated_atを使用
              const displayDate = announcement.announcement_date || announcement.created_at;
              const date = displayDate
                ? new Date(displayDate).toLocaleDateString('ja-JP')
                : '';
              
              return (
                <article
                  key={announcement.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${category.color}`}>
                        {category.label}
                      </span>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Calendar size={14} />
                        <time>{date}</time>
                      </div>
                    </div>
                  </div>
                  
                  <h2 className="text-lg font-bold text-gray-900 mb-2">
                    {announcement.title}
                  </h2>
                  
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {announcement.content}
                  </p>

                  {/* リンクがある場合は表示 */}
                  {announcement.link_url && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <a
                        href={announcement.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium transition-colors"
                      >
                        <ExternalLink size={16} />
                        {announcement.link_text || '詳細を見る'}
                      </a>
                    </div>
                  )}
                </article>
              );
            })
          )}
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
