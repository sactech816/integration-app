-- 出欠回答にコメント欄を追加
ALTER TABLE attendance_responses ADD COLUMN IF NOT EXISTS comment TEXT;
COMMENT ON COLUMN attendance_responses.comment IS '参加者のコメント';
