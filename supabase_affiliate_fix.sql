-- =====================================================
-- アフィリエイト機能 修正SQL
-- =====================================================
-- register_affiliate関数のカラム参照曖昧エラーを修正
-- =====================================================

-- 既存の関数を削除
DROP FUNCTION IF EXISTS register_affiliate(UUID, TEXT);

-- アフィリエイター登録関数（修正版）
CREATE OR REPLACE FUNCTION register_affiliate(p_user_id UUID, p_display_name TEXT DEFAULT NULL)
RETURNS TABLE(
  out_affiliate_id UUID,
  out_referral_code TEXT,
  out_status TEXT
) AS $$
DECLARE
  v_code TEXT;
  v_affiliate_id UUID;
  v_status TEXT;
  v_attempts INT := 0;
BEGIN
  -- 既に登録済みかチェック
  SELECT a.id, a.referral_code, a.status 
  INTO v_affiliate_id, v_code, v_status
  FROM affiliates a
  WHERE a.user_id = p_user_id;
  
  IF v_affiliate_id IS NOT NULL THEN
    out_affiliate_id := v_affiliate_id;
    out_referral_code := v_code;
    out_status := v_status;
    RETURN NEXT;
    RETURN;
  END IF;
  
  -- ユニークなコードを生成
  LOOP
    v_code := generate_referral_code();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM affiliates af WHERE af.referral_code = v_code);
    v_attempts := v_attempts + 1;
    IF v_attempts > 10 THEN
      RAISE EXCEPTION 'Failed to generate unique referral code';
    END IF;
  END LOOP;
  
  -- 登録
  INSERT INTO affiliates (user_id, referral_code, display_name, status)
  VALUES (p_user_id, v_code, p_display_name, 'active')
  RETURNING id INTO v_affiliate_id;
  
  out_affiliate_id := v_affiliate_id;
  out_referral_code := v_code;
  out_status := 'active';
  RETURN NEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- コメント
COMMENT ON FUNCTION register_affiliate IS 'アフィリエイター登録（紹介コード自動発行）- 修正版';

