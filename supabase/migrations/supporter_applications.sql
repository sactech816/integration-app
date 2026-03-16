-- サポーターズ制度 応募テーブル
CREATE TABLE IF NOT EXISTS supporter_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  occupation TEXT NOT NULL,
  website_url TEXT,
  sns_urls TEXT,
  experience TEXT NOT NULL,
  teaching_experience TEXT,
  motivation TEXT NOT NULL,
  target_audience TEXT,
  skills TEXT,
  how_heard TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_supporter_applications_status ON supporter_applications(status);
CREATE INDEX IF NOT EXISTS idx_supporter_applications_email ON supporter_applications(email);

-- RLS
ALTER TABLE supporter_applications ENABLE ROW LEVEL SECURITY;

-- 誰でもINSERT可（応募フォーム）
CREATE POLICY "anyone_insert_supporter_applications" ON supporter_applications
  FOR INSERT
  WITH CHECK (true);

-- 自分の応募のみ閲覧可
CREATE POLICY "users_read_own_supporter_applications" ON supporter_applications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
