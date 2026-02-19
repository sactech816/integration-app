-- はじめかたガイドテーブル作成
CREATE TABLE IF NOT EXISTS onboarding_modals (
  id BIGSERIAL PRIMARY KEY,
  slug VARCHAR(20) UNIQUE NOT NULL,
  title TEXT NOT NULL DEFAULT '新規はじめかたガイド',
  description TEXT,
  pages JSONB NOT NULL DEFAULT '[]'::jsonb,
  gradient_from VARCHAR(50) DEFAULT 'from-amber-500',
  gradient_to VARCHAR(50) DEFAULT 'to-orange-500',
  trigger_type VARCHAR(20) DEFAULT 'immediate',
  trigger_delay INTEGER DEFAULT 0,
  trigger_scroll_percent INTEGER DEFAULT 50,
  trigger_button_text VARCHAR(100) DEFAULT 'ヘルプ',
  trigger_button_position VARCHAR(20) DEFAULT 'bottom-right',
  show_dont_show_again BOOLEAN DEFAULT true,
  close_on_overlay_click BOOLEAN DEFAULT true,
  auto_close_seconds INTEGER DEFAULT 0,
  dont_show_text VARCHAR(100) DEFAULT '次から表示しない',
  next_button_text VARCHAR(50) DEFAULT '次へ',
  back_button_text VARCHAR(50) DEFAULT '戻る',
  start_button_text VARCHAR(50) DEFAULT 'はじめる',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  show_in_portal BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_onboarding_modals_slug ON onboarding_modals(slug);
CREATE INDEX idx_onboarding_modals_user ON onboarding_modals(user_id);

-- RLS有効化
ALTER TABLE onboarding_modals ENABLE ROW LEVEL SECURITY;

-- 全員読み取り可
CREATE POLICY "Public read onboarding_modals" ON onboarding_modals
  FOR SELECT USING (true);

-- ユーザーは自分のモーダルを作成可（ゲスト作成も許可）
CREATE POLICY "Users can insert own onboarding_modals" ON onboarding_modals
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ユーザーは自分のモーダルを更新可
CREATE POLICY "Users can update own onboarding_modals" ON onboarding_modals
  FOR UPDATE USING (auth.uid() = user_id);

-- ユーザーは自分のモーダルを削除可
CREATE POLICY "Users can delete own onboarding_modals" ON onboarding_modals
  FOR DELETE USING (auth.uid() = user_id);
