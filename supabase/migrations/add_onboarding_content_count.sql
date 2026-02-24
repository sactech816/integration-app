-- =============================================
-- はじめかたガイド（onboarding）の累計カウント追加
-- content_creation_counts にトリガーと初期データを追加
-- =============================================

-- 1. onboarding_modals テーブルへのトリガー追加
DROP TRIGGER IF EXISTS tr_increment_onboarding_count ON onboarding_modals;
CREATE TRIGGER tr_increment_onboarding_count
  AFTER INSERT ON onboarding_modals
  FOR EACH ROW
  EXECUTE FUNCTION increment_content_count('onboarding');

-- 2. 初期データの設定（現在のレコード数を初期値として設定）
INSERT INTO content_creation_counts (content_type, total_count) VALUES
  ('onboarding', (SELECT COUNT(*) FROM onboarding_modals))
ON CONFLICT (content_type) DO UPDATE SET
  total_count = EXCLUDED.total_count,
  updated_at = NOW();
