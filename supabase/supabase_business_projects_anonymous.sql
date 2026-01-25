-- =============================================
-- business_projects テーブル: 未ログインユーザーでも作成可能に変更
-- 実行日: 2026-01-25
-- 目的: 診断クイズやプロフィールLPと同様に、未ログインでも保存できるようにする
-- =============================================

-- 既存のINSERTポリシーを削除
DROP POLICY IF EXISTS "Authenticated users can create business projects" ON public.business_projects;

-- 新しいINSERTポリシー: 誰でも作成可能（user_idがNULLまたは自分のIDの場合）
CREATE POLICY "Anyone can create business projects" ON public.business_projects
  FOR INSERT
  WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- =============================================
-- 確認用クエリ（実行後に確認）
-- =============================================
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies 
-- WHERE tablename = 'business_projects';

-- =============================================
-- 補足: 既存のポリシー（変更なし）
-- =============================================
-- - "Anyone can view business projects": 誰でも閲覧可能（維持）
-- - "Users can update own business projects": 自分のプロジェクトのみ更新可能（維持）
-- - "Users can delete own business projects": 自分のプロジェクトのみ削除可能（維持）
-- - "Admins can view all business_projects": 管理者は全て閲覧可能（維持）
-- - "Admins can manage all business_projects": 管理者は全て管理可能（維持）
