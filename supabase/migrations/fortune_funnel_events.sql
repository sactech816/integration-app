-- =============================================================================
-- 生年月日占い ファネルイベントテーブル
-- =============================================================================

CREATE TABLE IF NOT EXISTS fortune_funnel_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,  -- 'page_view', 'quiz_start', 'quiz_complete', 'report_purchase'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fortune_funnel_event_type ON fortune_funnel_events(event_type);
CREATE INDEX IF NOT EXISTS idx_fortune_funnel_created_at ON fortune_funnel_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fortune_funnel_session ON fortune_funnel_events(session_id);

-- RLS
ALTER TABLE fortune_funnel_events ENABLE ROW LEVEL SECURITY;

-- 誰でも挿入可能（匿名対応）
DROP POLICY IF EXISTS "Anyone can insert fortune funnel events" ON fortune_funnel_events;
CREATE POLICY "Anyone can insert fortune funnel events" ON fortune_funnel_events
  FOR INSERT WITH CHECK (true);

-- service_role のみ閲覧・操作可能
DROP POLICY IF EXISTS "service_role_fortune_funnel" ON fortune_funnel_events;
CREATE POLICY "service_role_fortune_funnel" ON fortune_funnel_events
  FOR ALL TO service_role USING (true) WITH CHECK (true);
