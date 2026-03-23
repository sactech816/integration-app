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
  sns_results JSONB,
  digital_results JSONB,
  master_report JSONB,
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

-- 分野別レポート（各¥980）
INSERT INTO feature_products (id, name, description, category, price, duration_type, sort_order)
VALUES
  ('monetize_diag_kindle', 'Kindle出版レポート', 'Kindle出版分野の詳細診断結果（5件の提案＋章構成案＋差別化ポイント）', 'diagnosis', 980, 'permanent', 200),
  ('monetize_diag_course', 'オンライン講座レポート', 'オンライン講座分野の詳細診断結果（5件の提案＋カリキュラム＋差別化ポイント）', 'diagnosis', 980, 'permanent', 201),
  ('monetize_diag_consulting', 'コンサル・コーチングレポート', 'コンサル・コーチング分野の詳細診断結果（5件の提案＋提供内容＋差別化ポイント）', 'diagnosis', 980, 'permanent', 202),
  ('monetize_diag_sns', 'SNS発信レポート', 'SNS発信分野の詳細診断結果（5件の提案＋投稿ネタ＋収益化ルート）', 'diagnosis', 980, 'permanent', 203),
  ('monetize_diag_digital', 'デジタル商品レポート', 'デジタル商品分野の詳細診断結果（5件の提案＋商品設計＋販売チャネル）', 'diagnosis', 980, 'permanent', 204)
ON CONFLICT (id) DO NOTHING;

-- 完全診断レポート（全分野＋総括レポート ¥3,980）
INSERT INTO feature_products (id, name, description, category, price, duration_type, sort_order)
VALUES (
  'monetize_diag_complete',
  '完全診断レポート',
  '全5分野の詳細結果（25件の提案）＋総括レポート（収益化ロードマップ・分野連携戦略）',
  'diagnosis',
  3980,
  'permanent',
  199
)
ON CONFLICT (id) DO NOTHING;
