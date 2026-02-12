-- =============================================
-- ゲーミフィケーション機能 データベース設計
-- スタンプラリー / ログインボーナス / ガチャ
-- =============================================

-- =============================================
-- ヘルパー関数（インデックス用IMMUTABLE関数）
-- =============================================

-- タイムスタンプを日付に変換するIMMUTABLE関数
-- ※ タイムゾーンを考慮せず純粋な日付変換のため IMMUTABLE として安全
CREATE OR REPLACE FUNCTION date_from_timestamptz(ts TIMESTAMPTZ)
RETURNS DATE
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT ts::date;
$$;

-- =============================================
-- 1. gamification_campaigns (キャンペーン管理)
-- =============================================

CREATE TABLE IF NOT EXISTS gamification_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('stamp_rally', 'login_bonus', 'gacha')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  animation_type TEXT CHECK (animation_type IN ('capsule', 'roulette', 'omikuji')),
  settings JSONB DEFAULT '{}'::JSONB,
  -- settings例:
  -- stamp_rally: { "total_stamps": 10, "points_per_stamp": 1, "completion_bonus": 10 }
  -- login_bonus: { "points_per_day": 1 }
  -- gacha: { "cost_per_play": 10 }
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_gamification_campaigns_owner_id ON gamification_campaigns(owner_id);
CREATE INDEX IF NOT EXISTS idx_gamification_campaigns_status ON gamification_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_gamification_campaigns_type ON gamification_campaigns(campaign_type);
CREATE INDEX IF NOT EXISTS idx_gamification_campaigns_dates ON gamification_campaigns(start_date, end_date);

-- RLSを有効化
ALTER TABLE gamification_campaigns ENABLE ROW LEVEL SECURITY;

-- ポリシー: 誰でもアクティブなキャンペーンを閲覧可能
CREATE POLICY "Anyone can read active campaigns" ON gamification_campaigns
  FOR SELECT
  USING (status = 'active');

-- ポリシー: オーナーは自分のキャンペーンを全操作可能
CREATE POLICY "Owners can manage own campaigns" ON gamification_campaigns
  FOR ALL
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- =============================================
-- 2. user_point_balances (ユーザーポイント残高)
-- =============================================

