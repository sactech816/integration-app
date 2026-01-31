'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  CalendarDays,
  CalendarCheck,
  CalendarClock,
  Clock,
  FileText,
  Loader2,
  Check,
  Copy,
  ExternalLink,
  X,
  Grid3X3,
  LayoutGrid,
  Trash2,
  Save,
} from 'lucide-react';
import { CreateBookingMenuInput, BookingMenuType, BookingSlotWithAvailability, BookingMenu, UpdateBookingMenuInput } from '@/types/booking';
import WeeklyCalendar, { LocalSlot } from './WeeklyCalendar';
import MonthlyCalendar from './MonthlyCalendar';
import SlotModal, { SlotFormData } from './SlotModal';
import CreationCompleteModal from '@/components/shared/CreationCompleteModal';

interface BookingEditorProps {
  userId?: string | null;
  // 新規作成モード用
  onSave?: (
    menuData: CreateBookingMenuInput,
    slots: LocalSlot[]
  ) => Promise<{ success: boolean; menuId?: string; editKey?: string; error?: string }>;
  // 編集モード用
  mode?: 'create' | 'edit';
  existingMenu?: BookingMenu;
  existingSlots?: BookingSlotWithAvailability[];
  editKey?: string | null;
  onUpdate?: (
    menuData: UpdateBookingMenuInput,
    newSlots: LocalSlot[],
    deletedSlotIds: string[]
  ) => Promise<{ success: boolean; error?: string }>;
  // ログインモーダル表示用
  setShowAuth?: (show: boolean) => void;
}

type CalendarView = 'week' | 'month';

