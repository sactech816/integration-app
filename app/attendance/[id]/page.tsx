'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users,
  Loader2,
  Check,
  Copy,
  ExternalLink,
  Plus,
  ArrowLeft,
  AlertCircle,
  User,
  Mail,
  Calendar,
} from 'lucide-react';
import ContentFooter from '@/components/shared/ContentFooter';
import {
  AttendanceTableData,
  AttendanceStatus,
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_ICONS,
  ATTENDANCE_STATUS_COLORS,
} from '@/types/attendance';
import { getAttendanceTableData, submitAttendanceResponse } from '@/app/actions/attendance';

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

export default function AttendancePublicPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [tableData, setTableData] = useState<AttendanceTableData | null>(null);

  // 入力フォーム状態
  const [participantName, setParticipantName] = useState('');
  const [participantEmail, setParticipantEmail] = useState('');
  const [responses, setResponses] = useState<Record<number, AttendanceStatus>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitComplete, setSubmitComplete] = useState(false);

  // URL共有
  const [urlCopied, setUrlCopied] = useState(false);

  // データ読み込み
  useEffect(() => {
    const loadData = async () => {
      const data = await getAttendanceTableData(eventId);
      if (!data) {
        setNotFound(true);
      } else {
        setTableData(data);
      }
      setLoading(false);
    };

    loadData();
  }, [eventId]);

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
      setSubmitError('お名前を入力してください');
      return;
    }

    if (Object.keys(responses).length === 0) {
      setSubmitError('少なくとも1つの候補日に回答してください');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const result = await submitAttendanceResponse({
      event_id: eventId,
      participant_name: participantName.trim(),
      participant_email: participantEmail.trim() || undefined,
      responses,
    });

    if (result.success) {
      setSubmitComplete(true);
      // データを再読み込み
      const updatedData = await getAttendanceTableData(eventId);
      if (updatedData) {
        setTableData(updatedData);
      }
      // フォームをリセット
      setParticipantName('');
      setParticipantEmail('');
      setResponses({});
    } else {
      setSubmitError('error' in result ? result.error : '送信に失敗しました');
    }

    setSubmitting(false);
  };

  // URLコピー
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
            <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">出欠表が見つかりません</h1>
            <p className="text-gray-600 mb-6">
              このページは存在しないか、削除された可能性があります。
            </p>
            <Link
              href="/attendance/new"
              className="inline-flex items-center gap-2 text-purple-600 font-semibold hover:underline"
            >
              <Plus size={18} />
              新しい出欠表を作成
            </Link>
          </div>
        </div>
        <ContentFooter toolType="attendance" variant="light" />
      </div>
    );
  }

  const event = tableData!.event;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                <Users className="text-white" size={28} />
              </div>
              <div>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-1 bg-purple-100 text-purple-700">
                  出欠表
                </span>
                <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
                {event.description && (
                  <p className="text-gray-600 mt-1">{event.description}</p>
                )}
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleCopyUrl}
                className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-semibold"
              >
                {urlCopied ? <Check size={18} /> : <Copy size={18} />}
                <span className="hidden sm:inline">{urlCopied ? 'コピーしました' : 'URLをコピー'}</span>
              </button>
              <button
                onClick={() => router.push('/attendance/new')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">新規作成</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-8 w-full">
        {/* 送信完了メッセージ */}
        {submitComplete && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">出欠を登録しました！</h2>
            <p className="text-gray-600 mb-6">
              ご回答ありがとうございます。
            </p>
            <button
              onClick={() => setSubmitComplete(false)}
              className="text-purple-600 font-semibold hover:underline"
            >
              続けて登録する
            </button>
          </div>
        )}

        {/* 出欠表 */}
        {tableData && tableData.slots.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 overflow-x-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-purple-600" />
              出欠表
            </h2>
            <div className="min-w-full">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-3 font-semibold text-gray-700 sticky left-0 bg-white z-10 min-w-[120px]">
                      参加者
                    </th>
                    {tableData.slots.map((slotSummary) => (
                      <th
                        key={slotSummary.slot_index}
                        className={`text-center p-3 font-semibold text-gray-700 border-l border-gray-200 min-w-[100px] ${
                          tableData.best_slot_index === slotSummary.slot_index
                            ? 'bg-green-50 border-green-300'
                            : ''
                        }`}
                      >
                        <div className="text-sm">
                          {formatDate(slotSummary.slot.date)}
                        </div>
                        {slotSummary.slot.start_time && slotSummary.slot.end_time && (
                          <div className="text-xs text-gray-500 mt-1">
                            {formatTime(slotSummary.slot.start_time)} - {formatTime(slotSummary.slot.end_time)}
                          </div>
                        )}
                        {tableData.best_slot_index === slotSummary.slot_index && (
                          <div className="text-xs text-green-600 font-bold mt-1">★ 候補</div>
                        )}
                      </th>
                    ))}
                  </tr>
                  {/* 集計行 */}
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <td className="p-2 text-xs text-gray-600 font-medium sticky left-0 bg-gray-50 z-10">
                      参加可/不可/未定
                    </td>
                    {tableData.slots.map((slotSummary) => (
                      <td key={slotSummary.slot_index} className="text-center p-2 text-xs text-gray-600 border-l border-gray-200">
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
                  {tableData.participants.length > 0 ? (
                    tableData.participants.map((participant) => (
                      <tr key={participant.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-900 sticky left-0 bg-white z-10">
                          {participant.participant_name}
                        </td>
                        {tableData.slots.map((slotSummary) => {
                          const status = participant.responses[slotSummary.slot_index] as AttendanceStatus | undefined;
                          const statusConfig = status
                            ? ATTENDANCE_STATUS_COLORS[status]
                            : { bg: 'bg-gray-50', text: 'text-gray-400', border: 'border-gray-200' };
                          const icon = status ? ATTENDANCE_STATUS_ICONS[status] : '-';
                          const label = status ? ATTENDANCE_STATUS_LABELS[status] : '未回答';

                          return (
                            <td
                              key={slotSummary.slot_index}
                              className={`text-center p-3 border-l border-gray-200 ${statusConfig.bg} ${statusConfig.text}`}
                              title={label}
                            >
                              <span className="text-xl font-bold">{icon}</span>
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={tableData.slots.length + 1}
                        className="text-center py-8 text-gray-500"
                      >
                        まだ回答がありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center mb-6">
            <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-bold text-gray-900 mb-2">候補日が設定されていません</h3>
            <p className="text-gray-600">
              この出欠表には候補日がありません。
            </p>
          </div>
        )}

        {/* 出欠入力フォーム */}
        {tableData && tableData.slots.length > 0 && (
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
                  {tableData.slots.map((slotSummary) => {
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

              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                  <AlertCircle size={18} />
                  {submitError}
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
        )}
      </main>

      {/* フッター */}
      <ContentFooter toolType="attendance" variant="light" />
    </div>
  );
}
