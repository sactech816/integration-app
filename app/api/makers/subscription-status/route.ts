import { NextRequest, NextResponse } from 'next/server';
import { getMakersSubscriptionStatus } from '@/lib/subscription';

/**
 * 集客メーカーのサブスクリプション状態を取得するAPIエンドポイント
 * モニターユーザーとサブスクリプションの両方をチェック
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const status = await getMakersSubscriptionStatus(userId);
    
    console.log('[Makers Sub Status] User:', userId, 'Result:', status);
    
    return NextResponse.json(status);
  } catch (error: any) {
    console.error('Makers subscription status error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription status' },
      { status: 500 }
    );
  }
}
