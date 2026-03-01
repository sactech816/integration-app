'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { BookingSlotWithAvailability } from '@/types/booking';
import { LocalSlot } from './WeeklyCalendar';

// 日付ユーティリティ
const formatDate = (date: Date) => {
  return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
};

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

interface MonthlyCalendarProps {
  slots: BookingSlotWithAvailability[];
  localSlots?: LocalSlot[];
  selectedDates?: Date[];
  onDateClick?: (date: Date) => void;
  onDateToggle?: (date: Date) => void; // 複数選択モード用
  multiSelect?: boolean;
  readOnly?: boolean;
  menuType?: 'reservation' | 'adjustment';
}

export default function MonthlyCalendar({
  slots,
  localSlots = [],
  selectedDates = [],
  onDateClick,
  onDateToggle,
  multiSelect = false,
  readOnly = false,
  menuType = 'reservation',
}: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

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

  // 日付ごとの枠数を計算
  const slotsByDate = useMemo(() => {
    const map: Record<string, { saved: BookingSlotWithAvailability[]; local: LocalSlot[] }> = {};
    
    slots.forEach((slot) => {
      const dateKey = new Date(slot.start_time).toDateString();
      if (!map[dateKey]) map[dateKey] = { saved: [], local: [] };
      map[dateKey].saved.push(slot);
    });
    
    localSlots.forEach((slot) => {
      const dateKey = slot.date.toDateString();
      if (!map[dateKey]) map[dateKey] = { saved: [], local: [] };
      map[dateKey].local.push(slot);
    });
    
    return map;
  }, [slots, localSlots]);

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

  // テーマカラー
  const themeColor = menuType === 'adjustment' ? 'purple' : 'blue';

  // 今月の空き枠数（readOnlyモードのみ）
  const monthAvailableCount = useMemo(() => {
    if (!readOnly) return 0;
    const now = new Date();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return slots.filter((slot) => {
      const d = new Date(slot.start_time);
      return slot.is_available && d >= now &&
        d.getFullYear() === year && d.getMonth() === month;
    }).length;
  }, [slots, currentMonth, readOnly]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* ヘッダー: 月ナビゲーション */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="前月"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>

        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-900">
            {currentMonth.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
          </h3>
          <button
            onClick={goToThisMonth}
            className={`px-3 py-1 text-sm font-semibold rounded-lg transition-colors ${
              menuType === 'adjustment'
                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }`}
          >
            今月
          </button>
          {readOnly && monthAvailableCount > 0 && (
            <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              空き{monthAvailableCount}件
            </span>
          )}
        </div>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="次月"
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
          const dayData = slotsByDate[dateKey];
          const savedSlots = dayData?.saved || [];
          const localSlotsForDay = dayData?.local || [];
          const totalSlots = savedSlots.length + localSlotsForDay.length;
          const hasSlots = totalSlots > 0;
          const isPast = date < today;
          const isToday = isSameDay(date, new Date());
          const isSelected = selectedDates.some(d => isSameDay(d, date));
          const dayOfWeek = date.getDay();

          // 予約モードでは空き枠数を計算
          const availableCount = menuType === 'reservation' 
            ? savedSlots.reduce((sum, slot) => sum + (slot.remaining_capacity || 0), 0)
            : totalSlots;

          return (
            <button
              key={dateKey}
              onClick={() => {
                if (isPast || readOnly) return;
                if (multiSelect && onDateToggle) {
                  onDateToggle(date);
                } else if (onDateClick) {
                  onDateClick(date);
                }
              }}
              disabled={isPast || readOnly}
              className={`aspect-square p-1 border-b border-r border-gray-100 transition-all relative flex flex-col items-center justify-start ${
                isPast
                  ? 'opacity-40 cursor-not-allowed bg-gray-50'
                  : isSelected
                    ? menuType === 'adjustment'
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-blue-500 text-white shadow-lg'
                    : readOnly
                      ? 'bg-white'
                      : menuType === 'adjustment'
                        ? 'hover:bg-purple-50 cursor-pointer'
                        : 'hover:bg-blue-50 cursor-pointer'
              } ${dayOfWeek === 0 && !isSelected ? 'bg-red-50/50' : ''} ${dayOfWeek === 6 && !isSelected ? 'bg-blue-50/50' : ''}`}
            >
              {/* 日付 */}
              <div
                className={`text-sm font-semibold mt-1 ${
                  isSelected
                    ? 'text-white'
                    : isToday
                      ? menuType === 'adjustment' ? 'text-purple-600' : 'text-blue-600'
                      : dayOfWeek === 0
                        ? 'text-red-500'
                        : dayOfWeek === 6
                          ? 'text-blue-500'
                          : 'text-gray-700'
                }`}
              >
                {date.getDate()}
              </div>

              {/* 選択チェックマーク */}
              {isSelected && multiSelect && (
                <div className="absolute top-1 right-1">
                  <Check size={12} className="text-white" />
                </div>
              )}

              {/* 枠情報 */}
              {hasSlots && (
                <>
                  <div
                    className={`absolute bottom-2 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                      isSelected 
                        ? 'bg-white' 
                        : menuType === 'adjustment'
                          ? 'bg-purple-500'
                          : 'bg-green-500'
                    }`}
                  />
                  <div
                    className={`text-[10px] font-semibold mt-auto mb-3 ${
                      isSelected 
                        ? 'text-white/80' 
                        : menuType === 'adjustment'
                          ? 'text-purple-600'
                          : 'text-green-600'
                    }`}
                  >
                    {menuType === 'reservation' ? `空${availableCount}` : `${totalSlots}枠`}
                  </div>
                </>
              )}

              {/* 未保存の枠がある場合のインジケーター */}
              {localSlotsForDay.length > 0 && (
                <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-orange-400 border border-white" title="未保存の枠あり" />
              )}
            </button>
          );
        })}
      </div>

      {/* フッター: 凡例 */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center gap-4 text-xs text-gray-600">
        {menuType === 'reservation' ? (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span>空きあり</span>
          </div>
        ) : (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span>日程候補あり</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-orange-400" />
          <span>未保存あり</span>
        </div>
        {multiSelect && (
          <div className="flex items-center gap-1 ml-auto">
            <span className="text-gray-500">クリックで複数選択</span>
          </div>
        )}
      </div>
    </div>
  );
}
