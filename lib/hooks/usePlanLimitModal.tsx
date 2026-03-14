'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import PlanLimitModal, { PlanLimitInfo } from '@/components/shared/PlanLimitModal';

// ========================================
// Context
// ========================================

interface PlanLimitModalContextValue {
  /** モーダルを表示する */
  showPlanLimitModal: (info: PlanLimitInfo) => void;
}

const PlanLimitModalContext = createContext<PlanLimitModalContextValue | null>(null);

// ========================================
// Provider
// ========================================

interface PlanLimitModalProviderProps {
  children: ReactNode;
  user: { email?: string; id?: string } | null;
}

export function PlanLimitModalProvider({ children, user }: PlanLimitModalProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [limitInfo, setLimitInfo] = useState<PlanLimitInfo>({
    title: '',
    message: '',
  });

  const showPlanLimitModal = useCallback((info: PlanLimitInfo) => {
    setLimitInfo(info);
    setIsOpen(true);
  }, []);

  return (
    <PlanLimitModalContext.Provider value={{ showPlanLimitModal }}>
      {children}
      <PlanLimitModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        user={user}
        limitInfo={limitInfo}
      />
    </PlanLimitModalContext.Provider>
  );
}

// ========================================
// Hook
// ========================================

export function usePlanLimitModal() {
  const context = useContext(PlanLimitModalContext);
  if (!context) {
    throw new Error('usePlanLimitModal must be used within PlanLimitModalProvider');
  }
  return context;
}

// ========================================
// スタンドアロン版（Providerなしでも使える）
// ========================================

export function usePlanLimitModalStandalone(user: { email?: string; id?: string } | null) {
  const [isOpen, setIsOpen] = useState(false);
  const [limitInfo, setLimitInfo] = useState<PlanLimitInfo>({
    title: '',
    message: '',
  });

  const showPlanLimitModal = useCallback((info: PlanLimitInfo) => {
    setLimitInfo(info);
    setIsOpen(true);
  }, []);

  const PlanLimitModalElement = isOpen ? (
    <PlanLimitModal
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      user={user}
      limitInfo={limitInfo}
    />
  ) : null;

  return { showPlanLimitModal, PlanLimitModalElement };
}
