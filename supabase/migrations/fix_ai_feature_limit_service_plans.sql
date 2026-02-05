-- ================================================
-- check_ai_feature_limit関数の修正
-- service_plans.ai_daily_limitを参照するように変更
-- ================================================

-- 機能タイプごとのAI使用量チェック関数（修正版）
-- service_plansテーブルのai_daily_limitを優先的に参照
CREATE OR REPLACE FUNCTION check_ai_feature_limit(
  check_user_id UUID,
  feature_type TEXT
) RETURNS TABLE (
  total_usage INT,
  total_limit INT,
  total_remaining INT,
  feature_usage INT,
  feature_limit INT,
  feature_remaining INT,
  can_use BOOLEAN,
  plan_tier TEXT
) AS $$
DECLARE
  v_plan_tier TEXT;
  v_db_plan_tier TEXT;
  v_feature_limits JSONB;
  v_total_usage INT;
  v_feature_usage INT;
  v_feature_limit INT;
  v_total_limit INT;
  v_service_plan_limit INT;
BEGIN
  -- ユーザーのプランTierを取得（サブスクリプション優先、次にモニターユーザー）
  -- 注: subscriptionsテーブルにはserviceカラムがないため、条件を削除
  SELECT COALESCE(s.plan_tier, m.monitor_plan_type, 'none')
  INTO v_plan_tier
  FROM (SELECT check_user_id AS user_id) u
  LEFT JOIN subscriptions s ON s.user_id = u.user_id 
    AND s.status = 'active'
  LEFT JOIN monitor_users m ON m.user_id = u.user_id 
    AND m.monitor_start_at <= NOW() 
    AND m.monitor_expires_at > NOW()
    AND m.service = 'makers'
  LIMIT 1;

  -- プランTierがnullの場合はデフォルト
  IF v_plan_tier IS NULL THEN
    v_plan_tier := 'none';
  END IF;

  -- 集客メーカーのplan_tierをDBの形式に変換（none -> free）
  -- service_plansでは 'free', 'pro' を使用
  v_db_plan_tier := CASE 
    WHEN v_plan_tier = 'none' THEN 'free'
    WHEN v_plan_tier IN ('lite', 'standard', 'pro', 'business', 'enterprise') THEN 'pro'
    ELSE 'free'
  END;

  -- service_plansテーブルからトータル制限を取得（優先）
  SELECT sp.ai_daily_limit
  INTO v_service_plan_limit
  FROM service_plans sp
  WHERE sp.service = 'makers'
    AND sp.plan_tier = v_db_plan_tier
    AND sp.is_active = true;

  -- admin_ai_settingsから機能ごとの制限を取得（機能別制限用）
  SELECT aas.feature_limits
  INTO v_feature_limits
  FROM admin_ai_settings aas
  WHERE aas.plan_tier = v_plan_tier;

  -- 設定がない場合はデフォルト値
  IF v_feature_limits IS NULL THEN
    v_feature_limits := '{"profile": 5, "business": 5, "quiz": 5, "total": null}'::jsonb;
  END IF;

  -- 機能ごとの制限を取得（-1は無制限）
  v_feature_limit := COALESCE((v_feature_limits->>feature_type)::INT, 5);
  
  -- トータル制限: service_plansの値を優先、なければadmin_ai_settingsの値を使用
  v_total_limit := COALESCE(
    v_service_plan_limit, 
    (v_feature_limits->>'total')::INT, 
    -1
  );

  -- 今日の使用量を取得（機能ごと）
  SELECT COUNT(*)
  INTO v_feature_usage
  FROM ai_usage_logs
  WHERE user_id = check_user_id
    AND ai_usage_logs.feature_type = check_ai_feature_limit.feature_type
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';

  -- 今日の使用量を取得（全体）
  SELECT COUNT(*)
  INTO v_total_usage
  FROM ai_usage_logs
  WHERE user_id = check_user_id
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';

  -- 制限内かチェック
  RETURN QUERY SELECT
    v_total_usage,
    CASE WHEN v_total_limit = -1 THEN 999999 ELSE v_total_limit END,
    CASE 
      WHEN v_total_limit = -1 THEN 999999 
      ELSE GREATEST(0, v_total_limit - v_total_usage)
    END,
    v_feature_usage,
    CASE WHEN v_feature_limit = -1 THEN 999999 ELSE v_feature_limit END,
    CASE 
      WHEN v_feature_limit = -1 THEN 999999 
      ELSE GREATEST(0, v_feature_limit - v_feature_usage)
    END,
    CASE
      -- トータル制限が0の場合は使用不可
      WHEN v_total_limit = 0 THEN FALSE
      -- 無制限の場合は使用可
      WHEN v_feature_limit = -1 AND v_total_limit = -1 THEN TRUE
      -- トータル制限に達した場合は使用不可
      WHEN v_total_limit != -1 AND v_total_usage >= v_total_limit THEN FALSE
      -- 機能ごとの制限に達した場合は使用不可
      WHEN v_feature_limit != -1 AND v_feature_usage >= v_feature_limit THEN FALSE
      ELSE TRUE
    END,
    v_plan_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- コメント更新
COMMENT ON FUNCTION check_ai_feature_limit IS '機能タイプごとのAI使用量をチェック。service_plans.ai_daily_limitを優先的に参照し、制限内かどうかを返す。';
