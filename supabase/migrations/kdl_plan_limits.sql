-- =============================================
-- KDL プラン制限列の追加
-- 構成系AI、執筆系AIの個別制限を管理
-- =============================================

-- 1. service_plans テーブルに列を追加
ALTER TABLE service_plans 
ADD COLUMN IF NOT EXISTS ai_outline_daily_limit INTEGER DEFAULT -1,   -- 構成系AI/日（タイトル、目次等）
ADD COLUMN IF NOT EXISTS ai_writing_daily_limit INTEGER DEFAULT -1;   -- 執筆系AI/日（本文生成、書き換え等）

-- 2. コメント追加
COMMENT ON COLUMN service_plans.ai_outline_daily_limit IS '構成系AI使用回数/日（タイトル生成、目次生成等）。-1は無制限';
COMMENT ON COLUMN service_plans.ai_writing_daily_limit IS '執筆系AI使用回数/日（本文生成、書き換え等）。-1は無制限';

-- 3. 既存KDLプランのデータを更新（構成系・執筆系の初期値設定）

-- 無料トライアル: 構成系3回、執筆系3回/日
UPDATE service_plans SET
  ai_outline_daily_limit = 3,
  ai_writing_daily_limit = 3
WHERE service = 'kdl' AND plan_tier = 'none';

-- 初回トライアル: 構成系20回、執筆系30回/日
UPDATE service_plans SET
  ai_outline_daily_limit = 20,
  ai_writing_daily_limit = 30
WHERE service = 'kdl' AND plan_tier = 'initial_trial';

-- 初回スタンダード: 構成系40回、執筆系80回/日
UPDATE service_plans SET
  ai_outline_daily_limit = 40,
  ai_writing_daily_limit = 80
WHERE service = 'kdl' AND plan_tier = 'initial_standard';

-- 初回ビジネス: 無制限
UPDATE service_plans SET
  ai_outline_daily_limit = -1,
  ai_writing_daily_limit = -1
WHERE service = 'kdl' AND plan_tier = 'initial_business';

-- ライト: 構成系10回、執筆系15回/日
UPDATE service_plans SET
  ai_outline_daily_limit = 10,
  ai_writing_daily_limit = 15
WHERE service = 'kdl' AND plan_tier = 'lite';

-- スタンダード: 構成系15回、執筆系25回/日
UPDATE service_plans SET
  ai_outline_daily_limit = 15,
  ai_writing_daily_limit = 25
WHERE service = 'kdl' AND plan_tier = 'standard';

-- プロ: 構成系40回、執筆系80回/日
UPDATE service_plans SET
  ai_outline_daily_limit = 40,
  ai_writing_daily_limit = 80
WHERE service = 'kdl' AND plan_tier = 'pro';

-- ビジネス: 構成系80回、執筆系無制限/日
UPDATE service_plans SET
  ai_outline_daily_limit = 80,
  ai_writing_daily_limit = -1
WHERE service = 'kdl' AND plan_tier = 'business';

-- エンタープライズ: 無制限
UPDATE service_plans SET
  ai_outline_daily_limit = -1,
  ai_writing_daily_limit = -1
WHERE service = 'kdl' AND plan_tier = 'enterprise';

-- 4. KDL使用量チェック関数の作成
CREATE OR REPLACE FUNCTION check_kdl_usage_limits(p_user_id UUID)
RETURNS TABLE (
  -- 書籍作成
  book_used INTEGER,
  book_limit INTEGER,
  book_remaining INTEGER,
  can_create_book BOOLEAN,
  -- 構成系AI（タイトル、目次等）
  outline_used INTEGER,
  outline_limit INTEGER,
  outline_remaining INTEGER,
  can_use_outline BOOLEAN,
  -- 執筆系AI（本文生成、書き換え）
  writing_used INTEGER,
  writing_limit INTEGER,
  writing_remaining INTEGER,
  can_use_writing BOOLEAN,
  -- トータルAI
  ai_total_used INTEGER,
  ai_total_limit INTEGER,
  ai_total_remaining INTEGER,
  can_use_ai BOOLEAN,
  -- プラン情報
  plan_tier TEXT,
  is_monitor BOOLEAN
) LANGUAGE plpgsql AS $$
DECLARE
  v_plan_tier TEXT;
  v_is_monitor BOOLEAN := false;
  v_book_limit INTEGER;
  v_outline_limit INTEGER;
  v_writing_limit INTEGER;
  v_ai_total_limit INTEGER;
  v_book_count INTEGER;
  v_outline_count INTEGER;
  v_writing_count INTEGER;
  v_ai_total_count INTEGER;
