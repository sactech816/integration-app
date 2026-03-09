import { NextResponse } from 'next/server';
import { getPointTransactions } from '@/lib/points';

/**
 * ポイント取引履歴取得API
 * GET /api/points/transactions?userId=xxx&limit=20&offset=0
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const offset = parseInt(searchParams.get('offset') || '0', 10);

  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const transactions = await getPointTransactions(userId, limit, offset);
    return NextResponse.json({ transactions });
  } catch (err: any) {
    console.error('Points transactions error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
