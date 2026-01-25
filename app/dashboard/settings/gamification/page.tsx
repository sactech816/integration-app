'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * ゲーミフィケーション設定ページ（管理者向け）
 * ダッシュボードの管理者メニューに統合されたため、リダイレクトします
 */
export default function GamificationSettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // ダッシュボードの管理者ゲーミフィケーション管理画面にリダイレクト
    router.replace('/dashboard?view=admin-gamification');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
        <p className="text-gray-600">ダッシュボードに移動中...</p>
      </div>
    </div>
  );
}

