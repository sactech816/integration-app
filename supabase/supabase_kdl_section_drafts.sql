-- =============================================
-- KDL セクションドラフト（タブ）テーブル
-- セクションごとにAI案やメモを複数保持するためのテーブル
-- =============================================

-- テーブル作成
CREATE TABLE IF NOT EXISTS kdl_section_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES kdl_sections(id) ON DELETE CASCADE,
  book_id UUID NOT NULL REFERENCES kdl_books(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'AI案',
  content TEXT NOT NULL DEFAULT '',
  tab_type TEXT NOT NULL DEFAULT 'draft' CHECK (tab_type IN ('draft', 'memo')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_kdl_section_drafts_section_id ON kdl_section_drafts(section_id);
CREATE INDEX IF NOT EXISTS idx_kdl_section_drafts_book_id ON kdl_section_drafts(book_id);

-- RLSを有効化
ALTER TABLE kdl_section_drafts ENABLE ROW LEVEL SECURITY;

-- ポリシー: service_role経由でのフルアクセス（APIルートから使用）
CREATE POLICY "Service role full access on kdl_section_drafts"
  ON kdl_section_drafts
  FOR ALL
  USING (true)
  WITH CHECK (true);
