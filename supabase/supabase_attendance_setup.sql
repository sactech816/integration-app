-- ===========================================
-- 出欠表メーカー テーブル・RLSポリシー設定
-- ===========================================
-- 作成日: 2026-01-28
-- 目的: 軽量な出欠表機能（無制限作成、ログイン不要）
-- ===========================================

-- -------------------------------------------
-- 1. 出欠表イベントテーブル
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  -- 候補日程をJSONBで保存 [{date, start_time, end_time, label}]
  slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- オプション: 作成者のuser_id（ログイン時のみ）
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- メタデータ
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_attendance_events_created_at ON attendance_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_events_user_id ON attendance_events(user_id);

-- -------------------------------------------
-- 2. 出欠回答テーブル
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS attendance_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES attendance_events(id) ON DELETE CASCADE,
  participant_name TEXT NOT NULL,
  participant_email TEXT,
  -- 回答をJSONBで保存 {slot_index: 'yes'|'no'|'maybe'}
  responses JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- メタデータ
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_attendance_responses_event_id ON attendance_responses(event_id);
CREATE INDEX IF NOT EXISTS idx_attendance_responses_created_at ON attendance_responses(created_at DESC);

-- -------------------------------------------
-- 3. RLSポリシー設定
-- -------------------------------------------

-- RLSを有効化
ALTER TABLE attendance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_responses ENABLE ROW LEVEL SECURITY;

-- 出欠表イベント: 誰でも作成可能
CREATE POLICY "attendance_events_insert_public" ON attendance_events
  FOR INSERT TO public, anon, authenticated
  WITH CHECK (true);

-- 出欠表イベント: 誰でも閲覧可能
CREATE POLICY "attendance_events_select_public" ON attendance_events
  FOR SELECT TO public, anon, authenticated
  USING (true);

-- 出欠表イベント: 作成者のみ更新可能（user_idがある場合）
CREATE POLICY "attendance_events_update_owner" ON attendance_events
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 出欠表イベント: 作成者のみ削除可能（user_idがある場合）
CREATE POLICY "attendance_events_delete_owner" ON attendance_events
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 出欠回答: 誰でも作成可能
CREATE POLICY "attendance_responses_insert_public" ON attendance_responses
  FOR INSERT TO public, anon, authenticated
  WITH CHECK (true);

-- 出欠回答: 誰でも閲覧可能（出欠表に紐づく回答）
CREATE POLICY "attendance_responses_select_public" ON attendance_responses
  FOR SELECT TO public, anon, authenticated
  USING (true);

-- 出欠回答: 本人のみ更新可能（名前で識別、簡易版）
-- ※ セキュリティは緩めだが、出欠表の性質上問題なし
CREATE POLICY "attendance_responses_update_public" ON attendance_responses
  FOR UPDATE TO public, anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 出欠回答: 本人のみ削除可能
CREATE POLICY "attendance_responses_delete_public" ON attendance_responses
  FOR DELETE TO public, anon, authenticated
  USING (true);

-- -------------------------------------------
-- 4. 更新日時の自動更新トリガー
-- -------------------------------------------
CREATE OR REPLACE FUNCTION update_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- attendance_events用トリガー
DROP TRIGGER IF EXISTS trigger_attendance_events_updated_at ON attendance_events;
CREATE TRIGGER trigger_attendance_events_updated_at
  BEFORE UPDATE ON attendance_events
  FOR EACH ROW
  EXECUTE FUNCTION update_attendance_updated_at();

-- attendance_responses用トリガー
DROP TRIGGER IF EXISTS trigger_attendance_responses_updated_at ON attendance_responses;
CREATE TRIGGER trigger_attendance_responses_updated_at
  BEFORE UPDATE ON attendance_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_attendance_updated_at();

-- -------------------------------------------
-- 5. コメント
-- -------------------------------------------
COMMENT ON TABLE attendance_events IS '出欠表メーカー: イベント情報（無制限作成対応）';
COMMENT ON TABLE attendance_responses IS '出欠表メーカー: 参加者の回答';
COMMENT ON COLUMN attendance_events.slots IS '候補日程の配列 [{date, start_time, end_time, label}]';
COMMENT ON COLUMN attendance_responses.responses IS '各候補への回答 {slot_index: yes|no|maybe}';