CREATE TABLE IF NOT EXISTS user_point_balances (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  current_points INTEGER NOT NULL DEFAULT 0,
  total_accumulated_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- どちらか一方は必須
  CONSTRAINT user_or_session_required CHECK (user_id IS NOT NULL OR session_id IS NOT NULL),
  -- ユニーク制約（user_idまたはsession_idで一意）
  CONSTRAINT unique_user_balance UNIQUE (user_id),
  CONSTRAINT unique_session_balance UNIQUE (session_id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_user_point_balances_user_id ON user_point_balances(user_id);
CREATE INDEX IF NOT EXISTS idx_user_point_balances_session_id ON user_point_balances(session_id);

-- RLSを有効化
ALTER TABLE user_point_balances ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の残高を閲覧可能
CREATE POLICY "Users can read own balance" ON user_point_balances
  FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: サービスロールは全操作可能（匿名ユーザー対応）
CREATE POLICY "Service role can manage all balances" ON user_point_balances
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- 3. point_logs (ポイント履歴・ログ)
-- =============================================

CREATE TABLE IF NOT EXISTS point_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  campaign_id UUID REFERENCES gamification_campaigns(id) ON DELETE SET NULL,
  change_amount INTEGER NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('stamp_get', 'login_bonus', 'gacha_play', 'gacha_win', 'manual_adjust', 'stamp_completion')),
  event_data JSONB DEFAULT '{}'::JSONB,
  -- event_data例:
  -- stamp_get: { "stamp_id": "xyz", "stamp_index": 3 }
  -- gacha_play: { "prize_id": "xxx", "prize_name": "特賞" }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- どちらか一方は必須
  CONSTRAINT log_user_or_session_required CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_point_logs_user_id ON point_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_point_logs_session_id ON point_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_point_logs_campaign_id ON point_logs(campaign_id);
CREATE INDEX IF NOT EXISTS idx_point_logs_event_type ON point_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_point_logs_created_at ON point_logs(created_at DESC);
-- 重複チェック用複合インデックス
CREATE INDEX IF NOT EXISTS idx_point_logs_stamp_check ON point_logs(campaign_id, user_id, event_type, (event_data->>'stamp_id'));
CREATE INDEX IF NOT EXISTS idx_point_logs_stamp_check_session ON point_logs(campaign_id, session_id, event_type, (event_data->>'stamp_id'));
-- ログインボーナス日付チェック用（IMMUTABLE関数を使用）
CREATE INDEX IF NOT EXISTS idx_point_logs_login_bonus_date ON point_logs(campaign_id, user_id, event_type, (date_from_timestamptz(created_at)));

-- RLSを有効化
ALTER TABLE point_logs ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分のログを閲覧可能
CREATE POLICY "Users can read own logs" ON point_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: サービスロールは全操作可能
CREATE POLICY "Service role can manage all logs" ON point_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- 4. gacha_prizes (景品・当選確率)
-- =============================================

CREATE TABLE IF NOT EXISTS gacha_prizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES gamification_campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  probability DECIMAL(5,2) NOT NULL CHECK (probability >= 0 AND probability <= 100),
  is_winning BOOLEAN NOT NULL DEFAULT false,
  stock INTEGER, -- NULLの場合は無制限
  won_count INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_gacha_prizes_campaign_id ON gacha_prizes(campaign_id);
CREATE INDEX IF NOT EXISTS idx_gacha_prizes_is_winning ON gacha_prizes(is_winning);
CREATE INDEX IF NOT EXISTS idx_gacha_prizes_display_order ON gacha_prizes(display_order);

-- RLSを有効化
ALTER TABLE gacha_prizes ENABLE ROW LEVEL SECURITY;

-- ポリシー: 誰でも景品一覧を閲覧可能
CREATE POLICY "Anyone can read prizes" ON gacha_prizes
  FOR SELECT
  USING (true);

-- ポリシー: キャンペーンオーナーは景品を管理可能
CREATE POLICY "Campaign owners can manage prizes" ON gacha_prizes
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM gamification_campaigns gc
      WHERE gc.id = gacha_prizes.campaign_id
      AND gc.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM gamification_campaigns gc
      WHERE gc.id = gacha_prizes.campaign_id
      AND gc.owner_id = auth.uid()
    )
  );

-- =============================================
-- 5. user_prizes (獲得景品履歴)
-- =============================================

CREATE TABLE IF NOT EXISTS user_prizes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  prize_id UUID NOT NULL REFERENCES gacha_prizes(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES gamification_campaigns(id) ON DELETE CASCADE,
  claimed BOOLEAN NOT NULL DEFAULT false,
  claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- どちらか一方は必須
  CONSTRAINT prize_user_or_session_required CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_user_prizes_user_id ON user_prizes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_prizes_session_id ON user_prizes(session_id);
CREATE INDEX IF NOT EXISTS idx_user_prizes_prize_id ON user_prizes(prize_id);
CREATE INDEX IF NOT EXISTS idx_user_prizes_campaign_id ON user_prizes(campaign_id);
CREATE INDEX IF NOT EXISTS idx_user_prizes_claimed ON user_prizes(claimed);

-- RLSを有効化
ALTER TABLE user_prizes ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の獲得景品を閲覧可能
CREATE POLICY "Users can read own prizes" ON user_prizes
  FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: サービスロールは全操作可能
CREATE POLICY "Service role can manage all user prizes" ON user_prizes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- RPC関数: ポイント操作
-- =============================================

-- ポイント追加/減算（トランザクション的に処理）
CREATE OR REPLACE FUNCTION update_user_points(
  p_user_id UUID,
  p_session_id TEXT,
  p_change_amount INTEGER,
  p_campaign_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}'::JSONB
)
RETURNS TABLE (
  success BOOLEAN,
  new_balance INTEGER,
  log_id UUID
) AS $$
DECLARE
  v_balance_id UUID;
  v_current_points INTEGER;
  v_new_points INTEGER;
  v_log_id UUID;
