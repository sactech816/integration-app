'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUp, MessageSquareHeart } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import FeedbackModal from './FeedbackModal';
import AuthModal from './AuthModal';

export default function FloatingButtons() {
  const pathname = usePathname();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);

  // ユーザー情報をSupabaseから取得
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

  // スクロール検知
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // 公開コンテンツページ（エンドユーザー向け）では非表示
  const publicContentPrefixes = ['/quiz/', '/profile/', '/business/', '/salesletter/', '/attendance/', '/booking/', '/survey/', '/gamification/'];
  const isPublicContentPage = publicContentPrefixes.some(prefix => pathname.startsWith(prefix)) && !pathname.includes('/editor');

  if (isPublicContentPage) return null;

  return (
    <>
      {/* フローティングボタン群 */}
      {showScrollTop && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
          {/* ご意見箱ボタン（アイコン＋テキスト） */}
          <button
            onClick={() => user ? setShowFeedback(true) : setShowAuth(true)}
            className="h-12 px-4 text-white rounded-full shadow-lg flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #818cf8, #6366f1)' }}
            aria-label="ご意見箱"
          >
            <MessageSquareHeart size={20} />
            <span className="text-sm font-bold whitespace-nowrap">ご意見箱</span>
          </button>

          {/* トップに戻るボタン */}
          <button
            onClick={scrollToTop}
            className="w-12 h-12 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
            style={{ backgroundColor: '#f97316' }}
            aria-label="トップに戻る"
          >
            <ArrowUp size={24} />
          </button>
        </div>
      )}

      {/* ご意見箱モーダル */}
      <FeedbackModal
        isOpen={showFeedback}
        onClose={() => setShowFeedback(false)}
        user={user}
        onLoginRequest={() => { setShowFeedback(false); setShowAuth(true); }}
      />

      {/* ログインモーダル（未ログイン時のご意見箱用） */}
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
