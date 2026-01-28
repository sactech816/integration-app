'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getAdminEmails } from '@/lib/constants';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import SalesLetterEditor from '@/components/salesletter/SalesLetterEditor';
import { Loader2 } from 'lucide-react';

function SalesLetterEditorContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const newParam = searchParams.get('new');

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingData, setEditingData] = useState<any>(null);

  const adminEmails = getAdminEmails();
  const isAdmin = user?.email && adminEmails.some(email =>
    user.email?.toLowerCase() === email.toLowerCase()
  );

  useEffect(() => {
    const init = async () => {
      // newパラメータがある場合は新規作成モード
      if (newParam) {
        setEditingData(null);
        setIsLoading(false);
        
        if (supabase) {
          supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
          });
          const { data: { session } } = await supabase.auth.getSession();
          setUser(session?.user || null);
        }
        return;
      }

      if (supabase) {
        supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null);
        });

        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);

        if (editId) {
          const { data } = await supabase
            .from('sales_letters')
            .select('*')
            .eq('slug', editId)
            .single();

          if (data) {
            setEditingData(data);
          }
        }
      }
      setIsLoading(false);
    };

    init();
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
        <Loader2 className="animate-spin text-rose-600" size={48} />
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
        currentService="salesletter"
      />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        setUser={setUser}
        onNavigate={navigateTo}
      />

      <SalesLetterEditor
        user={user}
        isAdmin={isAdmin}
        initialData={editingData}
        setPage={navigateTo}
        onBack={() => navigateTo('dashboard?view=salesletter')}
        setShowAuth={setShowAuth}
      />
    </div>
  );
}

export default function SalesLetterEditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-rose-600" size={48} />
      </div>
    }>
      <SalesLetterEditorContent />
    </Suspense>
  );
}
