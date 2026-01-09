import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminEmails } from '@/lib/constants';

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
};

// ステータスラベル
const STATUS_LABELS: Record<string, string> = {
  pending: '保留中',
  confirmed: '確定',
  paid: '支払済',
  cancelled: 'キャンセル',
};

// サービスタイプラベル
const SERVICE_LABELS: Record<string, string> = {
  kdl: 'Kindle執筆',
  quiz: '診断クイズ',
  profile: 'プロフィールLP',
  business: 'ビジネスLP',
};

// アフィリエイト管理データを取得
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getServiceClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // トークンからユーザー情報を取得
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 管理者チェック
    const adminEmails = getAdminEmails();
    const isAdmin = adminEmails.some(
      (email) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // アフィリエイター一覧を取得
    const { data: affiliates, error: affiliatesError } = await supabase
      .from('affiliates')
      .select('*')
      .order('created_at', { ascending: false });

    if (affiliatesError) {
      // テーブルがない場合
      if (affiliatesError.code === '42P01') {
        return NextResponse.json({
          affiliates: [],
          conversions: [],
          stats: {
            totalAffiliates: 0,
            activeAffiliates: 0,
            thisMonthClicks: 0,
            thisMonthConversions: 0,
            thisMonthEarnings: 0,
            pendingPayouts: 0,
          },
          tableExists: false,
        });
      }
      throw affiliatesError;
    }

    // ユーザーIDからメールアドレスを取得
    const userIds = affiliates?.map((a) => a.user_id).filter(Boolean) || [];
    const usersMap: Record<string, string> = {};
    
    for (const userId of userIds) {
      try {
        const { data: userData } = await supabase.auth.admin.getUserById(userId);
        if (userData?.user?.email) {
          usersMap[userId] = userData.user.email;
        }
      } catch (e) {
        // 取得できない場合はスキップ
      }
    }

    // アフィリエイターにメールを追加
    const enrichedAffiliates = affiliates?.map((affiliate) => ({
      ...affiliate,
      email: usersMap[affiliate.user_id] || 'Unknown',
    })) || [];

    // 成果（コンバージョン）一覧を取得
    const { data: conversions, error: conversionsError } = await supabase
      .from('affiliate_conversions')
      .select(`
        *,
        affiliates (
          referral_code,
          user_id
        )
      `)
      .order('converted_at', { ascending: false })
      .limit(100);

    // 成果にアフィリエイターのメールを追加
    const enrichedConversions = conversions?.map((conv) => ({
      ...conv,
      affiliate_email: conv.affiliates?.user_id ? usersMap[conv.affiliates.user_id] : 'Unknown',
      affiliate_code: conv.affiliates?.referral_code || 'Unknown',
      service_label: SERVICE_LABELS[conv.service_type] || conv.service_type,
      status_label: STATUS_LABELS[conv.status] || conv.status,
    })) || [];

    // 統計を計算
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setHours(0, 0, 0, 0);

    // 今月のクリック数
    const { count: thisMonthClicks } = await supabase
      .from('affiliate_clicks')
      .select('id', { count: 'exact', head: true })
      .gte('clicked_at', firstDayOfMonth.toISOString());

    // 今月の成約数
    const { count: thisMonthConversions } = await supabase
      .from('affiliate_conversions')
      .select('id', { count: 'exact', head: true })
      .gte('converted_at', firstDayOfMonth.toISOString())
      .neq('status', 'cancelled');

    // 今月の報酬総額
    const { data: thisMonthEarningsData } = await supabase
      .from('affiliate_conversions')
      .select('commission_amount')
      .gte('converted_at', firstDayOfMonth.toISOString())
      .in('status', ['confirmed', 'paid']);

    const thisMonthEarnings = thisMonthEarningsData?.reduce(
      (sum, item) => sum + (parseFloat(item.commission_amount) || 0),
      0
    ) || 0;

    // 未払い報酬総額
    const { data: pendingPayoutsData } = await supabase
      .from('affiliate_conversions')
      .select('commission_amount')
      .eq('status', 'confirmed');

    const pendingPayouts = pendingPayoutsData?.reduce(
      (sum, item) => sum + (parseFloat(item.commission_amount) || 0),
      0
    ) || 0;

    // アクティブなアフィリエイター数
    const activeAffiliates = affiliates?.filter((a) => a.status === 'active').length || 0;

    return NextResponse.json({
      affiliates: enrichedAffiliates,
      conversions: enrichedConversions,
      stats: {
        totalAffiliates: affiliates?.length || 0,
        activeAffiliates,
        thisMonthClicks: thisMonthClicks || 0,
        thisMonthConversions: thisMonthConversions || 0,
        thisMonthEarnings: Math.round(thisMonthEarnings * 100) / 100,
        pendingPayouts: Math.round(pendingPayouts * 100) / 100,
      },
      tableExists: true,
    });
  } catch (error: any) {
    console.error('Get affiliates error:', error);
    return NextResponse.json(
      { error: 'Failed to get affiliates' },
      { status: 500 }
    );
  }
}

