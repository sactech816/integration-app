-- ===========================================
-- 予約システム・日程調整機能 データベースセットアップ
-- ===========================================
-- 
-- このSQLをSupabaseのSQL Editorで実行してください。
-- 実行順序: 1. テーブル作成 → 2. インデックス作成 → 3. RLSポリシー設定
--

-- -------------------------------------------
-- 1. 予約メニュー (booking_menus)
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS public.booking_menus (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text,
  duration_min int DEFAULT 60,
  type text DEFAULT 'reservation', -- 'reservation' or 'adjustment'
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- コメント
COMMENT ON TABLE public.booking_menus IS '予約メニュー（予約枠のグループ）';
COMMENT ON COLUMN public.booking_menus.user_id IS 'メニュー所有者のユーザーID';
COMMENT ON COLUMN public.booking_menus.title IS 'メニュータイトル';
COMMENT ON COLUMN public.booking_menus.description IS 'メニュー説明';
COMMENT ON COLUMN public.booking_menus.duration_min IS '所要時間（分）';
COMMENT ON COLUMN public.booking_menus.type IS 'メニュータイプ: reservation=予約, adjustment=日程調整';
COMMENT ON COLUMN public.booking_menus.is_active IS '有効フラグ';

-- -------------------------------------------
-- 2. 予約枠 (booking_slots)
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS public.booking_slots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  menu_id uuid REFERENCES public.booking_menus ON DELETE CASCADE NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  max_capacity int DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

-- コメント
COMMENT ON TABLE public.booking_slots IS '予約枠（予約可能な時間帯）';
COMMENT ON COLUMN public.booking_slots.menu_id IS '所属する予約メニューID';
COMMENT ON COLUMN public.booking_slots.start_time IS '開始日時';
COMMENT ON COLUMN public.booking_slots.end_time IS '終了日時';
COMMENT ON COLUMN public.booking_slots.max_capacity IS '最大予約数';

-- -------------------------------------------
-- 3. 予約回答 (bookings)
-- -------------------------------------------
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slot_id uuid REFERENCES public.booking_slots ON DELETE CASCADE NOT NULL,
  customer_id uuid REFERENCES auth.users,
  guest_name text,
  guest_email text,
  guest_comment text,
  status text DEFAULT 'ok', -- 'ok', 'pending', 'cancelled'
  created_at timestamptz DEFAULT now(),
  UNIQUE(slot_id, customer_id)
);

-- コメント
COMMENT ON TABLE public.bookings IS '予約回答（予約の実データ）';
COMMENT ON COLUMN public.bookings.slot_id IS '予約枠ID';
COMMENT ON COLUMN public.bookings.customer_id IS '予約者のユーザーID（ログインユーザーの場合）';
COMMENT ON COLUMN public.bookings.guest_name IS 'ゲスト予約者の名前';
COMMENT ON COLUMN public.bookings.guest_email IS 'ゲスト予約者のメールアドレス';
COMMENT ON COLUMN public.bookings.guest_comment IS '予約者からのコメント';
COMMENT ON COLUMN public.bookings.status IS '予約ステータス: ok=確定, pending=保留, cancelled=キャンセル';

-- -------------------------------------------
-- インデックス作成
-- -------------------------------------------

-- booking_menus
CREATE INDEX IF NOT EXISTS idx_booking_menus_user_id ON public.booking_menus(user_id);
CREATE INDEX IF NOT EXISTS idx_booking_menus_is_active ON public.booking_menus(is_active);
CREATE INDEX IF NOT EXISTS idx_booking_menus_type ON public.booking_menus(type);

-- booking_slots
CREATE INDEX IF NOT EXISTS idx_booking_slots_menu_id ON public.booking_slots(menu_id);
CREATE INDEX IF NOT EXISTS idx_booking_slots_start_time ON public.booking_slots(start_time);
CREATE INDEX IF NOT EXISTS idx_booking_slots_menu_start ON public.booking_slots(menu_id, start_time);

