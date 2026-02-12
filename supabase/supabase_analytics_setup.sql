-- =============================================
-- 共通アナリティクステーブル
-- =============================================

-- テーブル作成
-- 注意: カラム名は歴史的経緯により profile_id だが、全コンテンツタイプのIDを格納する汎用カラム
CREATE TABLE IF NOT EXISTS analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id TEXT NOT NULL,  -- コンテンツID（プロフィール/ビジネス/クイズ等のID）
  content_type TEXT NOT NULL CHECK (content_type IN ('quiz', 'profile', 'business', 'salesletter', 'survey', 'gamification', 'attendance', 'booking')),
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'scroll', 'time', 'read', 'completion')),
  event_data JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_analytics_profile_id ON analytics(profile_id);
CREATE INDEX IF NOT EXISTS idx_analytics_content_type ON analytics(content_type);
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_profile_id_type ON analytics(profile_id, content_type);

-- RLSを有効化
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- ポリシー: 誰でも読み取り可能（既存のポリシーがあれば削除して再作成）
DROP POLICY IF EXISTS "Anyone can read analytics" ON analytics;
CREATE POLICY "Anyone can read analytics" ON analytics
  FOR SELECT
  USING (true);

-- ポリシー: 誰でも挿入可能（匿名トラッキングのため）
DROP POLICY IF EXISTS "Anyone can insert analytics" ON analytics;
CREATE POLICY "Anyone can insert analytics" ON analytics
  FOR INSERT
  WITH CHECK (true);

-- =============================================
-- クイズ用カウンターRPC関数（オプション）
-- =============================================

-- 閲覧数を1増加
CREATE OR REPLACE FUNCTION increment_views(row_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE quizzes SET views_count = COALESCE(views_count, 0) + 1 WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 完了数を1増加
CREATE OR REPLACE FUNCTION increment_completions(row_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE quizzes SET completions_count = COALESCE(completions_count, 0) + 1 WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- クリック数を1増加
CREATE OR REPLACE FUNCTION increment_clicks(row_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE quizzes SET clicks_count = COALESCE(clicks_count, 0) + 1 WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- いいね数を1増加
CREATE OR REPLACE FUNCTION increment_likes(row_id BIGINT)
RETURNS VOID AS $$
BEGIN
    UPDATE quizzes SET likes_count = COALESCE(likes_count, 0) + 1 WHERE id = row_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =============================================
-- 共通リードテーブル
-- =============================================

-- テーブル作成
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('quiz', 'profile', 'business')),
  email TEXT NOT NULL,
  name TEXT,
  phone TEXT,
  message TEXT,
  result_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_leads_content_id ON leads(content_id);
CREATE INDEX IF NOT EXISTS idx_leads_content_type ON leads(content_type);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- RLSを有効化
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- ポリシー: 誰でも挿入可能（公開フォーム用）
DROP POLICY IF EXISTS "Anyone can insert leads" ON leads;
CREATE POLICY "Anyone can insert leads" ON leads
  FOR INSERT
  WITH CHECK (true);

-- ポリシー: 認証済みユーザーは自分のコンテンツのリードを読み取り可能
-- ※実際の実装ではユーザーIDとコンテンツの関連を確認する必要があります
DROP POLICY IF EXISTS "Authenticated users can read their leads" ON leads;
CREATE POLICY "Authenticated users can read their leads" ON leads
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- =============================================
-- 共通購入履歴テーブル
-- =============================================

-- テーブル作成
CREATE TABLE IF NOT EXISTS purchases (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('quiz', 'profile', 'business')),
  stripe_session_id TEXT UNIQUE NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_content_id ON purchases(content_id);
CREATE INDEX IF NOT EXISTS idx_purchases_content_type ON purchases(content_type);
CREATE INDEX IF NOT EXISTS idx_purchases_stripe_session ON purchases(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_purchases_created_at ON purchases(created_at DESC);

-- RLSを有効化
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の購入履歴のみ読み取り可能
DROP POLICY IF EXISTS "Users can read own purchases" ON purchases;
CREATE POLICY "Users can read own purchases" ON purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: サービスロールのみ挿入可能
DROP POLICY IF EXISTS "Service role can insert purchases" ON purchases;
CREATE POLICY "Service role can insert purchases" ON purchases
  FOR INSERT
  WITH CHECK (true);

-- =============================================
-- 既存テーブルへのカラム追加（必要に応じて実行）
-- =============================================

-- quizzesテーブルにカウンターカラムを追加
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS completions_count INTEGER DEFAULT 0;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS clicks_count INTEGER DEFAULT 0;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- profilesテーブルに設定カラムを追加
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS featured_on_top BOOLEAN DEFAULT true;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nickname TEXT;

-- business_lpsテーブルに設定カラムを追加
ALTER TABLE business_lps ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';
ALTER TABLE business_lps ADD COLUMN IF NOT EXISTS featured_on_top BOOLEAN DEFAULT true;
ALTER TABLE business_lps ADD COLUMN IF NOT EXISTS nickname TEXT;

