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

// GET: 自分の案件一覧（購入 & 販売）
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getServiceClient()!;
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // 'buyer' | 'seller' | null(both)
    const status = searchParams.get('status');

    let query = supabase.from('marketplace_orders').select('*', { count: 'exact' });

    if (role === 'buyer') {
      query = query.eq('buyer_id', user.id);
    } else if (role === 'seller') {
      query = query.eq('seller_id', user.id);
    } else {
      query = query.or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
    }

    if (status) query = query.eq('status', status);

    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;
    if (error) throw error;

    // 出品情報とプロフィールを並列取得
    const listingIds = [...new Set((data || []).filter(o => o.listing_id).map(o => o.listing_id))];
    const userIds = [...new Set((data || []).flatMap(o => [o.buyer_id, o.seller_id]))];

    let listings: Record<string, any> = {};
    let profiles: Record<string, any> = {};

    const [listingResult, profileResult] = await Promise.all([
      listingIds.length > 0
        ? supabase.from('marketplace_listings').select('id, title, category, thumbnail_url').in('id', listingIds)
        : Promise.resolve({ data: null }),
      userIds.length > 0
        ? supabase.from('marketplace_profiles').select('user_id, display_name, avatar_url').in('user_id', userIds)
        : Promise.resolve({ data: null }),
    ]);

    if (listingResult.data) {
      listings = Object.fromEntries(listingResult.data.map((l: any) => [l.id, l]));
    }
    if (profileResult.data) {
      profiles = Object.fromEntries(profileResult.data.map((p: any) => [p.user_id, p]));
    }

    const orders = (data || []).map(o => ({
      ...o,
      listing: o.listing_id ? listings[o.listing_id] || null : null,
      seller_profile: profiles[o.seller_id] || null,
      buyer_profile: profiles[o.buyer_id] || null,
      is_buyer: o.buyer_id === user.id,
    }));

    return NextResponse.json({ orders, total: count || 0 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: 新規依頼
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getServiceClient()!;
    const body = await request.json();

    // 出品情報を取得して seller_id を確定
    const { data: listing } = await supabase
      .from('marketplace_listings')
      .select('id, seller_id, title')
      .eq('id', body.listing_id)
      .eq('status', 'published')
      .single();

    if (!listing) {
      return NextResponse.json({ error: 'サービスが見つかりません' }, { status: 404 });
    }

    if (listing.seller_id === user.id) {
      return NextResponse.json({ error: '自分のサービスには依頼できません' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('marketplace_orders')
      .insert({
        listing_id: listing.id,
        buyer_id: user.id,
        seller_id: listing.seller_id,
        title: body.title || listing.title,
        description: body.description || null,
        budget: body.budget || null,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ order: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
