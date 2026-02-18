'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, ArrowLeft, Lightbulb, Loader2, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { Step0Discovery } from '@/components/kindle/wizard/Step0Discovery';
import KDLFooter from '@/components/shared/KDLFooter';
import KdlHamburgerMenu from '@/components/kindle/shared/KdlHamburgerMenu';

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="animate-spin text-amber-600" size={40} />
        <p className="text-gray-600 font-medium">読み込み中...</p>
      </div>
    </div>
  );
}

export default function KindleDiscoveryDemoPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <KindleDiscoveryDemoContent />
    </Suspense>
  );
}

function KindleDiscoveryDemoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adminKey = searchParams.get('admin_key');
  const adminKeyParam = adminKey ? `?admin_key=${adminKey}` : '';

  const handleComplete = (theme: string) => {
    const params = new URLSearchParams();
    params.set('discovery_theme', theme);
    params.set('mode', 'demo');
    if (adminKey) params.set('admin_key', adminKey);
    router.push(`/kindle/new?${params.toString()}`);
  };

  const handleCancel = () => {
    router.push(`/kindle/new?mode=demo${adminKey ? `&admin_key=${adminKey}` : ''}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KdlHamburgerMenu
              adminKey={adminKey}
              buttonClassName="p-2 hover:bg-amber-50 rounded-lg transition-colors"
              iconColor="text-amber-600"
            />
            <Link href={`/kindle/new?mode=demo${adminKey ? `&admin_key=${adminKey}` : ''}`} className="flex items-center gap-1.5 sm:gap-2 text-gray-700 hover:text-amber-600 transition-colors">
              <ArrowLeft size={18} />
              <span className="font-medium text-sm sm:text-base">戻る</span>
            </Link>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <BookOpen className="text-amber-600" size={20} />
            <div>
              <span className="font-bold text-gray-900 hidden sm:inline">Kindle出版メーカー</span>
              <span className="font-bold text-gray-900 sm:hidden">Kindle出版</span>
            </div>
          </div>
          <Link
            href="/kindle/guide"
            target="_blank"
            className="flex items-center justify-center gap-1.5 text-amber-600 hover:text-amber-700 transition-colors bg-amber-50 hover:bg-amber-100 p-2 sm:px-3 sm:py-1.5 rounded-lg text-sm font-medium"
            title="まずお読みください"
          >
            <HelpCircle size={18} />
            <span className="hidden sm:inline">まずお読みください</span>
          </Link>
        </div>
      </header>

      {/* ネタ発掘診断ヘッダー */}
      <div className="bg-white border-b border-amber-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-2 rounded-lg">
              <Lightbulb size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">ネタ発掘診断</h2>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">デモ版</span>
          </div>
        </div>
      </div>

      {/* メインコンテンツ（デモモード） */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-6 sm:p-8">
          <Step0Discovery
            onComplete={handleComplete}
            onCancel={handleCancel}
            isDemo={true}
          />
        </div>
      </main>

      {/* フッター */}
      <KDLFooter adminKeyParam={adminKeyParam} isDemo={true} />
    </div>
  );
}
