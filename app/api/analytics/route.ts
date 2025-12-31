import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// サーバーサイド用Supabaseクライアント
function getSupabaseServer() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl) return null;
  
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key) return null;
  
  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

/**
 * POST: アナリティクスイベントを記録（sendBeacon用）
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseServer();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    // リクエストボディを取得
    let body;
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else {
      // sendBeacon はtext/plainで送信されることがある
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
      }
    }

    const { contentId, contentType: cType, eventType, eventData } = body;

    // バリデーション
    if (!contentId || !cType || !eventType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // デモページは記録しない
    if (contentId === 'demo') {
      return NextResponse.json({ success: true });
    }

    // イベントを記録
    const { error } = await supabase
      .from('analytics')
      .insert([{
        profile_id: contentId,  // DBカラム名はprofile_id（プロフィール/ビジネス共通）
        content_type: cType,
        event_type: eventType,
        event_data: eventData || {},
        created_at: new Date().toISOString()
      }]);

    if (error) {
      console.error('[Analytics API] Insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Analytics API] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * OPTIONS: CORSプリフライト対応
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}






















































