-- ============================================================
-- お試しキャンペーン（トライアルオファー）システム
-- ============================================================

-- 1. トライアル設定テーブル（管理者が制御）
CREATE TABLE IF NOT EXISTS trial_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trial_enabled BOOLEAN NOT NULL DEFAULT false,           -- 一斉ON/OFF
  trial_delay_days INTEGER NOT NULL DEFAULT 7,            -- 登録後N日で表示
  trial_price INTEGER NOT NULL DEFAULT 500,               -- お試し価格（円）
  trial_message TEXT DEFAULT 'お試しキャンペーン実施中！初月わずか500円で全機能をお試しいただけます。', -- モーダルメッセージ
  target_plans TEXT[] NOT NULL DEFAULT ARRAY['standard', 'business', 'premium'], -- 対象プラン
  stripe_coupon_ids JSONB DEFAULT '{}',                   -- プラン別クーポンID {"standard": "xxx", "business": "yyy", "premium": "zzz"}
  campaign_start_at TIMESTAMPTZ,                          -- キャンペーン開始日（NULLなら即時）
  campaign_end_at TIMESTAMPTZ,                            -- キャンペーン終了日（NULLなら無期限）
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- 初期レコード挿入（設定は1行のみ）
INSERT INTO trial_settings (trial_enabled, trial_delay_days, trial_price)
VALUES (false, 7, 500)
ON CONFLICT DO NOTHING;

-- 2. トライアルオファー履歴テーブル（ユーザーごとの利用状況）
CREATE TABLE IF NOT EXISTS trial_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_tier TEXT NOT NULL,                                -- 申し込んだプラン
  trial_price INTEGER NOT NULL,                           -- 適用されたお試し価格
  stripe_coupon_id TEXT,                                  -- 使用したクーポンID
  stripe_session_id TEXT,                                 -- Stripe Checkout セッションID
  offered_at TIMESTAMPTZ NOT NULL DEFAULT now(),          -- モーダル表示日時
  accepted_at TIMESTAMPTZ,                                -- 申し込み日時（NULLなら未申込）
  source TEXT NOT NULL DEFAULT 'auto',                    -- 'auto'（自動表示）| 'admin'（管理者一斉）| 'email'（メールリンク）
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ユーザーごとに1回のみ（UNIQUE制約で1回限りを保証）
CREATE UNIQUE INDEX IF NOT EXISTS idx_trial_offers_user_unique ON trial_offers(user_id);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_trial_offers_accepted ON trial_offers(accepted_at) WHERE accepted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_trial_offers_source ON trial_offers(source);

-- ============================================================
-- RLS ポリシー
-- ============================================================

-- trial_settings
ALTER TABLE trial_settings ENABLE ROW LEVEL SECURITY;

-- 認証済みユーザーは設定を読み取り可能（モーダル表示判定に必要）
CREATE POLICY "authenticated_read_trial_settings" ON trial_settings
  FOR SELECT TO authenticated USING (true);

-- 管理者のみ更新可能
CREATE POLICY "admin_update_trial_settings" ON trial_settings
  FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- trial_offers
ALTER TABLE trial_offers ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のオファーのみ読み取り可能
CREATE POLICY "user_read_own_trial_offers" ON trial_offers
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- サービスロールでINSERT（API経由）
CREATE POLICY "service_insert_trial_offers" ON trial_offers
  FOR INSERT WITH CHECK (true);

-- 管理者は全件読み取り可能
CREATE POLICY "admin_read_all_trial_offers" ON trial_offers
  FOR SELECT TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- 管理者のみ更新可能
CREATE POLICY "admin_update_trial_offers" ON trial_offers
  FOR UPDATE TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
