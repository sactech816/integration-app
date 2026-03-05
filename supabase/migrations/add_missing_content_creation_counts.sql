-- =============================================
-- 不足コンテンツタイプの累計カウント追加
-- thumbnail, newsletter, order-form, funnel, webinar, sns-post
-- =============================================

-- 1. thumbnails テーブルへのトリガー追加
DROP TRIGGER IF EXISTS tr_increment_thumbnail_count ON thumbnails;
CREATE TRIGGER tr_increment_thumbnail_count
  AFTER INSERT ON thumbnails
  FOR EACH ROW
  EXECUTE FUNCTION increment_content_count('thumbnail');

-- 2. newsletter_lists テーブルへのトリガー追加
DROP TRIGGER IF EXISTS tr_increment_newsletter_count ON newsletter_lists;
CREATE TRIGGER tr_increment_newsletter_count
  AFTER INSERT ON newsletter_lists
  FOR EACH ROW
  EXECUTE FUNCTION increment_content_count('newsletter');

-- 3. order_forms テーブルへのトリガー追加
DROP TRIGGER IF EXISTS tr_increment_order_form_count ON order_forms;
CREATE TRIGGER tr_increment_order_form_count
  AFTER INSERT ON order_forms
  FOR EACH ROW
  EXECUTE FUNCTION increment_content_count('order-form');

-- 4. funnels テーブルへのトリガー追加
DROP TRIGGER IF EXISTS tr_increment_funnel_count ON funnels;
CREATE TRIGGER tr_increment_funnel_count
  AFTER INSERT ON funnels
  FOR EACH ROW
  EXECUTE FUNCTION increment_content_count('funnel');

-- 5. webinar_lps テーブルへのトリガー追加
DROP TRIGGER IF EXISTS tr_increment_webinar_count ON webinar_lps;
CREATE TRIGGER tr_increment_webinar_count
  AFTER INSERT ON webinar_lps
  FOR EACH ROW
  EXECUTE FUNCTION increment_content_count('webinar');

-- 6. sns_posts テーブルへのトリガー追加
DROP TRIGGER IF EXISTS tr_increment_sns_post_count ON sns_posts;
CREATE TRIGGER tr_increment_sns_post_count
  AFTER INSERT ON sns_posts
  FOR EACH ROW
  EXECUTE FUNCTION increment_content_count('sns-post');

-- 7. 初期データの設定（現在のレコード数を初期値として設定）
INSERT INTO content_creation_counts (content_type, total_count) VALUES
  ('thumbnail', (SELECT COUNT(*) FROM thumbnails)),
  ('newsletter', (SELECT COUNT(*) FROM newsletter_lists)),
  ('order-form', (SELECT COUNT(*) FROM order_forms)),
  ('funnel', (SELECT COUNT(*) FROM funnels)),
  ('webinar', (SELECT COUNT(*) FROM webinar_lps)),
  ('sns-post', (SELECT COUNT(*) FROM sns_posts))
ON CONFLICT (content_type) DO UPDATE SET
  total_count = EXCLUDED.total_count,
  updated_at = NOW();
