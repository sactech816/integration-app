-- =====================================================
-- アフィリエイト機能 データベースセットアップSQL
-- =====================================================
-- 実行日: 2026年1月
-- 目的: アフィリエイト（紹介）機能の実装
-- 対応サービス: KDL, Quiz, Profile, Business（全サービス対応）
-- =====================================================

-- 1. アフィリエイターテーブル
-- =====================================================

CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,              -- 紹介コード（例: abc123）
  display_name TEXT,                               -- 表示名（任意）
  commission_rate DECIMAL(5,2) DEFAULT 10.00,      -- 報酬率（%）
  status TEXT NOT NULL DEFAULT 'active',           -- active, suspended, pending
  
  -- 統計（キャッシュ用、定期更新）
  total_clicks INT DEFAULT 0,
  total_conversions INT DEFAULT 0,
  total_earnings DECIMAL(12,2) DEFAULT 0,
  unpaid_earnings DECIMAL(12,2) DEFAULT 0,
  
  -- 支払い情報
  payment_method TEXT,                             -- bank, paypal, etc.
  payment_details JSONB,                           -- 振込先情報など
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT affiliates_status_check 
    CHECK (status IN ('active', 'suspended', 'pending'))
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_referral_code ON affiliates(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliates_status ON affiliates(status);

-- RLS
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のアフィリエイト情報を読み取り可能
DROP POLICY IF EXISTS "Users can read own affiliate" ON affiliates;
CREATE POLICY "Users can read own affiliate" ON affiliates
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分のアフィリエイト情報を更新可能（一部フィールドのみ）
DROP POLICY IF EXISTS "Users can update own affiliate" ON affiliates;
CREATE POLICY "Users can update own affiliate" ON affiliates
  FOR UPDATE USING (auth.uid() = user_id);

-- サービスロールは全操作可能
DROP POLICY IF EXISTS "Service role can manage affiliates" ON affiliates;
CREATE POLICY "Service role can manage affiliates" ON affiliates
  FOR ALL USING (true) WITH CHECK (true);

-- 2. 紹介クリックテーブル
-- =====================================================

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  
  -- クリック情報
  landing_page TEXT,                               -- どのページにランディングしたか
  service_type TEXT,                               -- kdl, quiz, profile, business
  
  -- トラッキング情報
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,                                   -- どこから来たか
  
  -- 成約情報
  converted BOOLEAN DEFAULT FALSE,
  conversion_id UUID,                              -- 成約した場合のconversion ID
  
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_clicked_at ON affiliate_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_service_type ON affiliate_clicks(service_type);

-- RLS
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- アフィリエイターは自分のクリック情報を読み取り可能
DROP POLICY IF EXISTS "Affiliates can read own clicks" ON affiliate_clicks;
CREATE POLICY "Affiliates can read own clicks" ON affiliate_clicks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM affiliates a 
      WHERE a.id = affiliate_clicks.affiliate_id 
      AND a.user_id = auth.uid()
    )
  );

-- サービスロールは全操作可能
DROP POLICY IF EXISTS "Service role can manage clicks" ON affiliate_clicks;
CREATE POLICY "Service role can manage clicks" ON affiliate_clicks
  FOR ALL USING (true) WITH CHECK (true);

-- 3. 紹介成果（コンバージョン）テーブル
-- =====================================================

CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  
  -- 成約情報
  service_type TEXT NOT NULL,                      -- kdl, quiz, profile, business
  subscription_id TEXT,                            -- サブスクリプションID
  customer_user_id UUID REFERENCES auth.users(id), -- 成約した顧客
  
  -- プラン情報
  plan_tier TEXT,                                  -- lite, standard, pro, business
  plan_period TEXT,                                -- monthly, yearly
  plan_amount INT,                                 -- 契約金額
  
  -- 報酬情報
  commission_rate DECIMAL(5,2),                    -- 適用された報酬率
  commission_amount DECIMAL(10,2) NOT NULL,        -- 報酬額
  commission_type TEXT DEFAULT 'initial',          -- initial（初回）, recurring（継続）
  
  -- ステータス
  status TEXT NOT NULL DEFAULT 'pending',          -- pending, confirmed, paid, cancelled
  
  -- 日時
  converted_at TIMESTAMPTZ DEFAULT NOW(),          -- 成約日時
  confirmed_at TIMESTAMPTZ,                        -- 確定日時（返金期間後）
  paid_at TIMESTAMPTZ,                             -- 支払日時
  
  -- メタデータ
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT affiliate_conversions_status_check 
    CHECK (status IN ('pending', 'confirmed', 'paid', 'cancelled')),
  CONSTRAINT affiliate_conversions_service_check 
    CHECK (service_type IN ('kdl', 'quiz', 'profile', 'business'))
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_affiliate_id ON affiliate_conversions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_status ON affiliate_conversions(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_service_type ON affiliate_conversions(service_type);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_converted_at ON affiliate_conversions(converted_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_customer ON affiliate_conversions(customer_user_id);

-- RLS
ALTER TABLE affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- アフィリエイターは自分の成果を読み取り可能
DROP POLICY IF EXISTS "Affiliates can read own conversions" ON affiliate_conversions;
CREATE POLICY "Affiliates can read own conversions" ON affiliate_conversions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM affiliates a 
      WHERE a.id = affiliate_conversions.affiliate_id 
      AND a.user_id = auth.uid()
    )
  );

