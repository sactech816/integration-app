'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Loader2,
  ArrowRight,
  CalendarCheck,
  User,
} from 'lucide-react';
import { BookingMenu } from '@/types/booking';
import { getPublicBookingMenusByUser } from '@/app/actions/booking';
import { supabase } from '@/lib/supabase';
import ContentFooter from '@/components/shared/ContentFooter';

export default function BookingPlansPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [menus, setMenus] = useState<BookingMenu[]>([]);
  const [ownerName, setOwnerName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      // ユーザーの公開予約メニューを取得
      const menusData = await getPublicBookingMenusByUser(userId);
      setMenus(menusData);

      // オーナー名を取得
      if (supabase) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nickname')
          .eq('id', userId)
          .single();
        if (profile?.nickname) {
          setOwnerName(profile.nickname);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
          <p className="text-gray-600 text-sm">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (menus.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <CalendarCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">予約メニューが見つかりません</h1>
          <p className="text-gray-600 text-sm">
            現在公開中の予約メニューはありません。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 to-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              {ownerName && (
                <p className="text-sm text-gray-500">{ownerName}</p>
              )}
              <h1 className="text-xl font-bold text-gray-900">予約メニュー</h1>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            ご希望のメニューを選択して、予約にお進みください。
          </p>
        </div>
      </div>

      {/* メニュー一覧 */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {menus.map((menu) => (
            <Link
              key={menu.id}
              href={`/booking/${menu.id}`}
              className="block bg-white rounded-2xl border border-gray-300 shadow-md hover:shadow-lg hover:border-blue-300 transition-all duration-200 overflow-hidden group"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                      {menu.title}
                    </h2>
                    {menu.description && (
                      <p className="text-sm text-gray-600 mt-1.5 line-clamp-2">
                        {menu.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1.5 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{menu.duration_min}分</span>
                      </div>
                      {menu.contact_method && (
                        <div className="text-sm text-gray-500">
                          {menu.contact_method}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <ArrowRight className="w-5 h-5 text-blue-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          {menus.length}件のメニューが表示されています
        </p>
      </div>

      <ContentFooter />
    </div>
  );
}
