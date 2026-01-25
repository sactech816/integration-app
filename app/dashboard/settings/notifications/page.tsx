'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * 通知設定ページ
 * ダッシュボードの設定画面に統合されたため、リダイレクトします
 */
export default function NotificationSettingsPage() {
  const router = useRouter();

  useEffect(() => {
    // ダッシュボードの設定画面にリダイレクト
    router.replace('/dashboard?view=settings');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-4" />
        <p className="text-gray-600">ダッシュボードの設定画面に移動中...</p>
      </div>
    </div>
  );
}

