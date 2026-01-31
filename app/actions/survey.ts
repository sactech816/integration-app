'use server';

import { createClient } from '@supabase/supabase-js';

// サーバーサイドでService Roleキーを使用（RLSバイパス）
function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('[Survey] Supabase admin credentials not configured:', {
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

type SurveyResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

/**
 * アンケートを削除
 */
export async function deleteSurvey(
  surveyId: number,
  userId: string,
  isAdmin?: boolean
): Promise<SurveyResponse<{ deleted: boolean }>> {
  console.log('[Survey] deleteSurvey called:', { surveyId, userId, isAdmin });

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    console.error('[Survey] Failed to get Supabase admin client');
    return { success: false, error: 'データベースが設定されていません' };
  }

  try {
    // 所有者チェック（管理者はスキップ）
    const { data: survey, error: fetchError } = await supabase
      .from('surveys')
      .select('user_id')
      .eq('id', surveyId)
      .single();

    console.log('[Survey] Fetch result:', { survey, fetchError });

    if (fetchError) {
      console.error('[Survey] Fetch error:', fetchError);
      return { success: false, error: 'アンケートの取得に失敗しました' };
    }

    if (!survey) {
      return { success: false, error: 'アンケートが見つかりません' };
    }

    if (!isAdmin && survey.user_id !== userId) {
      console.log('[Survey] Authorization failed:', { ownerId: survey.user_id, userId, isAdmin });
      return { success: false, error: '削除権限がありません' };
    }

    // 関連する投票結果も削除
    const { error: votesError } = await supabase
      .from('survey_votes')
      .delete()
      .eq('survey_id', surveyId);

    if (votesError) {
      console.log('[Survey] Votes delete error (may be okay if no votes):', votesError);
    }

    // アンケート削除
    const { error } = await supabase
      .from('surveys')
      .delete()
      .eq('id', surveyId);

    console.log('[Survey] Delete result:', { error });

    if (error) {
      console.error('[Survey] Delete error:', error);
      return { success: false, error: error.message };
    }

    console.log('[Survey] Delete successful:', surveyId);
    return { success: true, data: { deleted: true } };
  } catch (error) {
    console.error('[Survey] Delete exception:', error);
    return { success: false, error: '削除中にエラーが発生しました' };
  }
}
