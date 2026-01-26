-- =============================================
-- サービス別プラン設定テーブル
-- 集客メーカーとKindleのプラン設定を管理
-- プラン変更に柔軟に対応できるDB管理方式
-- =============================================

-- 1. service_plans テーブルの作成
CREATE TABLE IF NOT EXISTS service_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL,              -- 'makers' or 'kdl'
  plan_tier TEXT NOT NULL,            -- 'guest', 'free', 'pro', 'lite', 'standard', etc.
  display_name TEXT NOT NULL,         -- 表示名（日本語）
  description TEXT,                   -- プランの説明
  price INTEGER NOT NULL DEFAULT 0,   -- 価格（円）
  price_type TEXT DEFAULT 'monthly',  -- 'monthly', 'yearly', 'one_time'
  
  -- 機能フラグ
  can_create BOOLEAN DEFAULT true,           -- コンテンツ作成可能
  can_edit BOOLEAN DEFAULT true,             -- コンテンツ編集可能
  can_use_ai BOOLEAN DEFAULT false,          -- AI機能使用可能
  can_use_analytics BOOLEAN DEFAULT false,   -- アクセス解析使用可能
  can_use_gamification BOOLEAN DEFAULT false, -- ゲーミフィケーション使用可能
  can_download_html BOOLEAN DEFAULT false,   -- HTMLダウンロード可能
  can_embed BOOLEAN DEFAULT false,           -- 埋め込みコード発行可能
  can_hide_copyright BOOLEAN DEFAULT false,  -- コピーライト非表示可能
  can_use_affiliate BOOLEAN DEFAULT false,   -- アフィリエイト機能使用可能
  
  -- 数量制限（-1 = 無制限）
  ai_daily_limit INTEGER DEFAULT 0,          -- AI使用回数/日
  ai_monthly_limit INTEGER DEFAULT 0,        -- AI使用回数/月
  gamification_limit INTEGER DEFAULT 0,      -- ゲーム作成数
  book_limit INTEGER DEFAULT 0,              -- 書籍作成数（KDL用）
  content_limit INTEGER DEFAULT -1,          -- コンテンツ作成数（集客メーカー用）
  
  -- ハイブリッドAIクレジット（KDL用）
  premium_credits_daily INTEGER DEFAULT 0,   -- 高品質AI枠/日
  standard_credits_daily INTEGER DEFAULT 0,  -- 通常AI枠/日
  
  -- メタデータ
  sort_order INTEGER DEFAULT 0,              -- 表示順
  is_active BOOLEAN DEFAULT true,            -- 有効/無効
  is_visible BOOLEAN DEFAULT true,           -- LPに表示するか
  badge_text TEXT,                           -- バッジテキスト（「人気」「おすすめ」等）
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(service, plan_tier)
);

-- 2. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_service_plans_service ON service_plans(service);
CREATE INDEX IF NOT EXISTS idx_service_plans_active ON service_plans(service, is_active);

-- 3. RLS (Row Level Security) の有効化
ALTER TABLE service_plans ENABLE ROW LEVEL SECURITY;

-- 4. RLSポリシーの作成（既存があれば削除してから作成）
DROP POLICY IF EXISTS "Anyone can read active plans" ON service_plans;
DROP POLICY IF EXISTS "Service role can manage plans" ON service_plans;

-- 誰でも読み取り可能（フロントエンドで使用）
CREATE POLICY "Anyone can read active plans"
  ON service_plans FOR SELECT
  USING (is_active = true);

-- サービスロール（管理者API）のみ全操作可能
CREATE POLICY "Service role can manage plans"
  ON service_plans FOR ALL
  USING (true)
  WITH CHECK (true);

-- 5. updated_atの自動更新トリガー
CREATE OR REPLACE FUNCTION update_service_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_service_plans_updated_at ON service_plans;
CREATE TRIGGER trigger_update_service_plans_updated_at
  BEFORE UPDATE ON service_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_service_plans_updated_at();

-- 6. 初期データの挿入

