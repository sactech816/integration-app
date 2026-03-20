'use client';

import { useState, useEffect, Suspense, ReactNode } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import AffiliateTracker from '@/components/affiliate/AffiliateTracker';
import { HomeAuthContext } from './HomeAuthContext';
import { setUserId } from '@/lib/gtag';
import { PersonaId, getPersonaById } from '@/lib/persona-config';
import { Menu, X, LogIn, ArrowRight, LucideIcon } from 'lucide-react';

// ============================================================
// サブブランド専用ヘッダー
// ============================================================

type SubBrandHeaderProps = {
  brandName: string;
  brandIcon: LucideIcon;
  brandColor: string;
  personaSlug: string;
  user: { email?: string; id?: string } | null;
  onLoginClick: () => void;
};

function SubBrandHeader({ brandName, brandIcon: BrandIcon, brandColor, personaSlug, user, onLoginClick }: SubBrandHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* ロゴ */}
        <Link href={`/for/${personaSlug}`} className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${brandColor}15` }}>
            <BrandIcon size={20} style={{ color: brandColor }} />
          </div>
          <div>
            <span className="font-bold text-gray-900 text-sm">{brandName}</span>
            <span className="text-[10px] text-gray-400 block -mt-0.5">by 集客メーカー</span>
          </div>
        </Link>

        {/* デスクトップナビ */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            料金
          </Link>
          <Link href="/for" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            他のタイプ
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
              style={{ backgroundColor: brandColor }}
            >
              ダッシュボードへ
              <ArrowRight size={14} />
            </Link>
          ) : (
            <button
              onClick={onLoginClick}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-bold shadow-md hover:shadow-lg transition-all"
              style={{ backgroundColor: brandColor }}
            >
              <LogIn size={14} />
              無料で始める
            </button>
          )}
        </div>

        {/* モバイルメニューボタン */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {menuOpen ? <X size={22} className="text-gray-700" /> : <Menu size={22} className="text-gray-700" />}
        </button>
      </div>

      {/* モバイルメニュー */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3 shadow-lg">
          <Link
            href="/#pricing"
            className="block text-sm text-gray-600 py-2"
            onClick={() => setMenuOpen(false)}
          >
            料金
          </Link>
          <Link
            href="/for"
            className="block text-sm text-gray-600 py-2"
            onClick={() => setMenuOpen(false)}
          >
            他のタイプを見る
          </Link>
          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center justify-center gap-1.5 w-full px-4 py-3 rounded-xl text-white text-sm font-bold shadow-md"
              style={{ backgroundColor: brandColor }}
            >
              ダッシュボードへ
              <ArrowRight size={14} />
            </Link>
          ) : (
            <button
              onClick={() => {
                setMenuOpen(false);
                onLoginClick();
              }}
              className="flex items-center justify-center gap-1.5 w-full px-4 py-3 rounded-xl text-white text-sm font-bold shadow-md"
              style={{ backgroundColor: brandColor }}
            >
              <LogIn size={14} />
              無料で始める
            </button>
          )}
        </div>
      )}
    </header>
  );
}

// ============================================================
// SubBrandLPLayout
// ============================================================

type SubBrandLPLayoutProps = {
  personaId: PersonaId;
  children: ReactNode;
};

export default function SubBrandLPLayout({ personaId, children }: SubBrandLPLayoutProps) {
  const persona = getPersonaById(personaId);
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      if (supabase) {
        const {
          data: { subscription: sub },
        } = supabase.auth.onAuthStateChange((_event, session) => {
          setUser(session?.user || null);
          setUserId(session?.user?.id || null);
        });
        subscription = sub;

        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();
        setUser(authUser || null);
      }
    };
    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const navigateTo = (page: string) => {
    if (page === '/' || page === '') {
      window.location.href = '/';
    } else {
      window.location.href = `/${page}`;
    }
  };

  if (!persona) return null;

  return (
    <HomeAuthContext.Provider value={{ user, setShowAuth, setShowProPlanModal: () => {}, setWelcomeGuideOpen: () => {}, setShowToolGuide: () => {} }}>
      <div
        className="min-h-screen"
        style={{
          fontFamily: "'Zen Maru Gothic', sans-serif",
          backgroundColor: '#fffbf0',
          color: '#5d4037',
          lineHeight: '2.0',
        }}
      >
        <Suspense fallback={null}>
          <AffiliateTracker serviceType="makers" />
        </Suspense>

        {/* ペルソナ専用ヘッダー */}
        <SubBrandHeader
          brandName={persona.label}
          brandIcon={persona.icon}
          brandColor={persona.hexColor}
          personaSlug={persona.lpSlug}
          user={user}
          onLoginClick={() => setShowAuth(true)}
        />

        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          setUser={setUser}
          onNavigate={navigateTo}
        />

        {children}

        {/* 共通フッター */}
        <Footer
          setPage={navigateTo}
          onCreate={(service) => service && navigateTo(`${service}/editor`)}
          user={user}
          setShowAuth={setShowAuth}
        />
      </div>
    </HomeAuthContext.Provider>
  );
}
