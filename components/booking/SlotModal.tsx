'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Users, Calendar, Check, Loader2, Plus, Trash2 } from 'lucide-react';

// 時間帯の型
interface TimeSlot {
  id: string;
  hour: number;
  minute: number;
}

interface SlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SlotFormData) => void;
  selectedDate: Date | null;
  selectedHour?: number;
  durationMin: number;
  menuType: 'reservation' | 'adjustment';
  isSubmitting?: boolean;
  mode?: 'single' | 'bulk'; // 単一追加 or 一括追加
  selectedDates?: Date[]; // 一括追加時の選択日付
}

export interface SlotFormData {
  date: Date;
  startHour: number;
  startMinute: number;
  maxCapacity: number;
}

export interface BulkSlotFormData {
  dates: Date[];
  startHour: number;
  startMinute: number;
  maxCapacity: number;
}

// 日付フォーマット
const formatDate = (date: Date) => {
  return date.toLocaleDateString('ja-JP', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'short'
  });
};

export default function SlotModal({
  isOpen,
  onClose,
  onSubmit,
  selectedDate,
  selectedHour = 10,
  durationMin,
  menuType,
  isSubmitting = false,
  mode = 'single',
  selectedDates = [],
}: SlotModalProps) {
  const [startHour, setStartHour] = useState(selectedHour);
  const [startMinute, setStartMinute] = useState(0);
  const [maxCapacity, setMaxCapacity] = useState(1);
  
  // 複数時間帯選択用（一括追加モード）
  const [multipleTimeSlots, setMultipleTimeSlots] = useState<TimeSlot[]>([]);
  const [isMultiTimeMode, setIsMultiTimeMode] = useState(false);

  // 選択時間が変わったら更新
  useEffect(() => {
    setStartHour(selectedHour);
  }, [selectedHour]);

  // モーダルが開いたときにリセット
  useEffect(() => {
    if (isOpen) {
      setStartHour(selectedHour);
      setStartMinute(0);
      setMaxCapacity(1);
      setMultipleTimeSlots([]);
      setIsMultiTimeMode(false);
    }
  }, [isOpen, selectedHour]);

  if (!isOpen) return null;

  // 時間帯を追加
  const addTimeSlot = () => {
    const newSlot: TimeSlot = {
      id: `time-${Date.now()}`,
      hour: startHour,
      minute: startMinute,
    };
    // 重複チェック
    const isDuplicate = multipleTimeSlots.some(
      slot => slot.hour === newSlot.hour && slot.minute === newSlot.minute
    );
    if (!isDuplicate) {
      setMultipleTimeSlots([...multipleTimeSlots, newSlot]);
    }
  };

  // 時間帯を削除
  const removeTimeSlot = (id: string) => {
    setMultipleTimeSlots(multipleTimeSlots.filter(slot => slot.id !== id));
  };

  // よく使う時間帯をまとめて追加
  const addQuickTimeSlots = (times: { hour: number; minute: number }[]) => {
    const newSlots: TimeSlot[] = [];
    times.forEach(time => {
      const isDuplicate = multipleTimeSlots.some(
        slot => slot.hour === time.hour && slot.minute === time.minute
      );
      if (!isDuplicate) {
        newSlots.push({
          id: `time-${Date.now()}-${time.hour}-${time.minute}`,
          hour: time.hour,
          minute: time.minute,
        });
      }
    });
    setMultipleTimeSlots([...multipleTimeSlots, ...newSlots]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'single' && selectedDate) {
      onSubmit({
        date: selectedDate,
        startHour,
        startMinute,
        maxCapacity,
      });
    } else if (mode === 'bulk' && selectedDates.length > 0) {
      // 一括追加の場合
      if (isMultiTimeMode && multipleTimeSlots.length > 0) {
        // 複数時間帯モード: 各日付 × 各時間帯
        selectedDates.forEach((date) => {
          multipleTimeSlots.forEach((timeSlot) => {
            onSubmit({
              date,
              startHour: timeSlot.hour,
              startMinute: timeSlot.minute,
              maxCapacity,
            });
          });
        });
      } else {
        // 単一時間帯モード: 各日付に対してonSubmitを呼ぶ
        selectedDates.forEach((date) => {
          onSubmit({
            date,
            startHour,
            startMinute,
            maxCapacity,
          });
        });
      }
    }
  };

  // 終了時間を計算
  const endHour = Math.floor((startHour * 60 + startMinute + durationMin) / 60);
  const endMinute = (startHour * 60 + startMinute + durationMin) % 60;

  // テーマカラー
  const themeColor = menuType === 'adjustment' ? 'purple' : 'blue';

  // よく使う時間帯
  const quickTimes = [
    { label: '早朝', hour: 6, minute: 0 },
    { label: '朝', hour: 10, minute: 0 },
    { label: '昼', hour: 13, minute: 0 },
    { label: '夕', hour: 17, minute: 0 },
    { label: '夜', hour: 19, minute: 0 },
    { label: '深夜', hour: 22, minute: 0 },
  ];

  // 追加される枠の総数を計算
  const totalSlotsCount = mode === 'bulk' 
    ? selectedDates.length * (isMultiTimeMode && multipleTimeSlots.length > 0 ? multipleTimeSlots.length : 1)
    : 1;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className={`px-6 py-4 border-b border-gray-200 flex items-center justify-between ${
          menuType === 'adjustment' ? 'bg-purple-50' : 'bg-blue-50'
        } rounded-t-2xl`}>
          <h3 className="text-lg font-bold text-gray-900">
            {mode === 'bulk' ? '一括で枠を追加' : '予約枠を追加'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* フォーム */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* 日付表示 */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
              <Calendar size={16} />
              日付
            </label>
            {mode === 'single' && selectedDate ? (
              <div className={`px-4 py-3 rounded-xl font-medium text-gray-900 ${
                menuType === 'adjustment' ? 'bg-purple-50' : 'bg-blue-50'
              }`}>
                {formatDate(selectedDate)}
              </div>
            ) : mode === 'bulk' && selectedDates.length > 0 ? (
              <div className={`px-4 py-3 rounded-xl max-h-32 overflow-y-auto ${
                menuType === 'adjustment' ? 'bg-purple-50' : 'bg-blue-50'
              }`}>
                <div className="text-sm font-semibold text-gray-700 mb-2">
                  {selectedDates.length}日選択中
                </div>
                <div className="space-y-1">
                  {selectedDates.sort((a, b) => a.getTime() - b.getTime()).map((date, idx) => (
                    <div key={idx} className="text-sm text-gray-700">
                      {formatDate(date)}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 bg-gray-100 rounded-xl text-gray-500">
                日付が選択されていません
              </div>
            )}
          </div>

          {/* 一括追加モード時: 複数時間帯選択の切り替え */}
          {mode === 'bulk' && (
            <div className={`p-3 rounded-xl border-2 ${
              isMultiTimeMode 
                ? menuType === 'adjustment' ? 'border-purple-300 bg-purple-50' : 'border-blue-300 bg-blue-50'
                : 'border-gray-200 bg-gray-50'
            }`}>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isMultiTimeMode}
                  onChange={(e) => setIsMultiTimeMode(e.target.checked)}
                  className={`w-5 h-5 rounded border-gray-300 ${
                    menuType === 'adjustment' ? 'text-purple-600 focus:ring-purple-500' : 'text-blue-600 focus:ring-blue-500'
                  }`}
                />
                <div>
                  <span className="font-semibold text-gray-900">複数の時間帯を追加</span>
                  <p className="text-xs text-gray-500">1日に複数の予約枠を設定できます</p>
                </div>
              </label>
            </div>
          )}

          {/* 複数時間帯モード */}
          {mode === 'bulk' && isMultiTimeMode ? (
            <>
              {/* 追加済みの時間帯一覧 */}
              {multipleTimeSlots.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    追加する時間帯（{multipleTimeSlots.length}件）
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {multipleTimeSlots
                      .sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute))
                      .map((slot) => (
                        <div
                          key={slot.id}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                            menuType === 'adjustment'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          <Clock size={14} />
                          {slot.hour.toString().padStart(2, '0')}:{slot.minute.toString().padStart(2, '0')}
                          <button
                            type="button"
                            onClick={() => removeTimeSlot(slot.id)}
                            className="p-0.5 hover:bg-red-200 rounded transition-colors"
                          >
                            <X size={14} className="text-red-500" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* よく使う時間帯（複数選択可） */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  よく使う時間帯をまとめて追加
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => addQuickTimeSlots([{ hour: 10, minute: 0 }, { hour: 19, minute: 0 }])}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg border-2 transition-colors ${
                      menuType === 'adjustment'
                        ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
                        : 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    朝＋夜（10:00, 19:00）
                  </button>
                  <button
                    type="button"
                    onClick={() => addQuickTimeSlots([{ hour: 10, minute: 0 }, { hour: 13, minute: 0 }, { hour: 19, minute: 0 }])}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg border-2 transition-colors ${
                      menuType === 'adjustment'
                        ? 'border-purple-300 bg-purple-50 text-purple-700 hover:bg-purple-100'
                        : 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'
                    }`}
                  >
                    朝＋昼＋夜
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {quickTimes.map((time) => {
                    const isSelected = multipleTimeSlots.some(
                      slot => slot.hour === time.hour && slot.minute === time.minute
                    );
                    return (
                      <button
                        key={time.label}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setMultipleTimeSlots(multipleTimeSlots.filter(
                              slot => !(slot.hour === time.hour && slot.minute === time.minute)
                            ));
                          } else {
                            addQuickTimeSlots([{ hour: time.hour, minute: time.minute }]);
                          }
                        }}
                        className={`px-3 py-2 text-sm font-semibold rounded-lg border-2 transition-colors ${
                          isSelected
                            ? menuType === 'adjustment'
                              ? 'border-purple-500 bg-purple-100 text-purple-700'
                              : 'border-blue-500 bg-blue-100 text-blue-700'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-xs opacity-75">{time.label}</div>
                        <div>{time.hour}:{time.minute.toString().padStart(2, '0')}</div>
                        {isSelected && <Check size={12} className="mx-auto mt-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* カスタム時間追加 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Plus size={16} />
                  カスタム時間を追加
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(Number(e.target.value))}
                    className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900 text-sm ${
                      menuType === 'adjustment' ? 'focus:ring-purple-500' : 'focus:ring-blue-500'
                    }`}
                  >
                    {Array.from({ length: 25 }, (_, i) => i).map((hour) => (
                      <option key={hour} value={hour}>
                        {hour.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-500 font-bold">:</span>
                  <select
                    value={startMinute}
                    onChange={(e) => setStartMinute(Number(e.target.value))}
                    className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-gray-900 text-sm ${
                      menuType === 'adjustment' ? 'focus:ring-purple-500' : 'focus:ring-blue-500'
                    }`}
                  >
                    {[0, 15, 30, 45].map((minute) => (
                      <option key={minute} value={minute}>
                        {minute.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={addTimeSlot}
                    className={`px-4 py-2 text-white rounded-lg font-semibold transition-colors ${
                      menuType === 'adjustment'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* 単一時間帯モード（従来のUI） */}
              {/* よく使う時間帯 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  よく使う時間帯
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {quickTimes.map((time) => (
                    <button
                      key={time.label}
                      type="button"
                      onClick={() => {
                        setStartHour(time.hour);
                        setStartMinute(time.minute);
                      }}
                      className={`px-3 py-2 text-sm font-semibold rounded-lg border-2 transition-colors ${
                        startHour === time.hour && startMinute === time.minute
                          ? menuType === 'adjustment'
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-xs opacity-75">{time.label}</div>
                      <div>{time.hour}:{time.minute.toString().padStart(2, '0')}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 開始時間 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Clock size={16} />
                  開始時間
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={startHour}
                    onChange={(e) => setStartHour(Number(e.target.value))}
                    className={`flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent text-gray-900 ${
                      menuType === 'adjustment' ? 'focus:ring-purple-500' : 'focus:ring-blue-500'
                    }`}
                  >
                    {Array.from({ length: 25 }, (_, i) => i).map((hour) => (
                      <option key={hour} value={hour}>
                        {hour.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <span className="text-gray-500 font-bold">:</span>
                  <select
                    value={startMinute}
                    onChange={(e) => setStartMinute(Number(e.target.value))}
                    className={`flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent text-gray-900 ${
                      menuType === 'adjustment' ? 'focus:ring-purple-500' : 'focus:ring-blue-500'
                    }`}
                  >
                    {[0, 15, 30, 45].map((minute) => (
                      <option key={minute} value={minute}>
                        {minute.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 終了時間（表示のみ） */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  終了時間（{durationMin}分後）
                </label>
                <div className="px-4 py-3 bg-gray-100 rounded-xl font-medium text-gray-700">
                  {endHour.toString().padStart(2, '0')}:{endMinute.toString().padStart(2, '0')}
                </div>
              </div>
            </>
          )}

          {/* 最大予約数（予約タイプのみ） */}
          {menuType === 'reservation' && (
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <Users size={16} />
                最大予約数
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
              <p className="text-xs text-gray-500 mt-1">
                この枠に予約できる最大人数
              </p>
            </div>
          )}

          {/* 追加される枠数のサマリー（一括追加モード時） */}
          {mode === 'bulk' && (
            <div className={`p-3 rounded-xl text-sm ${
              menuType === 'adjustment' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
            }`}>
              <div className="font-semibold">
                追加される予約枠: {totalSlotsCount}件
              </div>
              <div className="text-xs opacity-75 mt-1">
                {selectedDates.length}日 × {isMultiTimeMode && multipleTimeSlots.length > 0 ? `${multipleTimeSlots.length}時間帯` : '1時間帯'}
              </div>
            </div>
          )}

          {/* ボタン */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting || 
                (mode === 'single' && !selectedDate) || 
                (mode === 'bulk' && selectedDates.length === 0) ||
                (mode === 'bulk' && isMultiTimeMode && multipleTimeSlots.length === 0)
              }
              className={`flex-1 py-3 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                menuType === 'adjustment'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  追加中...
                </>
              ) : (
                <>
                  <Check size={18} />
                  {mode === 'bulk' ? `${totalSlotsCount}枠を追加` : '追加'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
