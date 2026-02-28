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
    const { userId, title, description, price, paymentType, paymentProvider, stripePriceId, univapayConfig, successMessage } = body;

    if (!userId || !title) {
      return NextResponse.json({ error: 'userId と title は必須です' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // slug生成（タイトルからランダムな短いIDを付与）
    const slugBase = title
      .replace(/[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    const { data, error } = await supabase
      .from('order_forms')
      .insert({
        user_id: userId,
        title,
        slug,
        description: description || null,
        price: price || 0,
        currency: 'jpy',
        payment_type: paymentType || 'free',
        payment_provider: paymentProvider || null,
        stripe_price_id: stripePriceId || null,
        univapay_config: univapayConfig || null,
        success_message: successMessage || 'お申し込みありがとうございます。',
        status: 'draft',
      })
      .select()
      .single();

    if (error) {
      console.error('[Order Form] Insert error:', error);
      return NextResponse.json({ error: 'フォーム作成に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({ form: data });
  } catch (error) {
    console.error('[Order Form] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
