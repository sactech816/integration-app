-- ============================================
-- KDL 教育コンテンツ & お知らせテーブル
-- ============================================
-- 作成日: 2026-01-30
-- 概要: KDL管理画面の教育コンテンツとお知らせ機能用テーブル
-- ============================================

-- ============================================
-- 1. 教育コンテンツテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS kdl_education_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- コンテンツ基本情報
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL DEFAULT 'article' CHECK (content_type IN ('article', 'video', 'tutorial', 'faq')),
  
  -- カテゴリ
  category TEXT NOT NULL DEFAULT 'basics' CHECK (category IN (
    'basics',        -- 執筆基礎
    'kdp',           -- KDP入門
    'marketing',     -- マーケティング
    'ai_tips',       -- AI活用術
    'advanced',      -- 上級テクニック
    'case_study'     -- 成功事例
  )),
  
  -- コンテンツ本体
  body TEXT,                       -- 記事の場合はマークダウン
  video_url TEXT,                  -- 動画の場合はURL
  thumbnail_url TEXT,              -- サムネイル画像
  
  -- メタデータ
  duration_minutes INT,            -- 所要時間（分）
  difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT[],                     -- タグ配列
  
  -- 表示設定
  sort_order INT DEFAULT 0,
  is_published BOOLEAN DEFAULT FALSE,
  is_premium BOOLEAN DEFAULT FALSE, -- 有料プラン限定
  required_plan TEXT,               -- 必要なプラン（NULL=全員閲覧可）
  
  -- 統計
  view_count INT DEFAULT 0,
  
  -- タイムスタンプ
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- 作成者
  created_by UUID REFERENCES auth.users(id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_kdl_education_category ON kdl_education_contents(category);
CREATE INDEX IF NOT EXISTS idx_kdl_education_content_type ON kdl_education_contents(content_type);
CREATE INDEX IF NOT EXISTS idx_kdl_education_published ON kdl_education_contents(is_published);
CREATE INDEX IF NOT EXISTS idx_kdl_education_sort_order ON kdl_education_contents(sort_order);

-- ============================================
-- 2. 教育コンテンツ閲覧履歴テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS kdl_education_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES kdl_education_contents(id) ON DELETE CASCADE,
  
  -- 進捗
  is_completed BOOLEAN DEFAULT FALSE,
  progress_percent INT DEFAULT 0,     -- 0-100
  last_position INT DEFAULT 0,        -- 動画の場合は秒数、記事の場合はスクロール位置
  
  -- タイムスタンプ
  first_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  -- 一意制約
  UNIQUE(user_id, content_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_kdl_education_progress_user ON kdl_education_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_kdl_education_progress_content ON kdl_education_progress(content_id);

-- ============================================
-- 3. お知らせテーブル
-- ============================================
CREATE TABLE IF NOT EXISTS kdl_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- お知らせ基本情報
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  
  -- カテゴリと優先度
  category TEXT NOT NULL DEFAULT 'info' CHECK (category IN (
    'info',          -- お知らせ
    'update',        -- アップデート
    'maintenance',   -- メンテナンス
    'campaign',      -- キャンペーン
    'important'      -- 重要
  )),
  priority INT DEFAULT 0,           -- 高いほど上に表示
  
  -- 表示設定
  is_published BOOLEAN DEFAULT FALSE,
  is_pinned BOOLEAN DEFAULT FALSE,  -- 固定表示
  
  -- 対象設定
  target_plans TEXT[],              -- 対象プラン（NULL=全員）
  target_roles TEXT[],              -- 対象ロール（NULL=全員）
  
  -- 有効期間
  start_at TIMESTAMPTZ,             -- 表示開始日時
  end_at TIMESTAMPTZ,               -- 表示終了日時
  
  -- タイムスタンプ
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ,
  
  -- 作成者
  created_by UUID REFERENCES auth.users(id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_kdl_announcements_category ON kdl_announcements(category);
CREATE INDEX IF NOT EXISTS idx_kdl_announcements_published ON kdl_announcements(is_published);
CREATE INDEX IF NOT EXISTS idx_kdl_announcements_pinned ON kdl_announcements(is_pinned);
CREATE INDEX IF NOT EXISTS idx_kdl_announcements_dates ON kdl_announcements(start_at, end_at);

-- ============================================
-- 4. お知らせ既読テーブル
-- ============================================
CREATE TABLE IF NOT EXISTS kdl_announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  announcement_id UUID NOT NULL REFERENCES kdl_announcements(id) ON DELETE CASCADE,
  
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 一意制約
  UNIQUE(user_id, announcement_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_kdl_announcement_reads_user ON kdl_announcement_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_kdl_announcement_reads_announcement ON kdl_announcement_reads(announcement_id);

-- ============================================
-- 5. RLSポリシー
-- ============================================

-- kdl_education_contents
ALTER TABLE kdl_education_contents ENABLE ROW LEVEL SECURITY;

-- 公開済みコンテンツは全員閲覧可能
CREATE POLICY "kdl_education_contents_select" ON kdl_education_contents
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR is_published = TRUE
  );

-- 挿入・更新・削除はサービスロールのみ
CREATE POLICY "kdl_education_contents_insert" ON kdl_education_contents
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "kdl_education_contents_update" ON kdl_education_contents
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "kdl_education_contents_delete" ON kdl_education_contents
  FOR DELETE USING (auth.role() = 'service_role');

-- kdl_education_progress
ALTER TABLE kdl_education_progress ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の進捗のみ閲覧・更新可能
CREATE POLICY "kdl_education_progress_select" ON kdl_education_progress
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR auth.uid() = user_id
  );

CREATE POLICY "kdl_education_progress_insert" ON kdl_education_progress
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role'
    OR auth.uid() = user_id
  );

CREATE POLICY "kdl_education_progress_update" ON kdl_education_progress
  FOR UPDATE USING (
    auth.role() = 'service_role'
    OR auth.uid() = user_id
  );

-- kdl_announcements
ALTER TABLE kdl_announcements ENABLE ROW LEVEL SECURITY;

-- 公開済みお知らせは全員閲覧可能
CREATE POLICY "kdl_announcements_select" ON kdl_announcements
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR (
      is_published = TRUE
      AND (start_at IS NULL OR start_at <= NOW())
      AND (end_at IS NULL OR end_at >= NOW())
    )
  );

