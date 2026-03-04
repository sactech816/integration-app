/**
 * サーバーサイド認証ヘルパー
 * Server Actions / API Routes で認証チェックを行うための共通ユーティリティ
 */

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getAdminEmails } from '@/lib/constants';

export interface AuthenticatedUser {
  id: string;
  email: string | undefined;
  isAdmin: boolean;
}

/**
 * Server Actions用: Cookie認証でログインユーザーを取得
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component からの呼び出し時は set できない場合がある
          }
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const adminEmails = getAdminEmails();
  const isAdmin = adminEmails.some(
    (email) => user.email?.toLowerCase() === email.toLowerCase()
  );

  return { id: user.id, email: user.email, isAdmin };
}

/**
 * Server Actions用: 認証必須 — 未認証なら例外をスロー
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('認証が必要です');
  }
  return user;
}

/**
 * Server Actions用: 管理者権限必須
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  const user = await requireAuth();
  if (!user.isAdmin) {
    throw new Error('管理者権限が必要です');
  }
  return user;
}

/**
 * API Routes用: Bearer token から認証ユーザーを取得
 */
export async function getAuthenticatedUserFromRequest(request: Request): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  if (!token) return null;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;

  const supabase = createClient(supabaseUrl, serviceKey);
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;

  const adminEmails = getAdminEmails();
  const isAdmin = adminEmails.some(
    (email) => user.email?.toLowerCase() === email.toLowerCase()
  );

  return { id: user.id, email: user.email, isAdmin };
}

/**
 * API Routes用: 管理者認証必須
 * @returns [user, errorResponse] — errorResponse が null でなければそれを返すこと
 */
export async function requireAdminFromRequest(request: Request): Promise<[AuthenticatedUser | null, Response | null]> {
  const user = await getAuthenticatedUserFromRequest(request);
  if (!user) {
    return [null, new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } })];
  }
  if (!user.isAdmin) {
    return [null, new Response(JSON.stringify({ error: 'Admin access required' }), { status: 403, headers: { 'Content-Type': 'application/json' } })];
  }
  return [user, null];
}
