import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminFromRequest } from '@/lib/auth-server';

/**
 * 管理者用: トライアル設定 取得/更新 API
 * GET  /api/admin/trial-settings — 現在の設定を取得
 * PUT  /api/admin/trial-settings — 設定を更新
 */

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase configuration is missing');
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    const [adminUser, errorRes] = await requireAdminFromRequest(request);
    if (errorRes) return errorRes;

    const supabase = getSupabaseAdmin();

    const { data: settings, error } = await supabase
      .from('trial_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) throw error;

    // トライアル利用統計
    const { count: totalOffered } = await supabase
      .from('trial_offers')
      .select('*', { count: 'exact', head: true });

    const { count: totalAccepted } = await supabase
      .from('trial_offers')
      .select('*', { count: 'exact', head: true })
      .not('accepted_at', 'is', null);

    return NextResponse.json({
      settings,
      stats: {
        totalOffered: totalOffered || 0,
        totalAccepted: totalAccepted || 0,
        conversionRate: totalOffered
          ? Math.round(((totalAccepted || 0) / totalOffered) * 100)
          : 0,
      },
    });
  } catch (err: any) {
    console.error('Trial settings GET error:', err);
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const [adminUser, errorRes] = await requireAdminFromRequest(request);
    if (errorRes) return errorRes;

    const supabase = getSupabaseAdmin();
    const body = await request.json();

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
      updated_by: adminUser?.id || null,
    };

    // 許可されたフィールドのみ更新
    const allowedFields = [
      'trial_enabled',
      'trial_delay_days',
      'trial_price',
      'trial_message',
      'target_plans',
      'stripe_coupon_ids',
      'campaign_start_at',
      'campaign_end_at',
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const { data, error } = await supabase
      .from('trial_settings')
      .update(updateData)
      .select()
      .single();

    if (error) throw error;

    console.log(`✅ Trial settings updated by admin ${adminUser?.email}`);

    return NextResponse.json({ settings: data });
  } catch (err: any) {
    console.error('Trial settings PUT error:', err);
    return NextResponse.json({ error: err.message }, { status: err.status || 500 });
  }
}
