'use client';

import { useEffect, useRef } from 'react';
import { saveAnalytics, ContentType, EventType, EventData } from '@/app/actions/analytics';

interface ViewTrackerProps {
  contentId: string;
  contentType: ContentType;
  trackScroll?: boolean;
  trackTime?: boolean;
}

/**
 * ページビュー・スクロール・滞在時間をトラッキングするコンポーネント
 */
export function ViewTracker({ 
  contentId, 
  contentType,
  trackScroll = true,
  trackTime = true
}: ViewTrackerProps) {
  // 開始時刻の記録
  const startTimeRef = useRef<number>(Date.now());
  
  // 最大スクロール深度
  const maxScrollRef = useRef<number>(0);
  
  // 記録済みスクロールマイルストーン
  const scrollTrackedRef = useRef<Set<number>>(new Set());
  
  // 精読記録済みフラグ
  const readTrackedRef = useRef<boolean>(false);
  
  // ビュー記録済みフラグ
  const viewTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    // バリデーション
    if (!contentId || contentId === 'demo') return;

    // ページビューを記録（初回のみ）
    if (!viewTrackedRef.current) {
      viewTrackedRef.current = true;
      saveAnalytics(contentId, contentType, 'view');
    }

    // スクロール追跡
    const handleScroll = () => {
      if (!trackScroll) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = scrollHeight > 0 
        ? Math.round((scrollTop / scrollHeight) * 100) 
        : 0;
      
      // 最大値を更新
      maxScrollRef.current = Math.max(maxScrollRef.current, scrollDepth);

      // マイルストーン記録（25%, 50%, 75%, 100%）
      [25, 50, 75, 100].forEach(milestone => {
        if (scrollDepth >= milestone && !scrollTrackedRef.current.has(milestone)) {
          scrollTrackedRef.current.add(milestone);
          saveAnalytics(contentId, contentType, 'scroll', { scrollDepth: milestone });
        }
      });
    };

    // 精読判定（50%以上スクロール）
    const checkReadRate = () => {
      if (!readTrackedRef.current && maxScrollRef.current >= 50) {
        readTrackedRef.current = true;
        saveAnalytics(contentId, contentType, 'read', { readPercentage: maxScrollRef.current });
      }
    };

    // イベントリスナー登録
    if (trackScroll) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }
    
    // 定期チェック（1秒ごと）
    const scrollInterval = setInterval(() => {
      handleScroll();
      checkReadRate();
    }, 1000);

    // ページ離脱時の滞在時間記録（sendBeacon使用）
    const handleBeforeUnload = () => {
      if (!trackTime) return;
      
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 0) {
        const blob = new Blob(
          [JSON.stringify({
            contentId,
            contentType,
            eventType: 'time',
            eventData: { timeSpent }
          })],
          { type: 'application/json' }
        );
        navigator.sendBeacon('/api/analytics', blob);
      }
    };

    // 定期的な滞在時間記録（30秒ごと）
    let timeInterval: NodeJS.Timeout | null = null;
    if (trackTime) {
      timeInterval = setInterval(() => {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        if (timeSpent >= 30) {
          saveAnalytics(contentId, contentType, 'time', { timeSpent });
        }
      }, 30000);
    }

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    // クリーンアップ
    return () => {
      if (trackScroll) {
        window.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      clearInterval(scrollInterval);
      if (timeInterval) {
        clearInterval(timeInterval);
      }
      
      // 最終データ記録
      if (trackTime) {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        if (timeSpent > 3) {
          saveAnalytics(contentId, contentType, 'time', { timeSpent });
        }
      }
    };
  }, [contentId, contentType, trackScroll, trackTime]);

  return null; // UIなしのトラッカー
}

/**
 * クリックイベントをトラッキングするヘルパー関数
 */
export async function trackClick(
  contentId: string,
  contentType: ContentType,
  url: string
): Promise<void> {
  if (!contentId || contentId === 'demo') return;
  
  try {
    await saveAnalytics(contentId, contentType, 'click', { url });
  } catch (error) {
    console.error('[ViewTracker] Click tracking error:', error);
  }
}

/**
 * 完了イベントをトラッキングするヘルパー関数（クイズ用）
 */
export async function trackCompletion(
  contentId: string,
  contentType: ContentType,
  resultType?: string
): Promise<void> {
  if (!contentId || contentId === 'demo') return;
  
  try {
    await saveAnalytics(contentId, contentType, 'completion', { resultType });
  } catch (error) {
    console.error('[ViewTracker] Completion tracking error:', error);
  }
}

export default ViewTracker;
























































































