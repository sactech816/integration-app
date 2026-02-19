'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Trash2,
  Check,
  Loader2,
  ArrowLeft,
  Clock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Users,
  Plus,
} from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';
import OnboardingModal, { type OnboardingPage } from '@/components/shared/OnboardingModal';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import { supabase } from '@/lib/supabase';
import { createAttendanceEvent, getAttendanceEvent, updateAttendanceEvent } from '@/app/actions/attendance';
import { AttendanceSlot, AttendanceEvent } from '@/types/attendance';

// エディタ本体コンポーネント
function AttendanceEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  // オンボーディング
  const { showOnboarding, setShowOnboarding } = useOnboarding('attendance_editor_onboarding_dismissed', { skip: !!editId });

  // 編集モード用
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalEvent, setOriginalEvent] = useState<AttendanceEvent | null>(null);
  const [loadingEvent, setLoadingEvent] = useState(false);

  // フォーム状態
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slots, setSlots] = useState<AttendanceSlot[]>([]);

  // カレンダー状態
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showTimeInput, setShowTimeInput] = useState(false);
  const [defaultTimeSlots, setDefaultTimeSlots] = useState<{ start: string; end: string }[]>([
    { start: '19:00', end: '21:00' },
  ]);

  // 送信状態
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 完了モーダル
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [createdEventId, setCreatedEventId] = useState<string | null>(null);

  // showTimeInputが変更されたら既存スロットを更新
  useEffect(() => {
    if (slots.length === 0) return;

    if (!showTimeInput) {
      // 時間設定OFF → 日付ごとに1つのスロットに集約（時間を除去）
      const seenDates = new Set<string>();
      setSlots(prevSlots => prevSlots.filter(slot => {
        if (seenDates.has(slot.date)) return false;
        seenDates.add(slot.date);
        return true;
      }).map(slot => ({
        ...slot,
        start_time: undefined,
        end_time: undefined,
      })));
    } else {
      // 時間設定ON → 既存スロットにデフォルト時間を付与
      const firstDefault = defaultTimeSlots[0];
      setSlots(prevSlots => prevSlots.map(slot => ({
        ...slot,
        start_time: slot.start_time || firstDefault.start,
        end_time: slot.end_time || firstDefault.end,
      })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTimeInput]);

  // ログインセッション取得
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      if (!supabase) return;

      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null);
      });
      subscription = sub;

      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      // 管理者チェック
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single();
        setIsAdmin(profile?.is_admin || false);
      }
    };
    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // 編集モード: 既存データを読み込み
  useEffect(() => {
    const loadEventData = async () => {
      if (!editId) {
        setIsEditMode(false);
        return;
      }

      setLoadingEvent(true);
      try {
        const event = await getAttendanceEvent(editId);
        if (event) {
          setOriginalEvent(event);
          setIsEditMode(true);
          setTitle(event.title);
          setDescription(event.description || '');
          setSlots(event.slots || []);
          
          // 時間設定があるかチェック
          const hasTime = event.slots?.some(slot => slot.start_time || slot.end_time);
          setShowTimeInput(hasTime || false);

          // 既存スロットからユニークな時間帯パターンを復元
          if (hasTime && event.slots) {
            const seen = new Set<string>();
            const restored: { start: string; end: string }[] = [];
            event.slots.forEach(slot => {
              if (slot.start_time && slot.end_time) {
                const key = `${slot.start_time}-${slot.end_time}`;
                if (!seen.has(key)) {
                  seen.add(key);
                  restored.push({ start: slot.start_time, end: slot.end_time });
                }
              }
            });
            if (restored.length > 0) setDefaultTimeSlots(restored);
          }
        } else {
          setError('出欠表が見つかりません');
        }
      } catch (err) {
        console.error('Error loading event:', err);
        setError('データの読み込みに失敗しました');
      } finally {
        setLoadingEvent(false);
      }
    };

    loadEventData();
  }, [editId]);

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
    const hasSlots = slots.some((slot) => slot.date === dateKey);

    if (hasSlots) {
      // その日付の全スロットを削除
      setSlots(slots.filter((slot) => slot.date !== dateKey));
    } else {
      // 追加: デフォルト時間帯の数だけスロットを作成
      const newSlots: AttendanceSlot[] = showTimeInput
        ? defaultTimeSlots.map((ts) => ({
            date: dateKey,
            start_time: ts.start,
            end_time: ts.end,
          }))
        : [{ date: dateKey }];
      setSlots([...slots, ...newSlots].sort((a, b) => a.date.localeCompare(b.date)));
    }
  };

  // 同じ日付に時間帯を追加
  const addTimeSlot = (dateKey: string) => {
    const firstDefault = defaultTimeSlots[0];
    const newSlot: AttendanceSlot = {
      date: dateKey,
      start_time: firstDefault.start,
      end_time: firstDefault.end,
    };
    // 同じ日付の最後のスロットの後に挿入
    const lastIndex = slots.reduce((last, slot, i) => slot.date === dateKey ? i : last, -1);
    const newSlots = [...slots];
    newSlots.splice(lastIndex + 1, 0, newSlot);
    setSlots(newSlots);
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
      const inputData = {
        title: title.trim(),
        description: description.trim() || undefined,
        slots,
      };

      let result;
      
      if (isEditMode && editId && user?.id) {
        // 更新
        result = await updateAttendanceEvent(editId, inputData, user.id, isAdmin);
        if (result.success && result.data) {
          setCreatedEventId(result.data.id);
          setShowCompleteModal(true);
        } else {
          setError('error' in result ? result.error : '更新に失敗しました');
        }
      } else {
        // 新規作成
        result = await createAttendanceEvent(inputData, user?.id);
        if (result.success && result.data) {
          setCreatedEventId(result.data.id);
          setShowCompleteModal(true);
        } else {
          setError('error' in result ? result.error : '作成に失敗しました');
        }
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('予期しないエラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  };

  // 完了モーダルを閉じて編集モードへ移行
  const handleCloseCompleteModal = () => {
    setShowCompleteModal(false);
    
    if (!isEditMode && createdEventId) {
      // 新規作成後は編集モードに切り替え（URLも更新）
      setIsEditMode(true);
      router.replace(`/attendance/editor?id=${createdEventId}`, { scroll: false });
    }
    // 編集モードの場合はそのまま（すでに編集中なので何もしない）
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ローディング表示
  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex flex-col">
        <Header
          setPage={navigateTo}
          user={user}
          onLogout={handleLogout}
          setShowAuth={setShowAuth}
        />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="animate-spin text-purple-600 mx-auto mb-4" size={48} />
            <p className="text-gray-600">読み込み中...</p>
          </div>
        </main>
        <Footer setPage={navigateTo} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex flex-col">
      <Header
        setPage={navigateTo}
        user={user}
        onLogout={handleLogout}
        setShowAuth={setShowAuth}
      />

      {/* 完了モーダル */}
      <CreationCompleteModal
        isOpen={showCompleteModal && !!createdEventId}
        onClose={handleCloseCompleteModal}
        title="出欠表"
        publicUrl={typeof window !== 'undefined' && createdEventId ? `${window.location.origin}/attendance/${createdEventId}` : ''}
        contentTitle={title ? `「${title}」の出欠表を${isEditMode ? '更新' : '作成'}しました！` : `出欠表を${isEditMode ? '更新' : '作成'}しました！`}
        theme="purple"
      />

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        {/* 戻るリンク */}
        <div className="mb-6">
          <Link
            href={isEditMode ? "/dashboard?tab=attendance" : "/tools"}
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-semibold text-sm"
          >
            <ArrowLeft size={18} />
            {isEditMode ? 'ダッシュボードに戻る' : 'ツール一覧に戻る'}
          </Link>
        </div>

        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600">
              <Users className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                出欠表メーカー {isEditMode && <span className="text-purple-600">- 編集</span>}
              </h1>
              <p className="text-sm text-gray-500">
                {isEditMode
                  ? '出欠表の内容を編集できます。'
                  : '候補日を選択して出欠表を作成。URLを共有するだけで簡単に日程調整できます。'}
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
                      タイトル<span className="text-red-500 font-bold">（必須）</span>
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
                    <div className="space-y-2 p-3 bg-purple-50 rounded-xl">
                      {defaultTimeSlots.map((ts, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-500 w-5 text-center">{i + 1}</span>
                          <input
                            type="time"
                            value={ts.start}
                            onChange={(e) => {
                              const updated = [...defaultTimeSlots];
                              updated[i] = { ...updated[i], start: e.target.value };
                              setDefaultTimeSlots(updated);
                            }}
                            className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900"
                          />
                          <span className="text-gray-400 text-sm">〜</span>
                          <input
                            type="time"
                            value={ts.end}
                            onChange={(e) => {
                              const updated = [...defaultTimeSlots];
                              updated[i] = { ...updated[i], end: e.target.value };
                              setDefaultTimeSlots(updated);
                            }}
                            className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900"
                          />
                          {defaultTimeSlots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setDefaultTimeSlots(defaultTimeSlots.filter((_, j) => j !== i))}
                              className="p-1 text-red-400 hover:bg-red-100 rounded transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setDefaultTimeSlots([...defaultTimeSlots, { start: '19:00', end: '21:00' }])}
                        className="flex items-center gap-1 text-xs font-semibold text-purple-600 hover:text-purple-700 py-1"
                      >
                        <Plus size={14} />
                        時間帯を追加
                      </button>
                      <p className="text-xs text-gray-500">
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
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {(() => {
                      // 日付でグループ化
                      const grouped: { dateKey: string; items: { slot: AttendanceSlot; globalIndex: number }[] }[] = [];
                      slots.forEach((slot, globalIndex) => {
                        const last = grouped[grouped.length - 1];
                        if (last && last.dateKey === slot.date) {
                          last.items.push({ slot, globalIndex });
                        } else {
                          grouped.push({ dateKey: slot.date, items: [{ slot, globalIndex }] });
                        }
                      });

                      return grouped.map((group) => {
                        const date = new Date(group.dateKey + 'T00:00:00');
                        const dateLabel = date.toLocaleDateString('ja-JP', {
                          year: 'numeric',
                          month: 'numeric',
                          day: 'numeric',
                          weekday: 'short',
                        });

                        return (
                          <div key={group.dateKey} className="rounded-lg border border-purple-200 bg-purple-50 overflow-hidden">
                            {/* 日付ヘッダー */}
                            <div className="flex items-center justify-between px-3 py-2 bg-purple-100">
                              <div className="text-sm font-semibold text-gray-900">
                                {dateLabel}
                              </div>
                              <div className="flex items-center gap-1">
                                {showTimeInput && (
                                  <button
                                    type="button"
                                    onClick={() => addTimeSlot(group.dateKey)}
                                    className="p-1 text-purple-600 hover:bg-purple-200 rounded transition-colors"
                                    title="時間帯を追加"
                                  >
                                    <Plus size={16} />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setSlots(slots.filter((s) => s.date !== group.dateKey))}
                                  className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                                  title="この日付を削除"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            {/* 時間帯リスト */}
                            {group.items.length === 1 && !group.items[0].slot.start_time ? (
                              // 時間設定なしの単一スロット → 時間行を表示しない
                              null
                            ) : (
                              <div className="divide-y divide-purple-100">
                                {group.items.map(({ slot, globalIndex }) => (
                                  <div key={globalIndex} className="flex items-center justify-between px-3 py-2">
                                    {slot.start_time && slot.end_time ? (
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="time"
                                          value={slot.start_time}
                                          onChange={(e) => updateSlotTime(globalIndex, 'start_time', e.target.value)}
                                          className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-900"
                                        />
                                        <span className="text-gray-400">〜</span>
                                        <input
                                          type="time"
                                          value={slot.end_time}
                                          onChange={(e) => updateSlotTime(globalIndex, 'end_time', e.target.value)}
                                          className="px-2 py-1 text-xs border border-gray-300 rounded text-gray-900"
                                        />
                                      </div>
                                    ) : (
                                      <span className="text-xs text-gray-500">時間未設定</span>
                                    )}
                                    {group.items.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeSlot(globalIndex)}
                                        className="p-1 text-red-400 hover:bg-red-100 rounded transition-colors"
                                        title="この時間帯を削除"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">
                    カレンダーから候補日を選択してください
                  </p>
                )}

                <div className="mt-3 pt-3 border-t text-sm font-semibold text-purple-600">
                  {(() => {
                    const uniqueDates = new Set(slots.map(s => s.date)).size;
                    return slots.length > uniqueDates
                      ? `合計: ${slots.length}件（${uniqueDates}日）`
                      : `合計: ${slots.length}日`;
                  })()}
                </div>
              </div>

              {/* エラー表示 */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* 作成/更新ボタン */}
              <button
                type="submit"
                disabled={submitting || !title.trim() || slots.length === 0}
                className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:bg-purple-700"
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    {isEditMode ? '更新中...' : '作成中...'}
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    {isEditMode ? '出欠表を更新' : '出欠表を作成'}
                  </>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center">
                {isEditMode
                  ? '変更内容は即座に反映されます'
                  : 'ログイン不要・無料で何度でも作成できます'}
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

      {/* オンボーディングモーダル */}
      {showOnboarding && (
        <OnboardingModal
          storageKey="attendance_editor_onboarding_dismissed"
          title="出欠表の作り方"
          pages={[{
            subtitle: '基本的な操作をご紹介します',
            items: [
              { icon: Calendar, iconColor: 'purple', title: 'カレンダーで日程選択', description: 'カレンダー上の日付をクリックして候補日を追加します。もう一度クリックで解除できます。' },
              { icon: Clock, iconColor: 'blue', title: '時間帯の設定（任意）', description: '「時間帯を設定する」をONにすると、各日程に時間枠を追加できます。複数の時間帯も設定可能です。' },
              { icon: Users, iconColor: 'teal', title: '参加者が回答', description: '保存後、共有URLを送ると参加者が出欠を回答できます。回答結果は自動で集計されます。' },
              { icon: CalendarDays, iconColor: 'amber', title: 'タイトルと説明を忘れずに', description: 'イベント名と説明を入力すると、参加者にわかりやすくなります。' },
            ],
          }]}
          gradientFrom="from-purple-500"
          gradientTo="to-indigo-500"
          onDismiss={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}

// Suspenseでラップしたページコンポーネント
export default function AttendanceEditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-600" size={48} />
      </div>
    }>
      <AttendanceEditorContent />
    </Suspense>
  );
}
