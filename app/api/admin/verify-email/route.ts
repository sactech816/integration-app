/**
 * 管理者によるメール認証手動設定API
 * メールが届かないユーザーに対して、管理者が手動でメール認証済みにする
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminEmails } from '@/lib/constants';

const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
};

/**
 * POST: ユーザーのメール認証を手動で完了させる
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    // 管理者認証チェック
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // トークンからユーザー情報を取得してadminチェック
    const { createClient: createAuthClient } = await import('@supabase/supabase-js');
    const authClient = createAuthClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const { data: { user: authUser } } = await authClient.auth.getUser(token);

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminEmails = getAdminEmails();
    const isAdmin = adminEmails.some(
      (email: string) => authUser.email?.toLowerCase() === email.toLowerCase()
    );
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // 対象ユーザーの現在の状態を確認
    const { data: targetUser, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    if (getUserError || !targetUser?.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (targetUser.user.email_confirmed_at) {
      return NextResponse.json({
        success: true,
        message: 'このユーザーは既にメール認証済みです',
        emailConfirmedAt: targetUser.user.email_confirmed_at,
      });
    }

    // メール認証を手動で完了させる
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { email_confirm: true }
    );

    if (updateError) {
      console.error('メール認証更新エラー:', updateError);
      return NextResponse.json({ error: 'メール認証の更新に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'メール認証を手動で完了しました',
      emailConfirmedAt: updatedUser.user.email_confirmed_at,
    });
  } catch (error) {
    console.error('POST /api/admin/verify-email エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
