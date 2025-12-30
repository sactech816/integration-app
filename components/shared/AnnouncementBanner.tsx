'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Megaphone, AlertTriangle, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Announcement {
  id: string;
  title: string;
  type: 'info' | 'warning' | 'success' | 'error';
  link?: string;
  // 追加フィールド（DBから取得可能な場合）
  background_color?: string;
  text_color?: string;
  icon_color?: string;
}

interface AnnouncementBannerProps {
  serviceType?: 'quiz' | 'profile' | 'business' | 'all';
}

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ serviceType = 'all' }) => {
  const router = useRouter();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      if (!supabase) return;

      try {
        let query = supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (serviceType !== 'all') {
          query = query.or(`service_type.eq.${serviceType},service_type.eq.all`);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Announcement fetch error:', error);
          return;
        }

        if (data && data.length > 0) {
          // ローカルストレージで既読チェック
          const dismissedIds = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
          if (!dismissedIds.includes(data[0].id)) {
            setAnnouncement(data[0]);
          }
        }
      } catch (error) {
        console.error('Announcement fetch error:', error);
      }
    };

    fetchAnnouncement();
  }, [serviceType]);

  const handleDismiss = () => {
    if (announcement) {
      const dismissedIds = JSON.parse(localStorage.getItem('dismissedAnnouncements') || '[]');
      dismissedIds.push(announcement.id);
      localStorage.setItem('dismissedAnnouncements', JSON.stringify(dismissedIds));
    }
    setIsVisible(false);
  };

  const handleNavigateToAnnouncements = () => {
    router.push('/announcements');
  };

  if (!announcement || !isVisible) return null;

  // デフォルトスタイル（より見やすいデザイン）
  const typeStyles = {
    info: {
      bg: 'bg-gradient-to-r from-indigo-600 to-purple-600',
      text: 'text-white',
      icon: 'text-yellow-300',
      hoverBg: 'hover:bg-white/10',
      IconComponent: Megaphone,
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
      text: 'text-white',
      icon: 'text-yellow-100',
      hoverBg: 'hover:bg-white/10',
      IconComponent: AlertTriangle,
    },
    success: {
      bg: 'bg-gradient-to-r from-emerald-600 to-teal-600',
      text: 'text-white',
      icon: 'text-green-100',
      hoverBg: 'hover:bg-white/10',
      IconComponent: CheckCircle,
    },
    error: {
      bg: 'bg-gradient-to-r from-red-600 to-pink-600',
      text: 'text-white',
      icon: 'text-red-100',
      hoverBg: 'hover:bg-white/10',
      IconComponent: XCircle,
    },
  };

  // typeが未定義または不正な場合はinfoをデフォルトとして使用
  const style = typeStyles[announcement.type] || typeStyles.info;
  const IconComponent = style.IconComponent;

  // カスタムカラーがあれば適用
  const customStyle = {
    backgroundColor: announcement.background_color || undefined,
    color: announcement.text_color || undefined,
  };

  const hasCustomStyle = announcement.background_color || announcement.text_color;

  return (
    <div 
      className={`${hasCustomStyle ? '' : style.bg} ${hasCustomStyle ? '' : style.text} py-3 px-4 shadow-md cursor-pointer`}
      style={hasCustomStyle ? customStyle : undefined}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div 
          className="flex items-center gap-3 flex-1 min-w-0"
          onClick={handleNavigateToAnnouncements}
        >
          <div className={`flex-shrink-0 ${hasCustomStyle ? '' : style.icon}`} style={announcement.icon_color ? { color: announcement.icon_color } : undefined}>
            <IconComponent size={20} />
          </div>
          <p className="text-sm font-bold truncate hover:underline">
            {announcement.title}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleNavigateToAnnouncements}
            className={`flex items-center gap-1 px-3 py-1.5 ${hasCustomStyle ? 'hover:bg-black/10' : style.hoverBg} rounded-lg transition-colors text-sm font-semibold`}
            aria-label="詳細を見る"
          >
            詳細
            <ArrowRight size={16} />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className={`px-2 py-1.5 ${hasCustomStyle ? 'hover:bg-black/10' : style.hoverBg} rounded-lg transition-colors text-xs font-medium opacity-80 hover:opacity-100`}
            aria-label="閉じる"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
