'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  X,
  Check,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BookingMenu, BookingSlotWithAvailability, CreateBookingSlotInput } from '@/types/booking';
import {
  getBookingMenu,
  getAvailableSlots,
  createBookingSlots,
  deleteBookingSlot,
} from '@/app/actions/booking';

// 日付ユーティリティ
const formatDate = (date: Date) => {
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
};

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

export default function BookingSlotsPage() {
  const router = useRouter();
  const params = useParams();
  const menuId = params.menuId as string;

  const [user, setUser] = useState<{ id: string } | null>(null);
  const [menu, setMenu] = useState<BookingMenu | null>(null);
  const [slots, setSlots] = useState<BookingSlotWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // カレンダー状態
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]); // 複数日付選択用
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkAddModal, setShowBulkAddModal] = useState(false); // 一括追加モーダル

  // 新規枠追加フォーム
  const [newSlotTime, setNewSlotTime] = useState('10:00');
  const [newSlotCapacity, setNewSlotCapacity] = useState(1);

  // 一括追加フォーム
  const [bulkSlotTime, setBulkSlotTime] = useState('19:00');
  const [bulkSlotCapacity, setBulkSlotCapacity] = useState(1);

  useEffect(() => {
    const loadData = async () => {
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

      const menuData = await getBookingMenu(menuId);
      if (!menuData || menuData.user_id !== user.id) {
        router.push('/booking');
        return;
      }

      setMenu(menuData);
      await loadSlots();
      setLoading(false);
    };

    loadData();
  }, [router, menuId]);

  const loadSlots = async () => {
    const slotsData = await getAvailableSlots(menuId, {
      fromDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
      includeFullSlots: true,
    });
    setSlots(slotsData);
  };

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
    const map: Record<string, BookingSlotWithAvailability[]> = {};
    slots.forEach((slot) => {
      const dateKey = new Date(slot.start_time).toDateString();
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(slot);
    });
    return map;
  }, [slots]);

  // 選択日の枠
  const selectedDateSlots = useMemo(() => {
    if (!selectedDate) return [];
    return slotsByDate[selectedDate.toDateString()] || [];
  }, [selectedDate, slotsByDate]);

  const handleAddSlot = async () => {
    if (!user || !menu || !selectedDate) return;

    setSubmitting(true);

    const [hours, minutes] = newSlotTime.split(':').map(Number);
    const startTime = new Date(selectedDate);
    startTime.setHours(hours, minutes, 0, 0);

    // 過去日時チェック
    const now = new Date();
    if (startTime <= now) {
      alert('過去の日時は設定できません。現在時刻より後の時刻を選択してください。');
      setSubmitting(false);
      return;
    }

    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + menu.duration_min);

    const newSlot: CreateBookingSlotInput = {
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      max_capacity: newSlotCapacity,
    };

    const result = await createBookingSlots(menuId, user.id, [newSlot]);

    if (result.success) {
      await loadSlots();
      setShowAddModal(false);
    } else {
      alert('枠の追加に失敗しました: ' + ('error' in result ? result.error : '枠の追加に失敗しました'));
    }

    setSubmitting(false);
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!user || !confirm('この予約枠を削除しますか？')) return;

    const result = await deleteBookingSlot(slotId, user.id);
    if (result.success) {
      await loadSlots();
    } else {
      alert('削除に失敗しました: ' + ('error' in result ? result.error : '削除に失敗しました'));
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // 複数日付選択のトグル
  const toggleDateSelection = (date: Date) => {
    const dateStr = date.toDateString();
    const isSelected = selectedDates.some(d => d.toDateString() === dateStr);
    
    if (isSelected) {
      setSelectedDates(selectedDates.filter(d => d.toDateString() !== dateStr));
    } else {
      setSelectedDates([...selectedDates, date]);
    }
  };

  // 複数日付の一括追加
  const handleBulkAddSlots = async () => {
    if (!user || !menu || selectedDates.length === 0) return;

    setSubmitting(true);

    const [hours, minutes] = bulkSlotTime.split(':').map(Number);
    const now = new Date();
    
    const newSlots: CreateBookingSlotInput[] = [];
    const invalidDates: Date[] = [];

    for (const date of selectedDates) {
      const startTime = new Date(date);
      startTime.setHours(hours, minutes, 0, 0);

      // 過去日時チェック
      if (startTime <= now) {
        invalidDates.push(date);
        continue;
      }

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + menu.duration_min);

      newSlots.push({
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        max_capacity: bulkSlotCapacity,
      });
    }

    if (invalidDates.length > 0) {
      alert(`過去の日時は設定できません: ${invalidDates.map(d => formatDate(d)).join(', ')}`);
      setSubmitting(false);
      return;
    }

    if (newSlots.length === 0) {
      alert('追加する予約枠がありません。');
      setSubmitting(false);
      return;
    }

    const result = await createBookingSlots(menuId, user.id, newSlots);

    if (result.success) {
      await loadSlots();
      setShowBulkAddModal(false);
      setSelectedDates([]);
      alert(`${newSlots.length}件の予約枠を追加しました。`);
    } else {
      alert('枠の追加に失敗しました: ' + ('error' in result ? result.error : '枠の追加に失敗しました'));
    }

    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shrink-0">
              <Calendar className="text-white" size={22} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-bold text-gray-900 truncate">{menu?.title}</h1>
              <p className="text-xs text-gray-500">予約枠の管理</p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 複数選択ボタンを表示 */}
        <div className="mb-4 flex items-center justify-between bg-white rounded-xl p-4 shadow-lg">
          <div>
            <h3 className="font-bold text-gray-900">複数日程を選択して一括追加</h3>
            <p className="text-sm text-gray-600">
              {selectedDates.length > 0 
                ? `${selectedDates.length}日選択中`
                : 'カレンダーで複数の日付をクリックして選択'}
            </p>
          </div>
          <div className="flex gap-2">
            {selectedDates.length > 0 && (
              <>
                <button
                  onClick={() => setSelectedDates([])}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  選択をクリア
                </button>
                <button
                  onClick={() => setShowBulkAddModal(true)}
                  className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg font-semibold transition-colors ${
                    menu?.type === 'adjustment' 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Plus size={18} />
                  時間を設定して追加
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* カレンダー */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
            {/* カレンダーヘッダー */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-xl font-bold text-gray-900">
                {currentMonth.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
              </h2>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* 曜日ヘッダー */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                <div
                  key={day}
                  className={`text-center text-sm font-semibold py-2 ${
                    i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-600'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* カレンダー本体 */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="aspect-square" />;
                }

                const dateKey = date.toDateString();
                const daySlots = slotsByDate[dateKey] || [];
                const hasSlots = daySlots.length > 0;
                const isPast = date < today;
                const isSelected = selectedDate && isSameDay(date, selectedDate);
                const isMultiSelected = selectedDates.some(d => isSameDay(d, date));
                const isToday = isSameDay(date, new Date());
                const dayOfWeek = date.getDay();

                return (
                  <button
                    key={dateKey}
                    onClick={() => {
                      if (isPast) return;
                      // 複数選択モード
                      toggleDateSelection(date);
                    }}
                    disabled={isPast}
                    className={`aspect-square p-1 rounded-xl transition-all relative ${
                      isPast
                        ? 'opacity-40 cursor-not-allowed'
                        : isMultiSelected
                        ? 'bg-purple-500 text-white shadow-lg scale-105 ring-2 ring-purple-300'
                        : isSelected
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div
                      className={`text-sm font-semibold ${
                        isMultiSelected || isSelected
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
                    {isMultiSelected && (
                      <div className="absolute top-1 right-1">
                        <Check size={14} className="text-white" />
                      </div>
                    )}
                    {hasSlots && (
                      <div
                        className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                          isMultiSelected || isSelected ? 'bg-white' : 'bg-blue-500'
                        }`}
                      />
                    )}
                    {hasSlots && (
                      <div
                        className={`text-[10px] ${
                          isMultiSelected || isSelected ? 'text-blue-100' : 'text-gray-500'
                        }`}
                      >
                        {daySlots.length}枠
                      </div>
                    )}
                    {hasSlots && daySlots.length > 0 && (
                      <div
                        className={`text-[9px] mt-0.5 ${
                          isMultiSelected || isSelected ? 'text-blue-200' : 'text-gray-400'
                        }`}
                      >
                        {formatTime(daySlots[0].start_time)}～
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 選択日の詳細 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {selectedDates.length > 0 ? (
              // 複数選択中
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  選択中の日付
                </h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedDates.sort((a, b) => a.getTime() - b.getTime()).map((date, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        menu?.type === 'adjustment' ? 'bg-purple-50' : 'bg-blue-50'
                      }`}
                    >
                      <span className="font-medium text-gray-900">
                        {formatDate(date)}
                      </span>
                      <button
                        onClick={() => toggleDateSelection(date)}
                        className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ) : selectedDate ? (
              // 単一選択（従来の動作）
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    {formatDate(selectedDate)}
                  </h3>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Plus size={16} />
                    枠を追加
                  </button>
                </div>

                {selectedDateSlots.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar size={40} className="mx-auto mb-3 opacity-50" />
                    <p>この日には予約枠がありません</p>
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="mt-4 text-blue-600 font-semibold hover:underline"
                    >
                      枠を追加する
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedDateSlots
                      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                      .map((slot) => (
                        <div
                          key={slot.id}
                          className={`p-4 rounded-xl border-2 ${
                            slot.is_available
                              ? 'border-green-200 bg-green-50'
                              : 'border-red-200 bg-red-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
                                <Clock size={18} />
                                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                              </div>
                              <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                <Users size={14} />
                                <span>
                                  {slot.current_bookings} / {slot.max_capacity} 予約
                                </span>
                                {slot.is_available ? (
                                  <span className="text-green-600 font-semibold">（空きあり）</span>
                                ) : (
                                  <span className="text-red-600 font-semibold">（満席）</span>
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                              title="削除"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
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
      </main>

      {/* 枠追加モーダル */}
      {showAddModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">予約枠を追加</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  日付
                </label>
                <div className="px-4 py-3 bg-gray-100 rounded-xl font-medium text-gray-900">
                  {formatDate(selectedDate)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  開始時間
                </label>
                <input
                  type="time"
                  value={newSlotTime}
                  onChange={(e) => setNewSlotTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  所要時間
                </label>
                <div className="px-4 py-3 bg-gray-100 rounded-xl font-medium text-gray-900">
                  {menu?.duration_min}分
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  最大予約数
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={newSlotCapacity}
                  onChange={(e) => setNewSlotCapacity(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddSlot}
                disabled={submitting}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Check size={20} />
                )}
                追加
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 一括追加モーダル */}
      {showBulkAddModal && selectedDates.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">複数日程に予約枠を追加</h3>
              <button
                onClick={() => setShowBulkAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  選択した日付（{selectedDates.length}日）
                </label>
                <div className="px-4 py-3 bg-purple-50 rounded-xl max-h-32 overflow-y-auto">
                  <div className="space-y-1">
                    {selectedDates.sort((a, b) => a.getTime() - b.getTime()).map((date, idx) => (
                      <div key={idx} className="text-sm text-gray-900 font-medium">
                        {formatDate(date)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  開始時間
                </label>
                <input
                  type="time"
                  value={bulkSlotTime}
                  onChange={(e) => setBulkSlotTime(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  全ての日付に同じ時間帯で予約枠を追加します
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  よく使う時間帯
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkSlotTime('10:00')}
                    className="px-3 py-2 text-sm font-semibold border-2 border-blue-500 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    朝 10:00
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkSlotTime('13:00')}
                    className="px-3 py-2 text-sm font-semibold border-2 border-orange-500 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    昼 13:00
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkSlotTime('17:00')}
                    className="px-3 py-2 text-sm font-semibold border-2 border-amber-500 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                  >
                    夕 17:00
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkSlotTime('19:00')}
                    className="px-3 py-2 text-sm font-semibold border-2 border-indigo-500 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                  >
                    夜 19:00
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  所要時間
                </label>
                <div className="px-4 py-3 bg-gray-100 rounded-xl font-medium text-gray-900">
                  {menu?.duration_min}分
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  最大予約数
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={bulkSlotCapacity}
                  onChange={(e) => setBulkSlotCapacity(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBulkAddModal(false)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleBulkAddSlots}
                disabled={submitting}
                className={`flex-1 py-3 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                  menu?.type === 'adjustment' 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {submitting ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Check size={20} />
                )}
                {selectedDates.length}日分追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

