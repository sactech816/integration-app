import { NextResponse } from 'next/server';
import { getAllPointCosts } from '@/lib/points';

/**
 * ツールごとのポイントコスト一覧取得API
 * GET /api/points/costs
 */
export async function GET() {
  try {
    const costs = await getAllPointCosts();
    return NextResponse.json({ costs });
  } catch (err: any) {
    console.error('Points costs error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
