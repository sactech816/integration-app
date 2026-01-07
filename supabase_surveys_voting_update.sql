-- ===========================================
-- アンケート投票機能追加マイグレーション
-- ===========================================

-- 1. surveysテーブルに投票モードカラムを追加
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS show_results_after_submission BOOLEAN DEFAULT false;

-- 2. 回答保存テーブルを作成（投票結果の集計に必要）
CREATE TABLE IF NOT EXISTS survey_responses (
  id SERIAL PRIMARY KEY,
  survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
  answers JSONB NOT NULL,
  respondent_email TEXT,
  respondent_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey_id ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_created_at ON survey_responses(created_at DESC);

-- RLSポリシー設定
ALTER TABLE survey_responses ENABLE ROW LEVEL SECURITY;

-- 誰でも回答を投稿可能（匿名投票を許可）
CREATE POLICY "Anyone can insert survey responses"
  ON survey_responses FOR INSERT
  WITH CHECK (true);

-- 回答の閲覧は投票モードがONのアンケートのみ許可
CREATE POLICY "Responses viewable when voting mode is on"
  ON survey_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM surveys 
      WHERE surveys.id = survey_responses.survey_id 
      AND surveys.show_results_after_submission = true
    )
  );

-- アンケート作成者は自分のアンケートへの回答を閲覧可能
CREATE POLICY "Survey owners can view responses"
  ON survey_responses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM surveys 
      WHERE surveys.id = survey_responses.survey_id 
      AND surveys.user_id = auth.uid()
    )
  );

-- ===========================================
-- 集計用RPC関数（パフォーマンス最適化）
-- ===========================================
CREATE OR REPLACE FUNCTION get_survey_results(p_survey_id INTEGER)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'question_id', key,
      'answers', value
    )
  ) INTO result
  FROM (
    SELECT 
      key,
      json_agg(value) as value
    FROM survey_responses sr
    CROSS JOIN LATERAL jsonb_each(sr.answers) as kv(key, value)
    WHERE sr.survey_id = p_survey_id
    GROUP BY key
  ) as aggregated;
  
  RETURN COALESCE(result, '[]'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;



