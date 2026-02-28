import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { isValidEmail } from '@/lib/security/sanitize';

const resend = new Resend(process.env.RESEND_API_KEY);

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * POST: 購読者を一括インポート
 * source: 'leads' | 'order_forms' | 'csv'
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId, source, data, contentType, formIds } = await request.json();

    if (!userId || !source) {
      return NextResponse.json({ error: 'userId と source は必須です' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // リスト所有者チェック + Resend Audience ID取得
    const { data: list } = await supabase
      .from('newsletter_lists')
      .select('id, resend_audience_id')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (!list) {
      return NextResponse.json({ error: 'リストが見つかりません' }, { status: 404 });
    }

    // ソースに応じてメールアドレスを収集
    let contacts: { email: string; name?: string }[] = [];

    if (source === 'leads') {
      contacts = await collectFromLeads(supabase, userId, contentType);
    } else if (source === 'order_forms') {
      contacts = await collectFromOrderForms(supabase, userId, formIds);
    } else if (source === 'csv') {
      if (!Array.isArray(data)) {
        return NextResponse.json({ error: 'CSV data は配列で送信してください' }, { status: 400 });
      }
      contacts = data.filter((d: { email?: string }) => d.email && isValidEmail(d.email));
    } else {
      return NextResponse.json({ error: '無効なソースです' }, { status: 400 });
    }

    if (contacts.length === 0) {
      return NextResponse.json({ imported: 0, skipped: 0, total: 0 });
    }

    // メール重複排除（同一メールは最初の1件のみ）
    const uniqueMap = new Map<string, { email: string; name?: string }>();
    for (const c of contacts) {
      const email = c.email.toLowerCase().trim();
      if (isValidEmail(email) && !uniqueMap.has(email)) {
        uniqueMap.set(email, { email, name: c.name });
      }
    }
    const uniqueContacts = Array.from(uniqueMap.values());

    // 既存購読者を取得して差分を計算
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('email')
      .eq('list_id', id)
      .eq('status', 'subscribed');

    const existingEmails = new Set((existing || []).map((s: { email: string }) => s.email.toLowerCase()));
    const newContacts = uniqueContacts.filter((c) => !existingEmails.has(c.email));
    const skipped = uniqueContacts.length - newContacts.length;

    if (newContacts.length === 0) {
      return NextResponse.json({ imported: 0, skipped, total: uniqueContacts.length });
    }

    // バッチ upsert（100件ずつ）
    let imported = 0;
    const batchSize = 100;
    for (let i = 0; i < newContacts.length; i += batchSize) {
      const batch = newContacts.slice(i, i + batchSize);
      const rows = batch.map((c) => ({
        list_id: id,
        email: c.email,
        name: c.name || null,
        status: 'subscribed',
        subscribed_at: new Date().toISOString(),
        unsubscribed_at: null,
      }));

      const { data: inserted, error } = await supabase
        .from('newsletter_subscribers')
        .upsert(rows, { onConflict: 'list_id,email' })
        .select();

      if (error) {
        console.error('[Newsletter Import] Batch upsert error:', error);
      } else {
        imported += inserted?.length || 0;
      }
    }

    // Resend Audience への同期
    if (list.resend_audience_id && newContacts.length > 0) {
      for (const c of newContacts) {
        try {
          await resend.contacts.create({
            email: c.email,
            firstName: c.name || '',
            audienceId: list.resend_audience_id,
            unsubscribed: false,
          });
        } catch (err) {
          // 個別の失敗はスキップ
        }
      }
    }

    return NextResponse.json({ imported, skipped, total: uniqueContacts.length });
  } catch (error) {
    console.error('[Newsletter Import] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * leads テーブルからメールを収集
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function collectFromLeads(
  supabase: any,
  userId: string,
  contentType?: string
): Promise<{ email: string; name?: string }[]> {
  let contentIds: string[] = [];

  if (!contentType || contentType === 'quiz') {
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('slug')
      .eq('user_id', userId);
    contentIds = [...contentIds, ...(quizzes?.map((q: { slug: string }) => q.slug) || [])];
  }

  if (!contentType || contentType === 'profile') {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('slug')
      .eq('user_id', userId);
    contentIds = [...contentIds, ...(profiles?.map((p: { slug: string }) => p.slug) || [])];
  }

  if (!contentType || contentType === 'business') {
    const { data: businessLps } = await supabase
      .from('business_projects')
      .select('slug')
      .eq('user_id', userId);
    contentIds = [...contentIds, ...(businessLps?.map((b: { slug: string }) => b.slug) || [])];
  }

  if (contentIds.length === 0) return [];

  let query = supabase
    .from('leads')
    .select('email, name')
    .in('content_id', contentIds);

  if (contentType) {
    query = query.eq('content_type', contentType);
  }

  const { data } = await query;
  return (data || []).map((l: { email: string; name?: string }) => ({
    email: l.email,
    name: l.name,
  }));
}

/**
 * order_form_submissions テーブルからメールを収集
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function collectFromOrderForms(
  supabase: any,
  userId: string,
  formIds?: string[]
): Promise<{ email: string; name?: string }[]> {
  // ユーザーの申し込みフォームIDを取得
  let targetFormIds = formIds;
  if (!targetFormIds || targetFormIds.length === 0) {
    const { data: forms } = await supabase
      .from('order_forms')
      .select('id')
      .eq('user_id', userId);
    targetFormIds = forms?.map((f: { id: string }) => f.id) || [];
  }

  if (targetFormIds.length === 0) return [];

  const { data } = await supabase
    .from('order_form_submissions')
    .select('email, name')
    .in('form_id', targetFormIds);

  return (data || []).map((s: { email: string; name?: string }) => ({
    email: s.email,
    name: s.name,
  }));
}
