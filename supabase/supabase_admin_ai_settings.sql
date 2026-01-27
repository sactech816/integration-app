-- ========================================
-- 管理者用AIモデル設定テーブル
-- プラン別のデフォルトAIモデル（プリセットA/B/カスタム）を管理
-- サービス別（kdl/makers）に設定可能
-- ========================================

-- 0. user_rolesテーブルにis_adminカラムを追加（存在しない場合）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_roles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE user_roles ADD COLUMN is_admin BOOLEAN DEFAULT false;
    CREATE INDEX IF NOT EXISTS idx_user_roles_is_admin ON user_roles(is_admin) WHERE is_admin = true;
    COMMENT ON COLUMN user_roles.is_admin IS '管理者フラグ（AIモデル設定など、システム全体の管理権限）';
  END IF;
END $$;

-- 1. admin_ai_settingsテーブル作成（serviceカラム含む）
CREATE TABLE IF NOT EXISTS admin_ai_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service TEXT NOT NULL DEFAULT 'kdl' CHECK (service IN ('makers', 'kdl')),
  plan_tier TEXT NOT NULL CHECK (plan_tier IN (
    'none', 'lite', 'standard', 'pro', 'business', 'enterprise',  -- KDL継続
    'guest', 'free',  -- 集客メーカー
    'initial_trial', 'initial_standard', 'initial_business'  -- KDL初回
  )),
  selected_preset TEXT NOT NULL DEFAULT 'presetB' CHECK (selected_preset IN ('presetA', 'presetB', 'custom')),
  custom_outline_model TEXT,  -- カスタムモデル指定（オプション）
  custom_writing_model TEXT,  -- カスタムモデル指定（オプション）
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(service, plan_tier)  -- サービス×プランごとに1つの設定のみ
);

-- 2. デフォルト設定を挿入（KDL継続プラン）
INSERT INTO admin_ai_settings (service, plan_tier, selected_preset) VALUES
  ('kdl', 'none', 'presetB'),
  ('kdl', 'lite', 'presetB'),
  ('kdl', 'standard', 'presetB'),
  ('kdl', 'pro', 'presetA'),
  ('kdl', 'business', 'presetA'),
  ('kdl', 'enterprise', 'presetA')
ON CONFLICT (service, plan_tier) DO NOTHING;

-- KDL初回プラン用設定
INSERT INTO admin_ai_settings (service, plan_tier, selected_preset) VALUES
  ('kdl', 'initial_trial', 'presetB'),
  ('kdl', 'initial_standard', 'presetB'),
  ('kdl', 'initial_business', 'presetA')
ON CONFLICT (service, plan_tier) DO NOTHING;

-- 集客メーカー用設定
INSERT INTO admin_ai_settings (service, plan_tier, selected_preset) VALUES
  ('makers', 'guest', 'presetB'),
  ('makers', 'free', 'presetB'),
  ('makers', 'pro', 'presetA')
ON CONFLICT (service, plan_tier) DO NOTHING;

-- 3. インデックス作成
CREATE INDEX IF NOT EXISTS idx_admin_ai_settings_plan_tier 
ON admin_ai_settings(plan_tier);

CREATE INDEX IF NOT EXISTS idx_admin_ai_settings_service 
ON admin_ai_settings(service);

-- 4. RPC関数: サービス別AI設定取得
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

-- 5. RPC関数: AI設定更新（管理者のみ）
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

-- 6. RLSポリシー
ALTER TABLE admin_ai_settings ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能（プラン別デフォルト設定のため）
CREATE POLICY "Anyone can read AI settings" ON admin_ai_settings
  FOR SELECT
  USING (true);

-- 管理者のみ更新可能
CREATE POLICY "Only admins can update AI settings" ON admin_ai_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND (is_admin = true OR is_partner = true)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND (is_admin = true OR is_partner = true)
    )
  );

-- 7. トリガー: updated_at自動更新
CREATE OR REPLACE FUNCTION update_admin_ai_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_admin_ai_settings_updated_at ON admin_ai_settings;
CREATE TRIGGER trigger_admin_ai_settings_updated_at
  BEFORE UPDATE ON admin_ai_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_ai_settings_updated_at();

-- 8. コメント追加
COMMENT ON TABLE admin_ai_settings IS '管理者用AIモデル設定（サービス×プラン別デフォルト）';
COMMENT ON COLUMN admin_ai_settings.service IS 'サービス識別子: makers（集客メーカー）, kdl（Kindle）';
COMMENT ON COLUMN admin_ai_settings.plan_tier IS 'プランTier（KDL: none/lite/standard/pro/business/enterprise/initial_*, Makers: guest/free/pro）';
COMMENT ON COLUMN admin_ai_settings.selected_preset IS '選択されたプリセット（presetA/presetB/custom）';
COMMENT ON COLUMN admin_ai_settings.custom_outline_model IS 'カスタム構成用モデル（オプション）';
COMMENT ON COLUMN admin_ai_settings.custom_writing_model IS 'カスタム執筆用モデル（オプション）';

-- ========================================
-- ヘルパー: 管理者フラグ設定
-- ========================================

-- RPC関数: ユーザーを管理者に設定（または解除）
CREATE OR REPLACE FUNCTION set_admin_status(
  target_user_id UUID,
  admin_status BOOLEAN
)
RETURNS BOOLEAN AS $$
BEGIN
  -- user_rolesレコードを挿入または更新
  INSERT INTO user_roles (user_id, is_admin, updated_at)
  VALUES (target_user_id, admin_status, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    is_admin = admin_status,
    updated_at = NOW();
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION set_admin_status IS '管理者フラグを設定（Supabase Studioから実行）';

-- ========================================
-- 使用例: 管理者フラグの設定
-- ========================================
-- 
-- 自分のユーザーIDを管理者に設定する場合:
-- SELECT set_admin_status('あなたのユーザーID'::UUID, true);
-- 
-- 例:
-- SELECT set_admin_status('12345678-1234-1234-1234-123456789abc'::UUID, true);
--
-- ユーザーIDの確認方法:
-- SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 10;
--

-- ========================================
-- マイグレーション完了
-- ========================================

