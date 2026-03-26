import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { isValidEmail } from '@/lib/security/sanitize';
import { getAdminEmails } from '@/lib/constants';

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
    let subscriberSource = 'manual'; // newsletter_subscribers.source に記録する値

    if (source === 'leads' && contentType === 'bigfive_sample') {
      contacts = await collectFromBigfiveSampleLeads(supabase);
      subscriberSource = 'bigfive_sample';
    } else if (source === 'leads') {
      contacts = await collectFromLeads(supabase, userId, contentType);
      subscriberSource = contentType || 'quiz'; // 'quiz', 'entertainment_quiz', 'profile', 'business', 'webinar'
    } else if (source === 'survey') {
      contacts = await collectFromSurveys(supabase, userId);
      subscriberSource = 'survey';
    } else if (source === 'attendance') {
      contacts = await collectFromAttendance(supabase, userId);
      subscriberSource = 'attendance';
    } else if (source === 'contact_inquiries') {
      // 管理者のみ: お問い合わせメールをインポート
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId);
      const adminEmails = getAdminEmails();
      const isAdmin = authUser?.email && adminEmails.some(
        (e: string) => e.toLowerCase() === authUser.email!.toLowerCase()
      );
      if (!isAdmin) {
        return NextResponse.json({ error: '管理者のみ利用可能です' }, { status: 403 });
      }
      contacts = await collectFromContactInquiries(supabase);
      subscriberSource = 'contact_inquiries';
    } else if (source === 'order_forms') {
      contacts = await collectFromOrderForms(supabase, userId, formIds);
      subscriberSource = 'order_form';
    } else if (source === 'booking') {
      contacts = await collectFromBookings(supabase, userId);
      subscriberSource = 'booking';
    } else if (source === 'registered_users') {
      // 管理者のみ: 集客メーカー登録ユーザーをインポート
      const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId);
      const adminEmails = getAdminEmails();
      const isAdmin = authUser?.email && adminEmails.some(
        (e: string) => e.toLowerCase() === authUser.email!.toLowerCase()
      );
      if (!isAdmin) {
        return NextResponse.json({ error: '管理者のみ利用可能です' }, { status: 403 });
      }
      contacts = await collectRegisteredUsers(supabase);
      subscriberSource = 'registered_users';
    } else if (source === 'csv') {
      if (!Array.isArray(data)) {
        return NextResponse.json({ error: 'CSV data は配列で送信してください' }, { status: 400 });
      }
      contacts = data.filter((d: { email?: string }) => d.email && isValidEmail(d.email));
      subscriberSource = 'csv';
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

    // 既存購読者を取得して差分を計算（配信停止済みも含めて重複チェック）
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('email, status')
      .eq('list_id', id);

    const existingEmails = new Map<string, string>(
      (existing || []).map((s: { email: string; status: string }) => [s.email.toLowerCase(), s.status])
    );
    const newContacts = uniqueContacts.filter((c) => !existingEmails.has(c.email));
    const skippedUnsubscribed = uniqueContacts.filter((c) => existingEmails.get(c.email) === 'unsubscribed').length;
    const skipped = uniqueContacts.length - newContacts.length;

    if (newContacts.length === 0) {
      return NextResponse.json({ imported: 0, skipped, skippedUnsubscribed, total: uniqueContacts.length });
    }

    // バッチ upsert（100件ずつ）
    let imported = 0;
    let lastError: string | null = null;
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
        source: subscriberSource,
      }));

      const { data: inserted, error } = await supabase
        .from('newsletter_subscribers')
        .upsert(rows, { onConflict: 'list_id,email' })
        .select();

      if (error) {
        console.error('[Newsletter Import] Batch upsert error:', error);
        lastError = error.message;
        // source カラムが存在しない場合、sourceなしでリトライ
        if (error.message?.includes('source')) {
          const rowsWithoutSource = batch.map((c) => ({
            list_id: id,
            email: c.email,
            name: c.name || null,
            status: 'subscribed',
            subscribed_at: new Date().toISOString(),
            unsubscribed_at: null,
          }));
          const { data: retryInserted, error: retryError } = await supabase
            .from('newsletter_subscribers')
            .upsert(rowsWithoutSource, { onConflict: 'list_id,email' })
            .select();
          if (!retryError) {
            imported += retryInserted?.length || 0;
            lastError = null;
          } else {
            console.error('[Newsletter Import] Retry upsert error:', retryError);
            lastError = retryError.message;
          }
        }
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

    return NextResponse.json({
      imported,
      skipped,
      skippedUnsubscribed,
      total: uniqueContacts.length,
      ...(lastError && { error: lastError }),
    });
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
      .eq('user_id', userId)
      .eq('quiz_type', 'business');
    contentIds = [...contentIds, ...(quizzes?.map((q: { slug: string }) => q.slug) || [])];
  }

  if (!contentType || contentType === 'entertainment_quiz') {
    const { data: entQuizzes } = await supabase
      .from('quizzes')
      .select('slug')
      .eq('user_id', userId)
      .eq('quiz_type', 'entertainment');
    contentIds = [...contentIds, ...(entQuizzes?.map((q: { slug: string }) => q.slug) || [])];
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

  if (!contentType || contentType === 'webinar') {
    const { data: webinars } = await supabase
      .from('webinar_lps')
      .select('slug')
      .eq('user_id', userId);
    contentIds = [...contentIds, ...(webinars?.map((w: { slug: string }) => w.slug) || [])];
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

/**
 * bookings テーブルからゲストメールを収集
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function collectFromBookings(
  supabase: any,
  userId: string
): Promise<{ email: string; name?: string }[]> {
  // ユーザーの予約メニューIDを取得
  const { data: menus } = await supabase
    .from('booking_menus')
    .select('id')
    .eq('user_id', userId);

  const menuIds = menus?.map((m: { id: string }) => m.id) || [];
  if (menuIds.length === 0) return [];

  const { data } = await supabase
    .from('bookings')
    .select('guest_email, guest_name')
    .in('menu_id', menuIds)
    .not('guest_email', 'is', null)
    .neq('guest_email', '');

  return (data || []).map((b: { guest_email: string; guest_name?: string }) => ({
    email: b.guest_email,
    name: b.guest_name,
  }));
}

/**
 * Big Five サンプルDLリードからメールを収集（管理者専用）
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function collectFromBigfiveSampleLeads(
  supabase: any,
): Promise<{ email: string; name?: string }[]> {
  const { data } = await supabase
    .from('leads')
    .select('email, name')
    .eq('content_type', 'bigfive_sample');

  return (data || []).map((l: { email: string; name?: string }) => ({
    email: l.email,
    name: l.name,
  }));
}

/**
 * 集客メーカー登録ユーザー（auth.users）からメールを収集（管理者専用）
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function collectRegisteredUsers(
  supabase: any,
): Promise<{ email: string; name?: string }[]> {
  const { data: { users }, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 10000,
  });

  if (error || !users) return [];

  return users
    .filter((u: { email?: string; email_confirmed_at?: string }) =>
      u.email && u.email_confirmed_at
    )
    .map((u: { email: string; user_metadata?: { name?: string; full_name?: string } }) => ({
      email: u.email,
      name: u.user_metadata?.name || u.user_metadata?.full_name || undefined,
    }));
}

/**
 * survey_responses テーブルからメールを収集
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function collectFromSurveys(
  supabase: any,
  userId: string
): Promise<{ email: string; name?: string }[]> {
  // ユーザーのアンケートIDを取得
  const { data: surveys } = await supabase
    .from('surveys')
    .select('id')
    .eq('user_id', userId);

  const surveyIds = surveys?.map((s: { id: string }) => s.id) || [];
  if (surveyIds.length === 0) return [];

  const { data } = await supabase
    .from('survey_responses')
    .select('respondent_email, respondent_name')
    .in('survey_id', surveyIds)
    .not('respondent_email', 'is', null)
    .neq('respondent_email', '');

  return (data || []).map((r: { respondent_email: string; respondent_name?: string }) => ({
    email: r.respondent_email,
    name: r.respondent_name,
  }));
}

/**
 * attendance_responses テーブルからメールを収集
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function collectFromAttendance(
  supabase: any,
  userId: string
): Promise<{ email: string; name?: string }[]> {
  // ユーザーの出欠イベントIDを取得
  const { data: events } = await supabase
    .from('attendance_events')
    .select('id')
    .eq('user_id', userId);

  const eventIds = events?.map((e: { id: string }) => e.id) || [];
  if (eventIds.length === 0) return [];

  const { data } = await supabase
    .from('attendance_responses')
    .select('participant_email, participant_name')
    .in('event_id', eventIds)
    .not('participant_email', 'is', null)
    .neq('participant_email', '');

  return (data || []).map((r: { participant_email: string; participant_name?: string }) => ({
    email: r.participant_email,
    name: r.participant_name,
  }));
}

/**
 * contact_inquiries テーブルからメールを収集（管理者専用）
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function collectFromContactInquiries(
  supabase: any,
): Promise<{ email: string; name?: string }[]> {
  const { data } = await supabase
    .from('contact_inquiries')
    .select('email, name')
    .not('email', 'is', null)
    .neq('email', '');

  return (data || []).map((c: { email: string; name?: string }) => ({
    email: c.email,
    name: c.name,
  }));
}
