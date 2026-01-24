'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * Cloudflare Turnstile CAPTCHA ウィジェット
 * 
 * 使用方法:
 * 1. Cloudflare Dashboardでサイトキーを取得
 * 2. 環境変数 NEXT_PUBLIC_TURNSTILE_SITE_KEY を設定
 * 3. サーバーサイドで TURNSTILE_SECRET_KEY を設定
 * 
 * @example
 * <TurnstileWidget onVerify={(token) => setTurnstileToken(token)} />
 */

interface TurnstileWidgetProps {
  // 検証成功時のコールバック
  onVerify: (token: string) => void;
  // 検証失敗時のコールバック
  onError?: () => void;
  // トークン期限切れ時のコールバック
  onExpire?: () => void;
  // テーマ（light/dark/auto）
  theme?: 'light' | 'dark' | 'auto';
  // サイズ（normal/compact）
  size?: 'normal' | 'compact';
  // カスタムクラス
  className?: string;
}

// Turnstileのグローバル型定義
declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark' | 'auto';
          size?: 'normal' | 'compact';
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export default function TurnstileWidget({
  onVerify,
  onError,
  onExpire,
  theme = 'auto',
  size = 'normal',
  className = '',
}: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const scriptLoadedRef = useRef(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || !siteKey) return;
    if (widgetIdRef.current) return; // 既にレンダリング済み

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: siteKey,
      callback: onVerify,
      'error-callback': onError,
      'expired-callback': onExpire,
      theme,
      size,
    });
  }, [siteKey, onVerify, onError, onExpire, theme, size]);

  useEffect(() => {
    // サイトキーが設定されていない場合は何もしない
    if (!siteKey) {
      console.warn('[Turnstile] NEXT_PUBLIC_TURNSTILE_SITE_KEY が設定されていません');
      return;
    }

    // スクリプトが既に読み込まれている場合
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // スクリプトの読み込み
    if (!scriptLoadedRef.current) {
      scriptLoadedRef.current = true;
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        renderWidget();
      };
      document.head.appendChild(script);
    }

    // クリーンアップ
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, renderWidget]);

  // サイトキーが設定されていない場合は何も表示しない
  if (!siteKey) {
    return null;
  }

  return <div ref={containerRef} className={className} />;
}
