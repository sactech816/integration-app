import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

async function getAuthUser(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) return null;
  const supabase = getServiceClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser(token);
  return user;
}

// GET: レビュー一覧（seller_id指定）
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getServiceClient()!;
    const { searchParams } = new URL(request.url);
    const sellerId = searchParams.get('seller_id');

    if (!sellerId) {
      return NextResponse.json({ error: 'seller_id is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('marketplace_reviews')
      .select('*')
      .eq('seller_id', sellerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ reviews: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: レビュー投稿
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getServiceClient()!;
    const body = await request.json();

    // 案件の存在と完了状態を確認
    const { data: order } = await supabase
      .from('marketplace_orders')
      .select('*')
      .eq('id', body.order_id)
      .single();

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.buyer_id !== user.id) {
      return NextResponse.json({ error: '依頼者のみレビューできます' }, { status: 403 });
    }
    if (order.status !== 'completed') {
      return NextResponse.json({ error: '完了済みの案件のみレビューできます' }, { status: 400 });
    }

    // 重複チェック
    const { data: existing } = await supabase
      .from('marketplace_reviews')
      .select('id')
      .eq('order_id', body.order_id)
      .eq('reviewer_id', user.id)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'すでにレビュー済みです' }, { status: 400 });
    }

    const rating = Math.min(5, Math.max(1, parseInt(body.rating)));

    const { data, error } = await supabase
      .from('marketplace_reviews')
      .insert({
        order_id: body.order_id,
        reviewer_id: user.id,
        seller_id: order.seller_id,
        rating,
        comment: body.comment || null,
      })
      .select()
      .single();

    if (error) throw error;

    // 出品者の平均評価を更新
    const { data: allReviews } = await supabase
      .from('marketplace_reviews')
      .select('rating')
      .eq('seller_id', order.seller_id);

    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await supabase
        .from('marketplace_profiles')
        .update({
          avg_rating: Math.round(avg * 10) / 10,
          total_reviews: allReviews.length,
        })
        .eq('user_id', order.seller_id);
    }

    return NextResponse.json({ review: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
