-- ============================================
-- KDL 代理店機能 テーブル設計
-- ============================================
-- 作成日: 2026-01-30
-- 概要: KDLの代理店機能（ユーザーサポート・添削）用のテーブル
-- 
-- 代理店の役割:
-- - 担当ユーザーの進捗管理
-- - 執筆内容の添削・フィードバック
-- - ユーザーとのメッセージングサポート
-- ============================================

-- ============================================
-- 1. 代理店テーブル
-- ============================================
-- 代理店として登録されたユーザーの情報
-- 管理者が手動で登録する
CREATE TABLE IF NOT EXISTS kdl_agencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 代理店ユーザー（auth.usersへの参照）
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 代理店情報
  agency_name TEXT NOT NULL,
  agency_description TEXT,
  
  -- 連絡先情報
  contact_email TEXT,
  contact_phone TEXT,
  
  -- ステータス
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  
  -- 管理者が登録
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- 一意制約: 1ユーザーは1つの代理店のみ
  UNIQUE(user_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_kdl_agencies_user_id ON kdl_agencies(user_id);
CREATE INDEX IF NOT EXISTS idx_kdl_agencies_status ON kdl_agencies(status);

-- ============================================
-- 2. 代理店-ユーザー紐付けテーブル
-- ============================================
-- どの代理店がどのユーザーを担当するか
-- 1ユーザーは1代理店のみに紐づく（1対1）
CREATE TABLE IF NOT EXISTS kdl_agency_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 代理店
  agency_id UUID NOT NULL REFERENCES kdl_agencies(id) ON DELETE CASCADE,
  
  -- 担当ユーザー（auth.usersへの参照）
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 割り当て情報
  assigned_by UUID REFERENCES auth.users(id), -- 割り当てた管理者
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- メモ
  note TEXT,
  
  -- ステータス
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  
  -- 1ユーザーは1代理店のみ
  UNIQUE(user_id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_kdl_agency_users_agency_id ON kdl_agency_users(agency_id);
CREATE INDEX IF NOT EXISTS idx_kdl_agency_users_user_id ON kdl_agency_users(user_id);
CREATE INDEX IF NOT EXISTS idx_kdl_agency_users_status ON kdl_agency_users(status);

-- ============================================
-- 3. 添削・フィードバックテーブル
-- ============================================
-- 代理店からユーザーへのフィードバック
-- 注: kdl_books.id と kdl_sections.id の型に合わせて定義
--     既存テーブルの型を確認してください（UUID or TEXT）
CREATE TABLE IF NOT EXISTS kdl_feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 対象の書籍・節（既存テーブルの型に合わせる）
  -- kdl_books.id が UUID の場合
  book_id UUID NOT NULL REFERENCES kdl_books(id) ON DELETE CASCADE,
  section_id UUID REFERENCES kdl_sections(id) ON DELETE SET NULL, -- 節単位（NULLの場合は書籍全体へのフィードバック）
  
  -- フィードバックを行う代理店ユーザー
  agency_user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- フィードバック内容
  feedback_type TEXT NOT NULL DEFAULT 'comment' CHECK (feedback_type IN ('comment', 'suggestion', 'approval', 'revision_request')),
  content TEXT NOT NULL,
  
  -- 引用テキスト（該当箇所の参照）
  quoted_text TEXT,
  
  -- ステータス
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'read', 'resolved', 'dismissed')),
  
  -- ユーザーの返信
  user_response TEXT,
  responded_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_kdl_feedbacks_book_id ON kdl_feedbacks(book_id);
CREATE INDEX IF NOT EXISTS idx_kdl_feedbacks_section_id ON kdl_feedbacks(section_id);
CREATE INDEX IF NOT EXISTS idx_kdl_feedbacks_agency_user_id ON kdl_feedbacks(agency_user_id);
CREATE INDEX IF NOT EXISTS idx_kdl_feedbacks_status ON kdl_feedbacks(status);

