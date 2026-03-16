import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase not configured');
  return createClient(url, key);
}

/** 全商品を取得 */
export async function GET() {
  try {
    const supabase = getAdminClient();

    const { data, error } = await supabase
      .from('feature_products')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/** 商品を一括更新 */
export async function PUT(request: Request) {
  try {
    const supabase = getAdminClient();
    const body = await request.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Request body must be an array' },
        { status: 400 }
      );
    }

    const records = body.map((item: {
      id: string;
      name: string;
      description?: string;
      category: string;
      price: number;
      duration_type: string;
      duration_days?: number;
      usage_count?: number;
      is_active: boolean;
      sort_order?: number;
    }) => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      category: item.category,
      price: item.price,
      duration_type: item.duration_type,
      duration_days: item.duration_days || null,
      usage_count: item.usage_count || null,
      is_active: item.is_active,
      sort_order: item.sort_order ?? 0,
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from('feature_products')
      .upsert(records, { onConflict: 'id' })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

/** 新規商品を追加 */
export async function POST(request: Request) {
  try {
    const supabase = getAdminClient();
    const item = await request.json();

    if (!item.id || !item.name || item.price === undefined) {
      return NextResponse.json(
        { error: 'id, name, price are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('feature_products')
      .insert({
        id: item.id,
        name: item.name,
        description: item.description || '',
        category: item.category || 'general',
        price: item.price,
        duration_type: item.duration_type || 'permanent',
        duration_days: item.duration_days || null,
        usage_count: item.usage_count || null,
        is_active: item.is_active ?? true,
        sort_order: item.sort_order ?? 0,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
