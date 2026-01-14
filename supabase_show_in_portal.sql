-- =============================================
-- ポータル掲載フラグカラムの追加
-- =============================================
-- 各コンテンツテーブルに「ポータルに掲載する」フラグを追加

-- クイズテーブルに show_in_portal カラムを追加
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS show_in_portal BOOLEAN DEFAULT true;

-- プロフィールLPテーブル（settings JSONBフィールド内で管理）
-- ※ profiles テーブルは settings JSONB に showInPortal を格納するため、カラム追加不要

-- ビジネスLPテーブル（settings JSONBフィールド内で管理）
-- ※ business_lps テーブルは settings JSONB に showInPortal を格納するため、カラム追加不要

-- インデックス作成（ポータル掲載コンテンツの検索を高速化）
CREATE INDEX IF NOT EXISTS idx_quizzes_show_in_portal ON quizzes(show_in_portal) WHERE show_in_portal = true;

-- コメント追加
COMMENT ON COLUMN quizzes.show_in_portal IS 'ポータルページに掲載するかどうか（デフォルト: true）';

-- 既存データのデフォルト値を設定（NULL の場合は true にする）
UPDATE quizzes SET show_in_portal = true WHERE show_in_portal IS NULL;





















































