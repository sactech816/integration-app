'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getAdminEmails } from '@/lib/constants';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import KindleCoverEditor from '@/components/kindle/cover/KindleCoverEditor';
import LoginRequired from '@/components/shared/LoginRequired';
import { Loader2 } from 'lucide-react';

function KindleCoverEditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookId = searchParams.get('bookId');
  const bookTitle = searchParams.get('title');
  const bookSubtitle = searchParams.get('subtitle');

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user || null;
      if (currentUser) {
        setUser({ id: currentUser.id, email: currentUser.email });

        // Pro状態を取得（Kindle用のサブスクリプション）
        try {
          const res = await fetch(`/api/makers/subscription-status?userId=${currentUser.id}`);
          if (res.ok) {
            const status = await res.json();
            setIsPro(status.planTier === 'business' || status.planTier === 'premium');
          }
        } catch (e) {
          console.error('Failed to fetch subscription status:', e);
        }
      }

      setIsLoading(false);
    };

    init();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LoginRequired toolName="Kindle表紙メーカー" onLogin={() => setShowAuth(true)} />
        {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={(u: { id: string; email?: string }) => { setUser(u); setShowAuth(false); }} />}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={user}
        onLogout={async () => {
          await supabase?.auth.signOut();
          router.push('/');
        }}
        setShowAuth={setShowAuth}
        currentService="thumbnail"
      />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        setUser={(u: { id: string; email?: string }) => {
          setUser(u);
          setShowAuth(false);
        }}
      />

      <KindleCoverEditor
        user={user}
        setShowAuth={setShowAuth}
        isPro={isPro}
        bookId={bookId || undefined}
        bookTitle={bookTitle || undefined}
        bookSubtitle={bookSubtitle}
      />
    </div>
  );
}

export default function KindleCoverEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      }
    >
      <KindleCoverEditorContent />
    </Suspense>
  );
}