export default function BookingEditor({ 
  userId, 
  onSave,
  mode = 'create',
  existingMenu,
  existingSlots = [],
  editKey,
  onUpdate,
  setShowAuth,
}: BookingEditorProps) {
  const router = useRouter();
  
  // フォーム状態
  const [formData, setFormData] = useState<CreateBookingMenuInput>({
    title: '',
    description: '',
    contact_method: '',
    duration_min: 60,
    type: 'reservation',
    is_active: true,
    notification_email: '',
  });
  
  // カレンダー状態
  const [calendarView, setCalendarView] = useState<CalendarView>('week');
  const [localSlots, setLocalSlots] = useState<LocalSlot[]>([]);
  const [savedSlots, setSavedSlots] = useState<BookingSlotWithAvailability[]>([]);
  const [deletedSlotIds, setDeletedSlotIds] = useState<string[]>([]);
  
  // モーダル状態
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedHour, setSelectedHour] = useState(10);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]); // 複数選択用
  const [slotModalMode, setSlotModalMode] = useState<'single' | 'bulk'>('single');
  
  // 保存状態
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // 完了モーダル
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [createdMenuId, setCreatedMenuId] = useState<string | null>(null);
  const [createdEditKey, setCreatedEditKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // 編集モード時に既存データを読み込む
  useEffect(() => {
    if (mode === 'edit' && existingMenu) {
      setFormData({
        title: existingMenu.title,
        description: existingMenu.description || '',
        contact_method: existingMenu.contact_method || '',
        duration_min: existingMenu.duration_min,
        type: existingMenu.type,
        is_active: existingMenu.is_active,
        notification_email: existingMenu.notification_email || '',
      });
    }
  }, [mode, existingMenu]);

  useEffect(() => {
    if (mode === 'edit' && existingSlots.length > 0) {
      setSavedSlots(existingSlots);
    }
  }, [mode, existingSlots]);

  // 週表示でセルクリック時
  const handleWeekSlotClick = useCallback((date: Date, hour: number) => {
    setSelectedDate(date);
    setSelectedHour(hour);
    setSlotModalMode('single');
    setShowSlotModal(true);
  }, []);

  // 月表示で日付クリック時（複数選択）
  const handleMonthDateToggle = useCallback((date: Date) => {
    setSelectedDates((prev) => {
      const exists = prev.some(d => d.toDateString() === date.toDateString());
      if (exists) {
        return prev.filter(d => d.toDateString() !== date.toDateString());
      } else {
        return [...prev, date];
      }
    });
  }, []);

  // 一括追加ボタンクリック
  const handleBulkAdd = useCallback(() => {
    if (selectedDates.length > 0) {
      setSlotModalMode('bulk');
      setShowSlotModal(true);
    }
  }, [selectedDates]);

  // 枠追加
  const handleAddSlot = useCallback((data: SlotFormData) => {
    const newSlot: LocalSlot = {
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: data.date,
      startHour: data.startHour,
      startMinute: data.startMinute,
      endHour: Math.floor((data.startHour * 60 + data.startMinute + formData.duration_min) / 60),
      endMinute: (data.startHour * 60 + data.startMinute + formData.duration_min) % 60,
      isNew: true,
    };
    
    setLocalSlots((prev) => [...prev, newSlot]);
    
    // 単一追加の場合はモーダルを閉じる
    if (slotModalMode === 'single') {
      setShowSlotModal(false);
    }
  }, [formData.duration_min, slotModalMode]);

  // 一括追加完了時
  const handleBulkAddComplete = useCallback(() => {
    setShowSlotModal(false);
    setSelectedDates([]);
  }, []);

  // 枠削除
  const handleDeleteSlot = useCallback((slotId: string, isLocal?: boolean) => {
    if (isLocal) {
      setLocalSlots((prev) => prev.filter((s) => s.id !== slotId));
    } else {
      // 保存済み枠の場合は削除リストに追加
      setDeletedSlotIds((prev) => [...prev, slotId]);
      setSavedSlots((prev) => prev.filter((s) => s.id !== slotId));
    }
  }, []);

  // 選択日付クリア
  const handleClearSelectedDates = useCallback(() => {
    setSelectedDates([]);
  }, []);

  // 保存処理（新規作成）
  const handleCreate = async () => {
    if (!onSave) return;
    
    if (!formData.title.trim()) {
      setError('タイトルを入力してください');
      return;
    }
    
    if (localSlots.length === 0) {
      setError('少なくとも1つの予約枠を追加してください');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const result = await onSave(formData, localSlots);
      
      if (result.success && result.menuId) {
        setCreatedMenuId(result.menuId);
        setCreatedEditKey(result.editKey || null);
        setShowCompleteModal(true);
      } else {
        setError(result.error || '保存に失敗しました');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('保存中にエラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  };

  // 更新処理（編集モード）
  const handleUpdate = async () => {
    if (!onUpdate) return;
    
    // 編集にはログインが必要（編集キーがない場合）
    if (!userId && !editKey) {
      if (confirm('編集・更新にはログインが必要です。ログイン画面を開きますか？')) {
        setShowAuth?.(true);
      }
      return;
    }
    
    if (!formData.title.trim()) {
      setError('タイトルを入力してください');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    setSuccess(false);
    
    try {
      const result = await onUpdate(
        {
          title: formData.title,
          description: formData.description,
          contact_method: formData.contact_method,
          duration_min: formData.duration_min,
          type: formData.type,
          is_active: formData.is_active,
          notification_email: formData.notification_email,
        },
        localSlots,
        deletedSlotIds
      );
      
      if (result.success) {
        setSuccess(true);
        // 新規追加した枠をクリア（保存済みになったため）
        setLocalSlots([]);
        setDeletedSlotIds([]);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || '更新に失敗しました');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('更新中にエラーが発生しました');
    } finally {
      setSubmitting(false);
    }
  };

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'edit') {
      await handleUpdate();
    } else {
      await handleCreate();
    }
  };

  // URLコピー
  const copyUrl = () => {
    const menuId = mode === 'edit' ? existingMenu?.id : createdMenuId;
    if (menuId) {
      const url = `${window.location.origin}/booking/${menuId}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // テーマカラー
  const themeColor = formData.type === 'adjustment' ? 'purple' : 'blue';

  // 全ての枠（保存済み + ローカル）の数
  const totalSlotCount = savedSlots.length + localSlots.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* 完了モーダル（新規作成時のみ） */}
      <CreationCompleteModal
        isOpen={showCompleteModal && !!createdMenuId && mode === 'create'}
        onClose={() => {
          const editUrl = createdEditKey 
            ? `/booking/edit/${createdMenuId}?key=${createdEditKey}`
            : `/booking/edit/${createdMenuId}`;
          router.push(editUrl);
        }}
        title={formData.type === 'adjustment' ? '日程調整' : '予約メニュー'}
        publicUrl={typeof window !== 'undefined' && createdMenuId ? `${window.location.origin}/booking/${createdMenuId}` : ''}
        contentTitle={formData.title ? `「${formData.title}」を作りました！` : undefined}
        theme={formData.type === 'adjustment' ? 'purple' : 'blue'}
        extraContent={
          !userId && createdEditKey ? (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800 font-semibold mb-2">
                ⚠️ 重要：この編集キーを必ず保存してください
              </p>
              <p className="text-xs text-amber-700 mb-3">
                ログインしていないため、このキーを使って編集できます。
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={createdEditKey}
                  readOnly
                  className="flex-1 px-3 py-2 border border-amber-300 rounded-lg bg-white text-gray-900 font-mono text-sm"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(createdEditKey);
                  }}
                  className="p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>
          ) : undefined
        }
        customButtons={
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                const editUrl = createdEditKey 
                  ? `/booking/edit/${createdMenuId}?key=${createdEditKey}`
                  : `/booking/edit/${createdMenuId}`;
                router.push(editUrl);
              }}
              className={`w-full py-3 px-6 border-2 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                formData.type === 'adjustment'
                  ? 'border-purple-300 text-purple-700 hover:bg-purple-50'
                  : 'border-blue-300 text-blue-700 hover:bg-blue-50'
              }`}
            >
              <Calendar size={18} />
              予約枠を修正する
            </button>
            <button
              onClick={() => router.push('/dashboard?view=booking')}
              className="w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              ダッシュボードへ戻る
            </button>
          </div>
        }
      />

      {/* 枠追加モーダル */}
      <SlotModal
        isOpen={showSlotModal}
        onClose={() => {
          setShowSlotModal(false);
          if (slotModalMode === 'bulk') {
            handleBulkAddComplete();
          }
        }}
        onSubmit={handleAddSlot}
        selectedDate={selectedDate}
        selectedHour={selectedHour}
        durationMin={formData.duration_min}
        menuType={formData.type}
        mode={slotModalMode}
        selectedDates={selectedDates}
      />

      {/* メインコンテンツ */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ヘッダー */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
              formData.type === 'adjustment'
                ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                : 'bg-gradient-to-br from-blue-500 to-indigo-600'
            }`}>
              <Calendar className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {mode === 'edit' 
                  ? `${formData.type === 'adjustment' ? '日程調整' : '予約メニュー'}を編集`
                  : `${formData.type === 'adjustment' ? '日程調整' : '予約メニュー'}を作成`
                }
              </h1>
              <p className="text-sm text-gray-500">
                {mode === 'edit'
                  ? '基本情報の変更や予約枠の追加・削除ができます'
                  : '基本情報を入力し、カレンダーで予約枠を設定してください'
                }
              </p>
            </div>
          </div>
        </div>

        {/* 2カラムレイアウト */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* 左カラム: フォーム */}
            <div className="lg:col-span-2 space-y-4">
              {/* 編集モード時の注意書き */}
              {mode === 'edit' && editKey && !userId && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-sm text-amber-800">
                    ⚠️ 編集キーで編集しています。ログインすると、マイページで一括管理できます。
                  </p>
                </div>
              )}

              {/* メニュータイプ選択 */}
              <div className="bg-white rounded-2xl shadow-lg p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CalendarCheck size={20} className={formData.type === 'adjustment' ? 'text-purple-600' : 'text-blue-600'} />
                  タイプ選択
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'reservation' })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.type === 'reservation'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarCheck size={18} className={formData.type === 'reservation' ? 'text-blue-600' : 'text-gray-400'} />
                      <span className={`font-bold text-sm ${formData.type === 'reservation' ? 'text-blue-700' : 'text-gray-700'}`}>
                        予約
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      空いている枠から選んで予約
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'adjustment' })}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.type === 'adjustment'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarClock size={18} className={formData.type === 'adjustment' ? 'text-purple-600' : 'text-gray-400'} />
                      <span className={`font-bold text-sm ${formData.type === 'adjustment' ? 'text-purple-700' : 'text-gray-700'}`}>
                        日程調整
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      候補日から都合の良い日を選択
                    </p>
                  </button>
                </div>
              </div>

              {/* 基本情報 */}
              <div className="bg-white rounded-2xl shadow-lg p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={20} className={formData.type === 'adjustment' ? 'text-purple-600' : 'text-blue-600'} />
                  基本情報
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      タイトル<span className="text-red-500 font-bold">（必須）</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder={formData.type === 'adjustment' ? '例: チーム定例MTG日程調整' : '例: 30分無料相談'}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 ${
                        formData.type === 'adjustment' ? 'focus:ring-purple-500' : 'focus:ring-blue-500'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      説明（任意）
                    </label>
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="メニューの説明を入力してください"
                      rows={3}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent transition-all resize-none text-gray-900 placeholder:text-gray-400 ${
                        formData.type === 'adjustment' ? 'focus:ring-purple-500' : 'focus:ring-blue-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      コンタクト方法（任意）
                    </label>
                    <textarea
                      value={formData.contact_method || ''}
                      onChange={(e) => setFormData({ ...formData, contact_method: e.target.value })}
                      placeholder="ZOOM・GoogleMeet／場所・会場など"
                      rows={3}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent transition-all resize-none text-gray-900 placeholder:text-gray-400 ${
                        formData.type === 'adjustment' ? 'focus:ring-purple-500' : 'focus:ring-blue-500'
                      }`}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      予約完了時に表示されます
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Clock size={16} />
                      所要時間
                    </label>
                    <select
                      value={formData.duration_min}
                      onChange={(e) => setFormData({ ...formData, duration_min: Number(e.target.value) })}
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent transition-all text-gray-900 ${
                        formData.type === 'adjustment' ? 'focus:ring-purple-500' : 'focus:ring-blue-500'
                      }`}
                    >
                      <option value={15}>15分</option>
                      <option value={30}>30分</option>
                      <option value={45}>45分</option>
                      <option value={60}>60分</option>
                      <option value={90}>90分</option>
                      <option value={120}>120分</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      通知先メールアドレス（任意）
                    </label>
                    <input
                      type="email"
                      value={formData.notification_email || ''}
                      onChange={(e) => setFormData({ ...formData, notification_email: e.target.value })}
                      placeholder="予約通知を受け取るメールアドレス"
                      className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent transition-all text-gray-900 placeholder:text-gray-400 ${
                        formData.type === 'adjustment' ? 'focus:ring-purple-500' : 'focus:ring-blue-500'
                      }`}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      予約が入った際に通知メールを受け取るアドレスを指定できます
                    </p>
                  </div>

                  {/* 公開設定（編集モード時のみ表示） */}
                  {mode === 'edit' && (
                    <div className="flex items-center gap-3 pt-2">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className={`w-5 h-5 border-gray-300 rounded focus:ring-2 ${
                          formData.type === 'adjustment' ? 'text-purple-600 focus:ring-purple-500' : 'text-blue-600 focus:ring-blue-500'
                        }`}
                      />
                      <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                        このメニューを公開する
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* 追加済み枠サマリー */}
              <div className="bg-white rounded-2xl shadow-lg p-5">
                <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <CalendarDays size={20} className={formData.type === 'adjustment' ? 'text-purple-600' : 'text-blue-600'} />
                  {mode === 'edit' ? '予約枠' : '追加済みの枠'}
                </h2>
                
                {/* 保存済み枠 */}
                {savedSlots.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2">保存済み ({savedSlots.length}枠)</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {savedSlots
                        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                        .map((slot) => {
                          const startDate = new Date(slot.start_time);
                          const endDate = new Date(slot.end_time);
                          return (
                            <div
                              key={slot.id}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                formData.type === 'adjustment'
                                  ? 'bg-purple-50 border-purple-200'
                                  : 'bg-blue-50 border-blue-200'
                              }`}
                            >
                              <div className="text-sm">
                                <span className="font-semibold text-gray-900">
                                  {startDate.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })}
                                </span>
                                <span className="text-gray-600 ml-2">
                                  {startDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                  〜
                                  {endDate.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                                {slot.current_bookings > 0 && (
                                  <span className="ml-2 text-xs text-orange-600">
                                    ({slot.current_bookings}件予約あり)
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteSlot(slot.id, false)}
                                disabled={slot.current_bookings > 0}
                                className={`p-1 rounded transition-colors ${
                                  slot.current_bookings > 0
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-red-500 hover:bg-red-100'
                                }`}
                                title={slot.current_bookings > 0 ? '予約があるため削除できません' : '削除'}
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* 新規追加枠 */}
                {localSlots.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-green-600 mb-2">新規追加 ({localSlots.length}枠)</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {localSlots
                        .sort((a, b) => a.date.getTime() - b.date.getTime() || a.startHour - b.startHour)
                        .map((slot) => (
                          <div
                            key={slot.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-green-50 border-green-200"
                          >
                            <div className="text-sm">
                              <span className="font-semibold text-gray-900">
                                {slot.date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', weekday: 'short' })}
                              </span>
                              <span className="text-gray-600 ml-2">
                                {slot.startHour.toString().padStart(2, '0')}:{slot.startMinute.toString().padStart(2, '0')}
                                〜
                                {slot.endHour.toString().padStart(2, '0')}:{slot.endMinute.toString().padStart(2, '0')}
                              </span>
                              <span className="ml-2 text-xs text-green-600 font-semibold">NEW</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteSlot(slot.id, true)}
                              className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {totalSlotCount === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    カレンダーをクリックして枠を追加してください
                  </p>
                )}

                <div className={`mt-3 pt-3 border-t text-sm font-semibold ${
                  formData.type === 'adjustment' ? 'text-purple-600' : 'text-blue-600'
                }`}>
                  合計: {totalSlotCount}枠
                </div>
              </div>

              {/* 成功メッセージ */}
              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <CalendarCheck size={20} />
                  保存しました
                </div>
              )}

              {/* エラー表示 */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* 保存ボタン */}
              <button
                type="submit"
                disabled={submitting || !formData.title.trim() || (mode === 'create' && localSlots.length === 0)}
                className={`w-full py-4 text-white rounded-xl font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg ${
                  formData.type === 'adjustment'
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    {mode === 'edit' ? '保存中...' : '作成中...'}
                  </>
                ) : (
                  <>
                    {mode === 'edit' ? <Save size={20} /> : <Check size={20} />}
                    {mode === 'edit' ? '変更を保存' : '保存して公開'}
                  </>
                )}
              </button>

              {!userId && mode === 'create' && (
                <p className="text-xs text-gray-500 text-center">
                  ログインしていないため、作成後に編集キーが発行されます
                </p>
              )}

              {/* 編集モード時の公開URLコピー */}
              {mode === 'edit' && existingMenu && (
                <div className="bg-white rounded-2xl shadow-lg p-5">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">公開URL</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/booking/${existingMenu.id}`}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-sm"
                    />
                    <button
                      type="button"
                      onClick={copyUrl}
                      className={`p-2 text-white rounded-lg transition-colors ${
                        formData.type === 'adjustment'
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 右カラム: カレンダー */}
            <div className="lg:col-span-3 space-y-4">
              {/* カレンダー表示切り替え */}
              <div className="bg-white rounded-2xl shadow-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Calendar size={20} className={formData.type === 'adjustment' ? 'text-purple-600' : 'text-blue-600'} />
                    予約枠を設定
                  </h2>
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => setCalendarView('week')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                        calendarView === 'week'
                          ? formData.type === 'adjustment'
                            ? 'bg-purple-600 text-white'
                            : 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Grid3X3 size={16} />
                      週表示
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalendarView('month')}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                        calendarView === 'month'
                          ? formData.type === 'adjustment'
                            ? 'bg-purple-600 text-white'
                            : 'bg-blue-600 text-white'
                          : 'text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <LayoutGrid size={16} />
                      月表示
                    </button>
                  </div>
                </div>

                {/* 複数選択UI（週表示・月表示共通） */}
                <div className={`mb-4 p-3 rounded-xl ${
                  formData.type === 'adjustment' ? 'bg-purple-50' : 'bg-blue-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        複数日程を選択して一括追加
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedDates.length > 0 
                          ? `${selectedDates.length}日選択中`
                          : calendarView === 'week'
                            ? '曜日ヘッダーをクリックして日付を選択'
                            : 'カレンダーで日付をクリックして選択'}
                      </p>
                    </div>
                    {selectedDates.length > 0 && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleClearSelectedDates}
                          className="px-3 py-1.5 text-sm font-semibold border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          クリア
                        </button>
                        <button
                          type="button"
                          onClick={handleBulkAdd}
                          className={`px-3 py-1.5 text-sm font-semibold text-white rounded-lg transition-colors ${
                            formData.type === 'adjustment'
                              ? 'bg-purple-600 hover:bg-purple-700'
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                        >
                          時間を設定して追加
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* カレンダー本体 */}
                {calendarView === 'week' ? (
                  <WeeklyCalendar
                    slots={savedSlots}
                    localSlots={localSlots}
                    onSlotClick={handleWeekSlotClick}
                    onSlotDelete={handleDeleteSlot}
                    durationMin={formData.duration_min}
                    menuType={formData.type}
                    multiSelect={true}
                    selectedDates={selectedDates}
                    onDateToggle={handleMonthDateToggle}
                  />
                ) : (
                  <MonthlyCalendar
                    slots={savedSlots}
                    localSlots={localSlots}
                    selectedDates={selectedDates}
                    onDateToggle={handleMonthDateToggle}
                    multiSelect={true}
                    menuType={formData.type}
                  />
                )}

                {/* 操作ヒント */}
                <div className="mt-4 text-xs text-gray-500 text-center">
                  {calendarView === 'week' 
                    ? '曜日ヘッダーをクリックで日付選択、セルをクリックで1枠追加'
                    : '日付をクリックして選択し、「時間を設定して追加」で一括追加'}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
