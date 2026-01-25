-- =============================================
-- RLSポリシー完全リセット
-- 作成日: 2026-01-25
-- =============================================
-- 
-- 全ての既存ポリシーを削除し、新しいポリシーのみを適用
-- =============================================

-- =============================================
-- 1. quizzes（診断クイズ）
-- =============================================
-- 全ての既存ポリシーを削除
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'quizzes' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.quizzes', pol.policyname);
    END LOOP;
END $$;

-- 新しいポリシーを作成
CREATE POLICY "Anyone can view quizzes" ON public.quizzes
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create quizzes" ON public.quizzes
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own quizzes" ON public.quizzes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own quizzes" ON public.quizzes
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 2. profiles（プロフィールLP）
-- =============================================
-- 全ての既存ポリシーを削除
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname);
    END LOOP;
END $$;

-- 新しいポリシーを作成
CREATE POLICY "Anyone can read profiles" ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create profiles" ON public.profiles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 3. business_projects（ビジネスLP）
-- =============================================
-- 全ての既存ポリシーを削除
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'business_projects' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.business_projects', pol.policyname);
    END LOOP;
END $$;

-- 新しいポリシーを作成
CREATE POLICY "Anyone can view business projects" ON public.business_projects
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create business projects" ON public.business_projects
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own business projects" ON public.business_projects
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own business projects" ON public.business_projects
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 4. surveys（アンケート）
-- =============================================
-- 全ての既存ポリシーを削除
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'surveys' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.surveys', pol.policyname);
    END LOOP;
END $$;

-- 新しいポリシーを作成
CREATE POLICY "Anyone can view surveys" ON public.surveys
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create surveys" ON public.surveys
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own surveys" ON public.surveys
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own surveys" ON public.surveys
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- 確認用クエリ
-- =============================================
SELECT tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE tablename IN ('quizzes', 'profiles', 'business_projects', 'surveys')
ORDER BY tablename, cmd;
