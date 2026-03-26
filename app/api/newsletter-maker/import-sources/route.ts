import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminEmails } from '@/lib/constants';

const getServiceClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
};

/**
 * GET: インポート可能なデータソースの件数を返す
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // ユーザーのコンテンツIDを取得
    const [quizzesRes, entQuizzesRes, profilesRes, businessRes, webinarsRes] = await Promise.all([
      supabase.from('quizzes').select('slug').eq('user_id', userId).eq('quiz_type', 'business'),
      supabase.from('quizzes').select('slug').eq('user_id', userId).eq('quiz_type', 'entertainment'),
      supabase.from('profiles').select('slug').eq('user_id', userId),
      supabase.from('business_projects').select('slug').eq('user_id', userId),
      supabase.from('webinar_lps').select('slug').eq('user_id', userId),
    ]);

    const quizSlugs = quizzesRes.data?.map((q: { slug: string }) => q.slug) || [];
    const entQuizSlugs = entQuizzesRes.data?.map((q: { slug: string }) => q.slug) || [];
    const profileSlugs = profilesRes.data?.map((p: { slug: string }) => p.slug) || [];
    const businessSlugs = businessRes.data?.map((b: { slug: string }) => b.slug) || [];
    const webinarSlugs = webinarsRes.data?.map((w: { slug: string }) => w.slug) || [];

    // 各ソースのリード数をカウント
    let quizCount = 0;
    let entQuizCount = 0;
    let profileCount = 0;
    let businessCount = 0;
    let webinarCount = 0;

    if (quizSlugs.length > 0) {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('content_id', quizSlugs)
        .eq('content_type', 'quiz');
      quizCount = count || 0;
    }

    if (entQuizSlugs.length > 0) {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('content_id', entQuizSlugs)
        .eq('content_type', 'entertainment_quiz');
      entQuizCount = count || 0;
    }

    if (profileSlugs.length > 0) {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('content_id', profileSlugs)
        .eq('content_type', 'profile');
      profileCount = count || 0;
    }

    if (businessSlugs.length > 0) {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('content_id', businessSlugs)
        .eq('content_type', 'business');
      businessCount = count || 0;
    }

    if (webinarSlugs.length > 0) {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('content_id', webinarSlugs)
        .eq('content_type', 'webinar');
      webinarCount = count || 0;
    }

    // 申し込みフォームの送信者数
    const { data: forms } = await supabase
      .from('order_forms')
      .select('id')
      .eq('user_id', userId);

    let orderFormCount = 0;
    const formIds = forms?.map((f: { id: string }) => f.id) || [];
    if (formIds.length > 0) {
      const { count } = await supabase
        .from('order_form_submissions')
        .select('*', { count: 'exact', head: true })
        .in('form_id', formIds);
      orderFormCount = count || 0;
    }

    // 予約メーカーのゲストメール数
    const { data: bookingMenus } = await supabase
      .from('booking_menus')
      .select('id')
      .eq('user_id', userId);

    let bookingCount = 0;
    const menuIds = bookingMenus?.map((m: { id: string }) => m.id) || [];
    if (menuIds.length > 0) {
      const { count } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .in('menu_id', menuIds)
        .not('guest_email', 'is', null)
        .neq('guest_email', '');
      bookingCount = count || 0;
    }

    // アンケート回答者数
    const { data: surveys } = await supabase
      .from('surveys')
      .select('id')
      .eq('user_id', userId);

    let surveyCount = 0;
    const surveyIds = surveys?.map((s: { id: string }) => s.id) || [];
    if (surveyIds.length > 0) {
      const { count } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact', head: true })
        .in('survey_id', surveyIds)
        .not('respondent_email', 'is', null)
        .neq('respondent_email', '');
      surveyCount = count || 0;
    }

    // 出欠表回答者数
    const { data: events } = await supabase
      .from('attendance_events')
      .select('id')
      .eq('user_id', userId);

    let attendanceCount = 0;
    const eventIds = events?.map((e: { id: string }) => e.id) || [];
    if (eventIds.length > 0) {
      const { count } = await supabase
        .from('attendance_responses')
        .select('*', { count: 'exact', head: true })
        .in('event_id', eventIds)
        .not('participant_email', 'is', null)
        .neq('participant_email', '');
      attendanceCount = count || 0;
    }

    // Big Five サンプルDLリード数（管理者のみ）
    let bigfiveSampleCount = 0;
    {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('content_type', 'bigfive_sample');
      bigfiveSampleCount = count || 0;
    }

    // 管理者チェック: 登録ユーザー・お問い合わせのインポートは管理者のみ
    let registeredUsersCount = 0;
    let contactInquiriesCount = 0;
    const { data: { user: authUser } } = await supabase.auth.admin.getUserById(userId);
    if (authUser?.email) {
      const adminEmails = getAdminEmails();
      const isAdmin = adminEmails.some(
        (e: string) => e.toLowerCase() === authUser.email!.toLowerCase()
      );
      if (isAdmin) {
        const { data: { users } } = await supabase.auth.admin.listUsers({ page: 1, perPage: 10000 });
        // メールが確認済みのユーザーのみカウント
        registeredUsersCount = (users || []).filter(
          (u) => u.email && u.email_confirmed_at
        ).length;

        // お問い合わせ数
        const { count: contactCount } = await supabase
          .from('contact_inquiries')
          .select('*', { count: 'exact', head: true })
          .not('email', 'is', null)
          .neq('email', '');
        contactInquiriesCount = contactCount || 0;
      }
    }

    return NextResponse.json({
      leads: {
        quiz: quizCount,
        entertainment_quiz: entQuizCount,
        profile: profileCount,
        business: businessCount,
        webinar: webinarCount,
        bigfive_sample: bigfiveSampleCount,
        total: quizCount + entQuizCount + profileCount + businessCount + webinarCount + bigfiveSampleCount,
      },
      orderForms: orderFormCount,
      bookings: bookingCount,
      surveys: surveyCount,
      attendance: attendanceCount,
      registeredUsers: registeredUsersCount,
      contactInquiries: contactInquiriesCount,
    });
  } catch (error) {
    console.error('[Newsletter Import Sources] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
