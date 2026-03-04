-- SNS投稿メーカー テーブル作成
CREATE TABLE IF NOT EXISTS sns_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug VARCHAR(20) UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT '新規SNS投稿',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  platform VARCHAR(20) NOT NULL DEFAULT 'twitter',
  tone VARCHAR(30) DEFAULT 'business',
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(20) DEFAULT 'draft',
  views_count INTEGER DEFAULT 0,
  show_in_portal BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_sns_posts_slug ON sns_posts(slug);
CREATE INDEX idx_sns_posts_user ON sns_posts(user_id);
CREATE INDEX idx_sns_posts_platform ON sns_posts(platform);
CREATE INDEX idx_sns_posts_created_at ON sns_posts(created_at DESC);

-- RLS有効化
ALTER TABLE sns_posts ENABLE ROW LEVEL SECURITY;

-- 全員読み取り可
CREATE POLICY "Public read sns_posts" ON sns_posts
  FOR SELECT USING (true);

-- ユーザーは自分の投稿を作成可（ゲスト作成も許可）
CREATE POLICY "Users can insert own sns_posts" ON sns_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ユーザーは自分の投稿を更新可
CREATE POLICY "Users can update own sns_posts" ON sns_posts
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分の投稿を削除可
CREATE POLICY "Users can delete own sns_posts" ON sns_posts
  FOR DELETE USING (auth.uid() = user_id);
