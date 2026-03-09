-- 予約メニューにリマインダー設定カラムを追加
ALTER TABLE booking_menus ADD COLUMN IF NOT EXISTS reminder_1day_enabled BOOLEAN DEFAULT false;
ALTER TABLE booking_menus ADD COLUMN IF NOT EXISTS reminder_same_day_enabled BOOLEAN DEFAULT false;
ALTER TABLE booking_menus ADD COLUMN IF NOT EXISTS reminder_email_subject TEXT;
ALTER TABLE booking_menus ADD COLUMN IF NOT EXISTS reminder_email_body TEXT;
ALTER TABLE booking_menus ADD COLUMN IF NOT EXISTS email_footer_name TEXT;

-- リマインダー送信済み追跡テーブル
CREATE TABLE IF NOT EXISTS booking_reminders_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES booking_menus(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('1day_before', 'same_day')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(menu_id, booking_id, reminder_type)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_booking_reminders_sent_menu_id ON booking_reminders_sent(menu_id);
CREATE INDEX IF NOT EXISTS idx_booking_reminders_sent_booking_id ON booking_reminders_sent(booking_id);

-- RLS
ALTER TABLE booking_reminders_sent ENABLE ROW LEVEL SECURITY;

-- Service Role のみアクセス可（Cronジョブ用）
CREATE POLICY "Service role can manage booking reminders"
  ON booking_reminders_sent
  FOR ALL
  USING (true)
  WITH CHECK (true);