-- ========================================
-- 集客メーカーのプラン
-- ========================================
INSERT INTO service_plans (
  service, plan_tier, display_name, description, price, price_type,
  can_create, can_edit, can_use_ai, can_use_analytics, can_use_gamification,
  can_download_html, can_embed, can_hide_copyright, can_use_affiliate,
  ai_daily_limit, gamification_limit, content_limit,
  sort_order, is_visible
) VALUES
-- ゲスト（未ログイン）
(
  'makers', 'guest', 'ゲスト', '登録なしで、今すぐお試し作成。※保存はされません。',
  0, 'one_time',
  true, false, false, false, false,
  false, false, false, false,
  0, 0, 1,
  1, true
),
-- フリープラン（ログインユーザー）
(
  'makers', 'free', 'フリープラン', '30秒でできるアカウント登録だけでOK！ずっと無料で使い放題。',
  0, 'monthly',
  true, true, false, false, false,
  false, false, false, false,
  0, 0, -1,
  2, true
),
-- プロプラン（有料ユーザー）
(
  'makers', 'pro', 'プロプラン', '本格的なビジネス運用に。制限なしで使い放題。',
  3980, 'monthly',
  true, true, true, true, true,
  true, true, true, true,
  -1, -1, -1,
  3, true
)
ON CONFLICT (service, plan_tier) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  updated_at = NOW();

-- ========================================
-- Kindle（KDL）初回プラン（一括払い）
-- ========================================
INSERT INTO service_plans (
  service, plan_tier, display_name, description, price, price_type,
  can_create, can_edit, can_use_ai, can_use_analytics, can_use_gamification,
  can_download_html, can_embed, can_hide_copyright, can_use_affiliate,
  ai_daily_limit, ai_monthly_limit, book_limit,
  premium_credits_daily, standard_credits_daily,
  sort_order, is_visible
) VALUES
-- トライアルプラン（初回）
(
  'kdl', 'initial_trial', 'トライアル', '初めての方向け。基本機能をお試し。',
  49800, 'one_time',
  true, true, true, false, false,
  true, false, false, false,
  20, 300, 3,
  0, 20,
  1, true
),
-- スタンダードプラン（初回）
(
  'kdl', 'initial_standard', 'スタンダード', '本格的に執筆を始めたい方に。',
  99800, 'one_time',
  true, true, true, true, false,
  true, false, false, false,
  50, 1000, 10,
  10, 50,
  2, true
),
-- ビジネスプラン（初回）
(
  'kdl', 'initial_business', 'ビジネス', 'プロの執筆者向け。フル機能解放。',
  198000, 'one_time',
  true, true, true, true, true,
  true, true, true, true,
  -1, -1, -1,
  50, -1,
  3, true
)
ON CONFLICT (service, plan_tier) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  updated_at = NOW();

-- ========================================
-- Kindle（KDL）継続プラン（月額）
-- ========================================
INSERT INTO service_plans (
  service, plan_tier, display_name, description, price, price_type,
  can_create, can_edit, can_use_ai, can_use_analytics, can_use_gamification,
  can_download_html, can_embed, can_hide_copyright, can_use_affiliate,
  ai_daily_limit, ai_monthly_limit, book_limit,
  premium_credits_daily, standard_credits_daily,
  sort_order, is_visible
) VALUES
-- 無料トライアル（お試し）
(
  'kdl', 'none', '無料トライアル', 'お試し3回/日、書籍1冊まで',
  0, 'monthly',
  true, true, true, false, false,
  false, false, false, false,
  3, 10, 1,
  0, 3,
  10, false
),
-- ライトプラン（継続）
(
  'kdl', 'lite', 'ライト', 'AI執筆サポート（20回/日）、書籍数無制限',
  2980, 'monthly',
  true, true, true, false, false,
  true, false, false, false,
  20, 300, -1,
  0, 20,
  11, true
),
-- スタンダードプラン（継続）
(
  'kdl', 'standard', 'スタンダード', 'AI執筆サポート（30回/日）、メール優先サポート',
  4980, 'monthly',
  true, true, true, false, false,
  true, false, false, false,
  30, 900, -1,
  0, 30,
  12, true
),
-- プロプラン（継続）
(
  'kdl', 'pro', 'プロ', '高品質AI 20回/日、高速AI 80回/日、チャットサポート',
  9800, 'monthly',
  true, true, true, true, false,
  true, false, false, false,
  100, 1000, -1,
  20, 80,
  13, true
),
-- ビジネスプラン（継続）
(
  'kdl', 'business', 'ビジネス', '高品質AI 50回/日、高速AI無制限、グループコンサル月1回',
  29800, 'monthly',
  true, true, true, true, true,
  true, true, true, true,
  -1, -1, -1,
  50, -1,
  14, true
),
-- エンタープライズプラン（継続）
(
  'kdl', 'enterprise', 'エンタープライズ', 'カスタムAI環境、専任サポート、API連携',
  -1, 'monthly',  -- -1 = 要相談
  true, true, true, true, true,
  true, true, true, true,
  -1, -1, -1,
  -1, -1,
  15, false
)
ON CONFLICT (service, plan_tier) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  updated_at = NOW();

