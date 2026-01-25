-- =====================================================
-- アフィリエイト サービス別設定テーブル
-- =====================================================
-- 実行日: 2026年1月
-- 目的: メインサイトとKindleのアフィリエイト設定を分離
-- =====================================================

-- 1. サービス別アフィリエイト設定テーブル
-- =====================================================

CREATE TABLE IF NOT EXISTS affiliate_service_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type TEXT NOT NULL UNIQUE,              -- 'main', 'kdl', 'quiz', 'profile', 'business'
  display_name TEXT NOT NULL,                     -- 表示名
  commission_rate DECIMAL(5,2) DEFAULT 20.00,     -- 報酬率（%）
  signup_points INT DEFAULT 0,                    -- 無料登録時のポイント（アフィリエイターへ）
  enabled BOOLEAN DEFAULT true,                   -- 有効/無効
  description TEXT,                               -- 説明
  landing_page TEXT,                              -- ランディングページURL
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_affiliate_service_settings_service_type 
  ON affiliate_service_settings(service_type);
CREATE INDEX IF NOT EXISTS idx_affiliate_service_settings_enabled 
  ON affiliate_service_settings(enabled);

-- RLS
ALTER TABLE affiliate_service_settings ENABLE ROW LEVEL SECURITY;

-- 全員が読み取り可能（設定情報は公開）
DROP POLICY IF EXISTS "Anyone can read service settings" ON affiliate_service_settings;
CREATE POLICY "Anyone can read service settings" ON affiliate_service_settings
  FOR SELECT USING (true);

-- サービスロールは全操作可能（管理者用）
DROP POLICY IF EXISTS "Service role can manage service settings" ON affiliate_service_settings;
CREATE POLICY "Service role can manage service settings" ON affiliate_service_settings
  FOR ALL USING (true) WITH CHECK (true);

-- 2. 初期データ
-- =====================================================

INSERT INTO affiliate_service_settings (service_type, display_name, commission_rate, signup_points, enabled, description, landing_page) VALUES
  ('main', 'メインサイト', 20.00, 500, true, 'メインサイト（集客メーカー）のアフィリエイト。新規登録で500ポイント付与。', '/'),
  ('kdl', 'Kindle執筆', 20.00, 0, true, 'Kindle Direct Lite（KDL）のアフィリエイト。有料課金のみ20%報酬。', '/kindle/lp'),
  ('quiz', '診断クイズ', 20.00, 0, false, '診断クイズのアフィリエイト（将来対応）', '/quiz'),
  ('profile', 'プロフィールLP', 20.00, 0, false, 'プロフィールLPのアフィリエイト（将来対応）', '/profile'),
  ('business', 'ビジネスLP', 20.00, 0, false, 'ビジネスLPのアフィリエイト（将来対応）', '/business')
ON CONFLICT (service_type) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  landing_page = EXCLUDED.landing_page,
  updated_at = NOW();

-- 3. 更新トリガー
-- =====================================================

CREATE OR REPLACE FUNCTION update_affiliate_service_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_affiliate_service_settings_updated_at ON affiliate_service_settings;
CREATE TRIGGER trigger_affiliate_service_settings_updated_at
  BEFORE UPDATE ON affiliate_service_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_service_settings_updated_at();

-- 4. サービス設定取得関数
-- =====================================================

