'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Plus,
  Edit,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Clock,
  Users,
  CalendarDays,
  List,
  LayoutGrid,
  User,
  Mail,
  XCircle,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  Download,
} from 'lucide-react';
import {
  BookingMenu,
  BookingWithDetails,
  BOOKING_STATUS_LABELS,
  AttendanceTableData,
  AttendanceStatus,
  ATTENDANCE_STATUS_ICONS,
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_LABELS,
} from '@/types/booking';
import {
  getBookingMenus,
  getBookingsByMenu,
  cancelBooking,
  getScheduleAdjustments,
  getAllBookingsForUser,
  getAllAdjustmentsForUser,
} from '@/app/actions/booking';

type BookingListProps = {
  userId: string;
  isAdmin: boolean;
};

type MainTab = 'menus' | 'bookings' | 'adjustments';
type BookingViewMode = 'list' | 'calendar';

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

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

export default function BookingList({ userId, isAdmin }: BookingListProps) {
  const router = useRouter();
  const [menus, setMenus] = useState<BookingMenu[]>([]);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // タブ状態
  const [mainTab, setMainTab] = useState<MainTab>('menus');
  const [bookingViewMode, setBookingViewMode] = useState<BookingViewMode>('list');

  // カレンダー状態
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // 日程調整用の状態
  const [adjustmentData, setAdjustmentData] = useState<Record<string, AttendanceTableData>>({});
  const [loadingAdjustments, setLoadingAdjustments] = useState(false);

  // エクスポート状態
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const loadMenus = async () => {
      setLoading(true);
      try {
        const data = await getBookingMenus(userId);
        setMenus(data);
      } catch (error) {
        console.error('予約メニュー取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadMenus();
    }
  }, [userId]);

  // メニュー読み込み完了後に予約・出欠データを事前読み込み（一括取得API使用）
  useEffect(() => {
    if (menus.length === 0) return;

    // 一括取得APIで高速に事前読み込み
    const preloadData = async () => {
      // 予約データと出欠データを並列で一括取得
      const [allBookings, allAdjustments] = await Promise.all([
        getAllBookingsForUser(userId),
        getAllAdjustmentsForUser(userId),
      ]);

      // 予約データをセット（日時でソート）
      if (allBookings.length > 0) {
        allBookings.sort((a, b) => {
          const dateA = a.slot?.start_time ? new Date(a.slot.start_time).getTime() : 0;
          const dateB = b.slot?.start_time ? new Date(b.slot.start_time).getTime() : 0;
          return dateB - dateA;
        });
        setBookings(allBookings);
      }

      // 出欠データをセット
      if (Object.keys(allAdjustments).length > 0) {
        setAdjustmentData(allAdjustments);
      }
    };

    preloadData();
  }, [menus, userId]);

  // 予約一覧を読み込み（一括取得API使用）
  const loadAllBookings = async () => {
    setLoadingBookings(true);
    
    // 一括取得APIで高速に取得
    const allBookings = await getAllBookingsForUser(userId);

    // 日時でソート（新しい順）
    allBookings.sort((a, b) => {
      const dateA = a.slot?.start_time ? new Date(a.slot.start_time).getTime() : 0;
      const dateB = b.slot?.start_time ? new Date(b.slot.start_time).getTime() : 0;
      return dateB - dateA;
    });

    setBookings(allBookings);
    setLoadingBookings(false);
  };

  // 出欠表データを読み込み（一括取得API使用）
  const loadAllAdjustments = async () => {
    setLoadingAdjustments(true);

    // 一括取得APIで高速に取得
    const dataMap = await getAllAdjustmentsForUser(userId);

    setAdjustmentData(dataMap);
    setLoadingAdjustments(false);
  };

  // タブ切り替え時のデータ読み込み
  const handleTabChange = async (tab: MainTab) => {
    setMainTab(tab);

    if (tab === 'bookings' && bookings.length === 0) {
      await loadAllBookings();
    } else if (tab === 'adjustments' && Object.keys(adjustmentData).length === 0) {
      await loadAllAdjustments();
    }
  };

  const handleCopyUrl = (menuId: string) => {
    const url = `${window.location.origin}/booking/${menuId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(menuId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('この予約をキャンセルしますか？')) return;

    setCancellingId(bookingId);
    const result = await cancelBooking(bookingId, userId);

    if (result.success) {
      setBookings(bookings.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
    } else {
      alert('キャンセルに失敗しました');
    }

    setCancellingId(null);
  };

  // Excelエクスポート
  const handleExportBookings = async () => {
    setExporting(true);
    try {
      const response = await fetch(`/api/booking/export?userId=${userId}`);
      if (!response.ok) {
        throw new Error('エクスポートに失敗しました');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `予約一覧_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
      alert('エクスポートに失敗しました');
    } finally {
      setExporting(false);
    }
  };

  const getMenuTypeLabel = (type: string) => {
    return type === 'adjustment' ? '日程調整' : '予約受付';
  };

  const getMenuTypeColor = (type: string) => {
    return type === 'adjustment'
      ? 'bg-purple-100 text-purple-700'
      : 'bg-blue-100 text-blue-700';
  };

  // カレンダー用の日付ごとの予約
  const bookingsByDate = useMemo(() => {
    const map: Record<string, BookingWithDetails[]> = {};
    bookings.forEach((booking) => {
      if (booking.slot?.start_time) {
        const dateKey = new Date(booking.slot.start_time).toDateString();
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(booking);
      }
    });
    return map;
  }, [bookings]);

  // カレンダーの日付を生成
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: (Date | null)[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }
    return days;
  }, [currentMonth]);

  // 選択日の予約
  const selectedDateBookings = useMemo(() => {
    if (!selectedDate) return [];
    return (bookingsByDate[selectedDate.toDateString()] || [])
      .sort((a, b) => {
        const timeA = a.slot?.start_time ? new Date(a.slot.start_time).getTime() : 0;
        const timeB = b.slot?.start_time ? new Date(b.slot.start_time).getTime() : 0;
        return timeA - timeB;
      });
  }, [selectedDate, bookingsByDate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4 flex items-center gap-2">
          <Calendar size={20} className="text-blue-600" />
          予約・日程調整
          {isAdmin && (
            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">ADMIN</span>
          )}
        </h2>
        <button
          onClick={() => router.push('/booking/new')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center gap-2"
        >
          <Plus size={16} /> 新規作成
        </button>
      </div>

      {/* タブ切り替え */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1 mb-6">
        <div className="flex gap-1">
          <button
            onClick={() => handleTabChange('menus')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              mainTab === 'menus'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <FolderOpen size={16} />
            メニュー
          </button>
          <button
            onClick={() => handleTabChange('bookings')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              mainTab === 'bookings'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Calendar size={16} />
            予約一覧
          </button>
          <button
            onClick={() => handleTabChange('adjustments')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              mainTab === 'adjustments'
                ? 'bg-purple-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Users size={16} />
            出欠表
          </button>
        </div>
      </div>

      {/* メニュー一覧タブ */}
      {mainTab === 'menus' && (
        <>
          {menus.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-4">まだ予約メニューを作成していません</p>
              <button
                onClick={() => router.push('/booking/new')}
                className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700"
              >
                新規作成する
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* カードヘッダー */}
                  <div className={`p-4 ${menu.type === 'adjustment' ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${getMenuTypeColor(menu.type)}`}>
                        {getMenuTypeLabel(menu.type)}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        menu.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {menu.is_active ? '公開中' : '非公開'}
                      </span>
                    </div>
                  </div>

                  {/* カードコンテンツ */}
                  <div className="p-4">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{menu.title}</h3>
                    {menu.description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{menu.description}</p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {menu.duration_min}分
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarDays size={12} />
                        {menu.created_at ? new Date(menu.created_at).toLocaleDateString('ja-JP') : '-'}
                      </span>
                    </div>

                    {/* URL表示とコピー */}
                    <div className="mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={`${typeof window !== 'undefined' ? window.location.origin : ''}/booking/${menu.id}`}
                          readOnly
                          className="flex-1 text-xs bg-transparent border-none outline-none text-gray-600 truncate"
                        />
                        <button
                          onClick={() => handleCopyUrl(menu.id)}
                          className="text-indigo-600 hover:text-indigo-700 p-1"
                        >
                          {copiedId === menu.id ? (
                            <Check size={14} className="text-green-500" />
                          ) : (
                            <Copy size={14} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/booking/edit/${menu.id}`)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <Edit size={14} /> 編集
                      </button>
                      <button
                        onClick={() => window.open(`/booking/${menu.id}`, '_blank')}
                        className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <ExternalLink size={14} /> プレビュー
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* 予約一覧タブ */}
      {mainTab === 'bookings' && (
        <>
          {/* 表示モード切り替え & エクスポート */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 mb-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">表示:</span>
                <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setBookingViewMode('list')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                      bookingViewMode === 'list'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <List size={14} />
                    リスト
                  </button>
                  <button
                    onClick={() => setBookingViewMode('calendar')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                      bookingViewMode === 'calendar'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <LayoutGrid size={14} />
                    カレンダー
                  </button>
                </div>
              </div>

              {/* Excelエクスポートボタン */}
              <button
                onClick={handleExportBookings}
                disabled={exporting || bookings.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exporting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                Excel出力
              </button>
            </div>
          </div>

          {loadingBookings ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : bookingViewMode === 'calendar' ? (
            /* カレンダー表示 */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* カレンダーヘッダー */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={20} className="text-gray-600" />
                  </button>
                  <h3 className="text-lg font-bold text-gray-900">
                    {currentMonth.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                  </h3>
                  <button
                    onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ChevronRight size={20} className="text-gray-600" />
                  </button>
                </div>

                {/* 曜日ヘッダー */}
                <div className="grid grid-cols-7 border-b border-gray-200">
                  {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                    <div
                      key={day}
                      className={`text-center text-sm font-semibold py-2 bg-gray-50 ${
                        i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-600'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* カレンダー本体 */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="aspect-square border-b border-r border-gray-100" />;
                    }

                    const dateKey = date.toDateString();
                    const dayBookings = bookingsByDate[dateKey] || [];
                    const hasBookings = dayBookings.length > 0;
                    const isToday = isSameDay(date, new Date());
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const dayOfWeek = date.getDay();
                    const confirmedCount = dayBookings.filter(b => b.status === 'ok').length;

                    return (
                      <button
                        key={dateKey}
                        onClick={() => setSelectedDate(date)}
                        className={`aspect-square p-1 border-b border-r border-gray-100 transition-all flex flex-col items-center justify-start ${
                          isSelected
                            ? 'bg-blue-500 text-white'
                            : hasBookings
                              ? 'hover:bg-blue-50 cursor-pointer'
                              : 'hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        <div className={`text-sm font-semibold mt-1 ${
                          isSelected ? 'text-white' : isToday ? 'text-blue-600' : dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : 'text-gray-700'
                        }`}>
                          {date.getDate()}
                        </div>
                        {hasBookings && (
                          <div className={`text-[10px] font-semibold mt-auto mb-1 ${isSelected ? 'text-white/80' : 'text-blue-600'}`}>
                            {confirmedCount}件
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 選択日の予約詳細 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                {selectedDate ? (
                  <>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">
                      {selectedDate.toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
                    </h3>
                    {selectedDateBookings.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Calendar size={32} className="mx-auto mb-2 opacity-50" />
                        <p>この日の予約はありません</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[400px] overflow-y-auto">
                        {selectedDateBookings.map((booking) => (
                          <div key={booking.id} className={`p-3 rounded-lg border ${booking.status === 'cancelled' ? 'border-red-200 bg-red-50 opacity-60' : 'border-green-200 bg-green-50'}`}>
                            {booking.slot && (
                              <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-1">
                                <Clock size={14} className="text-blue-600" />
                                {formatTime(booking.slot.start_time)} - {formatTime(booking.slot.end_time)}
                              </div>
                            )}
                            <div className="text-xs text-gray-600">
                              <div className="flex items-center gap-1">
                                <User size={12} />
                                {booking.guest_name || '(ログインユーザー)'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Calendar size={40} className="mx-auto mb-3 opacity-50" />
                    <p>日付を選択してください</p>
                  </div>
                )}
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">まだ予約がありません</p>
            </div>
          ) : (
            /* リスト表示 */
            <div className="space-y-3">
              {bookings.map((booking) => {
                const isPast = booking.slot?.start_time && new Date(booking.slot.start_time) < new Date();

                return (
                  <div
                    key={booking.id}
                    className={`bg-white rounded-xl shadow-sm border p-4 ${
                      booking.status === 'cancelled'
                        ? 'border-red-200 opacity-60'
                        : isPast
                          ? 'border-gray-200'
                          : 'border-green-200'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                            {booking.menu?.title || 'メニュー'}
                          </span>
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                            booking.status === 'ok' ? 'bg-green-100 text-green-700' : booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {BOOKING_STATUS_LABELS[booking.status]}
                          </span>
                        </div>

                        {booking.slot && (
                          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                            <Clock size={16} className="text-blue-600" />
                            {formatDateTime(booking.slot.start_time)}
                          </div>
                        )}

                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <User size={12} />
                            {booking.guest_name || '(ログインユーザー)'}
                          </div>
                          {booking.guest_email && (
                            <div className="flex items-center gap-1">
                              <Mail size={12} />
                              {booking.guest_email}
                            </div>
                          )}
                        </div>
                      </div>

                      {booking.status === 'ok' && !isPast && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                          className="px-3 py-1.5 border border-red-300 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-1"
                        >
                          {cancellingId === booking.id ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <XCircle size={12} />
                          )}
                          キャンセル
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 出欠表タブ */}
      {mainTab === 'adjustments' && (
        <>
          {loadingAdjustments ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-purple-600" size={32} />
            </div>
          ) : Object.keys(adjustmentData).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
              <Users size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 mb-2">日程調整の回答がありません</p>
              <p className="text-xs text-gray-400">日程調整メニューを作成して、参加者に回答してもらいましょう</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(adjustmentData).map(([menuId, data]) => {
                const menu = menus.find(m => m.id === menuId);
                if (!menu) return null;

                return (
                  <div key={menuId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{menu.title}</h3>
                        {menu.description && (
                          <p className="text-sm text-gray-500 mt-1">{menu.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => window.open(`/booking/${menu.id}`, '_blank')}
                        className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold hover:bg-purple-200 transition-colors"
                      >
                        公開ページ
                      </button>
                    </div>

                    {data.slots.length === 0 ? (
                      <p className="text-center py-4 text-gray-500 text-sm">日程候補が設定されていません</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                          <thead>
                            <tr className="border-b-2 border-gray-200">
                              <th className="text-left p-2 font-semibold text-gray-700 sticky left-0 bg-white z-10 min-w-[100px]">
                                参加者
                              </th>
                              {data.slots.map((slotSummary) => (
                                <th
                                  key={slotSummary.slot_id}
                                  className={`text-center p-2 font-semibold text-gray-700 border-l border-gray-200 min-w-[80px] ${
                                    data.best_slot_id === slotSummary.slot_id ? 'bg-green-50' : ''
                                  }`}
                                >
                                  <div className="text-xs">
                                    {new Date(slotSummary.slot.start_time).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                                  </div>
                                  <div className="text-[10px] text-gray-500">
                                    {formatTime(slotSummary.slot.start_time)}
                                  </div>
                                  {data.best_slot_id === slotSummary.slot_id && (
                                    <div className="text-[10px] text-green-600 font-bold">★候補</div>
                                  )}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {data.participants.map((participant) => (
                              <tr key={participant.id} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="p-2 font-medium text-gray-900 sticky left-0 bg-white z-10">
                                  {participant.participant_name}
                                </td>
                                {data.slots.map((slotSummary) => {
                                  const status = participant.responses[slotSummary.slot_id] as AttendanceStatus | undefined;
                                  const statusConfig = status ? ATTENDANCE_STATUS_COLORS[status] : { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-200' };
                                  const icon = status ? ATTENDANCE_STATUS_ICONS[status] : '-';

                                  return (
                                    <td
                                      key={slotSummary.slot_id}
                                      className={`text-center p-2 border-l border-gray-200 ${statusConfig.bg} ${statusConfig.text}`}
                                    >
                                      <span className="text-lg font-bold">{icon}</span>
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                            {data.participants.length === 0 && (
                              <tr>
                                <td colSpan={data.slots.length + 1} className="p-4 text-center text-gray-500">
                                  まだ回答がありません
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
