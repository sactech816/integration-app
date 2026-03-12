-- =============================================================================
-- 生年月日占い プレミアムレポート用カラム追加
-- =============================================================================

ALTER TABLE fortune_results ADD COLUMN IF NOT EXISTS report_purchased BOOLEAN DEFAULT false;
ALTER TABLE fortune_results ADD COLUMN IF NOT EXISTS report_purchased_at TIMESTAMPTZ;
ALTER TABLE fortune_results ADD COLUMN IF NOT EXISTS report_content TEXT;
ALTER TABLE fortune_results ADD COLUMN IF NOT EXISTS report_generated_at TIMESTAMPTZ;
ALTER TABLE fortune_results ADD COLUMN IF NOT EXISTS pdf_storage_path TEXT;
ALTER TABLE fortune_results ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- =============================================================================
-- Fortune Reports Storage バケット
-- =============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fortune-reports',
  'fortune-reports',
  false,
  10485760,  -- 10MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "service_role_fortune_reports_all"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'fortune-reports')
  WITH CHECK (bucket_id = 'fortune-reports');
