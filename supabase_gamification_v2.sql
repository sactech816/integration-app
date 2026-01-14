-- =============================================
-- ゲーミフィケーション機能 v2 拡張
-- ユーザー設定 / 管理者設定 / デイリーミッション
-- =============================================

-- =============================================
-- point_logs テーブルの拡張
-- 新しいイベントタイプを追加
-- =============================================

-- 既存の制約を削除して新しい制約を追加
ALTER TABLE point_logs DROP CONSTRAINT IF EXISTS point_logs_event_type_check;
ALTER TABLE point_logs ADD CONSTRAINT point_logs_event_type_check 
  CHECK (event_type IN (
    'stamp_get', 
    'login_bonus', 
    'gacha_play', 
    'gacha_win', 
    'manual_adjust', 
    'stamp_completion',
    'welcome_bonus',      -- 新規: ウェルカムボーナス
    'daily_mission',      -- 新規: デイリーミッション
    'quiz_correct',       -- 新規: クイズ正解
    'referral_bonus',     -- 新規: 紹介ボーナス
    'achievement'         -- 新規: 実績達成
  ));

-- トリガーソース列を追加（どのイベントでポイントが付与されたか）
ALTER TABLE point_logs ADD COLUMN IF NOT EXISTS trigger_source TEXT;

-- =============================================
-- 1. user_gamification_settings (ユーザー個別設定)
-- =============================================

CREATE TABLE IF NOT EXISTS user_gamification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  
  -- ボーナス受取状態
  welcome_bonus_claimed BOOLEAN DEFAULT false,
  welcome_bonus_claimed_at TIMESTAMPTZ,
  
  -- 通知表示設定
  hide_login_bonus_toast BOOLEAN DEFAULT false,
  hide_welcome_toast BOOLEAN DEFAULT false,
  hide_stamp_notifications BOOLEAN DEFAULT false,
  hide_mission_notifications BOOLEAN DEFAULT false,
  hide_point_notifications BOOLEAN DEFAULT false,
  
  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_user_gamification_settings_user_id ON user_gamification_settings(user_id);

-- RLSを有効化
ALTER TABLE user_gamification_settings ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の設定を読み書き可能
DROP POLICY IF EXISTS "Users can read own gamification settings" ON user_gamification_settings;
CREATE POLICY "Users can read own gamification settings" ON user_gamification_settings
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own gamification settings" ON user_gamification_settings;
CREATE POLICY "Users can update own gamification settings" ON user_gamification_settings
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own gamification settings" ON user_gamification_settings;
CREATE POLICY "Users can insert own gamification settings" ON user_gamification_settings
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- サービスロール用ポリシー
DROP POLICY IF EXISTS "Service role can manage all user gamification settings" ON user_gamification_settings;
CREATE POLICY "Service role can manage all user gamification settings" ON user_gamification_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- トリガー: updated_at自動更新
DROP TRIGGER IF EXISTS trigger_user_gamification_settings_updated_at ON user_gamification_settings;
CREATE TRIGGER trigger_user_gamification_settings_updated_at
  BEFORE UPDATE ON user_gamification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_gamification_updated_at();

-- =============================================
-- 2. admin_gamification_settings (管理者グローバル設定)
-- =============================================

CREATE TABLE IF NOT EXISTS admin_gamification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLSを有効化
ALTER TABLE admin_gamification_settings ENABLE ROW LEVEL SECURITY;

-- ポリシー: 誰でも読み取り可能
DROP POLICY IF EXISTS "Anyone can read admin gamification settings" ON admin_gamification_settings;
CREATE POLICY "Anyone can read admin gamification settings" ON admin_gamification_settings
  FOR SELECT
  USING (true);

-- ポリシー: サービスロールのみ更新可能
DROP POLICY IF EXISTS "Service role can manage admin gamification settings" ON admin_gamification_settings;
CREATE POLICY "Service role can manage admin gamification settings" ON admin_gamification_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 初期設定を挿入（存在しない場合のみ）
INSERT INTO admin_gamification_settings (setting_key, setting_value) VALUES
  ('welcome_bonus', '{"enabled": true, "points": 100, "message": "ようこそ！100ポイントをプレゼント！"}'),
  ('daily_login_bonus', '{"enabled": true, "points": 10}'),
  ('stamp_rally_events', '{"enabled": true}'),
  ('slot_game', '{"enabled": true}'),
  ('fukubiki_game', '{"enabled": true}'),
  ('scratch_game', '{"enabled": true}'),
  ('daily_missions', '{"enabled": true}'),
  ('point_quiz', '{"enabled": true, "points_per_correct": 10}')
