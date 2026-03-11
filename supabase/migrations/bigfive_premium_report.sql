-- =============================================================================
-- Big Five プレミアムレポート拡張
-- =============================================================================

-- bigfive_results にレポート関連カラム追加
ALTER TABLE bigfive_results
  ADD COLUMN IF NOT EXISTS report_content TEXT,
  ADD COLUMN IF NOT EXISTS report_generated_at TIMESTAMPTZ;

-- =============================================================================
-- AIチャットメッセージテーブル
-- =============================================================================
CREATE TABLE IF NOT EXISTS bigfive_chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  result_id UUID NOT NULL REFERENCES bigfive_results(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_bigfive_chat_result_id ON bigfive_chat_messages(result_id, created_at);
CREATE INDEX IF NOT EXISTS idx_bigfive_chat_user_id ON bigfive_chat_messages(user_id);

-- RLS
ALTER TABLE bigfive_chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bigfive chat messages"
  ON bigfive_chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bigfive chat messages"
  ON bigfive_chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bigfive chat messages"
  ON bigfive_chat_messages FOR DELETE
  USING (auth.uid() = user_id);
