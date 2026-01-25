-- =============================================
-- 全ツール共通: 未ログインユーザーでも作成可能にするRLSポリシー
-- 作成日: 2026-01-25
-- =============================================
-- 
-- 【仕様】
-- ゲスト（未ログイン）: 新規作成・URL発行のみ可能、編集不可
-- フリープラン（ログイン）: 新規作成・編集・更新可能
-- プロプラン（課金）: 全機能利用可能（HTMLダウンロード等）
--
-- 【対象テーブル】
-- - quizzes（診断クイズ）
-- - profiles（プロフィールLP）
-- - business_projects（ビジネスLP）
-- - surveys（アンケート）
-- - booking_menus（予約メニュー）※既に対応済み
--
-- 【除外】
-- - ゲーミフィケーション関連（ログイン必須）
-- =============================================

-- =============================================
-- 1. quizzes（診断クイズ）
-- =============================================
-- 既存のポリシーを全て削除（古いポリシーが残っている可能性があるため）
DROP POLICY IF EXISTS "Anyone can view quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Anyone can create quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can update own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can delete own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Public Insert" ON public.quizzes;
DROP POLICY IF EXISTS "Public Select" ON public.quizzes;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.quizzes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.quizzes;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.quizzes;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can view all quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can manage all quizzes" ON public.quizzes;

-- 誰でも閲覧可能
CREATE POLICY "Anyone can view quizzes" ON public.quizzes
  FOR SELECT
  USING (true);

-- 誰でも作成可能（未ログインユーザー対応）
CREATE POLICY "Anyone can create quizzes" ON public.quizzes
  FOR INSERT
  WITH CHECK (true);

-- 更新: 自分のクイズのみ、またはuser_idがNULLのクイズ
-- ※ user_idがNULLの場合、ゲストが作成したものなので編集不可にしたい場合は
--    USING (auth.uid() = user_id) のみにする
CREATE POLICY "Users can update own quizzes" ON public.quizzes
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND (user_id IS NULL OR auth.uid() = user_id))
  WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR auth.uid() = user_id));

-- 削除: 自分のクイズのみ
CREATE POLICY "Users can delete own quizzes" ON public.quizzes
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 2. profiles（プロフィールLP）
-- =============================================
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can create profiles" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- 誰でも閲覧可能
CREATE POLICY "Anyone can read profiles" ON public.profiles
  FOR SELECT
  USING (true);

-- 誰でも作成可能（未ログインユーザー対応）
CREATE POLICY "Anyone can create profiles" ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- 更新: ログインユーザーのみ、自分のプロフィールまたはuser_idがNULLのもの
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND (user_id IS NULL OR auth.uid() = user_id))
  WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR auth.uid() = user_id));

-- 削除: 自分のプロフィールのみ
CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 3. business_projects（ビジネスLP）
-- =============================================
DROP POLICY IF EXISTS "Anyone can view business projects" ON public.business_projects;
DROP POLICY IF EXISTS "Anyone can create business projects" ON public.business_projects;
DROP POLICY IF EXISTS "Authenticated users can create business projects" ON public.business_projects;
DROP POLICY IF EXISTS "Users can update own business projects" ON public.business_projects;
DROP POLICY IF EXISTS "Users can delete own business projects" ON public.business_projects;

-- 誰でも閲覧可能
CREATE POLICY "Anyone can view business projects" ON public.business_projects
  FOR SELECT
  USING (true);

-- 誰でも作成可能（未ログインユーザー対応）
CREATE POLICY "Anyone can create business projects" ON public.business_projects
  FOR INSERT
  WITH CHECK (true);

-- 更新: ログインユーザーのみ、自分のプロジェクトまたはuser_idがNULLのもの
CREATE POLICY "Users can update own business projects" ON public.business_projects
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND (user_id IS NULL OR auth.uid() = user_id))
  WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR auth.uid() = user_id));

-- 削除: 自分のプロジェクトのみ
CREATE POLICY "Users can delete own business projects" ON public.business_projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 4. surveys（アンケート）
-- =============================================
DROP POLICY IF EXISTS "Anyone can view surveys" ON public.surveys;
DROP POLICY IF EXISTS "Anyone can create surveys" ON public.surveys;
DROP POLICY IF EXISTS "Users can create their own surveys" ON public.surveys;
DROP POLICY IF EXISTS "Users can update own surveys" ON public.surveys;
DROP POLICY IF EXISTS "Users can delete own surveys" ON public.surveys;

-- 誰でも閲覧可能
CREATE POLICY "Anyone can view surveys" ON public.surveys
  FOR SELECT
  USING (true);

-- 誰でも作成可能（未ログインユーザー対応）
CREATE POLICY "Anyone can create surveys" ON public.surveys
  FOR INSERT
  WITH CHECK (true);

-- 更新: ログインユーザーのみ、自分のアンケートまたはuser_idがNULLのもの
CREATE POLICY "Users can update own surveys" ON public.surveys
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND (user_id IS NULL OR auth.uid() = user_id))
  WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR auth.uid() = user_id));

-- 削除: 自分のアンケートのみ
CREATE POLICY "Users can delete own surveys" ON public.surveys
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 確認用クエリ
-- =============================================
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename IN ('quizzes', 'profiles', 'business_projects', 'surveys')
-- ORDER BY tablename, cmd;

-- =============================================
-- 注意事項
-- =============================================
-- 1. このSQLを実行する前に、管理者用ポリシー（supabase_admin_access.sql）が
--    適用されていることを確認してください。
-- 
-- 2. ゲーミフィケーション関連テーブルは対象外です。
--    ログインユーザーのみが利用可能な設計を維持します。
--
-- 3. 予約関連（booking_menus, booking_slots）は既に対応済みです。
--    supabase_booking_edit_keys.sql を参照してください。