BEGIN
  -- 1. ユーザーのプランを取得（モニター優先）
  SELECT 
    COALESCE(mu.monitor_plan_type, s.plan_tier, 'none'),
    CASE WHEN mu.id IS NOT NULL THEN true ELSE false END
  INTO v_plan_tier, v_is_monitor
  FROM (SELECT p_user_id as user_id) u
  LEFT JOIN monitor_users mu ON mu.user_id = u.user_id 
    AND mu.service = 'kdl'
    AND mu.monitor_start_at <= NOW()
    AND mu.monitor_expires_at > NOW()
  LEFT JOIN subscriptions s ON s.user_id = u.user_id 
    AND s.status IN ('active', 'trialing')
    AND s.service = 'kdl'
  LIMIT 1;

  -- 2. プラン設定を取得
  SELECT 
    COALESCE(sp.book_limit, -1),
    COALESCE(sp.ai_outline_daily_limit, -1),
    COALESCE(sp.ai_writing_daily_limit, -1),
    COALESCE(sp.ai_daily_limit, -1)
  INTO v_book_limit, v_outline_limit, v_writing_limit, v_ai_total_limit
  FROM service_plans sp
  WHERE sp.service = 'kdl' AND sp.plan_tier = v_plan_tier;

  -- デフォルト値（プランが見つからない場合）
  IF v_book_limit IS NULL THEN v_book_limit := 1; END IF;
  IF v_outline_limit IS NULL THEN v_outline_limit := 3; END IF;
  IF v_writing_limit IS NULL THEN v_writing_limit := 3; END IF;
  IF v_ai_total_limit IS NULL THEN v_ai_total_limit := 5; END IF;

  -- 3. 書籍数をカウント
  SELECT COUNT(*) INTO v_book_count
  FROM kdl_books
  WHERE user_id = p_user_id;

  -- 4. 今日の構成系AI使用回数をカウント
  SELECT COUNT(*) INTO v_outline_count
  FROM ai_usage_logs
  WHERE user_id = p_user_id
    AND service = 'kdl'
    AND action_type IN ('generate_title', 'generate_subtitle', 'generate_toc', 'generate_chapter')
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';

  -- 5. 今日の執筆系AI使用回数をカウント
  SELECT COUNT(*) INTO v_writing_count
  FROM ai_usage_logs
  WHERE user_id = p_user_id
    AND service = 'kdl'
    AND action_type IN ('generate_section', 'rewrite', 'bulk_generate')
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';

  -- 6. 今日のトータルAI使用回数をカウント
  SELECT COUNT(*) INTO v_ai_total_count
  FROM ai_usage_logs
  WHERE user_id = p_user_id
    AND service = 'kdl'
    AND created_at >= CURRENT_DATE
    AND created_at < CURRENT_DATE + INTERVAL '1 day';

  -- 7. 結果を返す
  RETURN QUERY SELECT
    -- 書籍
    v_book_count,
    v_book_limit,
    CASE WHEN v_book_limit = -1 THEN -1 ELSE GREATEST(v_book_limit - v_book_count, 0) END,
    CASE WHEN v_book_limit = -1 THEN true ELSE v_book_count < v_book_limit END,
    -- 構成系AI
    v_outline_count,
    v_outline_limit,
    CASE WHEN v_outline_limit = -1 THEN -1 ELSE GREATEST(v_outline_limit - v_outline_count, 0) END,
    CASE WHEN v_outline_limit = -1 THEN true ELSE v_outline_count < v_outline_limit END,
    -- 執筆系AI
    v_writing_count,
    v_writing_limit,
    CASE WHEN v_writing_limit = -1 THEN -1 ELSE GREATEST(v_writing_limit - v_writing_count, 0) END,
    CASE WHEN v_writing_limit = -1 THEN true ELSE v_writing_count < v_writing_limit END,
    -- トータルAI
    v_ai_total_count,
    v_ai_total_limit,
    CASE WHEN v_ai_total_limit = -1 THEN -1 ELSE GREATEST(v_ai_total_limit - v_ai_total_count, 0) END,
    CASE WHEN v_ai_total_limit = -1 THEN true ELSE v_ai_total_count < v_ai_total_limit END,
    -- プラン情報
    v_plan_tier,
    v_is_monitor;
END;
$$;

-- 5. コメント追加
COMMENT ON FUNCTION check_kdl_usage_limits IS 'KDLの使用量制限をチェックする関数。書籍作成数、構成系AI、執筆系AI、トータルAIの使用状況を返す。';

-- =============================================
-- マイグレーション完了
-- =============================================
