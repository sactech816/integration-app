'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/shared/AuthModal';
import Link from 'next/link';

interface AdLandingHeaderProps {
  ctaText: string;
  ctaHref: string;
  themeColor?: 'blue' | 'teal' | 'rose';
}

const colorMap = {
  blue: {
    btn: 'bg-blue-600 hover:bg-blue-700 text-white',
    loggedIn: 'bg-blue-600 hover:bg-blue-700 text-white',
  },
  teal: {
    btn: 'bg-teal-600 hover:bg-teal-700 text-white',
    loggedIn: 'bg-teal-600 hover:bg-teal-700 text-white',
  },
  rose: {
    btn: 'bg-rose-600 hover:bg-rose-700 text-white',
    loggedIn: 'bg-rose-600 hover:bg-rose-700 text-white',
  },
};

export default function AdLandingHeader({ ctaText, ctaHref, themeColor = 'blue' }: AdLandingHeaderProps) {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const colors = colorMap[themeColor];

  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">集客メーカー</span>
          </Link>

          {user ? (
            <Link
              href={ctaHref}
              className={`px-6 py-2.5 font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px] flex items-center ${colors.loggedIn}`}
            >
              {ctaText}
            </Link>
          ) : (
            <button
              onClick={() => setShowAuth(true)}
              className={`px-6 py-2.5 font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px] ${colors.btn}`}
            >
              無料で始める
            </button>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        setUser={setUser}
        onNavigate={() => {
          setShowAuth(false);
          window.location.href = ctaHref;
        }}
        defaultTab="signup"
      />
    </>
  );
}
