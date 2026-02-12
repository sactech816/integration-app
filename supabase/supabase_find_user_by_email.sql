-- =============================================
-- メールアドレスからユーザーIDを検索するヘルパー関数
-- Webhook等でuserIdがない場合のフォールバック用
-- =============================================

-- auth.usersからメールアドレスでユーザーIDを取得する関数
CREATE OR REPLACE FUNCTION public.find_user_id_by_email(target_email TEXT)
RETURNS UUID AS $$
  SELECT id FROM auth.users WHERE email = lower(target_email) LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER SET search_path = '';

-- 関数の実行権限を設定（service_roleのみ）
REVOKE ALL ON FUNCTION public.find_user_id_by_email(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_user_id_by_email(TEXT) TO service_role;
