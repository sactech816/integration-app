'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useConciergeChat } from '@/lib/hooks/useConciergeChat';
import ConciergeAvatar from './ConciergeAvatar';
import ConciergeChat from './ConciergeChat';

interface ConciergeWidgetProps {
  onOpenChange?: (isOpen: boolean) => void;
}

export default function ConciergeWidget({ onOpenChange }: ConciergeWidgetProps) {
  const pathname = usePathname();
  const [floatingVisible, setFloatingVisible] = useState(false);

  const {
    messages,
    isLoading,
    isOpen,
    avatarState,
    remainingMessages,
    operatorOnline,
    isHumanMode,
    sessionStatus,
    planExecution,
    sendMessage,
    sendFeedback,
    toggleOpen,
    clearHistory,
    requestHumanSupport,
    executePlan,
  } = useConciergeChat();

  // 親コンポーネントに開閉状態を通知
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  // FloatingButtons の表示状態を検知（desktop + scrollY > 300）
  useEffect(() => {
    const check = () => {
      const isDesktop = window.innerWidth >= 1024; // lg breakpoint
      const scrolled = window.scrollY > 300;
      setFloatingVisible(isDesktop && scrolled);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check, { passive: true });
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, []);

  // モバイルでチャットが開いている時、背景スクロールをロック
  useEffect(() => {
    if (!isOpen) return;
    const isMobile = window.innerWidth < 640;
    if (!isMobile) return;

    // body スクロールロック
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // 公開コンテンツページでは非表示
  const publicPrefixes = ['/quiz/', '/profile/', '/business/', '/salesletter/', '/attendance/', '/booking/', '/survey/', '/gamification/'];
  const isPublicPage = publicPrefixes.some(p => pathname.startsWith(p)) && !pathname.includes('/editor');
  if (isPublicPage) return null;

  // FloatingButtons が見えている場合はその上に、見えていない場合は右下に配置
  const bottomClass = floatingVisible ? 'bottom-24' : 'bottom-6';

  return (
    <>
      {/* トリガーボタン — チャットが閉じている時のみ表示 */}
      {!isOpen && (
        <div className={`fixed ${bottomClass} right-6 z-[60] transition-all duration-300`}>
          <button
            onClick={toggleOpen}
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

      {/* チャットパネル */}
      {isOpen && (
        <div className={`fixed ${bottomClass} right-4 sm:right-6 z-[60] transition-all duration-300`}>
          <ConciergeChat
            messages={messages}
            avatarState={avatarState}
            isLoading={isLoading}
            remainingMessages={remainingMessages}
            currentPage={pathname}
            operatorOnline={operatorOnline}
            isHumanMode={isHumanMode}
            sessionStatus={sessionStatus}
            planExecution={planExecution}
            onSend={sendMessage}
            onFeedback={sendFeedback}
            onClose={toggleOpen}
            onClear={clearHistory}
            onRequestHumanSupport={requestHumanSupport}
            onExecutePlan={executePlan}
          />
        </div>
      )}
    </>
  );
}
