'use client';

import { useState } from 'react';
import { User, Mail, Check, Loader2, AlertCircle } from 'lucide-react';
import {
  SlotSummary,
  AttendanceStatus,
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_ICONS,
  ATTENDANCE_STATUS_COLORS,
} from '@/types/attendance';

// 日付フォーマット
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  });
};

const formatTime = (time?: string) => {
  if (!time) return '';
  return time;
};

interface AttendanceFormProps {
  slots: SlotSummary[];
  onSubmit: (data: {
    participant_name: string;
    participant_email?: string;
    responses: Record<number, AttendanceStatus>;
  }) => Promise<boolean>;
}

/**
 * 出欠入力フォームコンポーネント
 * 参加者が各候補日に対して○△×を入力
 */
export default function AttendanceForm({ slots, onSubmit }: AttendanceFormProps) {
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [responses, setResponses] = useState<Record<number, AttendanceStatus>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 回答変更
  const handleResponseChange = (slotIndex: number, status: AttendanceStatus) => {
    setResponses({
      ...responses,
      [slotIndex]: status,
    });
  };

  // 送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!participantName.trim()) {
      setError('お名前を入力してください');
      return;
    }

    if (Object.keys(responses).length === 0) {
      setError('少なくとも1つの候補日に回答してください');
      return;
    }

    setSubmitting(true);
    setError(null);

    const success = await onSubmit({
      participant_name: participantName.trim(),
      participant_email: participantEmail.trim() || undefined,
      responses,
    });

    if (success) {
      // フォームをリセット
      setParticipantName('');
      setParticipantEmail('');
      setResponses({});
    }

    setSubmitting(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <User size={20} className="text-purple-600" />
        出欠を登録
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
            placeholder="example@email.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            各日程への出欠を選択してください
          </label>
          <div className="space-y-3">
            {slots.map((slotSummary) => {
              const currentStatus = responses[slotSummary.slot_index];

              return (
                <div
                  key={slotSummary.slot_index}
                  className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 transition-colors"
                >
                  <div className="font-semibold text-gray-900 mb-3">
                    {formatDate(slotSummary.slot.date)}
                    {slotSummary.slot.start_time && slotSummary.slot.end_time && (
                      <span className="text-gray-600 ml-2">
                        {formatTime(slotSummary.slot.start_time)} - {formatTime(slotSummary.slot.end_time)}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {(['yes', 'maybe', 'no'] as AttendanceStatus[]).map((status) => {
                      const config = ATTENDANCE_STATUS_COLORS[status];
                      const isSelected = currentStatus === status;

                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => handleResponseChange(slotSummary.slot_index, status)}
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !participantName.trim() || Object.keys(responses).length === 0}
          className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              送信中...
            </>
          ) : (
            <>
              <Check size={20} />
              出欠を登録
            </>
          )}
        </button>
      </form>
    </div>
  );
}
