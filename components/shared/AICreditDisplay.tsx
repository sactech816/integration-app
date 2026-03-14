'use client';

import { useState, useEffect } from 'react';
import { getAIUsageSummary } from '@/lib/ai-usage';
import { getSubscriptionStatus, getAICreditsForPlan } from '@/lib/subscription';

interface AICreditDisplayProps {
  userId: string;
  compact?: boolean; // コンパクト表示モード
}

export default function AICreditDisplay({ userId, compact = false }: AICreditDisplayProps) {
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState<{
    premium: { used: number; limit: number; remaining: number } | undefined;
    standard: { used: number; limit: number; remaining: number } | undefined;
    hasPremiumAccess: boolean;
    planTier: string;
  } | null>(null);

  useEffect(() => {
    loadCredits();
  }, [userId]);

  const loadCredits = async () => {
    try {
      setLoading(true);
      
      // 使用量サマリーを取得
      const summary = await getAIUsageSummary(userId);
      
      // プラン情報を取得
      const subscription = await getSubscriptionStatus(userId);
      const planCredits = getAICreditsForPlan(subscription.planTier);

      setCredits({
        premium: summary?.premium,
        standard: summary?.standard,
        hasPremiumAccess: planCredits.hasPremiumAccess,
        planTier: subscription.planTier,
      });
    } catch (error) {
      console.error('Failed to load AI credits:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-20 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (!credits) {
    return null;
  }

  // コンパクトモード
  if (compact) {
    return (
      <div className="flex items-center gap-4 text-sm">
        {credits.hasPremiumAccess && credits.premium && (
          <div className="flex items-center gap-2">
            <span className="text-purple-600">⚡</span>
            <span className="text-gray-700">
              高品質AI: <strong>{credits.premium.remaining}</strong>回
            </span>
          </div>
        )}
        {credits.standard && (
          <div className="flex items-center gap-2">
            <span className="text-blue-600">🚀</span>
            <span className="text-gray-700">
              高速AI: <strong>
                {credits.standard.limit === -1 ? '無制限' : `${credits.standard.remaining}回`}
              </strong>
            </span>
          </div>
        )}
      </div>
    );
  }

  // 通常モード
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        AI使用可能回数（本日）
      </h3>

      <div className="space-y-4">
        {/* Premium Credits */}
        {credits.hasPremiumAccess && credits.premium && (
          <div className="border-l-4 border-purple-500 pl-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚡</span>
                <div>
                  <p className="font-semibold text-gray-900">高品質AI</p>
                  <p className="text-xs text-gray-500">Claude Sonnet 4.5, GPT-5 Mini</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-purple-600">
                  {credits.premium.remaining}
                </p>
                <p className="text-xs text-gray-500">
                  / {credits.premium.limit}回
                </p>
              </div>
            </div>
            
            {/* プログレスバー */}
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(credits.premium.used / credits.premium.limit) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Standard Credits */}
        {credits.standard && (
          <div className="border-l-4 border-blue-500 pl-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚀</span>
                <div>
                  <p className="font-semibold text-gray-900">高速AI</p>
                  <p className="text-xs text-gray-500">Gemini 2.0 Flash</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  {credits.standard.limit === -1 
                    ? '∞' 
                    : credits.standard.remaining}
                </p>
                {credits.standard.limit !== -1 && (
                  <p className="text-xs text-gray-500">
                    / {credits.standard.limit}回
                  </p>
                )}
              </div>
            </div>
            
            {/* プログレスバー（無制限でない場合のみ） */}
            {credits.standard.limit !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(credits.standard.used / credits.standard.limit) * 100}%`,
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* Premium未利用プラン向けのアップグレード案内 */}
        {!credits.hasPremiumAccess && (
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✨</span>
              <div>
                <p className="font-semibold text-gray-900 mb-1">
                  高品質AIを使ってみませんか？
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  ビジネスプラン以上で、Claude 3.5 SonnetやO3-miniなどの最高品質AIモデルをご利用いただけます。
                </p>
                <button
                  onClick={() => window.location.href = '/subscription'}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium underline"
                >
                  プランをアップグレード →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* リセット時刻の表示 */}
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
          ※回数は毎日 00:00（JST）にリセットされます
        </div>
      </div>
    </div>
  );
}

