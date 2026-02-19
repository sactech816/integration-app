-- =============================================
-- スキルマッチング・マーケットプレイス
-- Phase 1: 直接やりとり型
-- =============================================

-- 1. クリエイタープロフィール
CREATE TABLE IF NOT EXISTS marketplace_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  skills TEXT[],
  portfolio_urls TEXT[],
  response_time TEXT,
  -- サポート可能ツール: ['quiz','profile','business','survey','booking','attendance','gamification','kindle']
  supported_tools TEXT[],
  -- Kindle詳細: ['kindle_writing','kindle_proofreading','kindle_cover','kindle_paperback','kindle_a_plus','kindle_marketing']
  kindle_subtypes TEXT[],
  -- Phase 2用（Stripe Connect）
  stripe_connect_id TEXT,
  -- 集計キャッシュ
  avg_rating DECIMAL(2,1) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  -- ステータス
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE marketplace_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_marketplace_profiles" ON marketplace_profiles
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Anyone authenticated can view active profiles" ON marketplace_profiles
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can insert own profile" ON marketplace_profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON marketplace_profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_marketplace_profiles_user_id ON marketplace_profiles(user_id);
CREATE INDEX idx_marketplace_profiles_is_active ON marketplace_profiles(is_active);
CREATE INDEX idx_marketplace_profiles_avg_rating ON marketplace_profiles(avg_rating DESC);

-- 2. サービス出品
CREATE TABLE IF NOT EXISTS marketplace_listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  is_tool_linked BOOLEAN DEFAULT false,
  linked_service_type TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  thumbnail_url TEXT,
  price_min INTEGER NOT NULL,
  price_max INTEGER,
  price_type TEXT NOT NULL DEFAULT 'fixed'
    CHECK (price_type IN ('fixed', 'range', 'negotiable')),
  delivery_days INTEGER,
  status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('draft', 'published', 'paused', 'archived')),
  order_count INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE marketplace_listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_marketplace_listings" ON marketplace_listings
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Anyone authenticated can view published listings" ON marketplace_listings
  FOR SELECT TO authenticated
  USING (status = 'published');

CREATE POLICY "Sellers can view own listings" ON marketplace_listings
  FOR SELECT TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can insert own listings" ON marketplace_listings
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own listings" ON marketplace_listings
  FOR UPDATE TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete own listings" ON marketplace_listings
  FOR DELETE TO authenticated
  USING (auth.uid() = seller_id);

CREATE INDEX idx_marketplace_listings_seller_id ON marketplace_listings(seller_id);
CREATE INDEX idx_marketplace_listings_category ON marketplace_listings(category);
CREATE INDEX idx_marketplace_listings_status ON marketplace_listings(status);
CREATE INDEX idx_marketplace_listings_created_at ON marketplace_listings(created_at DESC);
CREATE INDEX idx_marketplace_listings_price_min ON marketplace_listings(price_min);
-- 複合インデックス（公開一覧のカテゴリ絞り込み用）
CREATE INDEX idx_marketplace_listings_status_category ON marketplace_listings(status, category);
-- 出品者ダッシュボード用
CREATE INDEX idx_marketplace_listings_seller_status ON marketplace_listings(seller_id, status);

-- 3. 依頼/案件
CREATE TABLE IF NOT EXISTS marketplace_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id UUID REFERENCES marketplace_listings(id) ON DELETE SET NULL,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  budget INTEGER,
  status TEXT NOT NULL DEFAULT 'requested'
    CHECK (status IN (
      'requested', 'accepted', 'in_progress',
      'delivered', 'completed', 'cancelled'
    )),
  -- Phase 2用（決済）
  payment_intent_id TEXT,
  payment_status TEXT DEFAULT 'none'
    CHECK (payment_status IN ('none', 'held', 'captured', 'refunded')),
  platform_fee INTEGER,
  seller_payout INTEGER,
  -- タイムスタンプ
  accepted_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE marketplace_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_marketplace_orders" ON marketplace_orders
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Buyers can view own orders" ON marketplace_orders
  FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view own orders" ON marketplace_orders
  FOR SELECT TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Buyers can insert orders" ON marketplace_orders
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers can update own orders" ON marketplace_orders
  FOR UPDATE TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update own orders" ON marketplace_orders
  FOR UPDATE TO authenticated
  USING (auth.uid() = seller_id);

CREATE INDEX idx_marketplace_orders_buyer_id ON marketplace_orders(buyer_id);
CREATE INDEX idx_marketplace_orders_seller_id ON marketplace_orders(seller_id);
CREATE INDEX idx_marketplace_orders_listing_id ON marketplace_orders(listing_id);
CREATE INDEX idx_marketplace_orders_status ON marketplace_orders(status);
CREATE INDEX idx_marketplace_orders_created_at ON marketplace_orders(created_at DESC);
-- 複合インデックス（注文一覧フィルタ用）
CREATE INDEX idx_marketplace_orders_buyer_status ON marketplace_orders(buyer_id, status);
CREATE INDEX idx_marketplace_orders_seller_status ON marketplace_orders(seller_id, status);

-- 4. 案件内メッセージ
CREATE TABLE IF NOT EXISTS marketplace_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('buyer', 'seller')),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE marketplace_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_marketplace_messages" ON marketplace_messages
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Order participants can view messages" ON marketplace_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_orders
      WHERE marketplace_orders.id = marketplace_messages.order_id
      AND (marketplace_orders.buyer_id = auth.uid() OR marketplace_orders.seller_id = auth.uid())
    )
  );

CREATE POLICY "Order participants can send messages" ON marketplace_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM marketplace_orders
      WHERE marketplace_orders.id = order_id
      AND (marketplace_orders.buyer_id = auth.uid() OR marketplace_orders.seller_id = auth.uid())
    )
  );

CREATE POLICY "Recipients can mark messages as read" ON marketplace_messages
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM marketplace_orders
      WHERE marketplace_orders.id = marketplace_messages.order_id
      AND (marketplace_orders.buyer_id = auth.uid() OR marketplace_orders.seller_id = auth.uid())
    )
  );

CREATE INDEX idx_marketplace_messages_order_id ON marketplace_messages(order_id);
CREATE INDEX idx_marketplace_messages_sender_id ON marketplace_messages(sender_id);
CREATE INDEX idx_marketplace_messages_created_at ON marketplace_messages(created_at);
CREATE INDEX idx_marketplace_messages_is_read ON marketplace_messages(is_read);

-- 5. レビュー
CREATE TABLE IF NOT EXISTS marketplace_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES marketplace_orders(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(order_id, reviewer_id)
);

ALTER TABLE marketplace_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_marketplace_reviews" ON marketplace_reviews
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Anyone authenticated can view reviews" ON marketplace_reviews
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Buyers can insert reviews for completed orders" ON marketplace_reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id
    AND EXISTS (
      SELECT 1 FROM marketplace_orders
      WHERE marketplace_orders.id = order_id
      AND marketplace_orders.buyer_id = auth.uid()
      AND marketplace_orders.status = 'completed'
    )
  );

CREATE INDEX idx_marketplace_reviews_seller_id ON marketplace_reviews(seller_id);
CREATE INDEX idx_marketplace_reviews_order_id ON marketplace_reviews(order_id);
CREATE INDEX idx_marketplace_reviews_rating ON marketplace_reviews(rating);
CREATE INDEX idx_marketplace_reviews_created_at ON marketplace_reviews(created_at DESC);

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
