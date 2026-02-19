'use server';

import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

type GuestContentItem = {
  table: string;
  id: string | number;
};

type ClaimResult = {
  success: boolean;
  claimed: number;
  error?: string;
};

const ALLOWED_TABLES = ['quizzes', 'surveys', 'sales_letters'];

/**
 * ゲストが作成したコンテンツ（user_id が null）を
 * ログインしたユーザーに紐付ける
 */
export async function claimGuestContent(
  userId: string,
  items: GuestContentItem[]
): Promise<ClaimResult> {
  if (!userId || !items.length) {
    return { success: false, claimed: 0, error: 'Invalid parameters' };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { success: false, claimed: 0, error: 'DB not configured' };
  }

  let claimed = 0;

  for (const item of items) {
    // 許可されたテーブルのみ
    if (!ALLOWED_TABLES.includes(item.table)) continue;

    const { error } = await supabase
      .from(item.table)
      .update({ user_id: userId })
      .eq('id', item.id)
      .is('user_id', null); // user_id が null の行のみ更新（セキュリティ）

    if (!error) {
      claimed++;
    }
  }

  return { success: true, claimed };
}
