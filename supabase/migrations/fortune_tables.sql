-- =============================================================================
-- 生年月日占い テーブル
-- =============================================================================

-- 1. 占い解釈文マスタ（九星・数秘・四柱推命のテキスト）
CREATE TABLE IF NOT EXISTS fortune_contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  result_key TEXT UNIQUE NOT NULL,       -- "7_red", "lp_3", "stem_5" 等
  category TEXT NOT NULL,                -- "nine_star", "numerology", "four_pillars"
  title TEXT NOT NULL,                   -- "七赤金星", "ライフパス3" 等
  content_md TEXT,                       -- Markdown形式の解説文
  type_slug TEXT,                        -- "nine_star", "numerology", "four_pillars"
  lucky_color VARCHAR,
  lucky_item VARCHAR,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fortune_contents_result_key ON fortune_contents(result_key);
CREATE INDEX IF NOT EXISTS idx_fortune_contents_category ON fortune_contents(category);

-- RLS
ALTER TABLE fortune_contents ENABLE ROW LEVEL SECURITY;

-- 全員が閲覧可能（マスタデータ）
DROP POLICY IF EXISTS "Anyone can read fortune contents" ON fortune_contents;
CREATE POLICY "Anyone can read fortune contents" ON fortune_contents
  FOR SELECT USING (true);

-- service_role のみ変更可能
DROP POLICY IF EXISTS "service_role_fortune_contents" ON fortune_contents;
CREATE POLICY "service_role_fortune_contents" ON fortune_contents
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. 診断結果テーブル（bigfive_resultsと同パターン）
CREATE TABLE IF NOT EXISTS fortune_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- 入力
  birth_year INTEGER NOT NULL,
  birth_month INTEGER NOT NULL,
  birth_day INTEGER NOT NULL,

  -- 計算結果スナップショット
  result_snapshot JSONB NOT NULL,

  -- 共有設定
  is_public BOOLEAN DEFAULT true,

  -- メタ情報
  input_details JSONB DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fortune_results_user_id ON fortune_results(user_id);
CREATE INDEX IF NOT EXISTS idx_fortune_results_created_at ON fortune_results(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fortune_results_public ON fortune_results(is_public) WHERE is_public = true;

-- RLS
ALTER TABLE fortune_results ENABLE ROW LEVEL SECURITY;

-- 公開結果は全員閲覧可能
DROP POLICY IF EXISTS "Anyone can view public fortune results" ON fortune_results;
CREATE POLICY "Anyone can view public fortune results" ON fortune_results
  FOR SELECT USING (is_public = true);

-- 自分の結果は全て閲覧可能
DROP POLICY IF EXISTS "Users can view own fortune results" ON fortune_results;
CREATE POLICY "Users can view own fortune results" ON fortune_results
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 自分の結果を更新可能
DROP POLICY IF EXISTS "Users can update own fortune results" ON fortune_results;
CREATE POLICY "Users can update own fortune results" ON fortune_results
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- 誰でも挿入可能（匿名対応）
DROP POLICY IF EXISTS "Anyone can insert fortune results" ON fortune_results;
CREATE POLICY "Anyone can insert fortune results" ON fortune_results
  FOR INSERT WITH CHECK (true);

-- service_role は全操作可能
DROP POLICY IF EXISTS "service_role_fortune_results" ON fortune_results;
CREATE POLICY "service_role_fortune_results" ON fortune_results
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 3. 日盤データ（将来の拡張用）
CREATE TABLE IF NOT EXISTS daily_fortunes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  target_date DATE UNIQUE NOT NULL,
  nine_star_center INTEGER NOT NULL,     -- 日盤中宮の星（1-9）
  numerology_number INTEGER NOT NULL,    -- 日の数秘
  classical_fortune_index INTEGER,       -- 古典格言のインデックス
  additional_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_daily_fortunes_date ON daily_fortunes(target_date DESC);

ALTER TABLE daily_fortunes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read daily fortunes" ON daily_fortunes;
CREATE POLICY "Anyone can read daily fortunes" ON daily_fortunes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "service_role_daily_fortunes" ON daily_fortunes;
CREATE POLICY "service_role_daily_fortunes" ON daily_fortunes
  FOR ALL TO service_role USING (true) WITH CHECK (true);
