'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getAdminEmails } from '@/lib/constants';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import SiteEditor from '@/components/site/SiteEditor';
import LoginRequired from '@/components/shared/LoginRequired';
import { Loader2 } from 'lucide-react';

function SiteEditorContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const newParam = searchParams.get('new');

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSite, setEditingSite] = useState(null);

  const adminEmails = getAdminEmails();
  const isAdmin = user?.email && adminEmails.some(email =>
    user.email?.toLowerCase() === email.toLowerCase()
  );

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }

      const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null);
      });
      subscription = sub;

      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (newParam) {
        setEditingSite(null);
      } else if (editId) {
        const { data } = await supabase
          .from('sites')
          .select('*, site_pages(*)')
          .eq('slug', editId)
          .single();

        if (data) {
          if (data.site_pages) {
            data.pages = data.site_pages.sort((a: { sort_order: number }, b: { sort_order: number }) => a.sort_order - b.sort_order);
            delete data.site_pages;
          }
          setEditingSite(data);
        }
      }
      setIsLoading(false);
    };

    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, [editId, newParam]);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-cyan-600" size={48} />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <Header setPage={navigateTo} user={null} onLogout={handleLogout} setShowAuth={setShowAuth} currentService="site" />
        <LoginRequired toolName="ホームページメーカー" onLogin={() => setShowAuth(true)} />
        <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} onNavigate={navigateTo} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        setPage={navigateTo}
        user={user}
        onLogout={handleLogout}
        setShowAuth={setShowAuth}
        currentService="site"
      />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        setUser={setUser}
        onNavigate={navigateTo}
      />

      <SiteEditor
        user={user}
        isAdmin={isAdmin}
        initialData={editingSite}
        setPage={navigateTo}
        onBack={() => window.history.length > 1 ? window.history.back() : (window.location.href = '/')}
        setShowAuth={setShowAuth}
      />
    </div>
  );
}

export default function SiteEditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-cyan-600" size={48} />
      </div>
    }>
      <SiteEditorContent />
    </Suspense>
  );
}