BEGIN
  -- ポイント残高レコードを取得または作成
  IF p_user_id IS NOT NULL THEN
    SELECT id, current_points INTO v_balance_id, v_current_points
    FROM user_point_balances
    WHERE user_id = p_user_id;
    
    IF v_balance_id IS NULL THEN
      INSERT INTO user_point_balances (user_id, current_points, total_accumulated_points)
      VALUES (p_user_id, 0, 0)
      RETURNING id, current_points INTO v_balance_id, v_current_points;
    END IF;
  ELSE
    SELECT id, current_points INTO v_balance_id, v_current_points
    FROM user_point_balances
    WHERE session_id = p_session_id;
    
    IF v_balance_id IS NULL THEN
      INSERT INTO user_point_balances (session_id, current_points, total_accumulated_points)
      VALUES (p_session_id, 0, 0)
      RETURNING id, current_points INTO v_balance_id, v_current_points;
    END IF;
  END IF;
  
  v_current_points := COALESCE(v_current_points, 0);
  v_new_points := v_current_points + p_change_amount;
  
  -- ポイントが負にならないようチェック（減算の場合）
  IF v_new_points < 0 THEN
    RETURN QUERY SELECT false, v_current_points, NULL::UUID;
    RETURN;
  END IF;
  
  -- ポイント残高を更新
  UPDATE user_point_balances
  SET 
    current_points = v_new_points,
    total_accumulated_points = CASE 
      WHEN p_change_amount > 0 THEN total_accumulated_points + p_change_amount
      ELSE total_accumulated_points
    END,
    updated_at = NOW()
  WHERE id = v_balance_id;
  
  -- ログを記録
  INSERT INTO point_logs (user_id, session_id, campaign_id, change_amount, event_type, event_data)
  VALUES (p_user_id, p_session_id, p_campaign_id, p_change_amount, p_event_type, p_event_data)
  RETURNING id INTO v_log_id;
  
  RETURN QUERY SELECT true, v_new_points, v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =============================================
-- RPC関数: スタンプ取得チェック
-- =============================================

CREATE OR REPLACE FUNCTION check_stamp_acquired(
  p_user_id UUID,
  p_session_id TEXT,
  p_campaign_id UUID,
  p_stamp_id TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
BEGIN
  IF p_user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM point_logs
      WHERE user_id = p_user_id
      AND campaign_id = p_campaign_id
      AND event_type = 'stamp_get'
      AND event_data->>'stamp_id' = p_stamp_id
    ) INTO v_exists;
  ELSE
    SELECT EXISTS(
      SELECT 1 FROM point_logs
      WHERE session_id = p_session_id
      AND campaign_id = p_campaign_id
      AND event_type = 'stamp_get'
      AND event_data->>'stamp_id' = p_stamp_id
    ) INTO v_exists;
  END IF;
  
  RETURN v_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =============================================
-- RPC関数: ログインボーナス取得チェック（JST基準）
-- =============================================

CREATE OR REPLACE FUNCTION check_login_bonus_today(
  p_user_id UUID,
  p_session_id TEXT,
  p_campaign_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_exists BOOLEAN;
  v_today_jst DATE;
BEGIN
  -- JSTの今日の日付を取得
  v_today_jst := (NOW() AT TIME ZONE 'Asia/Tokyo')::DATE;
  
  IF p_user_id IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM point_logs
      WHERE user_id = p_user_id
      AND campaign_id = p_campaign_id
      AND event_type = 'login_bonus'
      AND (created_at AT TIME ZONE 'Asia/Tokyo')::DATE = v_today_jst
    ) INTO v_exists;
  ELSE
    SELECT EXISTS(
      SELECT 1 FROM point_logs
      WHERE session_id = p_session_id
      AND campaign_id = p_campaign_id
      AND event_type = 'login_bonus'
      AND (created_at AT TIME ZONE 'Asia/Tokyo')::DATE = v_today_jst
    ) INTO v_exists;
  END IF;
  
  RETURN v_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =============================================
