-- ================================================================
-- ポイントシステム
-- ユーザーがポイントを購入し、ツール利用時に消費する仕組み
-- ================================================================

-- ─── 1. ポイント残高テーブル ───
CREATE TABLE IF NOT EXISTS user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_purchased INTEGER NOT NULL DEFAULT 0,   -- 累計購入ポイント
  total_consumed INTEGER NOT NULL DEFAULT 0,    -- 累計消費ポイント
  total_granted INTEGER NOT NULL DEFAULT 0,     -- 累計付与ポイント（Proプラン月次付与等）
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- ─── 2. ポイント取引履歴テーブル ───
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'purchase',         -- ポイント購入
    'consume',          -- ツール利用で消費
    'grant_monthly',    -- Proプラン月次付与
    'grant_bonus',      -- ボーナス付与（キャンペーン等）
    'refund',           -- 返金
    'expire'            -- 有効期限切れ
  )),
  amount INTEGER NOT NULL,                      -- 正: 加算、負: 減算
  balance_after INTEGER NOT NULL,               -- 取引後の残高
  description TEXT,                             -- 説明（例: "診断クイズ保存", "500ptパック購入"）
  metadata JSONB DEFAULT '{}',                  -- 追加情報
  -- metadata例:
  --   purchase:  { stripe_payment_intent_id, pack_id }
  --   consume:   { service_type, content_id, action }
  --   grant:     { subscription_id, month }
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 3. ポイントパック定義テーブル ───
CREATE TABLE IF NOT EXISTS point_packs (
  id TEXT PRIMARY KEY,                          -- 例: 'pack_100', 'pack_500', 'pack_1000'
  name TEXT NOT NULL,                           -- 表示名
  points INTEGER NOT NULL,                      -- 付与ポイント数
  price INTEGER NOT NULL,                       -- 価格（円）
  bonus_points INTEGER NOT NULL DEFAULT 0,      -- ボーナスポイント
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── 4. ツールごとのポイントコスト定義テーブル ───
CREATE TABLE IF NOT EXISTS point_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_type TEXT NOT NULL,                   -- 'quiz', 'profile', 'business', etc.
  action TEXT NOT NULL DEFAULT 'save',          -- 'save', 'ai_generate', 'export_html', 'embed'
  cost INTEGER NOT NULL,                        -- 消費ポイント数
  description TEXT,                             -- 表示用説明
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(service_type, action)
);

