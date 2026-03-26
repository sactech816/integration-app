-- =============================================
-- メルマガメーカー v3
-- キャンペーンにヘッダ/フッタ/本文を個別保存
-- =============================================

-- newsletter_campaigns にヘッダ/フッタ/本文HTMLカラム追加
ALTER TABLE newsletter_campaigns
  ADD COLUMN IF NOT EXISTS header_html TEXT,
  ADD COLUMN IF NOT EXISTS footer_html TEXT,
  ADD COLUMN IF NOT EXISTS body_html TEXT;
