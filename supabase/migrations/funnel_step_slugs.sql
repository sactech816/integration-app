-- =============================================
-- ファネルステップに個別公開URL用の slug を追加
-- /fs/{slug} でステップ単体アクセス可能にする
-- =============================================

ALTER TABLE funnel_steps ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_funnel_steps_slug ON funnel_steps(slug);

-- CTA詳細設定用カラム（表示/非表示、スタイル設定）
ALTER TABLE funnel_steps ADD COLUMN IF NOT EXISTS cta_enabled BOOLEAN DEFAULT true;
ALTER TABLE funnel_steps ADD COLUMN IF NOT EXISTS cta_style JSONB DEFAULT '{}';
