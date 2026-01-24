/**
 * Cloudflare Turnstile サーバーサイド検証
 * 
 * API Routeで使用:
 * import { verifyTurnstileToken } from '@/lib/security/turnstile';
 * 
 * const isValid = await verifyTurnstileToken(token);
 * if (!isValid) {
 *   return NextResponse.json({ error: 'CAPTCHA検証に失敗しました' }, { status: 400 });
 * }
 */

interface TurnstileVerifyResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

/**
 * Turnstileトークンの検証
 * 
 * @param token クライアントから送信されたTurnstileトークン
 * @param remoteIP オプション: クライアントのIPアドレス（追加検証用）
 * @returns 検証成功の場合true
 */
export async function verifyTurnstileToken(
  token: string,
  remoteIP?: string
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  if (!secretKey) {
    console.warn('[Turnstile] TURNSTILE_SECRET_KEY が設定されていません');
    // 開発環境では検証をスキップ（本番では必ず設定すること）
    if (process.env.NODE_ENV === 'development') {
      return true;
    }
    return false;
  }

  if (!token) {
    console.warn('[Turnstile] トークンが提供されていません');
    return false;
  }

  try {
    const formData = new URLSearchParams({
      secret: secretKey,
      response: token,
    });

    // IPアドレスが提供されている場合は追加
    if (remoteIP) {
      formData.append('remoteip', remoteIP);
    }

    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      }
    );

    const data: TurnstileVerifyResponse = await response.json();
    
    if (!data.success && data['error-codes']) {
      console.warn('[Turnstile] 検証失敗:', data['error-codes']);
    }

    return data.success === true;
  } catch (error) {
    console.error('[Turnstile] 検証エラー:', error);
    return false;
  }
}

/**
 * Turnstileが有効かどうかを確認
 * 環境変数が設定されているかチェック
 */
export function isTurnstileEnabled(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
    process.env.TURNSTILE_SECRET_KEY
  );
}