-- ============================================
-- 4. 代理店-ユーザー間メッセージテーブル（将来用）
-- ============================================
-- シンプルなメッセージ機能
CREATE TABLE IF NOT EXISTS kdl_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 会話の相手（代理店とユーザー）
  agency_id UUID NOT NULL REFERENCES kdl_agencies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- 送信者
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('agency', 'user')),
  
  -- メッセージ内容
  content TEXT NOT NULL,
  
  -- 関連する書籍（オプション）
  related_book_id UUID REFERENCES kdl_books(id) ON DELETE SET NULL,
  
  -- 既読フラグ
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_kdl_messages_agency_id ON kdl_messages(agency_id);
CREATE INDEX IF NOT EXISTS idx_kdl_messages_user_id ON kdl_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_kdl_messages_sender_id ON kdl_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_kdl_messages_is_read ON kdl_messages(is_read);
CREATE INDEX IF NOT EXISTS idx_kdl_messages_created_at ON kdl_messages(created_at DESC);

-- ============================================
-- 5. RLS（Row Level Security）ポリシー
-- ============================================

-- kdl_agencies
ALTER TABLE kdl_agencies ENABLE ROW LEVEL SECURITY;

-- 管理者は全代理店を閲覧可能
-- 代理店は自分の情報のみ閲覧可能
CREATE POLICY "kdl_agencies_select" ON kdl_agencies
  FOR SELECT USING (
    -- サービスロールは全て閲覧可能
    auth.role() = 'service_role'
    OR
    -- 自分が代理店の場合
    auth.uid() = user_id
    -- 注: 管理者チェックはアプリケーション側で行う
  );

-- 挿入・更新・削除はサービスロールのみ（管理者がAPI経由で操作）
CREATE POLICY "kdl_agencies_insert" ON kdl_agencies
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "kdl_agencies_update" ON kdl_agencies
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "kdl_agencies_delete" ON kdl_agencies
  FOR DELETE USING (auth.role() = 'service_role');

-- kdl_agency_users
ALTER TABLE kdl_agency_users ENABLE ROW LEVEL SECURITY;

-- 代理店は自分の担当ユーザーを閲覧可能
-- ユーザーは自分が紐づいている代理店情報を閲覧可能
CREATE POLICY "kdl_agency_users_select" ON kdl_agency_users
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR
    -- 自分が担当ユーザー
    auth.uid() = user_id
    OR
    -- 自分が代理店
    agency_id IN (SELECT id FROM kdl_agencies WHERE user_id = auth.uid())
  );

CREATE POLICY "kdl_agency_users_insert" ON kdl_agency_users
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "kdl_agency_users_update" ON kdl_agency_users
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "kdl_agency_users_delete" ON kdl_agency_users
  FOR DELETE USING (auth.role() = 'service_role');

-- kdl_feedbacks
ALTER TABLE kdl_feedbacks ENABLE ROW LEVEL SECURITY;

-- 代理店は自分が作成したフィードバックを閲覧・編集可能
-- ユーザーは自分の書籍へのフィードバックを閲覧可能
CREATE POLICY "kdl_feedbacks_select" ON kdl_feedbacks
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR
    -- 自分が作成したフィードバック
    auth.uid() = agency_user_id
    OR
    -- 自分の書籍へのフィードバック
    book_id IN (SELECT id FROM kdl_books WHERE user_id = auth.uid())
  );

CREATE POLICY "kdl_feedbacks_insert" ON kdl_feedbacks
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role'
    OR
    -- 代理店は担当ユーザーの書籍にフィードバック可能
    book_id IN (
      SELECT kb.id FROM kdl_books kb
      JOIN kdl_agency_users kau ON kb.user_id = kau.user_id
      JOIN kdl_agencies ka ON kau.agency_id = ka.id
      WHERE ka.user_id = auth.uid()
    )
  );

CREATE POLICY "kdl_feedbacks_update" ON kdl_feedbacks
  FOR UPDATE USING (
    auth.role() = 'service_role'
    OR
    -- 自分が作成したフィードバック
    auth.uid() = agency_user_id
    OR
    -- ユーザーは自分の書籍へのフィードバックに返信可能
    (book_id IN (SELECT id FROM kdl_books WHERE user_id = auth.uid()))
  );