-- 挿入・更新・削除はサービスロールのみ
CREATE POLICY "kdl_announcements_insert" ON kdl_announcements
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "kdl_announcements_update" ON kdl_announcements
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "kdl_announcements_delete" ON kdl_announcements
  FOR DELETE USING (auth.role() = 'service_role');

-- kdl_announcement_reads
ALTER TABLE kdl_announcement_reads ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分の既読情報のみ
CREATE POLICY "kdl_announcement_reads_select" ON kdl_announcement_reads
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR auth.uid() = user_id
  );

CREATE POLICY "kdl_announcement_reads_insert" ON kdl_announcement_reads
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role'
    OR auth.uid() = user_id
  );

-- ============================================
-- 6. 更新日時自動更新トリガー
-- ============================================
CREATE OR REPLACE FUNCTION update_kdl_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_kdl_education_contents_updated_at
  BEFORE UPDATE ON kdl_education_contents
  FOR EACH ROW
  EXECUTE FUNCTION update_kdl_content_updated_at();

CREATE TRIGGER trigger_kdl_announcements_updated_at
  BEFORE UPDATE ON kdl_announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_kdl_content_updated_at();

-- ============================================
-- 7. サンプルデータ（オプション）
-- ============================================
-- 教育コンテンツサンプル
INSERT INTO kdl_education_contents (title, description, content_type, category, body, duration_minutes, difficulty, is_published, sort_order) VALUES
  ('KDL入門ガイド', 'KDLの基本的な使い方を学びます', 'article', 'basics', '# KDL入門ガイド\n\nKDLは、AIを活用してKindle本を効率的に執筆するためのサービスです。\n\n## 基本的な流れ\n\n1. テーマを決める\n2. AIと一緒に目次を作成\n3. 各章を執筆\n4. KDP形式でエクスポート\n\n詳しくは各チュートリアルをご覧ください。', 5, 'beginner', TRUE, 1),
  ('効果的な章立ての作り方', 'AIを活用した目次作成のコツ', 'article', 'ai_tips', '# 効果的な章立ての作り方\n\n良い目次は本の骨格です。AIを使って効果的な章立てを作成する方法を解説します。', 10, 'intermediate', TRUE, 2),
  ('KDP登録の手順', 'Amazon KDPへの登録方法を解説', 'tutorial', 'kdp', '# KDP登録の手順\n\n書籍が完成したら、Amazon KDPに登録して出版しましょう。', 15, 'beginner', TRUE, 3);

-- お知らせサンプル
INSERT INTO kdl_announcements (title, content, category, priority, is_published, is_pinned) VALUES
  ('Kindle出版メーカー正式リリースのお知らせ', 'Kindle出版メーカーが正式リリースされました！\n\nAIを活用したKindle出版サービスをぜひお試しください。', 'info', 10, TRUE, TRUE),
  ('新機能：KDP情報自動生成', 'キーワード、紹介文、カテゴリー提案機能が追加されました。\n\n書籍編集画面から「KDP情報を生成」ボタンでお試しいただけます。', 'update', 5, TRUE, FALSE);

-- ============================================
-- 完了
-- ============================================
COMMENT ON TABLE kdl_education_contents IS 'KDL教育コンテンツ（記事、動画、チュートリアル）';
COMMENT ON TABLE kdl_education_progress IS 'ユーザーの教育コンテンツ閲覧進捗';
COMMENT ON TABLE kdl_announcements IS 'KDLお知らせ';
COMMENT ON TABLE kdl_announcement_reads IS 'お知らせの既読情報';
