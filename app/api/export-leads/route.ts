import { NextRequest, NextResponse } from 'next/server';
import { exportLeadsAsCsv } from '@/app/actions/leads';
import { ContentType } from '@/app/actions/analytics';

/**
 * GET: リードをCSV形式でダウンロード
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentId = searchParams.get('contentId');
    const contentType = searchParams.get('contentType') as ContentType | null;

    // バリデーション
    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: 'contentId and contentType are required' },
        { status: 400 }
      );
    }

    if (!['quiz', 'profile', 'business'].includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid contentType' },
        { status: 400 }
      );
    }

    // CSV生成
    const { csv, count } = await exportLeadsAsCsv(contentId, contentType);

    if (count === 0) {
      return NextResponse.json(
        { error: 'No leads found' },
        { status: 404 }
      );
    }

    // ファイル名生成
    const date = new Date().toISOString().split('T')[0];
    const filename = `leads_${contentType}_${contentId}_${date}.csv`;

    // CSVレスポンス
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[Export Leads] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}








































































































