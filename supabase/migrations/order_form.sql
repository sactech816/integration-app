-- =============================================
-- 申し込みフォーム＋決済機能（Order Form）
-- Phase 2: Stripe / UnivaPay決済付きカスタムフォーム
-- =============================================

-- 1. フォーム定義
CREATE TABLE IF NOT EXISTS order_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price INTEGER DEFAULT 0,
  currency TEXT DEFAULT 'jpy',
  payment_type TEXT DEFAULT 'free',   -- free | one_time | subscription
  payment_provider TEXT,               -- stripe | univapay | null
  stripe_price_id TEXT,
  univapay_config JSONB,
  success_message TEXT DEFAULT 'お申し込みありがとうございます。',
  status TEXT DEFAULT 'draft',         -- draft | published
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE order_forms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_order_forms" ON order_forms
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own forms" ON order_forms
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view published forms" ON order_forms
  FOR SELECT TO anon
  USING (status = 'published');

CREATE POLICY "Authenticated can view published forms" ON order_forms
  FOR SELECT TO authenticated
  USING (status = 'published');

CREATE POLICY "Users can insert own forms" ON order_forms
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own forms" ON order_forms
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own forms" ON order_forms
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_order_forms_user_id ON order_forms(user_id);
CREATE INDEX idx_order_forms_slug ON order_forms(slug);
CREATE INDEX idx_order_forms_status ON order_forms(status);

-- 2. カスタムフィールド
CREATE TABLE IF NOT EXISTS order_form_fields (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES order_forms(id) ON DELETE CASCADE,
  field_type TEXT NOT NULL,           -- text | email | tel | textarea | select | checkbox | number
  label TEXT NOT NULL,
  placeholder TEXT,
  required BOOLEAN DEFAULT false,
  options JSONB,                      -- select用選択肢 ["選択肢A", "選択肢B"]
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE order_form_fields ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_order_form_fields" ON order_form_fields
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- フォーム所有者のみ編集可能、公開フォームのフィールドは誰でも閲覧可能
CREATE POLICY "Anyone can view fields of published forms" ON order_form_fields
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM order_forms
      WHERE order_forms.id = order_form_fields.form_id
      AND order_forms.status = 'published'
    )
  );

CREATE POLICY "Authenticated can view fields" ON order_form_fields
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM order_forms
      WHERE order_forms.id = order_form_fields.form_id
      AND (order_forms.user_id = auth.uid() OR order_forms.status = 'published')
    )
  );

CREATE POLICY "Form owners can insert fields" ON order_form_fields
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM order_forms
      WHERE order_forms.id = order_form_fields.form_id
      AND order_forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Form owners can update fields" ON order_form_fields
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM order_forms
      WHERE order_forms.id = order_form_fields.form_id
      AND order_forms.user_id = auth.uid()
    )
  );

CREATE POLICY "Form owners can delete fields" ON order_form_fields
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM order_forms
      WHERE order_forms.id = order_form_fields.form_id
      AND order_forms.user_id = auth.uid()
    )
  );

CREATE INDEX idx_order_form_fields_form_id ON order_form_fields(form_id);

-- 3. 申し込み（購入記録）
CREATE TABLE IF NOT EXISTS order_form_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID NOT NULL REFERENCES order_forms(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  fields_data JSONB,
  payment_status TEXT DEFAULT 'pending',  -- pending | paid | free | failed
  payment_provider TEXT,
  payment_reference TEXT,
  amount_paid INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE order_form_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_order_form_submissions" ON order_form_submissions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- フォーム所有者のみ閲覧可能
CREATE POLICY "Form owners can view submissions" ON order_form_submissions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM order_forms
      WHERE order_forms.id = order_form_submissions.form_id
      AND order_forms.user_id = auth.uid()
    )
  );

-- 誰でも申し込み可能（公開フォーム）
CREATE POLICY "Anyone can insert submissions" ON order_form_submissions
  FOR INSERT TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM order_forms
      WHERE order_forms.id = order_form_submissions.form_id
      AND order_forms.status = 'published'
    )
  );

CREATE POLICY "Authenticated can insert submissions" ON order_form_submissions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM order_forms
      WHERE order_forms.id = order_form_submissions.form_id
      AND order_forms.status = 'published'
    )
  );

CREATE INDEX idx_order_form_submissions_form_id ON order_form_submissions(form_id);
CREATE INDEX idx_order_form_submissions_payment_status ON order_form_submissions(payment_status);
CREATE INDEX idx_order_form_submissions_email ON order_form_submissions(email);
