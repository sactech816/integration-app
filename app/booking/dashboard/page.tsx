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
import {
  BookingMenu,
  BookingWithDetails,
  BOOKING_STATUS_LABELS,
  AttendanceTableData,
  AttendanceStatus,
  ATTENDANCE_STATUS_ICONS,
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_LABELS,
  ScheduleAdjustmentWithDetails,
} from '@/types/booking';
import {
  getBookingMenus,
  getBookingsByMenu,
  cancelBooking,
  getScheduleAdjustments,
  getScheduleAdjustmentsByMenu,
} from '@/app/actions/booking';

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

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' });
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
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

  // 日程調整用の状態
  const [viewMode, setViewMode] = useState<'bookings' | 'adjustments'>('bookings');
  const [adjustmentData, setAdjustmentData] = useState<Record<string, AttendanceTableData>>({});
  const [loadingAdjustments, setLoadingAdjustments] = useState(false);

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

      // 日程調整メニューの出欠表データを取得
      const adjustmentMenus = menusData.filter(m => m.type === 'adjustment');
      if (adjustmentMenus.length > 0) {
        await loadAllAdjustments(adjustmentMenus);
      }

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

  const loadAllAdjustments = async (adjustmentMenus: BookingMenu[]) => {
    setLoadingAdjustments(true);
    const dataMap: Record<string, AttendanceTableData> = {};

    for (const menu of adjustmentMenus) {
      const data = await getScheduleAdjustments(menu.id);
      if (data) {
        dataMap[menu.id] = data;
      }
    }

    setAdjustmentData(dataMap);
    setLoadingAdjustments(false);
  };

  const loadAdjustmentForMenu = async (menuId: string) => {
    if (!user || !menus.find(m => m.id === menuId && m.type === 'adjustment')) return;

    setLoadingAdjustments(true);
    const data = await getScheduleAdjustments(menuId);
    if (data) {
      setAdjustmentData({ [menuId]: data });
    }
    setLoadingAdjustments(false);
  };

  const handleMenuChange = (menuId: string) => {
    setSelectedMenuId(menuId);
    if (viewMode === 'bookings') {
      loadBookingsForMenu(menuId);
    } else {
      if (menuId === 'all') {
        const adjustmentMenus = menus.filter(m => m.type === 'adjustment');
        if (adjustmentMenus.length > 0) {
          loadAllAdjustments(adjustmentMenus);
        }
      } else {
        loadAdjustmentForMenu(menuId);
      }
    }
  };

  const handleViewModeChange = (mode: 'bookings' | 'adjustments') => {
    setViewMode(mode);
    if (mode === 'adjustments') {
      const adjustmentMenus = menus.filter(m => m.type === 'adjustment');
      if (adjustmentMenus.length > 0) {
        loadAllAdjustments(adjustmentMenus);
      }
    } else {
      loadBookingsForMenu(selectedMenuId);
    }
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
      alert('キャンセルに失敗しました: ' + ('error' in result ? result.error : '予約のキャンセルに失敗しました'));
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
              <h1 className="text-xl font-bold text-gray-900">予約・日程調整ダッシュボード</h1>
              <p className="text-xs text-gray-500">予約一覧・日程調整管理</p>
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

        {/* ビューモード切り替え */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">表示モード:</span>
              <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleViewModeChange('bookings')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    viewMode === 'bookings'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  予約
                </button>
                <button
                  onClick={() => handleViewModeChange('adjustments')}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    viewMode === 'adjustments'
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  日程調整
                </button>
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
                <option value="all">
                  {viewMode === 'bookings' ? 'すべてのメニュー' : 'すべての日程調整'}
                </option>
                {menus
                  .filter(m => viewMode === 'bookings' ? m.type === 'reservation' : m.type === 'adjustment')
                  .map(menu => (
                    <option key={menu.id} value={menu.id}>{menu.title}</option>
                  ))}
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>

            {viewMode === 'bookings' && (
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
            )}
          </div>
        </div>

        {/* コンテンツ表示 */}
        {viewMode === 'adjustments' ? (
          /* 日程調整: 出欠表表示 */
          loadingAdjustments ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
            </div>
          ) : Object.keys(adjustmentData).length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">日程調整がありません</h3>
              <p className="text-gray-600">
                {menus.filter(m => m.type === 'adjustment').length === 0
                  ? '日程調整メニューを作成して、出欠確認を受け付けましょう。'
                  : 'まだ出欠が登録されていません。'}
              </p>
              {menus.filter(m => m.type === 'adjustment').length === 0 && (
                <Link
                  href="/booking/new"
                  className="inline-flex items-center gap-2 mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  メニューを作成
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(adjustmentData).map(([menuId, data]) => {
                const menu = menus.find(m => m.id === menuId);
                if (!menu) return null;

                return (
                  <div key={menuId} className="bg-white rounded-xl shadow-lg p-6">
                    <div className="mb-4">
                      <h2 className="text-xl font-bold text-gray-900">{menu.title}</h2>
                      {menu.description && (
                        <p className="text-sm text-gray-600 mt-1">{menu.description}</p>
                      )}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b-2 border-gray-200">
                            <th className="text-left p-3 font-semibold text-gray-700 sticky left-0 bg-white z-10 min-w-[120px]">
                              参加者
                            </th>
                            {data.slots.map((slotSummary) => (
                              <th
                                key={slotSummary.slot_id}
                                className={`text-center p-3 font-semibold text-gray-700 border-l border-gray-200 ${
                                  data.best_slot_id === slotSummary.slot_id
                                    ? 'bg-green-50 border-green-300'
                                    : ''
                                }`}
                              >
                                <div className="text-sm">
                                  {formatDate(slotSummary.slot.start_time)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {formatTime(slotSummary.slot.start_time)} - {formatTime(slotSummary.slot.end_time)}
                                </div>
                                {data.best_slot_id === slotSummary.slot_id && (
                                  <div className="text-xs text-green-600 font-bold mt-1">★ 候補</div>
                                )}
                                <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                                  <span className="text-green-600">{slotSummary.yes_count}○</span> /{' '}
                                  <span className="text-red-600">{slotSummary.no_count}×</span> /{' '}
                                  <span className="text-yellow-600">{slotSummary.maybe_count}△</span>
                                  <div className="mt-1">
                                    ({slotSummary.available_count}名参加可能)
                                  </div>
                                </div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {data.participants.map((participant) => (
                            <tr key={participant.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="p-3 font-medium text-gray-900 sticky left-0 bg-white z-10">
                                <div>{participant.participant_name}</div>
                                {participant.participant_email && (
                                  <div className="text-xs text-gray-500">{participant.participant_email}</div>
                                )}
                              </td>
                              {data.slots.map((slotSummary) => {
                                const status = participant.responses[slotSummary.slot_id] as AttendanceStatus | undefined;
                                const statusConfig = status ? ATTENDANCE_STATUS_COLORS[status] : { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-200' };
                                const icon = status ? ATTENDANCE_STATUS_ICONS[status] : '-';
                                const label = status ? ATTENDANCE_STATUS_LABELS[status] : '未回答';

                                return (
                                  <td
                                    key={slotSummary.slot_id}
                                    className={`text-center p-3 border-l border-gray-200 ${statusConfig.bg} ${statusConfig.text}`}
                                    title={label}
                                  >
                                    <span className="text-xl font-bold">{icon}</span>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                          {data.participants.length === 0 && (
                            <tr>
                              <td colSpan={data.slots.length + 1} className="p-8 text-center text-gray-500">
                                まだ出欠が登録されていません
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : loadingBookings ? (
          /* 予約: 一覧表示 */
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">予約がありません</h3>
            <p className="text-gray-600">
              {menus.filter(m => m.type === 'reservation').length === 0
                ? '予約メニューを作成して、予約を受け付けましょう。'
                : 'まだ予約が入っていません。'}
            </p>
            {menus.filter(m => m.type === 'reservation').length === 0 && (
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

