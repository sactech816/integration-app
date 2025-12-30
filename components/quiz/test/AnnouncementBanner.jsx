import React, { useState, useEffect } from 'react';
import { X, Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AnnouncementBanner = ({ serviceType = 'quiz', onNavigateToAnnouncements }) => {
    const [latestAnnouncement, setLatestAnnouncement] = useState(null);
    const [isDismissed, setIsDismissed] = useState(false);

    useEffect(() => {
        fetchLatestAnnouncement();
    }, [serviceType]);

    const fetchLatestAnnouncement = async () => {
        if (!supabase) return;
        try {
            // 最新のアクティブなお知らせを1件取得（サービスタイプでフィルタリング）
            const { data, error } = await supabase
                .from('announcements')
                .select('*')
                .eq('is_active', true)
                .or(`service_type.eq.all,service_type.eq.${serviceType}`)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) throw error;
            
            if (data && data.length > 0) {
                const announcement = data[0];
                // ローカルストレージで既に閉じたお知らせかチェック
                const dismissedId = localStorage.getItem('dismissedAnnouncementId');
                if (dismissedId !== String(announcement.id)) {
                    setLatestAnnouncement(announcement);
                    setIsDismissed(false);
                }
            }
        } catch (e) {
            console.error('お知らせの取得エラー:', e);
        }
    };

    const handleDismiss = () => {
        if (latestAnnouncement) {
            localStorage.setItem('dismissedAnnouncementId', String(latestAnnouncement.id));
        }
        setIsDismissed(true);
    };

    // お知らせがない、または閉じられた場合は表示しない
    if (!latestAnnouncement || isDismissed) {
        return null;
    }

    return (
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 relative">
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Bell size={20} className="flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                        <span className="font-bold mr-2">{latestAnnouncement.title}</span>
                        <span className="text-sm opacity-90 line-clamp-1">{latestAnnouncement.content}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {onNavigateToAnnouncements && (
                        <button
                            onClick={onNavigateToAnnouncements}
                            className="text-white hover:bg-white/20 px-3 py-1 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
                        >
                            詳細を見る
                        </button>
                    )}
                    <button
                        onClick={handleDismiss}
                        className="text-white hover:bg-white/20 p-1 rounded-lg transition-colors"
                        aria-label="閉じる"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnnouncementBanner;

