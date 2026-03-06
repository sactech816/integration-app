-- =============================================
-- ステップメールメーカー（Step Email Maker）
-- newsletter_lists / newsletter_subscribers を共有
-- 送信数も newsletter_send_logs で共有（月間送信上限合算）
-- =============================================

-- 1. シーケンス（ステップメールの「シナリオ」）
CREATE TABLE IF NOT EXISTS step_email_sequences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  list_id UUID NOT NULL REFERENCES newsletter_lists(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft',  -- draft | active | paused
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE step_email_sequences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_step_email_sequences" ON step_email_sequences
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own sequences" ON step_email_sequences
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sequences" ON step_email_sequences
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sequences" ON step_email_sequences
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sequences" ON step_email_sequences
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_step_email_sequences_user_id ON step_email_sequences(user_id);
CREATE INDEX idx_step_email_sequences_list_id ON step_email_sequences(list_id);
CREATE INDEX idx_step_email_sequences_status ON step_email_sequences(status);

-- 2. ステップ（シーケンス内の各メール）
CREATE TABLE IF NOT EXISTS step_email_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL REFERENCES step_email_sequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL DEFAULT 0,       -- 0始まり（0 = 登録直後）
  delay_days INTEGER NOT NULL DEFAULT 0,        -- 登録から何日後に送信
  subject TEXT NOT NULL,
  html_content TEXT,
  text_content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sequence_id, step_order)
);

ALTER TABLE step_email_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_step_email_steps" ON step_email_steps
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- シーケンス所有者のみアクセス可能
CREATE POLICY "Sequence owners can view steps" ON step_email_steps
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM step_email_sequences
      WHERE step_email_sequences.id = step_email_steps.sequence_id
      AND step_email_sequences.user_id = auth.uid()
    )
  );

CREATE POLICY "Sequence owners can insert steps" ON step_email_steps
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM step_email_sequences
      WHERE step_email_sequences.id = step_email_steps.sequence_id
      AND step_email_sequences.user_id = auth.uid()
    )
  );

CREATE POLICY "Sequence owners can update steps" ON step_email_steps
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM step_email_sequences
      WHERE step_email_sequences.id = step_email_steps.sequence_id
      AND step_email_sequences.user_id = auth.uid()
    )
  );

CREATE POLICY "Sequence owners can delete steps" ON step_email_steps
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM step_email_sequences
      WHERE step_email_sequences.id = step_email_steps.sequence_id
      AND step_email_sequences.user_id = auth.uid()
    )
  );

CREATE INDEX idx_step_email_steps_sequence_id ON step_email_steps(sequence_id);
CREATE INDEX idx_step_email_steps_order ON step_email_steps(sequence_id, step_order);

-- 3. 購読者ごとの配信進捗
CREATE TABLE IF NOT EXISTS step_email_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sequence_id UUID NOT NULL REFERENCES step_email_sequences(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES newsletter_subscribers(id) ON DELETE CASCADE,
  current_step INTEGER NOT NULL DEFAULT 0,    -- 次に送信すべきステップの step_order
  status TEXT NOT NULL DEFAULT 'active',      -- active | completed | paused
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_sent_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sequence_id, subscriber_id)
);

ALTER TABLE step_email_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_step_email_progress" ON step_email_progress
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- シーケンス所有者のみアクセス可能
CREATE POLICY "Sequence owners can view progress" ON step_email_progress
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM step_email_sequences
      WHERE step_email_sequences.id = step_email_progress.sequence_id
      AND step_email_sequences.user_id = auth.uid()
    )
  );

CREATE POLICY "Sequence owners can manage progress" ON step_email_progress
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM step_email_sequences
      WHERE step_email_sequences.id = step_email_progress.sequence_id
      AND step_email_sequences.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM step_email_sequences
      WHERE step_email_sequences.id = step_email_progress.sequence_id
      AND step_email_sequences.user_id = auth.uid()
    )
  );

CREATE INDEX idx_step_email_progress_sequence_id ON step_email_progress(sequence_id);
CREATE INDEX idx_step_email_progress_subscriber_id ON step_email_progress(subscriber_id);
CREATE INDEX idx_step_email_progress_status ON step_email_progress(status);
CREATE INDEX idx_step_email_progress_lookup ON step_email_progress(sequence_id, status, current_step);
