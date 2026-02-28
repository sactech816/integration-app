-- =============================================
-- 簡易ファネル機能（Funnel Maker）
-- Phase 3: 既存ページを繋いでフロー可視化・CV計測
-- =============================================

-- 1. ファネル定義
CREATE TABLE IF NOT EXISTS funnels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  status TEXT DEFAULT 'draft',  -- draft | active
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE funnels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_funnels" ON funnels
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own funnels" ON funnels
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active funnels" ON funnels
  FOR SELECT TO anon
  USING (status = 'active');

CREATE POLICY "Authenticated can view active funnels" ON funnels
  FOR SELECT TO authenticated
  USING (status = 'active');

CREATE POLICY "Users can insert own funnels" ON funnels
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own funnels" ON funnels
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own funnels" ON funnels
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_funnels_user_id ON funnels(user_id);
CREATE INDEX idx_funnels_slug ON funnels(slug);
CREATE INDEX idx_funnels_status ON funnels(status);

-- 2. ファネルステップ
CREATE TABLE IF NOT EXISTS funnel_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  order_index INTEGER DEFAULT 0,
  name TEXT NOT NULL,
  step_type TEXT NOT NULL,  -- profile_lp | quiz | order_form | newsletter | booking | custom_url | thank_you
  content_ref JSONB,        -- {type: 'quiz', slug: 'xxx'} or {type: 'url', url: 'https://...'}
  cta_label TEXT DEFAULT '次へ進む',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE funnel_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_funnel_steps" ON funnel_steps
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Funnel owners can view steps" ON funnel_steps
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM funnels
      WHERE funnels.id = funnel_steps.funnel_id
      AND (funnels.user_id = auth.uid() OR funnels.status = 'active')
    )
  );

CREATE POLICY "Anyone can view active funnel steps" ON funnel_steps
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM funnels
      WHERE funnels.id = funnel_steps.funnel_id
      AND funnels.status = 'active'
    )
  );

CREATE POLICY "Funnel owners can insert steps" ON funnel_steps
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM funnels
      WHERE funnels.id = funnel_steps.funnel_id
      AND funnels.user_id = auth.uid()
    )
  );

CREATE POLICY "Funnel owners can update steps" ON funnel_steps
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM funnels
      WHERE funnels.id = funnel_steps.funnel_id
      AND funnels.user_id = auth.uid()
    )
  );

CREATE POLICY "Funnel owners can delete steps" ON funnel_steps
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM funnels
      WHERE funnels.id = funnel_steps.funnel_id
      AND funnels.user_id = auth.uid()
    )
  );

CREATE INDEX idx_funnel_steps_funnel_id ON funnel_steps(funnel_id);

-- 3. ファネルアナリティクス
CREATE TABLE IF NOT EXISTS funnel_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  funnel_id UUID NOT NULL REFERENCES funnels(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES funnel_steps(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,  -- view | cta_click | complete
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE funnel_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_funnel_analytics" ON funnel_analytics
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 誰でもイベント記録可能
CREATE POLICY "Anyone can insert analytics" ON funnel_analytics
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Authenticated can insert analytics" ON funnel_analytics
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- ファネル所有者のみ閲覧可能
CREATE POLICY "Funnel owners can view analytics" ON funnel_analytics
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM funnels
      WHERE funnels.id = funnel_analytics.funnel_id
      AND funnels.user_id = auth.uid()
    )
  );

CREATE INDEX idx_funnel_analytics_funnel_id ON funnel_analytics(funnel_id);
CREATE INDEX idx_funnel_analytics_step_id ON funnel_analytics(step_id);
CREATE INDEX idx_funnel_analytics_session_id ON funnel_analytics(session_id);
CREATE INDEX idx_funnel_analytics_created_at ON funnel_analytics(created_at DESC);
