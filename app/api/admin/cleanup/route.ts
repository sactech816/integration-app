import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// サービスロールクライアント
const getServiceClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey);
};

// クリーンアップ設定の型定義
interface CleanupSettings {
  id: string;
  is_enabled: boolean;
  guest_retention_days: number;
  free_retention_days: number;
  pro_retention_days: number;
  cleanup_quizzes: boolean;
  cleanup_profiles: boolean;
  cleanup_business_projects: boolean;
  cleanup_surveys: boolean;
  cleanup_booking_menus: boolean;
  cleanup_attendance_events: boolean;
  run_time: string;
  dry_run_mode: boolean;
  notify_before_delete: boolean;
  notify_days_before: number;
  updated_at: string;
}

// 削除対象プレビューの型定義
interface CleanupTarget {
  table_name: string;
  record_id: string;
  slug: string;
  title: string;
  user_plan: string;
  last_accessed_at: string;
  created_at: string;
  days_inactive: number;
}

// 削除ログの型定義
interface CleanupLog {
  id: string;
  executed_at: string;
  is_dry_run: boolean;
  executed_by: string | null;
  total_deleted: number;
  details: any[];
  error_message: string | null;
}

/**
 * GET: クリーンアップ設定・プレビュー・ログを取得
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'settings';

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    switch (action) {
      case 'settings': {
        // クリーンアップ設定を取得
        const { data, error } = await supabase
          .from('admin_cleanup_settings')
          .select('*')
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Failed to fetch cleanup settings:', error);
          return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
        }

        // 設定がない場合はデフォルト値を返す
        const settings: CleanupSettings = data || {
          id: '',
          is_enabled: false,
          guest_retention_days: 30,
          free_retention_days: 90,
          pro_retention_days: -1,
          cleanup_quizzes: true,
          cleanup_profiles: true,
          cleanup_business_projects: true,
          cleanup_surveys: true,
          cleanup_booking_menus: true,
          cleanup_attendance_events: true,
          run_time: '03:00',
          dry_run_mode: true,
          notify_before_delete: false,
          notify_days_before: 7,
          updated_at: new Date().toISOString(),
        };

        return NextResponse.json({ settings });
      }

      case 'preview': {
        // 削除対象プレビューを取得
        const { data, error } = await supabase.rpc('preview_cleanup_targets');

        if (error) {
          console.error('Failed to fetch cleanup preview:', error);
          return NextResponse.json({ error: 'Failed to fetch preview' }, { status: 500 });
        }

        const targets: CleanupTarget[] = data || [];
        
        // 統計情報を計算
        const stats = {
          total: targets.length,
          byTable: {
            quizzes: targets.filter(t => t.table_name === 'quizzes').length,
            profiles: targets.filter(t => t.table_name === 'profiles').length,
            business_projects: targets.filter(t => t.table_name === 'business_projects').length,
            surveys: targets.filter(t => t.table_name === 'surveys').length,
            booking_menus: targets.filter(t => t.table_name === 'booking_menus').length,
            attendance_events: targets.filter(t => t.table_name === 'attendance_events').length,
          },
          byPlan: {
            guest: targets.filter(t => t.user_plan === 'guest').length,
            free: targets.filter(t => t.user_plan === 'free').length,
          },
        };

        return NextResponse.json({ targets, stats });
      }

      case 'logs': {
        // 削除ログを取得
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        const { data, error, count } = await supabase
          .from('cleanup_logs')
          .select('*', { count: 'exact' })
          .order('executed_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (error) {
          console.error('Failed to fetch cleanup logs:', error);
          return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
        }

        return NextResponse.json({ logs: data || [], total: count || 0 });
      }

      case 'exclusions': {
        // 除外リストを取得
        const { data, error } = await supabase
          .from('cleanup_exclusions')
          .select('*')
          .order('excluded_at', { ascending: false });

        if (error) {
          console.error('Failed to fetch exclusions:', error);
          return NextResponse.json({ error: 'Failed to fetch exclusions' }, { status: 500 });
        }

        return NextResponse.json({ exclusions: data || [] });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('GET cleanup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST: クリーンアップ設定更新・実行・除外追加
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId } = body;

    const supabase = getServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    switch (action) {
      case 'update_settings': {
        // 設定を更新
        const { settings } = body;
        
        if (!settings) {
          return NextResponse.json({ error: 'settings is required' }, { status: 400 });
        }

        // 既存の設定があるか確認
        const { data: existing } = await supabase
          .from('admin_cleanup_settings')
          .select('id')
          .limit(1)
          .single();

        if (existing) {
          // 更新
          const { error } = await supabase
            .from('admin_cleanup_settings')
            .update({
              is_enabled: settings.is_enabled,
              guest_retention_days: settings.guest_retention_days,
              free_retention_days: settings.free_retention_days,
              pro_retention_days: settings.pro_retention_days,
              cleanup_quizzes: settings.cleanup_quizzes,
              cleanup_profiles: settings.cleanup_profiles,
              cleanup_business_projects: settings.cleanup_business_projects,
              cleanup_surveys: settings.cleanup_surveys,
              cleanup_booking_menus: settings.cleanup_booking_menus,
              cleanup_attendance_events: settings.cleanup_attendance_events,
              run_time: settings.run_time,
              dry_run_mode: settings.dry_run_mode,
              notify_before_delete: settings.notify_before_delete,
              notify_days_before: settings.notify_days_before,
              updated_by: userId || null,
            })
            .eq('id', existing.id);

          if (error) {
            console.error('Failed to update cleanup settings:', error);
            return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
          }
        } else {
          // 新規作成
          const { error } = await supabase
            .from('admin_cleanup_settings')
            .insert({
              is_enabled: settings.is_enabled,
              guest_retention_days: settings.guest_retention_days,
              free_retention_days: settings.free_retention_days,
              pro_retention_days: settings.pro_retention_days,
              cleanup_quizzes: settings.cleanup_quizzes,
              cleanup_profiles: settings.cleanup_profiles,
              cleanup_business_projects: settings.cleanup_business_projects,
              cleanup_surveys: settings.cleanup_surveys,
              cleanup_booking_menus: settings.cleanup_booking_menus,
              cleanup_attendance_events: settings.cleanup_attendance_events,
              run_time: settings.run_time,
              dry_run_mode: settings.dry_run_mode,
              notify_before_delete: settings.notify_before_delete,
              notify_days_before: settings.notify_days_before,
              updated_by: userId || null,
            });

          if (error) {
            console.error('Failed to create cleanup settings:', error);
            return NextResponse.json({ error: 'Failed to create settings' }, { status: 500 });
          }
        }

        return NextResponse.json({ success: true, message: '設定を保存しました' });
      }

      case 'execute': {
        // クリーンアップを実行
        const { dryRun = true } = body;

        const { data, error } = await supabase.rpc('execute_cleanup', {
          p_dry_run: dryRun,
          p_executed_by: userId || null,
        });

        if (error) {
          console.error('Failed to execute cleanup:', error);
          return NextResponse.json({ error: 'クリーンアップの実行に失敗しました: ' + error.message }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          logId: data,
          message: dryRun ? 'ドライラン完了（実際の削除は行われていません）' : 'クリーンアップを実行しました',
        });
      }

      case 'add_exclusion': {
        // 除外リストに追加
        const { tableName, recordId, reason } = body;

        if (!tableName || !recordId) {
          return NextResponse.json({ error: 'tableName and recordId are required' }, { status: 400 });
        }

        const { error } = await supabase
          .from('cleanup_exclusions')
          .upsert({
            table_name: tableName,
            record_id: recordId,
            reason: reason || null,
            excluded_by: userId || null,
          }, {
            onConflict: 'table_name,record_id',
          });

        if (error) {
          console.error('Failed to add exclusion:', error);
          return NextResponse.json({ error: 'Failed to add exclusion' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: '除外リストに追加しました' });
      }

      case 'remove_exclusion': {
        // 除外リストから削除
        const { tableName, recordId } = body;

        if (!tableName || !recordId) {
          return NextResponse.json({ error: 'tableName and recordId are required' }, { status: 400 });
        }

        const { error } = await supabase
          .from('cleanup_exclusions')
          .delete()
          .eq('table_name', tableName)
          .eq('record_id', recordId);

        if (error) {
          console.error('Failed to remove exclusion:', error);
          return NextResponse.json({ error: 'Failed to remove exclusion' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: '除外リストから削除しました' });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('POST cleanup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
