-- =============================================
-- データクリーンアップ設定テーブル
-- ゲスト/フリープランのデータを定期削除する機能
-- 管理者ダッシュボードから制御可能
-- 作成日: 2026-01-26
-- =============================================

-- =============================================
-- 1. admin_cleanup_settings テーブル
-- =============================================
CREATE TABLE IF NOT EXISTS admin_cleanup_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 機能ON/OFF
  is_enabled BOOLEAN DEFAULT false,           -- クリーンアップ機能の有効/無効
  
  -- プラン別保持期間（日数、-1 = 無期限）
  guest_retention_days INTEGER DEFAULT 30,    -- ゲスト: 30日
  free_retention_days INTEGER DEFAULT 90,     -- フリー: 90日
  pro_retention_days INTEGER DEFAULT -1,      -- プロ: 無期限（削除しない）
  
  -- 対象テーブル設定
  cleanup_quizzes BOOLEAN DEFAULT true,
  cleanup_profiles BOOLEAN DEFAULT true,
  cleanup_business_projects BOOLEAN DEFAULT true,
  cleanup_surveys BOOLEAN DEFAULT true,
  cleanup_booking_menus BOOLEAN DEFAULT true,
  
  -- 実行設定
  run_time TEXT DEFAULT '03:00',              -- 実行時刻（JST）
  dry_run_mode BOOLEAN DEFAULT true,          -- テストモード（削除せずログのみ）
  
  -- 通知設定
  notify_before_delete BOOLEAN DEFAULT false, -- 削除前にユーザーに通知
  notify_days_before INTEGER DEFAULT 7,       -- 何日前に通知するか
  
  -- メタデータ
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- コメント追加
COMMENT ON TABLE admin_cleanup_settings IS '管理者用データクリーンアップ設定テーブル';
COMMENT ON COLUMN admin_cleanup_settings.is_enabled IS 'クリーンアップ機能の有効/無効';
COMMENT ON COLUMN admin_cleanup_settings.guest_retention_days IS 'ゲストデータの保持期間（日数）。-1は無期限';
COMMENT ON COLUMN admin_cleanup_settings.free_retention_days IS 'フリープランデータの保持期間（日数）。-1は無期限';
COMMENT ON COLUMN admin_cleanup_settings.dry_run_mode IS 'trueの場合、削除せずログのみ記録';

-- =============================================
-- 2. cleanup_logs テーブル（削除ログ）
-- =============================================
CREATE TABLE IF NOT EXISTS cleanup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 実行情報
  executed_at TIMESTAMPTZ DEFAULT NOW(),
  is_dry_run BOOLEAN DEFAULT false,
  executed_by UUID REFERENCES auth.users(id),  -- 手動実行の場合
  
  -- 削除統計
  total_deleted INTEGER DEFAULT 0,
  quizzes_deleted INTEGER DEFAULT 0,
  profiles_deleted INTEGER DEFAULT 0,
  business_projects_deleted INTEGER DEFAULT 0,
  surveys_deleted INTEGER DEFAULT 0,
  booking_menus_deleted INTEGER DEFAULT 0,
  
  -- 詳細ログ（JSONB）
  details JSONB DEFAULT '[]',
  
  -- エラー情報
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_cleanup_logs_executed_at ON cleanup_logs(executed_at DESC);

COMMENT ON TABLE cleanup_logs IS 'クリーンアップ実行ログ';

