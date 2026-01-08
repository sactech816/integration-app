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

export async function POST(request: NextRequest) {
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

    // リクエストボディを取得
    const { userId, points, reason } = await request.json();

    if (!userId || typeof points !== 'number' || points === 0) {
      return NextResponse.json(
        { error: 'Invalid request. userId and points are required.' },
        { status: 400 }
      );
    }

    // ポイント付与を実行（RPC関数を使用）
    const { data, error: rpcError } = await supabase.rpc('update_user_points', {
      p_user_id: userId,
      p_session_id: null,
      p_change_amount: points,
      p_campaign_id: null,
      p_event_type: 'manual_adjust',
      p_event_data: {
        admin_id: user.id,
        admin_email: user.email,
        reason: reason || '管理者による手動調整',
        timestamp: new Date().toISOString(),
      },
    });

    if (rpcError) {
      console.error('RPC error:', rpcError);
      return NextResponse.json(
        { error: 'Failed to award points', details: rpcError.message },
        { status: 500 }
      );
    }

    // 結果を取得
    const result = data?.[0];
    if (!result || !result.success) {
      return NextResponse.json(
        { error: 'Failed to award points', details: 'Insufficient balance or other error' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      newBalance: result.new_balance,
      logId: result.log_id,
      message: `${points}ポイントを付与しました`,
    });

  } catch (error: any) {
    console.error('Award points error:', error);
    return NextResponse.json(
      { error: 'Failed to award points', details: error.message },
      { status: 500 }
    );
  }
}

