'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase, TABLES } from '@/lib/supabase';
import { getAdminEmails } from '@/lib/constants';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import SNSPostEditor from '@/components/sns-post/SNSPostEditor';
import { Loader2 } from 'lucide-react';
import { SNSPost } from '@/lib/types';

function SNSPostEditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const editId = searchParams.get('id');

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [editingPost, setEditingPost] = useState<SNSPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
      }

      // 編集モード: 既存データを読み込み
      if (editId) {
        const { data } = await supabase
          .from(TABLES.SNS_POSTS)
          .select('*')
          .eq('slug', editId)
          .single();
        if (data) {
          setEditingPost(data as SNSPost);
        }
      }

      setIsLoading(false);
    };

    init();
  }, [editId]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
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
        currentService="sns-post"
      />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        setUser={(u: { id: string; email?: string }) => {
          setUser(u);
          setShowAuth(false);
        }}
      />

      <SNSPostEditor
        user={user}
        editingPost={editingPost}
        setShowAuth={setShowAuth}
      />
    </div>
  );
}

export default function SNSPostEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        </div>
      }
    >
      <SNSPostEditorContent />
    </Suspense>
  );
}
