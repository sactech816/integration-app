'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock, User, Mail, Calendar } from 'lucide-react';
import { BookingWithDetails, BOOKING_STATUS_LABELS } from '@/types/booking';

// 日付ユーティリティ
const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
};

interface BookingCalendarViewProps {
  bookings: BookingWithDetails[];
  onBookingClick?: (booking: BookingWithDetails) => void;
}

export default function BookingCalendarView({
  bookings,
  onBookingClick,
}: BookingCalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // カレンダーの日付を生成
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const days: (Date | null)[] = [];

    // 月初の曜日まで空白を追加
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // 日付を追加
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push(new Date(year, month, d));
    }

    return days;
  }, [currentMonth]);

  // 日付ごとの予約をマッピング
  const bookingsByDate = useMemo(() => {
    const map: Record<string, BookingWithDetails[]> = {};
    
    bookings.forEach((booking) => {
      if (booking.slot?.start_time) {
        const dateKey = new Date(booking.slot.start_time).toDateString();
        if (!map[dateKey]) map[dateKey] = [];
        map[dateKey].push(booking);
      }
    });
    
    // 各日付の予約を時間順にソート
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => {
        const timeA = a.slot?.start_time ? new Date(a.slot.start_time).getTime() : 0;
        const timeB = b.slot?.start_time ? new Date(b.slot.start_time).getTime() : 0;
        return timeA - timeB;
      });
    });
    
    return map;
  }, [bookings]);

  // 選択日の予約
  const selectedDateBookings = useMemo(() => {
    if (!selectedDate) return [];
    return bookingsByDate[selectedDate.toDateString()] || [];
  }, [selectedDate, bookingsByDate]);

  // 前月へ
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // 次月へ
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // 今月へ
  const goToThisMonth = () => {
    setCurrentMonth(new Date());
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* カレンダー */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900">
              {currentMonth.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
            </h3>
            <button
              onClick={goToThisMonth}
              className="px-3 py-1 text-sm font-semibold rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
            >
              今月
            </button>
          </div>
          
          <button
            onClick={nextMonth}
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

            // 予約のステータスごとにカウント
            const confirmedCount = dayBookings.filter(b => b.status === 'ok').length;
            const cancelledCount = dayBookings.filter(b => b.status === 'cancelled').length;

            return (
              <button
                key={dateKey}
                onClick={() => setSelectedDate(date)}
                className={`aspect-square p-1 border-b border-r border-gray-100 transition-all relative flex flex-col items-center justify-start ${
                  isSelected
                    ? 'bg-blue-500 text-white shadow-lg'
                    : hasBookings
                      ? 'hover:bg-blue-50 cursor-pointer'
                      : 'hover:bg-gray-50 cursor-pointer'
                } ${dayOfWeek === 0 && !isSelected ? 'bg-red-50/50' : ''} ${dayOfWeek === 6 && !isSelected ? 'bg-blue-50/50' : ''}`}
              >
                {/* 日付 */}
                <div
                  className={`text-sm font-semibold mt-1 ${
                    isSelected
                      ? 'text-white'
                      : isToday
                        ? 'text-blue-600'
                        : dayOfWeek === 0
                          ? 'text-red-500'
                          : dayOfWeek === 6
                            ? 'text-blue-500'
                            : 'text-gray-700'
                  }`}
                >
                  {date.getDate()}
                </div>

                {/* 予約情報 */}
                {hasBookings && (
                  <div className="mt-auto mb-1 flex flex-col items-center">
                    <div
                      className={`w-2 h-2 rounded-full mb-1 ${
                        isSelected ? 'bg-white' : 'bg-blue-500'
                      }`}
                    />
                    <div className={`text-[10px] font-semibold ${
                      isSelected ? 'text-white/80' : 'text-blue-600'
                    }`}>
                      {confirmedCount > 0 && `${confirmedCount}件`}
                      {cancelledCount > 0 && (
                        <span className={isSelected ? 'text-white/60' : 'text-gray-400'}>
                          {confirmedCount > 0 ? '+' : ''}{cancelledCount}取消
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* 凡例 */}
        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>予約あり</span>
          </div>
        </div>
      </div>

      {/* 選択日の予約詳細 */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        {selectedDate ? (
          <>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {selectedDate.toLocaleDateString('ja-JP', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'short'
              })}
            </h3>
            
            {selectedDateBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={40} className="mx-auto mb-3 opacity-50" />
                <p>この日の予約はありません</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {selectedDateBookings.map((booking) => {
                  const isPast = booking.slot?.start_time && new Date(booking.slot.start_time) < new Date();
                  
                  return (
                    <div
                      key={booking.id}
                      onClick={() => onBookingClick?.(booking)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        booking.status === 'cancelled'
                          ? 'border-red-200 bg-red-50 opacity-60'
                          : isPast
                            ? 'border-gray-200 bg-gray-50'
                            : 'border-green-200 bg-green-50 hover:border-green-300'
                      }`}
                    >
                      {/* 時間 */}
                      {booking.slot && (
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-2">
                          <Clock size={16} className="text-blue-600" />
                          {formatTime(booking.slot.start_time)} - {formatTime(booking.slot.end_time)}
                        </div>
                      )}

                      {/* メニュー名 */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          {booking.menu?.title || 'メニュー'}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                          booking.status === 'ok'
                            ? 'bg-green-100 text-green-700'
                            : booking.status === 'cancelled'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {BOOKING_STATUS_LABELS[booking.status]}
                        </span>
                      </div>

                      {/* 予約者情報 */}
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <User size={12} />
                          <span>{booking.guest_name || '(ログインユーザー)'}</span>
                        </div>
                        {booking.guest_email && (
                          <div className="flex items-center gap-1">
                            <Mail size={12} />
                            <span className="truncate">{booking.guest_email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Calendar size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-medium">日付を選択してください</p>
            <p className="text-sm mt-1">カレンダーから日付をクリック</p>
          </div>
        )}
      </div>
    </div>
  );
}
