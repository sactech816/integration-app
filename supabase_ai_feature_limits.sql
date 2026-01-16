-- ================================================
-- AI機能ごとの使用制限システム
-- ================================================

-- admin_ai_settingsテーブルにfeature_limitsカラムを追加
ALTER TABLE admin_ai_settings 
ADD COLUMN IF NOT EXISTS feature_limits JSONB DEFAULT '{"profile": 5, "business": 5, "quiz": 5, "total": null}'::jsonb;

-- ai_usage_logsテーブルにfeature_typeカラムを追加（既存データとの互換性維持）
ALTER TABLE ai_usage_logs 
ADD COLUMN IF NOT EXISTS feature_type TEXT;

-- feature_typeにインデックスを作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_feature_type ON ai_usage_logs(feature_type);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_created_feature ON ai_usage_logs(user_id, created_at, feature_type);

-- 機能タイプごとのAI使用量チェック関数
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
  v_feature_limits JSONB;
  v_total_usage INT;
  v_feature_usage INT;
  v_feature_limit INT;
  v_total_limit INT;
BEGIN
  -- ユーザーのプランTierを取得（サブスクリプション優先、次にモニターユーザー）
  SELECT COALESCE(s.plan_tier, m.monitor_plan_type, 'none')
  INTO v_plan_tier
  FROM (SELECT check_user_id AS user_id) u
  LEFT JOIN subscriptions s ON s.user_id = u.user_id AND s.status = 'active'
  LEFT JOIN monitor_users m ON m.user_id = u.user_id 
    AND m.monitor_start_at <= NOW() 
    AND m.monitor_expires_at > NOW()
  LIMIT 1;

  -- プランTierがnullの場合はデフォルト
  IF v_plan_tier IS NULL THEN
    v_plan_tier := 'none';
  END IF;

  -- 管理者設定から機能ごとの制限を取得
  SELECT feature_limits
  INTO v_feature_limits
  FROM admin_ai_settings
  WHERE admin_ai_settings.plan_tier = v_plan_tier;

  -- 設定がない場合はデフォルト値
  IF v_feature_limits IS NULL THEN
    v_feature_limits := '{"profile": 5, "business": 5, "quiz": 5, "total": null}'::jsonb;
  END IF;

  -- 機能ごとの制限を取得（-1は無制限）
  v_feature_limit := COALESCE((v_feature_limits->>feature_type)::INT, 5);
  v_total_limit := COALESCE((v_feature_limits->>'total')::INT, -1);

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
      WHEN v_feature_limit = -1 THEN TRUE
      WHEN v_total_limit != -1 AND v_total_usage >= v_total_limit THEN FALSE
      WHEN v_feature_usage >= v_feature_limit THEN FALSE
      ELSE TRUE
    END,
    v_plan_tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- デフォルトのAI機能制限を設定（既存プランに対して）
INSERT INTO admin_ai_settings (plan_tier, feature_limits)
VALUES 
  ('none', '{"profile": 3, "business": 3, "quiz": 3, "total": 5}'::jsonb),
  ('lite', '{"profile": 10, "business": 10, "quiz": 10, "total": 20}'::jsonb),
  ('standard', '{"profile": 15, "business": 15, "quiz": 15, "total": 30}'::jsonb),
  ('pro', '{"profile": 30, "business": 30, "quiz": 30, "total": 50}'::jsonb),
  ('business', '{"profile": -1, "business": -1, "quiz": -1, "total": -1}'::jsonb),
  ('enterprise', '{"profile": -1, "business": -1, "quiz": -1, "total": -1}'::jsonb)
ON CONFLICT (plan_tier) 
DO UPDATE SET 
  feature_limits = EXCLUDED.feature_limits
WHERE admin_ai_settings.feature_limits IS NULL;

-- コメント追加
COMMENT ON COLUMN admin_ai_settings.feature_limits IS 'AI機能ごとの1日あたりの使用制限。-1は無制限。{"profile": 5, "business": 5, "quiz": 5, "total": null}';
COMMENT ON COLUMN ai_usage_logs.feature_type IS 'AI機能のタイプ（profile, business, quiz）';
COMMENT ON FUNCTION check_ai_feature_limit IS '機能タイプごとのAI使用量をチェックし、制限内かどうかを返す';
