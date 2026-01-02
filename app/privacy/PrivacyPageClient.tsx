'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { PrivacyPage } from '@/components/shared/StaticPages';

export default function PrivacyPageClient() {
  const router = useRouter();
  const [user, setUser] = useState<{ email?: string } | null>(null);

  useEffect(() => {
    const init = async () => {
      if (supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      }
    };
    init();
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const navigateTo = (page: string) => {
    if (page === '/' || page === '') {
      router.push('/');
    } else if (page === 'dashboard') {
      router.push('/dashboard');
    } else if (page === 'create') {
      router.push('/#create-section');
    } else if (page.includes('/editor')) {
      router.push(`/${page}`);
    } else {
      router.push(`/${page}`);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <PrivacyPage
      onBack={handleBack}
      setPage={navigateTo}
      user={user}
      onLogout={handleLogout}
      setShowAuth={() => router.push('/?auth=true')}
    />
  );
}



































































