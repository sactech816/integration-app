-- =============================================
-- AIフェーズ拡張: LP生成・一括リライト・原稿インポート
-- =============================================

-- admin_ai_settings テーブルに新フェーズ用のカラムを追加
ALTER TABLE admin_ai_settings
  ADD COLUMN IF NOT EXISTS custom_lp_generation_model TEXT,
  ADD COLUMN IF NOT EXISTS backup_lp_generation_model TEXT,
  ADD COLUMN IF NOT EXISTS custom_rewrite_bulk_model TEXT,
  ADD COLUMN IF NOT EXISTS backup_rewrite_bulk_model TEXT,
  ADD COLUMN IF NOT EXISTS custom_import_analysis_model TEXT,
  ADD COLUMN IF NOT EXISTS backup_import_analysis_model TEXT;

COMMENT ON COLUMN admin_ai_settings.custom_lp_generation_model IS 'LP自動生成用メインモデル';
COMMENT ON COLUMN admin_ai_settings.backup_lp_generation_model IS 'LP自動生成用バックアップモデル';
COMMENT ON COLUMN admin_ai_settings.custom_rewrite_bulk_model IS '一括リライト用メインモデル';
COMMENT ON COLUMN admin_ai_settings.backup_rewrite_bulk_model IS '一括リライト用バックアップモデル';
COMMENT ON COLUMN admin_ai_settings.custom_import_analysis_model IS '原稿インポート構造分析用メインモデル';
COMMENT ON COLUMN admin_ai_settings.backup_import_analysis_model IS '原稿インポート構造分析用バックアップモデル';
