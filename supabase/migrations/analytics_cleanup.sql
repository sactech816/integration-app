-- =============================================
-- アナリティクスデータのクリーンアップ
-- =============================================

-- 1. 孤立したプロフィールアナリティクスの削除
-- （profilesテーブルに存在しないprofile_idのデータを削除）
DELETE FROM analytics
WHERE content_type = 'profile'
AND profile_id NOT IN (SELECT id::text FROM profiles);

-- 2. 孤立したビジネスLPアナリティクスの削除
-- （business_projectsテーブルに存在しないslugのデータを削除）
DELETE FROM analytics
WHERE content_type = 'business'
AND profile_id NOT IN (SELECT slug FROM business_projects WHERE slug IS NOT NULL);

-- 3. 孤立したクイズアナリティクスの削除
-- （quizzesテーブルに存在しないslugのデータを削除）
DELETE FROM analytics
WHERE content_type = 'quiz'
AND profile_id NOT IN (SELECT slug FROM quizzes WHERE slug IS NOT NULL);

-- =============================================
-- 古いtimeイベントのクリーンアップ（任意）
-- 同一セッションの中間timeイベントを削除し、最終値のみ保持
-- =============================================

-- 注意: 以下のクエリは実行前に確認してください
-- 30日以上前の中間timeイベントを削除（最大値のみ保持）

-- WITH ranked_time_events AS (
--   SELECT 
--     id,
--     profile_id,
--     event_data->>'timeSpent' as time_spent,
--     created_at,
--     DATE_TRUNC('hour', created_at) as session_hour,
--     ROW_NUMBER() OVER (
--       PARTITION BY profile_id, DATE_TRUNC('hour', created_at)
--       ORDER BY (event_data->>'timeSpent')::int DESC
--     ) as rn
--   FROM analytics
--   WHERE event_type = 'time'
--   AND created_at < NOW() - INTERVAL '30 days'
-- )
-- DELETE FROM analytics
-- WHERE id IN (
--   SELECT id FROM ranked_time_events WHERE rn > 1
-- );

-- =============================================
-- クリーンアップ結果の確認
-- =============================================

-- 孤立データの件数確認（削除前に実行）
-- SELECT 
--   content_type,
--   COUNT(*) as orphan_count
-- FROM analytics
-- WHERE 
--   (content_type = 'profile' AND profile_id NOT IN (SELECT id::text FROM profiles))
--   OR (content_type = 'business' AND profile_id NOT IN (SELECT slug FROM business_lps))
--   OR (content_type = 'quiz' AND profile_id NOT IN (SELECT slug FROM quizzes WHERE slug IS NOT NULL))
-- GROUP BY content_type;

-- =============================================
-- 定期クリーンアップ用関数（オプション）
-- =============================================

CREATE OR REPLACE FUNCTION cleanup_orphan_analytics()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- プロフィール
  DELETE FROM analytics
  WHERE content_type = 'profile'
  AND profile_id NOT IN (SELECT id::text FROM profiles);
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;
  
  -- ビジネスLP
  DELETE FROM analytics
  WHERE content_type = 'business'
  AND profile_id NOT IN (SELECT slug FROM business_projects WHERE slug IS NOT NULL);
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;
  
  -- クイズ
  DELETE FROM analytics
  WHERE content_type = 'quiz'
  AND profile_id NOT IN (SELECT slug FROM quizzes WHERE slug IS NOT NULL);
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 使用例: SELECT cleanup_orphan_analytics();
