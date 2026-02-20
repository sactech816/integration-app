'use server';

import { createClient } from '@supabase/supabase-js';

// サーバーサイドでService Roleキーを使用（RLSバイパス）
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[Content] Supabase admin credentials not configured:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
    });
    return null;
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

type DeleteResponse = {
  success: boolean;
  error?: string;
};

// テーブル名のマッピング
const TABLE_MAP: Record<string, string> = {
  quiz: 'quizzes',
  profile: 'profiles',
  business: 'business_projects',
  salesletter: 'sales_letters',
  onboarding: 'onboarding_modals',
  thumbnail: 'thumbnails',
};

// ユーザーIDカラム名のマッピング
const USER_ID_COLUMN_MAP: Record<string, string> = {
  quiz: 'user_id',
  profile: 'user_id',
  business: 'user_id',
  salesletter: 'user_id',
  onboarding: 'user_id',
  thumbnail: 'user_id',
};

/**
 * コンテンツを削除（管理者対応）
 */
export async function deleteContent(
  contentType: 'quiz' | 'profile' | 'business' | 'salesletter' | 'onboarding' | 'thumbnail',
  contentId: string | number,
  userId: string,
  isAdmin?: boolean
): Promise<DeleteResponse> {
  console.log('[Content] deleteContent called:', { contentType, contentId, userId, isAdmin });

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error('[Content] Failed to get Supabase admin client');
    return { success: false, error: 'データベースが設定されていません' };
  }

  const tableName = TABLE_MAP[contentType];
  const userIdColumn = USER_ID_COLUMN_MAP[contentType];

  if (!tableName) {
    console.error('[Content] Invalid content type:', contentType);
    return { success: false, error: '無効なコンテンツタイプです' };
  }

  try {
    // 所有者チェック（管理者はスキップ）
    const { data: content, error: fetchError } = await supabase
      .from(tableName)
      .select(userIdColumn)
      .eq('id', contentId)
      .single();

    console.log('[Content] Fetch result:', { content, fetchError, tableName, contentId });

    if (fetchError) {
      console.error('[Content] Fetch error:', fetchError);
      return { success: false, error: 'コンテンツの取得に失敗しました' };
    }

    if (!content) {
      return { success: false, error: 'コンテンツが見つかりません' };
    }

    if (!isAdmin && content[userIdColumn] !== userId) {
      console.log('[Content] Authorization failed:', { ownerId: content[userIdColumn], userId, isAdmin });
      return { success: false, error: '削除権限がありません' };
    }

    // 削除実行
    const { error, count } = await supabase
      .from(tableName)
      .delete()
      .eq('id', contentId);

    console.log('[Content] Delete result:', { error, count, tableName, contentId });

    if (error) {
      console.error(`[Content] Delete ${contentType} error:`, error);
      return { success: false, error: error.message };
    }

    console.log('[Content] Delete successful:', { contentType, contentId });
    return { success: true };
  } catch (error) {
    console.error(`[Content] Delete ${contentType} exception:`, error);
    return { success: false, error: '削除中にエラーが発生しました' };
  }
}
