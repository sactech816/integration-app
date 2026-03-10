import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

// GET: クリエイター一覧（公開・認証不要）
export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceClient()!;
    const { searchParams } = new URL(request.url);

    const userId = searchParams.get('user_id');
    const tool = searchParams.get('tool');
    const search = searchParams.get('search');
    const skill = searchParams.get('skill');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // 単一クリエイター取得（user_id指定）
    if (userId) {
      const { data: profile, error } = await supabase
        .from('marketplace_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error || !profile) {
        return NextResponse.json({ error: 'Creator not found' }, { status: 404 });
      }

      const res = NextResponse.json({ creator: profile });
      res.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
      return res;
    }

    let query = supabase
      .from('marketplace_profiles')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    if (tool) {
      query = query.contains('supported_tools', [tool]);
    }

    if (skill) {
      query = query.contains('skills', [skill]);
    }

    if (search) {
      query = query.or(`display_name.ilike.%${search}%,bio.ilike.%${search}%`);
    }

    query = query
      .order('total_reviews', { ascending: false })
      .order('total_orders', { ascending: false })
      .order('created_at', { ascending: false });

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    // 各クリエイターの公開出品数を取得
    const userIds = (data || []).map((p) => p.user_id);
    let listingCounts: Record<string, number> = {};

    if (userIds.length > 0) {
      const { data: countData, error: countError } = await supabase
        .from('marketplace_listings')
        .select('seller_id', { count: 'exact', head: false })
        .eq('status', 'published')
        .in('seller_id', userIds);

      if (!countError && countData) {
        // seller_id ごとにカウント
        for (const row of countData) {
          listingCounts[row.seller_id] = (listingCounts[row.seller_id] || 0) + 1;
        }
      }
    }

    const creators = (data || []).map((p) => ({
      ...p,
      listing_count: listingCounts[p.user_id] || 0,
    }));

    const res = NextResponse.json({
      creators,
      total: count || 0,
      page,
      limit,
    });
    res.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60');
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