CREATE POLICY "kdl_feedbacks_delete" ON kdl_feedbacks
  FOR DELETE USING (
    auth.role() = 'service_role'
    OR
    auth.uid() = agency_user_id
  );

-- kdl_messages
ALTER TABLE kdl_messages ENABLE ROW LEVEL SECURITY;

-- メッセージは関係者のみ閲覧可能
CREATE POLICY "kdl_messages_select" ON kdl_messages
  FOR SELECT USING (
    auth.role() = 'service_role'
    OR
    auth.uid() = user_id
    OR
    agency_id IN (SELECT id FROM kdl_agencies WHERE user_id = auth.uid())
  );

CREATE POLICY "kdl_messages_insert" ON kdl_messages
  FOR INSERT WITH CHECK (
    auth.role() = 'service_role'
    OR
    -- 送信者は自分
    auth.uid() = sender_id
  );

CREATE POLICY "kdl_messages_update" ON kdl_messages
  FOR UPDATE USING (
    auth.role() = 'service_role'
    OR
    -- 受信者は既読フラグを更新可能
    (auth.uid() = user_id AND sender_type = 'agency')
    OR
    (agency_id IN (SELECT id FROM kdl_agencies WHERE user_id = auth.uid()) AND sender_type = 'user')
  );

-- ============================================
-- 6. ヘルパー関数
-- ============================================

-- 代理店が担当するユーザーの書籍進捗を取得
CREATE OR REPLACE FUNCTION get_agency_user_progress(p_agency_id UUID)
RETURNS TABLE (
  user_id UUID,
  user_email TEXT,
  total_books BIGINT,
  total_sections BIGINT,
  completed_sections BIGINT,
  progress_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id AS user_id,
    au.email AS user_email,
    COUNT(DISTINCT kb.id) AS total_books,
    COUNT(ks.id) AS total_sections,
    COUNT(ks.id) FILTER (WHERE LENGTH(COALESCE(ks.content, '')) >= 100) AS completed_sections,
    CASE 
      WHEN COUNT(ks.id) > 0 
      THEN ROUND(
        (COUNT(ks.id) FILTER (WHERE LENGTH(COALESCE(ks.content, '')) >= 100)::NUMERIC / COUNT(ks.id)::NUMERIC) * 100, 
        1
      )
      ELSE 0
    END AS progress_percentage
  FROM kdl_agency_users kau
  JOIN auth.users au ON kau.user_id = au.id
  LEFT JOIN kdl_books kb ON kb.user_id = au.id
  LEFT JOIN kdl_sections ks ON ks.book_id = kb.id
  WHERE kau.agency_id = p_agency_id
    AND kau.status = 'active'
  GROUP BY au.id, au.email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- 未読メッセージ数を取得
CREATE OR REPLACE FUNCTION get_unread_message_count(p_user_id UUID)
RETURNS BIGINT AS $$
DECLARE
  v_count BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM kdl_messages
  WHERE (user_id = p_user_id OR agency_id IN (SELECT id FROM kdl_agencies WHERE user_id = p_user_id))
    AND sender_id != p_user_id
    AND is_read = FALSE;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ============================================
-- 7. 更新日時自動更新トリガー
-- ============================================

CREATE OR REPLACE FUNCTION update_kdl_agency_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_kdl_agencies_updated_at
  BEFORE UPDATE ON kdl_agencies
  FOR EACH ROW
  EXECUTE FUNCTION update_kdl_agency_updated_at();

CREATE TRIGGER trigger_kdl_agency_users_updated_at
  BEFORE UPDATE ON kdl_agency_users
  FOR EACH ROW
  EXECUTE FUNCTION update_kdl_agency_updated_at();

CREATE TRIGGER trigger_kdl_feedbacks_updated_at
  BEFORE UPDATE ON kdl_feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION update_kdl_agency_updated_at();

-- ============================================
-- 完了
-- ============================================
-- 実行方法:
-- 1. Supabaseダッシュボードで SQL Editor を開く
-- 2. このファイルの内容をコピーして実行
-- ============================================
