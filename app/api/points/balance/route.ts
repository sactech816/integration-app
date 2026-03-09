import { NextResponse } from 'next/server';
import { getPointBalance } from '@/lib/points';

/**
 * ポイント残高取得API
 * GET /api/points/balance?userId=xxx
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const balance = await getPointBalance(userId);
    return NextResponse.json(balance);
  } catch (err: any) {
    console.error('Points balance error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
