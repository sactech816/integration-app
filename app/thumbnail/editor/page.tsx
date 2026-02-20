'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase, TABLES } from '@/lib/supabase';
import { getAdminEmails } from '@/lib/constants';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import ThumbnailEditor from '@/components/thumbnail/ThumbnailEditor';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Thumbnail } from '@/lib/types';

function ThumbnailEditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get('id');

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [editingThumbnail, setEditingThumbnail] = useState<Thumbnail | null>(null);
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
        const adminEmails = getAdminEmails();
        setIsAdmin(adminEmails.some(e => currentUser.email?.toLowerCase() === e.toLowerCase()));

        // Pro状態を取得
        try {
          const res = await fetch(`/api/makers/subscription-status?userId=${currentUser.id}`);
          if (res.ok) {
            const status = await res.json();
            setIsPro(status.planTier === 'pro');
          }
        } catch (e) {
          console.error('Failed to fetch subscription status:', e);
        }
      }

      // 編集モード: 既存データを読み込み
      if (editId) {
        const { data } = await supabase
          .from(TABLES.THUMBNAILS)
          .select('*')
          .eq('slug', editId)
          .single();
        if (data) {
          setEditingThumbnail(data as Thumbnail);
        }
      }

      setIsLoading(false);
    };

    init();
  }, [editId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
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

      <ThumbnailEditor
        user={user}
        editingThumbnail={editingThumbnail}
        setShowAuth={setShowAuth}
        isPro={isPro}
      />
    </div>
  );
}

export default function ThumbnailEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        </div>
      }
    >
      <ThumbnailEditorContent />
    </Suspense>
  );
}
