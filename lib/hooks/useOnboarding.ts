'use client';

import { useState, useEffect } from 'react';

/**
 * はじめかたガイドの表示制御フック
 * localStorageで「次から表示しない」を管理
 */
export function useOnboarding(storageKey: string, options?: { skip?: boolean }) {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (options?.skip) return;
    const dismissed = localStorage.getItem(storageKey);
    if (!dismissed) {
      setShowOnboarding(true);
    }
  }, [storageKey, options?.skip]);

  return { showOnboarding, setShowOnboarding };
}
