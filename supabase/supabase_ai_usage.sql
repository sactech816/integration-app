-- =============================================
-- AI使用量管理テーブル
-- KDL（キンドルダイレクトライト）用
-- =============================================

-- AI使用量ログテーブル
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,              -- 'generate_title', 'generate_toc', 'generate_section', 'rewrite' など
  service TEXT NOT NULL DEFAULT 'kdl',    -- 'kdl', 'quiz', 'profile', 'business' など
  model_used TEXT NOT NULL,               -- 'gemini-1.5-flash', 'gpt-4o-mini' など
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  estimated_cost_jpy DECIMAL(10,4) DEFAULT 0,  -- 推定コスト（円）
  metadata JSONB,                         -- 追加情報（book_id, section_id など）
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_id ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user_date ON ai_usage_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_service ON ai_usage_logs(service);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created_at ON ai_usage_logs(created_at);

-- RLSを有効化
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の使用ログを読み取り可能
CREATE POLICY "Users can read own usage logs" ON ai_usage_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: サービスロールのみ挿入可能（APIから記録）
CREATE POLICY "Service role can insert usage logs" ON ai_usage_logs
  FOR INSERT
  WITH CHECK (true);

-- =============================================
-- システム設定テーブル（管理者用）
-- =============================================

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- デフォルト設定を挿入
INSERT INTO system_settings (key, value, description) VALUES
  ('ai_daily_limit', '{"default": 50, "monthly_plan": 50, "yearly_plan": 100}', '1日あたりのAI使用上限（回数）'),
  ('ai_monthly_limit', '{"default": 500, "monthly_plan": 500, "yearly_plan": -1}', '月間AI使用上限（-1=無制限）'),
  ('ai_default_model', '"gemini-1.5-flash"', 'デフォルトで使用するAIモデル'),
  ('kdl_prices', '{"monthly": 4980, "yearly": 39800}', 'KDL料金設定（円）')
ON CONFLICT (key) DO NOTHING;

-- RLSを有効化
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- ポリシー: 設定は誰でも読み取り可能（フロントエンドで使用）
CREATE POLICY "Anyone can read settings" ON system_settings
  FOR SELECT
  USING (true);

-- ポリシー: サービスロールのみ更新可能
CREATE POLICY "Service role can update settings" ON system_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- RPC関数: ユーザーの使用量チェック
-- =============================================

CREATE OR REPLACE FUNCTION check_ai_usage_limit(check_user_id UUID)
RETURNS TABLE (
  daily_usage INTEGER,
  monthly_usage INTEGER,
  daily_limit INTEGER,
  monthly_limit INTEGER,
  is_within_limit BOOLEAN
) AS $$
DECLARE
  v_daily_limit INTEGER;
  v_monthly_limit INTEGER;
  v_daily_usage INTEGER;
  v_monthly_usage INTEGER;
  v_user_plan TEXT;
BEGIN
  -- ユーザーのプランを取得（サブスクリプションから）
  SELECT COALESCE(period, 'none') INTO v_user_plan
  FROM subscriptions
  WHERE user_id = check_user_id AND status = 'active'
  ORDER BY created_at DESC
  LIMIT 1;

  -- デフォルト値
  IF v_user_plan IS NULL THEN
    v_user_plan := 'none';
  END IF;

  -- リミット設定を取得
  SELECT 
    COALESCE((value->>CASE 
      WHEN v_user_plan = 'yearly' THEN 'yearly_plan'
      WHEN v_user_plan = 'monthly' THEN 'monthly_plan'
      ELSE 'default'
    END)::INTEGER, 50)
  INTO v_daily_limit
  FROM system_settings
  WHERE key = 'ai_daily_limit';

  SELECT 
    COALESCE((value->>CASE 
      WHEN v_user_plan = 'yearly' THEN 'yearly_plan'
      WHEN v_user_plan = 'monthly' THEN 'monthly_plan'
      ELSE 'default'
    END)::INTEGER, 500)
  INTO v_monthly_limit
  FROM system_settings
  WHERE key = 'ai_monthly_limit';

  -- 本日の使用量
  SELECT COALESCE(COUNT(*), 0) INTO v_daily_usage
  FROM ai_usage_logs
  WHERE user_id = check_user_id
  AND created_at >= (CURRENT_DATE AT TIME ZONE 'Asia/Tokyo');

  -- 今月の使用量
  SELECT COALESCE(COUNT(*), 0) INTO v_monthly_usage
  FROM ai_usage_logs
  WHERE user_id = check_user_id
  AND created_at >= DATE_TRUNC('month', CURRENT_DATE AT TIME ZONE 'Asia/Tokyo');

  -- 結果を返す
  RETURN QUERY SELECT 
    v_daily_usage,
    v_monthly_usage,
    v_daily_limit,
    v_monthly_limit,
    (v_daily_usage < v_daily_limit) AND (v_monthly_limit = -1 OR v_monthly_usage < v_monthly_limit);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =============================================
-- RPC関数: AI使用量を記録
-- =============================================

CREATE OR REPLACE FUNCTION log_ai_usage(
  p_user_id UUID,
  p_action_type TEXT,
  p_service TEXT DEFAULT 'kdl',
  p_model_used TEXT DEFAULT 'gemini-1.5-flash',
  p_input_tokens INTEGER DEFAULT 0,
  p_output_tokens INTEGER DEFAULT 0,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_cost DECIMAL(10,4);
  v_log_id UUID;
BEGIN
  -- コスト計算（Gemini Flash: 入力$0.075/1M, 出力$0.30/1M、1ドル=150円として）
  v_cost := CASE 
    WHEN p_model_used LIKE 'gemini-1.5-flash%' THEN
      (p_input_tokens * 0.075 / 1000000 + p_output_tokens * 0.30 / 1000000) * 150
    WHEN p_model_used LIKE 'gemini-1.5-pro%' THEN
      (p_input_tokens * 1.25 / 1000000 + p_output_tokens * 5.00 / 1000000) * 150
    WHEN p_model_used LIKE 'gpt-4o-mini%' THEN
      (p_input_tokens * 0.15 / 1000000 + p_output_tokens * 0.60 / 1000000) * 150
    WHEN p_model_used LIKE 'gpt-4o%' THEN
      (p_input_tokens * 2.50 / 1000000 + p_output_tokens * 10.00 / 1000000) * 150
    ELSE 0
  END;

  INSERT INTO ai_usage_logs (
    user_id, action_type, service, model_used, 
    input_tokens, output_tokens, estimated_cost_jpy, metadata
  ) VALUES (
    p_user_id, p_action_type, p_service, p_model_used,
    p_input_tokens, p_output_tokens, v_cost, p_metadata
  ) RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =============================================
-- 管理者用: 統計取得関数
-- =============================================

CREATE OR REPLACE FUNCTION get_ai_usage_stats(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_requests BIGINT,
  total_users BIGINT,
  total_input_tokens BIGINT,
  total_output_tokens BIGINT,
  total_cost_jpy DECIMAL,
  avg_requests_per_user DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_requests,
    COUNT(DISTINCT user_id) as total_users,
    COALESCE(SUM(input_tokens), 0) as total_input_tokens,
    COALESCE(SUM(output_tokens), 0) as total_output_tokens,
    COALESCE(SUM(estimated_cost_jpy), 0) as total_cost_jpy,
    CASE 
      WHEN COUNT(DISTINCT user_id) > 0 THEN COUNT(*)::DECIMAL / COUNT(DISTINCT user_id)
      ELSE 0
    END as avg_requests_per_user
  FROM ai_usage_logs
  WHERE created_at >= p_start_date
  AND created_at < p_end_date + INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';


