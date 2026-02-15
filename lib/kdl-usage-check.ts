/**
 * Kindle出版メーカー 使用量制限チェック共通関数
 * 書籍作成数、構成系AI、執筆系AIの制限をチェックし、API側でブロックする
 */

import { createClient } from '@supabase/supabase-js';

// 構成系AI のアクションタイプ
export const OUTLINE_ACTION_TYPES = [
  'generate_title',
  'generate_subtitle',
  'generate_toc',
  'generate_chapter',
  'generate_chapters',
  'recommend_pattern',
  'generate_target',
  'generate_kdp_info',
];

// 執筆系AI のアクションタイプ
export const WRITING_ACTION_TYPES = [
  'generate_section',
  'rewrite',
  'rewrite_text',
  'bulk_generate',
];

// デフォルトの制限値（プランが見つからない場合）
const DEFAULT_LIMITS = {
  book: 1,
  outline: 3,
  writing: 3,
  total: 5,
};

// プラン別のデフォルト制限値（DBにデータがない場合のフォールバック）
const PLAN_LIMITS: Record<string, { book: number; outline: number; writing: number; total: number }> = {
  none: { book: 1, outline: 3, writing: 3, total: 5 },
  initial_trial: { book: 3, outline: 20, writing: 30, total: 50 },
  initial_standard: { book: 10, outline: 40, writing: 80, total: 120 },
  initial_business: { book: -1, outline: -1, writing: -1, total: -1 },
  lite: { book: -1, outline: 10, writing: 15, total: 25 },
  standard: { book: -1, outline: 15, writing: 25, total: 40 },
  pro: { book: -1, outline: 40, writing: 80, total: 120 },
  business: { book: -1, outline: 80, writing: -1, total: -1 },
  enterprise: { book: -1, outline: -1, writing: -1, total: -1 },
};

// エラーメッセージ
const ERROR_MESSAGES = {
  bookLimit: (limit: number) => 
    `書籍作成数の上限（${limit}冊）に達しました。新しい書籍を作成するには、既存の書籍を削除するか、プランをアップグレードしてください。`,
  outlineLimit: (remaining: number) => 
    remaining === 0 
      ? '本日の構成系AI（タイトル・目次生成など）の使用上限に達しました。明日になると回数がリセットされます。'
      : '構成系AIの使用上限に達しています。',
  writingLimit: (remaining: number) => 
    remaining === 0 
      ? '本日の執筆系AI（本文生成・書き換えなど）の使用上限に達しました。明日になると回数がリセットされます。'
      : '執筆系AIの使用上限に達しています。',
  totalLimit: (remaining: number) => 
    remaining === 0 
      ? '本日のAI使用回数の上限に達しました。明日になると回数がリセットされます。'
      : 'AI使用回数の上限に達しています。',
};

// チェック結果の型
export interface KdlLimitCheckResult {
  bookCreation: {
    canCreate: boolean;
    used: number;
    limit: number;
    message?: string;
  };
  outlineAi: {
    canUse: boolean;
    used: number;
    limit: number;
    message?: string;
  };
  writingAi: {
    canUse: boolean;
    used: number;
    limit: number;
    message?: string;
  };
  totalAi: {
    canUse: boolean;
    used: number;
    limit: number;
    message?: string;
  };
  planTier: string;
  isMonitor: boolean;
  // AI機能が有効かどうか（service_plans.can_use_ai）
  canUseAi: boolean;
}

/**
 * KDL使用量制限をチェックする共通関数
 * @param userId ユーザーID
 * @returns 各カテゴリの制限状態
 */
