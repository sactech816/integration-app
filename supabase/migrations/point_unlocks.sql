-- ポイントでツール作成枠を解除した記録
CREATE TABLE IF NOT EXISTS point_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL,
  points_spent INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_point_unlocks_user_tool
  ON point_unlocks(user_id, tool_type);

-- RLS
ALTER TABLE point_unlocks ENABLE ROW LEVEL SECURITY;

-- 自分のレコードのみ閲覧可能
CREATE POLICY "users_read_own_unlocks" ON point_unlocks
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- INSERT はサーバー側（service_role）で行うため、ユーザー直接INSERTは不可
-- APIエンドポイント経由でのみ作成される

-- =============================================
-- ポイント解除のRPC関数
-- =============================================
CREATE OR REPLACE FUNCTION unlock_tool_with_points(
  p_user_id UUID,
  p_tool_type TEXT,
  p_cost INTEGER DEFAULT 1000
)
RETURNS TABLE (
  success BOOLEAN,
  new_balance INTEGER,
  message TEXT
) AS $$
DECLARE
  v_current_balance INTEGER;
  v_new_balance INTEGER;
BEGIN
  -- 現在のポイント残高を取得（排他ロック）
  SELECT current_points INTO v_current_balance
  FROM user_point_balances
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- ポイント残高レコードが存在しない
  IF v_current_balance IS NULL THEN
    RETURN QUERY SELECT false, 0, 'ポイント残高がありません'::TEXT;
    RETURN;
  END IF;

  -- 残高不足
  IF v_current_balance < p_cost THEN
    RETURN QUERY SELECT false, v_current_balance,
      format('ポイントが不足しています（残高: %spt / 必要: %spt）', v_current_balance, p_cost)::TEXT;
    RETURN;
  END IF;

  -- ポイントを差し引く
  v_new_balance := v_current_balance - p_cost;
  UPDATE user_point_balances
  SET current_points = v_new_balance, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- ポイントログに記録
  INSERT INTO point_logs (user_id, campaign_id, change_amount, event_type, event_data)
  VALUES (
    p_user_id,
    NULL,
    -p_cost,
    'tool_unlock',
    jsonb_build_object('tool_type', p_tool_type, 'cost', p_cost)
  );

  -- 解除記録を作成
  INSERT INTO point_unlocks (user_id, tool_type, points_spent)
  VALUES (p_user_id, p_tool_type, p_cost);

  RETURN QUERY SELECT true, v_new_balance,
    format('ポイントで%s枠を1つ追加しました！', p_tool_type)::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
