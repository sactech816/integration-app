'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCampaigns, acquireStamp } from '@/app/actions/gamification';
import { GamificationCampaign, StampRallySettings } from '@/lib/types';
import StampNotification from './StampNotification';

interface PageStampTrackerProps {
  pageUrl: string; // '/howto', '/effective-use' など
  user?: { id?: string; email?: string } | null;
}

export default function PageStampTracker({ pageUrl, user }: PageStampTrackerProps) {
  const [notification, setNotification] = useState<{
    show: boolean;
    points: number;
    stampName: string;
  }>({ show: false, points: 0, stampName: '' });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (processing) return;

    async function checkAndAwardStamp() {
      try {
        setProcessing(true);
        console.log('[PageStampTracker] Checking stamp for page:', pageUrl);

        // アクティブなスタンプラリーキャンペーンを取得
        const campaigns = await getCampaigns();
        const stampRallyCampaigns = campaigns.filter(
          c => c.campaign_type === 'stamp_rally' && c.status === 'active'
        );

        console.log('[PageStampTracker] Found stamp rally campaigns:', stampRallyCampaigns.length);

        for (const campaign of stampRallyCampaigns) {
          const settings = campaign.settings as StampRallySettings & {
            page_stamps?: Array<{ page_url: string; stamp_id: string; stamp_index: number; name: string }>;
          };

          // このページに対応するスタンプを探す
          const pageStamp = settings.page_stamps?.find(ps => ps.page_url === pageUrl);

          if (pageStamp) {
            console.log('[PageStampTracker] Found stamp for this page:', pageStamp);

            // ローカルストレージで取得済みかチェック（セッション単位）
            const storageKey = `stamp_acquired_${campaign.id}_${pageStamp.stamp_id}`;
            if (typeof window !== 'undefined' && localStorage.getItem(storageKey)) {
              console.log('[PageStampTracker] Stamp already acquired in this session');
              continue;
            }

            // スタンプを取得（userがいる場合のみIDを使用）
            const userId = user?.id ? user.id : undefined;
            const result = await acquireStamp(
              campaign.id,
              pageStamp.stamp_id,
              pageStamp.stamp_index,
              userId
            );

            console.log('[PageStampTracker] Acquire stamp result:', result);

            if (result.success) {
              // ローカルストレージに記録
              if (typeof window !== 'undefined') {
                localStorage.setItem(storageKey, 'true');
              }

              // 通知を表示
              const pointsPerStamp = settings.points_per_stamp || 1;
              setNotification({
                show: true,
                points: pointsPerStamp,
                stampName: pageStamp.name || 'スタンプ',
              });

              // 3秒後に通知を非表示
              setTimeout(() => {
                setNotification(prev => ({ ...prev, show: false }));
              }, 3000);
            } else if (result.alreadyAcquired) {
              console.log('[PageStampTracker] Stamp already acquired in database');
              // DBで取得済みの場合もローカルストレージに記録
              if (typeof window !== 'undefined') {
                localStorage.setItem(storageKey, 'true');
              }
            }
          }
        }
      } catch (error) {
        console.error('[PageStampTracker] Error checking stamp:', error);
      } finally {
        setProcessing(false);
      }
    }

    // ページ読み込み後、少し待ってからチェック
    const timer = setTimeout(checkAndAwardStamp, 2000);
    return () => clearTimeout(timer);
  }, [pageUrl, user, processing]);

  return (
    <>
      {notification.show && (
        <StampNotification
          points={notification.points}
          stampName={notification.stampName}
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        />
      )}
    </>
  );
}
