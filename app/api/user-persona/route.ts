import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { TABLES } from '@/lib/supabase';
import { isValidPersonaId } from '@/lib/persona-config';

// GET: ユーザーのペルソナ情報を取得
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from(TABLES.USER_PERSONA)
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found (未設定の場合)
      return NextResponse.json({ error: 'データ取得エラー' }, { status: 500 });
    }

    return NextResponse.json({ data: data ?? null });
  } catch {
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}

// POST: ペルソナを初回設定
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const { persona_id, show_all_tools } = body;

    if (persona_id && !isValidPersonaId(persona_id)) {
      return NextResponse.json({ error: '無効なペルソナIDです' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from(TABLES.USER_PERSONA)
      .upsert({
        user_id: user.id,
        persona_id: persona_id || 'startup',
        enabled_tool_ids: [],
        show_all_tools: show_all_tools ?? false,
        persona_selected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'ペルソナ設定エラー' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}

// PATCH: ペルソナ情報を更新
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

    // ペルソナ変更
    if (body.persona_id !== undefined) {
      if (!isValidPersonaId(body.persona_id)) {
        return NextResponse.json({ error: '無効なペルソナIDです' }, { status: 400 });
      }
      updates.persona_id = body.persona_id;
      updates.persona_selected_at = new Date().toISOString();
    }

    // ツール追加/削除
    if (body.enabled_tool_ids !== undefined) {
      if (!Array.isArray(body.enabled_tool_ids)) {
        return NextResponse.json({ error: 'enabled_tool_idsは配列で指定してください' }, { status: 400 });
      }
      updates.enabled_tool_ids = body.enabled_tool_ids;
    }

    // 全ツール表示切替
    if (body.show_all_tools !== undefined) {
      updates.show_all_tools = !!body.show_all_tools;
    }

    const { data, error } = await supabase
      .from(TABLES.USER_PERSONA)
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: '更新エラー' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}
