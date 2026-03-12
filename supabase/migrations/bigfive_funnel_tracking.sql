-- =============================================================================
-- Big Five ファネルトラッキング
-- =============================================================================

-- 1. newsletter_subscribers にメタデータ列とユーザーリンク列を追加
ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS linked_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_linked_user_id
  ON newsletter_subscribers(linked_user_id) WHERE linked_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_source
  ON newsletter_subscribers(source) WHERE source = 'bigfive_sample';

-- 2. ファネルイベントテーブル（軽量・追記専用）
CREATE TABLE IF NOT EXISTS bigfive_funnel_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  email TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('sample_request', 'quiz_start', 'quiz_complete', 'pdf_purchase')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bigfive_funnel_session ON bigfive_funnel_events(session_id);
CREATE INDEX IF NOT EXISTS idx_bigfive_funnel_email ON bigfive_funnel_events(email);
CREATE INDEX IF NOT EXISTS idx_bigfive_funnel_user ON bigfive_funnel_events(user_id);
CREATE INDEX IF NOT EXISTS idx_bigfive_funnel_type ON bigfive_funnel_events(event_type);
CREATE INDEX IF NOT EXISTS idx_bigfive_funnel_created ON bigfive_funnel_events(created_at DESC);

-- RLS
ALTER TABLE bigfive_funnel_events ENABLE ROW LEVEL SECURITY;

-- service_role は全操作可能（API Route経由）
DROP POLICY IF EXISTS "service_role_bigfive_funnel" ON bigfive_funnel_events;
CREATE POLICY "service_role_bigfive_funnel" ON bigfive_funnel_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 認証ユーザーは自分のイベントのみ閲覧可能
DROP POLICY IF EXISTS "Users can view own funnel events" ON bigfive_funnel_events;
CREATE POLICY "Users can view own funnel events" ON bigfive_funnel_events
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 匿名ユーザー（未ログイン）もイベント挿入可能（サンプル申込用）
DROP POLICY IF EXISTS "Anyone can insert funnel events" ON bigfive_funnel_events;
CREATE POLICY "Anyone can insert funnel events" ON bigfive_funnel_events
  FOR INSERT
  WITH CHECK (true);
