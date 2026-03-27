-- スワイプメーカー用テーブル
CREATE TABLE IF NOT EXISTS swipe_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(20) NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '新規スワイプページ',
  description TEXT,

  -- カード配列 (JSONB): [{id, type, imageUrl, templateId, themeId, textOverlay, aspectRatio}]
  cards JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- LP部分ブロック配列 (JSONB): profile/business LPと同じ形式
  content JSONB DEFAULT '[]'::jsonb,

  -- 設定 (JSONB): テーマ, 表示モード, カルーセル, 決済, トラッキング等
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- カードのアスペクト比
  aspect_ratio VARCHAR(10) NOT NULL DEFAULT '9:16',

  -- 決済設定
  payment_type VARCHAR(20) NOT NULL DEFAULT 'free',
  payment_provider VARCHAR(20),
  price INTEGER DEFAULT 0,
  stripe_price_id TEXT,
  payment_url TEXT,

  -- ユーザー
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- ステータス
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  views_count INTEGER NOT NULL DEFAULT 0,

  -- タイムスタンプ
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_swipe_pages_slug ON swipe_pages(slug);
CREATE INDEX IF NOT EXISTS idx_swipe_pages_user ON swipe_pages(user_id);
CREATE INDEX IF NOT EXISTS idx_swipe_pages_created ON swipe_pages(created_at DESC);

-- RLS
ALTER TABLE swipe_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "swipe_pages_select" ON swipe_pages FOR SELECT USING (true);
CREATE POLICY "swipe_pages_insert" ON swipe_pages FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "swipe_pages_update" ON swipe_pages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "swipe_pages_delete" ON swipe_pages FOR DELETE USING (auth.uid() = user_id);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_swipe_pages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_swipe_pages_updated_at
  BEFORE UPDATE ON swipe_pages
  FOR EACH ROW
  EXECUTE FUNCTION update_swipe_pages_updated_at();
