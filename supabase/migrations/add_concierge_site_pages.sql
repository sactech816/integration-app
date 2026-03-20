-- concierge_configs にサイトページ情報カラムを追加
-- サイトマップから読み込んだページ情報を保存する
ALTER TABLE concierge_configs
  ADD COLUMN IF NOT EXISTS site_pages JSONB DEFAULT '[]';

-- site_pages の構造: [{ "url": "https://...", "title": "ページタイトル", "description": "説明" }, ...]

COMMENT ON COLUMN concierge_configs.site_pages IS 'サイトマップから読み込んだページ情報 [{url, title, description}]';
