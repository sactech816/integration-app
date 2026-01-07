-- ===========================================
-- アンケートシステム用テーブル作成
-- ===========================================

-- surveysテーブル（アンケート定義を保存）
CREATE TABLE IF NOT EXISTS surveys (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  questions JSONB NOT NULL DEFAULT '[]',
  creator_email TEXT NOT NULL,
  creator_name TEXT,
  thank_you_message TEXT DEFAULT 'ご回答ありがとうございました！',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  settings JSONB DEFAULT '{}',
  show_in_portal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_surveys_slug ON surveys(slug);
CREATE INDEX IF NOT EXISTS idx_surveys_user_id ON surveys(user_id);
CREATE INDEX IF NOT EXISTS idx_surveys_created_at ON surveys(created_at DESC);

-- RLSポリシー設定
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;

-- 誰でも閲覧可能（公開アンケート）
CREATE POLICY "Surveys are viewable by everyone"
  ON surveys FOR SELECT
  USING (true);

-- 認証ユーザーは自分のアンケートを作成可能
CREATE POLICY "Users can create their own surveys"
  ON surveys FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- 認証ユーザーは自分のアンケートを更新可能
CREATE POLICY "Users can update their own surveys"
  ON surveys FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 認証ユーザーは自分のアンケートを削除可能
CREATE POLICY "Users can delete their own surveys"
  ON surveys FOR DELETE
  USING (auth.uid() = user_id);

-- updated_atを自動更新するトリガー
CREATE OR REPLACE FUNCTION update_surveys_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER surveys_updated_at_trigger
  BEFORE UPDATE ON surveys
  FOR EACH ROW
  EXECUTE FUNCTION update_surveys_updated_at();

-- ===========================================
-- 【将来用】回答保存テーブル（必要になったら有効化）
-- ===========================================
-- CREATE TABLE IF NOT EXISTS survey_responses (
--   id SERIAL PRIMARY KEY,
--   survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
--   answers JSONB NOT NULL,
--   respondent_email TEXT,
--   respondent_name TEXT,
--   created_at TIMESTAMPTZ DEFAULT NOW()
-- );
-- 
-- CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
-- CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at DESC);



