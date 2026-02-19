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

// GET: 案件詳細
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const supabase = getServiceClient()!;

    const { data: order, error } = await supabase
      .from('marketplace_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 権限チェック
    if (order.buyer_id !== user.id && order.seller_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 出品・プロフィール・レビューを並列取得
    const [listingResult, sellerProfileResult, buyerProfileResult, reviewResult] = await Promise.all([
      order.listing_id
        ? supabase.from('marketplace_listings').select('id, title, category, description, thumbnail_url, price_min, price_max, price_type, delivery_days, status').eq('id', order.listing_id).single()
        : Promise.resolve({ data: null }),
      supabase.from('marketplace_profiles').select('user_id, display_name, bio, avatar_url, avg_rating, total_reviews, response_time').eq('user_id', order.seller_id).single(),
      supabase.from('marketplace_profiles').select('user_id, display_name, avatar_url').eq('user_id', order.buyer_id).single(),
      supabase.from('marketplace_reviews').select('id, rating, comment, created_at').eq('order_id', id).eq('reviewer_id', user.id).single(),
    ]);

    const listing = listingResult.data;
    const sellerProfile = sellerProfileResult.data;
    const buyerProfile = buyerProfileResult.data;
    const review = reviewResult.data;

    return NextResponse.json({
      order: {
        ...order,
        listing,
        seller_profile: sellerProfile || null,
        buyer_profile: buyerProfile || null,
        is_buyer: order.buyer_id === user.id,
      },
      review: review || null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: ステータス更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const supabase = getServiceClient()!;
    const body = await request.json();

    const { data: order } = await supabase
      .from('marketplace_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.buyer_id !== user.id && order.seller_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const newStatus = body.status;
    const isBuyer = order.buyer_id === user.id;
    const isSeller = order.seller_id === user.id;

    // ステータス遷移バリデーション
    const validTransitions: Record<string, { allowed: string[]; by: 'buyer' | 'seller' | 'both' }> = {
      requested: { allowed: ['accepted', 'cancelled'], by: 'both' },
      accepted: { allowed: ['in_progress', 'cancelled'], by: 'both' },
      in_progress: { allowed: ['delivered', 'cancelled'], by: 'seller' },
      delivered: { allowed: ['completed', 'in_progress'], by: 'buyer' },
    };

    const currentTransition = validTransitions[order.status];
    if (!currentTransition || !currentTransition.allowed.includes(newStatus)) {
      return NextResponse.json({ error: `${order.status} から ${newStatus} への変更はできません` }, { status: 400 });
    }

    if (currentTransition.by === 'buyer' && !isBuyer) {
      return NextResponse.json({ error: '依頼者のみ操作できます' }, { status: 403 });
    }
    if (currentTransition.by === 'seller' && !isSeller) {
      return NextResponse.json({ error: '出品者のみ操作できます' }, { status: 403 });
    }

    const updateData: Record<string, any> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    // タイムスタンプ設定
    const timestampMap: Record<string, string> = {
      accepted: 'accepted_at',
      delivered: 'delivered_at',
      completed: 'completed_at',
      cancelled: 'cancelled_at',
    };
    if (timestampMap[newStatus]) {
      updateData[timestampMap[newStatus]] = new Date().toISOString();
    }

    // 完了時にorder_countを更新
    if (newStatus === 'completed' && order.listing_id) {
      const { data: currentListing } = await supabase
        .from('marketplace_listings')
        .select('order_count')
        .eq('id', order.listing_id)
        .single();

      if (currentListing) {
        await supabase
          .from('marketplace_listings')
          .update({ order_count: (currentListing.order_count || 0) + 1 })
          .eq('id', order.listing_id);
      }

      // seller profile total_orders も更新
      const { data: profile } = await supabase
        .from('marketplace_profiles')
        .select('total_orders')
        .eq('user_id', order.seller_id)
        .single();

      if (profile) {
        await supabase
          .from('marketplace_profiles')
          .update({ total_orders: (profile.total_orders || 0) + 1 })
          .eq('user_id', order.seller_id);
      }
    }

    const { data, error } = await supabase
      .from('marketplace_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ order: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
