-- =============================================
-- kdl_books テーブルに toc_pattern_id カラムを追加
-- =============================================
-- このマイグレーションは kdl_books テーブルに toc_pattern_id カラムを追加します。
-- このカラムは目次パターンIDを保存し、執筆スタイルのデフォルト決定に使用されます。

-- 1. toc_pattern_id カラムを追加
ALTER TABLE kdl_books 
ADD COLUMN IF NOT EXISTS toc_pattern_id TEXT;

-- 2. カラムにコメントを追加（ドキュメント目的）
COMMENT ON COLUMN kdl_books.toc_pattern_id IS '目次パターンID（執筆スタイルのデフォルト決定用）';

-- =============================================
-- 確認用クエリ
-- =============================================
-- 追加後、以下のクエリでカラムが正しく追加されたか確認できます：
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'kdl_books' AND column_name = 'toc_pattern_id';



























