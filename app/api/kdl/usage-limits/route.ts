/**
 * KDL 使用量制限チェックAPI
 * 書籍作成数、構成系AI、執筆系AIの使用状況と制限を返す
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
};

// 構成系AI のアクションタイプ
const OUTLINE_ACTION_TYPES = [
  'generate_title',
  'generate_subtitle', 
  'generate_toc',
  'generate_chapter',
];

// 執筆系AI のアクションタイプ
const WRITING_ACTION_TYPES = [
  'generate_section',
  'rewrite',
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

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();

    if (!supabase) {
      // Supabaseが設定されていない場合はデフォルト値を返す
      return NextResponse.json(getDefaultResponse('none'));
    }

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
      .order('monitor_expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

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

    // 2. プラン設定を取得
    let limits = PLAN_LIMITS[planTier] || DEFAULT_LIMITS;

    const { data: planData } = await supabase
      .from('service_plans')
      .select('book_limit, ai_outline_daily_limit, ai_writing_daily_limit, ai_daily_limit')
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

    // 5. レスポンスを構築
    const bookUsed = bookCount || 0;
    const outlineUsed = outlineCount || 0;
    const writingUsed = writingCount || 0;
    const totalUsed = totalCount || 0;

    return NextResponse.json({
      // 書籍作成
      bookCreation: {
        used: bookUsed,
        limit: limits.book,
        remaining: limits.book === -1 ? -1 : Math.max(limits.book - bookUsed, 0),
        canCreate: limits.book === -1 || bookUsed < limits.book,
      },
      // 構成系AI（タイトル、目次など）
      aiOutline: {
        used: outlineUsed,
        limit: limits.outline,
        remaining: limits.outline === -1 ? -1 : Math.max(limits.outline - outlineUsed, 0),
        canUse: limits.outline === -1 || outlineUsed < limits.outline,
      },
      // 執筆系AI（本文生成、書き換え）
      aiWriting: {
        used: writingUsed,
        limit: limits.writing,
        remaining: limits.writing === -1 ? -1 : Math.max(limits.writing - writingUsed, 0),
        canUse: limits.writing === -1 || writingUsed < limits.writing,
      },
      // トータルAI
      aiTotal: {
        used: totalUsed,
        limit: limits.total,
        remaining: limits.total === -1 ? -1 : Math.max(limits.total - totalUsed, 0),
        canUse: limits.total === -1 || totalUsed < limits.total,
      },
      // プラン情報
      planTier,
      isMonitor,
    });
  } catch (error: any) {
    console.error('KDL usage limits fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage limits' },
      { status: 500 }
    );
  }
}

// デフォルトレスポンスを生成
function getDefaultResponse(planTier: string) {
  const limits = PLAN_LIMITS[planTier] || DEFAULT_LIMITS;
  return {
    bookCreation: {
      used: 0,
      limit: limits.book,
      remaining: limits.book,
      canCreate: true,
    },
    aiOutline: {
      used: 0,
      limit: limits.outline,
      remaining: limits.outline,
      canUse: true,
    },
    aiWriting: {
      used: 0,
      limit: limits.writing,
      remaining: limits.writing,
      canUse: true,
    },
    aiTotal: {
      used: 0,
      limit: limits.total,
      remaining: limits.total,
      canUse: true,
    },
    planTier,
    isMonitor: false,
  };
}
