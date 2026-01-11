/**
 * 匿名ユーザー用Cookieセッション管理
 * ゲーミフィケーション機能で使用
 */

import { cookies } from 'next/headers';

// セッションID用のCookie名
const SESSION_COOKIE_NAME = 'gamification_session_id';

// セッションIDの有効期限（30日）
const SESSION_MAX_AGE = 30 * 24 * 60 * 60;

/**
 * セッションIDを生成
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  return `sess_${timestamp}_${randomPart}${randomPart2}`;
}

/**
 * サーバーサイドでセッションIDを取得（存在しない場合は作成）
 * Server Components / Server Actions で使用
 */
export async function getOrCreateSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!sessionId) {
    sessionId = generateSessionId();
    cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });
  }
  
  return sessionId;
}

/**
 * サーバーサイドでセッションIDを取得（存在しない場合はnull）
 * Server Components / Server Actions で使用
 */
export async function getSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}

/**
 * クライアントサイドでセッションIDを取得
 * クライアントコンポーネントで使用
 */
export function getClientSessionId(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === SESSION_COOKIE_NAME) {
      return value;
    }
  }
  return null;
}

/**
 * セッションIDをCookieから削除
 */
export async function clearSessionId(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * ユーザー識別情報を取得
 * ログイン中の場合はuser_id、未ログインの場合はsession_idを返す
 */
export interface UserIdentifier {
  user_id: string | null;
  session_id: string | null;
}

/**
 * クライアントサイドでセッションIDを設定
 * （Server Actionから返されたセッションIDをクライアントで保持する場合）
 */
export function setClientSessionId(sessionId: string): void {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setTime(expires.getTime() + SESSION_MAX_AGE * 1000);
  document.cookie = `${SESSION_COOKIE_NAME}=${sessionId}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
}















