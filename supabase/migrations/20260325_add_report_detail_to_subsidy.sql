-- 補助金申請書の追加情報カラムを追加
ALTER TABLE subsidy_results
  ADD COLUMN IF NOT EXISTS report_detail JSONB DEFAULT NULL;

COMMENT ON COLUMN subsidy_results.report_detail IS '申請書AI生成用の追加事業者情報（会社名、導入ツール、課題、予算等）';
