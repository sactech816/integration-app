-- サムネイルメーカーテーブル作成
CREATE TABLE IF NOT EXISTS thumbnails (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(20) UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT '新規サムネイル',
  description TEXT,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  image_url TEXT,
  image_versions JSONB DEFAULT '[]'::jsonb,
  platform VARCHAR(30) DEFAULT 'youtube',
  aspect_ratio VARCHAR(10) DEFAULT '16:9',
  template_id VARCHAR(50),
  prompt_text TEXT,
  text_overlay JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'draft',
  views_count INTEGER DEFAULT 0,
  downloads_count INTEGER DEFAULT 0,
  show_in_portal BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_thumbnails_slug ON thumbnails(slug);
CREATE INDEX idx_thumbnails_user ON thumbnails(user_id);
CREATE INDEX idx_thumbnails_platform ON thumbnails(platform);
CREATE INDEX idx_thumbnails_created_at ON thumbnails(created_at DESC);

-- RLS有効化
ALTER TABLE thumbnails ENABLE ROW LEVEL SECURITY;

-- 全員読み取り可
CREATE POLICY "Public read thumbnails" ON thumbnails
  FOR SELECT USING (true);

-- ユーザーは自分のサムネイルを作成可（ゲスト作成も許可）
CREATE POLICY "Users can insert own thumbnails" ON thumbnails
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ユーザーは自分のサムネイルを更新可
CREATE POLICY "Users can update own thumbnails" ON thumbnails
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分のサムネイルを削除可
CREATE POLICY "Users can delete own thumbnails" ON thumbnails
  FOR DELETE USING (auth.uid() = user_id);
