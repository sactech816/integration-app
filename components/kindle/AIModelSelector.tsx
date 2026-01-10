'use client';

import { useState, useEffect } from 'react';
import { Zap, Sparkles, Info } from 'lucide-react';

interface AIModelSelectorProps {
  userId: string;
  planTier: 'none' | 'lite' | 'standard' | 'pro' | 'business' | 'enterprise';
  isAdmin?: boolean;
  isMonitor?: boolean;
  currentMode?: 'speed' | 'quality';
  onModeChange?: (mode: 'speed' | 'quality') => void;
  disabled?: boolean;
}

interface CreditInfo {
  premium: { used: number; limit: number };
  standard: { used: number; limit: number };
}

/**
 * ユーザー向けAIモデル選択コンポーネント
 * - 管理者、課金ユーザー（Pro以上）、モニターユーザー（Pro以上）が使用可能
 * - 「スピードモード」と「ハイクオリティモード」の選択
 */
export default function AIModelSelector({
  userId,
  planTier,
  isAdmin = false,
  isMonitor = false,
  currentMode = 'speed',
  onModeChange,
  disabled = false,
}: AIModelSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<'speed' | 'quality'>(currentMode);
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // モード選択可能かチェック
  // 管理者、Pro以上のプラン、またはモニターユーザーが選択可能
  const canSelectMode = isAdmin || planTier === 'pro' || planTier === 'business' || planTier === 'enterprise' || isMonitor;

  // クレジット情報を取得
  useEffect(() => {
    if (!canSelectMode) {
      setLoading(false);
      return;
    }

    const fetchCredits = async () => {
      try {
        const response = await fetch(`/api/ai-credit-check?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setCreditInfo({
            premium: { used: data.premiumUsage, limit: data.premiumLimit },
            standard: { used: data.standardUsage, limit: data.standardLimit },
          });
        }
      } catch (error) {
        console.error('Failed to fetch credit info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCredits();
  }, [userId, canSelectMode]);

  // モード選択不可の場合は何も表示しない
  if (!canSelectMode) {
    return null;
  }

  const handleModeChange = (mode: 'speed' | 'quality') => {
    setSelectedMode(mode);
    onModeChange?.(mode);
  };

  // ハイクオリティモードが使用できるか
  const canUseQuality = creditInfo 
    ? creditInfo.premium.used < creditInfo.premium.limit 
    : true;

  // 残りクレジット計算
  const remainingPremium = creditInfo 
    ? Math.max(0, creditInfo.premium.limit - creditInfo.premium.used)
    : 0;
  const remainingStandard = creditInfo
    ? creditInfo.standard.limit === -1 
      ? '∞' 
      : Math.max(0, creditInfo.standard.limit - creditInfo.standard.used)
    : 0;

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">AIモード選択</h3>
        <div className="flex items-center text-xs text-gray-500">
          <Info size={14} className="mr-1" />
          <span>実行時のモードを選択</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* スピードモード */}
        <button
          onClick={() => handleModeChange('speed')}
          disabled={disabled}
          className={`
            relative p-4 rounded-lg border-2 transition-all
            ${selectedMode === 'speed'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 bg-white hover:border-blue-300'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex flex-col items-center space-y-2">
            <Zap 
              size={28} 
              className={selectedMode === 'speed' ? 'text-blue-600' : 'text-gray-400'} 
            />
            <div className="text-center">
              <div className={`font-semibold ${selectedMode === 'speed' ? 'text-blue-900' : 'text-gray-700'}`}>
                スピードモード
              </div>
              <div className="text-xs text-gray-500 mt-1">
                高速・コスパ重視
              </div>
              <div className="text-xs font-medium text-blue-600 mt-2">
                残り: {remainingStandard}回
              </div>
            </div>
          </div>
          {selectedMode === 'speed' && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full"></div>
          )}
        </button>

        {/* ハイクオリティモード */}
        <button
          onClick={() => handleModeChange('quality')}
          disabled={disabled || !canUseQuality}
          className={`
            relative p-4 rounded-lg border-2 transition-all
            ${selectedMode === 'quality'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 bg-white hover:border-purple-300'
            }
            ${disabled || !canUseQuality ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <div className="flex flex-col items-center space-y-2">
            <Sparkles 
              size={28} 
              className={selectedMode === 'quality' ? 'text-purple-600' : 'text-gray-400'} 
            />
            <div className="text-center">
              <div className={`font-semibold ${selectedMode === 'quality' ? 'text-purple-900' : 'text-gray-700'}`}>
                ハイクオリティモード
              </div>
              <div className="text-xs text-gray-500 mt-1">
                高品質・論理重視
              </div>
              <div className={`text-xs font-medium mt-2 ${canUseQuality ? 'text-purple-600' : 'text-red-500'}`}>
                残り: {remainingPremium}回
              </div>
            </div>
          </div>
          {selectedMode === 'quality' && (
            <div className="absolute top-2 right-2 w-2 h-2 bg-purple-500 rounded-full"></div>
          )}
          {!canUseQuality && (
            <div className="absolute inset-0 bg-gray-100 bg-opacity-50 rounded-lg flex items-center justify-center">
              <span className="text-xs font-medium text-red-600">本日の上限に達しました</span>
            </div>
          )}
        </button>
      </div>

      {/* 説明テキスト */}
      <div className="bg-gray-50 rounded p-3 text-xs text-gray-600 space-y-1">
        <div className="flex items-start">
          <Zap size={14} className="mr-1.5 mt-0.5 text-blue-500 flex-shrink-0" />
          <div>
            <span className="font-semibold">スピードモード:</span> Gemini Flashなど高速AIを使用。構成作成や下書きに最適。
          </div>
        </div>
        <div className="flex items-start">
          <Sparkles size={14} className="mr-1.5 mt-0.5 text-purple-500 flex-shrink-0" />
          <div>
            <span className="font-semibold">ハイクオリティモード:</span> Claude/OpenAIなど高性能AIを使用。重要な章や仕上げに最適。
          </div>
        </div>
      </div>

      {/* プラン別の注意書き */}
      {planTier === 'pro' && (
        <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded p-2">
          💡 Proプラン: ハイクオリティモードは1日20回まで、スピードモードは80回まで使用できます。
        </div>
      )}
      {planTier === 'business' && (
        <div className="text-xs text-green-600 bg-green-50 border border-green-200 rounded p-2">
          ⭐ Businessプラン: ハイクオリティモードは1日50回まで、スピードモードは無制限で使用できます。
        </div>
      )}
    </div>
  );
}

