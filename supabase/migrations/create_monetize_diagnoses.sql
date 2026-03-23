-- 才能マネタイズ診断テーブル
CREATE TABLE IF NOT EXISTS monetize_diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  answers JSONB NOT NULL,
  big5_scores JSONB,
  birthday DATE,
  analysis JSONB,
  kindle_results JSONB,
  course_results JSONB,
  consulting_results JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_monetize_diagnoses_user ON monetize_diagnoses(user_id);

ALTER TABLE monetize_diagnoses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "monetize_diagnoses_read_own" ON monetize_diagnoses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "monetize_diagnoses_insert_own" ON monetize_diagnoses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "monetize_diagnoses_update_own" ON monetize_diagnoses
  FOR UPDATE USING (auth.uid() = user_id);

-- feature_products にアンロック商品を追加
INSERT INTO feature_products (id, name, description, category, price, duration_type, sort_order)
VALUES (
  'monetize_diagnosis_unlock',
  '才能マネタイズ診断 全分野アンロック',
  '全ての分野（Kindle・オンライン講座・コンサル）の詳細結果を永久にアンロック',
  'diagnosis',
  980,
  'permanent',
  200
)
ON CONFLICT (id) DO NOTHING;
