-- =============================================
-- ピックアップコンテンツテーブル
-- =============================================

-- テーブル作成
CREATE TABLE IF NOT EXISTS featured_contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('quiz', 'profile', 'business')),
  featured_at TIMESTAMPTZ DEFAULT NOW(),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_featured_contents_content_id ON featured_contents(content_id);
CREATE INDEX IF NOT EXISTS idx_featured_contents_content_type ON featured_contents(content_type);
CREATE INDEX IF NOT EXISTS idx_featured_contents_created_at ON featured_contents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_featured_contents_display_order ON featured_contents(display_order);

-- 複合インデックス（content_id + content_type）で重複チェックを高速化
CREATE UNIQUE INDEX IF NOT EXISTS idx_featured_contents_unique ON featured_contents(content_id, content_type);

-- RLSを有効化
ALTER TABLE featured_contents ENABLE ROW LEVEL SECURITY;

-- ポリシー: 誰でも読み取り可能（ポータルページで表示するため）
CREATE POLICY "Anyone can read featured_contents" ON featured_contents
  FOR SELECT
  USING (true);

-- ポリシー: 認証済みユーザーのみ挿入可能（管理者チェックはアプリケーション層で実施）
CREATE POLICY "Authenticated users can insert featured_contents" ON featured_contents
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ポリシー: 認証済みユーザーのみ削除可能（管理者チェックはアプリケーション層で実施）
CREATE POLICY "Authenticated users can delete featured_contents" ON featured_contents
  FOR DELETE
  TO authenticated
  USING (true);

-- ポリシー: 認証済みユーザーのみ更新可能
CREATE POLICY "Authenticated users can update featured_contents" ON featured_contents
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);


