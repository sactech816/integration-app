'use client';

import { Calendar } from 'lucide-react';
import {
  AttendanceTableData,
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

interface AttendanceTableProps {
  data: AttendanceTableData;
}

/**
 * 出欠表テーブルコンポーネント
 * 候補日ごとの参加者の回答を表形式で表示
 */
export default function AttendanceTable({ data }: AttendanceTableProps) {
  if (data.slots.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
        <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">候補日が設定されていません</h3>
        <p className="text-gray-600">この出欠表には候補日がありません。</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 overflow-x-auto">
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
              {data.slots.map((slotSummary) => (
                <th
                  key={slotSummary.slot_index}
                  className={`text-center p-3 font-semibold text-gray-700 border-l border-gray-200 min-w-[100px] ${
                    data.best_slot_index === slotSummary.slot_index
                      ? 'bg-green-50 border-green-300'
                      : ''
                  }`}
                >
                  <div className="text-sm">{formatDate(slotSummary.slot.date)}</div>
                  {slotSummary.slot.start_time && slotSummary.slot.end_time && (
                    <div className="text-xs text-gray-500 mt-1">
                      {formatTime(slotSummary.slot.start_time)} - {formatTime(slotSummary.slot.end_time)}
                    </div>
                  )}
                  {data.best_slot_index === slotSummary.slot_index && (
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
              {data.slots.map((slotSummary) => (
                <td
                  key={slotSummary.slot_index}
                  className="text-center p-2 text-xs text-gray-600 border-l border-gray-200"
                >
                  <div>
                    <span className="text-green-600 font-semibold">{slotSummary.yes_count}</span> /
                    <span className="text-red-600 font-semibold"> {slotSummary.no_count}</span> /
                    <span className="text-yellow-600 font-semibold"> {slotSummary.maybe_count}</span>
                  </div>
                  <div className="text-gray-500 mt-1">({slotSummary.available_count}名参加可能)</div>
                </td>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.participants.length > 0 ? (
              data.participants.map((participant) => (
                <tr key={participant.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 font-medium text-gray-900 sticky left-0 bg-white z-10">
                    {participant.participant_name}
                  </td>
                  {data.slots.map((slotSummary) => {
                    const status = participant.responses[slotSummary.slot_index] as
                      | AttendanceStatus
                      | undefined;
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
                <td colSpan={data.slots.length + 1} className="text-center py-8 text-gray-500">
                  まだ回答がありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
