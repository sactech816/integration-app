import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ユーザーの作成済みコンテンツを各テーブルから取得
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const queries = {
    profile_lp: supabaseAdmin
      .from('profiles')
      .select('id, slug, nickname, subtitle')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    business_lp: supabaseAdmin
      .from('business_projects')
      .select('id, slug, title')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    salesletter: supabaseAdmin
      .from('sales_letters')
      .select('id, slug, title')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    quiz: supabaseAdmin
      .from('quizzes')
      .select('id, slug, title')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    entertainment_quiz: supabaseAdmin
      .from('quizzes')
      .select('id, slug, title')
      .eq('user_id', userId)
      .eq('quiz_type', 'entertainment')
      .order('created_at', { ascending: false }),
    order_form: supabaseAdmin
      .from('order_forms')
      .select('id, slug, title')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    newsletter: supabaseAdmin
      .from('newsletter_lists')
      .select('id, name')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    booking: supabaseAdmin
      .from('booking_menus')
      .select('id, title')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    survey: supabaseAdmin
      .from('surveys')
      .select('id, slug, title')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    webinar: supabaseAdmin
      .from('webinar_lps')
      .select('id, slug, title')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    attendance: supabaseAdmin
      .from('attendance_events')
      .select('id, title')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    onboarding: supabaseAdmin
      .from('onboarding_modals')
      .select('id, slug, title')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    gamification: supabaseAdmin
      .from('gamification_campaigns')
      .select('id, title')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false }),
    sns_post: supabaseAdmin
      .from('sns_posts')
      .select('id, slug, title')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
  };

  const results: Record<string, { id: string; label: string; slug?: string }[]> = {};

  const entries = Object.entries(queries);
  const responses = await Promise.all(entries.map(([, q]) => q));

  entries.forEach(([key], i) => {
    const { data, error } = responses[i];
    if (error || !data) {
      results[key] = [];
      return;
    }
    results[key] = data.map((item: any) => {
      // わかりやすいラベルを生成（ID表示を避ける）
      let label = item.title || item.name || item.nickname || '';
      if (!label && item.subtitle) label = item.subtitle;
      if (!label && item.slug) label = item.slug;
      if (!label) label = `(ID: ${String(item.id).slice(0, 8)}...)`;
      return {
        id: String(item.id),
        label,
        slug: item.slug || undefined,
      };
    });
  });

  return NextResponse.json({ contents: results });
}
