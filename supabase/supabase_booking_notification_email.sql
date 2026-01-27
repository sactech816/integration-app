-- ===========================================
-- 予約システム: 通知先メールアドレス機能追加
-- ===========================================
-- 
-- このSQLをSupabaseのSQL Editorで実行してください。
-- 予約メニューに通知先メールアドレスを設定できるようにします。
--

-- -------------------------------------------
-- 1. booking_menusテーブルにnotification_emailカラムを追加
-- -------------------------------------------
ALTER TABLE public.booking_menus 
ADD COLUMN IF NOT EXISTS notification_email text;

-- コメント追加
COMMENT ON COLUMN public.booking_menus.notification_email IS '予約通知の送信先メールアドレス（未設定の場合はユーザーのメールアドレスを使用）';

-- -------------------------------------------
-- 完了メッセージ
-- -------------------------------------------
DO $$
BEGIN
  RAISE NOTICE '予約システムの通知メール機能が追加されました。';
  RAISE NOTICE 'booking_menusテーブルにnotification_emailカラムを追加しました。';
END $$;
