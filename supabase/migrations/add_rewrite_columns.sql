-- =============================================
-- まるごとリライト（文体変換）用カラム追加
-- kdl_books テーブルにリライト元情報と進捗状態を追加
-- =============================================

ALTER TABLE kdl_books
  ADD COLUMN IF NOT EXISTS source_book_id UUID REFERENCES kdl_books(id),
  ADD COLUMN IF NOT EXISTS rewrite_style TEXT,
  ADD COLUMN IF NOT EXISTS rewrite_status TEXT
    CHECK (rewrite_status IS NULL OR rewrite_status IN ('pending', 'in_progress', 'completed', 'failed'));

COMMENT ON COLUMN kdl_books.source_book_id IS '文体変換元の書籍ID（コピー元）';
COMMENT ON COLUMN kdl_books.rewrite_style IS '文体変換先のスタイル（descriptive/narrative/dialogue/qa/workbook）';
COMMENT ON COLUMN kdl_books.rewrite_status IS '文体変換の進捗状態';

-- インデックス
CREATE INDEX IF NOT EXISTS idx_kdl_books_source_book_id ON kdl_books(source_book_id);
