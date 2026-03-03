-- =============================================
-- 申し込みフォーム: メール設定カラム追加
-- =============================================

ALTER TABLE order_forms ADD COLUMN IF NOT EXISTS reply_email_enabled BOOLEAN DEFAULT true;
ALTER TABLE order_forms ADD COLUMN IF NOT EXISTS reply_email_subject TEXT DEFAULT 'お申し込みありがとうございます';
ALTER TABLE order_forms ADD COLUMN IF NOT EXISTS reply_email_body TEXT;
ALTER TABLE order_forms ADD COLUMN IF NOT EXISTS notify_owner BOOLEAN DEFAULT true;
ALTER TABLE order_forms ADD COLUMN IF NOT EXISTS notify_emails TEXT;  -- カンマ区切りで複数メール指定可
