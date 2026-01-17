-- =============================================
-- profiles テーブル RLS ポリシー修正
-- =============================================
-- エラー: new row violates row-level security policy for table "profiles"
-- 原因: INSERT/UPDATE ポリシーが正しく設定されていない

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Allow public insert on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;

-- RLSを有効化（まだの場合）
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 新しいポリシーを作成
-- =============================================

-- 1. 読み取り: 誰でも公開プロフィールを閲覧可能
CREATE POLICY "Anyone can read profiles" ON public.profiles
  FOR SELECT
  USING (true);

-- 2. 挿入: 認証済みユーザーは自分のプロフィールを作成可能
CREATE POLICY "Authenticated users can insert own profile" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. 更新: 認証済みユーザーは自分のプロフィールのみ更新可能
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. 削除: 認証済みユーザーは自分のプロフィールのみ削除可能
CREATE POLICY "Users can delete own profile" ON public.profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- 確認用クエリ
-- =============================================
-- 以下のクエリでポリシーを確認できます:
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

