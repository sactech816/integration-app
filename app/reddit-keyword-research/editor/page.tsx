'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getAdminEmails } from '@/lib/constants';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import RedditKeywordResearchEditor from '@/components/reddit-keyword-research/RedditKeywordResearchEditor';
import { Loader2 } from 'lucide-react';

export default function RedditKeywordResearchPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const adminEmails = getAdminEmails();
  const isAdmin = !!(user?.email && adminEmails.some(email =>
    user.email?.toLowerCase() === email.toLowerCase()
  ));

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user || null);
      });
      subscription = sub;

      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setIsLoading(false);
    };

    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const navigateTo = (page: string) => {
    window.location.href = page.startsWith('/') ? page : `/${page}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
      </div>
    );
  }

  return (
    <>
      <Header
        user={user}
        setShowAuth={setShowAuth}
        onLogout={handleLogout}
        setPage={navigateTo}
      />

      {user ? (
        <RedditKeywordResearchEditor user={user} isAdmin={isAdmin} />
      ) : (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl border border-gray-300 shadow-md p-8 max-w-md mx-auto text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ログインが必要です</h2>
            <p className="text-gray-600 mb-6">Redditキーワードリサーチを利用するにはログインしてください</p>
            <button
              onClick={() => setShowAuth(true)}
              className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]"
            >
              ログイン
            </button>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        setUser={setUser}
      />
    </>
  );
}
