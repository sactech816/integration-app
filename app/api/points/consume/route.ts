import { NextResponse } from 'next/server';
import { checkAndConsumePoints, getPointCost } from '@/lib/points';

/**
 * ポイント消費API
 * POST /api/points/consume
 * Body: { userId, serviceType, action?, contentId?, isPro? }
 */
export async function POST(req: Request) {
  try {
    const { userId, serviceType, action = 'save', contentId, isPro = false } = await req.json();

    if (!userId || !serviceType) {
      return NextResponse.json({ error: 'userId and serviceType are required' }, { status: 400 });
    }

    const result = await checkAndConsumePoints(userId, serviceType, action, isPro, contentId);

    if (!result.success && result.error === 'insufficient_balance') {
      const required = await getPointCost(serviceType, action);
      return NextResponse.json({
        success: false,
        error: 'insufficient_balance',
        balance: result.balance,
        required,
      });
    }

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Points consume error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
