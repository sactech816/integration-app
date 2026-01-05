-- =============================================
-- サブスクリプション管理テーブル
-- UnivaPay / Stripe 対応
-- =============================================

-- サブスクリプションテーブル作成
CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,                          -- UnivaPayまたはStripeのサブスクリプションID
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  provider TEXT NOT NULL DEFAULT 'univapay',    -- 'univapay' または 'stripe'
  status TEXT NOT NULL DEFAULT 'pending',       -- pending, active, suspended, payment_failed, canceled, completed
  amount INTEGER NOT NULL,                      -- 金額（円）
  currency TEXT NOT NULL DEFAULT 'jpy',
  period TEXT NOT NULL DEFAULT 'monthly',       -- monthly, yearly
  plan_name TEXT,                               -- プラン名
  email TEXT,                                   -- 通知用メール
  next_payment_date TIMESTAMPTZ,                -- 次回決済日
  canceled_at TIMESTAMPTZ,                      -- キャンセル日時
  metadata JSONB,                               -- その他メタデータ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_provider ON subscriptions(provider);
CREATE INDEX IF NOT EXISTS idx_subscriptions_email ON subscriptions(email);

-- RLSを有効化
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のサブスクリプションを読み取り可能
CREATE POLICY "Users can read own subscriptions" ON subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: サービスロール(管理者)のみ挿入・更新可能
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- サブスクリプション支払い履歴テーブル
-- =============================================

CREATE TABLE IF NOT EXISTS subscription_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id TEXT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'jpy',
  status TEXT NOT NULL DEFAULT 'pending',       -- pending, success, failed
  paid_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_subscription_payments_subscription_id ON subscription_payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_status ON subscription_payments(status);
CREATE INDEX IF NOT EXISTS idx_subscription_payments_paid_at ON subscription_payments(paid_at);

-- RLSを有効化
ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の支払い履歴を読み取り可能
CREATE POLICY "Users can read own payments" ON subscription_payments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM subscriptions s 
      WHERE s.id = subscription_payments.subscription_id 
      AND s.user_id = auth.uid()
    )
  );

-- ポリシー: サービスロール(管理者)のみ挿入・更新可能
CREATE POLICY "Service role can manage payments" ON subscription_payments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- 便利なビュー: アクティブサブスクリプション
-- =============================================

CREATE OR REPLACE VIEW active_subscriptions AS
SELECT 
  s.id,
  s.user_id,
  s.provider,
  s.status,
  s.amount,
  s.period,
  s.plan_name,
  s.email,
  s.next_payment_date,
  s.created_at,
  au.email as user_email
FROM subscriptions s
LEFT JOIN auth.users au ON s.user_id = au.id
WHERE s.status = 'active';

-- =============================================
-- RPC関数: ユーザーのサブスクリプション取得
-- =============================================

CREATE OR REPLACE FUNCTION get_user_subscription(check_user_id UUID)
RETURNS TABLE (
  id TEXT,
  provider TEXT,
  status TEXT,
  amount INTEGER,
  period TEXT,
  plan_name TEXT,
  next_payment_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.provider,
    s.status,
    s.amount,
    s.period,
    s.plan_name,
    s.next_payment_date,
    s.created_at
  FROM subscriptions s
  WHERE s.user_id = check_user_id
  AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC関数: サブスクリプション統計取得（管理者用）
-- =============================================

CREATE OR REPLACE FUNCTION get_subscription_stats()
RETURNS TABLE (
  total_subscriptions BIGINT,
  active_subscriptions BIGINT,
  total_mrr BIGINT,
  canceled_this_month BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_subscriptions,
    COUNT(*) FILTER (WHERE status = 'active') as active_subscriptions,
    COALESCE(SUM(amount) FILTER (WHERE status = 'active'), 0) as total_mrr,
    COUNT(*) FILTER (
      WHERE status = 'canceled' 
      AND canceled_at >= date_trunc('month', NOW())
    ) as canceled_this_month
  FROM subscriptions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- トリガー: updated_at自動更新
-- =============================================

CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_subscription_updated_at ON subscriptions;
CREATE TRIGGER trigger_subscription_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