export async function checkKdlLimits(userId: string): Promise<KdlLimitCheckResult> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // Supabaseが設定されていない場合はデフォルト値（制限なし）を返す
  if (!supabaseUrl || !serviceKey) {
    return getDefaultResult('none');
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  // 1. ユーザーのプランを取得（モニター優先）
  let planTier = 'none';
  let isMonitor = false;

  // モニター権限をチェック
  const now = new Date().toISOString();
  const { data: monitorData } = await supabase
    .from('monitor_users')
    .select('monitor_plan_type')
    .eq('user_id', userId)
    .eq('service', 'kdl')
    .lte('monitor_start_at', now)
    .gt('monitor_expires_at', now)
    .single();

  if (monitorData) {
    planTier = monitorData.monitor_plan_type;
    isMonitor = true;
  } else {
    // サブスクリプションを確認
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('plan_tier')
      .eq('user_id', userId)
      .eq('service', 'kdl')
      .in('status', ['active', 'trialing'])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (subscriptionData?.plan_tier) {
      planTier = subscriptionData.plan_tier;
    }
  }

  // 2. プラン設定を取得（can_use_aiフラグも含む）
  let limits = PLAN_LIMITS[planTier] || DEFAULT_LIMITS;
  let canUseAiFlag = true; // デフォルトはtrue

  const { data: planData } = await supabase
    .from('service_plans')
    .select('book_limit, ai_outline_daily_limit, ai_writing_daily_limit, ai_daily_limit, can_use_ai')
    .eq('service', 'kdl')
    .eq('plan_tier', planTier)
    .single();

  if (planData) {
    limits = {
      book: planData.book_limit ?? limits.book,
      outline: planData.ai_outline_daily_limit ?? limits.outline,
      writing: planData.ai_writing_daily_limit ?? limits.writing,
      total: planData.ai_daily_limit ?? limits.total,
    };
    // can_use_aiがfalseの場合のみfalseに設定（nullや未定義はtrue扱い）
    canUseAiFlag = planData.can_use_ai !== false;
  }

  // 3. 書籍数をカウント
  const { count: bookCount } = await supabase
    .from('kdl_books')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  // 4. 今日のAI使用量をカウント
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayISO = today.toISOString();

  // 構成系AI
  const { count: outlineCount } = await supabase
    .from('ai_usage_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('service', 'kdl')
    .in('action_type', OUTLINE_ACTION_TYPES)
    .gte('created_at', todayISO);

  // 執筆系AI
  const { count: writingCount } = await supabase
    .from('ai_usage_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('service', 'kdl')
    .in('action_type', WRITING_ACTION_TYPES)
    .gte('created_at', todayISO);

  // トータルAI
  const { count: totalCount } = await supabase
    .from('ai_usage_logs')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('service', 'kdl')
    .gte('created_at', todayISO);

  // 5. 結果を構築
  const bookUsed = bookCount || 0;
  const outlineUsed = outlineCount || 0;
  const writingUsed = writingCount || 0;
  const totalUsed = totalCount || 0;

  // 書籍作成は can_use_ai に関係なくチェック
  const bookCanCreate = limits.book === -1 || bookUsed < limits.book;
  
  // AI機能は can_use_ai フラグも考慮
  // can_use_ai が false の場合は全てのAI機能をブロック
  const outlineCanUse = canUseAiFlag && 
                        (limits.outline === -1 || outlineUsed < limits.outline) && 
                        (limits.total === -1 || totalUsed < limits.total);
  const writingCanUse = canUseAiFlag && 
                        (limits.writing === -1 || writingUsed < limits.writing) && 
                        (limits.total === -1 || totalUsed < limits.total);
  const totalCanUse = canUseAiFlag && (limits.total === -1 || totalUsed < limits.total);

  // AI機能がプランで無効化されている場合のメッセージ
  const aiDisabledMessage = 'このプランではAI機能をご利用いただけません。プランをアップグレードしてください。';

  return {
    bookCreation: {
      canCreate: bookCanCreate,
      used: bookUsed,
      limit: limits.book,
      message: bookCanCreate ? undefined : ERROR_MESSAGES.bookLimit(limits.book),
    },
    outlineAi: {
      canUse: outlineCanUse,
      used: outlineUsed,
      limit: limits.outline,
      message: outlineCanUse ? undefined : 
        !canUseAiFlag ? aiDisabledMessage :
        (limits.total !== -1 && totalUsed >= limits.total) 
          ? ERROR_MESSAGES.totalLimit(0) 
          : ERROR_MESSAGES.outlineLimit(limits.outline - outlineUsed),
    },
    writingAi: {
      canUse: writingCanUse,
      used: writingUsed,
      limit: limits.writing,
      message: writingCanUse ? undefined : 
        !canUseAiFlag ? aiDisabledMessage :
        (limits.total !== -1 && totalUsed >= limits.total) 
          ? ERROR_MESSAGES.totalLimit(0) 
          : ERROR_MESSAGES.writingLimit(limits.writing - writingUsed),
    },
    totalAi: {
      canUse: totalCanUse,
      used: totalUsed,
      limit: limits.total,
      message: totalCanUse ? undefined : 
        !canUseAiFlag ? aiDisabledMessage : ERROR_MESSAGES.totalLimit(0),
    },
    planTier,
    isMonitor,
    canUseAi: canUseAiFlag,
  };
}

// デフォルト結果を生成（Supabase未設定時）
function getDefaultResult(planTier: string): KdlLimitCheckResult {
  return {
    bookCreation: { canCreate: true, used: 0, limit: -1 },
    outlineAi: { canUse: true, used: 0, limit: -1 },
    writingAi: { canUse: true, used: 0, limit: -1 },
    totalAi: { canUse: true, used: 0, limit: -1 },
    planTier,
    isMonitor: false,
    canUseAi: true,
  };
}
