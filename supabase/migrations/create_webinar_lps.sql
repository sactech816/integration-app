-- ウェビナーLP テーブル作成
CREATE TABLE webinar_lps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB DEFAULT '[]',
  settings JSONB DEFAULT '{}',
  template_id TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE webinar_lps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own webinar LPs"
  ON webinar_lps FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Published webinar LPs are public"
  ON webinar_lps FOR SELECT USING (status = 'published');
