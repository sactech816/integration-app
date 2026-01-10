'use client';

import { useState, useEffect } from 'react';
import { getAICreditCheckResult } from '@/lib/ai-usage';
import type { AIMode } from '@/lib/types';

interface AIModeToggleProps {
  userId: string;
  currentMode: AIMode;
  onModeChange: (mode: AIMode) => void;
  disabled?: boolean;
}

export default function AIModeToggle({ 
  userId, 
  currentMode, 
  onModeChange, 
  disabled = false 
}: AIModeToggleProps) {
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const [canUsePremium, setCanUsePremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkPremiumAccess();
  }, [userId]);

  const checkPremiumAccess = async () => {
    try {
      setLoading(true);
      
      // Premium枠の利用可能性をチェック
      const response = await fetch(`/api/ai-credit-check?userId=${userId}&mode=quality`);
      const data = await response.json();
      
      setHasPremiumAccess(data.hasPremiumAccess);
      setCanUsePremium(data.canUsePremium);
      
      // Premium枠がない、または使い切った場合はspeedモードに自動切替
      if (currentMode === 'quality' && (!data.hasPremiumAccess || !data.canUsePremium)) {
        onModeChange('speed');
      }
    } catch (error) {
      console.error('Failed to check premium access:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded-lg w-64"></div>
      </div>
    );
  }

  // Premium枠がない場合は表示しない
  if (!hasPremiumAccess) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-2">
        <span>🚀</span>
        <span>高速AIモード</span>
        <a 
          href="/subscription" 
          className="ml-2 text-purple-600 hover:text-purple-700 font-medium underline"
        >
          高品質AIを使う →
        </a>
      </div>
    );
  }

  const handleToggle = (mode: AIMode) => {
    if (mode === 'quality' && !canUsePremium) {
      alert('本日の高品質AI使用上限に達しました。高速AIモードをご利用ください。');
      return;
    }
    onModeChange(mode);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* トグルボタン */}
      <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
        {/* Speedモード */}
        <button
          onClick={() => handleToggle('speed')}
          disabled={disabled}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
            ${currentMode === 'speed'
              ? 'bg-blue-500 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span>🚀</span>
          <span>高速AI</span>
        </button>

        {/* Qualityモード */}
        <button
          onClick={() => handleToggle('quality')}
          disabled={disabled || !canUsePremium}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
            ${currentMode === 'quality'
              ? 'bg-purple-500 text-white shadow-sm'
              : 'text-gray-700 hover:bg-gray-50'
            }
            ${disabled || !canUsePremium ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <span>⚡</span>
          <span>高品質AI</span>
          {!canUsePremium && (
            <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">
              上限
            </span>
          )}
        </button>
      </div>

      {/* モード説明 */}
      <div className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
        {currentMode === 'quality' ? (
          <div className="flex items-start gap-2">
            <span>⚡</span>
            <div>
              <p className="font-medium text-gray-900 mb-0.5">高品質AIモード</p>
              <p>Claude 3.5 SonnetやO3-miniなど、最高品質のAIモデルを使用します。より洗練された文章を生成できます。</p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-2">
            <span>🚀</span>
            <div>
              <p className="font-medium text-gray-900 mb-0.5">高速AIモード</p>
              <p>Gemini 2.0 Flashを使用します。高速で、多くの回数をご利用いただけます。</p>
            </div>
          </div>
        )}
      </div>

      {/* Premium枠切れ警告 */}
      {!canUsePremium && currentMode === 'speed' && (
        <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 flex items-start gap-2">
          <span>ℹ️</span>
          <p>
            本日の高品質AI使用回数に達しました。明日0時（JST）にリセットされます。
          </p>
        </div>
      )}
    </div>
  );
}

