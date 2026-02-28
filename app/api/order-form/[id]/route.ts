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
    const { userId, title, description, price, paymentType, paymentProvider, stripePriceId, univapayConfig, successMessage, status, fields } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // フォーム本体を更新
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (paymentType !== undefined) updateData.payment_type = paymentType;
    if (paymentProvider !== undefined) updateData.payment_provider = paymentProvider;
    if (stripePriceId !== undefined) updateData.stripe_price_id = stripePriceId;
    if (univapayConfig !== undefined) updateData.univapay_config = univapayConfig;
    if (successMessage !== undefined) updateData.success_message = successMessage;
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabase
      .from('order_forms')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

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
