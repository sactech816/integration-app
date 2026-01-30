'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, Loader2, Pin, AlertCircle, Info, Wrench, 
  Gift, ChevronRight, Check, Clock
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  category_label: string;
  category_color: string;
  priority: number;
  is_pinned: boolean;
  is_read: boolean;
  created_at: string;
  published_at?: string;
}

interface AnnouncementListProps {
  userId?: string;
  accessToken?: string;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  info: <Info size={16} />,
  update: <ChevronRight size={16} />,
  maintenance: <Wrench size={16} />,
  campaign: <Gift size={16} />,
  important: <AlertCircle size={16} />,
};

const CATEGORY_COLORS: Record<string, string> = {
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  update: 'bg-green-100 text-green-700 border-green-200',
  maintenance: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  campaign: 'bg-purple-100 text-purple-700 border-purple-200',
  important: 'bg-red-100 text-red-700 border-red-200',
};

export default function AnnouncementList({ userId, accessToken }: AnnouncementListProps) {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, [userId]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);

      const response = await fetch(`/api/kdl/announcements?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setAnnouncements(data.announcements || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnnouncementClick = async (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);

    // 既読マーク
    if (!announcement.is_read && userId && accessToken) {
      try {
        await fetch('/api/kdl/announcements', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            action: 'mark_read',
            announcement_id: announcement.id,
            user_id: userId,
          }),
        });

        // ローカル状態を更新
        setAnnouncements(prev => prev.map(a => 
          a.id === announcement.id ? { ...a, is_read: true } : a
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  const handleBack = () => {
    setSelectedAnnouncement(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 詳細ビュー
  if (selectedAnnouncement) {
    const categoryColor = CATEGORY_COLORS[selectedAnnouncement.category] || 'bg-gray-100 text-gray-700';

    return (
      <div className="space-y-6">
        {/* ヘッダー */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            ← 一覧に戻る
          </button>
        </div>

        {/* お知らせ詳細 */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6">
            {/* メタ情報 */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {selectedAnnouncement.is_pinned && (
                <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold">
                  <Pin size={12} />
                  固定
                </span>
              )}
              <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${categoryColor}`}>
                {CATEGORY_ICONS[selectedAnnouncement.category]}
                {selectedAnnouncement.category_label}
              </span>
              <span className="flex items-center gap-1 text-gray-400 text-xs">
                <Clock size={12} />
                {formatDate(selectedAnnouncement.published_at || selectedAnnouncement.created_at)}
              </span>
            </div>

            {/* タイトル */}
            <h1 className="text-2xl font-bold text-gray-900 mb-4">{selectedAnnouncement.title}</h1>

            {/* 本文 */}
            <div className="prose prose-gray max-w-none whitespace-pre-wrap">
              {selectedAnnouncement.content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 一覧ビュー
  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell size={32} />
            <div>
              <h2 className="text-2xl font-bold">お知らせ</h2>
              <p className="text-blue-100">
                KDLからの最新情報をお届けします
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white px-3 py-1 rounded-full font-bold">
              {unreadCount}件の未読
            </span>
          )}
        </div>
      </div>

      {/* お知らせ一覧 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Bell className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500">お知らせはありません</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => {
            const categoryColor = CATEGORY_COLORS[announcement.category] || 'bg-gray-100 text-gray-700';

            return (
              <button
                key={announcement.id}
                onClick={() => handleAnnouncementClick(announcement)}
                className={`w-full bg-white rounded-lg border overflow-hidden hover:shadow-md transition-all text-left ${
                  announcement.is_read ? 'border-gray-200' : 'border-blue-300 bg-blue-50'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* 未読インジケーター */}
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                      announcement.is_read ? 'bg-gray-300' : 'bg-blue-500'
                    }`} />

                    <div className="flex-1 min-w-0">
                      {/* メタ情報 */}
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        {announcement.is_pinned && (
                          <span className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-xs font-bold">
                            <Pin size={10} />
                            固定
                          </span>
                        )}
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold ${categoryColor}`}>
                          {CATEGORY_ICONS[announcement.category]}
                          {announcement.category_label}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {formatDate(announcement.published_at || announcement.created_at)}
                        </span>
                      </div>

                      {/* タイトル */}
                      <h3 className={`font-bold mb-1 ${
                        announcement.is_read ? 'text-gray-700' : 'text-gray-900'
                      }`}>
                        {announcement.title}
                      </h3>

                      {/* 本文プレビュー */}
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {announcement.content}
                      </p>
                    </div>

                    {/* 既読マーク */}
                    <div className="flex-shrink-0">
                      {announcement.is_read ? (
                        <Check size={18} className="text-green-500" />
                      ) : (
                        <ChevronRight size={18} className="text-blue-500" />
                      )}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
