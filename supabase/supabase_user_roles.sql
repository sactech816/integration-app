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
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
CREATE POLICY "Users can read own role" ON user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- ポリシー: サービスロール(管理者)のみ挿入・更新可能
DROP POLICY IF EXISTS "Service role can manage roles" ON user_roles;
CREATE POLICY "Service role can manage roles" ON user_roles
  FOR ALL
  USING (true)
  WITH CHECK (true);

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

DROP FUNCTION IF EXISTS get_all_users_with_roles();
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
    au.email::TEXT,
    COALESCE(ur.is_partner, false) as is_partner,
    ur.partner_since,
    ur.partner_note::TEXT,
    au.created_at as user_created_at,
    COUNT(DISTINCT p.id)::BIGINT as total_purchases,
    COALESCE(SUM(p.amount), 0)::BIGINT as total_donated
  FROM auth.users au
  LEFT JOIN user_roles ur ON au.id = ur.user_id
  LEFT JOIN purchases p ON au.id = p.user_id
  GROUP BY au.id, au.email, ur.is_partner, ur.partner_since, ur.partner_note, au.created_at
  ORDER BY au.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ページネーション対応版（ポイント残高含む）
DROP FUNCTION IF EXISTS get_all_users_with_roles_paginated(INTEGER, INTEGER, TEXT);
CREATE OR REPLACE FUNCTION get_all_users_with_roles_paginated(
  p_page INTEGER DEFAULT 1,
  p_per_page INTEGER DEFAULT 10,
  p_search TEXT DEFAULT NULL
)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  is_partner BOOLEAN,
  partner_since TIMESTAMPTZ,
  partner_note TEXT,
  user_created_at TIMESTAMPTZ,
  total_purchases BIGINT,
  total_donated BIGINT,
  current_points INTEGER,
  total_accumulated_points INTEGER,
  total_count BIGINT
) AS $$
DECLARE
  v_offset INTEGER;
BEGIN
  v_offset := (p_page - 1) * p_per_page;

  RETURN QUERY
  WITH user_data AS (
    SELECT
      au.id as uid,
      au.email::TEXT as uemail,
      COALESCE(ur.is_partner, false) as uis_partner,
      ur.partner_since as upartner_since,
      ur.partner_note::TEXT as upartner_note,
      au.created_at as ucreated_at,
      COUNT(DISTINCT p.id)::BIGINT as utotal_purchases,
      COALESCE(SUM(p.amount), 0)::BIGINT as utotal_donated,
      COALESCE(upb.current_points, 0)::INTEGER as ucurrent_points,
      COALESCE(upb.total_accumulated_points, 0)::INTEGER as utotal_accumulated_points
    FROM auth.users au
    LEFT JOIN user_roles ur ON au.id = ur.user_id
    LEFT JOIN purchases p ON au.id = p.user_id
    LEFT JOIN user_point_balances upb ON au.id = upb.user_id
    WHERE (p_search IS NULL OR p_search = '' OR au.email ILIKE '%' || p_search || '%')
    GROUP BY au.id, au.email, ur.is_partner, ur.partner_since, ur.partner_note, au.created_at, upb.current_points, upb.total_accumulated_points
    ORDER BY au.created_at DESC
  )
  SELECT
    ud.uid,
    ud.uemail,
    ud.uis_partner,
    ud.upartner_since,
    ud.upartner_note,
    ud.ucreated_at,
    ud.utotal_purchases,
    ud.utotal_donated,
    ud.ucurrent_points,
    ud.utotal_accumulated_points,
    (SELECT COUNT(*) FROM user_data)::BIGINT as total_count
  FROM user_data ud
  LIMIT p_per_page
  OFFSET v_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;






































