-- ============================================
-- アーケード（ゲームセンター）サンプルキャンペーン作成
-- ============================================
-- このSQLを実行すると、/arcade ページで遊べるサンプルゲームが作成されます。
-- 射幸心をくすぐる設定: 10pt消費で最大500pt獲得のチャンス！

-- ============================================
-- 1. gacha_prizesテーブルにpoints_rewardカラムを追加（存在しない場合）
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gacha_prizes' AND column_name = 'points_reward'
  ) THEN
    ALTER TABLE gacha_prizes ADD COLUMN points_reward INTEGER DEFAULT 0;
    COMMENT ON COLUMN gacha_prizes.points_reward IS 'ポイント報酬（当選時に獲得できるポイント）';
  END IF;
END $$;

-- ============================================
-- 2. サンプルキャンペーン作成
-- ============================================

-- 既存のサンプルキャンペーンを削除（再実行時のため）
DELETE FROM gacha_prizes WHERE campaign_id IN (
  'arcade-sample-slot',
  'arcade-sample-scratch',
  'arcade-sample-fukubiki',
  'arcade-sample-gacha',
  'arcade-sample-login-bonus',
  'arcade-sample-stamp-rally'
);

DELETE FROM gamification_campaigns WHERE id IN (
  'arcade-sample-slot',
  'arcade-sample-scratch',
  'arcade-sample-fukubiki',
  'arcade-sample-gacha',
  'arcade-sample-login-bonus',
  'arcade-sample-stamp-rally'
);

-- ============================================
-- 2.1 スロットマシン（10pt消費 → 最大200pt獲得）
-- ============================================
INSERT INTO gamification_campaigns (id, owner_id, title, description, campaign_type, status, animation_type, settings, is_active)
VALUES (
  'arcade-sample-slot',
  NULL, -- システム所有
  '🎰 メガスロット',
  '絵柄を揃えて大当たり！10ptで最大200pt獲得のチャンス！',
  'slot',
  'active',
  'capsule',
  '{"cost_per_play": 10}',
  true
);

INSERT INTO gacha_prizes (campaign_id, name, description, probability, is_winning, display_order, points_reward) VALUES
('arcade-sample-slot', '🎰 ジャックポット', '777揃い！200pt獲得！', 2, true, 0, 200),
('arcade-sample-slot', '💎 ダイヤモンド', '100pt獲得！', 5, true, 1, 100),
('arcade-sample-slot', '⭐ スター', '50pt獲得！', 10, true, 2, 50),
('arcade-sample-slot', '🍒 チェリー', '20pt獲得！', 20, true, 3, 20),
('arcade-sample-slot', '❌ ハズレ', 'また挑戦してね！', 63, false, 4, 0);

-- ============================================
-- 2.2 スクラッチ（10pt消費 → 最大100pt獲得）
-- ============================================
INSERT INTO gamification_campaigns (id, owner_id, title, description, campaign_type, status, animation_type, settings, is_active)
VALUES (
  'arcade-sample-scratch',
  NULL,
  '🎫 ゴールドスクラッチ',
  '削って当たりを狙おう！10ptで最大100pt獲得！',
  'scratch',
  'active',
  'capsule',
  '{"cost_per_play": 10}',
  true
);

INSERT INTO gacha_prizes (campaign_id, name, description, probability, is_winning, display_order, points_reward) VALUES
('arcade-sample-scratch', '🥇 大当たり', '100pt獲得！', 3, true, 0, 100),
('arcade-sample-scratch', '🥈 中当たり', '50pt獲得！', 10, true, 1, 50),
('arcade-sample-scratch', '🥉 小当たり', '30pt獲得！', 20, true, 2, 30),
('arcade-sample-scratch', '💫 参加賞', '5pt獲得！', 17, false, 3, 5),
('arcade-sample-scratch', '❌ ハズレ', 'また挑戦してね！', 50, false, 4, 0);

-- ============================================
-- 2.3 福引（10pt消費 → 最大150pt獲得）
-- ============================================
INSERT INTO gamification_campaigns (id, owner_id, title, description, campaign_type, status, animation_type, settings, is_active)
VALUES (
  'arcade-sample-fukubiki',
  NULL,
  '🎊 お祭り福引',
  'ガラガラ回して抽選！金玉で150pt獲得！',
  'fukubiki',
  'active',
  'capsule',
  '{"cost_per_play": 10}',
  true
);

INSERT INTO gacha_prizes (campaign_id, name, description, probability, is_winning, display_order, points_reward) VALUES
('arcade-sample-fukubiki', '🟡 金玉（特賞）', '150pt獲得！', 2, true, 0, 150),
('arcade-sample-fukubiki', '🔴 赤玉（1等）', '80pt獲得！', 8, true, 1, 80),
('arcade-sample-fukubiki', '🔵 青玉（2等）', '40pt獲得！', 15, true, 2, 40),
('arcade-sample-fukubiki', '🟢 緑玉（3等）', '20pt獲得！', 25, true, 3, 20),
('arcade-sample-fukubiki', '⚪ 白玉（ハズレ）', 'また挑戦してね！', 50, false, 4, 0);

