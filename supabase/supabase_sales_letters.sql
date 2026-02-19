-- =============================================
-- セールスレターLP テーブル作成
-- =============================================

-- sales_letters テーブル
CREATE TABLE IF NOT EXISTS sales_letters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL DEFAULT 'セールスレター',
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  template_id VARCHAR(50),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- slugはユーザーごとにユニーク
  CONSTRAINT sales_letters_user_slug_unique UNIQUE (user_id, slug)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_sales_letters_user_id ON sales_letters(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_letters_slug ON sales_letters(slug);
CREATE INDEX IF NOT EXISTS idx_sales_letters_created_at ON sales_letters(created_at DESC);

-- RLS有効化
ALTER TABLE sales_letters ENABLE ROW LEVEL SECURITY;

-- RLSポリシー（既存があれば削除して再作成）

-- 既存ポリシーを削除
DROP POLICY IF EXISTS "sales_letters_select_public" ON sales_letters;
DROP POLICY IF EXISTS "sales_letters_insert_own" ON sales_letters;
DROP POLICY IF EXISTS "sales_letters_update_own" ON sales_letters;
DROP POLICY IF EXISTS "sales_letters_delete_own" ON sales_letters;

-- SELECT: 公開ページは誰でも閲覧可能
CREATE POLICY "sales_letters_select_public" ON sales_letters
  FOR SELECT
  USING (true);

-- INSERT: 誰でも作成可能（未ログインユーザー対応）
CREATE POLICY "sales_letters_insert_own" ON sales_letters
  FOR INSERT
  WITH CHECK (true);

-- UPDATE: ログインユーザーのみ、自分のデータまたはuser_idがNULLのもの
CREATE POLICY "sales_letters_update_own" ON sales_letters
  FOR UPDATE
  USING (auth.uid() IS NOT NULL AND (user_id IS NULL OR auth.uid() = user_id))
  WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR auth.uid() = user_id));

-- DELETE: 自分のデータのみ削除可能
CREATE POLICY "sales_letters_delete_own" ON sales_letters
  FOR DELETE
  USING (auth.uid() = user_id);

-- updated_at自動更新トリガー
CREATE OR REPLACE FUNCTION update_sales_letters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sales_letters_updated_at ON sales_letters;
CREATE TRIGGER trigger_sales_letters_updated_at
  BEFORE UPDATE ON sales_letters
  FOR EACH ROW
  EXECUTE FUNCTION update_sales_letters_updated_at();

-- views_countインクリメント関数
CREATE OR REPLACE FUNCTION increment_sales_letter_views(letter_slug VARCHAR)
RETURNS void AS $$
BEGIN
  UPDATE sales_letters
  SET views_count = views_count + 1
  WHERE slug = letter_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
