import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * GET: フォーム詳細（フィールド込み）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.nextUrl.searchParams.get('userId');
    const isPublic = request.nextUrl.searchParams.get('public') === 'true';

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    let query = supabase
      .from('order_forms')
      .select('*, order_form_fields(*)');

    // slug or UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    if (isUUID) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    if (!isPublic && userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.eq('status', 'published');
    }

    const { data, error } = await query.single();

    if (error || !data) {
      return NextResponse.json({ error: 'フォームが見つかりません' }, { status: 404 });
    }

    // フィールドをorder_indexでソート
    if (data.order_form_fields) {
      data.order_form_fields.sort((a: any, b: any) => a.order_index - b.order_index);
    }

    return NextResponse.json({ form: data });
  } catch (error) {
    console.error('[Order Form Detail] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH: フォーム更新（フィールド含む）
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { userId, title, description, price, paymentType, paymentProvider, stripePriceId, successMessage, status, fields, replyEmailEnabled, replyEmailSubject, replyEmailBody, notifyOwner, notifyEmails, notifyEmailSubject, notifyEmailBody, designLayout, designColor, ctaButton, titleColor, descriptionColor, descriptionSize, emailFooterName, paymentEmailEnabled, paymentEmailSubject, paymentEmailBody, eventDate, reminder1dayEnabled, reminderSameDayEnabled, reminderEmailSubject, reminderEmailBody } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // 基本カラム（初期スキーマ）
    const baseData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (title !== undefined) baseData.title = title;
    if (description !== undefined) baseData.description = description;
    if (price !== undefined) baseData.price = price;
    if (paymentType !== undefined) baseData.payment_type = paymentType;
    if (paymentProvider !== undefined) baseData.payment_provider = paymentProvider;
    if (stripePriceId !== undefined) baseData.stripe_price_id = stripePriceId;
    if (successMessage !== undefined) baseData.success_message = successMessage;
    if (status !== undefined) baseData.status = status;

    // 拡張カラム（後から追加されたマイグレーション）
    const extendedData: Record<string, any> = {};
    if (replyEmailEnabled !== undefined) extendedData.reply_email_enabled = replyEmailEnabled;
    if (replyEmailSubject !== undefined) extendedData.reply_email_subject = replyEmailSubject;
    if (replyEmailBody !== undefined) extendedData.reply_email_body = replyEmailBody;
    if (notifyOwner !== undefined) extendedData.notify_owner = notifyOwner;
    if (notifyEmails !== undefined) extendedData.notify_emails = notifyEmails;
    if (designLayout !== undefined) extendedData.design_layout = designLayout;
    if (designColor !== undefined) extendedData.design_color = designColor;
    if (notifyEmailSubject !== undefined) extendedData.notify_email_subject = notifyEmailSubject;
    if (notifyEmailBody !== undefined) extendedData.notify_email_body = notifyEmailBody;
    if (ctaButton !== undefined) extendedData.cta_button = ctaButton;
    if (titleColor !== undefined) extendedData.title_color = titleColor || null;
    if (descriptionColor !== undefined) extendedData.description_color = descriptionColor || null;
    if (descriptionSize !== undefined) extendedData.description_size = descriptionSize || 'sm';
    if (emailFooterName !== undefined) extendedData.email_footer_name = emailFooterName || null;
    if (paymentEmailEnabled !== undefined) extendedData.payment_email_enabled = paymentEmailEnabled;
    if (paymentEmailSubject !== undefined) extendedData.payment_email_subject = paymentEmailSubject || null;
    if (paymentEmailBody !== undefined) extendedData.payment_email_body = paymentEmailBody || null;
    if (eventDate !== undefined) extendedData.event_date = eventDate || null;
    if (reminder1dayEnabled !== undefined) extendedData.reminder_1day_enabled = reminder1dayEnabled;
    if (reminderSameDayEnabled !== undefined) extendedData.reminder_same_day_enabled = reminderSameDayEnabled;
    if (reminderEmailSubject !== undefined) extendedData.reminder_email_subject = reminderEmailSubject || null;
    if (reminderEmailBody !== undefined) extendedData.reminder_email_body = reminderEmailBody || null;

    // まず全カラムで更新を試行
    let { data, error } = await supabase
      .from('order_forms')
      .update({ ...baseData, ...extendedData })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    // 拡張カラムが原因でエラーの場合、基本カラムのみで再試行
    if (error && Object.keys(extendedData).length > 0) {
      console.warn('[Order Form Update] Retrying with base fields only:', error.message);
      ({ data, error } = await supabase
        .from('order_forms')
        .update(baseData)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single());
    }

    if (error) {
      console.error('[Order Form Update] Error:', error);
      return NextResponse.json({ error: '更新に失敗しました' }, { status: 500 });
    }

    // フィールドの更新（全入れ替え方式）
    if (fields !== undefined) {
      // 既存フィールドを削除
      await supabase.from('order_form_fields').delete().eq('form_id', id);

      // 新しいフィールドを挿入
      if (fields.length > 0) {
        const fieldInserts = fields.map((f: any, i: number) => ({
          form_id: id,
          field_type: f.field_type || f.fieldType,
          label: f.label,
          placeholder: f.placeholder || null,
          required: f.required || false,
          options: f.options || null,
          order_index: i,
        }));

        await supabase.from('order_form_fields').insert(fieldInserts);
      }
    }

    return NextResponse.json({ form: data });
  } catch (error) {
    console.error('[Order Form Update] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * DELETE: フォーム削除
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { error } = await supabase
      .from('order_forms')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      console.error('[Order Form Delete] Error:', error);
      return NextResponse.json({ error: '削除に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Order Form Delete] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
