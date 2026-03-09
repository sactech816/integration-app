/**
 * サーバーサイド用 Supabase クライアント
 *
 * - Server Components / Route Handlers / Server Actions で使用
 * - Cookie ベースのセッション管理
 * - getUser() でトークン検証（getSession() は使わない）
 */

import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * Server Components / Route Handlers / Server Actions 用クライアント
 * Cookie 経由でユーザーセッションを取得・更新する
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
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
            // Server Component からの呼び出し時は set できない（無視してOK）
          }
        },
      },
    }
  );
}

/**
 * Service Role Key を使った管理者用クライアント
 * RLS をバイパスして全テーブルにアクセス可能
 * Webhook処理、管理者操作、Cronジョブ等で使用
 */
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }

  return createClient(url, serviceKey);
}
