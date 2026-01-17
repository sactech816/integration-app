-- ========================================
-- モニターユーザー管理システム
-- 管理者が特定のユーザーに期間限定で有料プラン機能を開放できる機能
-- ========================================

-- 1. monitor_usersテーブルの作成
CREATE TABLE IF NOT EXISTS monitor_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),  -- 付与した管理者
  monitor_plan_type TEXT NOT NULL CHECK (monitor_plan_type IN ('lite', 'standard', 'pro', 'business', 'enterprise')),
  monitor_start_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  monitor_expires_at TIMESTAMPTZ NOT NULL,
  notes TEXT,  -- 管理者メモ（モニター理由など）
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- 1人のユーザーに対して同時に有効なモニター権限は1つのみ
  UNIQUE (user_id)
);

-- 2. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_monitor_users_user_id ON monitor_users(user_id);
-- 有効なモニター権限を素早く検索するための部分インデックス
CREATE INDEX IF NOT EXISTS idx_monitor_users_active ON monitor_users(user_id, monitor_expires_at, monitor_start_at);
CREATE INDEX IF NOT EXISTS idx_monitor_users_expires_at ON monitor_users(monitor_expires_at);

-- 3. RLS (Row Level Security) の有効化
ALTER TABLE monitor_users ENABLE ROW LEVEL SECURITY;

-- 4. RLSポリシーの作成
-- サービスロール（バックエンドAPI）のみがすべての操作を実行可能
-- フロントエンドからの直接アクセスは制限
CREATE POLICY "Service role can manage monitor users"
  ON monitor_users FOR ALL
  USING (true)
  WITH CHECK (true);

-- ユーザーは自分のモニター情報のみ閲覧可能
CREATE POLICY "Users can view their own monitor status"
  ON monitor_users FOR SELECT
  USING (user_id = auth.uid());

-- 5. updated_atの自動更新トリガー
CREATE OR REPLACE FUNCTION update_monitor_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_monitor_users_updated_at
  BEFORE UPDATE ON monitor_users
  FOR EACH ROW
  EXECUTE FUNCTION update_monitor_users_updated_at();

-- 6. ユーザーのプラン情報取得関数の拡張（モニター優先）
CREATE OR REPLACE FUNCTION get_user_plan_with_monitor(
  check_user_id UUID
)
RETURNS TABLE (
  plan_tier TEXT,
  is_monitor BOOLEAN,
  monitor_expires_at TIMESTAMPTZ,
  premium_credits_daily INTEGER,
  standard_credits_daily INTEGER,
  source TEXT  -- 'subscription', 'monitor', 'none'
) LANGUAGE plpgsql AS $$
DECLARE
  v_monitor_plan TEXT;
  v_monitor_expires TIMESTAMPTZ;
  v_subscription_plan TEXT;
  v_premium_credits INTEGER;
  v_standard_credits INTEGER;
BEGIN
  -- モニター権限をチェック（有効期限内のもの）
  SELECT 
    monitor_plan_type,
    monitor_users.monitor_expires_at
  INTO 
    v_monitor_plan,
    v_monitor_expires
  FROM monitor_users
  WHERE monitor_users.user_id = check_user_id
    AND monitor_users.monitor_start_at <= NOW()
    AND monitor_users.monitor_expires_at > NOW()
  LIMIT 1;

  -- モニター権限がある場合はそれを優先
  IF v_monitor_plan IS NOT NULL THEN
    -- モニタープランに応じたクレジット設定
    CASE v_monitor_plan
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
        v_standard_credits := -1;  -- 無制限
      WHEN 'enterprise' THEN
        v_premium_credits := -1;  -- 無制限
        v_standard_credits := -1;  -- 無制限
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
    3,  -- 無料は3回/日
    'none'::TEXT;
END;
$$;

-- 7. ハイブリッドクレジットチェック関数の更新（モニター対応）
-- 既存の関数を削除してから再作成
DROP FUNCTION IF EXISTS check_ai_credit_limit(UUID, TEXT);

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
  plan_tier TEXT,
  is_monitor BOOLEAN,
  monitor_expires_at TIMESTAMPTZ
) LANGUAGE plpgsql AS $$
DECLARE
  v_plan_info RECORD;
  v_premium_usage INTEGER;
  v_standard_usage INTEGER;
BEGIN
  -- ユーザーのプラン情報を取得（モニター優先）
  SELECT * INTO v_plan_info
  FROM get_user_plan_with_monitor(check_user_id);

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
    v_plan_info.premium_credits_daily,
    v_plan_info.standard_credits_daily,
    -- Premium枠が使える条件: 上限-1(無制限) または 使用量が上限未満
    (v_plan_info.premium_credits_daily = -1 OR v_premium_usage < v_plan_info.premium_credits_daily) AS can_use_premium,
    -- Standard枠が使える条件: 上限-1(無制限) または 使用量が上限未満
    (v_plan_info.standard_credits_daily = -1 OR v_standard_usage < v_plan_info.standard_credits_daily) AS can_use_standard,
    v_plan_info.plan_tier,
    v_plan_info.is_monitor,
    v_plan_info.monitor_expires_at;
END;
$$;

-- 8. コメント追加
COMMENT ON TABLE monitor_users IS '管理者が特定ユーザーに期間限定で有料プラン機能を開放するためのテーブル';
COMMENT ON COLUMN monitor_users.monitor_plan_type IS 'モニターとして付与するプラン種別';
COMMENT ON COLUMN monitor_users.monitor_start_at IS 'モニター開始日時';
COMMENT ON COLUMN monitor_users.monitor_expires_at IS 'モニター終了日時（有効期限）';
COMMENT ON COLUMN monitor_users.notes IS '管理者メモ（付与理由など）';

-- 9. 有効なモニター権限を確認するヘルパービュー（オプション）
CREATE OR REPLACE VIEW active_monitor_users AS
SELECT 
  *,
  (monitor_expires_at > NOW() AND monitor_start_at <= NOW()) AS is_active
FROM monitor_users
WHERE monitor_expires_at > NOW() AND monitor_start_at <= NOW();

COMMENT ON VIEW active_monitor_users IS '現在有効なモニターユーザーのビュー';

-- ========================================
-- マイグレーション完了
-- ========================================

