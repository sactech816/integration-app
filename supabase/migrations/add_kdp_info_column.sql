-- kdl_booksテーブルにkdp_infoカラムを追加
-- KDP（Kindle Direct Publishing）登録情報を保存するためのJSONBカラム

ALTER TABLE kdl_books ADD COLUMN IF NOT EXISTS kdp_info JSONB;

-- コメント追加
COMMENT ON COLUMN kdl_books.kdp_info IS 'KDP登録情報（キーワード、紹介文、カテゴリー、キャッチコピー）をJSON形式で保存';

-- インデックスは不要（頻繁に検索されるカラムではない）
