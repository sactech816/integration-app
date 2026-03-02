-- =============================================
-- メルマガメーカー v2
-- Phase 1: ソース追跡・予約メーカー連携・送信制限
-- Phase 2: ヘッダ/フッタ・テンプレート・プレーンテキスト
-- =============================================

-- 1. newsletter_subscribers に source カラム追加
ALTER TABLE newsletter_subscribers
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';
-- source値: 'manual', 'csv', 'quiz', 'profile', 'business', 'booking', 'order_form', 'subscribe_form'

-- 2. newsletter_lists にヘッダ/フッタカラム追加
ALTER TABLE newsletter_lists
  ADD COLUMN IF NOT EXISTS header_html TEXT,
  ADD COLUMN IF NOT EXISTS footer_html TEXT;

-- 3. newsletter_campaigns に text_content 追加（プレーンテキスト版）
ALTER TABLE newsletter_campaigns
  ADD COLUMN IF NOT EXISTS text_content TEXT;

-- 4. 月間送信ログテーブル
CREATE TABLE IF NOT EXISTS newsletter_send_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES newsletter_campaigns(id) ON DELETE SET NULL,
  sent_count INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE newsletter_send_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_newsletter_send_logs" ON newsletter_send_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own send logs" ON newsletter_send_logs
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own send logs" ON newsletter_send_logs
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_newsletter_send_logs_user_id ON newsletter_send_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_send_logs_sent_at ON newsletter_send_logs(sent_at);

-- 5. テンプレートテーブル（Phase 2で使用）
CREATE TABLE IF NOT EXISTS newsletter_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'basic', -- 'basic', 'industry'
  icon TEXT,
  header_html TEXT,
  body_html TEXT,
  footer_html TEXT,
  is_system BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE newsletter_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_newsletter_templates" ON newsletter_templates
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can view system templates" ON newsletter_templates
  FOR SELECT TO authenticated
  USING (is_system = true OR user_id = auth.uid());

CREATE POLICY "Users can manage own templates" ON newsletter_templates
  FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
