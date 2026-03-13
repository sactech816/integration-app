'use client';

import React, { useState, useEffect } from 'react';
import { Bell, Calendar, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

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

const categoryLabels: Record<string, { label: string; color: string }> = {
  update: { label: 'アップデート', color: 'bg-blue-100 text-blue-700' },
  feature: { label: '新機能', color: 'bg-green-100 text-green-700' },
  maintenance: { label: 'メンテナンス', color: 'bg-orange-100 text-orange-700' },
  info: { label: 'お知らせ', color: 'bg-gray-100 text-gray-700' },
};

export default function AnnouncementList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAnnouncements(data);
      }
      setLoading(false);
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <Bell className="text-white" size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">お知らせ</h2>
          <p className="text-sm text-gray-500">集客メーカーからの最新情報</p>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
          </div>
        ) : announcements.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-500">
            現在お知らせはありません
          </div>
        ) : (
          announcements.map((announcement) => {
            const category = categoryLabels[announcement.type] || categoryLabels.info;
            const displayDate = announcement.announcement_date || announcement.created_at;
            const date = displayDate
              ? new Date(displayDate).toLocaleDateString('ja-JP')
              : '';

            return (
              <article
                key={announcement.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${category.color}`}>
                    {category.label}
                  </span>
                  <div className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Calendar size={14} />
                    <time>{date}</time>
                  </div>
                </div>

                <h3 className="text-base font-bold text-gray-900 mb-2">
                  {announcement.title}
                </h3>

                <div
                  className="text-sm text-gray-600 leading-relaxed prose prose-sm max-w-none
                    prose-headings:text-gray-900 prose-headings:font-bold
                    prose-h2:text-base prose-h2:mt-3 prose-h2:mb-1
                    prose-h3:text-sm prose-h3:mt-2 prose-h3:mb-1
                    prose-p:my-1 prose-p:leading-relaxed
                    prose-ul:my-1 prose-ol:my-1
                    prose-li:my-0.5
                    prose-a:text-indigo-600 prose-a:underline hover:prose-a:text-indigo-800
                    prose-img:rounded-lg prose-img:max-w-full"
                  dangerouslySetInnerHTML={{ __html: announcement.content }}
                />

                {announcement.link_url && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <a
                      href={announcement.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium text-sm transition-colors"
                    >
                      <ExternalLink size={14} />
                      {announcement.link_text || '詳細を見る'}
                    </a>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
