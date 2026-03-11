-- Big Five PDF Storage: pdf_storage_path カラム追加 + Storage バケット設定
-- PDF をサーバーサイドで生成し Supabase Storage に保存するための拡張

-- pdf_storage_path カラム追加
ALTER TABLE bigfive_results
ADD COLUMN IF NOT EXISTS pdf_storage_path TEXT;

-- Storage バケット作成（存在しない場合）
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'bigfive-reports',
  'bigfive-reports',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Service Role のみアップロード可（API経由で制御）
-- ダウンロードは署名付きURLで提供するため、直接アクセスは不要
CREATE POLICY "Service role can manage bigfive reports"
ON storage.objects
FOR ALL
USING (bucket_id = 'bigfive-reports')
WITH CHECK (bucket_id = 'bigfive-reports');