ON CONFLICT (setting_key) DO NOTHING;

-- =============================================
-- 3. daily_missions (デイリーミッションマスタ)
-- =============================================

CREATE TABLE IF NOT EXISTS daily_missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  mission_type TEXT NOT NULL CHECK (mission_type IN (
    'login',          -- ログイン
    'quiz_play',      -- クイズプレイ
    'quiz_create',    -- クイズ作成
    'profile_view',   -- プロフィール閲覧
    'profile_create', -- プロフィール作成
    'gacha_play',     -- ガチャプレイ
    'share',          -- SNSシェア
    'stamp_get',      -- スタンプ獲得
    'survey_answer'   -- アンケート回答
  )),
  target_count INTEGER DEFAULT 1,
  reward_points INTEGER DEFAULT 10,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLSを有効化
ALTER TABLE daily_missions ENABLE ROW LEVEL SECURITY;

-- ポリシー: 誰でも読み取り可能
DROP POLICY IF EXISTS "Anyone can read daily missions" ON daily_missions;
CREATE POLICY "Anyone can read daily missions" ON daily_missions
  FOR SELECT
  USING (is_active = true);

-- ポリシー: サービスロールのみ管理可能
DROP POLICY IF EXISTS "Service role can manage daily missions" ON daily_missions;
CREATE POLICY "Service role can manage daily missions" ON daily_missions
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 初期ミッションを挿入
INSERT INTO daily_missions (title, description, mission_type, target_count, reward_points, display_order) VALUES
  ('デイリーログイン', '今日ログインする', 'login', 1, 10, 1),
  ('クイズをプレイ', 'クイズを1回プレイする', 'quiz_play', 1, 15, 2),
  ('ガチャを回す', 'ガチャを1回回す', 'gacha_play', 1, 5, 3),
  ('シェアする', 'SNSでシェアする', 'share', 1, 20, 4),
  ('アンケート回答', 'アンケートに1回回答する', 'survey_answer', 1, 15, 5)
ON CONFLICT DO NOTHING;

-- =============================================
-- 4. user_daily_mission_progress (ユーザーミッション進捗)
-- =============================================

CREATE TABLE IF NOT EXISTS user_daily_mission_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES daily_missions(id) ON DELETE CASCADE,
  progress_date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_count INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  reward_claimed BOOLEAN DEFAULT false,
  reward_claimed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 1日1ユーザー1ミッションで一意
  CONSTRAINT unique_user_mission_date UNIQUE (user_id, mission_id, progress_date)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_user_daily_mission_progress_user_id ON user_daily_mission_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_daily_mission_progress_date ON user_daily_mission_progress(progress_date);
CREATE INDEX IF NOT EXISTS idx_user_daily_mission_progress_user_date ON user_daily_mission_progress(user_id, progress_date);

-- RLSを有効化
ALTER TABLE user_daily_mission_progress ENABLE ROW LEVEL SECURITY;

-- ポリシー: ユーザーは自分の進捗を読み取り可能
DROP POLICY IF EXISTS "Users can read own mission progress" ON user_daily_mission_progress;
CREATE POLICY "Users can read own mission progress" ON user_daily_mission_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: サービスロールは全操作可能
DROP POLICY IF EXISTS "Service role can manage all mission progress" ON user_daily_mission_progress;
CREATE POLICY "Service role can manage all mission progress" ON user_daily_mission_progress
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- トリガー: updated_at自動更新
DROP TRIGGER IF EXISTS trigger_user_daily_mission_progress_updated_at ON user_daily_mission_progress;
CREATE TRIGGER trigger_user_daily_mission_progress_updated_at
  BEFORE UPDATE ON user_daily_mission_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_gamification_updated_at();

-- =============================================
-- RPC関数: ウェルカムボーナス付与
-- =============================================

CREATE OR REPLACE FUNCTION claim_welcome_bonus(p_user_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  points_granted INTEGER,
  already_claimed BOOLEAN,
  message TEXT
) AS $$
DECLARE
  v_settings JSONB;
  v_enabled BOOLEAN;
  v_points INTEGER;
  v_message TEXT;
  v_already_claimed BOOLEAN;
  v_result RECORD;
