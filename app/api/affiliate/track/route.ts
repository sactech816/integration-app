import { NextRequest, NextResponse } from 'next/server';
import { recordAffiliateClick } from '@/app/actions/affiliate';

// 紹介リンククリックを記録するAPI
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode, landingPage, serviceType } = body;

    if (!referralCode) {
      return NextResponse.json(
        { error: 'Referral code is required' },
        { status: 400 }
      );
    }

    // IPアドレスとUser-Agentを取得
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';

    const result = await recordAffiliateClick(
      referralCode,
      landingPage || '/',
      serviceType || 'kdl',
      ipAddress,
      userAgent,
      referrer
    );

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        clickId: result.clickId 
      });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to record click' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Affiliate track error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GETリクエストでも対応（画像ピクセル等用）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const referralCode = searchParams.get('ref');
    const landingPage = searchParams.get('page') || '/';
    const serviceType = searchParams.get('service') || 'kdl';

    if (!referralCode) {
      // 1x1透明GIFを返す
      const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
      return new NextResponse(gif, {
        headers: {
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-store',
        },
      });
    }

    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';

    await recordAffiliateClick(
      referralCode,
      landingPage,
      serviceType,
      ipAddress,
      userAgent,
      referrer
    );

    // 1x1透明GIFを返す
    const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    return new NextResponse(gif, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Affiliate track GET error:', error);
    // エラーでも透明GIFを返す
    const gif = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    return new NextResponse(gif, {
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store',
      },
    });
  }
}

