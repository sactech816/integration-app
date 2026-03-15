-- お問い合わせ履歴テーブル
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'contact',        -- 'contact' | 'support'
  source_page TEXT,                               -- 送信元ページ（例: '/support', '/contact'）
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,                                   -- contact フォーム用
  message TEXT,
  pack TEXT,                                      -- support-inquiry 用（パック種別キー）
  pack_name TEXT,                                 -- support-inquiry 用（パック表示名）
  situation TEXT,                                 -- support-inquiry 用（現在の状況）
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  status TEXT NOT NULL DEFAULT 'unread',          -- 'unread' | 'read' | 'replied'
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_created_at ON contact_inquiries(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_source ON contact_inquiries(source);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_status ON contact_inquiries(status);
CREATE INDEX IF NOT EXISTS idx_contact_inquiries_email ON contact_inquiries(email);

-- RLS
ALTER TABLE contact_inquiries ENABLE ROW LEVEL SECURITY;

-- 管理者のみ読み取り可能
CREATE POLICY "admin_read_inquiries" ON contact_inquiries
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- 誰でもINSERT可能（フォーム送信用）
CREATE POLICY "anyone_insert_inquiries" ON contact_inquiries
  FOR INSERT
  WITH CHECK (true);

-- 管理者のみ更新・削除可能
CREATE POLICY "admin_update_inquiries" ON contact_inquiries
  FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

CREATE POLICY "admin_delete_inquiries" ON contact_inquiries
  FOR DELETE
  TO authenticated
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
