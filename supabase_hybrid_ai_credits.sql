-- ========================================
-- ハイブリッドAIクレジット制限システム
-- Premium Credits (高品質AI枠) と Standard Credits (通常AI枠) を追加
-- ========================================

-- 1. subscriptionsテーブルにplan_tierとPremium/Standard枠を追加
ALTER TABLE subscriptions 
ADD COLUMN IF NOT EXISTS plan_tier TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS premium_credits_daily INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS standard_credits_daily INTEGER DEFAULT 0;

-- plan_tierのチェック制約を追加
ALTER TABLE subscriptions 
DROP CONSTRAINT IF EXISTS check_plan_tier;

ALTER TABLE subscriptions 
ADD CONSTRAINT check_plan_tier 
CHECK (plan_tier IN ('none', 'lite', 'standard', 'pro', 'business', 'enterprise'));

-- 2. ai_usage_logsテーブルに使用タイプを追加
ALTER TABLE ai_usage_logs 
ADD COLUMN IF NOT EXISTS usage_type TEXT CHECK (usage_type IN ('premium', 'standard'));

-- デフォルト値を設定（既存レコード用）
UPDATE ai_usage_logs 
SET usage_type = 'standard' 
WHERE usage_type IS NULL;

-- 3. 既存のサブスクリプションに対してplan_tierを推定して設定
-- 金額と期間からplan_tierを推定
UPDATE subscriptions 
SET plan_tier = CASE
  -- 月額2980円または年額29800円 → Lite
  WHEN (period = 'monthly' AND amount = 2980) OR (period = 'yearly' AND amount = 29800) THEN 'lite'
  -- 月額4980円または年額49800円 → Standard
  WHEN (period = 'monthly' AND amount = 4980) OR (period = 'yearly' AND amount IN (39800, 49800)) THEN 'standard'
  -- 月額9800円または年額98000円 → Pro
  WHEN (period = 'monthly' AND amount = 9800) OR (period = 'yearly' AND amount = 98000) THEN 'pro'
  -- 月額29800円または年額298000円 → Business
  WHEN (period = 'monthly' AND amount = 29800) OR (period = 'yearly' AND amount = 298000) THEN 'business'
  -- それ以外はnone
  ELSE 'none'
END
WHERE plan_tier = 'none' OR plan_tier IS NULL;

-- 4. plan_tierに応じたクレジット設定を適用
-- Lite: Premium 0回, Standard 20回
UPDATE subscriptions 
SET premium_credits_daily = 0, standard_credits_daily = 20
WHERE plan_tier = 'lite';

-- Standard: Premium 0回, Standard 30回
UPDATE subscriptions 
SET premium_credits_daily = 0, standard_credits_daily = 30
WHERE plan_tier = 'standard';

-- Pro: Premium 20回, Standard 80回
UPDATE subscriptions 
SET premium_credits_daily = 20, standard_credits_daily = 80
WHERE plan_tier = 'pro';

-- Business: Premium 50回, Standard 無制限(-1)
UPDATE subscriptions 
SET premium_credits_daily = 50, standard_credits_daily = -1
WHERE plan_tier = 'business';

-- None: Premium 0回, Standard 3回（無料トライアル）
UPDATE subscriptions 
SET premium_credits_daily = 0, standard_credits_daily = 3
WHERE plan_tier = 'none';

-- 5. ハイブリッドクレジットチェック用RPC関数
CREATE OR REPLACE FUNCTION check_ai_credit_limit(
  check_user_id UUID,
  credit_type TEXT DEFAULT 'standard'
)
RETURNS TABLE (
  premium_usage INTEGER,
  standard_usage INTEGER,
  premium_limit INTEGER,
  standard_limit INTEGER,
  can_use_premium BOOLEAN,
  can_use_standard BOOLEAN,
  plan_tier TEXT
) LANGUAGE plpgsql AS $$
DECLARE
  v_plan_tier TEXT;
  v_premium_limit INTEGER;
  v_standard_limit INTEGER;
  v_premium_usage INTEGER;
  v_standard_usage INTEGER;
