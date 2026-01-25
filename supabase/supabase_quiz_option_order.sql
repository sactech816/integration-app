-- 診断クイズに選択肢表示順設定を追加
-- 実行日: 2026-01-24

-- quizzesテーブルにoption_orderカラムを追加
ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS option_order TEXT DEFAULT 'random';

-- コメント追加
COMMENT ON COLUMN quizzes.option_order IS '選択肢の表示順: random(ランダム), asc(昇順), desc(降順)';

-- 既存データの更新（NULLの場合はrandomに設定）
UPDATE quizzes SET option_order = 'random' WHERE option_order IS NULL;
