-- ========================================
-- monitor_usersテーブルの拡張
-- 1. serviceカラムの追加（kdl/makers区別）
-- 2. CHECK制約の更新（初回プランタイプ対応）
-- ========================================

-- 1. serviceカラムを追加
ALTER TABLE monitor_users 
ADD COLUMN IF NOT EXISTS service TEXT NOT NULL DEFAULT 'kdl' 
CHECK (service IN ('kdl', 'makers'));

-- 2. CHECK制約を更新（初回プランタイプを追加）
-- 既存の制約を削除
ALTER TABLE monitor_users DROP CONSTRAINT IF EXISTS monitor_users_monitor_plan_type_check;

-- 新しい制約を追加（継続プラン + 初回プラン）
ALTER TABLE monitor_users 
ADD CONSTRAINT monitor_users_monitor_plan_type_check 
CHECK (monitor_plan_type IN (
  'lite', 'standard', 'pro', 'business', 'enterprise',
  'initial_trial', 'initial_standard', 'initial_business'
));

-- 3. UNIQUE制約を更新（同じユーザーでもサービスが異なれば複数登録可能に）
-- 既存のUNIQUE制約を削除
ALTER TABLE monitor_users DROP CONSTRAINT IF EXISTS monitor_users_user_id_key;

-- 新しいUNIQUE制約を追加（user_id + service の組み合わせでユニーク）
ALTER TABLE monitor_users 
ADD CONSTRAINT monitor_users_user_service_unique UNIQUE (user_id, service);

-- 4. serviceカラムにインデックスを追加
CREATE INDEX IF NOT EXISTS idx_monitor_users_service ON monitor_users(service);

-- 5. 複合インデックスも更新
DROP INDEX IF EXISTS idx_monitor_users_active;
CREATE INDEX IF NOT EXISTS idx_monitor_users_active ON monitor_users(user_id, service, monitor_expires_at, monitor_start_at);

-- 6. コメント追加
COMMENT ON COLUMN monitor_users.service IS 'サービス種別: kdl=Kindle執筆, makers=集客メーカー';

-- 7. get_user_plan_with_monitor関数の更新（service対応）
CREATE OR REPLACE FUNCTION get_user_plan_with_monitor(
  check_user_id UUID,
  check_service TEXT DEFAULT 'kdl'
)
RETURNS TABLE (
  plan_tier TEXT,
  is_monitor BOOLEAN,
  monitor_expires_at TIMESTAMPTZ,
  premium_credits_daily INTEGER,
  standard_credits_daily INTEGER,
  source TEXT
) LANGUAGE plpgsql AS $$
DECLARE
  v_monitor_plan TEXT;
  v_monitor_expires TIMESTAMPTZ;
  v_subscription_plan TEXT;
  v_premium_credits INTEGER;
  v_standard_credits INTEGER;
BEGIN
  -- モニター権限をチェック（有効期限内 & 指定サービス）
  SELECT 
    monitor_plan_type,
    monitor_users.monitor_expires_at
  INTO 
    v_monitor_plan,
    v_monitor_expires
  FROM monitor_users
  WHERE monitor_users.user_id = check_user_id
    AND monitor_users.service = check_service
    AND monitor_users.monitor_start_at <= NOW()
    AND monitor_users.monitor_expires_at > NOW()
  LIMIT 1;

  -- モニター権限がある場合はそれを優先
  IF v_monitor_plan IS NOT NULL THEN
    -- モニタープランに応じたクレジット設定
    CASE v_monitor_plan
      -- 継続プラン
      WHEN 'lite' THEN
        v_premium_credits := 0;
        v_standard_credits := 20;
      WHEN 'standard' THEN
        v_premium_credits := 0;
        v_standard_credits := 30;
      WHEN 'pro' THEN
        v_premium_credits := 20;
        v_standard_credits := 80;
      WHEN 'business' THEN
        v_premium_credits := 50;
        v_standard_credits := -1;
      WHEN 'enterprise' THEN
        v_premium_credits := -1;
        v_standard_credits := -1;
      -- 初回プラン
      WHEN 'initial_trial' THEN
        v_premium_credits := 10;
        v_standard_credits := 50;
      WHEN 'initial_standard' THEN
        v_premium_credits := 20;
        v_standard_credits := 80;
      WHEN 'initial_business' THEN
        v_premium_credits := 50;
        v_standard_credits := -1;
      ELSE
        v_premium_credits := 0;
        v_standard_credits := 3;
    END CASE;

    RETURN QUERY SELECT
      v_monitor_plan,
      TRUE,
      v_monitor_expires,
      v_premium_credits,
      v_standard_credits,
      'monitor'::TEXT;
    RETURN;
  END IF;

  -- モニター権限がない場合は通常のサブスクリプションをチェック
  SELECT 
    COALESCE(s.plan_tier, 'none'),
    COALESCE(s.premium_credits_daily, 0),
    COALESCE(s.standard_credits_daily, 3)
  INTO 
    v_subscription_plan,
    v_premium_credits,
    v_standard_credits
  FROM subscriptions s
  WHERE s.user_id = check_user_id
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;

  IF v_subscription_plan IS NOT NULL AND v_subscription_plan != 'none' THEN
    RETURN QUERY SELECT
      v_subscription_plan,
      FALSE,
      NULL::TIMESTAMPTZ,
      v_premium_credits,
      v_standard_credits,
      'subscription'::TEXT;
    RETURN;
  END IF;

  -- どちらもない場合は無料プラン
  RETURN QUERY SELECT
    'none'::TEXT,
    FALSE,
    NULL::TIMESTAMPTZ,
    0,
    3,
    'none'::TEXT;
END;
$$;

-- 8. active_monitor_usersビューの更新
DROP VIEW IF EXISTS active_monitor_users;
CREATE OR REPLACE VIEW active_monitor_users
WITH (security_invoker = true) AS
SELECT
  *,
  (monitor_expires_at > NOW() AND monitor_start_at <= NOW()) AS is_active
FROM monitor_users
WHERE monitor_expires_at > NOW() AND monitor_start_at <= NOW();

COMMENT ON VIEW active_monitor_users IS '現在有効なモニターユーザーのビュー';

-- ========================================
-- マイグレーション完了
-- ========================================
