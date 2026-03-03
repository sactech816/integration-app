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
    const [quizzesRes, profilesRes, businessRes] = await Promise.all([
      supabase.from('quizzes').select('slug').eq('user_id', userId),
      supabase.from('profiles').select('slug').eq('user_id', userId),
      supabase.from('business_projects').select('slug').eq('user_id', userId),
    ]);

    const quizSlugs = quizzesRes.data?.map((q: { slug: string }) => q.slug) || [];
    const profileSlugs = profilesRes.data?.map((p: { slug: string }) => p.slug) || [];
    const businessSlugs = businessRes.data?.map((b: { slug: string }) => b.slug) || [];

    // 各ソースのリード数をカウント
    let quizCount = 0;
    let profileCount = 0;
    let businessCount = 0;

    if (quizSlugs.length > 0) {
      const { count } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .in('content_id', quizSlugs)
        .eq('content_type', 'quiz');
      quizCount = count || 0;
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

    // 管理者チェック: 登録ユーザーのインポートは管理者のみ
    let registeredUsersCount = 0;
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
      }
    }

    return NextResponse.json({
      leads: {
        quiz: quizCount,
        profile: profileCount,
        business: businessCount,
        total: quizCount + profileCount + businessCount,
      },
      orderForms: orderFormCount,
      bookings: bookingCount,
      registeredUsers: registeredUsersCount,
    });
  } catch (error) {
    console.error('[Newsletter Import Sources] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
