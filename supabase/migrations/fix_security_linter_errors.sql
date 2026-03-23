-- =============================================
-- セキュリティLinterエラー修正マイグレーション
-- 作成日: 2026-03-23
-- =============================================
-- 修正内容:
-- 1. order_form_reminders_sent: RLS有効化（内部テーブルのためservice roleのみ）
-- 2. contact_inquiries: user_metadata参照 → is_admin()関数に置換
-- 3. trial_settings: user_metadata参照 → is_admin()関数に置換
-- 4. trial_offers: user_metadata参照 → is_admin()関数に置換
-- =============================================


-- =============================================
-- 1. order_form_reminders_sent: RLS有効化
-- =============================================
-- このテーブルはAPI Route（service role key）経由でのみ操作される内部テーブル。
-- RLSを有効化し、ポリシーなし = service roleのみアクセス可能。

ALTER TABLE public.order_form_reminders_sent ENABLE ROW LEVEL SECURITY;


-- =============================================
-- 2. contact_inquiries: admin ポリシーを is_admin() に置換
-- =============================================

DROP POLICY IF EXISTS "admin_read_inquiries" ON public.contact_inquiries;
CREATE POLICY "admin_read_inquiries" ON public.contact_inquiries
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_update_inquiries" ON public.contact_inquiries;
CREATE POLICY "admin_update_inquiries" ON public.contact_inquiries
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_delete_inquiries" ON public.contact_inquiries;
CREATE POLICY "admin_delete_inquiries" ON public.contact_inquiries
  FOR DELETE
  TO authenticated
  USING (is_admin(auth.uid()));


-- =============================================
-- 3. trial_settings: admin ポリシーを is_admin() に置換
-- =============================================

DROP POLICY IF EXISTS "admin_update_trial_settings" ON public.trial_settings;
CREATE POLICY "admin_update_trial_settings" ON public.trial_settings
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));


-- =============================================
-- 4. trial_offers: admin ポリシーを is_admin() に置換
-- =============================================

DROP POLICY IF EXISTS "admin_read_all_trial_offers" ON public.trial_offers;
CREATE POLICY "admin_read_all_trial_offers" ON public.trial_offers
  FOR SELECT
  TO authenticated
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admin_update_trial_offers" ON public.trial_offers;
CREATE POLICY "admin_update_trial_offers" ON public.trial_offers
  FOR UPDATE
  TO authenticated
  USING (is_admin(auth.uid()));
