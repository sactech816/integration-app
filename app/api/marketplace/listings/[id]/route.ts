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

// GET: 出品詳細（認証不要 — 公開サービスは誰でも閲覧可能）
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getServiceClient()!;

    const { data: listing, error } = await supabase
      .from('marketplace_listings')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // 出品者プロフィール取得
    const { data: profile } = await supabase
      .from('marketplace_profiles')
      .select('*')
      .eq('user_id', listing.seller_id)
      .single();

    // レビュー取得
    const { data: reviews } = await supabase
      .from('marketplace_reviews')
      .select('*')
      .eq('seller_id', listing.seller_id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({
      listing: { ...listing, seller_profile: profile || null },
      reviews: reviews || [],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: 出品更新
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

    // 所有権チェック
    const { data: existing } = await supabase
      .from('marketplace_listings')
      .select('seller_id')
      .eq('id', id)
      .single();

    if (!existing || existing.seller_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    const allowedFields = [
      'category', 'is_tool_linked', 'linked_service_type', 'title',
      'description', 'thumbnail_url', 'price_min', 'price_max',
      'price_type', 'delivery_days', 'status',
    ];
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    const { data, error } = await supabase
      .from('marketplace_listings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ listing: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE: 出品削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const supabase = getServiceClient()!;

    const { data: existing } = await supabase
      .from('marketplace_listings')
      .select('seller_id')
      .eq('id', id)
      .single();

    if (!existing || existing.seller_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabase
      .from('marketplace_listings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
