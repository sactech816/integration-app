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

// GET: プロフィール取得（自分 or seller_id指定）
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getServiceClient()!;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id') || user.id;

    const { data, error } = await supabase
      .from('marketplace_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return NextResponse.json({ profile: data || null });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: プロフィール作成
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getServiceClient()!;
    const body = await request.json();

    const { data, error } = await supabase
      .from('marketplace_profiles')
      .insert({
        user_id: user.id,
        display_name: body.display_name,
        bio: body.bio || null,
        avatar_url: body.avatar_url || null,
        skills: body.skills || [],
        portfolio_urls: body.portfolio_urls || [],
        response_time: body.response_time || null,
        supported_tools: body.supported_tools || [],
        kindle_subtypes: body.kindle_subtypes || [],
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ profile: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PUT: プロフィール更新
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabase = getServiceClient()!;
    const body = await request.json();

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    const allowedFields = ['display_name', 'bio', 'avatar_url', 'skills', 'portfolio_urls', 'response_time', 'supported_tools', 'kindle_subtypes', 'is_active'];
    for (const field of allowedFields) {
      if (body[field] !== undefined) updateData[field] = body[field];
    }

    const { data, error } = await supabase
      .from('marketplace_profiles')
      .update(updateData)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ profile: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
