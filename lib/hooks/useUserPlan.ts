/**
 * ユーザープラン権限を取得するカスタムフック
 */

import { useState, useEffect } from 'react';
import type { MakersPlanTier } from '@/lib/subscription';

export interface UserPlan {
  planTier: MakersPlanTier;
  canHideCopyright: boolean;
  canUseAI: boolean;
  canUseAnalytics: boolean;
  canUseGamification: boolean;
  canDownloadHtml: boolean;
  canEmbed: boolean;
  /** business以上のプランかどうか（旧isPro互換） */
  isProUser: boolean;
  /** standard以上の有料プランかどうか */
  isPaidUser: boolean;
}

const defaultPlan: UserPlan = {
  planTier: 'free',
  canHideCopyright: false,
  canUseAI: false,
  canUseAnalytics: false,
  canUseGamification: false,
  canDownloadHtml: false,
  canEmbed: false,
  isProUser: false,
  isPaidUser: false,
};

/**
 * ユーザープラン権限を取得
 */
export async function fetchUserPlan(userId: string | null | undefined): Promise<UserPlan> {
  try {
    const url = userId
      ? `/api/user/plan?userId=${userId}`
      : '/api/user/plan';

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch user plan');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user plan:', error);
    return defaultPlan;
  }
}

/**
 * ユーザープラン権限を取得するカスタムフック
 */
export function useUserPlan(userId: string | null | undefined): {
  userPlan: UserPlan;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
} {
  const [userPlan, setUserPlan] = useState<UserPlan>(defaultPlan);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPlan = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const plan = await fetchUserPlan(userId);
      setUserPlan(plan);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, [userId]);

  return {
    userPlan,
    isLoading,
    error,
    refetch: fetchPlan,
  };
}

export default useUserPlan;
