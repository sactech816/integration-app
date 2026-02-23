'use client';

import { useState, useEffect, Suspense, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import AnnouncementBanner from '@/components/shared/AnnouncementBanner';
import AffiliateTracker from '@/components/affiliate/AffiliateTracker';
import WelcomeGuide from '@/components/home/WelcomeGuide';
import ProPlanModal from '@/components/home/ProPlanModal';
import { HomeAuthContext } from './HomeAuthContext';
import { setUserId } from '@/lib/gtag';

export default function HomeAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email?: string; id?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showProPlanModal, setShowProPlanModal] = useState(false);
  const [welcomeGuideOpen, setWelcomeGuideOpen] = useState(false);

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
    } else if (page === 'create') {
      document.getElementById('create-section-services')?.scrollIntoView({ behavior: 'smooth' });
    } else if (page === 'diagnosis') {
      document.getElementById('diagnosis')?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = `/${page}`;
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  return (
    <HomeAuthContext.Provider value={{ user, setShowAuth, setShowProPlanModal, setWelcomeGuideOpen }}>
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
        <AnnouncementBanner serviceType="all" />

        <Header
          setPage={navigateTo}
          user={user}
          onLogout={handleLogout}
          setShowAuth={setShowAuth}
        />
        <AuthModal
          isOpen={showAuth}
          onClose={() => setShowAuth(false)}
          setUser={setUser}
          onNavigate={navigateTo}
        />
        <ProPlanModal
          isOpen={showProPlanModal}
          onClose={() => setShowProPlanModal(false)}
          user={user}
          onShowAuth={() => {
            setShowProPlanModal(false);
            setShowAuth(true);
          }}
        />
        <WelcomeGuide
          externalOpen={welcomeGuideOpen}
          onOpenChange={(open: boolean) => {
            if (!open) setWelcomeGuideOpen(false);
          }}
        />

        {children}

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
