-- ============================================================
-- 単品購入（Feature Purchases）テーブル
-- サブスクなしで個別機能を都度購入する仕組み
-- ============================================================

-- 購入可能な機能の定義マスタ
CREATE TABLE IF NOT EXISTS feature_products (
  id TEXT PRIMARY KEY,                        -- 例: 'ai_pack_10', 'html_export', 'copyright_hide'
  name TEXT NOT NULL,                         -- 表示名
  description TEXT,                           -- 説明
  category TEXT NOT NULL DEFAULT 'general',   -- カテゴリ: general, ai, export, business
  price INTEGER NOT NULL,                     -- 価格（円）
  -- 有効期間の種類
  duration_type TEXT NOT NULL DEFAULT 'one_time',  -- 'one_time'（即時消費）, 'days'（期間制）, 'permanent'（永久）, 'count'（回数制）
  duration_days INTEGER,                      -- duration_type='days' の場合の日数
  usage_count INTEGER,                        -- duration_type='count' の場合の回数
  -- メタデータ
  stripe_price_id TEXT,                       -- StripeのPrice ID（設定済みの場合）
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ユーザーの購入履歴
CREATE TABLE IF NOT EXISTS feature_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  product_id TEXT NOT NULL REFERENCES feature_products(id),
  -- 購入情報
  price_paid INTEGER NOT NULL,                -- 支払額（円）
  stripe_session_id TEXT,                     -- Stripe決済ID
  -- 有効期間
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,                     -- NULLの場合は永久/即時消費
  -- 回数制の残り回数
  remaining_uses INTEGER,                     -- NULLの場合は回数制限なし
  -- 適用対象（特定コンテンツに紐づく場合）
  content_id TEXT,                            -- 特定のコンテンツIDに紐づく場合
  content_type TEXT,                          -- 'profile', 'business', 'quiz' 等
  -- ステータス
  status TEXT NOT NULL DEFAULT 'active',      -- 'active', 'expired', 'consumed', 'refunded'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_feature_purchases_user_id ON feature_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_purchases_user_product ON feature_purchases(user_id, product_id);
CREATE INDEX IF NOT EXISTS idx_feature_purchases_status ON feature_purchases(status);
CREATE INDEX IF NOT EXISTS idx_feature_purchases_expires ON feature_purchases(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_feature_products_category ON feature_products(category);

-- RLSポリシー
ALTER TABLE feature_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_purchases ENABLE ROW LEVEL SECURITY;

-- feature_products は全員読み取り可能
CREATE POLICY "feature_products_read" ON feature_products
  FOR SELECT USING (true);

-- feature_purchases はユーザー自身のみ
CREATE POLICY "feature_purchases_read_own" ON feature_purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "feature_purchases_insert_own" ON feature_purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Service Roleは全操作可能
CREATE POLICY "feature_products_service" ON feature_products
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "feature_purchases_service" ON feature_purchases
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 初期データ: 購入可能な機能
-- ============================================================

INSERT INTO feature_products (id, name, description, category, price, duration_type, usage_count, sort_order) VALUES
  -- AI系
  ('ai_pack_10', 'AI生成 10回パック', 'AI自動生成を10回利用できるパック', 'ai', 500, 'count', 10, 10),
  ('ai_pack_30', 'AI生成 30回パック', 'AI自動生成を30回利用できるパック（お得）', 'ai', 1200, 'count', 30, 20),
  -- エクスポート系
  ('html_export', 'HTMLダウンロード（1回）', 'コンテンツをHTMLファイルでダウンロード', 'export', 500, 'one_time', NULL, 30),
  ('embed_code', '埋め込みコード発行（1回）', 'コンテンツの埋め込みコードを発行', 'export', 500, 'one_time', NULL, 40),
  ('pdf_export', 'PDF出力（1回）', 'コンテンツをPDFで出力', 'export', 300, 'one_time', NULL, 50),
  -- 表示系
  ('copyright_hide', 'コピーライト非表示（1件・永久）', '特定コンテンツのコピーライト表示を永久に非表示', 'display', 500, 'permanent', NULL, 60),
  -- ビジネス系
  ('csv_export', '回答データCSVエクスポート（1回）', 'クイズ・アンケートの回答データをCSVでダウンロード', 'business', 500, 'one_time', NULL, 70),
  ('analytics_month', 'アクセス解析（1ヶ月）', '特定コンテンツのアクセス解析を1ヶ月利用', 'business', 500, 'days', 30, 80),
  ('funnel_advanced', 'ファネル高度分岐（1件・永久）', '特定ファネルで条件分岐ロジックを利用', 'business', 1000, 'permanent', NULL, 90),
  ('salesletter_bundle', 'セールスレター一括生成', 'LP+メール+広告文をAIで一括生成', 'business', 1000, 'one_time', NULL, 100),
  ('newsletter_extra_1000', 'メルマガ追加1,000通', '当月のメルマガ送信枠を1,000通追加', 'business', 500, 'days', 30, 110),
  ('step_email_scenario', 'ステップメール（1シナリオ追加）', 'ステップメールのシナリオを1つ追加', 'business', 800, 'permanent', NULL, 120)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 有効購入チェック用のRPC関数
-- ============================================================

CREATE OR REPLACE FUNCTION check_feature_access(
  p_user_id UUID,
  p_product_id TEXT,
  p_content_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_purchase RECORD;
  v_has_access BOOLEAN := false;
BEGIN
  -- アクティブな購入を検索（有効期限内、残り回数あり）
  SELECT *
  INTO v_purchase
  FROM feature_purchases
  WHERE user_id = p_user_id
    AND product_id = p_product_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
    AND (remaining_uses IS NULL OR remaining_uses > 0)
    AND (p_content_id IS NULL OR content_id IS NULL OR content_id = p_content_id)
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    v_has_access := true;
  END IF;

  RETURN jsonb_build_object(
    'has_access', v_has_access,
    'purchase_id', v_purchase.id,
    'remaining_uses', v_purchase.remaining_uses,
    'expires_at', v_purchase.expires_at
  );
END;
$$;

-- ============================================================
-- 回数制購入の使用（1回消費）
-- ============================================================

CREATE OR REPLACE FUNCTION use_feature_purchase(
  p_user_id UUID,
  p_product_id TEXT,
  p_content_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_purchase RECORD;
BEGIN
  -- 有効な購入を排他ロックで取得
  SELECT *
  INTO v_purchase
  FROM feature_purchases
  WHERE user_id = p_user_id
    AND product_id = p_product_id
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
    AND (remaining_uses IS NULL OR remaining_uses > 0)
    AND (p_content_id IS NULL OR content_id IS NULL OR content_id = p_content_id)
  ORDER BY created_at ASC  -- 古い購入から消費（FIFO）
  LIMIT 1
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'no_active_purchase'
    );
  END IF;

  -- 回数制の場合は残り回数を減らす
  IF v_purchase.remaining_uses IS NOT NULL THEN
    UPDATE feature_purchases
    SET remaining_uses = remaining_uses - 1,
        status = CASE WHEN remaining_uses - 1 <= 0 THEN 'consumed' ELSE 'active' END
    WHERE id = v_purchase.id;

    RETURN jsonb_build_object(
      'success', true,
      'purchase_id', v_purchase.id,
      'remaining_uses', v_purchase.remaining_uses - 1
    );
  END IF;

  -- 一回限りの場合はステータスを consumed に
  IF v_purchase.remaining_uses IS NULL AND
     (SELECT duration_type FROM feature_products WHERE id = p_product_id) = 'one_time' THEN
    UPDATE feature_purchases
    SET status = 'consumed'
    WHERE id = v_purchase.id;
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'purchase_id', v_purchase.id,
    'remaining_uses', v_purchase.remaining_uses
  );
END;
$$;

-- ============================================================
-- subscriptions テーブルに plan_tier カラムを追加（まだない場合）
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'plan_tier'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN plan_tier TEXT;
    -- 既存のProプラン行をbusinessにマイグレーション
    UPDATE subscriptions
    SET plan_tier = 'business'
    WHERE service = 'makers'
      AND status = 'active'
      AND (plan_name ILIKE '%pro%' OR plan_name ILIKE '%プロ%');
  END IF;
END $$;
