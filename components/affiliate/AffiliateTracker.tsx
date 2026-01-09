'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const COOKIE_NAME = 'makers_ref';
const COOKIE_DAYS = 30; // 30日間有効

type Props = {
  serviceType?: string;
};

export default function AffiliateTracker({ serviceType = 'kdl' }: Props) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    
    if (refCode) {
      // Cookieに保存
      setCookie(COOKIE_NAME, refCode, COOKIE_DAYS);
      
      // クリックを記録
      trackClick(refCode, serviceType);
    }
  }, [searchParams, serviceType]);

  return null; // UIは表示しない
}

// Cookie設定
function setCookie(name: string, value: string, days: number) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
}

// Cookie取得
export function getReferralCode(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === COOKIE_NAME) {
      return value;
    }
  }
  return null;
}

// Cookie削除（成約後に呼び出し）
export function clearReferralCode() {
  if (typeof document === 'undefined') return;
  document.cookie = `${COOKIE_NAME}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
}

// クリック追跡
async function trackClick(refCode: string, serviceType: string) {
  try {
    const landingPage = typeof window !== 'undefined' ? window.location.pathname : '/';
    
    await fetch('/api/affiliate/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        referralCode: refCode,
        landingPage,
        serviceType,
      }),
    });
  } catch (error) {
    console.error('Failed to track affiliate click:', error);
  }
}

