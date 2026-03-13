/**
 * コンシェルジュメーカー 設定CRUD API
 * GET  /api/concierge/configs         — 自分の設定一覧
 * GET  /api/concierge/configs?id=xxx  — 特定の設定取得
 * POST /api/concierge/configs         — 新規作成
 * PUT  /api/concierge/configs         — 更新
 * DELETE /api/concierge/configs?id=xxx — 削除
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';

function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < 8; i++) {
    slug += chars[Math.floor(Math.random() * chars.length)];
  }
  return `c-${slug}`;
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');

    if (id) {
      const { data, error } = await supabase
        .from('concierge_configs')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: '設定が見つかりません' }, { status: 404 });
      }
      return NextResponse.json(data);
    }

    const { data: configs } = await supabase
      .from('concierge_configs')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    return NextResponse.json(configs || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const body = await request.json();
    const slug = generateSlug();

    const { data, error } = await supabase
      .from('concierge_configs')
      .insert({
        user_id: user.id,
        name: body.name || 'アシスタント',
        greeting: body.greeting || 'こんにちは！何かお手伝いできることはありますか？',
        personality: body.personality || '',
        knowledge_text: body.knowledge_text || '',
        faq_items: body.faq_items || [],
        avatar_style: body.avatar_style || { type: 'default', primaryColor: '#3B82F6' },
        design: body.design || { position: 'bottom-right', bubbleSize: 56, headerColor: '#3B82F6', fontFamily: 'system' },
        settings: body.settings || { dailyLimit: 50, maxTokens: 512, model: 'claude-haiku-4-5-20251001' },
        slug,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'idが必要です' }, { status: 400 });
    }

    const updateData: any = { updated_at: new Date().toISOString() };
    const allowedFields = [
      'name', 'greeting', 'personality', 'knowledge_text',
      'faq_items', 'avatar_style', 'design', 'settings', 'is_published',
    ];
    allowedFields.forEach(field => {
      if (body[field] !== undefined) updateData[field] = body[field];
    });

    const { data, error } = await supabase
      .from('concierge_configs')
      .update(updateData)
      .eq('id', body.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
    }

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'idが必要です' }, { status: 400 });
    }

    const { error } = await supabase
      .from('concierge_configs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
