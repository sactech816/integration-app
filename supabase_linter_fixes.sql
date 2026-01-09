-- =============================================
-- Supabase Linter 警告修正マイグレーション
-- 作成日: 2026-01-07
-- =============================================
-- 
-- このファイルは以下の3つのセクションで構成されています：
-- Part 1: 関数のsearch_path設定修正（37関数）
-- Part 2: Service Role用の不要なRLSポリシー削除（22ポリシー）
-- Part 3: 危険な「Always True」ポリシーのリストアップ（コメント付き）
--
-- =============================================


-- =============================================
-- Part 1: 関数のsearch_path設定修正
-- =============================================
-- セキュリティ上の理由から、全ての関数に明示的なsearch_pathを設定します。
-- これにより、悪意のあるスキーマ操作による攻撃を防ぎます。
-- =============================================

-- トリガー関数群
ALTER FUNCTION public.update_announcements_updated_at() SET search_path = public;
ALTER FUNCTION public.update_surveys_updated_at() SET search_path = public;
ALTER FUNCTION public.update_subscription_updated_at() SET search_path = public;
ALTER FUNCTION public.update_gamification_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- ヘルパー関数
ALTER FUNCTION public.date_from_timestamptz(TIMESTAMPTZ) SET search_path = public;

-- カウンター関数（クイズ用）
ALTER FUNCTION public.increment_views(BIGINT) SET search_path = public;
ALTER FUNCTION public.increment_clicks(BIGINT) SET search_path = public;
ALTER FUNCTION public.increment_completions(BIGINT) SET search_path = public;
ALTER FUNCTION public.increment_likes(BIGINT) SET search_path = public;

-- サブスクリプション関連
ALTER FUNCTION public.get_user_subscription(UUID) SET search_path = public;
ALTER FUNCTION public.get_subscription_stats() SET search_path = public;

-- パートナー管理関連
ALTER FUNCTION public.check_is_partner(UUID) SET search_path = public;
ALTER FUNCTION public.set_partner_status(UUID, BOOLEAN, TEXT) SET search_path = public;
ALTER FUNCTION public.get_all_users_with_roles() SET search_path = public;

-- AI使用量管理関連
ALTER FUNCTION public.check_ai_usage_limit(UUID) SET search_path = public;
ALTER FUNCTION public.log_ai_usage(UUID, TEXT, TEXT, TEXT, INTEGER, INTEGER, JSONB) SET search_path = public;
ALTER FUNCTION public.get_ai_usage_stats(DATE, DATE) SET search_path = public;

-- ポイント管理関連
ALTER FUNCTION public.update_user_points(UUID, TEXT, INTEGER, UUID, TEXT, JSONB) SET search_path = public;
ALTER FUNCTION public.get_user_point_balance(UUID, TEXT) SET search_path = public;

-- スタンプ関連
ALTER FUNCTION public.check_stamp_acquired(UUID, TEXT, UUID, TEXT) SET search_path = public;
ALTER FUNCTION public.get_user_stamps(UUID, TEXT, UUID) SET search_path = public;

-- ログインボーナス関連
ALTER FUNCTION public.check_login_bonus_today(UUID, TEXT, UUID) SET search_path = public;

-- ガチャ・キャンペーン関連
ALTER FUNCTION public.play_gacha(UUID, TEXT, UUID) SET search_path = public;
ALTER FUNCTION public.get_campaign_stats(UUID) SET search_path = public;

-- ウェルカムボーナス関連
ALTER FUNCTION public.claim_welcome_bonus(UUID) SET search_path = public;

-- ゲーミフィケーション設定関連
ALTER FUNCTION public.get_or_create_user_gamification_settings(UUID) SET search_path = public;
ALTER FUNCTION public.update_user_notification_settings(UUID, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN, BOOLEAN) SET search_path = public;

