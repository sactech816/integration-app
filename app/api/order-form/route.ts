import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * GET: ユーザーのフォーム一覧
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { data, error } = await supabase
      .from('order_forms')
      .select(`
        *,
        order_form_submissions(count)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Order Form] Error:', error);
      return NextResponse.json({ error: 'フォーム一覧の取得に失敗しました' }, { status: 500 });
    }

    const forms = (data || []).map((form: any) => ({
      ...form,
      submission_count: form.order_form_submissions?.[0]?.count || 0,
      order_form_submissions: undefined,
    }));

    return NextResponse.json({ forms });
  } catch (error) {
    console.error('[Order Form] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST: 新しいフォーム作成
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, title, description, price, paymentType, paymentProvider, stripePriceId, successMessage, replyEmailEnabled, replyEmailSubject, replyEmailBody, notifyOwner, notifyEmails, notifyEmailSubject, notifyEmailBody, designLayout, designColor, ctaButton, fields } = body;

    if (!userId || !title) {
      return NextResponse.json({ error: 'userId と title は必須です' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // slug生成（ASCII文字のみ + タイムスタンプ）
    const slugBase = title
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30);
    const slug = slugBase ? `${slugBase}-${Date.now().toString(36)}` : `form-${Date.now().toString(36)}`;

    // 基本カラム（初期スキーマ）
    const baseData: Record<string, any> = {
        user_id: userId,
        title,
        slug,
        description: description || null,
        price: price || 0,
        currency: 'jpy',
        payment_type: paymentType || 'free',
        payment_provider: paymentProvider || null,
        stripe_price_id: stripePriceId || null,
        success_message: successMessage || 'お申し込みありがとうございます。',
        status: 'published',
    };
    // 拡張カラム（後から追加されたマイグレーション）
    const extendedData: Record<string, any> = {
        reply_email_enabled: replyEmailEnabled !== undefined ? replyEmailEnabled : true,
        reply_email_subject: replyEmailSubject || 'お申し込みありがとうございます',
        reply_email_body: replyEmailBody || null,
        notify_owner: notifyOwner !== undefined ? notifyOwner : true,
        notify_emails: notifyEmails || null,
        design_layout: designLayout || 'standard',
        design_color: designColor || 'emerald',
    };
    if (notifyEmailSubject) extendedData.notify_email_subject = notifyEmailSubject;
    if (notifyEmailBody) extendedData.notify_email_body = notifyEmailBody;
    if (ctaButton) extendedData.cta_button = ctaButton;

    // まず全カラムで挿入を試行
    let { data, error } = await supabase
      .from('order_forms')
      .insert({ ...baseData, ...extendedData })
      .select()
      .single();

    // 拡張カラムが原因でエラーの場合、基本カラムのみで再試行
    if (error) {
      console.warn('[Order Form] Retrying with base fields only:', error.message);
      ({ data, error } = await supabase
        .from('order_forms')
        .insert(baseData)
        .select()
        .single());
    }

    if (error) {
      console.error('[Order Form] Insert error:', error);
      return NextResponse.json({ error: `フォーム作成に失敗しました: ${error.message}` }, { status: 500 });
    }

    // フィールドの保存
    if (data && fields && fields.length > 0) {
      const fieldInserts = fields.map((f: any, i: number) => ({
        form_id: data.id,
        field_type: f.field_type || f.fieldType,
        label: f.label,
        placeholder: f.placeholder || null,
        required: f.required || false,
        options: f.options || null,
        order_index: i,
      }));

      const { error: fieldError } = await supabase.from('order_form_fields').insert(fieldInserts);
      if (fieldError) {
        console.error('[Order Form] Field insert error:', fieldError);
      }
    }

    return NextResponse.json({ form: data });
  } catch (error) {
    console.error('[Order Form] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