-- サービスロールは全操作可能
DROP POLICY IF EXISTS "Service role can manage conversions" ON affiliate_conversions;
CREATE POLICY "Service role can manage conversions" ON affiliate_conversions
  FOR ALL USING (true) WITH CHECK (true);

-- 4. 報酬支払いテーブル
-- =====================================================

CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  
  -- 支払い情報
  amount DECIMAL(12,2) NOT NULL,                   -- 支払額
  currency TEXT DEFAULT 'JPY',
  
  -- 対象期間
  period_start DATE,
  period_end DATE,
  
  -- ステータス
  status TEXT NOT NULL DEFAULT 'pending',          -- pending, processing, completed, failed
  
  -- 支払い詳細
  payment_method TEXT,
  payment_reference TEXT,                          -- 振込番号など
  
  -- 日時
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- メモ
  notes TEXT,
  
  CONSTRAINT affiliate_payouts_status_check 
    CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate_id ON affiliate_payouts(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_status ON affiliate_payouts(status);

-- RLS
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;

-- アフィリエイターは自分の支払い情報を読み取り可能
DROP POLICY IF EXISTS "Affiliates can read own payouts" ON affiliate_payouts;
CREATE POLICY "Affiliates can read own payouts" ON affiliate_payouts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM affiliates a 
      WHERE a.id = affiliate_payouts.affiliate_id 
      AND a.user_id = auth.uid()
    )
  );

-- サービスロールは全操作可能
DROP POLICY IF EXISTS "Service role can manage payouts" ON affiliate_payouts;
CREATE POLICY "Service role can manage payouts" ON affiliate_payouts
  FOR ALL USING (true) WITH CHECK (true);

-- 5. RPC関数
-- =====================================================

-- 紹介コード生成関数
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- アフィリエイター登録関数
CREATE OR REPLACE FUNCTION register_affiliate(p_user_id UUID, p_display_name TEXT DEFAULT NULL)
RETURNS TABLE(
  affiliate_id UUID,
  referral_code TEXT,
  status TEXT
) AS $$
DECLARE
  v_code TEXT;
  v_affiliate_id UUID;
  v_attempts INT := 0;
BEGIN
  -- 既に登録済みかチェック
  SELECT a.id, a.referral_code, a.status INTO v_affiliate_id, v_code, status
  FROM affiliates a
  WHERE a.user_id = p_user_id;
  
  IF v_affiliate_id IS NOT NULL THEN
    RETURN QUERY SELECT v_affiliate_id, v_code, affiliates.status FROM affiliates WHERE id = v_affiliate_id;
    RETURN;
  END IF;
  
  -- ユニークなコードを生成
  LOOP
    v_code := generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM affiliates WHERE referral_code = v_code);
    v_attempts := v_attempts + 1;
    IF v_attempts > 10 THEN
      RAISE EXCEPTION 'Failed to generate unique referral code';
    END IF;
  END LOOP;
  
  -- 登録
  INSERT INTO affiliates (user_id, referral_code, display_name, status)
  VALUES (p_user_id, v_code, p_display_name, 'active')
  RETURNING id INTO v_affiliate_id;
  
  RETURN QUERY SELECT v_affiliate_id, v_code, 'active'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- アフィリエイト統計取得関数
