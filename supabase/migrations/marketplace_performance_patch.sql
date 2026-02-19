-- =============================================
-- マーケットプレイス パフォーマンス改善パッチ
-- 既存DBに追加インデックス＋RPC関数を適用
-- =============================================

-- 複合インデックス（公開一覧のカテゴリ絞り込み用）
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_status_category
  ON marketplace_listings(status, category);

-- 出品者ダッシュボード用
CREATE INDEX IF NOT EXISTS idx_marketplace_listings_seller_status
  ON marketplace_listings(seller_id, status);

-- 注文一覧フィルタ用
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_buyer_status
  ON marketplace_orders(buyer_id, status);

CREATE INDEX IF NOT EXISTS idx_marketplace_orders_seller_status
  ON marketplace_orders(seller_id, status);

-- レビュー集計をDB側で行うRPC関数
CREATE OR REPLACE FUNCTION update_seller_review_stats(target_seller_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE marketplace_profiles
  SET
    avg_rating = COALESCE((
      SELECT ROUND(AVG(rating)::numeric, 1)
      FROM marketplace_reviews
      WHERE seller_id = target_seller_id
    ), 0),
    total_reviews = COALESCE((
      SELECT COUNT(*)
      FROM marketplace_reviews
      WHERE seller_id = target_seller_id
    ), 0)
  WHERE user_id = target_seller_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
