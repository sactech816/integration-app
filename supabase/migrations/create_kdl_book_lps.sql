-- =============================================
-- 書籍PR用LP (Landing Page) テーブル
-- 執筆完了後、書籍データからAIでLP構造を自動生成し保存する
-- PASONA フレームワーク対応 (13セクション)
-- =============================================

CREATE TABLE IF NOT EXISTS kdl_book_lps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES kdl_books(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,

  -- LP構造データ（PASONA フレームワーク順）
  hero JSONB DEFAULT '{}',              -- { catchcopy, subtitle, description }
  pain_points JSONB DEFAULT '[]',       -- [{ title, description }] 3-5件
  author_profile JSONB DEFAULT '{}',    -- { name, credentials, story }
  benefits JSONB DEFAULT '[]',          -- [{ title, description }] 5件
  key_takeaways JSONB DEFAULT '[]',     -- [{ number, title, description }] 3-5件
  target_readers JSONB DEFAULT '{}',    -- { heading, items[] }
  transformation JSONB DEFAULT '{}',    -- { before[], after[] }
  chapter_summaries JSONB DEFAULT '[]', -- [{ chapter_title, summary }]
  social_proof JSONB DEFAULT '[]',      -- [{ quote, reviewer_name, rating }] 3件
  bonus JSONB DEFAULT '[]',             -- [{ title, description }] 2-3件
  faq JSONB DEFAULT '[]',              -- [{ question, answer }] 3-5件
  closing_message JSONB DEFAULT '{}',   -- { title, message }
  cta JSONB DEFAULT '{}',             -- { amazon_link, line_link, cta_text }

  -- カスタマイズ
  theme_color TEXT DEFAULT 'orange',    -- テーマカラー (orange, navy, purple, green, red)
  custom_css TEXT,                      -- カスタムCSS（将来用）
  section_visibility JSONB DEFAULT '{}', -- セクション表示/非表示制御
  cover_image_url TEXT,                 -- 書籍カバー画像URL

  -- メタデータ
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  ai_model_used TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(book_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_kdl_book_lps_book_id ON kdl_book_lps(book_id);
CREATE INDEX IF NOT EXISTS idx_kdl_book_lps_user_id ON kdl_book_lps(user_id);
CREATE INDEX IF NOT EXISTS idx_kdl_book_lps_status ON kdl_book_lps(status);

-- RLS
ALTER TABLE kdl_book_lps ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のLPを管理可能
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can manage own LPs' AND tablename = 'kdl_book_lps') THEN
    CREATE POLICY "Users can manage own LPs" ON kdl_book_lps
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- 公開LPは誰でも閲覧可能
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Published LPs are public' AND tablename = 'kdl_book_lps') THEN
    CREATE POLICY "Published LPs are public" ON kdl_book_lps
      FOR SELECT USING (status = 'published');
  END IF;
END $$;
