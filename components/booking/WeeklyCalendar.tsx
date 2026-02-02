'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Clock, Check } from 'lucide-react';
import { BookingSlotWithAvailability } from '@/types/booking';

// 日付ユーティリティ
const formatDate = (date: Date) => {
  return date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' });
};

const formatWeekday = (date: Date) => {
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  return weekdays[date.getDay()];
};

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

// 週の開始日を取得（月曜始まり）
const getWeekStart = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// 時間文字列をフォーマット
const formatTime = (hour: number) => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

interface LocalSlot {
  id: string;
  date: Date;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  isNew?: boolean; // まだ保存されていない新規枠
  maxCapacity?: number; // 最大予約数
}

interface WeeklyCalendarProps {
  slots: BookingSlotWithAvailability[];
  localSlots?: LocalSlot[]; // ローカル（未保存）の枠
  onSlotClick?: (date: Date, hour: number) => void;
  onSlotDelete?: (slotId: string, isLocal?: boolean) => void;
  durationMin?: number;
  startHour?: number;
  endHour?: number;
  readOnly?: boolean;
  menuType?: 'reservation' | 'adjustment';
  // 複数日選択モード
  multiSelect?: boolean;
  selectedDates?: Date[];
  onDateToggle?: (date: Date) => void;
}