-- ============================================
-- 2.4 ガチャ（10pt消費 → 最大500pt獲得）
-- ============================================
INSERT INTO gamification_campaigns (id, owner_id, title, description, campaign_type, status, animation_type, settings, is_active)
VALUES (
  'arcade-sample-gacha',
  NULL,
  '✨ レジェンドガチャ',
  'SSR出現率1%！夢の500pt獲得を狙え！',
  'gacha',
  'active',
  'capsule',
  '{"cost_per_play": 10}',
  true
);

INSERT INTO gacha_prizes (campaign_id, name, description, probability, is_winning, display_order, points_reward) VALUES
('arcade-sample-gacha', '👑 SSR（超激レア）', '500pt獲得！', 1, true, 0, 500),
('arcade-sample-gacha', '💜 SR（激レア）', '100pt獲得！', 5, true, 1, 100),
('arcade-sample-gacha', '💙 R（レア）', '30pt獲得！', 15, true, 2, 30),
('arcade-sample-gacha', '💚 N（ノーマル）', '10pt獲得！', 30, false, 3, 10),
('arcade-sample-gacha', '⬜ C（コモン）', 'また挑戦してね！', 49, false, 4, 0);

-- ============================================
-- 2.5 ログインボーナス（無料 → 毎日10pt）
-- ============================================
INSERT INTO gamification_campaigns (id, owner_id, title, description, campaign_type, status, settings, is_active)
VALUES (
  'arcade-sample-login-bonus',
  NULL,
  '📅 デイリーボーナス',
  '毎日ログインで無料10ptゲット！毎日ログインしよう！',
  'login_bonus',
  'active',
  '{"points_per_day": 10}',
  true
);

-- ============================================
-- 2.6 スタンプラリー（準備中）
-- ============================================
INSERT INTO gamification_campaigns (id, owner_id, title, description, campaign_type, status, settings, is_active)
VALUES (
  'arcade-sample-stamp-rally',
  NULL,
  '🏃 スタンプラリー',
  'スタンプを集めてボーナスGET！',
  'stamp_rally',
  'active',
  '{"total_stamps": 10, "points_per_stamp": 5, "completion_bonus": 100}',
  false -- 準備中のため無効
);

-- ============================================
-- 3. サンプルクイズ作成（ポイントクイズ用）
-- ============================================
-- 既存のサンプルクイズを削除
DELETE FROM quizzes WHERE slug = 'arcade-sample-quiz';

-- サンプルクイズを作成
INSERT INTO quizzes (slug, title, description, mode, questions, creator_email, show_in_portal)
VALUES (
  'arcade-sample-quiz',
  '🧠 ポイントGETクイズ',
  '問題に正解してポイントを稼ごう！全問正解で50pt獲得！',
  'test',
  '[
    {
      "id": "q1",
      "text": "日本で一番高い山は？",
      "options": [
        {"id": "a1", "text": "富士山", "score": 10},
        {"id": "a2", "text": "北岳", "score": 0},
        {"id": "a3", "text": "奥穂高岳", "score": 0},
        {"id": "a4", "text": "槍ヶ岳", "score": 0}
      ]
    },
    {
      "id": "q2",
      "text": "1+1は？",
      "options": [
        {"id": "a1", "text": "2", "score": 10},
        {"id": "a2", "text": "11", "score": 0},
        {"id": "a3", "text": "3", "score": 0},
        {"id": "a4", "text": "1", "score": 0}
      ]
    },
    {
      "id": "q3",
      "text": "地球の衛星は？",
      "options": [
        {"id": "a1", "text": "月", "score": 10},
        {"id": "a2", "text": "太陽", "score": 0},
        {"id": "a3", "text": "火星", "score": 0},
        {"id": "a4", "text": "木星", "score": 0}
      ]
    },
    {
      "id": "q4",
      "text": "虹は何色？",
      "options": [
        {"id": "a1", "text": "7色", "score": 10},
        {"id": "a2", "text": "5色", "score": 0},
        {"id": "a3", "text": "3色", "score": 0},
        {"id": "a4", "text": "10色", "score": 0}
      ]
    },
    {
      "id": "q5",
      "text": "水の化学式は？",
      "options": [
        {"id": "a1", "text": "H2O", "score": 10},
        {"id": "a2", "text": "CO2", "score": 0},
        {"id": "a3", "text": "O2", "score": 0},
        {"id": "a4", "text": "NaCl", "score": 0}
      ]
    }
  ]'::jsonb,
  'system@arcade.local',
  true
);

-- ============================================
-- 4. 完了メッセージ
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'アーケードサンプルキャンペーンを作成しました！';
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE '🎰 スロット: 10pt → 最大200pt';
  RAISE NOTICE '🎫 スクラッチ: 10pt → 最大100pt';
  RAISE NOTICE '🎊 福引: 10pt → 最大150pt';
  RAISE NOTICE '✨ ガチャ: 10pt → 最大500pt';
  RAISE NOTICE '📅 ログインボーナス: 無料 → 毎日10pt';
  RAISE NOTICE '🧠 ポイントクイズ: 正解で10pt × 5問';
  RAISE NOTICE '========================================';
END $$;

