'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Plus,
  Trash2,
  Check,
  Copy,
  ExternalLink,
  Loader2,
  ArrowLeft,
  Clock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { supabase } from '@/lib/supabase';
import { createAttendanceEvent } from '@/app/actions/attendance';
import { AttendanceSlot } from '@/types/attendance';

export default function NewAttendancePage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  // フォーム状態
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slots, setSlots] = useState<AttendanceSlot[]>([]);

  // カレンダー状態
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [defaultStartTime, setDefaultStartTime] = useState('19:00');
  const [defaultEndTime, setDefaultEndTime] = useState('21:00');

  // 送信状態
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 完了モーダル
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // ナビゲーション
  const navigateTo = (page: string) => {
    if (page === '/' || page === '') {
      router.push('/');
    } else {
      router.push(`/${page}`);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  // カレンダーの日付を生成
  const calendarDays = useCallback(() => {
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

  // 日付をフォーマット
  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // 日付が選択済みかチェック
  const isDateSelected = (date: Date) => {
    const dateKey = formatDateKey(date);
    return slots.some((slot) => slot.date === dateKey);
  };

  // 日付をトグル
  const toggleDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    const existingIndex = slots.findIndex((slot) => slot.date === dateKey);

    if (existingIndex >= 0) {
      // 削除
      setSlots(slots.filter((_, i) => i !== existingIndex));
    } else {
      // 追加
      const newSlot: AttendanceSlot = {
        date: dateKey,
        ...(showTimeInput && {
          start_time: defaultStartTime,
          end_time: defaultEndTime,
        }),
      };
      setSlots([...slots, newSlot].sort((a, b) => a.date.localeCompare(b.date)));
    }
  };

  // スロットの時間を更新
  const updateSlotTime = (index: number, field: 'start_time' | 'end_time', value: string) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  // スロットを削除
  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  // 月を移動
  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // 送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    if (slots.length === 0) {
      setError('少なくとも1つの候補日を選択してください');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await createAttendanceEvent(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          slots,
        },
        user?.id
      );

      if (result.success && result.data) {
        setCreatedEventId(result.data.id);
        setShowCompleteModal(true);
      } else {
        setError('error' in result ? result.error : '作成に失敗しました');
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('予期しないエラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  };

  // URLコピー
  const copyUrl = () => {
    if (createdEventId) {
      const url = `${window.location.origin}/attendance/${createdEventId}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex flex-col">
      <Header
        setPage={navigateTo}
        user={user}
        onLogout={handleLogout}
        setShowAuth={setShowAuth}
      />

      {/* 完了モーダル */}
      {showCompleteModal && createdEventId && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4"
          onClick={() => router.push(`/attendance/${createdEventId}`)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-purple-100">
                <Check size={32} className="text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">作成完了！</h2>
              <p className="text-gray-600 mt-2">
                出欠表を作成しました。URLを共有して参加者に回答してもらいましょう。
              </p>
            </div>

            {/* 公開URL */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                共有URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/attendance/${createdEventId}`}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
                />
                <button
                  onClick={copyUrl}
                  className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => window.open(`/attendance/${createdEventId}`, '_blank')}
                className="w-full py-3 px-6 bg-purple-600 text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 hover:bg-purple-700"
              >
                <ExternalLink size={18} />
                出欠表を開く
              </button>
              <button
                onClick={() => router.push('/attendance/new')}
                className="w-full py-3 px-6 border-2 border-purple-300 text-purple-700 rounded-xl font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
              >
                <Plus size={18} />
                続けて作成する
              </button>
              <button
                onClick={() => router.push('/tools')}
                className="w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                ツール一覧へ戻る
              </button>
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        {/* 戻るリンク */}
        <div className="mb-6">
          <Link
            href="/tools"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-sm"
          >
            <ArrowLeft size={18} />
            ツール一覧に戻る
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600">
              <Users className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">出欠表メーカー</h1>
              <p className="text-sm text-gray-500">
                候補日を選択して出欠表を作成。URLを共有するだけで簡単に日程調整できます。
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* 左カラム: フォーム */}
            <div className="lg:col-span-2 space-y-4">
              {/* 基本情報 */}
              <div className="bg-white rounded-2xl shadow-lg p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarDays size={20} className="text-purple-600" />
                  基本情報
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      タイトル <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="例: 忘年会の日程調整"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      説明（任意）
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="補足情報があれば入力してください"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none text-gray-900 placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>

              {/* 時間設定 */}
              <div className="bg-white rounded-2xl shadow-lg p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-purple-600" />
                  時間設定
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="showTime"
                      checked={showTimeInput}
                      onChange={(e) => setShowTimeInput(e.target.checked)}
                      className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="showTime" className="text-sm font-medium text-gray-700">
                      候補日に時間を設定する
                    </label>
                  </div>

                  {showTimeInput && (
                    <div className="grid grid-cols-2 gap-3 p-3 bg-purple-50 rounded-xl">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          開始時間
                        </label>
                        <input
                          type="time"
                          value={defaultStartTime}
                          onChange={(e) => setDefaultStartTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                          終了時間
                        </label>
                        <input
                          type="time"
                          value={defaultEndTime}
                          onChange={(e) => setDefaultEndTime(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900"
                        />
                      </div>
                      <p className="col-span-2 text-xs text-gray-500">
                        ※ 新しく選択する候補日に適用されます
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 選択済み候補日 */}
              <div className="bg-white rounded-2xl shadow-lg p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar size={20} className="text-purple-600" />
                  選択した候補日
                </h2>

                {slots.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {slots.map((slot, index) => {
                      const date = new Date(slot.date + 'T00:00:00');
                      return (
                        <div
                          key={slot.date}
                          className="flex items-center justify-between p-3 rounded-lg border bg-purple-50 border-purple-200"
                        >
                          <div className="flex-1">
                            <div className="text-sm font-semibold text-gray-900">
                              {date.toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: 'numeric',
                                day: 'numeric',
                                weekday: 'short',
                              })}
                            </div>
                            {slot.start_time && slot.end_time && (
                              <div className="flex items-center gap-2 mt-1">
                                <input
                                  type="time"
                                  value={slot.start_time}
                                  onChange={(e) => updateSlotTime(index, 'start_time', e.target.value)}
                                  className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-900"
                                />
                                <span className="text-gray-400">〜</span>
                                <input
                                  type="time"
                                  value={slot.end_time}
                                  onChange={(e) => updateSlotTime(index, 'end_time', e.target.value)}
                                  className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-900"
                                />
                              </div>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSlot(index)}
                            className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    カレンダーから候補日を選択してください
                  </p>
                )}

                <div className="mt-3 pt-3 border-t text-sm font-semibold text-purple-600">
                  合計: {slots.length}日
                </div>
              </div>

              {/* エラー表示 */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* 作成ボタン */}
              <button
                type="submit"
                disabled={submitting || !title.trim() || slots.length === 0}
                className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:bg-purple-700"
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    作成中...
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    出欠表を作成
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                ログイン不要・無料で何度でも作成できます
              </p>
            </div>

            {/* 右カラム: カレンダー */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
                <div className="flex items-center justify-between mb-6">
                  <button
                    type="button"
                    onClick={prevMonth}
                    className="p-2 text-purple-600 font-semibold hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <h2 className="text-xl font-bold text-gray-900">
                    {currentMonth.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
                  </h2>
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-2 text-purple-600 font-semibold hover:bg-purple-50 rounded-lg transition-colors"
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
                  {calendarDays().map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="aspect-square" />;
                    }

                    const isPast = date < today;
                    const isSelected = isDateSelected(date);
                    const isToday = date.toDateString() === new Date().toDateString();
                    const dayOfWeek = date.getDay();

                    return (
                      <button
                        key={date.toISOString()}
                        type="button"
                        onClick={() => !isPast && toggleDate(date)}
                        disabled={isPast}
                        className={`aspect-square p-1 rounded-xl transition-all relative ${
                          isPast
                            ? 'opacity-30 cursor-not-allowed'
                            : isSelected
                            ? 'bg-purple-500 text-white shadow-lg scale-105'
                            : 'hover:bg-purple-50'
                        }`}
                      >
                        <div
                          className={`text-sm font-semibold ${
                            isSelected
                              ? 'text-white'
                              : isToday
                              ? 'text-purple-600'
                              : dayOfWeek === 0
                              ? 'text-red-500'
                              : dayOfWeek === 6
                              ? 'text-blue-500'
                              : 'text-gray-700'
                          }`}
                        >
                          {date.getDate()}
                        </div>
                        {isSelected && (
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <p className="text-sm text-gray-500 text-center mt-4">
                  候補日をクリックして選択（複数選択可）
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer setPage={navigateTo} />
    </div>
  );
}
