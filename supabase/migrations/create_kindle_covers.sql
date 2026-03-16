-- Kindle表紙メーカーテーブル作成
CREATE TABLE IF NOT EXISTS kindle_covers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(20) UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT '新規Kindle表紙',
  subtitle TEXT,
  author_name TEXT,
  image_url TEXT,
  genre VARCHAR(30) DEFAULT 'business',
  template_id VARCHAR(60),
  color_theme_id VARCHAR(60),
  additional_prompt TEXT,
  image_size VARCHAR(10) DEFAULT '2K',
  book_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'draft',
  views_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_kindle_covers_slug ON kindle_covers(slug);
CREATE INDEX idx_kindle_covers_user ON kindle_covers(user_id);
CREATE INDEX idx_kindle_covers_genre ON kindle_covers(genre);
CREATE INDEX idx_kindle_covers_created_at ON kindle_covers(created_at DESC);

-- RLS有効化
ALTER TABLE kindle_covers ENABLE ROW LEVEL SECURITY;

-- 全員読み取り可
CREATE POLICY "Public read kindle_covers" ON kindle_covers
  FOR SELECT USING (true);

-- ユーザーは自分の表紙を作成可
CREATE POLICY "Users can insert own kindle_covers" ON kindle_covers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の表紙を更新可
CREATE POLICY "Users can update own kindle_covers" ON kindle_covers
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分の表紙を削除可
CREATE POLICY "Users can delete own kindle_covers" ON kindle_covers
  FOR DELETE USING (auth.uid() = user_id);
