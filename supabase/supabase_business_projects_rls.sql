-- =============================================
-- business_projects テーブルのRLSポリシー修正
-- 問題: 管理者用ポリシーのみで、一般ユーザーが操作できない
-- =============================================

-- 1. 誰でも公開されたビジネスLPを閲覧可能
DROP POLICY IF EXISTS "Anyone can view business projects" ON public.business_projects;
CREATE POLICY "Anyone can view business projects" ON public.business_projects
  FOR SELECT
  USING (true);

-- 2. ログインユーザーは新規作成可能
DROP POLICY IF EXISTS "Authenticated users can create business projects" ON public.business_projects;
CREATE POLICY "Authenticated users can create business projects" ON public.business_projects
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- 3. 自分のプロジェクトのみ更新可能
DROP POLICY IF EXISTS "Users can update own business projects" ON public.business_projects;
CREATE POLICY "Users can update own business projects" ON public.business_projects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. 自分のプロジェクトのみ削除可能
DROP POLICY IF EXISTS "Users can delete own business projects" ON public.business_projects;
CREATE POLICY "Users can delete own business projects" ON public.business_projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 確認用クエリ（実行後に確認）
-- =============================================
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename = 'business_projects';
