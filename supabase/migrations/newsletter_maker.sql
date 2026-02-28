-- =============================================
-- メルマガ機能（Newsletter Maker）
-- Phase 1: Resend連携・リスト管理・キャンペーン配信
-- =============================================

-- 1. 読者リスト
CREATE TABLE IF NOT EXISTS newsletter_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  resend_audience_id TEXT,
  from_name TEXT,
  from_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE newsletter_lists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_newsletter_lists" ON newsletter_lists
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own lists" ON newsletter_lists
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lists" ON newsletter_lists
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists" ON newsletter_lists
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists" ON newsletter_lists
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_newsletter_lists_user_id ON newsletter_lists(user_id);

-- 2. 読者（購読者）
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_id UUID NOT NULL REFERENCES newsletter_lists(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'subscribed',  -- subscribed | unsubscribed
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(list_id, email)
);

ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_newsletter_subscribers" ON newsletter_subscribers
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- リスト所有者のみ閲覧可能
CREATE POLICY "List owners can view subscribers" ON newsletter_subscribers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM newsletter_lists
      WHERE newsletter_lists.id = newsletter_subscribers.list_id
      AND newsletter_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "List owners can insert subscribers" ON newsletter_subscribers
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM newsletter_lists
      WHERE newsletter_lists.id = newsletter_subscribers.list_id
      AND newsletter_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "List owners can update subscribers" ON newsletter_subscribers
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM newsletter_lists
      WHERE newsletter_lists.id = newsletter_subscribers.list_id
      AND newsletter_lists.user_id = auth.uid()
    )
  );

CREATE POLICY "List owners can delete subscribers" ON newsletter_subscribers
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM newsletter_lists
      WHERE newsletter_lists.id = newsletter_subscribers.list_id
      AND newsletter_lists.user_id = auth.uid()
    )
  );

CREATE INDEX idx_newsletter_subscribers_list_id ON newsletter_subscribers(list_id);
CREATE INDEX idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_status ON newsletter_subscribers(status);

-- 3. キャンペーン（メール原稿・送信履歴）
CREATE TABLE IF NOT EXISTS newsletter_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES newsletter_lists(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  preview_text TEXT,
  html_content TEXT,
  status TEXT NOT NULL DEFAULT 'draft',  -- draft | sent
  sent_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE newsletter_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_newsletter_campaigns" ON newsletter_campaigns
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own campaigns" ON newsletter_campaigns
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own campaigns" ON newsletter_campaigns
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns" ON newsletter_campaigns
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns" ON newsletter_campaigns
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_newsletter_campaigns_user_id ON newsletter_campaigns(user_id);
CREATE INDEX idx_newsletter_campaigns_list_id ON newsletter_campaigns(list_id);
CREATE INDEX idx_newsletter_campaigns_status ON newsletter_campaigns(status);
