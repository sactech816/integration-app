'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import FloatingButtons from './FloatingButtons';
import ConciergeWidget from '@/components/concierge/ConciergeWidget';

/**
 * FloatingButtons と ConciergeWidget を統合するラッパー
 * コンシェルジュが開いている時はFloatingButtonsを非表示にする
 * 埋め込みページ（/embed/）では表示しない
 */
export default function FloatingWidgets() {
  const [conciergeOpen, setConciergeOpen] = useState(false);
  const pathname = usePathname();

  // 埋め込みページでは FloatingWidgets を表示しない
  if (pathname?.startsWith('/embed/')) {
    return null;
  }

  return (
    <>
      <FloatingButtons conciergeOpen={conciergeOpen} />
      <ConciergeWidget onOpenChange={setConciergeOpen} />
    </>
  );
}
