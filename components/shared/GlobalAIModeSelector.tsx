'use client';

import { useState, useEffect } from 'react';
import AIModeToggle from './AIModeToggle';
import AICreditDisplay from './AICreditDisplay';
import type { AIMode } from '@/lib/types';

interface GlobalAIModeSelectorProps {
  userId: string;
  compact?: boolean;
  showCredits?: boolean;
}

export default function GlobalAIModeSelector({ 
  userId, 
  compact = false,
  showCredits = true 
}: GlobalAIModeSelectorProps) {
  const [aiMode, setAiMode] = useState<AIMode>('speed');
  const [loading, setLoading] = useState(true);

  // ローカルストレージからモード設定を読み込み
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem(`ai_mode_${userId}`);
    if (saved === 'quality' || saved === 'speed') {
      setAiMode(saved);
    }
    setLoading(false);
  }, [userId]);

  // モード変更時にローカルストレージに保存
  const handleModeChange = (mode: AIMode) => {
    setAiMode(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`ai_mode_${userId}`, mode);
    }
  };

  if (loading) {
    return <div className="animate-pulse h-20 bg-gray-200 rounded-lg"></div>;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-4 flex-wrap">
        {showCredits && <AICreditDisplay userId={userId} compact />}
        <AIModeToggle
          userId={userId}
          currentMode={aiMode}
          onModeChange={handleModeChange}
        />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <span>⚙️</span>
        AI設定
      </h3>
      
      {showCredits && (
        <div>
          <AICreditDisplay userId={userId} />
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AIモード選択
        </label>
        <AIModeToggle
          userId={userId}
          currentMode={aiMode}
          onModeChange={handleModeChange}
        />
      </div>
    </div>
  );
}

/**
 * ユーザーの現在のAIモードを取得するヘルパー関数
 * エディターなどから呼び出し可能
 */
export function getAIMode(userId: string): AIMode {
  if (typeof window === 'undefined') return 'speed';
  const saved = localStorage.getItem(`ai_mode_${userId}`);
  return (saved === 'quality' || saved === 'speed') ? saved : 'speed';
}

