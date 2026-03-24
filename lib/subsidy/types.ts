// =============================================
// 補助金診断・申請支援ツール 型定義
// =============================================

export interface BusinessInfo {
  industry: string;
  employeeCount: string;
  annualRevenue: string;
  yearsInBusiness: string;
  corporationType: string;
  prefecture: string;
  businessDescription: string;
  hasItPlan: boolean;
  hasEquipmentPlan: boolean;
  isSmallBusiness: boolean;
}

export interface SubsidyMaster {
  id: string;
  subsidy_key: string;
  name: string;
  description: string;
  max_amount: string;
  subsidy_rate: string;
  eligibility_summary: string;
  application_period: string;
  official_url: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  scoring_rules: ScoringRules;
  application_sections: ApplicationSectionDef[];
  is_active: boolean;
  sort_order: number;
}

export interface ScoringRules {
  [field: string]: {
    [value: string]: number;
  };
}

export interface ApplicationSectionDef {
  key: string;
  title: string;
  description: string;
}

export interface SubsidyMatch {
  subsidyKey: string;
  name: string;
  score: number;
  rank: number;
  maxAmount: string;
  subsidyRate: string;
  description: string;
  eligibilitySummary: string;
  difficulty: string;
  officialUrl: string;
  category: string;
}

export interface SubsidyResult {
  id: string;
  user_id: string | null;
  business_info: BusinessInfo;
  matched_subsidies: SubsidyMatch[];
  result_snapshot: Record<string, unknown>;
  report_purchased: boolean;
  report_purchased_at: string | null;
  report_content: ReportContent | null;
  report_generated_at: string | null;
  selected_subsidy: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReportSection {
  key: string;
  title: string;
  content: string;   // HTML
  generatedAt: string;
}

export interface ReportContent {
  subsidyName: string;
  sections: ReportSection[];
  generatedAt: string;
}

// 診断フォームの選択肢定義
export const INDUSTRY_OPTIONS = [
  '製造業', '建設業', '情報通信業', '運輸業', '卸売業', '小売業',
  '飲食サービス業', '宿泊業', '医療・福祉', '教育・学習支援業',
  '生活関連サービス業', '不動産業', '専門・技術サービス業', 'その他',
] as const;

export const EMPLOYEE_COUNT_OPTIONS = [
  { value: '1-5', label: '1〜5人' },
  { value: '6-20', label: '6〜20人' },
  { value: '21-50', label: '21〜50人' },
  { value: '51-100', label: '51〜100人' },
  { value: '100+', label: '100人以上' },
] as const;

export const ANNUAL_REVENUE_OPTIONS = [
  { value: '〜1000万', label: '〜1,000万円' },
  { value: '1000万〜5000万', label: '1,000万〜5,000万円' },
  { value: '5000万〜1億', label: '5,000万〜1億円' },
  { value: '1億〜5億', label: '1億〜5億円' },
  { value: '5億以上', label: '5億円以上' },
] as const;

export const YEARS_IN_BUSINESS_OPTIONS = [
  { value: '1年未満', label: '1年未満' },
  { value: '1-3年', label: '1〜3年' },
  { value: '3-10年', label: '3〜10年' },
  { value: '10年以上', label: '10年以上' },
] as const;

export const CORPORATION_TYPE_OPTIONS = [
  '個人事業主', '株式会社', '合同会社', '合名会社', '合資会社',
  'NPO法人', '一般社団法人', 'その他',
] as const;

export const PREFECTURE_OPTIONS = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県',
  '岐阜県', '静岡県', '愛知県', '三重県',
  '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県',
  '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県',
  '福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
] as const;