CREATE OR REPLACE FUNCTION get_affiliate_stats(p_user_id UUID)
RETURNS TABLE(
  affiliate_id UUID,
  referral_code TEXT,
  total_clicks BIGINT,
  total_conversions BIGINT,
  total_earnings DECIMAL,
  unpaid_earnings DECIMAL,
  this_month_clicks BIGINT,
  this_month_conversions BIGINT,
  this_month_earnings DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id as affiliate_id,
    a.referral_code,
    COALESCE((SELECT COUNT(*) FROM affiliate_clicks ac WHERE ac.affiliate_id = a.id), 0) as total_clicks,
    COALESCE((SELECT COUNT(*) FROM affiliate_conversions av WHERE av.affiliate_id = a.id AND av.status != 'cancelled'), 0) as total_conversions,
    COALESCE((SELECT SUM(commission_amount) FROM affiliate_conversions av WHERE av.affiliate_id = a.id AND av.status IN ('confirmed', 'paid')), 0) as total_earnings,
    COALESCE((SELECT SUM(commission_amount) FROM affiliate_conversions av WHERE av.affiliate_id = a.id AND av.status = 'confirmed'), 0) as unpaid_earnings,
    COALESCE((SELECT COUNT(*) FROM affiliate_clicks ac WHERE ac.affiliate_id = a.id AND ac.clicked_at >= date_trunc('month', NOW())), 0) as this_month_clicks,
    COALESCE((SELECT COUNT(*) FROM affiliate_conversions av WHERE av.affiliate_id = a.id AND av.status != 'cancelled' AND av.converted_at >= date_trunc('month', NOW())), 0) as this_month_conversions,
    COALESCE((SELECT SUM(commission_amount) FROM affiliate_conversions av WHERE av.affiliate_id = a.id AND av.status IN ('confirmed', 'paid') AND av.converted_at >= date_trunc('month', NOW())), 0) as this_month_earnings
  FROM affiliates a
  WHERE a.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- クリック記録関数
CREATE OR REPLACE FUNCTION record_affiliate_click(
  p_referral_code TEXT,
  p_landing_page TEXT,
  p_service_type TEXT,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_affiliate_id UUID;
  v_click_id UUID;
BEGIN
  -- アフィリエイターを取得
  SELECT id INTO v_affiliate_id
  FROM affiliates
  WHERE referral_code = p_referral_code AND status = 'active';
  
  IF v_affiliate_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- クリックを記録
  INSERT INTO affiliate_clicks (affiliate_id, landing_page, service_type, ip_address, user_agent, referrer)
  VALUES (v_affiliate_id, p_landing_page, p_service_type, p_ip_address, p_user_agent, p_referrer)
  RETURNING id INTO v_click_id;
  
  -- 統計を更新
  UPDATE affiliates SET total_clicks = total_clicks + 1, updated_at = NOW()
  WHERE id = v_affiliate_id;
  
  RETURN v_click_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 成約記録関数
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
  v_commission_rate DECIMAL;
  v_commission_amount DECIMAL;
  v_conversion_id UUID;
BEGIN
  -- アフィリエイターを取得
  SELECT id, commission_rate INTO v_affiliate_id, v_commission_rate
  FROM affiliates
  WHERE referral_code = p_referral_code AND status = 'active';
  
  IF v_affiliate_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- 報酬額を計算
  v_commission_amount := p_plan_amount * (v_commission_rate / 100);
  
  -- 成約を記録
  INSERT INTO affiliate_conversions (
    affiliate_id, service_type, subscription_id, customer_user_id,
    plan_tier, plan_period, plan_amount,
    commission_rate, commission_amount, status
  )
  VALUES (
    v_affiliate_id, p_service_type, p_subscription_id, p_customer_user_id,
    p_plan_tier, p_plan_period, p_plan_amount,
    v_commission_rate, v_commission_amount, 'pending'
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 6. トリガー
-- =====================================================

-- updated_at自動更新
CREATE OR REPLACE FUNCTION update_affiliate_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_affiliate_updated_at ON affiliates;
CREATE TRIGGER trigger_affiliate_updated_at
  BEFORE UPDATE ON affiliates
  FOR EACH ROW
  EXECUTE FUNCTION update_affiliate_updated_at();

-- 7. コメント
-- =====================================================

COMMENT ON TABLE affiliates IS 'アフィリエイター（紹介者）情報';
COMMENT ON TABLE affiliate_clicks IS '紹介リンクのクリック記録';
COMMENT ON TABLE affiliate_conversions IS '紹介による成約記録';
COMMENT ON TABLE affiliate_payouts IS '報酬支払い記録';
COMMENT ON FUNCTION register_affiliate IS 'アフィリエイター登録（紹介コード自動発行）';
COMMENT ON FUNCTION get_affiliate_stats IS 'アフィリエイト統計取得';
COMMENT ON FUNCTION record_affiliate_click IS '紹介リンククリック記録';
COMMENT ON FUNCTION record_affiliate_conversion IS '紹介成約記録';

-- =====================================================
-- 実行完了
-- =====================================================

