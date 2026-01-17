'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AccountSettings from '../components/Settings/AccountSettings';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
      } else {
        router.push('/dashboard');
      }
      setIsLoading(false);
    };

    init();
  }, [router]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      router.push('/');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header user={user} onLogout={handleLogout} setShowAuth={() => {}} />
      
      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          {/* 戻るボタン */}
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="font-bold">マイページに戻る</span>
          </button>

          <AccountSettings user={user} onLogout={handleLogout} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
