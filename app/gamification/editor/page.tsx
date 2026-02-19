'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import AuthModal from '@/components/shared/AuthModal';
import GachaEditor from '@/components/gamification/editors/GachaEditor';
import StampRallyEditor from '@/components/gamification/editors/StampRallyEditor';
import LoginBonusEditor from '@/components/gamification/editors/LoginBonusEditor';
import { Loader2 } from 'lucide-react';

// ガチャ系のゲームタイプ（同じエディタを使用）
const GACHA_LIKE_TYPES = ['gacha', 'scratch', 'fukubiki', 'slot'];

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignType = searchParams.get('type') || 'gacha';
  const editId = searchParams.get('id');

  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);

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

      // 編集モードの場合、キャンペーンを読み込む
      if (editId) {
        const { data } = await supabase
          .from('gamification_campaigns')
          .select('*')
          .eq('id', editId)
          .single();

        if (data) {
          setInitialData(data);
        }
      }

      setIsLoading(false);
    };

    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, [editId]);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleBack = () => {
    router.push('/gamification/new');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  // キャンペーンタイプに応じたエディタを表示
  const renderEditor = () => {
    const commonProps = {
      user,
      initialData,
      onBack: handleBack,
      setShowAuth,
    };

    // ガチャ系のタイプ（gacha, scratch, fukubiki, slot）は同じエディタを使用
    if (GACHA_LIKE_TYPES.includes(campaignType)) {
      return (
        <GachaEditor 
          {...commonProps} 
          gameType={campaignType as 'gacha' | 'scratch' | 'fukubiki' | 'slot'} 
        />
      );
    }

    switch (campaignType) {
      case 'stamp_rally':
        return <StampRallyEditor {...commonProps} />;
      case 'login_bonus':
        return <LoginBonusEditor {...commonProps} />;
      case 'point_quiz':
        // ポイントクイズは既存のクイズエディタを使用（別途実装が必要）
        // 暫定的にガチャエディタを表示
        return <GachaEditor {...commonProps} gameType="gacha" />;
      default:
        return <GachaEditor {...commonProps} gameType="gacha" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        user={user}
        onLogout={handleLogout}
        setShowAuth={setShowAuth}
      />

      {showAuth && (
        <AuthModal 
          isOpen={showAuth} 
          onClose={() => setShowAuth(false)} 
          setUser={setUser}
        />
      )}

      {renderEditor()}
    </div>
  );
}

export default function GamificationEditorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
