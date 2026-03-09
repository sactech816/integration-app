import { NextResponse } from 'next/server';
import { getPointPacks } from '@/lib/points';

/**
 * ポイントパック一覧取得API
 * GET /api/points/packs
 */
export async function GET() {
  try {
    const packs = await getPointPacks();
    return NextResponse.json({ packs });
  } catch (err: any) {
    console.error('Points packs error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
