import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  getMakersSubscriptionStatus,
  checkToolCreationLimit,
  UNLIMITED_TOOLS,
} from '@/lib/subscription';

/**
 * ポイントで解除された追加枠数を取得
 */
async function getPointUnlockCount(userId: string, toolType: string): Promise<number> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseServiceKey) return 0;

  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { count } = await supabase
    .from('point_unlocks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('tool_type', toolType);

  return count || 0;
}

/**
 * ツール作成数制限の事前チェック API
 * クライアント側の consumeAndExecute から呼ばれる
 */
export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  const toolType = request.nextUrl.searchParams.get('toolType');

  if (!userId || !toolType) {
    return NextResponse.json({ error: 'userId and toolType are required' }, { status: 400 });
  }

  // 常に無制限のツールは即座に許可
  if (UNLIMITED_TOOLS.has(toolType)) {
    return NextResponse.json({ allowed: true, limit: -1, current: 0 });
  }

  try {
    const subStatus = await getMakersSubscriptionStatus(userId);
    const result = await checkToolCreationLimit(userId, subStatus.planTier, toolType);

    // プラン上限に達している場合、ポイント解除枠を確認
    if (!result.allowed && result.limit > 0) {
      const unlockCount = await getPointUnlockCount(userId, toolType);
      const effectiveLimit = result.limit + unlockCount;

      if (result.current < effectiveLimit) {
        // ポイント解除枠で許可
        return NextResponse.json({
          allowed: true,
          current: result.current,
          limit: effectiveLimit,
          pointUnlocks: unlockCount,
        });
      }

      // それでも超過 → ポイント解除枠情報を含めて返す
      return NextResponse.json({
        ...result,
        limit: effectiveLimit,
        pointUnlocks: unlockCount,
        canUsePoints: true,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('[check-creation-limit] Error:', error);
    // エラー時はフェイルオープン（作成を許可）
    return NextResponse.json({ allowed: true, limit: -1, current: 0 });
  }
}