-- ミッション関連
ALTER FUNCTION public.get_today_missions_progress(UUID) SET search_path = public;
ALTER FUNCTION public.update_mission_progress(UUID, TEXT, INTEGER) SET search_path = public;
ALTER FUNCTION public.claim_mission_reward(UUID, UUID) SET search_path = public;
ALTER FUNCTION public.check_all_missions_bonus(UUID) SET search_path = public;
ALTER FUNCTION public.claim_all_missions_bonus(UUID) SET search_path = public;

-- 管理者設定関連
ALTER FUNCTION public.get_admin_gamification_setting(TEXT) SET search_path = public;
ALTER FUNCTION public.update_admin_gamification_setting(TEXT, JSONB, UUID) SET search_path = public;

-- アンケート結果関連
ALTER FUNCTION public.get_survey_results(INTEGER) SET search_path = public;


-- =============================================
-- Part 2: Service Role用の不要なRLSポリシー削除
-- =============================================
-- Service Roleは元々RLSをバイパスするため、これらのポリシーは不要です。
-- 削除することでLinter警告を解消し、ポリシー管理を簡素化します。
-- =============================================

-- admin_gamification_settings
DROP POLICY IF EXISTS "Service role can manage admin gamification settings" ON public.admin_gamification_settings;

-- ai_usage_logs
DROP POLICY IF EXISTS "Service role can insert usage logs" ON public.ai_usage_logs;

-- business_project_purchases
DROP POLICY IF EXISTS "Service role can insert purchases" ON public.business_project_purchases;

-- daily_missions
DROP POLICY IF EXISTS "Service role can manage daily missions" ON public.daily_missions;

-- kdl_books
DROP POLICY IF EXISTS "Service role can insert kdl_books" ON public.kdl_books;
DROP POLICY IF EXISTS "Service role can update kdl_books" ON public.kdl_books;
DROP POLICY IF EXISTS "Service role can delete kdl_books" ON public.kdl_books;

-- kdl_chapters
DROP POLICY IF EXISTS "Service role can insert kdl_chapters" ON public.kdl_chapters;
DROP POLICY IF EXISTS "Service role can update kdl_chapters" ON public.kdl_chapters;
DROP POLICY IF EXISTS "Service role can delete kdl_chapters" ON public.kdl_chapters;

-- kdl_sections
DROP POLICY IF EXISTS "Service role can insert kdl_sections" ON public.kdl_sections;
DROP POLICY IF EXISTS "Service role can update kdl_sections" ON public.kdl_sections;
DROP POLICY IF EXISTS "Service role can delete kdl_sections" ON public.kdl_sections;

-- point_logs
DROP POLICY IF EXISTS "Service role can manage all logs" ON public.point_logs;

-- profile_purchases
DROP POLICY IF EXISTS "Service role can insert profile purchases" ON public.profile_purchases;

-- purchases
DROP POLICY IF EXISTS "Service role can insert purchases" ON public.purchases;

-- subscription_payments
DROP POLICY IF EXISTS "Service role can manage payments" ON public.subscription_payments;

-- subscriptions
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;

-- system_settings
DROP POLICY IF EXISTS "Service role can update settings" ON public.system_settings;

-- user_daily_mission_progress
DROP POLICY IF EXISTS "Service role can manage all mission progress" ON public.user_daily_mission_progress;

-- user_gamification_settings
DROP POLICY IF EXISTS "Service role can manage all user gamification settings" ON public.user_gamification_settings;

-- user_point_balances
DROP POLICY IF EXISTS "Service role can manage all balances" ON public.user_point_balances;

-- user_prizes
DROP POLICY IF EXISTS "Service role can manage all user prizes" ON public.user_prizes;

-- user_roles
DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;


-- =============================================
-- Part 3: 危険な「Always True」ポリシーのリストアップ
-- =============================================
-- 以下のポリシーは USING (true) または WITH CHECK (true) を使用しており、
-- セキュリティリスクが高い可能性があります。
-- 
-- ⚠️ 注意: これらは意図的に設計されている可能性があるため、
--          削除する前にアプリケーションの動作を確認してください。
-- =============================================

