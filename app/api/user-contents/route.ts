import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { LinkableContentType, UserContentItem } from '@/lib/content-links';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ユーザーの作成済みコンテンツを全ツールから一括取得
// ?userId=xxx            — 必須
// ?types=quiz,profile    — カンマ区切りでフィルタ（省略で全取得）
// ?category=page         — カテゴリでフィルタ
// ?exclude=funnel        — 特定タイプを除外（自分自身のツールを除外する用途）
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const typesParam = req.nextUrl.searchParams.get('types');
  const categoryParam = req.nextUrl.searchParams.get('category');
  const excludeParam = req.nextUrl.searchParams.get('exclude');

  // カテゴリ→タイプ のマッピング
  const categoryTypes: Record<string, LinkableContentType[]> = {
    page: ['profile', 'business', 'webinar', 'onboarding'],
    quiz: ['quiz', 'entertainment_quiz'],
    writing: ['salesletter', 'thumbnail', 'sns-post'],
    marketing: ['booking', 'attendance', 'survey', 'newsletter', 'funnel'],
    monetization: ['order-form', 'gamification'],
  };

  // 取得するタイプを決定
  let targetTypes: LinkableContentType[];
  if (typesParam) {
    targetTypes = typesParam.split(',').map((t) => t.trim()) as LinkableContentType[];
  } else if (categoryParam && categoryTypes[categoryParam]) {
    targetTypes = categoryTypes[categoryParam];
  } else {
    targetTypes = Object.values(categoryTypes).flat();
  }

  // 除外
  if (excludeParam) {
    const excludeList = excludeParam.split(',').map((t) => t.trim());
    targetTypes = targetTypes.filter((t) => !excludeList.includes(t));
  }

  // 各タイプ用のクエリを構築
  const queryMap: Record<string, { query: any; type: LinkableContentType }> = {};

  if (targetTypes.includes('profile')) {
    queryMap.profile = {
      type: 'profile',
      query: supabaseAdmin
        .from('profiles')
        .select('id, slug, nickname, content')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    };
  }
  if (targetTypes.includes('business')) {
    queryMap.business = {
      type: 'business',
      query: supabaseAdmin
        .from('business_projects')
        .select('id, slug, nickname, content')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    };
  }
  if (targetTypes.includes('salesletter')) {
    queryMap.salesletter = {
      type: 'salesletter',
      query: supabaseAdmin
        .from('sales_letters')
        .select('id, slug, title')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    };
  }
  if (targetTypes.includes('quiz')) {
    queryMap.quiz = {
      type: 'quiz',
      query: supabaseAdmin
        .from('quizzes')
        .select('id, slug, title')
        .eq('user_id', userId)
        .neq('quiz_type', 'entertainment')
        .order('created_at', { ascending: false }),
    };
  }
  if (targetTypes.includes('entertainment_quiz')) {
    queryMap.entertainment_quiz = {
      type: 'entertainment_quiz',
      query: supabaseAdmin
        .from('quizzes')
        .select('id, slug, title')
        .eq('user_id', userId)
        .eq('quiz_type', 'entertainment')
        .order('created_at', { ascending: false }),
    };
  }
  if (targetTypes.includes('order-form')) {
    queryMap['order-form'] = {
      type: 'order-form',
      query: supabaseAdmin
        .from('order_forms')
        .select('id, slug, title')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    };
  }
  if (targetTypes.includes('newsletter')) {
    queryMap.newsletter = {
      type: 'newsletter',
      query: supabaseAdmin
        .from('newsletter_lists')
        .select('id, name')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    };
  }
  if (targetTypes.includes('booking')) {
    queryMap.booking = {
      type: 'booking',
      query: supabaseAdmin
        .from('booking_menus')
        .select('id, title')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    };
  }
  if (targetTypes.includes('survey')) {
    queryMap.survey = {
      type: 'survey',
      query: supabaseAdmin
        .from('surveys')
        .select('id, slug, title')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    };
  }
  if (targetTypes.includes('webinar')) {
    queryMap.webinar = {
      type: 'webinar',
      query: supabaseAdmin
        .from('webinar_lps')
        .select('id, slug, title')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    };
  }
  if (targetTypes.includes('attendance')) {
    queryMap.attendance = {
      type: 'attendance',
      query: supabaseAdmin
        .from('attendance_events')
        .select('id, title')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    };
  }
  if (targetTypes.includes('onboarding')) {
    queryMap.onboarding = {
      type: 'onboarding',
      query: supabaseAdmin
        .from('onboarding_modals')
        .select('id, slug, title')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    };
  }
  if (targetTypes.includes('gamification')) {
    queryMap.gamification = {
      type: 'gamification',
      query: supabaseAdmin
        .from('gamification_campaigns')
        .select('id, title')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false }),
    };
  }
  if (targetTypes.includes('sns-post')) {
    queryMap['sns-post'] = {
      type: 'sns-post',
      query: supabaseAdmin
        .from('sns_posts')
        .select('id, slug, title')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    };
  }
  if (targetTypes.includes('thumbnail')) {
    queryMap.thumbnail = {
      type: 'thumbnail',
      query: supabaseAdmin
        .from('thumbnails')
        .select('id, slug, title')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    };
  }
  if (targetTypes.includes('funnel')) {
    queryMap.funnel = {
      type: 'funnel',
      query: supabaseAdmin
        .from('funnels')
        .select('id, slug, name')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    };
  }
  if (targetTypes.includes('site')) {
    queryMap['site'] = {
      type: 'site',
      query: supabaseAdmin
        .from('sites')
        .select('id, slug, title')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    };
  }

  // 全クエリを並列実行
  const entries = Object.entries(queryMap);
  const responses = await Promise.all(entries.map(([, v]) => v.query));

  // タイプごとにグルーピングした結果
  const byType: Record<string, UserContentItem[]> = {};
  // フラットリスト
  const allItems: UserContentItem[] = [];

  entries.forEach(([key, { type }], i) => {
    const { data, error } = responses[i];
    if (error) {
      console.error(`[user-contents] ${key} error:`, error.message);
      byType[type] = [];
      return;
    }
    if (!data) {
      byType[type] = [];
      return;
    }

    const items: UserContentItem[] = data.map((item: any) => {
      let label = item.title || item.name || item.nickname || '';

      // profile/business: contentブロックから名前を抽出
      if (!label && Array.isArray(item.content)) {
        if (type === 'profile') {
          const header = item.content.find((b: any) => b.type === 'header');
          if (header?.data?.name) label = header.data.name;
        } else if (type === 'business') {
          const hero = item.content.find((b: any) => b.type === 'hero' || b.type === 'hero_fullwidth');
          if (hero?.data?.headline) label = hero.data.headline;
        }
      }

      if (!label && item.slug) label = item.slug;
      if (!label) label = `(ID: ${String(item.id).slice(0, 8)}...)`;

      return {
        id: String(item.id),
        label,
        slug: item.slug || undefined,
        type,
      };
    });

    byType[type] = items;
    allItems.push(...items);
  });

  return NextResponse.json({ contents: byType, all: allItems });
}
