-- =============================================
-- profiles テーブル nickname ユニーク制約追加
-- =============================================
-- 目的: カスタムURL（nickname）の重複を防止
-- 
-- 注意: 実行前に重複確認クエリを実行してください
-- =============================================

-- =============================================
-- 1. 重複確認クエリ（先に実行して確認）
-- =============================================
-- SELECT nickname, COUNT(*) 
-- FROM profiles 
-- WHERE nickname IS NOT NULL 
-- GROUP BY nickname 
-- HAVING COUNT(*) > 1;

-- =============================================
-- 2. ユニーク制約追加
-- =============================================
-- 部分インデックス: nickname が NULL でない場合のみユニーク制約を適用
-- これにより、nickname を設定しないプロフィールは複数作成可能

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_nickname_unique 
ON profiles(nickname) 
WHERE nickname IS NOT NULL;

-- =============================================
-- 確認用クエリ
-- =============================================
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'profiles' AND indexname LIKE '%nickname%';
