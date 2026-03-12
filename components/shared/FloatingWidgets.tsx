'use client';

import { useState } from 'react';
import FloatingButtons from './FloatingButtons';
import ConciergeWidget from '@/components/concierge/ConciergeWidget';

/**
 * FloatingButtons と ConciergeWidget を統合するラッパー
 * コンシェルジュが開いている時はFloatingButtonsを非表示にする
 */
export default function FloatingWidgets() {
  const [conciergeOpen, setConciergeOpen] = useState(false);

  return (
    <>
      <FloatingButtons conciergeOpen={conciergeOpen} />
      <ConciergeWidget onOpenChange={setConciergeOpen} />
    </>
  );
}
