-- ===========================================
-- 日程調整機能 データベースセットアップ
-- ===========================================
-- 
-- このSQLをSupabaseのSQL Editorで実行してください。
-- 予約システム（supabase_booking_setup.sql）を実行後に実行してください。
--

-- -------------------------------------------
-- 1. 日程調整回答テーブル (schedule_adjustment_responses)
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS public.schedule_adjustment_responses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id uuid REFERENCES public.booking_menus ON DELETE CASCADE NOT NULL,
  participant_name text NOT NULL,
  participant_email text,
  responses jsonb NOT NULL DEFAULT '{}', -- {slot_id: 'yes'|'no'|'maybe'}
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(menu_id, participant_name)
);

-- コメント
COMMENT ON TABLE public.schedule_adjustment_responses IS '日程調整への回答（出欠確認）';
COMMENT ON COLUMN public.schedule_adjustment_responses.menu_id IS '所属する日程調整メニューID';
COMMENT ON COLUMN public.schedule_adjustment_responses.participant_name IS '参加者のニックネーム';
COMMENT ON COLUMN public.schedule_adjustment_responses.participant_email IS '参加者のメールアドレス（任意、入力すると結果メール送信）';
COMMENT ON COLUMN public.schedule_adjustment_responses.responses IS '各日程候補への回答（JSONB形式）: {slot_id: "yes"|"no"|"maybe"}';

-- -------------------------------------------
-- インデックス作成
-- -------------------------------------------
CREATE INDEX IF NOT EXISTS idx_schedule_adjustment_responses_menu_id ON public.schedule_adjustment_responses(menu_id);
CREATE INDEX IF NOT EXISTS idx_schedule_adjustment_responses_participant_name ON public.schedule_adjustment_responses(participant_name);
CREATE INDEX IF NOT EXISTS idx_schedule_adjustment_responses_menu_name ON public.schedule_adjustment_responses(menu_id, participant_name);

-- JSONB インデックス（responses内のslot_id検索用）
CREATE INDEX IF NOT EXISTS idx_schedule_adjustment_responses_responses ON public.schedule_adjustment_responses USING GIN (responses);

-- -------------------------------------------
-- Row Level Security (RLS) 設定
-- -------------------------------------------

-- RLSを有効化
ALTER TABLE public.schedule_adjustment_responses ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（エラー回避のため）
DROP POLICY IF EXISTS "Menu owners can view all responses" ON public.schedule_adjustment_responses;
DROP POLICY IF EXISTS "Anyone can create schedule adjustment responses" ON public.schedule_adjustment_responses;
DROP POLICY IF EXISTS "Anyone can update schedule adjustment responses" ON public.schedule_adjustment_responses;
DROP POLICY IF EXISTS "Anyone can view responses of active menus" ON public.schedule_adjustment_responses;

-- メニュー所有者は全回答を閲覧可能
CREATE POLICY "Menu owners can view all responses" ON public.schedule_adjustment_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.booking_menus
      WHERE booking_menus.id = schedule_adjustment_responses.menu_id
      AND booking_menus.user_id = auth.uid()
    )
  );

-- 誰でも回答を作成・更新可能（公開ページ用）
CREATE POLICY "Anyone can create schedule adjustment responses" ON public.schedule_adjustment_responses
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update schedule adjustment responses" ON public.schedule_adjustment_responses
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- 有効なメニューの回答は誰でも閲覧可能
CREATE POLICY "Anyone can view responses of active menus" ON public.schedule_adjustment_responses
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.booking_menus
      WHERE booking_menus.id = schedule_adjustment_responses.menu_id
      AND booking_menus.is_active = true
    )
  );

-- -------------------------------------------
-- updated_at 自動更新トリガー
-- -------------------------------------------
CREATE OR REPLACE FUNCTION update_schedule_adjustment_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 既存のトリガーを削除（エラー回避のため）
DROP TRIGGER IF EXISTS trigger_update_schedule_adjustment_responses_updated_at ON public.schedule_adjustment_responses;

CREATE TRIGGER trigger_update_schedule_adjustment_responses_updated_at
  BEFORE UPDATE ON public.schedule_adjustment_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_schedule_adjustment_responses_updated_at();

-- -------------------------------------------
-- 便利なビュー（オプション）
-- -------------------------------------------

-- 日程調整の出欠表ビュー（各日程候補ごとの参加者数を集計）
CREATE OR REPLACE VIEW public.schedule_adjustment_summary AS
SELECT 
  bs.id AS slot_id,
  bs.menu_id,
  bs.start_time,
  bs.end_time,
  bm.title AS menu_title,
  COUNT(CASE WHEN sar.responses->>bs.id::text = 'yes' THEN 1 END) AS yes_count,
  COUNT(CASE WHEN sar.responses->>bs.id::text = 'no' THEN 1 END) AS no_count,
  COUNT(CASE WHEN sar.responses->>bs.id::text = 'maybe' THEN 1 END) AS maybe_count,
  COUNT(CASE WHEN sar.responses->>bs.id::text IN ('yes', 'maybe') THEN 1 END) AS available_count
FROM public.booking_slots bs
JOIN public.booking_menus bm ON bm.id = bs.menu_id
LEFT JOIN public.schedule_adjustment_responses sar ON sar.menu_id = bs.menu_id
WHERE bm.type = 'adjustment'
GROUP BY bs.id, bs.menu_id, bs.start_time, bs.end_time, bm.title;

-- ビューへのアクセス権限
GRANT SELECT ON public.schedule_adjustment_summary TO authenticated;
GRANT SELECT ON public.schedule_adjustment_summary TO anon;

-- -------------------------------------------
-- 完了メッセージ
-- -------------------------------------------
DO $$
BEGIN
  RAISE NOTICE '日程調整機能のセットアップが完了しました。';
  RAISE NOTICE 'テーブル: schedule_adjustment_responses';
  RAISE NOTICE 'ビュー: schedule_adjustment_summary';
END $$;

