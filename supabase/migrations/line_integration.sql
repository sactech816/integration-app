-- =============================================
-- LINE公式アカウント連携（LINE Official Account Integration）
-- Phase 1: アカウント接続設定
-- Phase 2: 友だち追加導線・友だちリスト・単独配信
-- =============================================

-- 1. LINE公式アカウント設定（ユーザーごとに1つ）
CREATE TABLE IF NOT EXISTS line_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_id TEXT NOT NULL,
  channel_secret TEXT NOT NULL,
  channel_access_token TEXT NOT NULL,
  bot_basic_id TEXT,                -- LINE公式アカウントの Basic ID（@xxx）
  display_name TEXT,                -- 表示名
  friend_add_message TEXT,          -- 友だち追加時のメッセージ
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE line_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_line_accounts" ON line_accounts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own line_accounts" ON line_accounts
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own line_accounts" ON line_accounts
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own line_accounts" ON line_accounts
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own line_accounts" ON line_accounts
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_line_accounts_user_id ON line_accounts(user_id);

-- 2. LINE友だち（各ツール経由で友だち追加されたユーザー）
CREATE TABLE IF NOT EXISTS line_friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  line_user_id TEXT NOT NULL,
  display_name TEXT,
  picture_url TEXT,
  status_message TEXT,
  source_type TEXT NOT NULL,        -- quiz | entertainment_quiz | profile | business | survey | booking | etc.
  source_id UUID,                   -- どのコンテンツ経由か
  status TEXT NOT NULL DEFAULT 'active',  -- active | blocked | unfollowed
  followed_at TIMESTAMPTZ DEFAULT NOW(),
  unfollowed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(owner_id, line_user_id)
);

ALTER TABLE line_friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_line_friends" ON line_friends
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Owners can view own friends" ON line_friends
  FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can manage own friends" ON line_friends
  FOR ALL TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE INDEX idx_line_friends_owner_id ON line_friends(owner_id);
CREATE INDEX idx_line_friends_line_user_id ON line_friends(line_user_id);
CREATE INDEX idx_line_friends_source ON line_friends(source_type, source_id);
CREATE INDEX idx_line_friends_status ON line_friends(status);

-- 3. LINE配信メッセージ（単独配信）
CREATE TABLE IF NOT EXISTS line_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,                -- 管理用タイトル
  message_type TEXT NOT NULL DEFAULT 'text',  -- text | image | flex
  content JSONB NOT NULL,             -- LINE Message Object（テキスト、画像、Flexメッセージ等）
  target_type TEXT NOT NULL DEFAULT 'all',  -- all | segment
  target_filter JSONB,                -- セグメント条件 { source_type: "quiz", source_id: "xxx" }
  status TEXT NOT NULL DEFAULT 'draft',  -- draft | sent
  sent_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE line_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_line_messages" ON line_messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own messages" ON line_messages
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages" ON line_messages
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" ON line_messages
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" ON line_messages
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_line_messages_user_id ON line_messages(user_id);
CREATE INDEX idx_line_messages_status ON line_messages(status);

-- 4. LINE配信ログ（送信結果の記録）
CREATE TABLE IF NOT EXISTS line_send_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id UUID NOT NULL REFERENCES line_messages(id) ON DELETE CASCADE,
  friend_id UUID NOT NULL REFERENCES line_friends(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending | sent | failed
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE line_send_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_line_send_logs" ON line_send_logs
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Message owners can view logs" ON line_send_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM line_messages
      WHERE line_messages.id = line_send_logs.message_id
      AND line_messages.user_id = auth.uid()
    )
  );

CREATE INDEX idx_line_send_logs_message_id ON line_send_logs(message_id);
CREATE INDEX idx_line_send_logs_friend_id ON line_send_logs(friend_id);
CREATE INDEX idx_line_send_logs_status ON line_send_logs(status);