-- RPC関数: ガチャ抽選
-- =============================================

CREATE OR REPLACE FUNCTION play_gacha(
  p_user_id UUID,
  p_session_id TEXT,
  p_campaign_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  error_code TEXT,
  prize_id UUID,
  prize_name TEXT,
  prize_image_url TEXT,
  is_winning BOOLEAN,
  new_balance INTEGER
) AS $$
DECLARE
  v_cost INTEGER;
  v_current_points INTEGER;
  v_balance_id UUID;
  v_selected_prize RECORD;
  v_random_value DECIMAL;
  v_cumulative_prob DECIMAL := 0;
  v_new_balance INTEGER;
  v_log_id UUID;
BEGIN
  -- キャンペーン設定からコストを取得
  SELECT (settings->>'cost_per_play')::INTEGER INTO v_cost
  FROM gamification_campaigns
  WHERE id = p_campaign_id AND status = 'active';
  
  IF v_cost IS NULL THEN
    RETURN QUERY SELECT false, 'campaign_not_found'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::BOOLEAN, NULL::INTEGER;
    RETURN;
  END IF;
  
  -- 現在のポイント残高を取得
  IF p_user_id IS NOT NULL THEN
    SELECT id, current_points INTO v_balance_id, v_current_points
    FROM user_point_balances WHERE user_id = p_user_id;
  ELSE
    SELECT id, current_points INTO v_balance_id, v_current_points
    FROM user_point_balances WHERE session_id = p_session_id;
  END IF;
  
  v_current_points := COALESCE(v_current_points, 0);
  
  -- ポイント不足チェック
  IF v_current_points < v_cost THEN
    RETURN QUERY SELECT false, 'insufficient_points'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::BOOLEAN, v_current_points;
    RETURN;
  END IF;
  
  -- ランダム値生成（0-100）
  v_random_value := random() * 100;
  
  -- 確率に基づいて景品を選択
  FOR v_selected_prize IN 
    SELECT * FROM gacha_prizes 
    WHERE campaign_id = p_campaign_id
    AND (stock IS NULL OR stock > won_count)
    ORDER BY display_order, id
  LOOP
    v_cumulative_prob := v_cumulative_prob + v_selected_prize.probability;
    IF v_random_value <= v_cumulative_prob THEN
      EXIT;
    END IF;
  END LOOP;
  
  -- 景品が見つからない場合（全て在庫切れなど）
  IF v_selected_prize.id IS NULL THEN
    RETURN QUERY SELECT false, 'no_prizes_available'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::BOOLEAN, v_current_points;
    RETURN;
  END IF;
  
  -- ポイントを減算
  v_new_balance := v_current_points - v_cost;
  
  UPDATE user_point_balances
  SET current_points = v_new_balance, updated_at = NOW()
  WHERE id = v_balance_id;
  
  -- ポイントログを記録
  INSERT INTO point_logs (user_id, session_id, campaign_id, change_amount, event_type, event_data)
  VALUES (
    p_user_id, 
    p_session_id, 
    p_campaign_id, 
    -v_cost, 
    'gacha_play',
    jsonb_build_object(
      'prize_id', v_selected_prize.id,
      'prize_name', v_selected_prize.name,
      'is_winning', v_selected_prize.is_winning
    )
  );
  
  -- 当たりの場合、景品を付与
  IF v_selected_prize.is_winning THEN
    INSERT INTO user_prizes (user_id, session_id, prize_id, campaign_id)
    VALUES (p_user_id, p_session_id, v_selected_prize.id, p_campaign_id);
    
    -- 当選カウントを増加
    UPDATE gacha_prizes
    SET won_count = won_count + 1, updated_at = NOW()
    WHERE id = v_selected_prize.id;
  END IF;
  
  RETURN QUERY SELECT 
    true, 
    NULL::TEXT, 
    v_selected_prize.id, 
    v_selected_prize.name, 
    v_selected_prize.image_url,
    v_selected_prize.is_winning,
    v_new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =============================================