BEGIN
  -- 管理者設定を取得
  SELECT setting_value INTO v_settings
  FROM admin_gamification_settings
  WHERE setting_key = 'welcome_bonus';
  
  -- 設定がない場合はデフォルト値を使用
  v_enabled := COALESCE((v_settings->>'enabled')::BOOLEAN, true);
  v_points := COALESCE((v_settings->>'points')::INTEGER, 100);
  v_message := COALESCE(v_settings->>'message', 'ようこそ！ボーナスポイントをプレゼント！');
  
  -- 機能が無効の場合
  IF NOT v_enabled THEN
    RETURN QUERY SELECT false, 0, false, 'ウェルカムボーナスは現在無効です'::TEXT;
    RETURN;
  END IF;
  
  -- 既に受取済みかチェック（point_logsで確認）
  SELECT EXISTS(
    SELECT 1 FROM point_logs
    WHERE user_id = p_user_id AND event_type = 'welcome_bonus'
  ) INTO v_already_claimed;
  
  IF v_already_claimed THEN
    RETURN QUERY SELECT false, 0, true, 'すでにウェルカムボーナスを受け取っています'::TEXT;
    RETURN;
  END IF;
  
  -- ポイント付与
  SELECT * INTO v_result FROM update_user_points(
    p_user_id, 
    NULL, 
    v_points, 
    NULL, 
    'welcome_bonus', 
    '{}'::JSONB
  );
  
  -- ユーザー設定を更新/挿入
  INSERT INTO user_gamification_settings (user_id, welcome_bonus_claimed, welcome_bonus_claimed_at)
  VALUES (p_user_id, true, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    welcome_bonus_claimed = true,
    welcome_bonus_claimed_at = NOW(),
    updated_at = NOW();
  
  RETURN QUERY SELECT true, v_points, false, v_message;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC関数: ユーザーのゲーミフィケーション設定を取得/作成
-- =============================================

CREATE OR REPLACE FUNCTION get_or_create_user_gamification_settings(p_user_id UUID)
RETURNS user_gamification_settings AS $$
DECLARE
  v_settings user_gamification_settings;
BEGIN
  -- 既存の設定を取得
  SELECT * INTO v_settings
  FROM user_gamification_settings
  WHERE user_id = p_user_id;
  
  -- 存在しない場合は作成
  IF v_settings.id IS NULL THEN
    INSERT INTO user_gamification_settings (user_id)
    VALUES (p_user_id)
    RETURNING * INTO v_settings;
  END IF;
  
  RETURN v_settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC関数: ユーザーの通知設定を更新
-- =============================================

CREATE OR REPLACE FUNCTION update_user_notification_settings(
  p_user_id UUID,
  p_hide_login_bonus_toast BOOLEAN DEFAULT NULL,
  p_hide_welcome_toast BOOLEAN DEFAULT NULL,
  p_hide_stamp_notifications BOOLEAN DEFAULT NULL,
  p_hide_mission_notifications BOOLEAN DEFAULT NULL,
  p_hide_point_notifications BOOLEAN DEFAULT NULL
)
RETURNS user_gamification_settings AS $$
DECLARE
  v_settings user_gamification_settings;
BEGIN
  -- 設定を取得または作成
  SELECT * INTO v_settings FROM get_or_create_user_gamification_settings(p_user_id);
  
  -- 更新
  UPDATE user_gamification_settings
  SET
    hide_login_bonus_toast = COALESCE(p_hide_login_bonus_toast, hide_login_bonus_toast),
    hide_welcome_toast = COALESCE(p_hide_welcome_toast, hide_welcome_toast),
    hide_stamp_notifications = COALESCE(p_hide_stamp_notifications, hide_stamp_notifications),
    hide_mission_notifications = COALESCE(p_hide_mission_notifications, hide_mission_notifications),
    hide_point_notifications = COALESCE(p_hide_point_notifications, hide_point_notifications),
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING * INTO v_settings;
  
  RETURN v_settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC関数: 今日のデイリーミッション進捗を取得
-- =============================================

CREATE OR REPLACE FUNCTION get_today_missions_progress(p_user_id UUID)
RETURNS TABLE (
  mission_id UUID,
  title TEXT,
  description TEXT,
  mission_type TEXT,
  target_count INTEGER,
  reward_points INTEGER,
  current_count INTEGER,
  completed BOOLEAN,
  reward_claimed BOOLEAN
) AS $$
DECLARE
  v_today DATE := (NOW() AT TIME ZONE 'Asia/Tokyo')::DATE;
BEGIN
  RETURN QUERY
  SELECT 
    dm.id as mission_id,
    dm.title,
    dm.description,
    dm.mission_type,
    dm.target_count,
    dm.reward_points,
    COALESCE(ump.current_count, 0) as current_count,
    COALESCE(ump.completed, false) as completed,
    COALESCE(ump.reward_claimed, false) as reward_claimed
  FROM daily_missions dm
  LEFT JOIN user_daily_mission_progress ump 
    ON dm.id = ump.mission_id 
    AND ump.user_id = p_user_id 
    AND ump.progress_date = v_today
  WHERE dm.is_active = true
  ORDER BY dm.display_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC関数: ミッション進捗を更新
-- =============================================

CREATE OR REPLACE FUNCTION update_mission_progress(
  p_user_id UUID,
  p_mission_type TEXT,
  p_increment INTEGER DEFAULT 1
)
RETURNS TABLE (
  mission_id UUID,
  newly_completed BOOLEAN,
  reward_points INTEGER
) AS $$
DECLARE
  v_today DATE := (NOW() AT TIME ZONE 'Asia/Tokyo')::DATE;
  v_mission RECORD;
  v_progress RECORD;
  v_new_count INTEGER;
  v_newly_completed BOOLEAN;
BEGIN
  -- 該当するミッションを取得
  FOR v_mission IN 
    SELECT * FROM daily_missions 
    WHERE mission_type = p_mission_type AND is_active = true
  LOOP
    -- 進捗レコードを取得または作成
    INSERT INTO user_daily_mission_progress (user_id, mission_id, progress_date, current_count)
    VALUES (p_user_id, v_mission.id, v_today, 0)
    ON CONFLICT (user_id, mission_id, progress_date) DO NOTHING;
    
    -- 現在の進捗を取得
    SELECT * INTO v_progress
    FROM user_daily_mission_progress
    WHERE user_id = p_user_id 
      AND mission_id = v_mission.id 
      AND progress_date = v_today;
    
    -- 既に完了している場合はスキップ
    IF v_progress.completed THEN
      RETURN QUERY SELECT v_mission.id, false, 0;
      CONTINUE;
    END IF;
    
    -- カウントを増加
    v_new_count := v_progress.current_count + p_increment;
    v_newly_completed := v_new_count >= v_mission.target_count;
    
    -- 進捗を更新
    UPDATE user_daily_mission_progress
    SET 
      current_count = v_new_count,
      completed = v_newly_completed,
      completed_at = CASE WHEN v_newly_completed THEN NOW() ELSE NULL END,
      updated_at = NOW()
    WHERE id = v_progress.id;
    
    RETURN QUERY SELECT v_mission.id, v_newly_completed, v_mission.reward_points;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC関数: ミッション報酬を受け取る
-- =============================================

CREATE OR REPLACE FUNCTION claim_mission_reward(
  p_user_id UUID,
  p_mission_id UUID
)
RETURNS TABLE (
  success BOOLEAN,
  points_granted INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_today DATE := (NOW() AT TIME ZONE 'Asia/Tokyo')::DATE;
  v_progress RECORD;
  v_mission RECORD;
  v_result RECORD;
BEGIN
  -- 進捗を取得
  SELECT * INTO v_progress
  FROM user_daily_mission_progress
  WHERE user_id = p_user_id 
    AND mission_id = p_mission_id 
    AND progress_date = v_today;
  
  -- 進捗がない場合
  IF v_progress.id IS NULL THEN
    RETURN QUERY SELECT false, 0, 'ミッション進捗が見つかりません'::TEXT;
    RETURN;
  END IF;
  
  -- 未完了の場合
  IF NOT v_progress.completed THEN
    RETURN QUERY SELECT false, 0, 'ミッションが未完了です'::TEXT;
    RETURN;
  END IF;
  
  -- 既に報酬受取済みの場合
  IF v_progress.reward_claimed THEN
    RETURN QUERY SELECT false, 0, 'すでに報酬を受け取っています'::TEXT;
    RETURN;
  END IF;
  
  -- ミッション情報を取得
  SELECT * INTO v_mission
  FROM daily_missions
  WHERE id = p_mission_id;
  
  -- ポイント付与
  SELECT * INTO v_result FROM update_user_points(
    p_user_id, 
    NULL, 
    v_mission.reward_points, 
    NULL, 
    'daily_mission', 
    jsonb_build_object('mission_id', p_mission_id, 'mission_title', v_mission.title)
  );
  
  -- 報酬受取済みに更新
  UPDATE user_daily_mission_progress
  SET 
    reward_claimed = true,
    reward_claimed_at = NOW(),
    updated_at = NOW()
  WHERE id = v_progress.id;
  
  RETURN QUERY SELECT true, v_mission.reward_points, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC関数: 全ミッション達成ボーナスをチェック
-- =============================================

CREATE OR REPLACE FUNCTION check_all_missions_bonus(p_user_id UUID)
RETURNS TABLE (
  all_completed BOOLEAN,
  bonus_available BOOLEAN,
  bonus_points INTEGER
) AS $$
DECLARE
  v_today DATE := (NOW() AT TIME ZONE 'Asia/Tokyo')::DATE;
  v_total_missions INTEGER;
  v_completed_missions INTEGER;
  v_bonus_claimed BOOLEAN;
BEGIN
  -- アクティブなミッション数を取得
  SELECT COUNT(*) INTO v_total_missions
  FROM daily_missions
  WHERE is_active = true;
  
  -- 完了かつ報酬受取済みのミッション数を取得
  SELECT COUNT(*) INTO v_completed_missions
  FROM user_daily_mission_progress ump
  JOIN daily_missions dm ON ump.mission_id = dm.id
  WHERE ump.user_id = p_user_id 
    AND ump.progress_date = v_today
    AND ump.completed = true
    AND ump.reward_claimed = true
    AND dm.is_active = true;
  
  -- 全達成ボーナスが受取済みかチェック
  SELECT EXISTS(
    SELECT 1 FROM point_logs
    WHERE user_id = p_user_id 
      AND event_type = 'daily_mission'
      AND (event_data->>'all_missions_bonus')::BOOLEAN = true
      AND (created_at AT TIME ZONE 'Asia/Tokyo')::DATE = v_today
  ) INTO v_bonus_claimed;
  
  RETURN QUERY SELECT 
    v_completed_missions >= v_total_missions,
    v_completed_missions >= v_total_missions AND NOT v_bonus_claimed,
    50; -- 全達成ボーナスは50ポイント
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC関数: 全ミッション達成ボーナスを受け取る
-- =============================================

CREATE OR REPLACE FUNCTION claim_all_missions_bonus(p_user_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  points_granted INTEGER,
  error_message TEXT
) AS $$
DECLARE
  v_check RECORD;
  v_result RECORD;
BEGIN
  -- ボーナス受取可能かチェック
  SELECT * INTO v_check FROM check_all_missions_bonus(p_user_id);
  
  IF NOT v_check.all_completed THEN
    RETURN QUERY SELECT false, 0, '全ミッションが完了していません'::TEXT;
    RETURN;
  END IF;
  
  IF NOT v_check.bonus_available THEN
    RETURN QUERY SELECT false, 0, 'すでにボーナスを受け取っています'::TEXT;
    RETURN;
  END IF;
  
  -- ポイント付与
  SELECT * INTO v_result FROM update_user_points(
    p_user_id, 
    NULL, 
    v_check.bonus_points, 
    NULL, 
    'daily_mission', 
    jsonb_build_object('all_missions_bonus', true)
  );
  
  RETURN QUERY SELECT true, v_check.bonus_points, NULL::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC関数: 管理者設定を取得
-- =============================================

CREATE OR REPLACE FUNCTION get_admin_gamification_setting(p_setting_key TEXT)
RETURNS JSONB AS $$
DECLARE
  v_value JSONB;
BEGIN
  SELECT setting_value INTO v_value
  FROM admin_gamification_settings
  WHERE setting_key = p_setting_key;
  
  RETURN COALESCE(v_value, '{}'::JSONB);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC関数: 管理者設定を更新
-- =============================================

CREATE OR REPLACE FUNCTION update_admin_gamification_setting(
  p_setting_key TEXT,
  p_setting_value JSONB,
  p_updated_by UUID
)
RETURNS admin_gamification_settings AS $$
DECLARE
  v_settings admin_gamification_settings;
BEGIN
  INSERT INTO admin_gamification_settings (setting_key, setting_value, updated_by, updated_at)
  VALUES (p_setting_key, p_setting_value, p_updated_by, NOW())
  ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = p_setting_value,
    updated_by = p_updated_by,
    updated_at = NOW()
  RETURNING * INTO v_settings;
  
  RETURN v_settings;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- gamification_campaigns テーブルの拡張
-- 新しいアニメーションタイプを追加
-- =============================================

ALTER TABLE gamification_campaigns DROP CONSTRAINT IF EXISTS gamification_campaigns_animation_type_check;
ALTER TABLE gamification_campaigns ADD CONSTRAINT gamification_campaigns_animation_type_check 
  CHECK (animation_type IN (
    'capsule',    -- カプセルトイ
    'roulette',   -- ルーレット
    'omikuji',    -- おみくじ
    'slot',       -- スロット
    'scratch',    -- スクラッチ
    'fukubiki'    -- 福引き
  ));