CREATE OR REPLACE FUNCTION get_affiliate_service_setting(p_service_type TEXT)
RETURNS TABLE(
  service_type TEXT,
  display_name TEXT,
  commission_rate DECIMAL,
  signup_points INT,
  enabled BOOLEAN,
  landing_page TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.service_type,
    s.display_name,
    s.commission_rate,
    s.signup_points,
    s.enabled,
    s.landing_page
  FROM affiliate_service_settings s
  WHERE s.service_type = p_service_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. 紹介登録時のポイント付与関数
-- =====================================================

CREATE OR REPLACE FUNCTION grant_affiliate_signup_points(
  p_referral_code TEXT,
  p_service_type TEXT,
  p_referred_user_id UUID
)
RETURNS TABLE(
  success BOOLEAN,
  points_granted INT,
  affiliate_id UUID,
  message TEXT
) AS $$
DECLARE
  v_affiliate_id UUID;
  v_affiliate_user_id UUID;
  v_signup_points INT;
  v_enabled BOOLEAN;
BEGIN
  -- サービス設定を取得
  SELECT s.signup_points, s.enabled 
  INTO v_signup_points, v_enabled
  FROM affiliate_service_settings s
  WHERE s.service_type = p_service_type;
  
  -- サービスが無効または設定がない場合
  IF v_enabled IS NULL OR NOT v_enabled THEN
    RETURN QUERY SELECT false, 0, NULL::UUID, 'サービスが無効です'::TEXT;
    RETURN;
  END IF;
  
  -- ポイント付与がない場合
  IF v_signup_points IS NULL OR v_signup_points <= 0 THEN
    RETURN QUERY SELECT false, 0, NULL::UUID, 'ポイント付与設定がありません'::TEXT;
    RETURN;
  END IF;
  
  -- アフィリエイターを取得
  SELECT a.id, a.user_id 
  INTO v_affiliate_id, v_affiliate_user_id
  FROM affiliates a
  WHERE a.referral_code = p_referral_code AND a.status = 'active';
  
  IF v_affiliate_id IS NULL THEN
    RETURN QUERY SELECT false, 0, NULL::UUID, '有効なアフィリエイターが見つかりません'::TEXT;
    RETURN;
  END IF;
  
  -- 自分自身の紹介は無効
  IF v_affiliate_user_id = p_referred_user_id THEN
    RETURN QUERY SELECT false, 0, NULL::UUID, '自分自身を紹介することはできません'::TEXT;
    RETURN;
  END IF;
  
  -- ポイントを付与（user_point_balancesテーブルを更新）
  INSERT INTO user_point_balances (user_id, balance)
  VALUES (v_affiliate_user_id, v_signup_points)
  ON CONFLICT (user_id) DO UPDATE SET
    balance = user_point_balances.balance + v_signup_points,
    updated_at = NOW();
  
  -- ポイントログを記録
  INSERT INTO point_logs (user_id, amount, event_type, description, metadata)
  VALUES (
    v_affiliate_user_id,
    v_signup_points,
    'affiliate_signup',
    'アフィリエイト紹介による新規登録ボーナス',
    jsonb_build_object(
      'referral_code', p_referral_code,
      'service_type', p_service_type,
      'referred_user_id', p_referred_user_id
    )
  );
  
  RETURN QUERY SELECT true, v_signup_points, v_affiliate_id, 'ポイントを付与しました'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 成約記録関数の更新（サービス設定から報酬率を取得）
-- =====================================================

-- 既存の関数を置き換え
CREATE OR REPLACE FUNCTION record_affiliate_conversion(
  p_referral_code TEXT,
  p_service_type TEXT,
  p_subscription_id TEXT,
  p_customer_user_id UUID,
  p_plan_tier TEXT,
  p_plan_period TEXT,
  p_plan_amount INT
)
RETURNS UUID AS $$
DECLARE
  v_affiliate_id UUID;
  v_affiliate_commission_rate DECIMAL;
  v_service_commission_rate DECIMAL;
  v_final_commission_rate DECIMAL;
  v_commission_amount DECIMAL;
  v_conversion_id UUID;
  v_service_enabled BOOLEAN;
BEGIN
  -- サービス設定を取得
  SELECT commission_rate, enabled 
  INTO v_service_commission_rate, v_service_enabled
  FROM affiliate_service_settings
  WHERE service_type = p_service_type;
  
  -- サービスが無効な場合はNULLを返す
  IF v_service_enabled IS NOT NULL AND NOT v_service_enabled THEN
    RETURN NULL;
  END IF;
  
  -- アフィリエイターを取得
  SELECT id, commission_rate INTO v_affiliate_id, v_affiliate_commission_rate
  FROM affiliates
  WHERE referral_code = p_referral_code AND status = 'active';
  
  IF v_affiliate_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- 報酬率を決定（サービス設定 > アフィリエイター個別設定）
  -- サービス設定がある場合はそちらを優先
  v_final_commission_rate := COALESCE(v_service_commission_rate, v_affiliate_commission_rate, 20.00);
  
  -- 報酬額を計算
  v_commission_amount := p_plan_amount * (v_final_commission_rate / 100);
  
  -- 成約を記録
  INSERT INTO affiliate_conversions (
    affiliate_id, service_type, subscription_id, customer_user_id,
    plan_tier, plan_period, plan_amount,
    commission_rate, commission_amount, status
  )
  VALUES (
    v_affiliate_id, p_service_type, p_subscription_id, p_customer_user_id,
    p_plan_tier, p_plan_period, p_plan_amount,
    v_final_commission_rate, v_commission_amount, 'pending'
  )
  RETURNING id INTO v_conversion_id;
  
  -- 統計を更新
  UPDATE affiliates SET 
    total_conversions = total_conversions + 1,
    total_earnings = total_earnings + v_commission_amount,
    unpaid_earnings = unpaid_earnings + v_commission_amount,
    updated_at = NOW()
  WHERE id = v_affiliate_id;
  
  RETURN v_conversion_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. コメント
-- =====================================================

COMMENT ON TABLE affiliate_service_settings IS 'サービス別アフィリエイト設定';
COMMENT ON FUNCTION get_affiliate_service_setting IS 'サービス別アフィリエイト設定を取得';
COMMENT ON FUNCTION grant_affiliate_signup_points IS '紹介登録時にアフィリエイターへポイント付与';
COMMENT ON FUNCTION record_affiliate_conversion IS '紹介成約記録（サービス設定対応版）';

-- =====================================================
-- 実行完了
-- =====================================================
