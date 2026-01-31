'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Plus,
  Edit,
  ExternalLink,
  Copy,
  Check,
  Loader2,
  Clock,
  CalendarDays,
  Trash2,
  Code,
  Lock,
  Heart,
  CheckSquare,
  Square,
} from 'lucide-react';
import { BookingMenu } from '@/types/booking';
import { getBookingMenus, getAllBookingMenus, deleteBookingMenu, duplicateBookingMenu, getBookingCountsForMenus } from '@/app/actions/booking';

type BookingListProps = {
  userId: string;
  isAdmin: boolean;
  isUnlocked?: boolean;
};

export default function BookingList({ userId, isAdmin, isUnlocked = false }: BookingListProps) {
  const router = useRouter();
  const [menus, setMenus] = useState<BookingMenu[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // 予約数
  const [bookingCounts, setBookingCounts] = useState<Record<string, number>>({});

  // 一括選択機能
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadMenus = async () => {
    setLoading(true);
    try {
      // 管理者は全件取得、一般ユーザーは自分のみ
      const data = isAdmin ? await getAllBookingMenus() : await getBookingMenus(userId);
      setMenus(data);

      // 予約数を一括取得（N+1クエリ回避）
      if (data.length > 0) {
        const menuIds = data.map((menu) => menu.id);
        const counts = await getBookingCountsForMenus(menuIds);
        setBookingCounts(counts);
      }
    } catch (error) {
      console.error('予約メニュー取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadMenus();
    }
  }, [userId, isAdmin]);

  const handleCopyUrl = (menuId: string) => {
    const url = `${window.location.origin}/booking/${menuId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(menuId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (menuId: string) => {
    setDeletingId(menuId);
    try {
      const result = await deleteBookingMenu(menuId, userId, undefined, isAdmin);
      if (result.success) {
        setMenus((prev) => prev.filter((m) => m.id !== menuId));
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

  const handleDuplicate = async (menu: BookingMenu) => {
    setDuplicatingId(menu.id);
    try {
      const result = await duplicateBookingMenu(menu.id, userId);
      if (result.success && result.data) {
        // リストを再取得して予約数も更新
        await loadMenus();
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
    if (selectedIds.size === menus.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(menus.map((m) => m.id)));
    }
  };

  // 一括削除
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`${selectedIds.size}件の予約メニューを削除しますか？この操作は取り消せません。`)) return;

    setBulkDeleting(true);
    try {
      const deletePromises = Array.from(selectedIds).map((id) =>
        deleteBookingMenu(id, userId, undefined, isAdmin)
      );
      const results = await Promise.all(deletePromises);
      
      // 成功したIDのみローカルstateから削除
      const successIds = new Set<string>();
      const idsArray = Array.from(selectedIds);
      results.forEach((result, index) => {
        if (result.success) {
          successIds.add(idsArray[index]);
        }
      });

      if (successIds.size > 0) {
        setMenus((prev) => prev.filter((m) => !successIds.has(m.id)));
      }

      const failedCount = selectedIds.size - successIds.size;
      if (failedCount > 0) {
        alert(`${failedCount}件の削除に失敗しました`);
      }

      setSelectedIds(new Set());
      setSelectMode(false);
    } catch (error) {
      console.error('一括削除エラー:', error);
      alert('削除に失敗しました');
    } finally {
      setBulkDeleting(false);
    }
  };

  const getMenuTypeLabel = (type: string) => {
    return type === 'adjustment' ? '日程調整' : '予約受付';
  };

  const getMenuTypeColor = (type: string) => {
    return type === 'adjustment'
      ? 'bg-purple-100 text-purple-700'
      : 'bg-blue-100 text-blue-700';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 border-l-4 border-blue-600 pl-4 flex items-center gap-2">
          <Calendar size={20} className="text-blue-600" />
          {isAdmin ? '全予約メーカーリスト（管理者）' : '作成した予約メーカーリスト'}
          {isAdmin && (
            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">ADMIN</span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {menus.length > 0 && (
            <>
              <span className="text-sm text-gray-500">全 {menus.length} 件</span>
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
            </>
          )}
          <button
            onClick={() => router.push('/booking/new')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={16} /> 新規作成
          </button>
        </div>
      </div>

      {/* 選択モードのアクションバー */}
      {selectMode && menus.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSelectAll}
              className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
            >
              {selectedIds.size === menus.length ? '全て解除' : '全て選択'}
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

      {/* メニュー一覧 */}
      {menus.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">まだ予約メニューを作成していません</p>
          <button
            onClick={() => router.push('/booking/new')}
            className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700"
          >
            新規作成する
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {menus.map((menu) => (
            <div
              key={menu.id}
              className={`bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow ${
                selectMode && selectedIds.has(menu.id)
                  ? 'border-indigo-500 ring-2 ring-indigo-200'
                  : 'border-gray-200'
              }`}
            >
              {/* カードヘッダー */}
              <div
                className={`h-32 ${menu.type === 'adjustment' ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'} ${
                  selectMode ? 'cursor-pointer' : ''
                }`}
                onClick={selectMode ? () => toggleSelect(menu.id) : undefined}
              >
                <div className="p-4 flex items-start justify-between">
                  {selectMode ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(menu.id);
                      }}
                      className="p-1 bg-white/90 rounded"
                    >
                      {selectedIds.has(menu.id) ? (
                        <CheckSquare size={20} className="text-indigo-600" />
                      ) : (
                        <Square size={20} className="text-gray-400" />
                      )}
                    </button>
                  ) : (
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${getMenuTypeColor(menu.type)}`}>
                      {getMenuTypeLabel(menu.type)}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                    menu.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {menu.is_active ? '公開中' : '非公開'}
                  </span>
                </div>
              </div>

              {/* カードコンテンツ */}
              <div className="p-5">
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{menu.title}</h3>
                {menu.description && (
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">{menu.description}</p>
                )}

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {menu.duration_min}分
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarDays size={12} />
                    {menu.created_at ? new Date(menu.created_at).toLocaleDateString('ja-JP') : '-'}
                  </span>
                  {bookingCounts[menu.id] !== undefined && (
                    <span className="flex items-center gap-1 text-blue-600 font-semibold">
                      予約: {bookingCounts[menu.id]}件
                    </span>
                  )}
                </div>

                {/* URL表示とコピー */}
                <div className="mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/booking/${menu.id}`}
                      readOnly
                      className="flex-1 text-xs bg-transparent border-none outline-none text-gray-600 truncate"
                    />
                    <button
                      onClick={() => handleCopyUrl(menu.id)}
                      className="text-indigo-600 hover:text-indigo-700 p-1"
                    >
                      {copiedId === menu.id ? (
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
                        onClick={() => router.push(`/booking/edit/${menu.id}`)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <Edit size={14} /> 編集
                      </button>
                      <button
                        onClick={() => handleDuplicate(menu)}
                        disabled={duplicatingId === menu.id}
                        className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-600 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                      >
                        {duplicatingId === menu.id ? (
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
                        onClick={() => setShowDeleteConfirm(menu.id)}
                        className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      >
                        <Trash2 size={14} /> 削除
                      </button>
                    </div>

                    {/* プレビューボタン */}
                    <button
                      onClick={() => window.open(`/booking/${menu.id}`, '_blank')}
                      className="w-full bg-green-500 text-white py-2.5 rounded-lg font-bold text-xs hover:bg-green-600 flex items-center justify-center gap-1 transition-colors"
                    >
                      <ExternalLink size={14} /> プレビュー
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
                    {showDeleteConfirm === menu.id && (
                      <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                        <p className="text-sm text-red-800 mb-3">
                          「{menu.title}」を削除しますか？この操作は取り消せません。
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDelete(menu.id)}
                            disabled={deletingId === menu.id}
                            className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-xs disabled:opacity-50"
                          >
                            {deletingId === menu.id ? (
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
