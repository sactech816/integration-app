'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useConciergeChat } from '@/lib/hooks/useConciergeChat';
import ConciergeAvatar from './ConciergeAvatar';
import ConciergeChat from './ConciergeChat';
import AuthModal from '@/components/shared/AuthModal';

interface ConciergeWidgetProps {
  onOpenChange?: (isOpen: boolean) => void;
}

export default function ConciergeWidget({ onOpenChange }: ConciergeWidgetProps) {
  const pathname = usePathname();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  const {
    messages,
    isLoading,
    isOpen,
    avatarState,
    remainingMessages,
    sendMessage,
    toggleOpen,
    clearHistory,
  } = useConciergeChat();

  // ユーザー情報を取得
  useEffect(() => {
    if (!supabase) return;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
      }
    };
    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 親コンポーネントに開閉状態を通知
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  // 公開コンテンツページでは非表示
  const publicPrefixes = ['/quiz/', '/profile/', '/business/', '/salesletter/', '/attendance/', '/booking/', '/survey/', '/gamification/'];
  const isPublicPage = publicPrefixes.some(p => pathname.startsWith(p)) && !pathname.includes('/editor');
  if (isPublicPage) return null;

  const handleToggle = () => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    toggleOpen();
  };

  return (
    <>
      {/* トリガーボタン — チャットが閉じている時のみ表示 */}
      {!isOpen && (
        <div className="fixed bottom-24 right-6 z-[60]">
          <button
            onClick={handleToggle}
            className="relative w-14 h-14 rounded-full shadow-lg
              bg-gradient-to-br from-blue-500 to-blue-600
              flex items-center justify-center
              hover:scale-110 transition-all duration-200
              hover:shadow-xl"
            aria-label="AIコンシェルジュを開く"
          >
            <span className="absolute inset-0 rounded-full bg-blue-400 concierge-pulse-ring" />
            <ConciergeAvatar state="idle" size={36} />
          </button>
        </div>
      )}

      {/* チャットパネル — 矢印・ご意見箱の上に展開 */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[60]">
          <ConciergeChat
            messages={messages}
            avatarState={avatarState}
            isLoading={isLoading}
            remainingMessages={remainingMessages}
            onSend={sendMessage}
            onClose={toggleOpen}
            onClear={clearHistory}
          />
        </div>
      )}

      {/* 未ログインユーザー向けAuthModal */}
      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        setUser={(u: any) => {
          if (u?.id) {
            setUser({ id: u.id, email: u.email });
          }
        }}
        defaultTab="login"
      />
    </>
  );
}
