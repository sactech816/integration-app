-- =============================================
-- ユーザーロール管理テーブル
-- =============================================

-- user_rolesテーブル作成
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  is_partner BOOLEAN DEFAULT false,
  partner_since TIMESTAMPTZ,
  partner_note TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_user_roles_is_partner ON user_roles(is_partner) WHERE is_partner = true;

-- RLSを有効化
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- ポリシー: 誰でも自分のロール情報を読み取り可能
CREATE POLICY "Users can read own role" ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: サービスロール(管理者)のみ挿入・更新可能
CREATE POLICY "Service role can manage roles" ON user_roles
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- 便利なビュー: パートナー一覧
-- =============================================

CREATE OR REPLACE VIEW partner_users AS
SELECT 
  ur.user_id,
  ur.is_partner,
  ur.partner_since,
  ur.partner_note,
  ur.updated_at,
  au.email,
  au.created_at as user_created_at
FROM user_roles ur
JOIN auth.users au ON ur.user_id = au.id
WHERE ur.is_partner = true;

-- =============================================
-- RPC関数: パートナーステータス確認
-- =============================================

CREATE OR REPLACE FUNCTION check_is_partner(check_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  is_partner_status BOOLEAN;
BEGIN
  SELECT COALESCE(is_partner, false) INTO is_partner_status
  FROM user_roles
  WHERE user_id = check_user_id;
  
  RETURN COALESCE(is_partner_status, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC関数: パートナーステータス設定
-- =============================================

CREATE OR REPLACE FUNCTION set_partner_status(
  target_user_id UUID,
  partner_status BOOLEAN,
  note TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- user_rolesレコードを挿入または更新
  INSERT INTO user_roles (user_id, is_partner, partner_since, partner_note, updated_at)
  VALUES (
    target_user_id,
    partner_status,
    CASE WHEN partner_status THEN COALESCE(
      (SELECT partner_since FROM user_roles WHERE user_id = target_user_id),
      NOW()
    ) ELSE NULL END,
    note,
    NOW()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    is_partner = partner_status,
    partner_since = CASE 
      WHEN partner_status AND user_roles.partner_since IS NULL THEN NOW()
      WHEN NOT partner_status THEN NULL
      ELSE user_roles.partner_since
    END,
    partner_note = COALESCE(note, user_roles.partner_note),
    updated_at = NOW();
  
  RETURN true;
EXCEPTION
  WHEN OTHERS THEN
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- RPC関数: 全ユーザー一覧取得（管理者用）
-- =============================================

CREATE OR REPLACE FUNCTION get_all_users_with_roles()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  is_partner BOOLEAN,
  partner_since TIMESTAMPTZ,
  partner_note TEXT,
  user_created_at TIMESTAMPTZ,
  total_purchases BIGINT,
  total_donated BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email,
    COALESCE(ur.is_partner, false) as is_partner,
    ur.partner_since,
    ur.partner_note,
    au.created_at as user_created_at,
    COUNT(DISTINCT p.id) as total_purchases,
    COALESCE(SUM(p.amount), 0) as total_donated
  FROM auth.users au
  LEFT JOIN user_roles ur ON au.id = ur.user_id
  LEFT JOIN purchases p ON au.id = p.user_id
  GROUP BY au.id, au.email, ur.is_partner, ur.partner_since, ur.partner_note, au.created_at
  ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;




































