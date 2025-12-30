'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getAdminEmails } from '@/lib/constants';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import BusinessEditor from '@/components/business/BusinessEditor';
import { Loader2 } from 'lucide-react';

function BusinessEditorContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLP, setEditingLP] = useState(null);

  const adminEmails = getAdminEmails();
  const isAdmin = user?.email && adminEmails.some(email =>
    user.email?.toLowerCase() === email.toLowerCase()
  );

  useEffect(() => {
    const init = async () => {
      if (supabase) {
        supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null);
        });

        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);

        if (editId) {
          const { data } = await supabase
            .from('business_lps')
            .select('*')
            .eq('slug', editId)
            .single();

          if (data) {
            setEditingLP(data);
          }
        }
      }
      setIsLoading(false);
    };

    init();
  }, [editId]);

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
        <Loader2 className="animate-spin text-amber-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        setPage={navigateTo}
        user={user}
        onLogout={handleLogout}
        setShowAuth={setShowAuth}
        currentService="business"
      />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        setUser={setUser}
        onNavigate={navigateTo}
      />

      <BusinessEditor
        user={user}
        isAdmin={isAdmin}
        initialData={editingLP}
        setPage={navigateTo}
        onBack={() => navigateTo('dashboard')}
        setShowAuth={setShowAuth}
      />
    </div>
  );
}

export default function BusinessEditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-amber-600" size={48} />
      </div>
    }>
      <BusinessEditorContent />
    </Suspense>
  );
}
