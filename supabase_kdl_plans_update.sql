-- =====================================================
-- KDL 新料金プラン対応 データベース更新SQL
-- =====================================================
-- 実行日: 2026年1月
-- 目的: 4段階プラン + エンタープライズ対応
-- =====================================================

-- 1. kdl_subscriptions テーブルを作成
-- =====================================================

-- KDL専用サブスクリプションテーブル
CREATE TABLE IF NOT EXISTS kdl_subscriptions (
  id TEXT PRIMARY KEY,                          -- UnivaPayのサブスクリプションID
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'univapay',    -- 'univapay' または 'stripe'
  status TEXT NOT NULL DEFAULT 'pending',       -- pending, active, suspended, payment_failed, canceled, completed
  amount INTEGER NOT NULL,                      -- 金額（円）
  currency TEXT NOT NULL DEFAULT 'jpy',
  period TEXT NOT NULL DEFAULT 'monthly',       -- monthly, yearly
  plan_tier TEXT NOT NULL DEFAULT 'standard',   -- none, lite, standard, pro, business, enterprise
  plan_name TEXT,                               -- プラン表示名
  email TEXT,                                   -- 通知用メール
  current_period_start TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ,               -- 現在の期間終了日
  next_payment_date TIMESTAMPTZ,                -- 次回決済日
  canceled_at TIMESTAMPTZ,                      -- キャンセル日時
  metadata JSONB,                               -- その他メタデータ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- plan_tier の値を制約
  CONSTRAINT kdl_subscriptions_plan_tier_check 
    CHECK (plan_tier IN ('none', 'lite', 'standard', 'pro', 'business', 'enterprise'))
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_kdl_subscriptions_user_id ON kdl_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_kdl_subscriptions_status ON kdl_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_kdl_subscriptions_plan_tier ON kdl_subscriptions(plan_tier);
CREATE INDEX IF NOT EXISTS idx_kdl_subscriptions_email ON kdl_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_kdl_subscriptions_current_period_end ON kdl_subscriptions(current_period_end);

-- RLSを有効化
ALTER TABLE kdl_subscriptions ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のサブスクリプションを読み取り可能
DROP POLICY IF EXISTS "Users can read own kdl_subscriptions" ON kdl_subscriptions;
CREATE POLICY "Users can read own kdl_subscriptions" ON kdl_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: サービスロール(管理者)のみ挿入・更新可能
DROP POLICY IF EXISTS "Service role can manage kdl_subscriptions" ON kdl_subscriptions;
CREATE POLICY "Service role can manage kdl_subscriptions" ON kdl_subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- トリガー: updated_at自動更新
CREATE OR REPLACE FUNCTION update_kdl_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_kdl_subscription_updated_at ON kdl_subscriptions;
CREATE TRIGGER trigger_kdl_subscription_updated_at
  BEFORE UPDATE ON kdl_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_kdl_subscription_updated_at();

-- 2. AI使用量チェック関数を更新
-- =====================================================

-- 既存の関数を削除（戻り値の型が変わるため）
DROP FUNCTION IF EXISTS check_ai_usage_limit(UUID);
DROP FUNCTION IF EXISTS get_ai_limits_for_plan_tier(TEXT);

-- プランTier別のAI制限を返す関数
CREATE OR REPLACE FUNCTION get_ai_limits_for_plan_tier(p_plan_tier TEXT)
RETURNS TABLE(daily_limit INT, monthly_limit INT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE p_plan_tier
      WHEN 'none' THEN 3
      WHEN 'lite' THEN 20
      WHEN 'standard' THEN 50
      WHEN 'pro' THEN 100
      WHEN 'business' THEN -1  -- 無制限
      WHEN 'enterprise' THEN -1  -- 無制限
      ELSE 50  -- デフォルト
    END AS daily_limit,
    CASE p_plan_tier
      WHEN 'none' THEN 10
      WHEN 'lite' THEN 300
      WHEN 'standard' THEN 500
      WHEN 'pro' THEN 1000
      WHEN 'business' THEN -1  -- 無制限
      WHEN 'enterprise' THEN -1  -- 無制限
      ELSE 500  -- デフォルト
    END AS monthly_limit;
END;
$$ LANGUAGE plpgsql;

-- AI使用量チェック関数を更新（plan_tier対応）
CREATE OR REPLACE FUNCTION check_ai_usage_limit(check_user_id UUID)
RETURNS TABLE(
  daily_usage INT,
  monthly_usage INT,
  daily_limit INT,
  monthly_limit INT,
  is_within_limit BOOLEAN,
  plan_tier TEXT
) AS $$
DECLARE
  v_plan_tier TEXT := 'none';
  v_daily_limit INT;
  v_monthly_limit INT;
  v_daily_usage INT;
  v_monthly_usage INT;
BEGIN
  -- ユーザーのプランTierを取得
  SELECT ks.plan_tier INTO v_plan_tier
  FROM kdl_subscriptions ks
  WHERE ks.user_id = check_user_id
    AND ks.status = 'active'
    AND ks.current_period_end > NOW()
  ORDER BY ks.created_at DESC
  LIMIT 1;

  -- プランTierがない場合はnone
  IF v_plan_tier IS NULL THEN
    v_plan_tier := 'none';
  END IF;

  -- プランTierに応じた制限を取得
  SELECT gl.daily_limit, gl.monthly_limit 
  INTO v_daily_limit, v_monthly_limit
  FROM get_ai_limits_for_plan_tier(v_plan_tier) gl;

  -- 今日の使用量を取得
  SELECT COUNT(*)::INT INTO v_daily_usage
  FROM ai_usage_logs
  WHERE user_id = check_user_id
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';

  -- 今月の使用量を取得
  SELECT COUNT(*)::INT INTO v_monthly_usage
  FROM ai_usage_logs
  WHERE user_id = check_user_id
    AND created_at >= DATE_TRUNC('month', CURRENT_DATE)
    AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';

  -- 結果を返す
  RETURN QUERY
  SELECT 
    v_daily_usage,
    v_monthly_usage,
    v_daily_limit,
    v_monthly_limit,
    (v_daily_limit = -1 OR v_daily_usage < v_daily_limit) AND 
    (v_monthly_limit = -1 OR v_monthly_usage < v_monthly_limit) AS is_within_limit,
    v_plan_tier;
END;
$$ LANGUAGE plpgsql;

-- 3. プラン情報テーブル（参照用）
-- =====================================================

-- プラン定義テーブル（参照用、アプリ側でも定義あり）
CREATE TABLE IF NOT EXISTS kdl_plan_definitions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_ja TEXT NOT NULL,
  monthly_price INT NOT NULL,
  yearly_price INT NOT NULL,
  daily_ai_limit INT NOT NULL,  -- -1 = 無制限
  monthly_ai_limit INT NOT NULL,  -- -1 = 無制限
  ai_model TEXT NOT NULL,
  ai_model_display TEXT NOT NULL,
  support_level TEXT NOT NULL,
  features JSONB,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初期データを挿入
INSERT INTO kdl_plan_definitions (id, name, name_ja, monthly_price, yearly_price, daily_ai_limit, monthly_ai_limit, ai_model, ai_model_display, support_level, features, sort_order)
VALUES 
  ('lite', 'Lite', 'ライト', 2980, 29800, 20, 300, 'gemini-flash', '標準AI', 'メールサポート', 
   '["AI執筆サポート（20回/日）", "標準AI", "書籍数無制限", "KDP形式エクスポート", "メールサポート"]'::jsonb, 1),
  ('standard', 'Standard', 'スタンダード', 4980, 49800, 50, 500, 'gpt-4o-mini', '標準AI+', 'メール優先サポート',
   '["AI執筆サポート（50回/日）", "標準AI+", "書籍数無制限", "KDP形式エクスポート", "メール優先サポート"]'::jsonb, 2),
  ('pro', 'Pro', 'プロ', 9800, 98000, 100, 1000, 'gpt-4o-mini', '高性能AI', 'チャットサポート',
   '["AI執筆サポート（100回/日）", "高性能AI", "書籍数無制限", "KDP形式エクスポート", "チャットサポート", "新機能の先行アクセス"]'::jsonb, 3),
  ('business', 'Business', 'ビジネス', 29800, 298000, -1, -1, 'gpt-4o', '最高性能AI', 'グループコンサル月1回',
   '["AI執筆サポート（無制限）", "最高性能AI", "書籍数無制限", "KDP形式エクスポート", "グループコンサル（月1回）", "優先サポート", "新機能の先行アクセス"]'::jsonb, 4),
  ('enterprise', 'Enterprise', 'エンタープライズ', -1, -1, -1, -1, 'custom', 'カスタムAI環境', '専任サポート',
   '["カスタムAI環境", "専任サポート", "API連携", "チーム利用", "カスタム機能開発"]'::jsonb, 5)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_ja = EXCLUDED.name_ja,
  monthly_price = EXCLUDED.monthly_price,
  yearly_price = EXCLUDED.yearly_price,
  daily_ai_limit = EXCLUDED.daily_ai_limit,
  monthly_ai_limit = EXCLUDED.monthly_ai_limit,
  ai_model = EXCLUDED.ai_model,
  ai_model_display = EXCLUDED.ai_model_display,
  support_level = EXCLUDED.support_level,
  features = EXCLUDED.features,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();

-- 4. RLSポリシー
-- =====================================================

-- kdl_plan_definitions は誰でも読み取り可能
ALTER TABLE kdl_plan_definitions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kdl_plan_definitions_select_all" ON kdl_plan_definitions;
CREATE POLICY "kdl_plan_definitions_select_all" ON kdl_plan_definitions
  FOR SELECT USING (true);

-- 5. 既存データのマイグレーション（subscriptionsテーブルからの移行）
-- =====================================================

-- 既存のsubscriptionsテーブルからKDL関連のデータを移行
-- （subscriptionsテーブルが存在し、KDL関連データがある場合のみ）
INSERT INTO kdl_subscriptions (id, user_id, provider, status, amount, currency, period, plan_tier, plan_name, email, current_period_end, next_payment_date, canceled_at, metadata, created_at, updated_at)
SELECT 
  s.id,
  s.user_id,
  s.provider,
  s.status,
  s.amount,
  s.currency,
  s.period,
  CASE
    WHEN s.amount = 2980 OR s.amount = 29800 THEN 'lite'
    WHEN s.amount = 4980 OR s.amount = 49800 OR s.amount = 39800 THEN 'standard'
    WHEN s.amount = 9800 OR s.amount = 98000 THEN 'pro'
    WHEN s.amount >= 29800 THEN 'business'
    ELSE 'standard'
  END as plan_tier,
  s.plan_name,
  s.email,
  s.next_payment_date as current_period_end,
  s.next_payment_date,
  s.canceled_at,
  s.metadata,
  s.created_at,
  s.updated_at
FROM subscriptions s
WHERE s.plan_name LIKE '%KDL%' OR s.plan_name LIKE '%Kindle%'
ON CONFLICT (id) DO NOTHING;

-- 6. コメント追加
-- =====================================================

COMMENT ON COLUMN kdl_subscriptions.plan_tier IS 'プランTier: none, lite, standard, pro, business, enterprise';
COMMENT ON TABLE kdl_plan_definitions IS 'KDLプラン定義（参照用）';
COMMENT ON FUNCTION get_ai_limits_for_plan_tier IS 'プランTierに応じたAI使用制限を返す';
COMMENT ON FUNCTION check_ai_usage_limit IS 'ユーザーのAI使用量と制限をチェック（plan_tier対応）';

-- =====================================================
-- 実行完了
-- =====================================================

