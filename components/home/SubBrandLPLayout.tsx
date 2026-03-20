'use client';

import { useState, useEffect, useRef, Suspense, ReactNode } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import AffiliateTracker from '@/components/affiliate/AffiliateTracker';
import WelcomeGuide from '@/components/home/WelcomeGuide';
import ToolGuideModal from '@/components/home/ToolGuideModal';
import { HomeAuthContext } from './HomeAuthContext';
import { setUserId } from '@/lib/gtag';
import { PersonaId, getPersonaById, PERSONAS } from '@/lib/persona-config';
import { Menu, X, LogIn, ArrowRight, ChevronDown, BookOpen, HelpCircle, LucideIcon } from 'lucide-react';

// ============================================================
// サブブランド専用ヘッダー
// ============================================================

type SubBrandHeaderProps = {
  brandName: string;
  brandIcon: LucideIcon;
  brandColor: string;
  personaSlug: string;
  personaId: PersonaId;
  user: { email?: string; id?: string } | null;
  onLoginClick: () => void;
  onOpenGuide: () => void;
};

function SubBrandHeader({ brandName, brandIcon: BrandIcon, brandColor, personaSlug, personaId, user, onLoginClick, onOpenGuide }: SubBrandHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setTypeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const otherPersonas = PERSONAS.filter((p) => p.id !== personaId);

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
          {/* 使い方ガイド */}
          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <HelpCircle size={14} />
            使い方
          </button>

          {/* 料金 */}
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
            料金
          </Link>

          {/* 全ツール一覧 */}
          <Link href="/" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <BookOpen size={14} />
            全ツール
          </Link>

          {/* 他のタイプ（ドロップダウン） */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setTypeDropdownOpen(!typeDropdownOpen)}
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              他のタイプ
              <ChevronDown size={14} className={`transition-transform ${typeDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {typeDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                {otherPersonas.map((p) => {
                  const PIcon = p.icon;
                  return (
                    <Link
                      key={p.id}
                      href={`/for/${p.lpSlug}`}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                      onClick={() => setTypeDropdownOpen(false)}
                    >
                      <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${p.hexColor}15` }}>
                        <PIcon size={16} style={{ color: p.hexColor }} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{p.shortLabel}</p>
                        <p className="text-[10px] text-gray-500">{p.label}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* CTA */}
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
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2 shadow-lg">
          <button
            onClick={() => { setMenuOpen(false); onOpenGuide(); }}
            className="flex items-center gap-2 w-full text-sm text-gray-600 py-2"
          >
            <HelpCircle size={14} />
            使い方ガイド
          </button>
          <Link href="/pricing" className="block text-sm text-gray-600 py-2" onClick={() => setMenuOpen(false)}>
            料金
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm text-gray-600 py-2" onClick={() => setMenuOpen(false)}>
            <BookOpen size={14} />
            全ツール一覧
          </Link>

          {/* 他のタイプ（モバイル） */}
          <div className="border-t border-gray-100 pt-2 mt-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">他のタイプ</p>
            {otherPersonas.map((p) => {
              const PIcon = p.icon;
              return (
                <Link
                  key={p.id}
                  href={`/for/${p.lpSlug}`}
                  className="flex items-center gap-2.5 py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  <PIcon size={14} style={{ color: p.hexColor }} />
                  <span className="text-sm text-gray-700">{p.shortLabel}</span>
                </Link>
              );
            })}
          </div>

          {/* CTA */}
          <div className="pt-2">
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
                onClick={() => { setMenuOpen(false); onLoginClick(); }}
                className="flex items-center justify-center gap-1.5 w-full px-4 py-3 rounded-xl text-white text-sm font-bold shadow-md"
                style={{ backgroundColor: brandColor }}
              >
                <LogIn size={14} />
                無料で始める
              </button>
            )}
          </div>
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
  const [welcomeGuideOpen, setWelcomeGuideOpen] = useState(false);
  const [showToolGuide, setShowToolGuide] = useState(false);

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
    <HomeAuthContext.Provider value={{ user, setShowAuth, setShowProPlanModal: () => {}, setWelcomeGuideOpen, setShowToolGuide }}>
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
          personaId={personaId}
          user={user}
          onLoginClick={() => setShowAuth(true)}
          onOpenGuide={() => setWelcomeGuideOpen(true)}
        />

        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          setUser={setUser}
          onNavigate={navigateTo}
        />

        {/* ガイド */}
        <ToolGuideModal
          isOpen={showToolGuide}
          onClose={() => setShowToolGuide(false)}
        />
        <WelcomeGuide
          externalOpen={welcomeGuideOpen}
          onOpenChange={(open: boolean) => {
            if (!open) setWelcomeGuideOpen(false);
          }}
          onOpenToolGuide={() => setShowToolGuide(true)}
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
