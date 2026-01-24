-- =============================================
-- ガチャ景品にポイント報酬機能を追加
-- 当たり時にポイントが増える仕様
-- =============================================

-- 1. gacha_prizesテーブルにpoint_rewardカラムを追加
ALTER TABLE gacha_prizes ADD COLUMN IF NOT EXISTS point_reward INTEGER DEFAULT 0;

-- 既存データにコメント追加（説明用）
COMMENT ON COLUMN gacha_prizes.point_reward IS '当選時に付与されるポイント報酬（0の場合はポイント付与なし）';

-- =============================================
-- 2. play_gacha関数を修正（当たり時にポイント報酬を付与）
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
  new_balance INTEGER,
  points_won INTEGER  -- 新規追加：獲得ポイント
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
  v_points_won INTEGER := 0;
BEGIN
  -- キャンペーン設定からコストを取得
  SELECT (settings->>'cost_per_play')::INTEGER INTO v_cost
  FROM gamification_campaigns
  WHERE id = p_campaign_id AND status = 'active';
  
  IF v_cost IS NULL THEN
    RETURN QUERY SELECT false, 'campaign_not_found'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::BOOLEAN, NULL::INTEGER, 0;
    RETURN;
  END IF;
  
  -- 現在のポイント残高を取得（なければ作成）
  IF p_user_id IS NOT NULL THEN
    SELECT id, current_points INTO v_balance_id, v_current_points
    FROM user_point_balances WHERE user_id = p_user_id;
    
    IF v_balance_id IS NULL THEN
      INSERT INTO user_point_balances (user_id, current_points, total_accumulated_points)
      VALUES (p_user_id, 0, 0)
      RETURNING id, current_points INTO v_balance_id, v_current_points;
    END IF;
  ELSE
    SELECT id, current_points INTO v_balance_id, v_current_points
    FROM user_point_balances WHERE session_id = p_session_id;
    
    IF v_balance_id IS NULL THEN
      INSERT INTO user_point_balances (session_id, current_points, total_accumulated_points)
      VALUES (p_session_id, 0, 0)
      RETURNING id, current_points INTO v_balance_id, v_current_points;
    END IF;
  END IF;
  
  v_current_points := COALESCE(v_current_points, 0);
  
  -- ポイント不足チェック
  IF v_current_points < v_cost THEN
    RETURN QUERY SELECT false, 'insufficient_points'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::BOOLEAN, v_current_points, 0;
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
    RETURN QUERY SELECT false, 'no_prizes_available'::TEXT, NULL::UUID, NULL::TEXT, NULL::TEXT, NULL::BOOLEAN, v_current_points, 0;
    RETURN;
  END IF;
  
  -- ポイント計算：コスト減算 + 報酬加算
  v_points_won := COALESCE(v_selected_prize.point_reward, 0);
  v_new_balance := v_current_points - v_cost + v_points_won;
  
  -- ポイント残高を更新
  UPDATE user_point_balances
  SET 
    current_points = v_new_balance, 
    total_accumulated_points = CASE 
      WHEN v_points_won > 0 THEN total_accumulated_points + v_points_won
      ELSE total_accumulated_points
    END,
    updated_at = NOW()
  WHERE id = v_balance_id;
  
  -- ポイントログを記録（ガチャプレイ）
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
  
  -- ポイント報酬がある場合、別途ログを記録
  IF v_points_won > 0 THEN
    INSERT INTO point_logs (user_id, session_id, campaign_id, change_amount, event_type, event_data)
    VALUES (
      p_user_id, 
      p_session_id, 
      p_campaign_id, 
      v_points_won, 
      'gacha_win',
      jsonb_build_object(
        'prize_id', v_selected_prize.id,
        'prize_name', v_selected_prize.name,
        'point_reward', v_points_won
      )
    );
  END IF;
  
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
    v_new_balance,
    v_points_won;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 3. 既存のサンプルキャンペーン景品にポイント報酬を設定
-- =============================================

-- スロットの景品にポイント報酬を設定
UPDATE gacha_prizes SET point_reward = 200 WHERE name = '大当たり！200pt獲得';
UPDATE gacha_prizes SET point_reward = 100 WHERE name = '中当たり！100pt獲得';
UPDATE gacha_prizes SET point_reward = 50 WHERE name = '小当たり！50pt獲得';
UPDATE gacha_prizes SET point_reward = 20 WHERE name = '20pt獲得';
UPDATE gacha_prizes SET point_reward = 10 WHERE name = '10pt獲得';
UPDATE gacha_prizes SET point_reward = 5 WHERE name = '5pt獲得';

-- カプセルガチャの景品にポイント報酬を設定
UPDATE gacha_prizes SET point_reward = 500 WHERE name = 'SSR 500pt獲得！';
UPDATE gacha_prizes SET point_reward = 200 WHERE name = 'SR 200pt獲得';
UPDATE gacha_prizes SET point_reward = 100 WHERE name = 'R 100pt獲得';
UPDATE gacha_prizes SET point_reward = 50 WHERE name = 'N 50pt獲得';

-- ルーレットガチャの景品にポイント報酬を設定
UPDATE gacha_prizes SET point_reward = 300 WHERE name = '大当たり！300pt';
UPDATE gacha_prizes SET point_reward = 150 WHERE name = '当たり！150pt';
UPDATE gacha_prizes SET point_reward = 50 WHERE name = '小当たり 50pt';
UPDATE gacha_prizes SET point_reward = 20 WHERE name = '20pt';

-- おみくじガチャの景品にポイント報酬を設定
UPDATE gacha_prizes SET point_reward = 200 WHERE name = '大吉！200pt';
UPDATE gacha_prizes SET point_reward = 100 WHERE name = '中吉 100pt';
UPDATE gacha_prizes SET point_reward = 50 WHERE name = '小吉 50pt';
UPDATE gacha_prizes SET point_reward = 30 WHERE name = '吉 30pt';
UPDATE gacha_prizes SET point_reward = 10 WHERE name = '末吉 10pt';

-- 福引の景品にポイント報酬を設定
UPDATE gacha_prizes SET point_reward = 150 WHERE name = '金玉！150pt獲得';
UPDATE gacha_prizes SET point_reward = 100 WHERE name = '銀玉 100pt獲得';
UPDATE gacha_prizes SET point_reward = 50 WHERE name = '銅玉 50pt獲得';
UPDATE gacha_prizes SET point_reward = 20 WHERE name = '白玉 20pt獲得';

-- スクラッチの景品にポイント報酬を設定（存在する場合）
UPDATE gacha_prizes SET point_reward = 100 WHERE name LIKE '%100pt%' AND point_reward = 0;
UPDATE gacha_prizes SET point_reward = 50 WHERE name LIKE '%50pt%' AND point_reward = 0;
UPDATE gacha_prizes SET point_reward = 20 WHERE name LIKE '%20pt%' AND point_reward = 0;
UPDATE gacha_prizes SET point_reward = 10 WHERE name LIKE '%10pt%' AND point_reward = 0;
