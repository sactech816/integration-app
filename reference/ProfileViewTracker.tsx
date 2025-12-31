'use client';

import { useEffect, useRef } from 'react';
import { saveAnalytics } from '@/app/actions/analytics';
import { saveBusinessAnalytics } from '@/app/actions/business';

export function ProfileViewTracker({ 
  profileId, 
  contentType = 'profile' 
}: { 
  profileId: string;
  contentType?: 'profile' | 'business';
}) {
  const startTimeRef = useRef<number>(Date.now());
  const maxScrollRef = useRef<number>(0);
  const scrollTrackedRef = useRef<Set<number>>(new Set());
  const readTrackedRef = useRef<boolean>(false);
  const viewTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    if (!profileId) {
      console.warn('[ProfileViewTracker] No profileId provided');
      return;
    }

    // デモページの場合はトラッキングしない
    if (profileId === 'demo') {
      console.log('[ProfileViewTracker] Skipping demo profile');
      return;
    }

    console.log('[ProfileViewTracker] Initializing for profile:', profileId, 'contentType:', contentType);

    // アナリティクス保存関数を選択
    const saveAnalyticsFunc = contentType === 'business' ? saveBusinessAnalytics : saveAnalytics;

    // ページビューを記録（初回のみ）
    if (!viewTrackedRef.current) {
      viewTrackedRef.current = true;
      saveAnalyticsFunc(profileId, 'view').then((result) => {
        console.log('[ProfileViewTracker] View tracked:', result);
        if (result.error) {
          console.error('[ProfileViewTracker] View tracking error:', result.error);
        }
      }).catch((error) => {
        console.error('[ProfileViewTracker] View tracking exception:', error);
      });
    }

    // スクロール深度を追跡
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollDepth = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0;
      
      maxScrollRef.current = Math.max(maxScrollRef.current, scrollDepth);

      // 25%, 50%, 75%, 100%のマイルストーンを記録
      [25, 50, 75, 100].forEach(milestone => {
        if (scrollDepth >= milestone && !scrollTrackedRef.current.has(milestone)) {
          scrollTrackedRef.current.add(milestone);
          saveAnalyticsFunc(profileId, 'scroll', { scrollDepth: milestone }).then((result) => {
            console.log('[ProfileViewTracker] Scroll milestone tracked:', milestone, result);
            if (result.error) {
              console.error('[ProfileViewTracker] Scroll tracking error:', result.error);
            }
          }).catch((error) => {
            console.error('[ProfileViewTracker] Scroll tracking exception:', error);
          });
        }
      });
    };

    // 精読率を計算（スクロール深度50%以上で精読とみなす）
    const checkReadRate = () => {
      if (!readTrackedRef.current && maxScrollRef.current >= 50) {
        readTrackedRef.current = true;
        saveAnalyticsFunc(profileId, 'read', { readPercentage: maxScrollRef.current }).then((result) => {
          console.log('[ProfileViewTracker] Read tracked:', maxScrollRef.current, result);
          if (result.error) {
            console.error('[ProfileViewTracker] Read tracking error:', result.error);
          }
        }).catch((error) => {
          console.error('[ProfileViewTracker] Read tracking exception:', error);
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // 定期的にスクロール深度をチェック
    const scrollInterval = setInterval(() => {
      handleScroll();
      checkReadRate();
    }, 1000);

    // ページ離脱時に滞在時間と最終スクロール深度を記録
    const handleBeforeUnload = () => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 0) {
        // sendBeacon APIを使用して確実に送信
        const blob = new Blob(
          [JSON.stringify({ profileId, eventType: 'time', eventData: { timeSpent } })],
          { type: 'application/json' }
        );
        navigator.sendBeacon('/api/analytics', blob);
        console.log('[ProfileViewTracker] Time tracked on unload:', timeSpent);
      }
    };

    // 定期的に滞在時間を記録（30秒ごと）
    const timeInterval = setInterval(() => {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent >= 30) {
        saveAnalyticsFunc(profileId, 'time', { timeSpent }).then((result) => {
          console.log('[ProfileViewTracker] Time tracked:', timeSpent, result);
          if (result.error) {
            console.error('[ProfileViewTracker] Time tracking error:', result.error);
          }
        }).catch((error) => {
          console.error('[ProfileViewTracker] Time tracking exception:', error);
        });
      }
    }, 30000);

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
      clearInterval(scrollInterval);
      clearInterval(timeInterval);
      
      // クリーンアップ時に最終データを記録
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent > 3) { // 3秒以上滞在した場合のみ記録
        saveAnalyticsFunc(profileId, 'time', { timeSpent }).then((result) => {
          console.log('[ProfileViewTracker] Final time tracked:', timeSpent, result);
          if (result.error) {
            console.error('[ProfileViewTracker] Final time tracking error:', result.error);
          }
        }).catch((error) => {
          console.error('[ProfileViewTracker] Final time tracking exception:', error);
        });
      }
    };
  }, [profileId, contentType]);

  return null;
}

