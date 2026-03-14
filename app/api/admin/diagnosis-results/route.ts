/**
 * 管理者用: BigFive / Fortune 全ユーザー診断結果一覧
 * GET /api/admin/diagnosis-results?type=bigfive|fortune&page=1&limit=20&search=
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminEmails } from '@/lib/constants';
import { createServerSupabaseClient } from '@/lib/supabase-server';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(request: NextRequest) {
  try {
    // 認証 + 管理者チェック
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminEmails = getAdminEmails();
    const isAdmin = adminEmails.some(e => user.email?.toLowerCase() === e.toLowerCase());
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const serviceClient = getServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ error: 'Service client not available' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'bigfive';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    if (type === 'bigfive') {
      // BigFive結果を取得（ユーザー情報付き）
      let query = serviceClient
        .from('bigfive_results')
        .select('id, user_id, test_type, openness, conscientiousness, extraversion, agreeableness, neuroticism, mbti_code, pdf_purchased, pdf_storage_path, report_content, report_generated_at, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: results, count, error } = await query;
      if (error) {
        console.error('Admin bigfive results error:', error);
        return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 });
      }

      // ユーザーIDリストからメール取得
      const userIds = [...new Set((results || []).map(r => r.user_id))];
      const userMap = await getUserEmails(serviceClient, userIds);

      // 検索フィルタ（メール・MBTI）
      let filtered = (results || []).map(r => ({
        ...r,
        user_email: userMap[r.user_id] || '不明',
        has_report: !!r.report_content,
        has_pdf: !!r.pdf_storage_path,
      }));

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(r =>
          r.user_email.toLowerCase().includes(s) ||
          r.mbti_code?.toLowerCase().includes(s) ||
          r.id.includes(s)
        );
      }

      // report_content はリストでは不要なので除外
      const cleanResults = filtered.map(({ report_content, ...rest }) => rest);

      return NextResponse.json({ results: cleanResults, total: count || 0, page, limit });
    }

    if (type === 'fortune') {
      let query = serviceClient
        .from('fortune_results')
        .select('id, user_id, birth_year, birth_month, birth_day, result_snapshot, report_purchased, pdf_storage_path, report_content, report_generated_at, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data: results, count, error } = await query;
      if (error) {
        console.error('Admin fortune results error:', error);
        return NextResponse.json({ error: '取得に失敗しました' }, { status: 500 });
      }

      const userIds = [...new Set((results || []).map(r => r.user_id))];
      const userMap = await getUserEmails(serviceClient, userIds);

      let filtered = (results || []).map(r => ({
        ...r,
        user_email: userMap[r.user_id] || '不明',
        has_report: !!r.report_content,
        has_pdf: !!r.pdf_storage_path,
      }));

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(r =>
          r.user_email.toLowerCase().includes(s) ||
          r.id.includes(s)
        );
      }

      const cleanResults = filtered.map(({ report_content, ...rest }) => rest);

      return NextResponse.json({ results: cleanResults, total: count || 0, page, limit });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (err: any) {
    console.error('Admin diagnosis results error:', err);
    return NextResponse.json({ error: err.message || 'サーバーエラー' }, { status: 500 });
  }
}

async function getUserEmails(client: any, userIds: string[]): Promise<Record<string, string>> {
  if (userIds.length === 0) return {};

  const { data } = await client
    .from('profiles')
    .select('id, email')
    .in('id', userIds);

  const map: Record<string, string> = {};
  if (data) {
    for (const u of data as { id: string; email: string | null }[]) {
      map[u.id] = u.email || '不明';
    }
  }
  return map;
}
