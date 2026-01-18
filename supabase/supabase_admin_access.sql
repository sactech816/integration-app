-- 管理者アクセス権限の設定
-- 管理者は全てのデータにアクセスできるようにする

-- ===========================================
-- 1. 管理者判定関数
-- ===========================================

-- 管理者のメールアドレスリスト（環境に応じて変更してください）
-- この関数は user_roles テーブルを参照します
CREATE OR REPLACE FUNCTION is_admin(check_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- user_roles テーブルに admin レコードが存在するかチェック
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = check_user_id
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ===========================================
-- 2. 予約管理のRLSポリシー追加
-- ===========================================

-- booking_menus: 管理者は全てのメニューを閲覧可能
DROP POLICY IF EXISTS "Admins can view all menus" ON public.booking_menus;
CREATE POLICY "Admins can view all menus" ON public.booking_menus
  FOR SELECT
  USING (is_admin(auth.uid()));

-- booking_menus: 管理者は全てのメニューを管理可能
DROP POLICY IF EXISTS "Admins can manage all menus" ON public.booking_menus;
CREATE POLICY "Admins can manage all menus" ON public.booking_menus
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- booking_slots: 管理者は全てのスロットを閲覧・管理可能
DROP POLICY IF EXISTS "Admins can manage all slots" ON public.booking_slots;
CREATE POLICY "Admins can manage all slots" ON public.booking_slots
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- bookings: 管理者は全ての予約を閲覧・管理可能
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all bookings" ON public.bookings;
CREATE POLICY "Admins can manage all bookings" ON public.bookings
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- schedule_adjustment_responses: 管理者は全ての日程調整回答を閲覧可能
DROP POLICY IF EXISTS "Admins can view all adjustments" ON public.schedule_adjustment_responses;
CREATE POLICY "Admins can view all adjustments" ON public.schedule_adjustment_responses
  FOR SELECT
  USING (is_admin(auth.uid()));

-- ===========================================
-- 3. アンケート管理のRLSポリシー追加
-- ===========================================

-- surveys: 管理者は全てのアンケートを閲覧・管理可能
DROP POLICY IF EXISTS "Admins can view all surveys" ON public.surveys;
CREATE POLICY "Admins can view all surveys" ON public.surveys
  FOR SELECT
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all surveys" ON public.surveys;
CREATE POLICY "Admins can manage all surveys" ON public.surveys
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- survey_responses: 管理者は全ての回答を閲覧可能
DROP POLICY IF EXISTS "Admins can view all survey responses" ON public.survey_responses;
CREATE POLICY "Admins can view all survey responses" ON public.survey_responses
  FOR SELECT
  USING (is_admin(auth.uid()));

-- ===========================================
-- 4. その他コンテンツの管理者アクセス
-- ===========================================

-- quizzes: 管理者は全ての診断クイズを閲覧・管理可能
DROP POLICY IF EXISTS "Admins can view all quizzes" ON public.quizzes;
CREATE POLICY "Admins can view all quizzes" ON public.quizzes
  FOR SELECT
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all quizzes" ON public.quizzes;
CREATE POLICY "Admins can manage all quizzes" ON public.quizzes
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- profiles: 管理者は全てのプロフィールを閲覧・管理可能
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- business_projects: 管理者は全てのビジネスLPを閲覧・管理可能
DROP POLICY IF EXISTS "Admins can view all business_projects" ON public.business_projects;
CREATE POLICY "Admins can view all business_projects" ON public.business_projects
  FOR SELECT
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can manage all business_projects" ON public.business_projects;
CREATE POLICY "Admins can manage all business_projects" ON public.business_projects
  FOR ALL
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- ===========================================
-- 実行完了メッセージ
-- ===========================================
DO $$
BEGIN
  RAISE NOTICE '管理者アクセス権限の設定が完了しました';
  RAISE NOTICE '管理者は user_roles テーブルで role=admin として登録されている必要があります';
END $$;
