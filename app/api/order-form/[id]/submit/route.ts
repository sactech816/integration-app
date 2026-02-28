import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidEmail } from '@/lib/security/sanitize';
import { rateLimit, createRateLimitResponse } from '@/lib/security/rate-limit';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * POST: 申し込みフォーム送信
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimitResult = rateLimit(request, 'form');
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetIn);
    }

    const { id } = await params;
    const { email, name, fieldsData } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: '有効なメールアドレスを入力してください' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // フォーム取得
    const { data: form } = await supabase
      .from('order_forms')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .single();

    if (!form) {
      return NextResponse.json({ error: 'フォームが見つかりません' }, { status: 404 });
    }

    // payment_status判定
    const isFree = form.payment_type === 'free' || form.price === 0;
    const paymentStatus = isFree ? 'free' : 'pending';

    // submission作成
    const { data: submission, error } = await supabase
      .from('order_form_submissions')
      .insert({
        form_id: id,
        email,
        name: name || null,
        fields_data: fieldsData || {},
        payment_status: paymentStatus,
        amount_paid: isFree ? 0 : form.price,
      })
      .select()
      .single();

    if (error) {
      console.error('[Order Form Submit] Error:', error);
      return NextResponse.json({ error: '送信に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({
      submission,
      requiresPayment: !isFree,
      paymentType: form.payment_type,
      paymentProvider: form.payment_provider,
      price: form.price,
      formSlug: form.slug,
    });
  } catch (error) {
    console.error('[Order Form Submit] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
