-- =====================================================
-- アフィリエイト決済前保存テーブル
-- =====================================================
-- 目的: 決済前に紹介コードを保存し、Webhook受信時にマッチング
-- =====================================================

-- 一時保存テーブル作成
CREATE TABLE IF NOT EXISTS pending_affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,                           -- 決済時のメールアドレス
  referral_code TEXT NOT NULL,                   -- アフィリエイト紹介コード
  service TEXT NOT NULL DEFAULT 'kdl',           -- サービス種別 (kdl, makers)
  plan_tier TEXT,                                -- プランTier
  plan_period TEXT,                              -- 月額/年額
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- ログイン済みの場合
  status TEXT NOT NULL DEFAULT 'pending',        -- pending, matched, expired
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'), -- 24時間で期限切れ
  matched_at TIMESTAMPTZ,                        -- マッチング日時
  subscription_id TEXT                           -- マッチしたサブスクリプションID
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_pending_affiliate_email ON pending_affiliate_conversions(email);
CREATE INDEX IF NOT EXISTS idx_pending_affiliate_status ON pending_affiliate_conversions(status);
CREATE INDEX IF NOT EXISTS idx_pending_affiliate_referral_code ON pending_affiliate_conversions(referral_code);
CREATE INDEX IF NOT EXISTS idx_pending_affiliate_expires_at ON pending_affiliate_conversions(expires_at);

-- RLSを有効化
ALTER TABLE pending_affiliate_conversions ENABLE ROW LEVEL SECURITY;

-- ポリシー: サービスロールのみ操作可能
DROP POLICY IF EXISTS "Service role can manage pending_affiliate_conversions" ON pending_affiliate_conversions;
CREATE POLICY "Service role can manage pending_affiliate_conversions" ON pending_affiliate_conversions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 期限切れレコードをクリーンアップする関数
CREATE OR REPLACE FUNCTION cleanup_expired_pending_affiliates()
RETURNS void AS $$
BEGIN
  UPDATE pending_affiliate_conversions
  SET status = 'expired'
  WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 紹介コードでpendingレコードを検索しマッチングする関数
CREATE OR REPLACE FUNCTION match_pending_affiliate(
  p_email TEXT,
  p_service TEXT,
  p_subscription_id TEXT
)
RETURNS TABLE (
  referral_code TEXT,
  plan_tier TEXT,
  plan_period TEXT
) AS $$
DECLARE
  v_record pending_affiliate_conversions%ROWTYPE;
BEGIN
  -- 最新のpendingレコードを検索（メールアドレスとサービスでマッチ）
  SELECT * INTO v_record
  FROM pending_affiliate_conversions
  WHERE pending_affiliate_conversions.email = LOWER(p_email)
    AND pending_affiliate_conversions.service = p_service
    AND pending_affiliate_conversions.status = 'pending'
    AND pending_affiliate_conversions.expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    -- マッチしたらステータスを更新
    UPDATE pending_affiliate_conversions
    SET status = 'matched',
        matched_at = NOW(),
        subscription_id = p_subscription_id
    WHERE id = v_record.id;

    -- 結果を返す
    RETURN QUERY SELECT 
      v_record.referral_code,
      v_record.plan_tier,
      v_record.plan_period;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- コメント追加
COMMENT ON TABLE pending_affiliate_conversions IS 'アフィリエイト決済前保存テーブル - 決済完了時にマッチング';
COMMENT ON FUNCTION match_pending_affiliate IS 'メールアドレスでpendingレコードを検索しマッチング';
COMMENT ON FUNCTION cleanup_expired_pending_affiliates IS '期限切れのpendingレコードをクリーンアップ';