export default function WeeklyCalendar({
  slots,
  localSlots = [],
  onSlotClick,
  onSlotDelete,
  durationMin = 60,
  startHour = 9,
  endHour = 21,
  readOnly = false,
  menuType = 'reservation',
  multiSelect = false,
  selectedDates = [],
  onDateToggle,
}: WeeklyCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => getWeekStart(new Date()));

  // 週の日付を生成
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentWeekStart]);

  // 時間軸を生成
  const hours = useMemo(() => {
    const h: number[] = [];
    for (let i = startHour; i <= endHour; i++) {
      h.push(i);
    }
    return h;
  }, [startHour, endHour]);

  // 日付・時間ごとの枠をマッピング
  const slotMap = useMemo(() => {
    const map: Record<string, BookingSlotWithAvailability[]> = {};
    
    slots.forEach((slot) => {
      const slotDate = new Date(slot.start_time);
      const dateKey = slotDate.toDateString();
      const hour = slotDate.getHours();
      const key = `${dateKey}-${hour}`;
      
      if (!map[key]) map[key] = [];
      map[key].push(slot);
    });
    
    return map;
  }, [slots]);

  // ローカル枠のマッピング
  const localSlotMap = useMemo(() => {
    const map: Record<string, LocalSlot[]> = {};
    
    localSlots.forEach((slot) => {
      const dateKey = slot.date.toDateString();
      const key = `${dateKey}-${slot.startHour}`;
      
      if (!map[key]) map[key] = [];
      map[key].push(slot);
    });
    
    return map;
  }, [localSlots]);

  // 前週へ
  const prevWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  // 次週へ
  const nextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(newStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  // 今週へ
  const goToThisWeek = () => {
    setCurrentWeekStart(getWeekStart(new Date()));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // テーマカラー
  const themeColor = menuType === 'adjustment' ? 'purple' : 'blue';

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* ヘッダー: 週ナビゲーション */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50">
        <button
          onClick={prevWeek}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="前週"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>
        
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-gray-900">
            {weekDays[0].toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
          </h3>
          <button
            onClick={goToThisWeek}
            className={`px-3 py-1 text-sm font-semibold rounded-lg transition-colors bg-${themeColor}-100 text-${themeColor}-700 hover:bg-${themeColor}-200`}
          >
            今週
          </button>
        </div>
        
        <button
          onClick={nextWeek}
          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          title="次週"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {/* カレンダーグリッド */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* 曜日ヘッダー */}
          <div className="grid grid-cols-8 border-b border-gray-200">
            {/* 時間列のヘッダー */}
            <div className="p-2 text-center text-xs font-semibold text-gray-500 bg-gray-50 border-r border-gray-200">
              <Clock size={14} className="mx-auto" />
            </div>
            
            {/* 各曜日 */}
            {weekDays.map((day, index) => {
              const isToday = isSameDay(day, new Date());
              const isPast = day < today;
              const dayOfWeek = day.getDay();
              const isSelected = multiSelect && selectedDates.some(d => isSameDay(d, day));
              
              return (
                <div
                  key={index}
                  onClick={() => {
                    if (multiSelect && !isPast && onDateToggle) {
                      onDateToggle(day);
                    }
                  }}
                  className={`p-2 text-center border-r border-gray-200 last:border-r-0 transition-all ${
                    isSelected
                      ? menuType === 'adjustment'
                        ? 'bg-purple-100 ring-2 ring-purple-400 ring-inset'
                        : 'bg-blue-100 ring-2 ring-blue-400 ring-inset'
                      : isToday 
                        ? menuType === 'adjustment' ? 'bg-purple-50' : 'bg-blue-50'
                        : 'bg-gray-50'
                  } ${isPast ? 'opacity-50' : multiSelect ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                >
                  <div className={`text-xs font-semibold ${
                    dayOfWeek === 0 ? 'text-red-500' : dayOfWeek === 6 ? 'text-blue-500' : 'text-gray-600'
                  }`}>
                    {formatWeekday(day)}
                  </div>
                  <div className={`text-sm font-bold flex items-center justify-center gap-1 ${
                    isSelected
                      ? menuType === 'adjustment' ? 'text-purple-700' : 'text-blue-700'
                      : isToday 
                        ? menuType === 'adjustment' ? 'text-purple-600' : 'text-blue-600'
                        : 'text-gray-900'
                  }`}>
                    {formatDate(day)}
                    {isSelected && <Check size={14} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* 時間グリッド */}
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-100 last:border-b-0">
              {/* 時間ラベル */}
              <div className="p-2 text-center text-xs font-medium text-gray-500 bg-gray-50 border-r border-gray-200 flex items-center justify-center">
                {formatTime(hour)}
              </div>
              
              {/* 各日のセル */}
              {weekDays.map((day, dayIndex) => {
                const dateKey = day.toDateString();
                const cellKey = `${dateKey}-${hour}`;
                const cellSlots = slotMap[cellKey] || [];
                const cellLocalSlots = localSlotMap[cellKey] || [];
                const isPast = day < today || (isSameDay(day, today) && hour <= new Date().getHours());
                const dayOfWeek = day.getDay();
                
                return (
                  <div
                    key={dayIndex}
                    className={`min-h-[60px] p-1 border-r border-gray-100 last:border-r-0 transition-colors ${
                      isPast 
                        ? 'bg-gray-50 cursor-not-allowed' 
                        : readOnly 
                          ? 'bg-white'
                          : `bg-white hover:bg-${themeColor}-50 cursor-pointer`
                    } ${dayOfWeek === 0 ? 'bg-red-50/30' : dayOfWeek === 6 ? 'bg-blue-50/30' : ''}`}
                    onClick={() => {
                      if (!isPast && !readOnly && onSlotClick) {
                        onSlotClick(day, hour);
                      }
                    }}
                  >
                    {/* 既存の枠を表示 */}
                    {cellSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`group relative mb-1 p-1.5 rounded text-xs font-medium ${
                          menuType === 'adjustment'
                            ? 'bg-purple-100 text-purple-700 border border-purple-200'
                            : slot.is_available
                              ? 'bg-green-100 text-green-700 border border-green-200 cursor-pointer hover:bg-green-200'
                              : 'bg-red-100 text-red-700 border border-red-200'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          // readOnlyモードでも、空きのある枠はクリック可能
                          if (readOnly && slot.is_available && onSlotClick) {
                            onSlotClick(day, hour);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span>
                            {new Date(slot.start_time).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {!readOnly && onSlotDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSlotDelete(slot.id, false);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-200 rounded transition-all"
                              title="削除"
                            >
                              <Trash2 size={12} className="text-red-600" />
                            </button>
                          )}
                        </div>
                        {menuType === 'reservation' && (
                          <div className="text-[10px] opacity-75">
                            {slot.current_bookings}/{slot.max_capacity}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {/* ローカル（未保存）の枠を表示 */}
                    {cellLocalSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={`group relative mb-1 p-1.5 rounded text-xs font-medium border-2 border-dashed ${
                          menuType === 'adjustment'
                            ? 'bg-purple-50 text-purple-600 border-purple-300'
                            : 'bg-blue-50 text-blue-600 border-blue-300'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between">
                          <span>
                            {slot.startHour.toString().padStart(2, '0')}:{slot.startMinute.toString().padStart(2, '0')}
                          </span>
                          {!readOnly && onSlotDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSlotDelete(slot.id, true);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-red-200 rounded transition-all"
                              title="削除"
                            >
                              <Trash2 size={12} className="text-red-600" />
                            </button>
                          )}
                        </div>
                        <div className="text-[10px] opacity-75">未保存</div>
                      </div>
                    ))}
                    
                    {/* 空セルにプラスアイコン表示（ホバー時） */}
                    {!isPast && !readOnly && cellSlots.length === 0 && cellLocalSlots.length === 0 && (
                      <div className={`flex items-center justify-center h-full opacity-0 hover:opacity-100 transition-opacity`}>
                        <Plus size={16} className={`text-${themeColor}-400`} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* フッター: 凡例 */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 flex items-center gap-4 text-xs text-gray-600">
        {menuType === 'reservation' ? (
          <>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-100 border border-green-200" />
              <span>空きあり</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-red-100 border border-red-200" />
              <span>満席</span>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-purple-100 border border-purple-200" />
            <span>日程候補</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-50 border-2 border-dashed border-blue-300" />
          <span>未保存</span>
        </div>
      </div>
    </div>
  );
}

// エクスポート用の型
export type { LocalSlot };
