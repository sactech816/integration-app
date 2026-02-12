-- =============================================
-- コンテンツ作成数の累計カウンターテーブル
-- 作成日: 2026-02-01
-- 目的: 各コンテンツタイプの累計作成数をグロスで管理する
-- =============================================

-- 1. 累計カウンターテーブルの作成
CREATE TABLE IF NOT EXISTS content_creation_counts (
  content_type TEXT PRIMARY KEY,  -- 'quiz', 'profile', 'lp', 'survey', 'booking', 'attendance', 'salesletter', 'game'
  total_count BIGINT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLSの有効化
ALTER TABLE content_creation_counts ENABLE ROW LEVEL SECURITY;

-- 3. RLSポリシーの作成（公開読み取りのみ許可）
DROP POLICY IF EXISTS "content_creation_counts_select_public" ON content_creation_counts;
CREATE POLICY "content_creation_counts_select_public" ON content_creation_counts
  FOR SELECT
  USING (true);

-- サービスロール経由でのみ更新可能（トリガーで使用）
-- 通常ユーザーからのUPDATE/INSERTは不可

-- 4. コメント
COMMENT ON TABLE content_creation_counts IS '各コンテンツタイプの累計作成数を管理するテーブル';
COMMENT ON COLUMN content_creation_counts.content_type IS 'コンテンツタイプ（quiz, profile, lp, survey, booking, attendance, salesletter, game）';
COMMENT ON COLUMN content_creation_counts.total_count IS '累計作成数（削除してもカウントダウンしない）';
COMMENT ON COLUMN content_creation_counts.updated_at IS '最終更新日時';

-- =============================================
-- トリガー関数の作成
-- =============================================

-- 5. カウントインクリメント用のトリガー関数
CREATE OR REPLACE FUNCTION increment_content_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE content_creation_counts
  SET total_count = total_count + 1,
      updated_at = NOW()
  WHERE content_type = TG_ARGV[0];
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION increment_content_count() IS 'コンテンツ作成時に累計カウントをインクリメントするトリガー関数';

-- =============================================
-- 各テーブルへのトリガー追加
-- =============================================

-- 6. quizzes テーブル
DROP TRIGGER IF EXISTS tr_increment_quiz_count ON quizzes;
CREATE TRIGGER tr_increment_quiz_count
  AFTER INSERT ON quizzes
  FOR EACH ROW
  EXECUTE FUNCTION increment_content_count('quiz');

-- 7. profiles テーブル
DROP TRIGGER IF EXISTS tr_increment_profile_count ON profiles;
CREATE TRIGGER tr_increment_profile_count
  AFTER INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION increment_content_count('profile');

-- 8. business_projects テーブル（LP）
DROP TRIGGER IF EXISTS tr_increment_lp_count ON business_projects;
CREATE TRIGGER tr_increment_lp_count
  AFTER INSERT ON business_projects
  FOR EACH ROW
  EXECUTE FUNCTION increment_content_count('lp');

-- 9. surveys テーブル
DROP TRIGGER IF EXISTS tr_increment_survey_count ON surveys;
CREATE TRIGGER tr_increment_survey_count
  AFTER INSERT ON surveys
  FOR EACH ROW
  EXECUTE FUNCTION increment_content_count('survey');

-- 10. booking_menus テーブル
DROP TRIGGER IF EXISTS tr_increment_booking_count ON booking_menus;
CREATE TRIGGER tr_increment_booking_count
  AFTER INSERT ON booking_menus
  FOR EACH ROW
  EXECUTE FUNCTION increment_content_count('booking');

-- 11. attendance_events テーブル
DROP TRIGGER IF EXISTS tr_increment_attendance_count ON attendance_events;
CREATE TRIGGER tr_increment_attendance_count
  AFTER INSERT ON attendance_events
  FOR EACH ROW
  EXECUTE FUNCTION increment_content_count('attendance');

-- 12. sales_letters テーブル
DROP TRIGGER IF EXISTS tr_increment_salesletter_count ON sales_letters;
CREATE TRIGGER tr_increment_salesletter_count
  AFTER INSERT ON sales_letters
  FOR EACH ROW
  EXECUTE FUNCTION increment_content_count('salesletter');

-- 13. gamification_campaigns テーブル
DROP TRIGGER IF EXISTS tr_increment_game_count ON gamification_campaigns;
CREATE TRIGGER tr_increment_game_count
  AFTER INSERT ON gamification_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION increment_content_count('game');

-- =============================================
-- 初期データの設定（現在のレコード数を初期値として設定）
-- =============================================

-- 14. 初期データのINSERT
INSERT INTO content_creation_counts (content_type, total_count) VALUES
  ('quiz', (SELECT COUNT(*) FROM quizzes)),
  ('profile', (SELECT COUNT(*) FROM profiles)),
  ('lp', (SELECT COUNT(*) FROM business_projects)),
  ('survey', (SELECT COUNT(*) FROM surveys)),
  ('booking', (SELECT COUNT(*) FROM booking_menus)),
  ('attendance', (SELECT COUNT(*) FROM attendance_events)),
  ('salesletter', (SELECT COUNT(*) FROM sales_letters)),
  ('game', (SELECT COUNT(*) FROM gamification_campaigns))
ON CONFLICT (content_type) DO UPDATE SET 
  total_count = EXCLUDED.total_count,
  updated_at = NOW();

-- =============================================
-- 確認用クエリ（実行後に確認）
-- =============================================
-- SELECT * FROM content_creation_counts ORDER BY content_type;
