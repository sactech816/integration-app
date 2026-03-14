/**
 * モニターユーザー管理API
 * 管理者が特定ユーザーに期間限定で有料プラン機能を開放
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireAdminFromRequest } from '@/lib/auth-server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET: モニターユーザー一覧を取得
 */
export async function GET(request: Request) {
  try {
    const [adminUser, authError] = await requireAdminFromRequest(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const showExpired = searchParams.get('showExpired') === 'true';
    const service = searchParams.get('service') || 'kdl';

    // モニターユーザー一覧を取得
    let query = supabase
      .from('monitor_users')
      .select('*')
      .eq('service', service)
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
      const { data: usersData } = await supabase.auth.admin.listUsers({
        perPage: 1000,
      });

      const usersMap = new Map<string, { id: string; email: string }>();
      if (usersData?.users && Array.isArray(usersData.users)) {
        (usersData.users as Array<{ id: string; email?: string }>).forEach((u) => {
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
    const [adminUser, authError] = await requireAdminFromRequest(request);
    if (authError) return authError;

    const adminUserId = adminUser!.id;

    const body = await request.json();
    const {
      userEmail,
      userId,
      monitorPlanType,
      durationDays,
      notes,
      service = 'kdl',
    } = body;

    if (!userEmail && !userId) {
      return NextResponse.json({ error: 'ユーザーのEmailまたはIDが必要です' }, { status: 400 });
    }

    // サービス種別のバリデーション
    if (!['kdl', 'makers'].includes(service)) {
      return NextResponse.json({ error: '有効なサービス種別を指定してください' }, { status: 400 });
    }

    // 許可されたプラン種別（サービスごとに異なる）
    const kdlPlanTypes = [
      'lite', 'standard', 'pro', 'business', 'enterprise',
      'initial_trial', 'initial_standard', 'initial_business'
    ];
    const makersPlanTypes = ['free', 'standard', 'business', 'premium'];
    const validPlanTypes = service === 'makers' ? makersPlanTypes : kdlPlanTypes;
    if (!monitorPlanType || !validPlanTypes.includes(monitorPlanType)) {
      return NextResponse.json({ error: '有効なプラン種別を指定してください' }, { status: 400 });
    }

    if (!durationDays || durationDays < 1) {
      return NextResponse.json({ error: '有効な期間（日数）を指定してください' }, { status: 400 });
    }

    // ユーザーIDの取得（Emailから検索する場合）
    let targetUserId = userId;
    if (!targetUserId && userEmail) {
      const { data: usersData, error: listError } = await supabase.auth.admin.listUsers({
        perPage: 1000,
      });

      if (listError) {
        console.error('ユーザー一覧取得エラー:', listError);
        return NextResponse.json({ error: 'ユーザー検索に失敗しました' }, { status: 500 });
      }

      const users = (usersData?.users || []) as Array<{ id: string; email?: string }>;
      const foundUser = users.find(
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

    // 既存のモニター権限をチェック（同じユーザー＆同じサービスで1つまで）
    const { data: existingMonitor } = await supabase
      .from('monitor_users')
      .select('id')
      .eq('user_id', targetUserId)
      .eq('service', service)
      .single();

    if (existingMonitor) {
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
      const { data, error } = await supabase
        .from('monitor_users')
        .insert({
          user_id: targetUserId,
          admin_user_id: adminUserId,
          monitor_plan_type: monitorPlanType,
          monitor_start_at: now.toISOString(),
          monitor_expires_at: expiresAt.toISOString(),
          notes: notes || null,
          service: service,
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
 * PATCH: モニターユーザーを編集（プラン変更・期間延長・メモ更新）
 */
export async function PATCH(request: Request) {
  try {
    const [, authError] = await requireAdminFromRequest(request);
    if (authError) return authError;

    const body = await request.json();
    const {
      monitorId,
      monitorPlanType,
      monitorExpiresAt,
      extendDays,
      notes,
    } = body;

    if (!monitorId) {
      return NextResponse.json({ error: 'モニターIDが必要です' }, { status: 400 });
    }

    // 既存レコードを取得
    const { data: existing, error: fetchError } = await supabase
      .from('monitor_users')
      .select('*')
      .eq('id', monitorId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'モニターレコードが見つかりません' }, { status: 404 });
    }

    // 更新データを構築
    const updateData: Record<string, unknown> = {};

    // プラン変更
    if (monitorPlanType) {
      const kdlPlanTypes = [
        'lite', 'standard', 'pro', 'business', 'enterprise',
        'initial_trial', 'initial_standard', 'initial_business'
      ];
      const makersPlanTypes = ['free', 'standard', 'business', 'premium'];
      const service = existing.service || 'kdl';
      const validPlanTypes = service === 'makers' ? makersPlanTypes : kdlPlanTypes;
      if (!validPlanTypes.includes(monitorPlanType)) {
        return NextResponse.json({ error: '有効なプラン種別を指定してください' }, { status: 400 });
      }
      updateData.monitor_plan_type = monitorPlanType;
    }

    // 期限延長（日数追加）
    if (extendDays && extendDays > 0) {
      const currentExpires = new Date(existing.monitor_expires_at);
      const baseDate = currentExpires > new Date() ? currentExpires : new Date();
      const newExpires = new Date(baseDate.getTime() + extendDays * 24 * 60 * 60 * 1000);
      updateData.monitor_expires_at = newExpires.toISOString();
    }
    // 期限を直接指定
    else if (monitorExpiresAt) {
      const newExpires = new Date(monitorExpiresAt);
      if (isNaN(newExpires.getTime())) {
        return NextResponse.json({ error: '有効な日付を指定してください' }, { status: 400 });
      }
      updateData.monitor_expires_at = newExpires.toISOString();
    }

    // メモ更新
    if (notes !== undefined) {
      updateData.notes = notes || null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: '更新する項目がありません' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('monitor_users')
      .update(updateData)
      .eq('id', monitorId)
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
  } catch (error) {
    console.error('PATCH /api/admin/monitor-users エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}

/**
 * DELETE: モニターユーザーを削除（強制終了）
 */
export async function DELETE(request: Request) {
  try {
    const [, authError] = await requireAdminFromRequest(request);
    if (authError) return authError;

    const { searchParams } = new URL(request.url);
    const monitorId = searchParams.get('monitorId');

    if (!monitorId) {
      return NextResponse.json({ error: 'モニターIDが必要です' }, { status: 400 });
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
