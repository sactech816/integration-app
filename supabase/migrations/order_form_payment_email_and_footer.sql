-- メールフッター名のカスタマイズ
ALTER TABLE order_forms ADD COLUMN IF NOT EXISTS email_footer_name TEXT;

-- 決済完了メール設定
ALTER TABLE order_forms ADD COLUMN IF NOT EXISTS payment_email_enabled BOOLEAN DEFAULT true;
ALTER TABLE order_forms ADD COLUMN IF NOT EXISTS payment_email_subject TEXT DEFAULT '決済が完了しました';
ALTER TABLE order_forms ADD COLUMN IF NOT EXISTS payment_email_body TEXT;
