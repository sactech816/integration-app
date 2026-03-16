-- ツール作成枠の都度購入商品を追加
-- 全ツール共通 ¥500 で1枠追加（管理画面から価格変更可能）
INSERT INTO feature_products (id, name, description, category, price, duration_type, is_active, sort_order)
VALUES (
  'tool_unlock',
  'ツール作成枠追加（1個）',
  '好きなツールの作成枠を1つ追加します',
  'general',
  500,
  'permanent',
  true,
  0
)
ON CONFLICT (id) DO NOTHING;