-- ─── インデックス ───
CREATE INDEX IF NOT EXISTS idx_user_points_user_id ON user_points(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user_id ON point_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_point_transactions_type ON point_transactions(type);
CREATE INDEX IF NOT EXISTS idx_point_transactions_created_at ON point_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_point_costs_service_type ON point_costs(service_type, action);

-- ─── RLS ───
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_costs ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の残高のみ閲覧可能
CREATE POLICY "Users can view own points"
  ON user_points FOR SELECT
  USING (auth.uid() = user_id);

-- ユーザーは自分の取引履歴のみ閲覧可能
CREATE POLICY "Users can view own transactions"
  ON point_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ポイントパックは全員閲覧可能
CREATE POLICY "Anyone can view active point packs"
  ON point_packs FOR SELECT
  USING (is_active = true);

-- ポイントコストは全員閲覧可能
CREATE POLICY "Anyone can view point costs"
  ON point_costs FOR SELECT
  USING (is_active = true);

-- Service Role は全操作可能
CREATE POLICY "Service role can manage user_points"
  ON user_points FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage point_transactions"
  ON point_transactions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage point_packs"
  ON point_packs FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage point_costs"
  ON point_costs FOR ALL USING (true) WITH CHECK (true);

-- ─── 初期データ: ポイントパック ───
INSERT INTO point_packs (id, name, points, price, bonus_points, sort_order) VALUES
  ('pack_100',  '100ポイント',   100,   500,   0,  1),
  ('pack_500',  '500ポイント',   500,  2000, 50,  2),
  ('pack_1000', '1000ポイント', 1000,  3500, 150, 3)
ON CONFLICT (id) DO NOTHING;

-- ─── 初期データ: ツールごとのポイントコスト ───
INSERT INTO point_costs (service_type, action, cost, description) VALUES
  -- LP・ページ作成
  ('profile',           'save',         20, 'プロフィールLP保存'),
  ('business',          'save',         30, 'ビジネスLP保存'),
  ('webinar',           'save',         30, 'ウェビナーLP保存'),
  ('onboarding',        'save',         15, 'はじめかた保存'),
  -- 診断・クイズ
  ('quiz',              'save',         20, '診断クイズ保存'),
  ('entertainment_quiz','save',         20, 'エンタメ診断保存'),
  -- ライティング・制作
  ('salesletter',       'save',         30, 'セールスライター保存'),
  ('thumbnail',         'save',         15, 'サムネイル保存'),
  ('sns-post',          'save',         10, 'SNS投稿保存'),
  -- 集客・イベント
  ('booking',           'save',         20, '予約メニュー保存'),
  ('attendance',        'save',         15, '出欠管理保存'),
  ('survey',            'save',         15, 'アンケート保存'),
  ('newsletter',        'save',         20, 'メルマガ保存'),
  ('funnel',            'save',         40, 'ファネル保存'),
  -- 収益化
  ('order-form',        'save',         25, '申し込みフォーム保存'),
  ('gamification',      'save',         30, 'ゲーミフィケーション保存'),
  -- AI生成（共通）
  ('ai',                'generate',     10, 'AI生成（1回）'),
  -- HTML出力・埋め込み
  ('export',            'html',         30, 'HTMLダウンロード'),
  ('export',            'embed',        30, '埋め込みコード発行')
ON CONFLICT (service_type, action) DO NOTHING;

-- ─── ポイント残高更新用のDB関数（アトミック操作） ───
CREATE OR REPLACE FUNCTION consume_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- 排他ロックで残高を取得
  SELECT balance INTO v_current_balance
  FROM user_points
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- レコードが存在しない場合
  IF v_current_balance IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'no_points_record', 'balance', 0);
  END IF;

  -- 残高不足チェック
  IF v_current_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_balance', 'balance', v_current_balance);
  END IF;

  v_new_balance := v_current_balance - p_amount;

  -- 残高を更新
  UPDATE user_points
  SET balance = v_new_balance,
      total_consumed = total_consumed + p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;

  -- 取引履歴を記録
  INSERT INTO point_transactions (user_id, type, amount, balance_after, description, metadata)
  VALUES (p_user_id, 'consume', -p_amount, v_new_balance, p_description, p_metadata)
  RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'balance', v_new_balance,
    'consumed', p_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── ポイント加算用のDB関数（購入・付与） ───
CREATE OR REPLACE FUNCTION add_points(
  p_user_id UUID,
  p_amount INTEGER,
  p_type TEXT DEFAULT 'purchase',
  p_description TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
) RETURNS JSONB AS $$
DECLARE
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- user_pointsがなければ作成
  INSERT INTO user_points (user_id, balance)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- 排他ロックで残高を更新
  UPDATE user_points
  SET balance = balance + p_amount,
      total_purchased = CASE WHEN p_type = 'purchase' THEN total_purchased + p_amount ELSE total_purchased END,
      total_granted = CASE WHEN p_type IN ('grant_monthly', 'grant_bonus') THEN total_granted + p_amount ELSE total_granted END,
      updated_at = now()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;

  -- 取引履歴を記録
  INSERT INTO point_transactions (user_id, type, amount, balance_after, description, metadata)
  VALUES (p_user_id, p_type, p_amount, v_new_balance, p_description, p_metadata)
  RETURNING id INTO v_transaction_id;

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'balance', v_new_balance,
    'added', p_amount
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
