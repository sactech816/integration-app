'use client';

import { useState, useEffect } from 'react';
import { X, Clock, Users, Calendar, Check, Loader2 } from 'lucide-react';

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
    }
  }, [isOpen, selectedHour]);

  if (!isOpen) return null;

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
      // 一括追加の場合、各日付に対してonSubmitを呼ぶ
      selectedDates.forEach((date) => {
        onSubmit({
          date,
          startHour,
          startMinute,
          maxCapacity,
        });
      });
    }
  };

  // 終了時間を計算
  const endHour = Math.floor((startHour * 60 + startMinute + durationMin) / 60);
  const endMinute = (startHour * 60 + startMinute + durationMin) % 60;

  // テーマカラー
  const themeColor = menuType === 'adjustment' ? 'purple' : 'blue';

  // よく使う時間帯
  const quickTimes = [
    { label: '朝', hour: 10, minute: 0 },
    { label: '昼', hour: 13, minute: 0 },
    { label: '夕', hour: 17, minute: 0 },
    { label: '夜', hour: 19, minute: 0 },
  ];

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

          {/* よく使う時間帯 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              よく使う時間帯
            </label>
            <div className="grid grid-cols-4 gap-2">
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
                {Array.from({ length: 14 }, (_, i) => i + 8).map((hour) => (
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
              disabled={isSubmitting || (mode === 'single' && !selectedDate) || (mode === 'bulk' && selectedDates.length === 0)}
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
                  {mode === 'bulk' ? `${selectedDates.length}日分追加` : '追加'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
