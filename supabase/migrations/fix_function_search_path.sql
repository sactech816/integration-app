-- =============================================
-- function_search_path_mutable 警告修正マイグレーション
-- 作成日: 2026-03-23
-- =============================================
-- 修正内容:
-- 全ての public 関数に SET search_path = 'public' を設定
-- ALTER FUNCTION のみ使用（関数本体は変更しない）
-- =============================================
-- 注意:
-- search_path = '' (空) ではなく 'public' を使用。
-- 理由: 既存関数の大半がテーブル名を public. なしで参照しているため、
-- 空にすると全関数が壊れる。'public' なら動作を変えずに警告を解消できる。
-- =============================================


-- =============================================
-- トリガー関数（引数なし、RETURNS TRIGGER）
-- =============================================

ALTER FUNCTION public.update_attendance_updated_at()
  SET search_path = 'public';

ALTER FUNCTION public.update_affiliate_service_settings_updated_at()
  SET search_path = 'public';

ALTER FUNCTION public.update_schedule_adjustment_responses_updated_at()
  SET search_path = 'public';

ALTER FUNCTION public.update_sales_letters_updated_at()
  SET search_path = 'public';

ALTER FUNCTION public.update_cleanup_settings_updated_at()
  SET search_path = 'public';

ALTER FUNCTION public.update_service_plans_updated_at()
  SET search_path = 'public';

ALTER FUNCTION public.update_user_color_presets_updated_at()
  SET search_path = 'public';

ALTER FUNCTION public.update_monitor_users_updated_at()
  SET search_path = 'public';

ALTER FUNCTION public.update_admin_ai_settings_updated_at()
  SET search_path = 'public';

ALTER FUNCTION public.update_affiliate_updated_at()
  SET search_path = 'public';

ALTER FUNCTION public.update_kdl_subscription_updated_at()
  SET search_path = 'public';

ALTER FUNCTION public.update_kdl_agency_updated_at()
  SET search_path = 'public';

ALTER FUNCTION public.update_sites_updated_at()
  SET search_path = 'public';

ALTER FUNCTION public.increment_content_count()
  SET search_path = 'public';


-- =============================================
-- ユーティリティ関数
-- =============================================

ALTER FUNCTION public.is_admin(UUID)
  SET search_path = 'public';

ALTER FUNCTION public.generate_referral_code()
  SET search_path = 'public';

ALTER FUNCTION public.find_user_id_by_email(TEXT)
  SET search_path = 'public';

ALTER FUNCTION public.verify_booking_menu_edit_key(UUID, UUID)
  SET search_path = 'public';


-- =============================================
-- RPC 関数
-- =============================================

ALTER FUNCTION public.increment_shares(BIGINT)
  SET search_path = 'public';

ALTER FUNCTION public.play_gacha(UUID, TEXT, UUID)
  SET search_path = 'public';

ALTER FUNCTION public.preview_cleanup_targets()
  SET search_path = 'public';

ALTER FUNCTION public.execute_cleanup(BOOLEAN, UUID)
  SET search_path = 'public';

ALTER FUNCTION public.get_affiliate_service_setting(TEXT)
  SET search_path = 'public';

ALTER FUNCTION public.get_ai_limits_for_plan_tier(TEXT)
  SET search_path = 'public';

ALTER FUNCTION public.grant_affiliate_signup_points(TEXT, TEXT, UUID)
  SET search_path = 'public';

ALTER FUNCTION public.consume_points(UUID, INTEGER, TEXT, JSONB)
  SET search_path = 'public';

ALTER FUNCTION public.add_points(UUID, INTEGER, TEXT, TEXT, JSONB)
  SET search_path = 'public';

ALTER FUNCTION public.check_kdl_usage_limits(UUID)
  SET search_path = 'public';

ALTER FUNCTION public.get_user_plan_with_monitor(UUID, TEXT)
  SET search_path = 'public';

ALTER FUNCTION public.check_ai_usage_limit(UUID)
  SET search_path = 'public';

ALTER FUNCTION public.get_affiliate_stats(UUID)
  SET search_path = 'public';

ALTER FUNCTION public.record_affiliate_click(TEXT, TEXT, TEXT, INET, TEXT, TEXT)
  SET search_path = 'public';

ALTER FUNCTION public.cleanup_expired_pending_affiliates()
  SET search_path = 'public';

ALTER FUNCTION public.get_ai_usage_stats_by_service(DATE, DATE)
  SET search_path = 'public';

ALTER FUNCTION public.get_ai_setting_for_plan(TEXT, TEXT)
  SET search_path = 'public';

ALTER FUNCTION public.update_ai_setting(TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TEXT)
  SET search_path = 'public';

ALTER FUNCTION public.match_pending_affiliate(TEXT, TEXT, TEXT)
  SET search_path = 'public';

ALTER FUNCTION public.check_ai_feature_limit(UUID, TEXT)
  SET search_path = 'public';

ALTER FUNCTION public.get_agency_user_progress(UUID)
  SET search_path = 'public';

ALTER FUNCTION public.get_unread_message_count(UUID)
  SET search_path = 'public';

ALTER FUNCTION public.register_affiliate(UUID, TEXT)
  SET search_path = 'public';