-- =============================================
-- 3. cleanup_exclusions テーブル（除外リスト）
-- =============================================
CREATE TABLE IF NOT EXISTS cleanup_exclusions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- 除外対象
  table_name TEXT NOT NULL,                   -- 'quizzes', 'profiles', etc.
  record_id TEXT NOT NULL,                    -- 対象レコードのID
  
  -- 除外理由
  reason TEXT,
  
  -- メタデータ
  excluded_by UUID REFERENCES auth.users(id),
  excluded_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(table_name, record_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_cleanup_exclusions_table ON cleanup_exclusions(table_name);

COMMENT ON TABLE cleanup_exclusions IS 'クリーンアップ除外リスト';

-- =============================================
-- 4. RLS (Row Level Security) の有効化
-- =============================================
ALTER TABLE admin_cleanup_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleanup_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleanup_exclusions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 5. RLSポリシー（サービスロール経由でのみアクセス可能）
-- ※ APIルートでSUPABASE_SERVICE_ROLE_KEYを使用するため、
--    RLSはバイパスされます。一般ユーザーからの直接アクセスを防ぐため、
--    falseを設定してブロックします。
-- =============================================

-- admin_cleanup_settings
DROP POLICY IF EXISTS "Admins can view cleanup settings" ON admin_cleanup_settings;
DROP POLICY IF EXISTS "Admins can manage cleanup settings" ON admin_cleanup_settings;
DROP POLICY IF EXISTS "Service role only for cleanup settings" ON admin_cleanup_settings;

-- サービスロール以外はアクセス不可（APIルート経由でのみアクセス）
CREATE POLICY "Service role only for cleanup settings" ON admin_cleanup_settings
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- cleanup_logs
DROP POLICY IF EXISTS "Admins can view cleanup logs" ON cleanup_logs;
DROP POLICY IF EXISTS "Admins can manage cleanup logs" ON cleanup_logs;
DROP POLICY IF EXISTS "Service role only for cleanup logs" ON cleanup_logs;

CREATE POLICY "Service role only for cleanup logs" ON cleanup_logs
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- cleanup_exclusions
DROP POLICY IF EXISTS "Admins can view cleanup exclusions" ON cleanup_exclusions;
DROP POLICY IF EXISTS "Admins can manage cleanup exclusions" ON cleanup_exclusions;
DROP POLICY IF EXISTS "Service role only for cleanup exclusions" ON cleanup_exclusions;

CREATE POLICY "Service role only for cleanup exclusions" ON cleanup_exclusions
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- =============================================
-- 6. 初期データ挿入
-- =============================================
INSERT INTO admin_cleanup_settings (
  is_enabled,
  guest_retention_days,
  free_retention_days,
  pro_retention_days,
  dry_run_mode
) VALUES (
  false,  -- デフォルトは無効
  30,     -- ゲスト: 30日
  90,     -- フリー: 90日
  -1,     -- プロ: 無期限
  true    -- ドライランモード有効
)
ON CONFLICT DO NOTHING;

-- =============================================
-- 7. 各テーブルに last_accessed_at カラムを追加
-- =============================================

-- quizzes
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quizzes' AND column_name = 'last_accessed_at'
  ) THEN
    ALTER TABLE quizzes ADD COLUMN last_accessed_at TIMESTAMPTZ DEFAULT NOW();
    CREATE INDEX IF NOT EXISTS idx_quizzes_last_accessed ON quizzes(last_accessed_at);
  END IF;
END $$;

-- profiles
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_accessed_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_accessed_at TIMESTAMPTZ DEFAULT NOW();
    CREATE INDEX IF NOT EXISTS idx_profiles_last_accessed ON profiles(last_accessed_at);
  END IF;
END $$;

-- business_projects
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'business_projects' AND column_name = 'last_accessed_at'
  ) THEN
    ALTER TABLE business_projects ADD COLUMN last_accessed_at TIMESTAMPTZ DEFAULT NOW();
    CREATE INDEX IF NOT EXISTS idx_business_projects_last_accessed ON business_projects(last_accessed_at);
  END IF;
END $$;

-- surveys
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'surveys' AND column_name = 'last_accessed_at'
  ) THEN
    ALTER TABLE surveys ADD COLUMN last_accessed_at TIMESTAMPTZ DEFAULT NOW();
    CREATE INDEX IF NOT EXISTS idx_surveys_last_accessed ON surveys(last_accessed_at);
  END IF;
END $$;

-- booking_menus
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'booking_menus' AND column_name = 'last_accessed_at'
  ) THEN
    ALTER TABLE booking_menus ADD COLUMN last_accessed_at TIMESTAMPTZ DEFAULT NOW();
    CREATE INDEX IF NOT EXISTS idx_booking_menus_last_accessed ON booking_menus(last_accessed_at);
  END IF;
END $$;

