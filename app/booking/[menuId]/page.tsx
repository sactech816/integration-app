'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Loader2,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  Mail,
  MessageSquare,
  Check,
  CalendarCheck,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BookingMenu, BookingSlotWithAvailability, BOOKING_MENU_TYPE_LABELS } from '@/types/booking';
import { getBookingMenu, getAvailableSlots, submitBooking } from '@/app/actions/booking';

// 日付ユーティリティ
const formatDate = (date: Date) => {
  return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' });
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
};

const isSameDay = (d1: Date, d2: Date) => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

export default function PublicBookingPage() {
  const params = useParams();
  const menuId = params.menuId as string;

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [menu, setMenu] = useState<BookingMenu | null>(null);
  const [slots, setSlots] = useState<BookingSlotWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // カレンダー状態
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlotWithAvailability | null>(null);

  // 予約フォーム
  const [step, setStep] = useState<'select' | 'form' | 'complete'>('select');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestComment, setGuestComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      // ユーザー認証状態を確認
      if (supabase) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser({ id: user.id, email: user.email });
        }
      }

      // メニュー情報を取得
      const menuData = await getBookingMenu(menuId);
      if (!menuData || !menuData.is_active) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setMenu(menuData);

      // 予約枠を取得
      const slotsData = await getAvailableSlots(menuId, {
        fromDate: new Date().toISOString(),
        includeFullSlots: false, // 空きのある枠のみ
      });
      setSlots(slotsData);
      setLoading(false);
    };

    loadData();
  }, [menuId]);

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

  // 日付ごとの枠を計算
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
    return (slotsByDate[selectedDate.toDateString()] || [])
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
  }, [selectedDate, slotsByDate]);

  const handleSelectSlot = (slot: BookingSlotWithAvailability) => {
    setSelectedSlot(slot);
    setStep('form');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setSubmitting(true);
    setError(null);

    const result = await submitBooking(
      {
        slot_id: selectedSlot.id,
        guest_name: user ? undefined : guestName,
        guest_email: user ? undefined : guestEmail,
        guest_comment: guestComment || undefined,
      },
      user?.id
    );

    if (result.success) {
      setStep('complete');
    } else {
      setError('error' in result ? result.error : '予約に失敗しました');
    }

    setSubmitting(false);
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">予約ページが見つかりません</h1>
          <p className="text-gray-600 mb-6">
            このページは存在しないか、現在公開されていません。
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline"
          >
            <ArrowLeft size={18} />
            トップページへ戻る
          </Link>
        </div>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Calendar className="text-white" size={28} />
            </div>
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-1 ${
                menu?.type === 'reservation'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-purple-100 text-purple-700'
              }`}>
                {BOOKING_MENU_TYPE_LABELS[menu?.type || 'reservation']}
              </span>
              <h1 className="text-2xl font-bold text-gray-900">{menu?.title}</h1>
              {menu?.description && (
                <p className="text-gray-600 mt-1">{menu.description}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock size={16} />
              <span>{menu?.duration_min}分</span>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {step === 'complete' ? (
          /* 完了画面 */
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">予約が完了しました！</h2>
            <p className="text-gray-600 mb-6">
              ご予約ありがとうございます。<br />
              確認メールをお送りしましたのでご確認ください。
            </p>
            {selectedSlot && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 inline-block">
                <div className="text-lg font-bold text-gray-900">
                  {formatDate(new Date(selectedSlot.start_time))}
                </div>
                <div className="text-blue-600 font-semibold">
                  {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                </div>
              </div>
            )}
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline"
              >
                <ArrowLeft size={18} />
                トップページへ
              </Link>
            </div>
          </div>
        ) : step === 'form' && selectedSlot ? (
          /* 予約フォーム */
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
            <button
              onClick={() => { setStep('select'); setSelectedSlot(null); }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <ArrowLeft size={18} />
              日時選択に戻る
            </button>

            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-3">
                <CalendarCheck size={24} className="text-blue-600" />
                <div>
                  <div className="font-bold text-gray-900">
                    {formatDate(new Date(selectedSlot.start_time))}
                  </div>
                  <div className="text-blue-600 font-semibold">
                    {formatTime(selectedSlot.start_time)} - {formatTime(selectedSlot.end_time)}
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {user ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-700">
                    <Check size={18} />
                    <span className="font-semibold">ログイン中: {user.email}</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    ログイン情報で予約します
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User size={16} className="inline mr-1" />
                      お名前 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      placeholder="山田 太郎"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Mail size={16} className="inline mr-1" />
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="example@email.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <MessageSquare size={16} className="inline mr-1" />
                  コメント（任意）
                </label>
                <textarea
                  value={guestComment}
                  onChange={(e) => setGuestComment(e.target.value)}
                  placeholder="ご質問やご要望があればお書きください"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || (!user && (!guestName.trim() || !guestEmail.trim()))}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    予約中...
                  </>
                ) : (
                  <>
                    <CalendarCheck size={20} />
                    予約を確定する
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* 日時選択 */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* カレンダー */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
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
                  const isToday = isSameDay(date, new Date());
                  const dayOfWeek = date.getDay();

                  return (
                    <button
                      key={dateKey}
                      onClick={() => hasSlots && !isPast && setSelectedDate(date)}
                      disabled={isPast || !hasSlots}
                      className={`aspect-square p-1 rounded-xl transition-all relative ${
                        isPast || !hasSlots
                          ? 'opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-500 text-white shadow-lg scale-105'
                          : 'hover:bg-blue-50'
                      }`}
                    >
                      <div
                        className={`text-sm font-semibold ${
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
                      {hasSlots && (
                        <>
                          <div
                            className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                              isSelected ? 'bg-white' : 'bg-green-500'
                            }`}
                          />
                          <div
                            className={`text-[10px] ${
                              isSelected ? 'text-blue-100' : 'text-green-600'
                            }`}
                          >
                            ○
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>

              {slots.length === 0 && (
                <div className="mt-6 text-center py-8 bg-gray-50 rounded-xl">
                  <Calendar size={40} className="mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600">現在予約可能な枠がありません</p>
                </div>
              )}
            </div>

            {/* 時間選択 */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              {selectedDate ? (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {formatDate(selectedDate)}
                  </h3>
                  {selectedDateSlots.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Clock size={32} className="mx-auto mb-2 opacity-50" />
                      <p>この日は空きがありません</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {selectedDateSlots.map((slot) => (
                        <button
                          key={slot.id}
                          onClick={() => handleSelectSlot(slot)}
                          className="w-full p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-gray-900 group-hover:text-blue-600">
                              <Clock size={18} />
                              {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                            </div>
                            <span className="text-sm text-green-600 font-semibold">
                              空き{slot.remaining_capacity}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="font-medium">日付を選択してください</p>
                  <p className="text-sm mt-1">○印のある日が予約可能です</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

