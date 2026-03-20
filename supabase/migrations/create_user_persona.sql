-- ユーザーペルソナテーブル
-- ペルソナ選択とツール表示設定を管理
CREATE TABLE IF NOT EXISTS user_persona (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  persona_id TEXT NOT NULL DEFAULT 'startup',
  enabled_tool_ids TEXT[] DEFAULT '{}',
  show_all_tools BOOLEAN DEFAULT false,
  persona_selected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLSを有効化
ALTER TABLE user_persona ENABLE ROW LEVEL SECURITY;

-- ユーザー本人のみ読み取り可能
CREATE POLICY "Users can read own persona"
  ON user_persona
  FOR SELECT
  USING (auth.uid() = user_id);

-- ユーザー本人のみ挿入可能
CREATE POLICY "Users can insert own persona"
  ON user_persona
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ユーザー本人のみ更新可能
CREATE POLICY "Users can update own persona"
  ON user_persona
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Service Role用: 全操作可能（サーバーサイドAPI用）
CREATE POLICY "Service role full access"
  ON user_persona
  FOR ALL
  USING (auth.role() = 'service_role');
