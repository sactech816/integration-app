'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Copy,
  ExternalLink,
  Plus,
  LayoutDashboard,
  Grid3X3,
  LayoutGrid,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import {
  BookingMenu,
  BookingSlotWithAvailability,
  BOOKING_MENU_TYPE_LABELS,
  AttendanceTableData,
  AttendanceStatus,
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_ICONS,
  ATTENDANCE_STATUS_COLORS,
} from '@/types/booking';
import {
  getBookingMenu,
  getAvailableSlots,
  submitBooking,
  getScheduleAdjustments,
  submitScheduleAdjustment,
} from '@/app/actions/booking';
import WeeklyCalendar from '@/components/booking/WeeklyCalendar';

type CalendarViewMode = 'month' | 'week';

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
  const router = useRouter();
  const menuId = params.menuId as string;

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [menu, setMenu] = useState<BookingMenu | null>(null);
  const [slots, setSlots] = useState<BookingSlotWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // UI state for creator features
  const [isCreator, setIsCreator] = useState(false);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  // カレンダー表示モード
  const [calendarViewMode, setCalendarViewMode] = useState<CalendarViewMode>('month');

  // 予約用の状態
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<BookingSlotWithAvailability | null>(null);
  const [step, setStep] = useState<'select' | 'form' | 'complete'>('select');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestComment, setGuestComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 日程調整用の状態
  const [attendanceData, setAttendanceData] = useState<AttendanceTableData | null>(null);
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [participantResponses, setParticipantResponses] = useState<Record<string, AttendanceStatus>>({});
  const [submittingAdjustment, setSubmittingAdjustment] = useState(false);
  const [adjustmentComplete, setAdjustmentComplete] = useState(false);
  const [adjustmentError, setAdjustmentError] = useState<string | null>(null);

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

      // Check if current user is the creator
      const editKeys = JSON.parse(localStorage.getItem('booking_edit_keys') || '[]');
      const isOwner = (user && menuData.user_id === user.id) || 
                      editKeys.includes(menuData.edit_key);
      setIsCreator(isOwner);

      // メニュータイプに応じてデータを取得
      if (menuData.type === 'adjustment') {
        // 日程調整の場合: 出欠表データを取得
        const attendanceTableData = await getScheduleAdjustments(menuId);
        if (attendanceTableData) {
          setAttendanceData(attendanceTableData);
          // 全スロットを取得（表示用）
          const allSlots = await getAvailableSlots(menuId, {
            fromDate: new Date().toISOString(),
            includeFullSlots: true,
          });
          setSlots(allSlots);
        }
      } else {
        // 予約の場合: 空き枠を取得
        const slotsData = await getAvailableSlots(menuId, {
          fromDate: new Date().toISOString(),
          includeFullSlots: false, // 空きのある枠のみ
        });
        setSlots(slotsData);
      }
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

  // 週表示からの枠選択
  const handleWeekSlotClick = (date: Date, hour: number) => {
    // 該当する枠を探す
    const dateKey = date.toDateString();
    const daySlots = slotsByDate[dateKey] || [];
    const matchingSlot = daySlots.find(slot => {
      const slotHour = new Date(slot.start_time).getHours();
      return slotHour === hour && slot.remaining_capacity > 0;
    });
    
    if (matchingSlot) {
      handleSelectSlot(matchingSlot);
    } else {
      // 枠がない場合は日付を選択
      setSelectedDate(date);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    setSubmitting(true);
    setError(null);

    try {
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
    } catch (err) {
      console.error('Booking submission error:', err);
      setError('予約処理中にエラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // 日程調整用のハンドラー
  const handleAttendanceChange = (slotId: string, status: AttendanceStatus) => {
    setParticipantResponses({
      ...participantResponses,
      [slotId]: status,
    });
  };

  const handleSubmitAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!menu || !participantName.trim()) return;

    setSubmittingAdjustment(true);
    setAdjustmentError(null);

    const result = await submitScheduleAdjustment({
      menu_id: menu.id,
      participant_name: participantName.trim(),
      participant_email: participantEmail.trim() || undefined,
      responses: participantResponses,
    });

    if (result.success) {
      setAdjustmentComplete(true);
      // データを再読み込み
      const updatedData = await getScheduleAdjustments(menuId);
      if (updatedData) {
        setAttendanceData(updatedData);
      }
      // フォームをリセット
      setParticipantName('');
      setParticipantEmail('');
      setParticipantResponses({});
    } else {
      setAdjustmentError('error' in result ? result.error : '回答に失敗しました');
    }

    setSubmittingAdjustment(false);
  };

  // URL copy handler
  const handleCopyUrl = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setUrlCopied(true);
      setTimeout(() => setUrlCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
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
        {/* フッター */}
        <footer className="py-4 text-center">
          <p className="text-xs text-gray-400">
            予約・出欠表作成{' '}
            <a 
              href="https://makers.tokyo/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-500 transition-colors"
            >
              https://makers.tokyo/
            </a>
          </p>
        </footer>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                menu?.type === 'adjustment'
                  ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600'
              }`}>
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
            
            {/* Navigation Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {isCreator && (
                <>
                  <button
                    onClick={() => router.push('/booking')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold"
                  >
                    <LayoutDashboard size={18} />
                    <span className="hidden sm:inline">管理画面に戻る</span>
                  </button>
                  <button
                    onClick={() => setShowUrlModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-semibold"
                  >
                    <ExternalLink size={18} />
                    <span className="hidden sm:inline">公開アドレス</span>
                  </button>
                </>
              )}
              <button
                onClick={() => router.push('/booking/new')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">新規作成</span>
              </button>
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

      {/* URL Modal */}
      {showUrlModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUrlModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">公開アドレス</h3>
              <button
                onClick={() => setShowUrlModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">
              予約・日程調整が作成されました。このURLページにて予約・日程調整を入力してもらいましょう。
            </p>
            
            <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
              <p className="text-sm text-gray-700 break-all font-mono">
                {typeof window !== 'undefined' ? window.location.href : ''}
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={handleCopyUrl}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                <Copy size={18} />
                {urlCopied ? 'コピーしました！' : 'アドレスをコピー'}
              </button>
              <button
                onClick={() => window.open(window.location.href, '_blank')}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold"
              >
                <ExternalLink size={18} />
                アクセス
              </button>
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {menu?.type === 'adjustment' ? (
          /* 日程調整: 出欠表形式 */
          attendanceData ? (
            <>
              {adjustmentComplete ? (
                <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in mb-6">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={40} className="text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">出欠を登録しました！</h2>
                  <p className="text-gray-600 mb-6">
                    メールアドレスを入力されている場合、調整結果をお送りしました。
                  </p>
                  <button
                    onClick={() => setAdjustmentComplete(false)}
                    className="text-purple-600 font-semibold hover:underline"
                  >
                    続けて登録する
                  </button>
                </div>
              ) : null}

              {/* 出欠表 */}
              {attendanceData.slots.length > 0 ? (
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 overflow-x-auto">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">出欠表</h2>
                  <div className="min-w-full">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left p-3 font-semibold text-gray-700 sticky left-0 bg-white z-10 min-w-[120px]">
                            参加者
                          </th>
                          {attendanceData.slots.map((slotSummary) => (
                          <th
                            key={slotSummary.slot_id}
                            className={`text-center p-3 font-semibold text-gray-700 border-l border-gray-200 ${
                              attendanceData.best_slot_id === slotSummary.slot_id
                                ? 'bg-green-50 border-green-300'
                                : ''
                            }`}
                          >
                            <div className="text-sm">
                              {formatDate(new Date(slotSummary.slot.start_time))}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {formatTime(slotSummary.slot.start_time)} - {formatTime(slotSummary.slot.end_time)}
                            </div>
                            {attendanceData.best_slot_id === slotSummary.slot_id && (
                              <div className="text-xs text-green-600 font-bold mt-1">★ 候補</div>
                            )}
                          </th>
                        ))}
                      </tr>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <td className="p-2 text-xs text-gray-600 font-medium sticky left-0 bg-gray-50 z-10">
                          参加可/不可/未定
                        </td>
                        {attendanceData.slots.map((slotSummary) => (
                          <td key={slotSummary.slot_id} className="text-center p-2 text-xs text-gray-600 border-l border-gray-200">
                            <div>
                              <span className="text-green-600 font-semibold">{slotSummary.yes_count}</span> /
                              <span className="text-red-600 font-semibold"> {slotSummary.no_count}</span> /
                              <span className="text-yellow-600 font-semibold"> {slotSummary.maybe_count}</span>
                            </div>
                            <div className="text-gray-500 mt-1">
                              ({slotSummary.available_count}名参加可能)
                            </div>
                          </td>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.participants.map((participant) => (
                        <tr key={participant.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-3 font-medium text-gray-900 sticky left-0 bg-white z-10">
                            {participant.participant_name}
                          </td>
                          {attendanceData.slots.map((slotSummary) => {
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
                    </tbody>
                  </table>
                </div>
              </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-12 text-center mb-6">
                  <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">日程候補が設定されていません</h3>
                  <p className="text-gray-600">
                    日程候補を設定すると、出欠確認が開始できます。
                  </p>
                </div>
              )}

              {/* 出欠入力フォーム */}
              {attendanceData.slots.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">出欠を登録</h2>
                  <form onSubmit={handleSubmitAdjustment} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <User size={16} className="inline mr-1" />
                        お名前（ニックネーム） <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={participantName}
                        onChange={(e) => setParticipantName(e.target.value)}
                        placeholder="山田 太郎"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder:text-gray-400"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <Mail size={16} className="inline mr-1" />
                        メールアドレス（任意）
                      </label>
                      <input
                        type="email"
                        value={participantEmail}
                        onChange={(e) => setParticipantEmail(e.target.value)}
                        placeholder="example@email.com（入力すると調整結果がメールで届きます）"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder:text-gray-400"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        メールアドレスを入力すると、調整結果の出欠表がメールで送られます。
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        各日程への出欠を選択してください
                      </label>
                      <div className="space-y-3">
                        {attendanceData.slots.map((slotSummary) => {
                          const currentStatus = participantResponses[slotSummary.slot_id] as AttendanceStatus | undefined;

                          return (
                            <div
                              key={slotSummary.slot_id}
                              className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors"
                            >
                              <div className="font-semibold text-gray-900 mb-3">
                                {formatDate(new Date(slotSummary.slot.start_time))} {formatTime(slotSummary.slot.start_time)} - {formatTime(slotSummary.slot.end_time)}
                              </div>
                              <div className="flex gap-2">
                                {(['yes', 'maybe', 'no'] as AttendanceStatus[]).map((status) => {
                                  const config = ATTENDANCE_STATUS_COLORS[status];
                                  const isSelected = currentStatus === status;

                                  return (
                                    <button
                                      key={status}
                                      type="button"
                                      onClick={() => handleAttendanceChange(slotSummary.slot_id, status)}
                                      className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all border-2 ${
                                        isSelected
                                          ? `${config.bg} ${config.text} ${config.border} border-2`
                                          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                                      }`}
                                    >
                                      <span className="text-lg">{ATTENDANCE_STATUS_ICONS[status]}</span>
                                      <div className="text-xs mt-1">{ATTENDANCE_STATUS_LABELS[status]}</div>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  {adjustmentError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                      <AlertCircle size={18} />
                      {adjustmentError}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submittingAdjustment || !participantName.trim() || Object.keys(participantResponses).length === 0}
                    className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submittingAdjustment ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        送信中...
                      </>
                    ) : (
                      <>
                        <CalendarCheck size={20} />
                        出欠を登録
                      </>
                    )}
                  </button>
                </form>
              </div>
              )}
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
              <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600">日程候補が設定されていません</p>
            </div>
          )
        ) : step === 'complete' ? (
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder:text-gray-400"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900 placeholder:text-gray-400"
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
          <>
            {/* カレンダー表示切り替え */}
            <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">日時を選択</h2>
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setCalendarViewMode('month')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                      calendarViewMode === 'month'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <LayoutGrid size={16} />
                    月表示
                  </button>
                  <button
                    onClick={() => setCalendarViewMode('week')}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                      calendarViewMode === 'week'
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Grid3X3 size={16} />
                    週表示
                  </button>
                </div>
              </div>
            </div>

            {calendarViewMode === 'week' ? (
              /* 週表示カレンダー */
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <WeeklyCalendar
                  slots={slots}
                  onSlotClick={handleWeekSlotClick}
                  durationMin={menu?.duration_min || 60}
                  readOnly={true}
                  menuType={menu?.type || 'reservation'}
                />
                <p className="text-sm text-gray-500 text-center mt-4">
                  予約可能な時間帯をクリックして予約できます
                </p>
              </div>
            ) : (
              /* 月表示カレンダー */
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* カレンダー */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={prevMonth}
                      className="p-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">
                      {currentMonth.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                    </h2>
                    <button
                      onClick={nextMonth}
                      className="p-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition-colors"
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

                      // 予約モードでは空き枠数を計算
                      const availableCount = menu?.type === 'reservation' 
                        ? daySlots.reduce((sum, slot) => sum + (slot.remaining_capacity || 0), 0)
                        : daySlots.length;

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
                                className={`text-[10px] font-semibold ${
                                  isSelected ? 'text-blue-100' : 'text-green-600'
                                }`}
                              >
                                {menu?.type === 'reservation' ? `空${availableCount}` : `${availableCount}枠`}
                              </div>
                              {daySlots.length > 0 && (
                                <div
                                  className={`text-[9px] mt-0.5 ${
                                    isSelected ? 'text-blue-200' : 'text-gray-500'
                                  }`}
                                >
                                  {formatTime(daySlots[0].start_time)}～
                                </div>
                              )}
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
          </>
        )}
      </main>

      {/* フッター */}
      <footer className="py-4 text-center">
        <p className="text-xs text-gray-400">
          予約・出欠表作成{' '}
          <a 
            href="https://makers.tokyo/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-gray-500 transition-colors"
          >
            https://makers.tokyo/
          </a>
        </p>
      </footer>
    </div>
  );
}
