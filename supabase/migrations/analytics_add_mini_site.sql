-- =============================================
-- analytics テーブルの content_type CHECK制約を更新
-- site を追加
-- =============================================

ALTER TABLE analytics DROP CONSTRAINT IF EXISTS analytics_content_type_check;

ALTER TABLE analytics ADD CONSTRAINT analytics_content_type_check
  CHECK (content_type IN (
    'quiz',
    'entertainment_quiz',
    'profile',
    'business',
    'salesletter',
    'survey',
    'gamification',
    'attendance',
    'booking',
    'onboarding',
    'thumbnail',
    'newsletter',
    'step-email',
    'order-form',
    'funnel',
    'webinar',
    'sns-post',
    'line',
    'site'
  ));
