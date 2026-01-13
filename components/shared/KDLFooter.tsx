'use client';

import React from 'react';
import Link from 'next/link';
import { Home, BookOpen } from 'lucide-react';

interface KDLFooterProps {
  adminKeyParam?: string;
  className?: string;
}

/**
 * KDL用共通フッターコンポーネント
 * 集客メーカートップとKDL一覧へのリンクを提供
 */
export const KDLFooter: React.FC<KDLFooterProps> = ({ 
  adminKeyParam = '',
  className = ''
}) => {
  return (
    <footer className={`bg-white/80 backdrop-blur-md border-t border-amber-100 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center gap-6 text-sm">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
          >
            <Home size={16} />
            <span>集客メーカー トップへ</span>
          </Link>
          <span className="text-gray-300">|</span>
          <Link
            href={`/kindle${adminKeyParam}`}
            className="flex items-center gap-2 text-gray-600 hover:text-amber-600 transition-colors"
          >
            <BookOpen size={16} />
            <span>KDL 一覧へ</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default KDLFooter;







