-- =============================================================================
-- Big Five 性格診断 テーブル
-- =============================================================================

-- 診断結果テーブル
CREATE TABLE IF NOT EXISTS bigfive_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL CHECK (test_type IN ('simple', 'full')),

  -- Big Five スコア（パーセント）
  openness INTEGER NOT NULL,
  conscientiousness INTEGER NOT NULL,
  extraversion INTEGER NOT NULL,
  agreeableness INTEGER NOT NULL,
  neuroticism INTEGER NOT NULL,

  -- ファセットスコア（JSONB）
  facet_scores JSONB,

  -- MBTI風タイプ
  mbti_code TEXT,           -- e.g. "INFP"
  mbti_dimensions JSONB,    -- { EI: {...}, SN: {...}, TF: {...}, JP: {...} }

  -- 回答データ
  answers JSONB,
  duration_seconds INTEGER,

  -- 共有設定
  is_public BOOLEAN DEFAULT false,

  -- PDF購入
  pdf_purchased BOOLEAN DEFAULT false,
  pdf_purchased_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_bigfive_results_user_id ON bigfive_results(user_id);
CREATE INDEX IF NOT EXISTS idx_bigfive_results_created_at ON bigfive_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bigfive_results_public ON bigfive_results(is_public) WHERE is_public = true;

-- RLS
ALTER TABLE bigfive_results ENABLE ROW LEVEL SECURITY;

-- ポリシー: 自分の結果のみ閲覧・更新可能
CREATE POLICY "Users can view own bigfive results"
  ON bigfive_results FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own bigfive results"
  ON bigfive_results FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bigfive results"
  ON bigfive_results FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bigfive results"
  ON bigfive_results FOR DELETE
  USING (auth.uid() = user_id);
