import { NextResponse } from 'next/server';
import { checkAICreditLimit } from '@/lib/ai-usage';
import { getSubscriptionStatus, getAICreditsForPlan } from '@/lib/subscription';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const mode = searchParams.get('mode') as 'quality' | 'speed' || 'speed';

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // プラン情報取得
    const subscription = await getSubscriptionStatus(userId);
    const credits = getAICreditsForPlan(subscription.planTier);

    // クレジットチェック
    const usageCheck = await checkAICreditLimit(userId, mode);

    return NextResponse.json({
      hasPremiumAccess: credits.hasPremiumAccess,
      canUsePremium: usageCheck.canUsePremium || false,
      canUseStandard: usageCheck.canUseStandard || false,
      remainingPremium: usageCheck.remainingPremium || 0,
      remainingStandard: usageCheck.remainingStandard || 0,
      planTier: subscription.planTier,
    });
  } catch (error: any) {
    console.error('AI credit check error:', error);
    return NextResponse.json(
      { error: 'Failed to check AI credits' },
      { status: 500 }
    );
  }
}

