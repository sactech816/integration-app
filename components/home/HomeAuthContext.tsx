'use client';

import { createContext, useContext } from 'react';

interface HomeAuthContextType {
  user: { email?: string; id?: string } | null;
  setShowAuth: (show: boolean) => void;
  setShowProPlanModal: (show: boolean) => void;
  setWelcomeGuideOpen: (open: boolean) => void;
  setShowToolGuide: (show: boolean) => void;
}

export const HomeAuthContext = createContext<HomeAuthContextType>({
  user: null,
  setShowAuth: () => {},
  setShowProPlanModal: () => {},
  setWelcomeGuideOpen: () => {},
  setShowToolGuide: () => {},
});

export function useHomeAuth() {
  return useContext(HomeAuthContext);
}
