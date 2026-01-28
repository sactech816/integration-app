-- ===========================================
-- 予約メーカー: スプレッドシート連携設定
-- ===========================================
-- 作成日: 2026-01-28
-- 目的: Googleスプレッドシート自動連携機能
-- ===========================================

-- -------------------------------------------
-- 1. スプレッドシート連携設定テーブル
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS booking_spreadsheet_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  menu_id UUID NOT NULL REFERENCES booking_menus(id) ON DELETE CASCADE,
  -- スプレッドシート情報
  spreadsheet_id TEXT NOT NULL,
  sheet_name TEXT DEFAULT 'Sheet1',
  -- 連携設定
  is_enabled BOOLEAN DEFAULT true,
  -- 最終同期日時
  last_synced_at TIMESTAMPTZ,
  -- メタデータ
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- ユニーク制約（1メニューにつき1設定）
  UNIQUE(menu_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_booking_spreadsheet_user_id ON booking_spreadsheet_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_spreadsheet_menu_id ON booking_spreadsheet_settings(menu_id);

-- -------------------------------------------
-- 2. RLSポリシー設定
-- -------------------------------------------
ALTER TABLE booking_spreadsheet_settings ENABLE ROW LEVEL SECURITY;

-- 自分の設定のみ閲覧可能
CREATE POLICY "booking_spreadsheet_select_own" ON booking_spreadsheet_settings
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- 自分の設定のみ作成可能
CREATE POLICY "booking_spreadsheet_insert_own" ON booking_spreadsheet_settings
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 自分の設定のみ更新可能
CREATE POLICY "booking_spreadsheet_update_own" ON booking_spreadsheet_settings
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 自分の設定のみ削除可能
CREATE POLICY "booking_spreadsheet_delete_own" ON booking_spreadsheet_settings
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- -------------------------------------------
-- 3. 更新日時の自動更新トリガー
-- -------------------------------------------
DROP TRIGGER IF EXISTS trigger_booking_spreadsheet_updated_at ON booking_spreadsheet_settings;
CREATE TRIGGER trigger_booking_spreadsheet_updated_at
  BEFORE UPDATE ON booking_spreadsheet_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- -------------------------------------------
-- 4. コメント
-- -------------------------------------------
COMMENT ON TABLE booking_spreadsheet_settings IS '予約メーカー: Googleスプレッドシート連携設定';
COMMENT ON COLUMN booking_spreadsheet_settings.spreadsheet_id IS 'GoogleスプレッドシートのID（URLから取得）';
COMMENT ON COLUMN booking_spreadsheet_settings.sheet_name IS '書き込み先のシート名';
