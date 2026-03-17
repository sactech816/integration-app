-- フッター非表示 / 関連コンテンツ非表示の単品購入商品を追加
-- 各 ¥500 でコンテンツ1件ごとに永久適用

INSERT INTO feature_products (id, name, description, category, price, duration_type, is_active, sort_order)
VALUES
  (
    'footer_hide',
    'フッター非表示（1件・永久）',
    '特定コンテンツの「○○メーカーで作成しました」フッターを永久に非表示',
    'display',
    500,
    'permanent',
    true,
    61
  ),
  (
    'related_content_hide',
    '関連コンテンツ非表示（1件・永久）',
    '特定コンテンツのページ下部「他の○○もチェック」セクションを永久に非表示',
    'display',
    500,
    'permanent',
    true,
    62
  )
ON CONFLICT (id) DO NOTHING;
