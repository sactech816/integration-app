-- ===========================================
-- 予約キャンセルトークン追加マイグレーション
-- ===========================================
-- 
-- このSQLをSupabaseのSQL Editorで実行してください。
-- 予約をトークンでキャンセルできるようにするためのカラム追加
--

-- cancel_tokenカラムを追加
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS cancel_token text;

-- インデックスを作成（トークンでの検索を高速化）
CREATE INDEX IF NOT EXISTS idx_bookings_cancel_token ON public.bookings(cancel_token);

-- コメント追加
COMMENT ON COLUMN public.bookings.cancel_token IS '予約キャンセル用のユニークトークン';

-- 完了メッセージ
DO $$
BEGIN
  RAISE NOTICE 'キャンセルトークンカラムの追加が完了しました。';
END $$;
