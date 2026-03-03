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

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = getServiceClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // トークンからユーザー情報を取得
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 管理者チェック
    const adminEmails = getAdminEmails();
    const isAdmin = adminEmails.some(
      (email) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // リクエストボディを取得
    const { userId, confirmEmail } = await request.json();

    if (!userId || !confirmEmail) {
      return NextResponse.json(
        { error: 'userId and confirmEmail are required' },
        { status: 400 }
      );
    }

    // 対象ユーザーの存在確認
    const { data: targetUser, error: getUserError } = await supabase.auth.admin.getUserById(userId);

    if (getUserError || !targetUser?.user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 確認用メールアドレスの一致チェック
    if (targetUser.user.email?.toLowerCase() !== confirmEmail.toLowerCase()) {
      return NextResponse.json(
        { error: '確認用メールアドレスが一致しません' },
        { status: 400 }
      );
    }

    // 自分自身の削除を禁止
    if (targetUser.user.id === user.id) {
      return NextResponse.json(
        { error: '自分自身を削除することはできません' },
        { status: 400 }
      );
    }

    // 他の管理者の削除を禁止
    const isTargetAdmin = adminEmails.some(
      (email) => targetUser.user.email?.toLowerCase() === email.toLowerCase()
    );
    if (isTargetAdmin) {
      return NextResponse.json(
        { error: '管理者ユーザーは削除できません' },
        { status: 400 }
      );
    }

    // 関連テーブルからデータ削除（FK順）
    const tablesToClean = [
      'affiliate_conversions',
      'affiliates',
      'point_logs',
      'user_point_balances',
      'monitor_users',
      'purchases',
      'user_roles',
      'feedbacks',
    ];

    for (const table of tablesToClean) {
      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.warn(`[delete-user] Warning deleting from ${table}:`, deleteError.message);
      }
    }

    // Supabase Auth からユーザーを削除
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(userId);

    if (deleteUserError) {
      console.error('[delete-user] Auth delete error:', deleteUserError);
      return NextResponse.json(
        { error: 'ユーザーの削除に失敗しました', details: deleteUserError.message },
        { status: 500 }
      );
    }

    console.log(`[delete-user] User deleted: ${targetUser.user.email} (${userId}) by admin: ${user.email} at ${new Date().toISOString()}`);

    return NextResponse.json({
      success: true,
      message: `ユーザー ${targetUser.user.email} を削除しました`,
    });

  } catch (error: any) {
    console.error('[delete-user] Error:', error);
    return NextResponse.json(
      { error: 'ユーザー削除に失敗しました', details: error.message },
      { status: 500 }
    );
  }
}
