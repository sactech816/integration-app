/**
 * モニターユーザー管理API
 * 管理者が特定ユーザーに期間限定で有料プラン機能を開放
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAdminEmails } from '@/lib/constants';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 管理者権限チェック（メールアドレスベース）
async function isAdmin(userId: string): Promise<boolean> {
  try {
    // ユーザーのメールアドレスを取得
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    
    if (!userData?.user?.email) {
      return false;
    }

    // 管理者メールリストと照合
    const adminEmails = getAdminEmails();
    return adminEmails.some(
      (email) => userData.user.email?.toLowerCase() === email.toLowerCase()
    );
  } catch (error) {
    console.error('管理者チェックエラー:', error);
    return false;
  }
}

/**
 * GET: モニターユーザー一覧を取得
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminUserId = searchParams.get('adminUserId');
    const showExpired = searchParams.get('showExpired') === 'true';

    if (!adminUserId) {
      return NextResponse.json({ error: '管理者IDが必要です' }, { status: 400 });
    }

    // 管理者権限チェック
    const hasAdminAccess = await isAdmin(adminUserId);
    if (!hasAdminAccess) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    // モニターユーザー一覧を取得
    let query = supabase
      .from('monitor_users')
      .select('*')
      .order('created_at', { ascending: false });

    // 期限切れを含めるかどうか
    if (!showExpired) {
      query = query.gt('monitor_expires_at', new Date().toISOString());
    }

    const { data: monitors, error } = await query;

    if (error) {
      console.error('モニターユーザー取得エラー:', error);
      return NextResponse.json({ error: 'データ取得に失敗しました' }, { status: 500 });
    }

    // ユーザー情報を取得（Admin API使用）
    const enrichedMonitors = [];
    if (monitors && monitors.length > 0) {
      // 全ユーザーを一度に取得
      const { data: usersData } = await supabase.auth.admin.listUsers({
        perPage: 1000,
      });
      
      const usersMap = new Map<string, { id: string; email: string }>();
      if (usersData?.users) {
        usersData.users.forEach((u) => {
          usersMap.set(u.id, { id: u.id, email: u.email || '' });
        });
      }

      for (const monitor of monitors) {
        enrichedMonitors.push({
          ...monitor,
          user: usersMap.get(monitor.user_id) || { id: monitor.user_id, email: 'Unknown' },
          admin: usersMap.get(monitor.admin_user_id) || { id: monitor.admin_user_id, email: 'Unknown' },
        });
      }
    }

    return NextResponse.json({
      success: true,
      monitors: enrichedMonitors,
    });
  } catch (error) {
    console.error('GET /api/admin/monitor-users エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

/**
 * POST: モニターユーザーを追加
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      adminUserId,
      userEmail,
      userId,
      monitorPlanType,
      durationDays,
      notes,
    } = body;

    if (!adminUserId) {
      return NextResponse.json({ error: '管理者IDが必要です' }, { status: 400 });
    }

    if (!userEmail && !userId) {
      return NextResponse.json({ error: 'ユーザーのEmailまたはIDが必要です' }, { status: 400 });
    }

    if (!monitorPlanType || !['lite', 'standard', 'pro', 'business', 'enterprise'].includes(monitorPlanType)) {
      return NextResponse.json({ error: '有効なプラン種別を指定してください' }, { status: 400 });
    }

    if (!durationDays || durationDays < 1) {
      return NextResponse.json({ error: '有効な期間（日数）を指定してください' }, { status: 400 });
    }

    // 管理者権限チェック
    const hasAdminAccess = await isAdmin(adminUserId);
    if (!hasAdminAccess) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    // ユーザーIDの取得（Emailから検索する場合）
    let targetUserId = userId;
    if (!targetUserId && userEmail) {
      // Supabase Admin APIでユーザーを検索
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
        perPage: 1000,
      });

      if (listError) {
        console.error('ユーザー一覧取得エラー:', listError);
        return NextResponse.json({ error: 'ユーザー検索に失敗しました' }, { status: 500 });
      }

      // メールアドレスで検索（大文字小文字を区別しない）
      const foundUser = usersData.users.find(
        (u) => u.email?.toLowerCase() === userEmail.toLowerCase()
      );

      if (!foundUser) {
        return NextResponse.json({ error: `ユーザーが見つかりません: ${userEmail}` }, { status: 404 });
      }

      targetUserId = foundUser.id;
    }

    // 有効期限の計算
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    // 既存のモニター権限をチェック（1ユーザーにつき1つまで）
    const { data: existingMonitor } = await supabase
      .from('monitor_users')
      .select('id')
      .eq('user_id', targetUserId)
      .single();

    if (existingMonitor) {
      // 既存のモニター権限を更新
      const { data, error } = await supabase
        .from('monitor_users')
        .update({
          admin_user_id: adminUserId,
          monitor_plan_type: monitorPlanType,
          monitor_start_at: now.toISOString(),
          monitor_expires_at: expiresAt.toISOString(),
          notes: notes || null,
        })
        .eq('id', existingMonitor.id)
        .select()
        .single();

      if (error) {
        console.error('モニター権限更新エラー:', error);
        return NextResponse.json({ error: 'モニター権限の更新に失敗しました' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'モニター権限を更新しました',
        monitor: data,
      });
    } else {
      // 新規モニター権限を追加
      const { data, error } = await supabase
        .from('monitor_users')
        .insert({
          user_id: targetUserId,
          admin_user_id: adminUserId,
          monitor_plan_type: monitorPlanType,
          monitor_start_at: now.toISOString(),
          monitor_expires_at: expiresAt.toISOString(),
          notes: notes || null,
        })
        .select()
        .single();

      if (error) {
        console.error('モニター権限追加エラー:', error);
        return NextResponse.json({ error: 'モニター権限の追加に失敗しました' }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'モニター権限を付与しました',
        monitor: data,
      });
    }
  } catch (error) {
    console.error('POST /api/admin/monitor-users エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

/**
 * DELETE: モニターユーザーを削除（強制終了）
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const adminUserId = searchParams.get('adminUserId');
    const monitorId = searchParams.get('monitorId');

    if (!adminUserId) {
      return NextResponse.json({ error: '管理者IDが必要です' }, { status: 400 });
    }

    if (!monitorId) {
      return NextResponse.json({ error: 'モニターIDが必要です' }, { status: 400 });
    }

    // 管理者権限チェック
    const hasAdminAccess = await isAdmin(adminUserId);
    if (!hasAdminAccess) {
      return NextResponse.json({ error: '管理者権限が必要です' }, { status: 403 });
    }

    // モニター権限を削除
    const { error } = await supabase
      .from('monitor_users')
      .delete()
      .eq('id', monitorId);

    if (error) {
      console.error('モニター権限削除エラー:', error);
      return NextResponse.json({ error: 'モニター権限の削除に失敗しました' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'モニター権限を削除しました',
    });
  } catch (error) {
    console.error('DELETE /api/admin/monitor-users エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

