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
      return NextResponse.json({
        daily: { total_calls: 0, limit: 50 },
        monthly: { total_calls: 0, limit: 500 },
      });
    }

    // 今日の使用量を取得
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: dailyData, error: dailyError } = await supabase
      .from('ai_usage_logs')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString());

    if (dailyError) {
      console.error('Daily usage fetch error:', dailyError);
    }

    // 今月の使用量を取得
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const { data: monthlyData, error: monthlyError } = await supabase
      .from('ai_usage_logs')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', firstDayOfMonth.toISOString());

    if (monthlyError) {
      console.error('Monthly usage fetch error:', monthlyError);
    }

    let dailyLimit = 3; // デフォルト（無料）
    let monthlyLimit = 10;

    // まずモニター権限をチェック（KDLサービス限定）
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
      // モニタープランに応じたlimitを設定
      const planType = monitorData.monitor_plan_type;
      if (planType === 'business' || planType === 'enterprise' || planType === 'initial_business') {
        dailyLimit = 100;
        monthlyLimit = -1; // 無制限
      } else if (planType === 'pro' || planType === 'initial_standard') {
        dailyLimit = 80;
        monthlyLimit = 800;
      } else if (planType === 'initial_trial' || planType === 'standard') {
        dailyLimit = 50;
        monthlyLimit = 500;
      } else if (planType === 'lite') {
        dailyLimit = 20;
        monthlyLimit = 200;
      }
    } else {
      // モニター権限がない場合は通常のサブスク状態を取得
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('period, status')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (subscriptionData) {
        if (subscriptionData.period === 'yearly') {
          dailyLimit = 100;
          monthlyLimit = -1; // 無制限
        } else if (subscriptionData.period === 'monthly') {
          dailyLimit = 50;
          monthlyLimit = 500;
        }
      }
    }

    return NextResponse.json({
      daily: {
        total_calls: dailyData?.length || 0,
        limit: dailyLimit,
      },
      monthly: {
        total_calls: monthlyData?.length || 0,
        limit: monthlyLimit,
      },
    });
  } catch (error: any) {
    console.error('AI usage fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI usage' },
      { status: 500 }
    );
  }
}


























