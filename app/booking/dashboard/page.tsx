'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  ArrowLeft,
  Loader2,
  Clock,
  User,
  Mail,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronDown,
  Filter,
  CalendarDays,
  Users,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BookingMenu, BookingWithDetails, BOOKING_STATUS_LABELS } from '@/types/booking';
import { getBookingMenus, getBookingsByMenu, cancelBooking } from '@/app/actions/booking';

// 日時フォーマット
const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function BookingDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [menus, setMenus] = useState<BookingMenu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string>('all');
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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

      setUser({ id: user.id });
      
      // メニュー一覧を取得
      const menusData = await getBookingMenus(user.id);
      setMenus(menusData);
      
      // 全メニューの予約を取得
      await loadAllBookings(user.id, menusData);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const loadAllBookings = async (userId: string, menusList: BookingMenu[]) => {
    setLoadingBookings(true);
    const allBookings: BookingWithDetails[] = [];
    
    for (const menu of menusList) {
      const menuBookings = await getBookingsByMenu(menu.id, userId);
      allBookings.push(...menuBookings);
    }
    
    // 日時でソート（新しい順）
    allBookings.sort((a, b) => {
      const dateA = a.slot?.start_time ? new Date(a.slot.start_time).getTime() : 0;
      const dateB = b.slot?.start_time ? new Date(b.slot.start_time).getTime() : 0;
      return dateB - dateA;
    });
    
    setBookings(allBookings);
    setLoadingBookings(false);
  };

  const loadBookingsForMenu = async (menuId: string) => {
    if (!user) return;
    
    setLoadingBookings(true);
    
    if (menuId === 'all') {
      await loadAllBookings(user.id, menus);
    } else {
      const menuBookings = await getBookingsByMenu(menuId, user.id);
      setBookings(menuBookings);
    }
    
    setLoadingBookings(false);
  };

  const handleMenuChange = (menuId: string) => {
    setSelectedMenuId(menuId);
    loadBookingsForMenu(menuId);
  };

  const handleCancel = async (bookingId: string) => {
    if (!user || !confirm('この予約をキャンセルしますか？')) return;
    
    setCancellingId(bookingId);
    const result = await cancelBooking(bookingId, user.id);
    
    if (result.success) {
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
    } else {
      alert('キャンセルに失敗しました: ' + result.error);
    }
    
    setCancellingId(null);
  };

  // フィルター適用
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      if (statusFilter !== 'all' && booking.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [bookings, statusFilter]);

  // 統計
  const stats = useMemo(() => {
    const now = new Date();
    const upcoming = bookings.filter(b => 
      b.status === 'ok' && b.slot?.start_time && new Date(b.slot.start_time) > now
    ).length;
    const completed = bookings.filter(b => 
      b.status === 'ok' && b.slot?.start_time && new Date(b.slot.start_time) <= now
    ).length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    
    return { upcoming, completed, cancelled, total: bookings.length };
  }, [bookings]);

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
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/booking"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <CalendarDays className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">予約ダッシュボード</h1>
              <p className="text-xs text-gray-500">予約一覧・管理</p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.upcoming}</p>
                <p className="text-xs text-gray-500">今後の予約</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                <p className="text-xs text-gray-500">完了済み</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
                <p className="text-xs text-gray-500">キャンセル</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs text-gray-500">総予約数</p>
              </div>
            </div>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">フィルター:</span>
            </div>
            
            <div className="relative">
              <select
                value={selectedMenuId}
                onChange={(e) => handleMenuChange(e.target.value)}
                className="appearance-none bg-gray-100 border-0 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべてのメニュー</option>
                {menus.map(menu => (
                  <option key={menu.id} value={menu.id}>{menu.title}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none bg-gray-100 border-0 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">すべてのステータス</option>
                <option value="ok">確定</option>
                <option value="pending">保留中</option>
                <option value="cancelled">キャンセル</option>
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* 予約一覧 */}
        {loadingBookings ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">予約がありません</h3>
            <p className="text-gray-600">
              {menus.length === 0 
                ? '予約メニューを作成して、予約を受け付けましょう。'
                : 'まだ予約が入っていません。'}
            </p>
            {menus.length === 0 && (
              <Link
                href="/booking/new"
                className="inline-flex items-center gap-2 mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                メニューを作成
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => {
              const isPast = booking.slot?.start_time && new Date(booking.slot.start_time) < new Date();
              
              return (
                <div
                  key={booking.id}
                  className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${
                    booking.status === 'cancelled'
                      ? 'border-red-500 opacity-60'
                      : isPast
                      ? 'border-gray-300'
                      : 'border-green-500'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      {/* メニュー名 */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          {booking.menu?.title || 'メニュー'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          booking.status === 'ok'
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {BOOKING_STATUS_LABELS[booking.status]}
                        </span>
                        {isPast && booking.status === 'ok' && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded">
                            完了
                          </span>
                        )}
                      </div>

                      {/* 日時 */}
                      {booking.slot && (
                        <div className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-3">
                          <Clock size={20} className="text-blue-600" />
                          {formatDateTime(booking.slot.start_time)}
                        </div>
                      )}

                      {/* 予約者情報 */}
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <User size={16} />
                          <span>{booking.guest_name || '(ログインユーザー)'}</span>
                        </div>
                        {booking.guest_email && (
                          <div className="flex items-center gap-2">
                            <Mail size={16} />
                            <span>{booking.guest_email}</span>
                          </div>
                        )}
                        {booking.guest_comment && (
                          <div className="flex items-start gap-2 mt-2">
                            <MessageSquare size={16} className="mt-0.5" />
                            <span className="text-gray-700">{booking.guest_comment}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* アクション */}
                    {booking.status === 'ok' && !isPast && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCancel(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {cancellingId === booking.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <XCircle size={16} />
                          )}
                          キャンセル
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