-- RPC関数: ユーザーのスタンプ取得状況
-- =============================================

CREATE OR REPLACE FUNCTION get_user_stamps(
  p_user_id UUID,
  p_session_id TEXT,
  p_campaign_id UUID
)
RETURNS TABLE (
  stamp_id TEXT,
  stamp_index INTEGER,
  acquired_at TIMESTAMPTZ
) AS $$
BEGIN
  IF p_user_id IS NOT NULL THEN
    RETURN QUERY
    SELECT 
      event_data->>'stamp_id' as stamp_id,
      (event_data->>'stamp_index')::INTEGER as stamp_index,
      created_at as acquired_at
    FROM point_logs
    WHERE user_id = p_user_id
    AND campaign_id = p_campaign_id
    AND event_type = 'stamp_get'
    ORDER BY stamp_index;
  ELSE
    RETURN QUERY
    SELECT 
      event_data->>'stamp_id' as stamp_id,
      (event_data->>'stamp_index')::INTEGER as stamp_index,
      created_at as acquired_at
    FROM point_logs
    WHERE session_id = p_session_id
    AND campaign_id = p_campaign_id
    AND event_type = 'stamp_get'
    ORDER BY stamp_index;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =============================================
-- RPC関数: ポイント残高取得
-- =============================================

CREATE OR REPLACE FUNCTION get_user_point_balance(
  p_user_id UUID,
  p_session_id TEXT
)
RETURNS TABLE (
  current_points INTEGER,
  total_accumulated_points INTEGER
) AS $$
BEGIN
  IF p_user_id IS NOT NULL THEN
    RETURN QUERY
    SELECT upb.current_points, upb.total_accumulated_points
    FROM user_point_balances upb
    WHERE upb.user_id = p_user_id;
  ELSE
    RETURN QUERY
    SELECT upb.current_points, upb.total_accumulated_points
    FROM user_point_balances upb
    WHERE upb.session_id = p_session_id;
  END IF;
  
  -- レコードがない場合はデフォルト値を返す
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, 0;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =============================================
-- RPC関数: キャンペーン統計（管理者用）
-- =============================================

CREATE OR REPLACE FUNCTION get_campaign_stats(p_campaign_id UUID)
RETURNS TABLE (
  total_participants BIGINT,
  total_points_distributed BIGINT,
  total_gacha_plays BIGINT,
  total_prizes_won BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT COALESCE(user_id::TEXT, session_id)) as total_participants,
    COALESCE(SUM(CASE WHEN change_amount > 0 THEN change_amount ELSE 0 END), 0) as total_points_distributed,
    COUNT(*) FILTER (WHERE event_type = 'gacha_play') as total_gacha_plays,
    (SELECT COUNT(*) FROM user_prizes WHERE campaign_id = p_campaign_id) as total_prizes_won
  FROM point_logs
  WHERE campaign_id = p_campaign_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- =============================================
-- トリガー: updated_at自動更新
-- =============================================

CREATE OR REPLACE FUNCTION update_gamification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_gamification_campaigns_updated_at ON gamification_campaigns;
CREATE TRIGGER trigger_gamification_campaigns_updated_at
  BEFORE UPDATE ON gamification_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_gamification_updated_at();

DROP TRIGGER IF EXISTS trigger_user_point_balances_updated_at ON user_point_balances;
CREATE TRIGGER trigger_user_point_balances_updated_at
  BEFORE UPDATE ON user_point_balances
  FOR EACH ROW
  EXECUTE FUNCTION update_gamification_updated_at();

DROP TRIGGER IF EXISTS trigger_gacha_prizes_updated_at ON gacha_prizes;
CREATE TRIGGER trigger_gacha_prizes_updated_at
  BEFORE UPDATE ON gacha_prizes
  FOR EACH ROW
  EXECUTE FUNCTION update_gamification_updated_at();

