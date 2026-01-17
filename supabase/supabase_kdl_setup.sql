-- =============================================
-- KDL (Kindle Direct Library) テーブルのRLSポリシー設定
-- =============================================

-- =============================================
-- kdl_books テーブル
-- =============================================

-- RLSを有効化
ALTER TABLE kdl_books ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の本を読み取り可能
CREATE POLICY "Users can read own books" ON kdl_books
  FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: ユーザーは自分の本を作成可能
CREATE POLICY "Users can create own books" ON kdl_books
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ポリシー: ユーザーは自分の本を更新可能
CREATE POLICY "Users can update own books" ON kdl_books
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ポリシー: ユーザーは自分の本を削除可能
CREATE POLICY "Users can delete own books" ON kdl_books
  FOR DELETE
  USING (auth.uid() = user_id);

-- ポリシー: サービスロールは全操作可能
CREATE POLICY "Service role can do anything on kdl_books" ON kdl_books
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- kdl_chapters テーブル
-- =============================================

-- RLSを有効化
ALTER TABLE kdl_chapters ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の本の章を読み取り可能
CREATE POLICY "Users can read own chapters" ON kdl_chapters
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM kdl_books 
      WHERE kdl_books.id = kdl_chapters.book_id 
      AND kdl_books.user_id = auth.uid()
    )
  );

-- ポリシー: ユーザーは自分の本に章を作成可能
CREATE POLICY "Users can create chapters in own books" ON kdl_chapters
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM kdl_books 
      WHERE kdl_books.id = kdl_chapters.book_id 
      AND kdl_books.user_id = auth.uid()
    )
  );

-- ポリシー: ユーザーは自分の本の章を更新可能
CREATE POLICY "Users can update own chapters" ON kdl_chapters
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM kdl_books 
      WHERE kdl_books.id = kdl_chapters.book_id 
      AND kdl_books.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM kdl_books 
      WHERE kdl_books.id = kdl_chapters.book_id 
      AND kdl_books.user_id = auth.uid()
    )
  );

-- ポリシー: ユーザーは自分の本の章を削除可能
CREATE POLICY "Users can delete own chapters" ON kdl_chapters
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM kdl_books 
      WHERE kdl_books.id = kdl_chapters.book_id 
      AND kdl_books.user_id = auth.uid()
    )
  );

-- ポリシー: サービスロールは全操作可能
CREATE POLICY "Service role can do anything on kdl_chapters" ON kdl_chapters
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- kdl_sections テーブル
-- =============================================

-- RLSを有効化
ALTER TABLE kdl_sections ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の本の節を読み取り可能
CREATE POLICY "Users can read own sections" ON kdl_sections
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM kdl_books 
      WHERE kdl_books.id = kdl_sections.book_id 
      AND kdl_books.user_id = auth.uid()
    )
  );

-- ポリシー: ユーザーは自分の本に節を作成可能
CREATE POLICY "Users can create sections in own books" ON kdl_sections
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM kdl_books 
      WHERE kdl_books.id = kdl_sections.book_id 
      AND kdl_books.user_id = auth.uid()
    )
  );

-- ポリシー: ユーザーは自分の本の節を更新可能
CREATE POLICY "Users can update own sections" ON kdl_sections
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM kdl_books 
      WHERE kdl_books.id = kdl_sections.book_id 
      AND kdl_books.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM kdl_books 
      WHERE kdl_books.id = kdl_sections.book_id 
      AND kdl_books.user_id = auth.uid()
    )
  );

-- ポリシー: ユーザーは自分の本の節を削除可能
CREATE POLICY "Users can delete own sections" ON kdl_sections
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM kdl_books 
      WHERE kdl_books.id = kdl_sections.book_id 
      AND kdl_books.user_id = auth.uid()
    )
  );

-- ポリシー: サービスロールは全操作可能
CREATE POLICY "Service role can do anything on kdl_sections" ON kdl_sections
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- インデックス（パフォーマンス最適化）
-- =============================================

-- kdl_books
CREATE INDEX IF NOT EXISTS idx_kdl_books_user_id ON kdl_books(user_id);

-- kdl_chapters
CREATE INDEX IF NOT EXISTS idx_kdl_chapters_book_id ON kdl_chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_kdl_chapters_order ON kdl_chapters(book_id, order_index);

-- kdl_sections
CREATE INDEX IF NOT EXISTS idx_kdl_sections_book_id ON kdl_sections(book_id);
CREATE INDEX IF NOT EXISTS idx_kdl_sections_chapter_id ON kdl_sections(chapter_id);
CREATE INDEX IF NOT EXISTS idx_kdl_sections_order ON kdl_sections(chapter_id, order_index);

