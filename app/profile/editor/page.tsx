'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getAdminEmails } from '@/lib/constants';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import ProfileEditor from '@/components/profile/ProfileEditor';
import { Loader2 } from 'lucide-react';

function ProfileEditorContent() {
  const searchParams = useSearchParams();
  const editId = searchParams.get('id');
  const newParam = searchParams.get('new'); // 新規作成パラメータ

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(null);

  const adminEmails = getAdminEmails();
  const isAdmin = user?.email && adminEmails.some(email =>
    user.email?.toLowerCase() === email.toLowerCase()
  );

  useEffect(() => {
    const init = async () => {
      // newパラメータがある場合は新規作成モード（編集データをリセット）
      if (newParam) {
        setEditingProfile(null);
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
            .from('profiles')
            .select('*')
            .eq('slug', editId)
            .single();

          if (data) {
            setEditingProfile(data);
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
        <Loader2 className="animate-spin text-emerald-600" size={48} />
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
        currentService="profile"
      />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        setUser={setUser}
        onNavigate={navigateTo}
      />

      <ProfileEditor
        user={user}
        isAdmin={isAdmin}
        initialData={editingProfile}
        setPage={navigateTo}
        onBack={() => navigateTo('dashboard')}
        setShowAuth={setShowAuth}
      />
    </div>
  );
}

export default function ProfileEditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
      </div>
    }>
      <ProfileEditorContent />
    </Suspense>
  );
}
