import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const UNLOCK_COST = 1000; // ポイント

/**
 * ゲーミフィケーションポイントを消費してツール作成枠を1つ解除する
 * POST /api/points/unlock-tool
 * Body: { userId: string, toolType: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { userId, toolType } = await request.json();

    if (!userId || !toolType) {
      return NextResponse.json(
        { success: false, message: 'userId と toolType は必須です' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // RPC呼び出し（排他ロック付きでポイント差引 + 解除記録を一括実行）
    const { data, error } = await supabase.rpc('unlock_tool_with_points', {
      p_user_id: userId,
      p_tool_type: toolType,
      p_cost: UNLOCK_COST,
    });

    if (error) {
      console.error('[unlock-tool] RPC error:', error);
      return NextResponse.json(
        { success: false, message: 'ポイント解除処理に失敗しました' },
        { status: 500 }
      );
    }

    if (data && data.length > 0) {
      const result = data[0];
      return NextResponse.json({
        success: result.success,
        newBalance: result.new_balance,
        message: result.message,
        cost: UNLOCK_COST,
      });
    }

    return NextResponse.json(
      { success: false, message: '予期しないエラーが発生しました' },
      { status: 500 }
    );
  } catch (error) {
    console.error('[unlock-tool] Error:', error);
    return NextResponse.json(
      { success: false, message: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * ポイント解除の残高・コスト確認
 * GET /api/points/unlock-tool?userId=xxx
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // ゲーミフィケーションポイント残高
  const { data: balanceData } = await supabase
    .from('user_point_balances')
    .select('current_points')
    .eq('user_id', userId)
    .single();

  const currentBalance = balanceData?.current_points || 0;

  return NextResponse.json({
    cost: UNLOCK_COST,
    currentBalance,
    canUnlock: currentBalance >= UNLOCK_COST,
  });
}
