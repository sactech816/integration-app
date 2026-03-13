'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useConciergeChat } from '@/lib/hooks/useConciergeChat';
import ConciergeAvatar from './ConciergeAvatar';
import ConciergeChat from './ConciergeChat';

interface ConciergeWidgetProps {
  onOpenChange?: (isOpen: boolean) => void;
}

export default function ConciergeWidget({ onOpenChange }: ConciergeWidgetProps) {
  const pathname = usePathname();

  const {
    messages,
    isLoading,
    isOpen,
    avatarState,
    remainingMessages,
    sendMessage,
    sendFeedback,
    toggleOpen,
    clearHistory,
  } = useConciergeChat();

  // 親コンポーネントに開閉状態を通知
  useEffect(() => {
    onOpenChange?.(isOpen);
  }, [isOpen, onOpenChange]);

  // 公開コンテンツページでは非表示
  const publicPrefixes = ['/quiz/', '/profile/', '/business/', '/salesletter/', '/attendance/', '/booking/', '/survey/', '/gamification/'];
  const isPublicPage = publicPrefixes.some(p => pathname.startsWith(p)) && !pathname.includes('/editor');
  if (isPublicPage) return null;

  return (
    <>
      {/* トリガーボタン — チャットが閉じている時のみ表示 */}
      {!isOpen && (
        <div className="fixed bottom-24 right-6 z-[60]">
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

      {/* チャットパネル — 矢印・ご意見箱の上に展開 */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[60]">
          <ConciergeChat
            messages={messages}
            avatarState={avatarState}
            isLoading={isLoading}
            remainingMessages={remainingMessages}
            currentPage={pathname}
            onSend={sendMessage}
            onFeedback={sendFeedback}
            onClose={toggleOpen}
            onClear={clearHistory}
          />
        </div>
      )}
    </>
  );
}