// アフィリエイト設定を更新
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getServiceClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // トークンからユーザー情報を取得
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 管理者チェック
    const adminEmails = getAdminEmails();
    const isAdmin = adminEmails.some(
      (email) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { action, affiliateId, conversionId, commissionRate, status } = body;

    // 報酬率の更新
    if (action === 'update_commission_rate' && affiliateId && commissionRate !== undefined) {
      const { error: updateError } = await supabase
        .from('affiliates')
        .update({
          commission_rate: commissionRate,
          updated_at: new Date().toISOString(),
        })
        .eq('id', affiliateId);

      if (updateError) throw updateError;

      return NextResponse.json({ success: true, action, affiliateId, commissionRate });
    }

    // アフィリエイターステータスの更新
    if (action === 'update_affiliate_status' && affiliateId && status) {
      const { error: updateError } = await supabase
        .from('affiliates')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', affiliateId);

      if (updateError) throw updateError;

      return NextResponse.json({ success: true, action, affiliateId, status });
    }

    // 成果ステータスの更新（pending → confirmed）
    if (action === 'confirm_conversion' && conversionId) {
      const { error: updateError } = await supabase
        .from('affiliate_conversions')
        .update({
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        })
        .eq('id', conversionId);

      if (updateError) throw updateError;

      return NextResponse.json({ success: true, action, conversionId });
    }

    // 成果ステータスの更新（confirmed → paid）
    if (action === 'mark_paid' && conversionId) {
      // 成果情報を取得
      const { data: conversion, error: fetchError } = await supabase
        .from('affiliate_conversions')
        .select('affiliate_id, commission_amount')
        .eq('id', conversionId)
        .single();

      if (fetchError) throw fetchError;

      // 成果を支払い済みに更新
      const { error: updateError } = await supabase
        .from('affiliate_conversions')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
        })
        .eq('id', conversionId);

      if (updateError) throw updateError;

      // アフィリエイターの未払い報酬を減らす
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('unpaid_earnings')
        .eq('id', conversion.affiliate_id)
        .single();

      if (affiliate) {
        const newUnpaid = Math.max(0, (affiliate.unpaid_earnings || 0) - parseFloat(conversion.commission_amount));
        await supabase
          .from('affiliates')
          .update({
            unpaid_earnings: newUnpaid,
            updated_at: new Date().toISOString(),
          })
          .eq('id', conversion.affiliate_id);
      }

      return NextResponse.json({ success: true, action, conversionId });
    }

    // 成果のキャンセル
    if (action === 'cancel_conversion' && conversionId) {
      // 成果情報を取得
      const { data: conversion, error: fetchError } = await supabase
        .from('affiliate_conversions')
        .select('affiliate_id, commission_amount, status')
        .eq('id', conversionId)
        .single();

      if (fetchError) throw fetchError;

      // 成果をキャンセルに更新
      const { error: updateError } = await supabase
        .from('affiliate_conversions')
        .update({
          status: 'cancelled',
        })
        .eq('id', conversionId);

      if (updateError) throw updateError;

      // 確定済みだった場合、アフィリエイターの統計を更新
      if (conversion.status === 'confirmed') {
        const { data: affiliate } = await supabase
          .from('affiliates')
          .select('total_earnings, unpaid_earnings, total_conversions')
          .eq('id', conversion.affiliate_id)
          .single();

        if (affiliate) {
          await supabase
            .from('affiliates')
            .update({
              total_earnings: Math.max(0, (affiliate.total_earnings || 0) - parseFloat(conversion.commission_amount)),
              unpaid_earnings: Math.max(0, (affiliate.unpaid_earnings || 0) - parseFloat(conversion.commission_amount)),
              total_conversions: Math.max(0, (affiliate.total_conversions || 0) - 1),
              updated_at: new Date().toISOString(),
            })
            .eq('id', conversion.affiliate_id);
        }
      }

      return NextResponse.json({ success: true, action, conversionId });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Update affiliate error:', error);
    return NextResponse.json(
      { error: 'Failed to update affiliate' },
      { status: 500 }
    );
  }
}

