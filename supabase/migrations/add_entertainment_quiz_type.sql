-- エンタメ診断メーカー用のカラム追加
-- quiz_type: ビジネス診断とエンタメ診断を区別
-- share_count: SNSシェア回数トラッキング
-- entertainment_meta: エンタメ固有データ（結果画像URL、シェアテンプレ等）

ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS quiz_type TEXT NOT NULL DEFAULT 'business';
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS share_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS entertainment_meta JSONB;

CREATE INDEX IF NOT EXISTS idx_quizzes_quiz_type ON quizzes(quiz_type);

-- シェア数インクリメント用RPC
CREATE OR REPLACE FUNCTION increment_shares(row_id BIGINT)
RETURNS VOID AS $$
BEGIN
  UPDATE quizzes SET share_count = share_count + 1 WHERE id = row_id;
END;
$$ LANGUAGE plpgsql;
