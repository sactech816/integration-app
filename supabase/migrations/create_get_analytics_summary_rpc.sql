-- =============================================
-- get_analytics_summary RPC関数
-- 複数コンテンツのアナリティクスを一括集計
-- =============================================

CREATE OR REPLACE FUNCTION get_analytics_summary(
  p_content_ids TEXT[],
  p_content_type TEXT
)
RETURNS TABLE (
  content_id TEXT,
  views BIGINT,
  clicks BIGINT,
  completions BIGINT,
  avg_scroll_depth NUMERIC,
  avg_time_spent NUMERIC,
  read_rate NUMERIC,
  click_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH event_counts AS (
    SELECT
      a.profile_id AS cid,
      COUNT(*) FILTER (WHERE a.event_type = 'view') AS view_count,
      COUNT(*) FILTER (WHERE a.event_type = 'click') AS click_count,
      COUNT(*) FILTER (WHERE a.event_type = 'completion') AS completion_count,
      COUNT(*) FILTER (WHERE a.event_type = 'read') AS read_count,
      AVG((a.event_data->>'scrollDepth')::NUMERIC) FILTER (
        WHERE a.event_type = 'scroll' AND (a.event_data->>'scrollDepth')::NUMERIC > 0
      ) AS avg_scroll,
      AVG((a.event_data->>'timeSpent')::NUMERIC) FILTER (
        WHERE a.event_type = 'time' AND (a.event_data->>'timeSpent')::NUMERIC > 0
      ) AS avg_time
    FROM public.analytics a
    WHERE a.profile_id = ANY(p_content_ids)
      AND a.content_type = p_content_type
    GROUP BY a.profile_id
  )
  SELECT
    ec.cid AS content_id,
    ec.view_count AS views,
    ec.click_count AS clicks,
    ec.completion_count AS completions,
    COALESCE(ROUND(ec.avg_scroll), 0) AS avg_scroll_depth,
    COALESCE(ROUND(ec.avg_time), 0) AS avg_time_spent,
    CASE WHEN ec.view_count > 0
      THEN ROUND((ec.read_count::NUMERIC / ec.view_count) * 100)
      ELSE 0
    END AS read_rate,
    CASE WHEN ec.view_count > 0
      THEN ROUND((ec.click_count::NUMERIC / ec.view_count) * 100)
      ELSE 0
    END AS click_rate
  FROM event_counts ec;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';
