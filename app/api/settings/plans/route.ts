/**
 * プラン設定API
 * サービス別のプラン設定を取得・更新
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminEmails } from '@/lib/constants';

// サービスロールクライアント
const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
};

// 管理者チェック
const isAdmin = (email: string | undefined): boolean => {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.some((adminEmail: string) => 
    adminEmail.toLowerCase() === email.toLowerCase()
  );
};

/**
 * GET: プラン設定取得
 * クエリパラメータ:
 * - service: 'makers' | 'kdl' | 'all'
 * - includeInactive: 'true' で非アクティブも含める（管理者のみ）
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service') || 'all';
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    let query = supabase
      .from('service_plans')
      .select('*')
      .order('sort_order', { ascending: true });

    // サービスでフィルタ
    if (service !== 'all') {
      query = query.eq('service', service);
    }

    // 非アクティブを含めない場合
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      // テーブルが存在しない場合はフォールバック
      if (error.code === '42P01') {
        console.warn('service_plans table does not exist. Please run supabase_service_plans.sql');
        return NextResponse.json({
          plans: getDefaultPlans(service),
          requiresMigration: true,
        });
      }
      console.error('Failed to fetch plans:', error);
      return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }

    // サービスごとにグループ化
    const plansByService: Record<string, any[]> = {};
    for (const plan of data || []) {
      if (!plansByService[plan.service]) {
        plansByService[plan.service] = [];
      }
      plansByService[plan.service].push(plan);
    }

    return NextResponse.json({
      plans: plansByService,
      requiresMigration: false,
    });
  } catch (error: any) {
    console.error('GET plans error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST: プラン設定更新（管理者のみ）
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { service, plan_tier, updates, userEmail } = body;

    // 管理者チェック
    if (!isAdmin(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!service || !plan_tier) {
      return NextResponse.json(
        { error: 'service and plan_tier are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // 更新可能なフィールドのみ抽出
    const allowedFields = [
      'display_name', 'description', 'price', 'price_type',
      'can_create', 'can_edit', 'can_use_ai', 'can_use_analytics',
      'can_use_gamification', 'can_download_html', 'can_embed',
      'can_hide_copyright', 'can_use_affiliate',
      'ai_daily_limit', 'ai_monthly_limit', 'gamification_limit',
      'ai_outline_daily_limit', 'ai_writing_daily_limit', // KDL専用の構成系・執筆系AI制限
      'book_limit', 'content_limit', 'premium_credits_daily', 'standard_credits_daily',
      'sort_order', 'is_active', 'is_visible', 'badge_text',
    ];

    const sanitizedUpdates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        sanitizedUpdates[field] = updates[field];
      }
    }

    if (Object.keys(sanitizedUpdates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('service_plans')
      .update(sanitizedUpdates)
      .eq('service', service)
      .eq('plan_tier', plan_tier)
      .select()
      .single();

    if (error) {
      console.error('Failed to update plan:', error);
      return NextResponse.json(
        { error: 'Failed to update plan: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'プラン設定を更新しました',
      plan: data,
    });
  } catch (error: any) {
    console.error('POST plans error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PUT: 新規プラン追加（管理者のみ）
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { plan, userEmail } = body;

    // 管理者チェック
    if (!isAdmin(userEmail)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!plan?.service || !plan?.plan_tier || !plan?.display_name) {
      return NextResponse.json(
        { error: 'service, plan_tier, and display_name are required' },
        { status: 400 }
      );
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('service_plans')
      .upsert(plan, { onConflict: 'service,plan_tier' })
      .select()
      .single();

    if (error) {
      console.error('Failed to create plan:', error);
      return NextResponse.json(
        { error: 'Failed to create plan: ' + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'プランを作成/更新しました',
      plan: data,
    });
  } catch (error: any) {
    console.error('PUT plans error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// フォールバック用のデフォルトプラン
function getDefaultPlans(service: string): Record<string, any[]> {
  const makersPlans = [
    {
      service: 'makers',
      plan_tier: 'guest',
      display_name: 'ゲスト',
      price: 0,
      can_create: true,
      can_edit: false,
      can_use_ai: false,
      gamification_limit: 0,
    },
    {
      service: 'makers',
      plan_tier: 'free',
      display_name: 'フリープラン',
      price: 0,
      can_create: true,
      can_edit: true,
      can_use_ai: false,
      gamification_limit: 0,
    },
    {
      service: 'makers',
      plan_tier: 'pro',
      display_name: 'プロプラン',
      price: 3980,
      can_create: true,
      can_edit: true,
      can_use_ai: true,
      gamification_limit: -1,
    },
  ];

  const kdlPlans = [
    {
      service: 'kdl',
      plan_tier: 'none',
      display_name: '無料トライアル',
      price: 0,
      ai_daily_limit: 3,
      book_limit: 1,
    },
    {
      service: 'kdl',
      plan_tier: 'lite',
      display_name: 'ライト',
      price: 2980,
      ai_daily_limit: 20,
      book_limit: -1,
    },
    {
      service: 'kdl',
      plan_tier: 'standard',
      display_name: 'スタンダード',
      price: 4980,
      ai_daily_limit: 30,
      book_limit: -1,
    },
    {
      service: 'kdl',
      plan_tier: 'pro',
      display_name: 'プロ',
      price: 9800,
      ai_daily_limit: 100,
      book_limit: -1,
    },
    {
      service: 'kdl',
      plan_tier: 'business',
      display_name: 'ビジネス',
      price: 29800,
      ai_daily_limit: -1,
      book_limit: -1,
    },
  ];

  if (service === 'makers') {
    return { makers: makersPlans };
  } else if (service === 'kdl') {
    return { kdl: kdlPlans };
  }
  return { makers: makersPlans, kdl: kdlPlans };
}
