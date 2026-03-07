-- タイトル・説明文のスタイルカスタマイズ
ALTER TABLE order_forms ADD COLUMN IF NOT EXISTS title_color TEXT;
ALTER TABLE order_forms ADD COLUMN IF NOT EXISTS description_color TEXT;
ALTER TABLE order_forms ADD COLUMN IF NOT EXISTS description_size TEXT DEFAULT 'sm';