-- =============================================
-- 8. 削除対象プレビュー関数
-- =============================================
CREATE OR REPLACE FUNCTION preview_cleanup_targets()
RETURNS TABLE (
  table_name TEXT,
  record_id TEXT,
  slug TEXT,
  title TEXT,
  user_plan TEXT,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  days_inactive INTEGER
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  settings RECORD;
BEGIN
  -- 設定を取得
  SELECT * INTO settings FROM admin_cleanup_settings LIMIT 1;
  
  -- 設定がない場合はデフォルト値を使用
  IF settings IS NULL THEN
    settings.guest_retention_days := 30;
    settings.free_retention_days := 90;
    settings.cleanup_quizzes := true;
    settings.cleanup_profiles := true;
    settings.cleanup_business_projects := true;
    settings.cleanup_surveys := true;
    settings.cleanup_booking_menus := true;
  END IF;
  
  -- ゲストデータ（user_id IS NULL）- quizzes
  IF settings.cleanup_quizzes AND settings.guest_retention_days > 0 THEN
    RETURN QUERY
    SELECT 
      'quizzes'::TEXT,
      q.id::TEXT,
      q.slug::TEXT,
      q.title::TEXT,
      'guest'::TEXT,
      COALESCE(q.last_accessed_at, q.updated_at),
      q.created_at,
      EXTRACT(DAY FROM NOW() - COALESCE(q.last_accessed_at, q.updated_at))::INTEGER
    FROM quizzes q
    WHERE q.user_id IS NULL
      AND COALESCE(q.last_accessed_at, q.updated_at) < NOW() - (settings.guest_retention_days || ' days')::INTERVAL
      AND NOT EXISTS (
        SELECT 1 FROM cleanup_exclusions ce 
        WHERE ce.table_name = 'quizzes' AND ce.record_id = q.id::TEXT
      );
  END IF;
  
  -- ゲストデータ - profiles
  IF settings.cleanup_profiles AND settings.guest_retention_days > 0 THEN
    RETURN QUERY
    SELECT 
      'profiles'::TEXT,
      p.id::TEXT,
      p.slug::TEXT,
      p.name::TEXT,
      'guest'::TEXT,
      COALESCE(p.last_accessed_at, p.updated_at),
      p.created_at,
      EXTRACT(DAY FROM NOW() - COALESCE(p.last_accessed_at, p.updated_at))::INTEGER
    FROM profiles p
    WHERE p.user_id IS NULL
      AND COALESCE(p.last_accessed_at, p.updated_at) < NOW() - (settings.guest_retention_days || ' days')::INTERVAL
      AND NOT EXISTS (
        SELECT 1 FROM cleanup_exclusions ce 
        WHERE ce.table_name = 'profiles' AND ce.record_id = p.id::TEXT
      );
  END IF;
  
  -- ゲストデータ - business_projects
  IF settings.cleanup_business_projects AND settings.guest_retention_days > 0 THEN
    RETURN QUERY
    SELECT 
      'business_projects'::TEXT,
      bp.id::TEXT,
      bp.slug::TEXT,
      bp.company_name::TEXT,
      'guest'::TEXT,
      COALESCE(bp.last_accessed_at, bp.updated_at),
      bp.created_at,
      EXTRACT(DAY FROM NOW() - COALESCE(bp.last_accessed_at, bp.updated_at))::INTEGER
    FROM business_projects bp
    WHERE bp.user_id IS NULL
      AND COALESCE(bp.last_accessed_at, bp.updated_at) < NOW() - (settings.guest_retention_days || ' days')::INTERVAL
      AND NOT EXISTS (
        SELECT 1 FROM cleanup_exclusions ce 
        WHERE ce.table_name = 'business_projects' AND ce.record_id = bp.id::TEXT
      );
  END IF;
  
  -- ゲストデータ - surveys
  IF settings.cleanup_surveys AND settings.guest_retention_days > 0 THEN
    RETURN QUERY
    SELECT 
      'surveys'::TEXT,
      s.id::TEXT,
      s.slug::TEXT,
      s.title::TEXT,
      'guest'::TEXT,
      COALESCE(s.last_accessed_at, s.updated_at),
      s.created_at,
      EXTRACT(DAY FROM NOW() - COALESCE(s.last_accessed_at, s.updated_at))::INTEGER
    FROM surveys s
    WHERE s.user_id IS NULL
      AND COALESCE(s.last_accessed_at, s.updated_at) < NOW() - (settings.guest_retention_days || ' days')::INTERVAL
      AND NOT EXISTS (
        SELECT 1 FROM cleanup_exclusions ce 
        WHERE ce.table_name = 'surveys' AND ce.record_id = s.id::TEXT
      );
  END IF;
  
  -- ゲストデータ - booking_menus
  IF settings.cleanup_booking_menus AND settings.guest_retention_days > 0 THEN
    RETURN QUERY
    SELECT 
      'booking_menus'::TEXT,
      bm.id::TEXT,
      bm.slug::TEXT,
      bm.title::TEXT,
      'guest'::TEXT,
      COALESCE(bm.last_accessed_at, bm.updated_at),
      bm.created_at,
      EXTRACT(DAY FROM NOW() - COALESCE(bm.last_accessed_at, bm.updated_at))::INTEGER
    FROM booking_menus bm
    WHERE bm.user_id IS NULL
      AND COALESCE(bm.last_accessed_at, bm.updated_at) < NOW() - (settings.guest_retention_days || ' days')::INTERVAL
      AND NOT EXISTS (
        SELECT 1 FROM cleanup_exclusions ce 
        WHERE ce.table_name = 'booking_menus' AND ce.record_id = bm.id::TEXT
      );
  END IF;
  
  -- フリープランユーザーのデータ（サブスクリプションなしのログインユーザー）
  -- ※ フリープランの判定は subscriptions テーブルを参照
  IF settings.free_retention_days > 0 THEN
    -- quizzes
    IF settings.cleanup_quizzes THEN
      RETURN QUERY
      SELECT 
        'quizzes'::TEXT,
        q.id::TEXT,
        q.slug::TEXT,
        q.title::TEXT,
        'free'::TEXT,
        COALESCE(q.last_accessed_at, q.updated_at),
        q.created_at,
        EXTRACT(DAY FROM NOW() - COALESCE(q.last_accessed_at, q.updated_at))::INTEGER
      FROM quizzes q
      WHERE q.user_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM subscriptions sub 
          WHERE sub.user_id = q.user_id 
          AND sub.status = 'active'
        )
        AND COALESCE(q.last_accessed_at, q.updated_at) < NOW() - (settings.free_retention_days || ' days')::INTERVAL
        AND NOT EXISTS (
          SELECT 1 FROM cleanup_exclusions ce 
          WHERE ce.table_name = 'quizzes' AND ce.record_id = q.id::TEXT
        );
    END IF;
    
    -- profiles
    IF settings.cleanup_profiles THEN
      RETURN QUERY
      SELECT 
        'profiles'::TEXT,
        p.id::TEXT,
        p.slug::TEXT,
        p.name::TEXT,
        'free'::TEXT,
        COALESCE(p.last_accessed_at, p.updated_at),
        p.created_at,
        EXTRACT(DAY FROM NOW() - COALESCE(p.last_accessed_at, p.updated_at))::INTEGER
      FROM profiles p
      WHERE p.user_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM subscriptions sub 
          WHERE sub.user_id = p.user_id 
          AND sub.status = 'active'
        )
        AND COALESCE(p.last_accessed_at, p.updated_at) < NOW() - (settings.free_retention_days || ' days')::INTERVAL
        AND NOT EXISTS (
          SELECT 1 FROM cleanup_exclusions ce 
          WHERE ce.table_name = 'profiles' AND ce.record_id = p.id::TEXT
        );
    END IF;
    
    -- business_projects
    IF settings.cleanup_business_projects THEN
      RETURN QUERY
      SELECT 
        'business_projects'::TEXT,
        bp.id::TEXT,
        bp.slug::TEXT,
        bp.company_name::TEXT,
        'free'::TEXT,
        COALESCE(bp.last_accessed_at, bp.updated_at),
        bp.created_at,
        EXTRACT(DAY FROM NOW() - COALESCE(bp.last_accessed_at, bp.updated_at))::INTEGER
      FROM business_projects bp
      WHERE bp.user_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM subscriptions sub 
          WHERE sub.user_id = bp.user_id 
          AND sub.status = 'active'
        )
        AND COALESCE(bp.last_accessed_at, bp.updated_at) < NOW() - (settings.free_retention_days || ' days')::INTERVAL
        AND NOT EXISTS (
          SELECT 1 FROM cleanup_exclusions ce 
          WHERE ce.table_name = 'business_projects' AND ce.record_id = bp.id::TEXT
        );
    END IF;
    
    -- surveys
    IF settings.cleanup_surveys THEN
      RETURN QUERY
      SELECT 
        'surveys'::TEXT,
        s.id::TEXT,
        s.slug::TEXT,
        s.title::TEXT,
        'free'::TEXT,
        COALESCE(s.last_accessed_at, s.updated_at),
        s.created_at,
        EXTRACT(DAY FROM NOW() - COALESCE(s.last_accessed_at, s.updated_at))::INTEGER
      FROM surveys s
      WHERE s.user_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM subscriptions sub 
          WHERE sub.user_id = s.user_id 
          AND sub.status = 'active'
        )
        AND COALESCE(s.last_accessed_at, s.updated_at) < NOW() - (settings.free_retention_days || ' days')::INTERVAL
        AND NOT EXISTS (
          SELECT 1 FROM cleanup_exclusions ce 
          WHERE ce.table_name = 'surveys' AND ce.record_id = s.id::TEXT
        );
    END IF;
    
    -- booking_menus
    IF settings.cleanup_booking_menus THEN
      RETURN QUERY
      SELECT 
        'booking_menus'::TEXT,
        bm.id::TEXT,
        bm.slug::TEXT,
        bm.title::TEXT,
        'free'::TEXT,
        COALESCE(bm.last_accessed_at, bm.updated_at),
        bm.created_at,
        EXTRACT(DAY FROM NOW() - COALESCE(bm.last_accessed_at, bm.updated_at))::INTEGER
      FROM booking_menus bm
      WHERE bm.user_id IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM subscriptions sub 
          WHERE sub.user_id = bm.user_id 
          AND sub.status = 'active'
        )
        AND COALESCE(bm.last_accessed_at, bm.updated_at) < NOW() - (settings.free_retention_days || ' days')::INTERVAL
        AND NOT EXISTS (
          SELECT 1 FROM cleanup_exclusions ce 
          WHERE ce.table_name = 'booking_menus' AND ce.record_id = bm.id::TEXT
        );
    END IF;
  END IF;
  
  RETURN;
