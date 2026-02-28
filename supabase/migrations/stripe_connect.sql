-- =============================================
-- Stripe Connect: ユーザー単位の接続情報
-- 申し込みフォーム等の決済機能で利用
-- =============================================

CREATE TABLE IF NOT EXISTS user_stripe_connect (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_account_id TEXT NOT NULL,
  charges_enabled BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  details_submitted BOOLEAN DEFAULT false,
  platform_fee_percent DECIMAL(5,2) DEFAULT 5.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE user_stripe_connect ENABLE ROW LEVEL SECURITY;

-- Service Role: フルアクセス
CREATE POLICY "service_role_user_stripe_connect"
  ON user_stripe_connect FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 認証ユーザー: 自分のレコードのみ参照可
CREATE POLICY "users_select_own_stripe_connect"
  ON user_stripe_connect FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 認証ユーザー: 自分のレコードのみ作成可
CREATE POLICY "users_insert_own_stripe_connect"
  ON user_stripe_connect FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 認証ユーザー: 自分のレコードのみ更新可
CREATE POLICY "users_update_own_stripe_connect"
  ON user_stripe_connect FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_user_stripe_connect_user_id
  ON user_stripe_connect(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stripe_connect_account_id
  ON user_stripe_connect(stripe_account_id);