-- 7. プラン設定取得関数
CREATE OR REPLACE FUNCTION get_plan_settings(p_service TEXT)
RETURNS TABLE (
  plan_tier TEXT,
  display_name TEXT,
  description TEXT,
  price INTEGER,
  price_type TEXT,
  can_create BOOLEAN,
  can_edit BOOLEAN,
  can_use_ai BOOLEAN,
  can_use_analytics BOOLEAN,
  can_use_gamification BOOLEAN,
  can_download_html BOOLEAN,
  can_embed BOOLEAN,
  can_hide_copyright BOOLEAN,
  can_use_affiliate BOOLEAN,
  ai_daily_limit INTEGER,
  ai_monthly_limit INTEGER,
  gamification_limit INTEGER,
  book_limit INTEGER,
  content_limit INTEGER,
  premium_credits_daily INTEGER,
  standard_credits_daily INTEGER,
  sort_order INTEGER,
  is_visible BOOLEAN,
  badge_text TEXT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.plan_tier,
    sp.display_name,
    sp.description,
    sp.price,
    sp.price_type,
    sp.can_create,
    sp.can_edit,
    sp.can_use_ai,
    sp.can_use_analytics,
    sp.can_use_gamification,
    sp.can_download_html,
    sp.can_embed,
    sp.can_hide_copyright,
    sp.can_use_affiliate,
    sp.ai_daily_limit,
    sp.ai_monthly_limit,
    sp.gamification_limit,
    sp.book_limit,
    sp.content_limit,
    sp.premium_credits_daily,
    sp.standard_credits_daily,
    sp.sort_order,
    sp.is_visible,
    sp.badge_text
  FROM service_plans sp
  WHERE sp.service = p_service
    AND sp.is_active = true
  ORDER BY sp.sort_order;
END;
$$;

-- 8. サービス別AI使用統計取得関数
CREATE OR REPLACE FUNCTION get_ai_usage_stats_by_service(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  service TEXT,
  total_requests BIGINT,
  total_users BIGINT,
  total_input_tokens BIGINT,
  total_output_tokens BIGINT,
  total_cost_jpy DECIMAL,
  avg_requests_per_user DECIMAL
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN aul.service IN ('quiz', 'profile', 'business') THEN 'makers'
      ELSE aul.service
    END as service,
    COUNT(*) as total_requests,
    COUNT(DISTINCT aul.user_id) as total_users,
    COALESCE(SUM(aul.input_tokens), 0) as total_input_tokens,
    COALESCE(SUM(aul.output_tokens), 0) as total_output_tokens,
    COALESCE(SUM(aul.estimated_cost_jpy), 0) as total_cost_jpy,
    CASE 
      WHEN COUNT(DISTINCT aul.user_id) > 0 
      THEN COUNT(*)::DECIMAL / COUNT(DISTINCT aul.user_id)
      ELSE 0
    END as avg_requests_per_user
  FROM ai_usage_logs aul
  WHERE aul.created_at >= p_start_date
    AND aul.created_at < p_end_date + INTERVAL '1 day'
  GROUP BY 
    CASE 
      WHEN aul.service IN ('quiz', 'profile', 'business') THEN 'makers'
      ELSE aul.service
    END;
END;
$$;

-- 9. コメント追加
COMMENT ON TABLE service_plans IS 'サービス別のプラン設定を管理するテーブル。管理画面から価格・機能制限を変更可能。';
COMMENT ON COLUMN service_plans.service IS 'サービス識別子: makers（集客メーカー）, kdl（Kindle）';
COMMENT ON COLUMN service_plans.plan_tier IS 'プラン識別子: guest, free, pro, lite, standard, business, enterprise';
COMMENT ON COLUMN service_plans.price IS '価格（円）。-1は要相談を意味する';
COMMENT ON COLUMN service_plans.ai_daily_limit IS 'AI使用回数/日。-1は無制限';
COMMENT ON COLUMN service_plans.is_visible IS 'LPや料金表に表示するかどうか';

-- ========================================
-- マイグレーション完了
-- ========================================
