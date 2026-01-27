-- ユーザーのカスタムカラープリセットを保存するテーブル
CREATE TABLE IF NOT EXISTS user_color_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  value TEXT NOT NULL, -- 単色: "#3CACAE" or グラデーション: "linear-gradient(...)"
  is_animated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_user_color_presets_user_id ON user_color_presets(user_id);

-- RLSを有効化
ALTER TABLE user_color_presets ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: ユーザーは自分のプリセットのみ操作可能
CREATE POLICY "Users can view their own color presets"
  ON user_color_presets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own color presets"
  ON user_color_presets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own color presets"
  ON user_color_presets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own color presets"
  ON user_color_presets FOR DELETE
  USING (auth.uid() = user_id);

-- updated_atを自動更新するトリガー
CREATE OR REPLACE FUNCTION update_user_color_presets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_color_presets_updated_at
  BEFORE UPDATE ON user_color_presets
  FOR EACH ROW
  EXECUTE FUNCTION update_user_color_presets_updated_at();
