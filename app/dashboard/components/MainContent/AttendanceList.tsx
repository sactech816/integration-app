'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  Edit,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Trash2,
  CalendarDays,
  Code,
  Lock,
  Heart,
  BarChart2,
  CheckSquare,
  Square,
} from 'lucide-react';
import {
  getAttendanceEvents,
  deleteAttendanceEvent,
  duplicateAttendanceEvent,
  getAttendanceTableData,
} from '@/app/actions/attendance';
import { AttendanceEvent, AttendanceTableData } from '@/types/attendance';

type ViewMode = 'list' | 'results';

type AttendanceListProps = {
  userId: string;
  isAdmin: boolean;
  isUnlocked?: boolean;
};

export default function AttendanceList({ userId, isAdmin, isUnlocked = false }: AttendanceListProps) {
  const router = useRouter();
  const [events, setEvents] = useState<AttendanceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // 結果表示用
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedEvent, setSelectedEvent] = useState<AttendanceEvent | null>(null);
  const [tableData, setTableData] = useState<AttendanceTableData | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);

  // 一括選択機能
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAttendanceEvents(userId);
      setEvents(data);
    } catch (error) {
      console.error('出欠表取得エラー:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadEvents();
    }
  }, [userId, loadEvents]);

  const handleCopyUrl = (eventId: string) => {
    const url = `${window.location.origin}/attendance/${eventId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(eventId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (eventId: string) => {
    setDeletingId(eventId);
    try {
      const result = await deleteAttendanceEvent(eventId, userId);
      if (result.success) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
      } else {
        alert('error' in result ? result.error : '削除に失敗しました');
      }
    } catch (error) {
      console.error('削除エラー:', error);
      alert('削除に失敗しました');
    } finally {
      setDeletingId(null);
      setShowDeleteConfirm(null);
    }
  };

  const handleDuplicate = async (event: AttendanceEvent) => {
    setDuplicatingId(event.id);
    try {
      const result = await duplicateAttendanceEvent(event.id, userId);
      if (result.success && result.data) {
        setEvents((prev) => [result.data, ...prev]);
      } else {
        alert('error' in result ? result.error : '複製に失敗しました');
      }
    } catch (error) {
      console.error('複製エラー:', error);
      alert('複製に失敗しました');
    } finally {
      setDuplicatingId(null);
    }
  };

  // 選択モード切り替え
  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedIds(new Set());
  };

  // アイテム選択/解除
  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // 全選択/全解除
  const toggleSelectAll = () => {
    if (selectedIds.size === events.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(events.map((e) => e.id)));
    }
  };

  // 一括削除
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`${selectedIds.size}件の出欠表を削除しますか？この操作は取り消せません。`)) return;

    setBulkDeleting(true);
    try {
      const deletePromises = Array.from(selectedIds).map((id) =>
        deleteAttendanceEvent(id, userId)
      );
      await Promise.all(deletePromises);
      setEvents((prev) => prev.filter((e) => !selectedIds.has(e.id)));
      setSelectedIds(new Set());
      setSelectMode(false);
    } catch (error) {
      console.error('一括削除エラー:', error);
      alert('一部の削除に失敗しました');
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleCreateNew = () => {
    router.push('/attendance/new');
  };

  const handleEdit = (event: AttendanceEvent) => {
    router.push('/attendance/new');
  };

  const handleViewResults = async (event: AttendanceEvent) => {
    setSelectedEvent(event);
    setLoadingResults(true);
    try {
      const data = await getAttendanceTableData(event.id);
      setTableData(data);
      setViewMode('results');
    } catch (error) {
      console.error('結果取得エラー:', error);
      alert('結果の取得に失敗しました');
    } finally {
      setLoadingResults(false);
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedEvent(null);
    setTableData(null);
    loadEvents();
  };

  // ローディング表示
  if (loading && viewMode === 'list') {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-purple-600" size={32} />
      </div>
    );
  }

  // 結果表示
  if (viewMode === 'results' && selectedEvent && tableData) {
    return (
      <div>
        <button
          onClick={handleBackToList}
          className="mb-4 text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-2"
        >
          ← 一覧に戻る
        </button>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{selectedEvent.title}</h2>
          {selectedEvent.description && (
            <p className="text-sm text-gray-500 mb-4">{selectedEvent.description}</p>
          )}

          {tableData.slots.length === 0 ? (
            <p className="text-center py-4 text-gray-500">候補日がありません</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left p-2 font-semibold text-gray-700 sticky left-0 bg-white z-10 min-w-[100px]">
                      参加者
                    </th>
                    {tableData.slots.map((slotSummary) => (
                      <th
                        key={slotSummary.slot_index}
                        className={`text-center p-2 font-semibold text-gray-700 border-l border-gray-200 min-w-[80px] ${
                          tableData.best_slot_index === slotSummary.slot_index ? 'bg-green-50' : ''
                        }`}
                      >
                        <div className="text-xs">
                          {new Date(slotSummary.slot.date).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                        </div>
                        {slotSummary.slot.start_time && (
                          <div className="text-[10px] text-gray-500">
                            {slotSummary.slot.start_time}
                          </div>
                        )}
                        {tableData.best_slot_index === slotSummary.slot_index && (
                          <div className="text-[10px] text-green-600 font-bold">★候補</div>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.participants.map((participant) => (
                    <tr key={participant.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-2 font-medium text-gray-900 sticky left-0 bg-white z-10">
                        {participant.participant_name}
                      </td>
                      {tableData.slots.map((slotSummary) => {
                        const status = participant.responses[slotSummary.slot_index];
                        const statusConfig = status === 'yes'
                          ? { bg: 'bg-green-50', text: 'text-green-700', icon: '○' }
                          : status === 'no'
                            ? { bg: 'bg-red-50', text: 'text-red-700', icon: '×' }
                            : status === 'maybe'
                              ? { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: '△' }
                              : { bg: 'bg-gray-50', text: 'text-gray-400', icon: '-' };

                        return (
                          <td
                            key={slotSummary.slot_index}
                            className={`text-center p-2 border-l border-gray-200 ${statusConfig.bg} ${statusConfig.text}`}
                          >
                            <span className="text-lg font-bold">{statusConfig.icon}</span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {tableData.participants.length === 0 && (
                    <tr>
                      <td colSpan={tableData.slots.length + 1} className="p-4 text-center text-gray-500">
                        まだ回答がありません
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 一覧表示
  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-purple-600 pl-4 flex items-center gap-2">
          <Users size={20} className="text-purple-600" />
          出欠メーカー
          {isAdmin && (
            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">ADMIN</span>
          )}
        </h2>
        <div className="flex gap-2">
          {events.length > 0 && (
            <button
              onClick={toggleSelectMode}
              className={`px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors ${
                selectMode
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {selectMode ? <CheckSquare size={16} /> : <Square size={16} />}
              {selectMode ? '選択中' : '選択'}
            </button>
          )}
          <button
            onClick={handleCreateNew}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700 flex items-center gap-2"
          >
            <Plus size={16} /> 新規作成
          </button>
        </div>
      </div>

      {/* 選択モードのアクションバー */}
      {selectMode && events.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSelectAll}
              className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
            >
              {selectedIds.size === events.length ? '全て解除' : '全て選択'}
            </button>
            <span className="text-sm text-indigo-600">
              {selectedIds.size}件選択中
            </span>
          </div>
          <button
            onClick={handleBulkDelete}
            disabled={selectedIds.size === 0 || bulkDeleting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {bulkDeleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            一括削除
          </button>
        </div>
      )}

      {/* 出欠表一覧 */}
      {events.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">まだ出欠表を作成していません</p>
          <button
            onClick={handleCreateNew}
            className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold hover:bg-purple-700"
          >
            新規作成する
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <div
              key={event.id}
              className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                selectMode && selectedIds.has(event.id)
                  ? 'border-indigo-500 ring-2 ring-indigo-200'
                  : 'border-gray-200'
              }`}
            >
              {/* カードヘッダー */}
              <div
                className={`bg-gradient-to-r from-purple-500 to-indigo-500 p-4 h-32 flex items-start ${
                  selectMode ? 'cursor-pointer' : ''
                }`}
                onClick={selectMode ? () => toggleSelect(event.id) : undefined}
              >
                <div className="flex items-start justify-between w-full">
                  {selectMode ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(event.id);
                      }}
                      className="p-1 bg-white/90 rounded"
                    >
                      {selectedIds.has(event.id) ? (
                        <CheckSquare size={20} className="text-indigo-600" />
                      ) : (
                        <Square size={20} className="text-gray-400" />
                      )}
                    </button>
                  ) : (
                    <span className="text-xs px-2 py-1 rounded-full font-bold bg-white/20 text-white">
                      {event.slots?.length || 0} 候補日
                    </span>
                  )}
                </div>
              </div>

              {/* カードコンテンツ */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
                {event.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{event.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={12} />
                    {event.created_at ? new Date(event.created_at).toLocaleDateString('ja-JP') : '-'}
                  </span>
                </div>

                {/* URL表示とコピー */}
                <div className="mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/attendance/${event.id}`}
                      readOnly
                      className="flex-1 text-xs bg-transparent border-none outline-none text-gray-600 truncate"
                    />
                    <button
                      onClick={() => handleCopyUrl(event.id)}
                      className="text-indigo-600 hover:text-indigo-700 p-1"
                    >
                      {copiedId === event.id ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                </div>

                {!selectMode && (
                  <>
                    {/* 編集・複製ボタン */}
                    <div className="flex gap-2 mb-3">
                      <button
                        onClick={() => handleEdit(event)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <Edit size={14} /> 編集
                      </button>
                      <button
                        onClick={() => handleDuplicate(event)}
                        disabled={duplicatingId === event.id}
                        className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-600 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                      >
                        {duplicatingId === event.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Copy size={14} />
                        )}
                        複製
                      </button>
                    </div>

                    {/* 埋め込み・削除ボタン */}
                    <div className="flex gap-2 mb-3">
                      <button
                        className={`flex-1 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors ${
                          isUnlocked
                            ? 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={!isUnlocked}
                      >
                        {isUnlocked ? <Code size={14} /> : <Lock size={14} />} 埋め込み
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(event.id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <Trash2 size={14} /> 削除
                      </button>
                    </div>

                    {/* プレビューボタン */}
                    <button
                      onClick={() => window.open(`/attendance/${event.id}`, '_blank')}
                      className="w-full bg-green-500 text-white py-2.5 rounded-lg font-bold text-xs hover:bg-green-600 flex items-center justify-center gap-1 transition-colors"
                    >
                      <ExternalLink size={14} /> プレビュー
                    </button>

                    {/* 結果を見るボタン */}
                    <button
                      onClick={() => handleViewResults(event)}
                      disabled={loadingResults}
                      className="w-full mt-3 bg-indigo-500 text-white py-2.5 rounded-lg font-bold text-xs hover:bg-indigo-600 flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {loadingResults && selectedEvent?.id === event.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <BarChart2 size={14} />
                      )}
                      結果を見る
                    </button>

                    {/* Pro機能アンロック - 未解除時のみ表示 */}
                    {!isUnlocked && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <button
                          className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2.5 rounded-lg font-bold text-xs hover:from-orange-600 hover:to-amber-600 flex items-center justify-center gap-1 transition-all shadow-sm"
                        >
                          <Heart size={14} />
                          Pro機能を開放（開発支援）
                        </button>
                        <p className="text-[10px] text-gray-400 text-center mt-1.5">
                          埋め込み機能などが利用可能に
                        </p>
                      </div>
                    )}

                    {/* 削除確認 */}
                    {showDeleteConfirm === event.id && (
                      <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                        <p className="text-sm text-red-800 mb-3">
                          「{event.title}」を削除しますか？この操作は取り消せません。
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(event.id)}
                            disabled={deletingId === event.id}
                            className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-xs disabled:opacity-50"
                          >
                            {deletingId === event.id ? (
                              <Loader2 size={14} className="animate-spin mx-auto" />
                            ) : (
                              '削除する'
                            )}
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(null)}
                            className="flex-1 px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-xs"
                          >
                            キャンセル
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
