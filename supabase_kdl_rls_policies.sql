-- =====================================================
-- KDL（Kindle）テーブルのRLSポリシー
-- =====================================================

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Service role can do anything on kdl_chapters" ON kdl_chapters;
DROP POLICY IF EXISTS "Service role can do anything on kdl_sections" ON kdl_sections;
DROP POLICY IF EXISTS "Anyone can read kdl_chapters" ON kdl_chapters;
DROP POLICY IF EXISTS "Anyone can read kdl_sections" ON kdl_sections;
DROP POLICY IF EXISTS "Anyone can read kdl_books" ON kdl_books;

-- =====================================================
-- kdl_books テーブル
-- =====================================================
ALTER TABLE kdl_books ENABLE ROW LEVEL SECURITY;

-- 読み取りは誰でも可能
CREATE POLICY "Anyone can read kdl_books" ON kdl_books
  FOR SELECT
  USING (true);

-- 書き込み・更新・削除はサービスロールのみ
CREATE POLICY "Service role can insert kdl_books" ON kdl_books
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update kdl_books" ON kdl_books
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete kdl_books" ON kdl_books
  FOR DELETE
  USING (true);

-- =====================================================
-- kdl_chapters テーブル
-- =====================================================
ALTER TABLE kdl_chapters ENABLE ROW LEVEL SECURITY;

-- 読み取りは誰でも可能
CREATE POLICY "Anyone can read kdl_chapters" ON kdl_chapters
  FOR SELECT
  USING (true);

-- 書き込み・更新・削除はサービスロールのみ
CREATE POLICY "Service role can insert kdl_chapters" ON kdl_chapters
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update kdl_chapters" ON kdl_chapters
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete kdl_chapters" ON kdl_chapters
  FOR DELETE
  USING (true);

-- =====================================================
-- kdl_sections テーブル
-- =====================================================
ALTER TABLE kdl_sections ENABLE ROW LEVEL SECURITY;

-- 読み取りは誰でも可能
CREATE POLICY "Anyone can read kdl_sections" ON kdl_sections
  FOR SELECT
  USING (true);

-- 書き込み・更新・削除はサービスロールのみ
CREATE POLICY "Service role can insert kdl_sections" ON kdl_sections
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update kdl_sections" ON kdl_sections
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can delete kdl_sections" ON kdl_sections
  FOR DELETE
  USING (true);







