import { NextRequest, NextResponse } from 'next/server';
import { getNewsletterUsage } from '@/lib/subscription';

/**
 * GET: 当月のメルマガ送信数を取得
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const used = await getNewsletterUsage(userId);

    return NextResponse.json({ used });
  } catch (error) {
    console.error('[Newsletter Usage] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
