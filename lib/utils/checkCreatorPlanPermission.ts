/**
 * コンテンツ作成者のプラン権限をチェックするユーティリティ
 */

import { createClient } from '@supabase/supabase-js';

// サービスロールクライアント
const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
};

/**
 * コンテンツ作成者がコピーライト非表示権限を持っているかチェック
 * @param userId コンテンツ作成者のユーザーID
 * @returns コピーライト非表示が可能かどうか
 */
export async function canCreatorHideCopyright(userId: string | null | undefined): Promise<boolean> {
  // ユーザーIDがない場合は権限なし
  if (!userId) {
    return false;
  }

  const supabase = getServiceClient();
  if (!supabase) {
    return false;
  }

  try {
    // 1. アクティブなサブスクリプションを確認
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('status, plan_tier, plan_name')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // 2. モニターユーザーかどうかも確認
    const { data: monitor } = await supabase
      .from('monitor_users')
      .select('monitor_plan_type')
      .eq('user_id', userId)
      .lte('monitor_start_at', new Date().toISOString())
      .gt('monitor_expires_at', new Date().toISOString())
      .single();

    // プランTierを判定
    let planTier: 'guest' | 'free' | 'pro' = 'free';
    
    // モニターユーザーはProとして扱う
    if (monitor?.monitor_plan_type === 'pro') {
      planTier = 'pro';
    }
    // アクティブなサブスクリプションがある場合
    else if (subscription?.status === 'active') {
      if (subscription.plan_tier === 'pro' || 
          subscription.plan_name?.toLowerCase().includes('pro') ||
          subscription.plan_name?.toLowerCase().includes('プロ')) {
        planTier = 'pro';
      }
    }

    // 3. service_plansテーブルからプラン権限を取得
    const { data: planSettings } = await supabase
      .from('service_plans')
      .select('can_hide_copyright')
      .eq('service', 'makers')
      .eq('plan_tier', planTier)
      .eq('is_active', true)
      .single();

    // DBから取得できた場合はその値を使用
    if (planSettings) {
      return planSettings.can_hide_copyright === true;
    }

    // フォールバック: Proプランのみコピーライト非表示可能
    return planTier === 'pro';
  } catch (error) {
    console.error('Error checking creator plan permission:', error);
    return false;
  }
}

/**
 * コンテンツのhideFooterフラグと作成者の権限を両方チェック
 * @param hideFooterSetting コンテンツに設定されたhideFooterフラグ
 * @param creatorUserId コンテンツ作成者のユーザーID
 * @returns 実際にフッターを非表示にすべきかどうか
 */
export async function shouldHideFooter(
  hideFooterSetting: boolean | undefined,
  creatorUserId: string | null | undefined
): Promise<boolean> {
  // hideFooterがfalseまたは未設定の場合は常にフッター表示
  if (!hideFooterSetting) {
    return false;
  }

  // 作成者がコピーライト非表示権限を持っているかチェック
  const hasPermission = await canCreatorHideCopyright(creatorUserId);
  
  return hasPermission;
}
