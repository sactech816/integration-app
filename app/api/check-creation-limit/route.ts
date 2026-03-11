import { NextRequest, NextResponse } from 'next/server';
import {
  getMakersSubscriptionStatus,
  checkToolCreationLimit,
  UNLIMITED_TOOLS,
} from '@/lib/subscription';

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
    return NextResponse.json(result);
  } catch (error) {
    console.error('[check-creation-limit] Error:', error);
    // エラー時はフェイルオープン（作成を許可）
    return NextResponse.json({ allowed: true, limit: -1, current: 0 });
  }
}
