-- =============================================
-- business_projects テーブルのRLSポリシー修正
-- 更新: 2026-01-25 未ログインユーザーも作成可能に変更
-- =============================================

-- 1. 誰でも公開されたビジネスLPを閲覧可能
DROP POLICY IF EXISTS "Anyone can view business projects" ON public.business_projects;
CREATE POLICY "Anyone can view business projects" ON public.business_projects
  FOR SELECT
  USING (true);

-- 2. 誰でも新規作成可能（未ログインユーザー対応）
-- ※ user_idはNULL許可、ログイン済みの場合のみ設定される
DROP POLICY IF EXISTS "Authenticated users can create business projects" ON public.business_projects;
DROP POLICY IF EXISTS "Anyone can create business projects" ON public.business_projects;
CREATE POLICY "Anyone can create business projects" ON public.business_projects
  FOR INSERT
  WITH CHECK (true);

-- 3. 自分のプロジェクトのみ更新可能（user_idがNULLの場合は誰でも更新可能）
DROP POLICY IF EXISTS "Users can update own business projects" ON public.business_projects;
CREATE POLICY "Users can update own business projects" ON public.business_projects
  FOR UPDATE
  USING (user_id IS NULL OR auth.uid() = user_id)
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- 4. 自分のプロジェクトのみ削除可能（user_idがNULLの場合は誰でも削除可能）
DROP POLICY IF EXISTS "Users can delete own business projects" ON public.business_projects;
CREATE POLICY "Users can delete own business projects" ON public.business_projects
  FOR DELETE
  USING (user_id IS NULL OR auth.uid() = user_id);

-- =============================================
-- 確認用クエリ（実行後に確認）
-- =============================================
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename = 'business_projects';
