-- =============================================
-- 所有権移動の監査ログテーブル
-- 作成日: 2026-02-01
-- 目的: コンテンツの所有権変更履歴を記録する
-- =============================================

-- 1. 監査ログテーブルの作成
CREATE TABLE IF NOT EXISTS content_ownership_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 対象コンテンツ
  content_type TEXT NOT NULL,  -- 'profiles', 'sales_letters', 'quizzes', etc.
  content_id TEXT NOT NULL,    -- コンテンツのID（UUIDまたは数値）
  
  -- 移動元・移動先
  from_user_id UUID,           -- 元の所有者（NULLの場合もある）
  to_user_id UUID NOT NULL,    -- 新しい所有者
  
  -- 実行者
  transferred_by UUID NOT NULL,  -- 移動を実行した管理者のID
  
  -- タイムスタンプ
  transferred_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_ownership_logs_content ON content_ownership_logs(content_type, content_id);
CREATE INDEX IF NOT EXISTS idx_ownership_logs_from_user ON content_ownership_logs(from_user_id);
CREATE INDEX IF NOT EXISTS idx_ownership_logs_to_user ON content_ownership_logs(to_user_id);
CREATE INDEX IF NOT EXISTS idx_ownership_logs_transferred_by ON content_ownership_logs(transferred_by);
CREATE INDEX IF NOT EXISTS idx_ownership_logs_transferred_at ON content_ownership_logs(transferred_at DESC);

-- 3. RLSの有効化
ALTER TABLE content_ownership_logs ENABLE ROW LEVEL SECURITY;

-- 4. RLSポリシーの作成
-- 管理者のみが閲覧可能（サービスロール経由でINSERTするため、INSERTポリシーは不要）
DROP POLICY IF EXISTS "ownership_logs_select_admin" ON content_ownership_logs;
CREATE POLICY "ownership_logs_select_admin" ON content_ownership_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.is_admin = true
    )
  );

-- 5. コメント
COMMENT ON TABLE content_ownership_logs IS 'コンテンツの所有権変更履歴を記録するテーブル';
COMMENT ON COLUMN content_ownership_logs.content_type IS 'コンテンツの種類（profiles, sales_letters, quizzes, surveys, business_projects, gamification_campaigns）';
COMMENT ON COLUMN content_ownership_logs.content_id IS 'コンテンツのID';
COMMENT ON COLUMN content_ownership_logs.from_user_id IS '元の所有者のユーザーID（未設定の場合はNULL）';
COMMENT ON COLUMN content_ownership_logs.to_user_id IS '新しい所有者のユーザーID';
COMMENT ON COLUMN content_ownership_logs.transferred_by IS '移動を実行した管理者のユーザーID';
COMMENT ON COLUMN content_ownership_logs.transferred_at IS '移動が実行された日時';

-- =============================================
-- 確認用クエリ（実行後に確認）
-- =============================================
-- SELECT * FROM content_ownership_logs ORDER BY transferred_at DESC LIMIT 10;
