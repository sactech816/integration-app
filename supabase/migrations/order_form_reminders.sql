-- リマインダー設定カラム追加
ALTER TABLE order_forms ADD COLUMN IF NOT EXISTS event_date TIMESTAMPTZ;
ALTER TABLE order_forms ADD COLUMN IF NOT EXISTS reminder_1day_enabled BOOLEAN DEFAULT false;
ALTER TABLE order_forms ADD COLUMN IF NOT EXISTS reminder_same_day_enabled BOOLEAN DEFAULT false;
ALTER TABLE order_forms ADD COLUMN IF NOT EXISTS reminder_email_subject TEXT;
ALTER TABLE order_forms ADD COLUMN IF NOT EXISTS reminder_email_body TEXT;

-- リマインダー送信済み追跡テーブル
CREATE TABLE IF NOT EXISTS order_form_reminders_sent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES order_forms(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES order_form_submissions(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('1day_before', 'same_day')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(form_id, submission_id, reminder_type)
);

CREATE INDEX IF NOT EXISTS idx_reminders_sent_form ON order_form_reminders_sent(form_id);
CREATE INDEX IF NOT EXISTS idx_reminders_sent_submission ON order_form_reminders_sent(submission_id);
