-- =============================================
-- 古いRLSポリシーの一括削除
-- 作成日: 2026-01-25
-- =============================================
-- 
-- 重複・古いポリシーを削除し、統一されたポリシーのみを残す
-- =============================================

-- =============================================
-- 1. quizzes（診断クイズ）- 古いポリシーを削除
-- =============================================
DROP POLICY IF EXISTS "Admin Delete" ON public.quizzes;
DROP POLICY IF EXISTS "Admin Update" ON public.quizzes;
DROP POLICY IF EXISTS "Auth Insert" ON public.quizzes;
DROP POLICY IF EXISTS "Owner Delete" ON public.quizzes;
DROP POLICY IF EXISTS "Owner Update" ON public.quizzes;
DROP POLICY IF EXISTS "Public Read" ON public.quizzes;
DROP POLICY IF EXISTS "User Delete Own" ON public.quizzes;
DROP POLICY IF EXISTS "User Update Own" ON public.quizzes;
DROP POLICY IF EXISTS "Public Insert" ON public.quizzes;
DROP POLICY IF EXISTS "Public Select" ON public.quizzes;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.quizzes;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.quizzes;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.quizzes;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can view all quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Admins can manage all quizzes" ON public.quizzes;

-- =============================================
-- 2. profiles（プロフィールLP）- 古いポリシーを削除
-- =============================================
DROP POLICY IF EXISTS "Allow anonymous users to insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow anonymous users to update their profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.profiles;

-- =============================================
-- 3. business_projects（ビジネスLP）- 古いポリシーを削除
-- =============================================
DROP POLICY IF EXISTS "Users can create own business projects" ON public.business_projects;
DROP POLICY IF EXISTS "Authenticated users can create business projects" ON public.business_projects;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.business_projects;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.business_projects;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.business_projects;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.business_projects;

-- =============================================
-- 4. surveys（アンケート）- 古いポリシーを削除
-- =============================================
DROP POLICY IF EXISTS "Surveys are viewable by everyone" ON public.surveys;
DROP POLICY IF EXISTS "Users can delete their own surveys" ON public.surveys;
DROP POLICY IF EXISTS "Users can update their own surveys" ON public.surveys;
DROP POLICY IF EXISTS "Users can create their own surveys" ON public.surveys;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.surveys;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.surveys;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.surveys;
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.surveys;

-- =============================================
-- 確認用クエリ（実行後に確認）
-- =============================================
-- SELECT tablename, policyname, cmd
-- FROM pg_policies 
-- WHERE tablename IN ('quizzes', 'profiles', 'business_projects', 'surveys')
-- ORDER BY tablename, cmd;
