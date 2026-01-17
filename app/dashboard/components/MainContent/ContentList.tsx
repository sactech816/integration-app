'use client';

import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
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
}: ContentListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

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
        {filteredContents.length > 0 && (
          <span className="text-sm text-gray-500">全 {filteredContents.length} 件</span>
        )}
      </div>

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
                <ContentCard
                  key={item.id}
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