-- =============================================
-- 高リスク: 削除・更新権限が全開放されているポリシー
-- =============================================

-- business_projects テーブル
-- 問題: 誰でもビジネスプロジェクトを作成・更新・削除できる
-- 推奨: user_idカラムがある場合は auth.uid() = user_id に変更
-- 
-- DROP POLICY IF EXISTS "Anyone can create business projects" ON public.business_projects;
-- DROP POLICY IF EXISTS "Anyone can delete business projects" ON public.business_projects;
-- DROP POLICY IF EXISTS "Anyone can update business projects" ON public.business_projects;
-- 
-- 代替案（user_idカラムがある場合）:
-- CREATE POLICY "Users can create own business projects" ON public.business_projects
--   FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own business projects" ON public.business_projects
--   FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can delete own business projects" ON public.business_projects
--   FOR DELETE USING (auth.uid() = user_id);

-- featured_contents テーブル
-- 問題: 認証ユーザーなら誰でもピックアップコンテンツを操作できる
-- 推奨: 管理者のみに制限するか、コンテンツ所有者のみに制限
-- 
-- DROP POLICY IF EXISTS "Authenticated users can delete featured_contents" ON public.featured_contents;
-- DROP POLICY IF EXISTS "Authenticated users can insert featured_contents" ON public.featured_contents;
-- DROP POLICY IF EXISTS "Authenticated users can update featured_contents" ON public.featured_contents;
-- 
-- 代替案（管理者のみに制限する場合）:
-- CREATE POLICY "Admins can manage featured_contents" ON public.featured_contents
--   FOR ALL
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_roles 
--       WHERE user_roles.user_id = auth.uid() 
--       AND user_roles.is_admin = true
--     )
--   )
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM user_roles 
--       WHERE user_roles.user_id = auth.uid() 
--       AND user_roles.is_admin = true
--     )
--   );

-- profiles テーブル
-- 問題: 誰でもプロフィールを作成・更新できる
-- 推奨: 自分のプロフィールのみ操作可能に制限
-- 
-- DROP POLICY IF EXISTS "Allow public insert on profiles" ON public.profiles;
-- DROP POLICY IF EXISTS "Allow public update on profiles" ON public.profiles;
-- 
-- 代替案（user_idカラムがある場合）:
-- CREATE POLICY "Users can insert own profile" ON public.profiles
--   FOR INSERT WITH CHECK (auth.uid() = user_id);
-- CREATE POLICY "Users can update own profile" ON public.profiles
--   FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- =============================================
-- 中リスク: 公開INSERT（意図的な可能性あり）
-- =============================================
-- 以下のポリシーは匿名トラッキングや公開フォーム用に
-- 意図的に設計されている可能性が高いです。
-- 必要に応じてレート制限やバリデーションを検討してください。

-- analytics テーブル - 匿名トラッキング用
-- ポリシー: "Anyone can insert analytics"
-- 状態: 意図的と思われるため維持を推奨

-- leads テーブル - 公開フォーム用
-- ポリシー: "Leads insert public"
-- 状態: 意図的と思われるため維持を推奨

-- quiz_leads テーブル - 公開フォーム用
-- ポリシー: "Anyone can insert leads"
-- 状態: 意図的と思われるため維持を推奨

-- quizzes テーブル - 公開クイズ作成用
-- ポリシー: "Public Insert"
-- 状態: 意図的と思われるため維持を推奨

-- survey_responses テーブル - 匿名投票用
-- ポリシー: "Anyone can insert survey responses"
-- 状態: 意図的と思われるため維持を推奨


-- =============================================
-- マイグレーション完了
-- =============================================
-- 実行後、Supabase Linterを再度実行して警告が解消されたことを確認してください。
-- Part 3のポリシーについては、必要に応じて手動で対応してください。
-- =============================================



