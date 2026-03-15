-- ================================================================
-- マイサイトメーカー テーブル作成
-- sites: サイト全体の設定
-- site_pages: 各ページのコンテンツ
-- ================================================================

-- サイト本体
CREATE TABLE sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- settings JSONB の想定構造:
-- {
--   "navStyle": "top",          -- "top" | "sidebar" | "hamburger"
--   "theme": {
--     "primaryColor": "#3b82f6",
--     "gradient": "...",
--     "backgroundImage": "...",
--     "fontFamily": "default"
--   },
--   "gtmId": "",
--   "fbPixelId": "",
--   "lineTagId": "",
--   "hideFooter": false,
--   "hideRelatedContent": false,
--   "showInPortal": false
-- }

-- サイトのページ
CREATE TABLE site_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  site_id UUID REFERENCES sites(id) ON DELETE CASCADE NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB DEFAULT '[]',
  sort_order INTEGER DEFAULT 0,
  is_home BOOLEAN DEFAULT false,
  show_in_nav BOOLEAN DEFAULT true,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(site_id, slug)
);

-- インデックス
CREATE INDEX idx_sites_user_id ON sites(user_id);
CREATE INDEX idx_sites_slug ON sites(slug);
CREATE INDEX idx_site_pages_site_id ON site_pages(site_id);
CREATE INDEX idx_site_pages_sort_order ON site_pages(site_id, sort_order);

-- RLS
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own sites"
  ON sites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Published sites are public"
  ON sites FOR SELECT USING (status = 'published');

ALTER TABLE site_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage pages of own sites"
  ON site_pages FOR ALL
  USING (
    EXISTS (SELECT 1 FROM sites WHERE sites.id = site_pages.site_id AND sites.user_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM sites WHERE sites.id = site_pages.site_id AND sites.user_id = auth.uid())
  );
CREATE POLICY "Pages of published sites are public"
  ON site_pages FOR SELECT USING (
    EXISTS (SELECT 1 FROM sites WHERE sites.id = site_pages.site_id AND sites.status = 'published')
  );

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_sites_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sites_updated_at
  BEFORE UPDATE ON sites
  FOR EACH ROW EXECUTE FUNCTION update_sites_updated_at();

CREATE TRIGGER site_pages_updated_at
  BEFORE UPDATE ON site_pages
  FOR EACH ROW EXECUTE FUNCTION update_sites_updated_at();
