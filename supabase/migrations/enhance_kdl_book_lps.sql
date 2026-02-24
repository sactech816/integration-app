-- =============================================
-- Book LP Enhancement: PASONA framework対応
-- 新セクション追加 + セクション表示制御 + カバー画像
-- =============================================

-- 新しいセクションカラム
ALTER TABLE kdl_book_lps ADD COLUMN IF NOT EXISTS author_profile JSONB DEFAULT '{}';
ALTER TABLE kdl_book_lps ADD COLUMN IF NOT EXISTS key_takeaways JSONB DEFAULT '[]';
ALTER TABLE kdl_book_lps ADD COLUMN IF NOT EXISTS target_readers JSONB DEFAULT '{}';
ALTER TABLE kdl_book_lps ADD COLUMN IF NOT EXISTS transformation JSONB DEFAULT '{}';
ALTER TABLE kdl_book_lps ADD COLUMN IF NOT EXISTS social_proof JSONB DEFAULT '[]';
ALTER TABLE kdl_book_lps ADD COLUMN IF NOT EXISTS bonus JSONB DEFAULT '[]';
ALTER TABLE kdl_book_lps ADD COLUMN IF NOT EXISTS closing_message JSONB DEFAULT '{}';

-- セクション表示制御
ALTER TABLE kdl_book_lps ADD COLUMN IF NOT EXISTS section_visibility JSONB DEFAULT '{}';

-- カバー画像URL
ALTER TABLE kdl_book_lps ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
