import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { triggerGamificationEvent, GamificationEventType } from '@/lib/gamification/events';
import { verifyOrigin, createOriginErrorResponse } from '@/lib/security/origin';
import { rateLimit, createRateLimitResponse } from '@/lib/security/rate-limit';

// サーバーサイドSupabaseクライアント
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// 認証済みユーザーのIDを取得
async function getAuthenticatedUserId(): Promise<string | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return null;

    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // 読み取り専用
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // Origin検証
    if (!verifyOrigin(request)) {
      console.warn('[Gamification API] Invalid origin');
      return createOriginErrorResponse();
    }

    // レート制限
    const rateLimitResult = rateLimit(request, 'api');
    if (!rateLimitResult.success) {
      return createRateLimitResponse(rateLimitResult.resetIn);
    }

    const { userId, eventType, data } = await request.json();

    // バリデーション
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // セキュリティ強化: 認証済みユーザーの場合、自分のIDのみ許可
    const authenticatedUserId = await getAuthenticatedUserId();
    if (authenticatedUserId && authenticatedUserId !== userId) {
      console.warn('[Gamification API] User ID mismatch:', { authenticated: authenticatedUserId, requested: userId });
      return NextResponse.json(
        { error: 'Unauthorized: User ID mismatch' },
        { status: 403 }
      );
    }

    if (!eventType) {
      return NextResponse.json(
        { error: 'eventType is required' },
        { status: 400 }
      );
    }

    // 有効なイベントタイプかチェック
    const validEventTypes: GamificationEventType[] = [
      'login',
      'quiz_play',
      'quiz_create',
      'quiz_complete',
      'profile_view',
      'profile_create',
      'business_create',
      'gacha_play',
      'share',
      'stamp_get',
      'survey_create',
      'survey_answer',
    ];

    if (!validEventTypes.includes(eventType)) {
      return NextResponse.json(
        { error: `Invalid eventType: ${eventType}` },
        { status: 400 }
      );
    }

    // イベント発火
    const result = await triggerGamificationEvent(userId, eventType as GamificationEventType, data);

    return NextResponse.json({
      success: result.success,
      missionUpdated: result.missionUpdated,
      missionCompleted: result.missionCompleted,
      stampAcquired: result.stampAcquired,
      pointsEarned: result.pointsEarned,
      errors: result.errors,
    });
  } catch (error) {
    console.error('Gamification trigger error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
























