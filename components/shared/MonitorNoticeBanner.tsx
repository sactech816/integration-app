/**
 * モニターユーザー通知バナーコンポーネント
 * モニター権限が付与されているユーザーのダッシュボードに表示
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { getSubscriptionStatus, SubscriptionStatus, PLAN_DEFINITIONS } from '@/lib/subscription';

interface MonitorNoticeBannerProps {
  userId: string;
}

export default function MonitorNoticeBanner({ userId }: MonitorNoticeBannerProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const status = await getSubscriptionStatus(userId);
        setSubscriptionStatus(status);
      } catch (error) {
        console.error('サブスクリプション状態の取得に失敗:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
  }, [userId]);

  // ローディング中または非表示の場合は何も表示しない
  if (isLoading || isDismissed) {
    return null;
  }

  // モニター権限がない場合は何も表示しない
  if (!subscriptionStatus?.isMonitor || !subscriptionStatus.monitorExpiresAt) {
    return null;
  }

  const planInfo = PLAN_DEFINITIONS[subscriptionStatus.planTier];
  const expiresAt = new Date(subscriptionStatus.monitorExpiresAt);
  const now = new Date();
  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  const isExpiringSoon = daysRemaining <= 7;

  // 日付フォーマット
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  return (
    <div
      className={`mb-6 p-6 rounded-xl border-2 ${
        isExpiringSoon
          ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300'
          : 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-300'
      } shadow-lg relative overflow-hidden`}
    >
      {/* 背景装飾 */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -mr-16 -mt-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/20 rounded-full -ml-12 -mb-12" />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isExpiringSoon ? 'bg-yellow-400' : 'bg-purple-500'
                }`}
              >
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-gray-900">
                    モニター特典で利用中
                  </h3>
                  {isExpiringSoon && (
                    <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold">
                      まもなく期限切れ
                    </span>
                  )}
                </div>
                <p className="text-gray-700 text-sm mt-1">
                  現在、<span className="font-black text-purple-600">{planInfo.nameJa}プラン</span>
                  の機能をご利用いただけます
                </p>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">プラン</div>
                    <div className="font-bold text-gray-900">{planInfo.nameJa}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isExpiringSoon ? 'bg-yellow-100' : 'bg-green-100'
                    }`}
                  >
                    <Clock
                      className={isExpiringSoon ? 'text-yellow-600' : 'text-green-600'}
                      size={20}
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">有効期限</div>
                    <div
                      className={`font-bold ${
                        isExpiringSoon ? 'text-yellow-700' : 'text-gray-900'
                      }`}
                    >
                      {formatDate(expiresAt)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isExpiringSoon ? 'bg-orange-100' : 'bg-blue-100'
                    }`}
                  >
                    <AlertCircle
                      className={isExpiringSoon ? 'text-orange-600' : 'text-blue-600'}
                      size={20}
                    />
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">残り日数</div>
                    <div
                      className={`font-bold ${
                        isExpiringSoon ? 'text-orange-700' : 'text-gray-900'
                      }`}
                    >
                      {daysRemaining}日
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-start gap-2">
              <AlertCircle className="text-purple-600 flex-shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>ご注意:</strong>
                モニター期間終了後は、通常の無料プランに戻ります。継続してご利用いただく場合は、
                <a
                  href="/kindle"
                  className="text-purple-600 font-bold hover:text-purple-700 underline ml-1"
                >
                  有料プランへのご加入
                </a>
                をご検討ください。
              </p>
            </div>
          </div>

          {/* 閉じるボタン */}
          <button
            onClick={() => setIsDismissed(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
            aria-label="通知を閉じる"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}