END;
$$;

-- =============================================
-- 9. クリーンアップ実行関数
-- =============================================
CREATE OR REPLACE FUNCTION execute_cleanup(
  p_dry_run BOOLEAN DEFAULT true,
  p_executed_by UUID DEFAULT NULL
)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE
  settings RECORD;
  log_id UUID;
  deleted_counts RECORD;
  details JSONB := '[]'::JSONB;
  target RECORD;
BEGIN
  -- 設定を取得
  SELECT * INTO settings FROM admin_cleanup_settings LIMIT 1;
  
  -- 設定がない場合はエラー
  IF settings IS NULL THEN
    RAISE EXCEPTION 'クリーンアップ設定が見つかりません';
  END IF;
  
  -- 機能が無効の場合はスキップ
  IF NOT settings.is_enabled AND NOT p_dry_run THEN
    RAISE EXCEPTION 'クリーンアップ機能が無効です';
  END IF;
  
  -- ログIDを生成
  log_id := gen_random_uuid();
  
  -- 削除対象を取得してログに記録
  FOR target IN SELECT * FROM preview_cleanup_targets() LOOP
    details := details || jsonb_build_object(
      'table_name', target.table_name,
      'record_id', target.record_id,
      'slug', target.slug,
      'title', target.title,
      'user_plan', target.user_plan,
      'days_inactive', target.days_inactive
    );
  END LOOP;
  
  -- ドライランでない場合は実際に削除
  IF NOT p_dry_run THEN
    -- quizzes
    IF settings.cleanup_quizzes THEN
      DELETE FROM quizzes q
      WHERE (
        (q.user_id IS NULL AND settings.guest_retention_days > 0 
         AND COALESCE(q.last_accessed_at, q.updated_at) < NOW() - (settings.guest_retention_days || ' days')::INTERVAL)
        OR
        (q.user_id IS NOT NULL AND settings.free_retention_days > 0
         AND NOT EXISTS (SELECT 1 FROM subscriptions sub WHERE sub.user_id = q.user_id AND sub.status = 'active')
         AND COALESCE(q.last_accessed_at, q.updated_at) < NOW() - (settings.free_retention_days || ' days')::INTERVAL)
      )
      AND NOT EXISTS (
        SELECT 1 FROM cleanup_exclusions ce 
        WHERE ce.table_name = 'quizzes' AND ce.record_id = q.id::TEXT
      );
    END IF;
    
    -- profiles
    IF settings.cleanup_profiles THEN
      DELETE FROM profiles p
      WHERE (
        (p.user_id IS NULL AND settings.guest_retention_days > 0 
         AND COALESCE(p.last_accessed_at, p.updated_at) < NOW() - (settings.guest_retention_days || ' days')::INTERVAL)
        OR
        (p.user_id IS NOT NULL AND settings.free_retention_days > 0
         AND NOT EXISTS (SELECT 1 FROM subscriptions sub WHERE sub.user_id = p.user_id AND sub.status = 'active')
         AND COALESCE(p.last_accessed_at, p.updated_at) < NOW() - (settings.free_retention_days || ' days')::INTERVAL)
      )
      AND NOT EXISTS (
        SELECT 1 FROM cleanup_exclusions ce 
        WHERE ce.table_name = 'profiles' AND ce.record_id = p.id::TEXT
      );
    END IF;
    
    -- business_projects
    IF settings.cleanup_business_projects THEN
      DELETE FROM business_projects bp
      WHERE (
        (bp.user_id IS NULL AND settings.guest_retention_days > 0 
         AND COALESCE(bp.last_accessed_at, bp.updated_at) < NOW() - (settings.guest_retention_days || ' days')::INTERVAL)
        OR
        (bp.user_id IS NOT NULL AND settings.free_retention_days > 0
         AND NOT EXISTS (SELECT 1 FROM subscriptions sub WHERE sub.user_id = bp.user_id AND sub.status = 'active')
         AND COALESCE(bp.last_accessed_at, bp.updated_at) < NOW() - (settings.free_retention_days || ' days')::INTERVAL)
      )
      AND NOT EXISTS (
        SELECT 1 FROM cleanup_exclusions ce 
        WHERE ce.table_name = 'business_projects' AND ce.record_id = bp.id::TEXT
      );
    END IF;
    
    -- surveys
    IF settings.cleanup_surveys THEN
      DELETE FROM surveys s
      WHERE (
        (s.user_id IS NULL AND settings.guest_retention_days > 0 
         AND COALESCE(s.last_accessed_at, s.updated_at) < NOW() - (settings.guest_retention_days || ' days')::INTERVAL)
        OR
        (s.user_id IS NOT NULL AND settings.free_retention_days > 0
         AND NOT EXISTS (SELECT 1 FROM subscriptions sub WHERE sub.user_id = s.user_id AND sub.status = 'active')
         AND COALESCE(s.last_accessed_at, s.updated_at) < NOW() - (settings.free_retention_days || ' days')::INTERVAL)
      )
      AND NOT EXISTS (
        SELECT 1 FROM cleanup_exclusions ce 
        WHERE ce.table_name = 'surveys' AND ce.record_id = s.id::TEXT
      );
    END IF;
    
    -- booking_menus
    IF settings.cleanup_booking_menus THEN
      DELETE FROM booking_menus bm
      WHERE (
        (bm.user_id IS NULL AND settings.guest_retention_days > 0 
         AND COALESCE(bm.last_accessed_at, bm.updated_at) < NOW() - (settings.guest_retention_days || ' days')::INTERVAL)
        OR
        (bm.user_id IS NOT NULL AND settings.free_retention_days > 0
         AND NOT EXISTS (SELECT 1 FROM subscriptions sub WHERE sub.user_id = bm.user_id AND sub.status = 'active')
         AND COALESCE(bm.last_accessed_at, bm.updated_at) < NOW() - (settings.free_retention_days || ' days')::INTERVAL)
      )
      AND NOT EXISTS (
        SELECT 1 FROM cleanup_exclusions ce 
        WHERE ce.table_name = 'booking_menus' AND ce.record_id = bm.id::TEXT
      );
    END IF;
  END IF;
  
  -- ログを挿入
  INSERT INTO cleanup_logs (
    id,
    executed_at,
    is_dry_run,
    executed_by,
    total_deleted,
    details
  ) VALUES (
    log_id,
    NOW(),
    p_dry_run,
    p_executed_by,
    jsonb_array_length(details),
    details
  );
  
  RETURN log_id;
END;
$$;

-- =============================================
-- 10. updated_at 自動更新トリガー
-- =============================================
CREATE OR REPLACE FUNCTION update_cleanup_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_cleanup_settings_updated_at ON admin_cleanup_settings;
CREATE TRIGGER trigger_update_cleanup_settings_updated_at
  BEFORE UPDATE ON admin_cleanup_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_cleanup_settings_updated_at();

-- =============================================
-- マイグレーション完了
-- =============================================
