-- ===========================================
-- 予約システム: 編集キー機能追加
-- ===========================================
-- 
-- このSQLをSupabaseのSQL Editorで実行してください。
-- 非ログインユーザーが予約メニューを作成・編集できるようにするための変更
--

-- -------------------------------------------
-- 1. booking_menusテーブルに編集キーカラムを追加
-- -------------------------------------------

-- edit_keyカラムを追加（既存のテーブルに追加）
ALTER TABLE public.booking_menus 
  ADD COLUMN IF NOT EXISTS edit_key uuid DEFAULT gen_random_uuid() UNIQUE;

-- user_idをNULL許容に変更（非ログインユーザー対応）
ALTER TABLE public.booking_menus 
  ALTER COLUMN user_id DROP NOT NULL;

-- コメント追加
COMMENT ON COLUMN public.booking_menus.edit_key IS '編集キー（非ログインユーザー用の認証キー）';

-- 既存レコードに編集キーを追加（まだない場合）
UPDATE public.booking_menus 
SET edit_key = gen_random_uuid() 
WHERE edit_key IS NULL;

-- -------------------------------------------
-- 2. インデックス追加
-- -------------------------------------------

-- 編集キーでの検索を高速化
CREATE INDEX IF NOT EXISTS idx_booking_menus_edit_key ON public.booking_menus(edit_key);

-- -------------------------------------------
-- 3. RLSポリシーの更新
-- -------------------------------------------

-- 既存のポリシーを削除して再作成
DROP POLICY IF EXISTS "Users can manage own menus" ON public.booking_menus;
DROP POLICY IF EXISTS "Anyone can view active menus" ON public.booking_menus;

-- ログインユーザーは自分のメニューを全操作可能
CREATE POLICY "Users can manage own menus" ON public.booking_menus
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 誰でも予約メニューを作成可能（非ログインユーザー対応）
CREATE POLICY "Anyone can create menus" ON public.booking_menus
  FOR INSERT
  WITH CHECK (true);

-- 有効なメニューは誰でも閲覧可能
CREATE POLICY "Anyone can view active menus" ON public.booking_menus
  FOR SELECT
  USING (is_active = true);

-- 非ログインユーザーは編集キーで自分のメニューを閲覧可能
-- Note: このポリシーはアプリケーション側で編集キーを使った検証と組み合わせて使用
CREATE POLICY "Anyone can view own menus by edit key" ON public.booking_menus
  FOR SELECT
  USING (user_id IS NULL);

-- -------------------------------------------
-- 4. booking_slotsのRLSポリシー更新
-- -------------------------------------------

-- 既存のポリシーを削除して再作成
DROP POLICY IF EXISTS "Menu owners can manage slots" ON public.booking_slots;

-- メニュー所有者は全操作可能（ログインユーザーの場合）
CREATE POLICY "Menu owners can manage slots" ON public.booking_slots
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.booking_menus
      WHERE booking_menus.id = booking_slots.menu_id
      AND booking_menus.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.booking_menus
      WHERE booking_menus.id = booking_slots.menu_id
      AND booking_menus.user_id = auth.uid()
    )
  );

-- 誰でも枠を作成可能（非ログインユーザー対応、アプリ側で編集キー検証）
CREATE POLICY "Anyone can create slots" ON public.booking_slots
  FOR INSERT
  WITH CHECK (true);

-- 誰でも枠を更新・削除可能（非ログインユーザー対応、アプリ側で編集キー検証）
CREATE POLICY "Anyone can update slots" ON public.booking_slots
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete slots" ON public.booking_slots
  FOR DELETE
  USING (true);

-- -------------------------------------------
-- 5. 関数: 編集キーでメニューIDを検証
-- -------------------------------------------

-- 編集キーが有効かどうかを検証する関数（オプション）
CREATE OR REPLACE FUNCTION public.verify_booking_menu_edit_key(
  p_menu_id uuid,
  p_edit_key uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.booking_menus 
    WHERE id = p_menu_id 
    AND edit_key = p_edit_key
  );
END;
$$;

-- 関数へのアクセス権限
GRANT EXECUTE ON FUNCTION public.verify_booking_menu_edit_key(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_booking_menu_edit_key(uuid, uuid) TO anon;

-- -------------------------------------------
-- 完了メッセージ
-- -------------------------------------------
DO $$
BEGIN
  RAISE NOTICE '予約システムの編集キー機能セットアップが完了しました。';
  RAISE NOTICE '- booking_menusテーブルにedit_keyカラムを追加';
  RAISE NOTICE '- user_idをNULL許容に変更';
  RAISE NOTICE '- RLSポリシーを更新して非ログインユーザーに対応';
  RAISE NOTICE '- 編集キー検証関数を追加: verify_booking_menu_edit_key()';
END $$;