BEGIN
  -- ユーザーのプラン情報を取得
  SELECT 
    COALESCE(s.plan_tier, 'none'),
    COALESCE(s.premium_credits_daily, 0),
    COALESCE(s.standard_credits_daily, 0)
  INTO 
    v_plan_tier,
    v_premium_limit,
    v_standard_limit
  FROM subscriptions s
  WHERE s.user_id = check_user_id
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;

  -- プラン情報がない場合のデフォルト値
  IF v_plan_tier IS NULL THEN
    v_plan_tier := 'none';
    v_premium_limit := 0;
    v_standard_limit := 3;  -- 無料トライアルは3回
  END IF;

  -- 今日の使用量を取得（JST基準）
  SELECT 
    COALESCE(COUNT(*) FILTER (WHERE usage_type = 'premium'), 0)::INTEGER,
    COALESCE(COUNT(*) FILTER (WHERE usage_type = 'standard'), 0)::INTEGER
  INTO 
    v_premium_usage,
    v_standard_usage
  FROM ai_usage_logs
  WHERE user_id = check_user_id
    AND created_at >= CURRENT_DATE AT TIME ZONE 'Asia/Tokyo'
    AND created_at < (CURRENT_DATE + INTERVAL '1 day') AT TIME ZONE 'Asia/Tokyo';

  -- 結果を返す
  RETURN QUERY SELECT
    v_premium_usage,
    v_standard_usage,
    v_premium_limit,
    v_standard_limit,
    -- Premium枠が使える条件: 上限-1(無制限) または 使用量が上限未満
    (v_premium_limit = -1 OR v_premium_usage < v_premium_limit) AS can_use_premium,
    -- Standard枠が使える条件: 上限-1(無制限) または 使用量が上限未満
    (v_standard_limit = -1 OR v_standard_usage < v_standard_limit) AS can_use_standard,
    v_plan_tier;
END;
$$;

-- 6. ハイブリッドクレジット使用記録用RPC関数
CREATE OR REPLACE FUNCTION log_ai_credit_usage(
  p_user_id UUID,
  p_action_type TEXT,
  p_usage_type TEXT,  -- 'premium' or 'standard'
  p_service TEXT DEFAULT 'kdl',
  p_model_used TEXT DEFAULT 'gemini-1.5-flash',
  p_input_tokens INTEGER DEFAULT 0,
  p_output_tokens INTEGER DEFAULT 0,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID LANGUAGE plpgsql AS $$
DECLARE
  v_log_id UUID;
BEGIN
  -- ai_usage_logsに記録
  INSERT INTO ai_usage_logs (
    user_id,
    action_type,
    usage_type,
    service,
    model_used,
    input_tokens,
    output_tokens,
    metadata,
    created_at
  ) VALUES (
    p_user_id,
    p_action_type,
    p_usage_type,
    p_service,
    p_model_used,
    p_input_tokens,
    p_output_tokens,
    p_metadata,
    NOW() AT TIME ZONE 'Asia/Tokyo'
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$;

-- 7. インデックスの追加（パフォーマンス最適化）
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_usage_type 
ON ai_usage_logs(user_id, usage_type, created_at);

-- 8. コメント追加
COMMENT ON COLUMN subscriptions.premium_credits_daily IS '高品質AI（Claude, o1等）の1日あたり利用可能回数。-1は無制限';
COMMENT ON COLUMN subscriptions.standard_credits_daily IS '通常AI（Gemini Flash等）の1日あたり利用可能回数。-1は無制限';
COMMENT ON COLUMN ai_usage_logs.usage_type IS 'AI使用タイプ: premium（高品質AI）または standard（通常AI）';

-- ========================================
-- マイグレーション完了
-- ========================================

