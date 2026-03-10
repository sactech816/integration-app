-- ================================================================
-- ポイントコスト: ツール保存を一時的に無料化
-- AI生成・エクスポートのみポイント消費
-- ================================================================

-- 全ツールの save アクションを 0pt に更新
UPDATE point_costs SET cost = 0 WHERE action = 'save';

-- AI生成・エクスポートはそのまま維持（確認用）
-- ('ai', 'generate', 10)
-- ('export', 'html', 30)
-- ('export', 'embed', 30)

-- ================================================================
-- 新規登録時の初期ポイント付与トリガー（50pt）
-- user_points レコードが存在しない場合に自動作成
-- ================================================================

CREATE OR REPLACE FUNCTION handle_new_user_points()
RETURNS TRIGGER AS $$
DECLARE
  v_initial_points INTEGER := 50;
BEGIN
  INSERT INTO user_points (user_id, balance, total_granted)
  VALUES (NEW.id, v_initial_points, v_initial_points)
  ON CONFLICT (user_id) DO NOTHING;

  -- 取引履歴に記録
  INSERT INTO point_transactions (user_id, type, amount, balance_after, description, metadata)
  VALUES (
    NEW.id,
    'grant_bonus',
    v_initial_points,
    v_initial_points,
    '新規登録ボーナス',
    '{"reason": "signup_bonus"}'::jsonb
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- auth.users に新しいユーザーが作成されたときにトリガー
DROP TRIGGER IF EXISTS on_auth_user_created_points ON auth.users;
CREATE TRIGGER on_auth_user_created_points
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_points();
