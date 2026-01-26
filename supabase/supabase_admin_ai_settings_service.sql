-- ========================================
-- admin_ai_settingsテーブルにserviceカラムを追加
-- 集客メーカーとKindleで別々のAI設定を管理可能に
-- ========================================

-- 1. serviceカラムを追加（存在しない場合）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_ai_settings' AND column_name = 'service'
  ) THEN
    -- serviceカラムを追加（デフォルトは'kdl'で既存データとの互換性を保つ）
    ALTER TABLE admin_ai_settings 
    ADD COLUMN service TEXT NOT NULL DEFAULT 'kdl' 
    CHECK (service IN ('makers', 'kdl'));
    
    -- 既存のUNIQUE制約を削除して新しい制約を追加
    ALTER TABLE admin_ai_settings DROP CONSTRAINT IF EXISTS admin_ai_settings_plan_tier_key;
    ALTER TABLE admin_ai_settings ADD CONSTRAINT admin_ai_settings_service_plan_tier_key 
    UNIQUE (service, plan_tier);
    
    -- インデックスを追加
    CREATE INDEX IF NOT EXISTS idx_admin_ai_settings_service 
    ON admin_ai_settings(service);
    
    COMMENT ON COLUMN admin_ai_settings.service IS 'サービス識別子: makers（集客メーカー）, kdl（Kindle）';
  END IF;
END $$;

-- 2. 集客メーカー用のデフォルト設定を挿入
INSERT INTO admin_ai_settings (service, plan_tier, selected_preset) VALUES
  ('makers', 'none', 'presetB'),
  ('makers', 'lite', 'presetB'),
  ('makers', 'standard', 'presetB'),
  ('makers', 'pro', 'presetA'),
  ('makers', 'business', 'presetA'),
  ('makers', 'enterprise', 'presetA')
ON CONFLICT (service, plan_tier) DO NOTHING;

-- 3. RPC関数を更新: サービス別AI設定取得
CREATE OR REPLACE FUNCTION get_ai_setting_for_plan(
  check_plan_tier TEXT,
  check_service TEXT DEFAULT 'kdl'
)
RETURNS TABLE (
  service TEXT,
  plan_tier TEXT,
  selected_preset TEXT,
  custom_outline_model TEXT,
  custom_writing_model TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.service,
    s.plan_tier,
    s.selected_preset,
    s.custom_outline_model,
    s.custom_writing_model
  FROM admin_ai_settings s
  WHERE s.plan_tier = check_plan_tier
    AND s.service = check_service
  LIMIT 1;
END;
$$;

-- 4. RPC関数を更新: AI設定更新（管理者のみ）
CREATE OR REPLACE FUNCTION update_ai_setting(
  p_plan_tier TEXT,
  p_selected_preset TEXT,
  p_custom_outline_model TEXT DEFAULT NULL,
  p_custom_writing_model TEXT DEFAULT NULL,
  p_updated_by UUID DEFAULT NULL,
  p_service TEXT DEFAULT 'kdl'
)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO admin_ai_settings (
    service,
    plan_tier,
    selected_preset,
    custom_outline_model,
    custom_writing_model,
    updated_by,
    updated_at
  ) VALUES (
    p_service,
    p_plan_tier,
    p_selected_preset,
    p_custom_outline_model,
    p_custom_writing_model,
    p_updated_by,
    NOW()
  )
  ON CONFLICT (service, plan_tier) 
  DO UPDATE SET
    selected_preset = EXCLUDED.selected_preset,
    custom_outline_model = EXCLUDED.custom_outline_model,
    custom_writing_model = EXCLUDED.custom_writing_model,
    updated_by = EXCLUDED.updated_by,
    updated_at = NOW();

  RETURN TRUE;
END;
$$;

-- ========================================
-- マイグレーション完了
-- ========================================
