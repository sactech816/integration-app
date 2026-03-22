-- user_persona テーブルで persona_selected_at が NULL のままの既存レコードを修正
-- これにより、既存ユーザーに毎回ペルソナ選択モーダルが表示される問題を解消
UPDATE user_persona
SET persona_selected_at = COALESCE(updated_at, created_at, NOW())
WHERE persona_selected_at IS NULL;
