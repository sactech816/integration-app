'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  label = '',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  // ページ番号の配列を生成（最大7ページ表示）
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;
    
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // 常に最初と最後のページを表示
    pages.push(1);

    if (currentPage > 3) {
      pages.push('...');
    }

    // 現在のページの前後
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    if (!pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-lg transition-colors ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        aria-label="前のページ"
      >
        <ChevronLeft size={18} />
      </button>

      <div className="flex items-center gap-1">
        {getPageNumbers().map((page, index) => (
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${
                currentPage === page
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="px-1 text-gray-400">
              {page}
            </span>
          )
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-lg transition-colors ${
          currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
        aria-label="次のページ"
      >
        <ChevronRight size={18} />
      </button>

      {label && (
        <span className="text-xs text-gray-500 ml-2">
          {label} {currentPage} / {totalPages} ページ
        </span>
      )}
    </div>
  );
}
