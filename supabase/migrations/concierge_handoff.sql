-- ============================================================
-- コンシェルジュ 人間チャットハンドオフ機能
-- セッション管理 + オペレータープレゼンス + Realtime対応
-- ============================================================

-- 1. セッション管理テーブル
CREATE TABLE IF NOT EXISTS concierge_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  visitor_id text,
  mode text NOT NULL DEFAULT 'ai' CHECK (mode IN ('ai', 'human')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'waiting', 'assigned', 'closed')),
  assigned_operator_id uuid REFERENCES auth.users(id),
  user_email text,
  user_plan text,
  current_page text,
  summary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  closed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_concierge_sessions_status ON concierge_sessions(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_concierge_sessions_operator ON concierge_sessions(assigned_operator_id, status);
CREATE INDEX IF NOT EXISTS idx_concierge_sessions_user ON concierge_sessions(user_id);

-- 2. オペレーターオンライン状態テーブル
CREATE TABLE IF NOT EXISTS concierge_operator_presence (
  operator_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_online boolean DEFAULT false,
  last_seen_at timestamptz DEFAULT now(),
  status text DEFAULT 'offline' CHECK (status IN ('online', 'away', 'offline'))
);

-- 3. concierge_messagesにsender_type追加
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'concierge_messages' AND column_name = 'sender_type'
  ) THEN
    ALTER TABLE concierge_messages
      ADD COLUMN sender_type text DEFAULT 'user';
  END IF;
END $$;

-- 4. RLS ポリシー

-- concierge_sessions: 認証ユーザーは自分のセッションを閲覧可能
ALTER TABLE concierge_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions" ON concierge_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role full access to sessions" ON concierge_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- concierge_operator_presence: 全員が閲覧可能（オンライン状態の確認用）
ALTER TABLE concierge_operator_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view operator presence" ON concierge_operator_presence
  FOR SELECT USING (true);

CREATE POLICY "Service role full access to presence" ON concierge_operator_presence
  FOR ALL USING (true) WITH CHECK (true);

-- 5. Realtime有効化
-- concierge_messages と concierge_sessions をRealtimeに追加
-- 注意: 既にpublicationに含まれている場合はエラーになるため、DO BLOCKで安全に実行
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE concierge_messages;
  EXCEPTION WHEN duplicate_object THEN
    NULL; -- 既に含まれている
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE concierge_sessions;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
