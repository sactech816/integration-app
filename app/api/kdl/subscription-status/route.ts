import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

// サーバーサイド用Supabaseクライアント
function getSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) return null;
  
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// 認証用Supabaseクライアント
async function getAuthSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) return null;
  
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('sb-access-token')?.value;
  const refreshToken = cookieStore.get('sb-refresh-token')?.value;
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    });
  }
  
  return supabase;
}

export async function GET(request: NextRequest) {
  try {
    console.log('[KDL Sub Status] API called');
    
    const supabase = getSupabaseServer();
    if (!supabase) {
      console.log('[KDL Sub Status] No supabase server');
      return NextResponse.json({
        hasActiveSubscription: false,
        planType: 'none',
        planTier: 'none',
        isMonitor: false
      });
    }
    
    // クエリパラメータからユーザーIDを取得
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // クエリパラメータがない場合はCookie認証を試行
    let finalUserId = userId;
    if (!finalUserId) {
      const authSupabase = await getAuthSupabase();
      if (authSupabase) {
        const { data: { user } } = await authSupabase.auth.getUser();
        finalUserId = user?.id || null;
      }
    }
    
    console.log('[KDL Sub Status] User ID:', finalUserId || 'null');
    
    if (!finalUserId) {
      console.log('[KDL Sub Status] No user');
      return NextResponse.json({
        hasActiveSubscription: false,
        planType: 'none',
        planTier: 'none',
        isMonitor: false
      });
    }
    
    // 1. KDLサブスクリプションをチェック
    const { data: subscription } = await supabase
      .from('kdl_subscriptions')
      .select('status, plan_tier, period, next_payment_date, amount')
      .eq('user_id', finalUserId)
      .in('status', ['active', 'trialing'])
      .single();
    
    if (subscription) {
      return NextResponse.json({
        hasActiveSubscription: true,
        planType: subscription.period === 'yearly' ? 'yearly' : 'monthly',
        planTier: subscription.plan_tier || 'standard',
        nextPaymentDate: subscription.next_payment_date,
        amount: subscription.amount,
        isMonitor: false
      });
    }
    
    // 2. モニターユーザーをチェック（KDLサービス限定）
    const now = new Date().toISOString();
    console.log('[KDL Sub Status] Checking monitor for user:', finalUserId, 'now:', now);
    
    const { data: monitor, error: monitorError } = await supabase
      .from('monitor_users')
      .select('monitor_plan_type, monitor_expires_at, service')
      .eq('user_id', finalUserId)
      .eq('service', 'kdl')
      .lte('monitor_start_at', now)
      .gt('monitor_expires_at', now)
      .order('monitor_expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    
    console.log('[KDL Sub Status] Monitor result:', monitor, 'error:', monitorError);
    
    if (monitor) {
      return NextResponse.json({
        hasActiveSubscription: true,
        planType: 'monthly',
        planTier: monitor.monitor_plan_type || 'standard',
        isMonitor: true,
        monitorExpiresAt: monitor.monitor_expires_at
      });
    }
    
    // 3. 旧subscriptionsテーブルもフォールバックでチェック
    const { data: oldSubscription } = await supabase
      .from('subscriptions')
      .select('status, plan_tier, period, next_payment_date, amount')
      .eq('user_id', finalUserId)
      .eq('status', 'active')
      .single();
    
    if (oldSubscription) {
      return NextResponse.json({
        hasActiveSubscription: true,
        planType: oldSubscription.period === 'yearly' ? 'yearly' : 'monthly',
        planTier: oldSubscription.plan_tier || 'standard',
        nextPaymentDate: oldSubscription.next_payment_date,
        amount: oldSubscription.amount,
        isMonitor: false
      });
    }
    
    // サブスクリプションなし
    return NextResponse.json({
      hasActiveSubscription: false,
      planType: 'none',
      planTier: 'none',
      isMonitor: false
    });
    
  } catch (error) {
    console.error('[KDL Subscription Status] Error:', error);
    return NextResponse.json({
      hasActiveSubscription: false,
      planType: 'none',
      planTier: 'none',
      isMonitor: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}
