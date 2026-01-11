import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { triggerGamificationEvent, GamificationEventType } from '@/lib/gamification/events';

// サーバーサイドSupabaseクライアント
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request: Request) {
  try {
    const { userId, eventType, data } = await request.json();

    // バリデーション
    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
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















