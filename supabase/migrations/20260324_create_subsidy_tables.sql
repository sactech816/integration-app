-- =============================================
-- 補助金診断・申請支援ツール テーブル作成
-- 作成日: 2026-03-24
-- =============================================

-- 補助金マスタデータテーブル
CREATE TABLE IF NOT EXISTS subsidy_master (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subsidy_key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  max_amount TEXT,
  subsidy_rate TEXT,
  eligibility_summary TEXT,
  application_period TEXT,
  official_url TEXT,
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  category TEXT,
  scoring_rules JSONB DEFAULT '{}'::jsonb,
  application_sections JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 補助金診断結果テーブル
CREATE TABLE IF NOT EXISTS subsidy_results (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 診断入力データ
  business_info JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- 診断結果
  matched_subsidies JSONB NOT NULL DEFAULT '[]'::jsonb,
  result_snapshot JSONB DEFAULT '{}'::jsonb,

  -- プレミアム（申請書AI作成）
  report_purchased BOOLEAN NOT NULL DEFAULT false,
  report_purchased_at TIMESTAMPTZ,
  report_content JSONB,
  report_generated_at TIMESTAMPTZ,
  selected_subsidy TEXT,

  -- メタデータ
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE subsidy_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE subsidy_master ENABLE ROW LEVEL SECURITY;

-- subsidy_results ポリシー
CREATE POLICY "Anyone can insert subsidy results"
  ON subsidy_results FOR INSERT WITH CHECK (true);
CREATE POLICY "Public subsidy results viewable"
  ON subsidy_results FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Owner can update subsidy results"
  ON subsidy_results FOR UPDATE
  USING (auth.uid() = user_id);

-- subsidy_master ポリシー（読み取りは全員可、書き込みはサービスロール）
CREATE POLICY "Anyone can read subsidy master"
  ON subsidy_master FOR SELECT USING (true);

-- インデックス
CREATE INDEX idx_subsidy_results_user_id ON subsidy_results(user_id);
CREATE INDEX idx_subsidy_master_active ON subsidy_master(is_active, sort_order);

-- =============================================
-- 初期マスタデータ投入
-- =============================================
INSERT INTO subsidy_master (subsidy_key, name, description, max_amount, subsidy_rate, eligibility_summary, application_period, official_url, difficulty, category, scoring_rules, application_sections, sort_order)
VALUES
(
  'it_hojo',
  'IT導入補助金',
  '中小企業・小規模事業者がITツール（ソフトウェア、サービス等）を導入する際の経費の一部を補助する制度。業務効率化や売上アップをITで実現したい事業者向け。',
  '450万円',
  '1/2〜2/3',
  '中小企業・小規模事業者（製造業300人以下、サービス業100人以下等）',
  '通年（複数回公募）',
  'https://it-shien.smrj.go.jp/',
  'easy',
  'it',
  '{"industry": {"all": 5}, "hasItPlan": {"true": 30, "false": 0}, "employeeCount": {"1-5": 10, "6-20": 10, "21-50": 8, "51-100": 5, "100+": 3}, "isSmallBusiness": {"true": 10, "false": 5}, "annualRevenue": {"〜1000万": 8, "1000万〜5000万": 10, "5000万〜1億": 8, "1億〜5億": 5, "5億以上": 3}}'::jsonb,
  '[{"key": "business_plan", "title": "事業計画概要", "description": "現在の事業内容と課題、IT導入による改善計画"}, {"key": "it_tool_detail", "title": "導入するITツールの詳細", "description": "導入予定のソフトウェア・サービスの概要と選定理由"}, {"key": "expected_effect", "title": "導入効果", "description": "IT導入による業務効率化・売上向上の定量的効果"}, {"key": "expense_breakdown", "title": "経費明細", "description": "補助対象経費の内訳と金額"}, {"key": "schedule", "title": "実施スケジュール", "description": "IT導入から運用開始までのタイムライン"}]'::jsonb,
  1
),
(
  'monozukuri',
  'ものづくり補助金',
  '中小企業が革新的な製品・サービスの開発や生産プロセスの改善を行うための設備投資を支援する補助金。',
  '1,250万円',
  '1/2〜2/3',
  '中小企業・小規模事業者で、革新的な製品・サービス開発または生産プロセス改善に取り組む事業者',
  '通年（複数回公募）',
  'https://portal.monodukuri-hojo.jp/',
  'medium',
  'equipment',
  '{"industry": {"製造業": 15, "建設業": 10, "情報通信業": 8, "all": 3}, "hasEquipmentPlan": {"true": 30, "false": 0}, "employeeCount": {"1-5": 5, "6-20": 10, "21-50": 10, "51-100": 8, "100+": 5}, "annualRevenue": {"〜1000万": 3, "1000万〜5000万": 8, "5000万〜1億": 10, "1億〜5億": 10, "5億以上": 5}, "yearsInBusiness": {"1年未満": 3, "1-3年": 8, "3-10年": 10, "10年以上": 10}}'::jsonb,
  '[{"key": "business_plan", "title": "事業計画概要", "description": "企業概要、事業の現状と課題"}, {"key": "project_description", "title": "補助事業の具体的内容", "description": "革新的な製品・サービス・プロセスの開発内容"}, {"key": "expense_breakdown", "title": "経費明細", "description": "機械装置・システム構築費等の内訳"}, {"key": "business_impact", "title": "事業効果", "description": "付加価値額・給与総額の向上計画"}, {"key": "schedule", "title": "実施スケジュール", "description": "補助事業の実施計画とマイルストーン"}]'::jsonb,
  2
),
(
  'shokibo_jizokuka',
  '小規模事業者持続化補助金',
  '小規模事業者が販路開拓や業務効率化に取り組む費用を支援する補助金。ウェブサイト制作、チラシ作成、展示会出展なども対象。',
  '250万円',
  '2/3',
  '従業員20人以下（商業・サービス業は5人以下）の小規模事業者',
  '通年（複数回公募）',
  'https://s23.jizokukahojokin.info/',
  'easy',
  'sales',
  '{"industry": {"all": 5}, "isSmallBusiness": {"true": 25, "false": 0}, "employeeCount": {"1-5": 15, "6-20": 10, "21-50": 0, "51-100": 0, "100+": 0}, "annualRevenue": {"〜1000万": 10, "1000万〜5000万": 10, "5000万〜1億": 5, "1億〜5億": 0, "5億以上": 0}, "corporationType": {"個人事業主": 10, "all": 5}}'::jsonb,
  '[{"key": "business_plan", "title": "経営計画", "description": "企業概要、顧客ニーズと市場動向、自社の強み"}, {"key": "project_description", "title": "補助事業計画", "description": "販路開拓の具体的取組内容"}, {"key": "expense_breakdown", "title": "経費明細", "description": "広報費・ウェブサイト関連費・展示会出展費等の内訳"}, {"key": "business_impact", "title": "事業効果", "description": "売上・顧客数の向上見込み"}, {"key": "schedule", "title": "実施スケジュール", "description": "補助事業期間内の実施計画"}]'::jsonb,
  3
),
(
  'jigyo_saikouchiku',
  '事業再構築補助金',
  '新分野展開、事業転換、業種転換など思い切った事業再構築に取り組む中小企業を支援する補助金。',
  '1億円',
  '1/2〜2/3',
  '事業再構築（新分野展開・業態転換・事業転換等）に取り組む中小企業',
  '通年（複数回公募）',
  'https://jigyou-saikouchiku.go.jp/',
  'hard',
  'restructure',
  '{"industry": {"all": 5}, "employeeCount": {"1-5": 5, "6-20": 8, "21-50": 10, "51-100": 10, "100+": 8}, "annualRevenue": {"〜1000万": 3, "1000万〜5000万": 5, "5000万〜1億": 8, "1億〜5億": 10, "5億以上": 10}, "yearsInBusiness": {"1年未満": 3, "1-3年": 5, "3-10年": 10, "10年以上": 10}, "hasItPlan": {"true": 5, "false": 0}, "hasEquipmentPlan": {"true": 5, "false": 0}}'::jsonb,
  '[{"key": "business_plan", "title": "事業計画概要", "description": "現在の事業と再構築の必要性"}, {"key": "project_description", "title": "再構築事業の具体的内容", "description": "新分野展開・業態転換等の詳細計画"}, {"key": "market_analysis", "title": "市場分析", "description": "ターゲット市場の規模・成長性・競合分析"}, {"key": "expense_breakdown", "title": "経費明細", "description": "建物費・機械装置費・システム構築費等の内訳"}, {"key": "business_impact", "title": "事業効果・収益計画", "description": "売上高・付加価値額の5年間推移計画"}, {"key": "schedule", "title": "実施スケジュール", "description": "事業再構築の段階的実施計画"}]'::jsonb,
  4
),
(
  'career_up',
  'キャリアアップ助成金',
  '非正規雇用労働者の正社員化や処遇改善に取り組む事業主を支援する助成金。正社員化コースでは1人あたり最大80万円。',
  '80万円/人',
  '定額',
  '雇用保険適用事業所の事業主で、非正規雇用労働者のキャリアアップに取り組む事業者',
  '通年',
  'https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/koyou_roudou/part_haken/jigyounushi/career.html',
  'medium',
  'employment',
  '{"industry": {"all": 5}, "employeeCount": {"1-5": 8, "6-20": 12, "21-50": 12, "51-100": 10, "100+": 8}, "annualRevenue": {"〜1000万": 3, "1000万〜5000万": 8, "5000万〜1億": 10, "1億〜5億": 10, "5億以上": 8}, "corporationType": {"個人事業主": 5, "all": 8}}'::jsonb,
  '[{"key": "business_plan", "title": "事業概要", "description": "事業内容と雇用状況の概要"}, {"key": "project_description", "title": "キャリアアップ計画", "description": "正社員化・処遇改善の具体的取組"}, {"key": "employee_plan", "title": "対象労働者の情報", "description": "対象となる非正規雇用労働者の状況と転換計画"}, {"key": "business_impact", "title": "期待される効果", "description": "雇用の安定化・生産性向上への効果"}, {"key": "schedule", "title": "実施スケジュール", "description": "キャリアアップ計画の実施時期"}]'::jsonb,
  5
);
