-- ステップメール 開封・クリック計測テーブル
CREATE TABLE IF NOT EXISTS step_email_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID NOT NULL REFERENCES step_email_sequences(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES step_email_steps(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('open', 'click')),
  link_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_step_email_tracking_sequence ON step_email_tracking(sequence_id);
CREATE INDEX IF NOT EXISTS idx_step_email_tracking_step ON step_email_tracking(step_id);
CREATE INDEX IF NOT EXISTS idx_step_email_tracking_event ON step_email_tracking(sequence_id, step_id, event_type);

-- RLS
ALTER TABLE step_email_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tracking for their sequences"
  ON step_email_tracking FOR SELECT
  USING (
    sequence_id IN (
      SELECT id FROM step_email_sequences WHERE user_id = auth.uid()
    )
  );
