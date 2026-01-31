'use client';

import React, { useState } from 'react';
import { Search, Loader2, Trash2, CheckSquare, Square } from 'lucide-react';
import { ServiceType, SERVICE_LABELS } from '@/lib/types';
import ContentCard, { ContentItem } from './ContentCard';
import Pagination from '../shared/Pagination';

const ITEMS_PER_PAGE = 9;

type ContentListProps = {
  contents: ContentItem[];
  selectedService: ServiceType;
  isLoading: boolean;
  isAdmin: boolean;
  proAccessMap: Record<string, { hasAccess: boolean; reason?: string }>;
  processingId: string | null;
  copiedId: string | null;
  onEdit: (item: ContentItem) => void;
  onDuplicate: (item: ContentItem) => void;
  onDelete: (item: ContentItem) => void;
  onView: (item: ContentItem) => void;
  onCopyUrl: (item: ContentItem) => void;
  onEmbed: (item: ContentItem, isUnlocked: boolean) => void;
  onDownloadHtml: (item: ContentItem) => void;
  onPurchase: (item: ContentItem) => void;
  onCreateNew: () => void;
  onBulkDelete?: (items: ContentItem[]) => Promise<void>;
};

export default function ContentList({
  contents,
  selectedService,
  isLoading,
  isAdmin,
  proAccessMap,
  processingId,
  copiedId,
  onEdit,
  onDuplicate,
  onDelete,
  onView,
  onCopyUrl,
  onEmbed,
  onDownloadHtml,
  onPurchase,
  onCreateNew,
  onBulkDelete,
}: ContentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // 一括選択機能
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // 検索フィルター
  const filteredContents = contents.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ページネーション計算
  const totalPages = Math.ceil(filteredContents.length / ITEMS_PER_PAGE);
  const paginatedContents = filteredContents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 検索時にページをリセット
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
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

  // 全選択/全解除（フィルター後のコンテンツに対して）
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredContents.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContents.map((c) => c.id)));
    }
  };

  // 一括削除
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`${selectedIds.size}件の${SERVICE_LABELS[selectedService]}を削除しますか？この操作は取り消せません。`)) return;

    setBulkDeleting(true);
    try {
      if (onBulkDelete) {
        const itemsToDelete = contents.filter((c) => selectedIds.has(c.id));
        await onBulkDelete(itemsToDelete);
      } else {
        // onBulkDeleteが渡されていない場合は個別削除を順次実行
        const itemsToDelete = contents.filter((c) => selectedIds.has(c.id));
        for (const item of itemsToDelete) {
          await onDelete(item);
        }
      }
      setSelectedIds(new Set());
      setSelectMode(false);
    } catch (error) {
      console.error('一括削除エラー:', error);
      alert('一部の削除に失敗しました');
    } finally {
      setBulkDeleting(false);
    }
  };

  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-black border-l-4 border-indigo-600 pl-4 flex items-center gap-2">
          {isAdmin
            ? `全${SERVICE_LABELS[selectedService]}リスト（管理者）`
            : `作成した${SERVICE_LABELS[selectedService]}リスト`}
          {isAdmin && (
            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">ADMIN</span>
          )}
        </h2>
        <div className="flex items-center gap-2">
          {filteredContents.length > 0 && (
            <>
              <span className="text-sm text-gray-500">全 {filteredContents.length} 件</span>
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
        </div>
      </div>

      {/* 選択モードのアクションバー */}
      {selectMode && filteredContents.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSelectAll}
              className="text-sm font-semibold text-indigo-700 hover:text-indigo-800"
            >
              {selectedIds.size === filteredContents.length ? '全て解除' : '全て選択'}
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

      {/* 検索 */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="タイトルで検索..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
          />
        </div>
      </div>

      {/* コンテンツ一覧 */}
      {isLoading ? (
        <div className="text-center py-10">
          <Loader2 className="animate-spin mx-auto text-indigo-600" />
        </div>
      ) : filteredContents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">
            {searchQuery
              ? '検索結果がありません'
              : `まだ${SERVICE_LABELS[selectedService]}を作成していません。`}
          </p>
          {!searchQuery && (
            <button
              onClick={onCreateNew}
              className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700"
            >
              新規作成する
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedContents.map((item) => {
              const accessInfo = proAccessMap[item.id] || { hasAccess: false };
              const isUnlocked = accessInfo.hasAccess || isAdmin;

              return (
                <div
                  key={item.id}
                  className={`relative ${
                    selectMode && selectedIds.has(item.id)
                      ? 'ring-2 ring-indigo-500 rounded-xl'
                      : ''
                  }`}
                >
                  {selectMode && (
                    <button
                      onClick={() => toggleSelect(item.id)}
                      className="absolute top-3 left-3 z-10 p-1 bg-white/90 rounded shadow-sm"
                    >
                      {selectedIds.has(item.id) ? (
                        <CheckSquare size={20} className="text-indigo-600" />
                      ) : (
                        <Square size={20} className="text-gray-400" />
                      )}
                    </button>
                  )}
                  <ContentCard
                    item={item}
                    isUnlocked={isUnlocked}
                    isAdmin={isAdmin}
                    processingId={processingId}
                    copiedId={copiedId}
                    onEdit={onEdit}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                    onView={onView}
                    onCopyUrl={onCopyUrl}
                    onEmbed={onEmbed}
                    onDownloadHtml={onDownloadHtml}
                    onPurchase={onPurchase}
                  />
                </div>
              );
            })}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            label={SERVICE_LABELS[selectedService]}
          />
        </>
      )}
    </div>
  );
}
