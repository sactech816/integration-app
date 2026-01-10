'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Plus,
  Settings,
  Trash2,
  Eye,
  Clock,
  Users,
  ChevronRight,
  CalendarDays,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Copy,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BookingMenu, BOOKING_MENU_TYPE_LABELS } from '@/types/booking';
import { getBookingMenus, deleteBookingMenu, updateBookingMenu } from '@/app/actions/booking';

export default function BookingPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [menus, setMenus] = useState<BookingMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/');
        return;
      }

      setUser({ id: user.id, email: user.email });
      await loadMenus(user.id);
    };

    checkAuth();
  }, [router]);

  const loadMenus = async (userId: string) => {
    setLoading(true);
    const data = await getBookingMenus(userId);
    setMenus(data);
    setLoading(false);
  };

  const handleDelete = async (menuId: string) => {
    if (!user || !confirm('この予約メニューを削除しますか？関連する予約枠と予約もすべて削除されます。')) {
      return;
    }

    setDeletingId(menuId);
    const result = await deleteBookingMenu(menuId, user.id);
    if (result.success) {
      setMenus(menus.filter(m => m.id !== menuId));
    } else {
      alert('削除に失敗しました: ' + result.error);
    }
    setDeletingId(null);
  };

  const handleToggleActive = async (menu: BookingMenu) => {
    if (!user) return;

    const result = await updateBookingMenu(menu.id, user.id, {
      is_active: !menu.is_active,
    });

    if (result.success && result.data) {
      setMenus(menus.map(m => m.id === menu.id ? result.data : m));
    }
  };

  const copyPublicUrl = (menuId: string) => {
    const url = `${window.location.origin}/booking/${menuId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(menuId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="text-white" size={22} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">予約管理</h1>
                <p className="text-xs text-gray-500">予約メニュー・枠の管理</p>
              </div>
            </div>
          </div>
          <Link
            href="/booking/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">新規メニュー作成</span>
            <span className="sm:hidden">作成</span>
          </Link>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {menus.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CalendarDays className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              予約メニューがありません
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              予約メニューを作成して、お客様からの予約を受け付けましょう。
              カレンダー形式で予約枠を設定できます。
            </p>
            <Link
              href="/booking/new"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              最初のメニューを作成
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {menus.map((menu) => (
              <div
                key={menu.id}
                className={`bg-white rounded-2xl shadow-lg border-2 transition-all hover:shadow-xl ${
                  menu.is_active ? 'border-transparent' : 'border-gray-200 opacity-70'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            menu.type === 'reservation'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {BOOKING_MENU_TYPE_LABELS[menu.type]}
                        </span>
                        {!menu.is_active && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                            非公開
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                        {menu.title}
                      </h3>
                      {menu.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {menu.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock size={16} />
                          <span>{menu.duration_min}分</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CalendarDays size={16} />
                          <span>
                            {new Date(menu.created_at || '').toLocaleDateString('ja-JP')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(menu)}
                        className={`p-2 rounded-lg transition-colors ${
                          menu.is_active
                            ? 'text-green-600 hover:bg-green-50'
                            : 'text-gray-400 hover:bg-gray-100'
                        }`}
                        title={menu.is_active ? '公開中' : '非公開'}
                      >
                        {menu.is_active ? (
                          <ToggleRight size={24} />
                        ) : (
                          <ToggleLeft size={24} />
                        )}
                      </button>
                      <button
                        onClick={() => copyPublicUrl(menu.id)}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="公開URLをコピー"
                      >
                        {copiedId === menu.id ? (
                          <Check size={20} className="text-green-600" />
                        ) : (
                          <Copy size={20} />
                        )}
                      </button>
                      <Link
                        href={`/booking/${menu.id}`}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="プレビュー"
                      >
                        <Eye size={20} />
                      </Link>
                      <Link
                        href={`/booking/edit/${menu.id}`}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        title="編集"
                      >
                        <Settings size={20} />
                      </Link>
                      <button
                        onClick={() => handleDelete(menu.id)}
                        disabled={deletingId === menu.id}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="削除"
                      >
                        {deletingId === menu.id ? (
                          <Loader2 size={20} className="animate-spin" />
                        ) : (
                          <Trash2 size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 枠管理へのリンク */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link
                      href={`/booking/slots/${menu.id}`}
                      className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <CalendarDays size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">予約枠を管理</p>
                          <p className="text-xs text-gray-500">
                            カレンダーで予約可能な日時を設定
                          </p>
                        </div>
                      </div>
                      <ChevronRight
                        size={20}
                        className="text-gray-400 group-hover:text-gray-600 transition-colors"
                      />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

