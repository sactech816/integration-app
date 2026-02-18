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

// GET: 出品一覧（検索・フィルタ対応）
// 公開一覧は認証不要。my=true の場合のみ認証必須。
export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceClient()!;
    const { searchParams } = new URL(request.url);

    const category = searchParams.get('category');
    const sellerId = searchParams.get('seller_id');
    const search = searchParams.get('search');
    const myListings = searchParams.get('my') === 'true';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 自分の出品一覧は認証必須
    const user = await getAuthUser(request);
    if (myListings && !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase.from('marketplace_listings').select('*', { count: 'exact' });

    if (myListings && user) {
      // 自分の出品一覧（全ステータス）
      query = query.eq('seller_id', user.id);
    } else {
      // 公開一覧（誰でも閲覧可能）
      query = query.eq('status', 'published');
    }

    if (category) query = query.eq('category', category);
    if (sellerId) query = query.eq('seller_id', sellerId);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

    query = query.order('sort_order', { ascending: false }).order('created_at', { ascending: false });
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    // 出品者プロフィールを取得
    const sellerIds = [...new Set((data || []).map(l => l.seller_id))];
    let profiles: Record<string, any> = {};
    if (sellerIds.length > 0) {
      const { data: profileData } = await supabase
        .from('marketplace_profiles')
        .select('*')
        .in('user_id', sellerIds);
      if (profileData) {
        profiles = Object.fromEntries(profileData.map(p => [p.user_id, p]));
      }
    }

    const listings = (data || []).map(l => ({
      ...l,
      seller_profile: profiles[l.seller_id] || null,
    }));

    return NextResponse.json({
      listings,
      total: count || 0,
      page,
      limit,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: 新規出品
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getServiceClient()!;

    // プロフィール存在チェック
    const { data: profile } = await supabase
      .from('marketplace_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: '先にクリエイタープロフィールを作成してください' }, { status: 400 });
    }

    const body = await request.json();
    const { data, error } = await supabase
      .from('marketplace_listings')
      .insert({
        seller_id: user.id,
        category: body.category,
        is_tool_linked: body.is_tool_linked || false,
        linked_service_type: body.linked_service_type || null,
        title: body.title,
        description: body.description,
        thumbnail_url: body.thumbnail_url || null,
        price_min: body.price_min,
        price_max: body.price_max || null,
        price_type: body.price_type || 'fixed',
        delivery_days: body.delivery_days || null,
        status: body.status || 'published',
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ listing: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