-- bookings
CREATE INDEX IF NOT EXISTS idx_bookings_slot_id ON public.bookings(slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_email ON public.bookings(guest_email);

-- -------------------------------------------
-- Row Level Security (RLS) 設定
-- -------------------------------------------

-- RLSを有効化
ALTER TABLE public.booking_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- booking_menus ポリシー
-- 所有者は全操作可能
CREATE POLICY "Users can manage own menus" ON public.booking_menus
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 有効なメニューは誰でも閲覧可能
CREATE POLICY "Anyone can view active menus" ON public.booking_menus
  FOR SELECT
  USING (is_active = true);

-- booking_slots ポリシー
-- メニュー所有者は全操作可能
CREATE POLICY "Menu owners can manage slots" ON public.booking_slots
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.booking_menus
      WHERE booking_menus.id = booking_slots.menu_id
      AND booking_menus.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.booking_menus
      WHERE booking_menus.id = booking_slots.menu_id
      AND booking_menus.user_id = auth.uid()
    )
  );

-- 有効なメニューの枠は誰でも閲覧可能
CREATE POLICY "Anyone can view slots of active menus" ON public.booking_slots
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.booking_menus
      WHERE booking_menus.id = booking_slots.menu_id
      AND booking_menus.is_active = true
    )
  );

-- bookings ポリシー
-- 予約者本人は自分の予約を閲覧・キャンセル可能
CREATE POLICY "Customers can view own bookings" ON public.bookings
  FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Customers can update own bookings" ON public.bookings
  FOR UPDATE
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

-- メニュー所有者は関連する予約を全て閲覧可能
CREATE POLICY "Menu owners can view related bookings" ON public.bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.booking_slots
      JOIN public.booking_menus ON booking_menus.id = booking_slots.menu_id
      WHERE booking_slots.id = bookings.slot_id
      AND booking_menus.user_id = auth.uid()
    )
  );

-- メニュー所有者は関連する予約を更新可能
CREATE POLICY "Menu owners can update related bookings" ON public.bookings
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.booking_slots
      JOIN public.booking_menus ON booking_menus.id = booking_slots.menu_id
      WHERE booking_slots.id = bookings.slot_id
      AND booking_menus.user_id = auth.uid()
    )
  );

-- 誰でも予約を作成可能（ゲスト予約対応）
CREATE POLICY "Anyone can create bookings" ON public.bookings
  FOR INSERT
  WITH CHECK (true);

-- -------------------------------------------
-- Service Role用ポリシー（Server Actions用）
-- -------------------------------------------
-- Service Role Keyを使用する場合、RLSはバイパスされるため
-- 追加のポリシーは不要です。

-- -------------------------------------------
-- 便利なビュー（オプション）
-- -------------------------------------------

-- 予約枠と予約数を結合したビュー
CREATE OR REPLACE VIEW public.booking_slots_with_count AS
SELECT 
  bs.*,
  bm.title AS menu_title,
  bm.user_id AS menu_owner_id,
  bm.duration_min,
  bm.type AS menu_type,
  COALESCE(booking_counts.count, 0) AS current_bookings,
  bs.max_capacity - COALESCE(booking_counts.count, 0) AS remaining_capacity,
  (bs.max_capacity - COALESCE(booking_counts.count, 0)) > 0 AS is_available
FROM public.booking_slots bs
JOIN public.booking_menus bm ON bm.id = bs.menu_id
LEFT JOIN (
  SELECT slot_id, COUNT(*) AS count
  FROM public.bookings
  WHERE status != 'cancelled'
  GROUP BY slot_id
) booking_counts ON booking_counts.slot_id = bs.id;

-- ビューへのアクセス権限
GRANT SELECT ON public.booking_slots_with_count TO authenticated;
GRANT SELECT ON public.booking_slots_with_count TO anon;

-- -------------------------------------------
-- 完了メッセージ
-- -------------------------------------------
DO $$
BEGIN
  RAISE NOTICE '予約システムのセットアップが完了しました。';
  RAISE NOTICE 'テーブル: booking_menus, booking_slots, bookings';
  RAISE NOTICE 'ビュー: booking_slots_with_count';
END $$;

