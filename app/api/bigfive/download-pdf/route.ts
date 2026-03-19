/**
 * Big Five プレミアムレポート — レポートページへリダイレクト
 * GET  /api/bigfive/download-pdf?id=<resultId>
 * POST /api/bigfive/download-pdf { resultId }
 *
 * Puppeteer PDF生成を廃止し、Webレポートページ + ブラウザ印刷方式に移行。
 * 互換性のためエンドポイントは維持し、レポートページURLを返す。
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'IDが必要です' }, { status: 400 });
    }

    return NextResponse.json({ url: `${SITE_URL}/bigfive/report/${id}` });
  } catch (err: any) {
    console.error('[BigFive Download PDF] GET error:', err);
    return NextResponse.json({ error: err.message || 'エラーが発生しました' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const { resultId } = await request.json();
    if (!resultId) {
      return NextResponse.json({ error: '診断結果IDが必要です' }, { status: 400 });
    }

    return NextResponse.json({ url: `${SITE_URL}/bigfive/report/${resultId}` });
  } catch (err: any) {
    console.error('[BigFive Download PDF] POST error:', err);
    return NextResponse.json({ error: err.message || 'エラーが発生しました' }, { status: 500 });
  }
}
