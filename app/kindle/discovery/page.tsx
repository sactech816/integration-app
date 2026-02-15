'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, ArrowLeft, Lightbulb, Loader2, HelpCircle, LogIn } from 'lucide-react';
import Link from 'next/link';
import { Step0Discovery } from '@/components/kindle/wizard/Step0Discovery';
import KDLFooter from '@/components/shared/KDLFooter';
import KdlHamburgerMenu from '@/components/kindle/shared/KdlHamburgerMenu';
import AuthModal from '@/components/shared/AuthModal';
import { supabase } from '@/lib/supabase';

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

export default function KindleDiscoveryPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <KindleDiscoveryContent />
    </Suspense>
  );
}

function KindleDiscoveryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const adminKey = searchParams.get('admin_key');
  const adminKeyParam = adminKey ? `?admin_key=${adminKey}` : '';

  const [user, setUser] = useState<any>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // ユーザーの認証状態を確認
  useEffect(() => {
    if (!supabase) {
      setIsCheckingAuth(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsCheckingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user && showAuthModal) {
        setShowAuthModal(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [showAuthModal]);

  const handleComplete = (theme: string) => {
    const params = new URLSearchParams();
    params.set('discovery_theme', theme);
    if (adminKey) params.set('admin_key', adminKey);
    router.push(`/kindle/new?${params.toString()}`);
  };

  const handleCancel = () => {
    router.push(`/kindle/new${adminKeyParam}`);
  };

  if (isCheckingAuth) {
    return <LoadingFallback />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
      {/* 認証モーダル */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        setUser={setUser}
      />

      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-amber-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KdlHamburgerMenu
              adminKey={adminKey}
              buttonClassName="p-2 hover:bg-amber-50 rounded-lg transition-colors"
              iconColor="text-amber-600"
            />
            <Link href={`/kindle/new${adminKeyParam}`} className="flex items-center gap-1.5 sm:gap-2 text-gray-700 hover:text-amber-600 transition-colors">
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
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {!user ? (
          /* 未ログイン時のログイン促進画面 */
          <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-6 sm:p-8">
            <div className="text-center space-y-6">
              <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
                <LogIn className="text-amber-600" size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">ログインが必要です</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  ネタ発掘診断はAIを使ってあなたに最適なテーマを提案します。<br />
                  ご利用にはログインが必要です。
                </p>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg flex items-center gap-2 mx-auto"
              >
                <LogIn size={18} />
                ログイン / 新規登録
              </button>
              <Link
                href={`/kindle/new${adminKeyParam}`}
                className="text-gray-500 hover:text-amber-600 text-sm underline transition-colors inline-block"
              >
                ログインせずにテーマを直接入力する
              </Link>
            </div>
          </div>
        ) : (
          /* ログイン済み: 診断コンテンツ */
          <div className="bg-white rounded-2xl shadow-xl border border-amber-100 p-6 sm:p-8">
            <Step0Discovery
              onComplete={handleComplete}
              onCancel={handleCancel}
              isDemo={false}
            />
          </div>
        )}
      </main>

      {/* フッター */}
      <KDLFooter adminKeyParam={adminKeyParam} />
    </div>
  );
}
