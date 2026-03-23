// 才能マネタイズ診断の型定義

// 既存の型を再利用
export type {
  DiagnosisAnswers,
  Big5Scores,
  AuthorTraitScores,
  SwotAnalysis,
  TipiQuestion,
} from '@/components/kindle/wizard/types';

export {
  BIG5_LABELS,
  TIPI_QUESTIONS,
  calculateBig5,
  AUTHOR_TRAIT_LABELS,
  MOCK_BIG5_SCORES,
} from '@/components/kindle/wizard/types';

// =============================================
// 才能マネタイズ診断固有の型
// =============================================

// 分野タブの種類
export type MonetizeField = 'kindle' | 'course' | 'consulting';

export const MONETIZE_FIELD_LABELS: Record<MonetizeField, string> = {
  kindle: 'Kindle出版',
  course: 'オンライン講座',
  consulting: 'コンサル・コーチング',
};

export const MONETIZE_FIELD_ICONS: Record<MonetizeField, string> = {
  kindle: '📚',
  course: '🎓',
  consulting: '💼',
};

// Kindle向けテーマ提案
export interface KindleThemeSuggestion {
  theme: string;
  targetReader: string;
  reason: string;
  potentialRevenue: string;
}

// オンライン講座テーマ提案
export interface CourseSuggestion {
  courseName: string;
  targetAudience: string;
  curriculum: string[];
  reason: string;
  pricingHint: string;
}

// コンサル・コーチングメニュー提案
export interface ConsultingSuggestion {
  menuName: string;
  targetClient: string;
  deliverables: string[];
  reason: string;
  pricingHint: string;
}

// 共通分析結果
export interface MonetizeAnalysis {
  summary: string;
  authorTraits: import('@/components/kindle/wizard/types').AuthorTraitScores;
  big5Scores?: import('@/components/kindle/wizard/types').Big5Scores;
  swot: import('@/components/kindle/wizard/types').SwotAnalysis;
  authorType: string;
  authorTypeDescription: string;
  birthdayInsight?: string;
}

// 診断結果全体
export interface MonetizeDiagnosisResult {
  id: string;
  analysis: MonetizeAnalysis;
  kindle: KindleThemeSuggestion[];
  course: CourseSuggestion[];
  consulting: ConsultingSuggestion[];
}

// ウィザードのステップ状態
export type DiagnosisStep = 0 | 1 | 2 | 3 | 4;

export const DIAGNOSIS_STEPS = [
  { title: '過去の振り返り', description: '時間やお金を使ってきたこと' },
  { title: '強み・特技', description: 'あなたの得意なこと' },
  { title: '未来・メッセージ', description: '挑戦と伝えたいこと' },
  { title: '性格タイプ診断', description: 'Big5性格特性（任意）' },
  { title: '生年月日', description: '才能×運勢分析（任意）' },
] as const;

// 質問ステップの質問定義
export interface StepQuestion {
  id: string;
  label: string;
  placeholder: string;
  examples: string[];
}

export const STEP_QUESTIONS: Record<0 | 1 | 2, StepQuestion[]> = {
  0: [
    {
      id: 'pastInvestment',
      label: 'これまで時間やお金を使ってきたことは何ですか？',
      placeholder: '例: プログラミング学習に3年、読書に月5冊...',
      examples: [
        '英語学習に10年以上',
        'ヨガのインストラクター資格を取得',
        '投資・資産運用を5年間研究',
        '料理教室に3年通った',
      ],
    },
    {
      id: 'immersion',
      label: '時間を忘れて没頭してしまうことは？',
      placeholder: '例: ブログ記事を書くこと、DIY...',
      examples: [
        '文章を書いていると時間を忘れる',
        'データ分析やリサーチ',
        '人の相談に乗ること',
        'デザインやクリエイティブな作業',
      ],
    },
  ],
  1: [
    {
      id: 'strengths',
      label: '人から褒められる強みや得意なことは？',
      placeholder: '例: わかりやすく説明する力、整理整頓...',
      examples: [
        '複雑なことをシンプルに説明できる',
        'プレゼンが上手いと言われる',
        '人の話を聞いて本質を見抜く',
        '細かい作業を正確にこなせる',
      ],
    },
    {
      id: 'expertise',
      label: '専門知識やスキルで、他の人にはない強みは？',
      placeholder: '例: マーケティング10年の実務経験...',
      examples: [
        '特定業界での実務経験',
        '資格や専門的なトレーニング',
        '独自の方法論やフレームワーク',
        '特定分野での成功体験',
      ],
    },
  ],
  2: [
    {
      id: 'futureChallenges',
      label: 'これから挑戦したいこと・実現したいことは？',
      placeholder: '例: オンラインビジネスで独立したい...',
      examples: [
        '自分のブランドを作りたい',
        '教育分野で貢献したい',
        '在宅で安定した収入を得たい',
        '同じ悩みを持つ人を助けたい',
      ],
    },
    {
      id: 'lifeMessage',
      label: '人に伝えたいメッセージや価値観は？',
      placeholder: '例: 誰でも自分の経験を価値に変えられる...',
      examples: [
        '失敗から学ぶことの大切さ',
        '小さな一歩が大きな変化を生む',
        '自分らしく生きる方法',
        '知識を共有することで世界が変わる',
      ],
    },
  ],
};

// モックデータ
export const MOCK_ANALYSIS: MonetizeAnalysis = {
  summary: 'あなたは「実践型エキスパート」タイプです。豊富な実務経験と、それを分かりやすく伝える力を持っています。Kindle出版だけでなく、講座やコンサルティングでも大きな成果が期待できます。',
  authorTraits: {
    expertise: 4,
    passion: 5,
    communication: 4,
    uniqueness: 3,
    marketability: 4,
  },
  swot: {
    strengths: ['実務経験が豊富', '分かりやすい説明力'],
    weaknesses: ['ブランディングが未確立', 'オンライン発信の経験が少ない'],
    opportunities: ['オンライン教育市場の拡大', '副業需要の高まり'],
    threats: ['競合コンテンツの増加', '無料情報との差別化'],
  },
  authorType: '実践型エキスパート',
  authorTypeDescription: '豊富な実務経験を活かし、実践的なノウハウを体系化して届けるタイプ',
};

export const MOCK_KINDLE_RESULTS: KindleThemeSuggestion[] = [
  {
    theme: '忙しい社会人のための「ゆる副業」入門',
    targetReader: '本業が忙しいが副収入を得たい30代〜40代の会社員',
    reason: '実務経験と時間管理への関心を活かせるテーマです',
    potentialRevenue: '月1〜3万円（印税）',
  },
  {
    theme: '人見知りでもできるオンラインコミュニケーション術',
    targetReader: 'リモートワークでのコミュニケーションに悩む内向型の社会人',
    reason: '分かりやすく伝える力と内向的な視点が強みになります',
    potentialRevenue: '月5,000〜2万円（印税）',
  },
  {
    theme: '40歳からの学び直し完全ガイド',
    targetReader: 'キャリアの転換期にある中年世代',
    reason: '「これから挑戦したい」という姿勢が読者の共感を呼びます',
    potentialRevenue: '月1〜5万円（印税）',
  },
];

export const MOCK_COURSE_RESULTS: CourseSuggestion[] = [
  {
    courseName: '実践！ゼロから始める副業マネタイズ講座',
    targetAudience: '副業を始めたい会社員・主婦',
    curriculum: ['マインドセット', 'スキルの棚卸し', '商品設計', '集客の基本', '収益化ステップ'],
    reason: '実務経験をステップバイステップで教えられます',
    pricingHint: '¥9,800〜¥29,800',
  },
  {
    courseName: 'オンラインコミュニケーション・マスタークラス',
    targetAudience: 'リモートワーカー、オンラインビジネス初心者',
    curriculum: ['オンライン会議術', '文章コミュニケーション', 'SNS発信の基本', '信頼構築テクニック'],
    reason: 'コミュニケーション力を体系的に教える講座として需要があります',
    pricingHint: '¥4,980〜¥14,800',
  },
];

export const MOCK_CONSULTING_RESULTS: ConsultingSuggestion[] = [
  {
    menuName: 'キャリア棚卸し × マネタイズ戦略コンサル',
    targetClient: '自分のスキルを活かして副業・独立したい30〜50代',
    deliverables: ['強み分析レポート', 'マネタイズロードマップ', '90日アクションプラン'],
    reason: '個別の状況に合わせた戦略提案ができます',
    pricingHint: '1回 ¥15,000〜¥30,000',
  },
  {
    menuName: 'Kindle出版プロデュースパッケージ',
    targetClient: 'Kindle出版に興味はあるが一人では不安な方',
    deliverables: ['テーマ選定', '構成アドバイス', '出版までの伴走サポート（3ヶ月）'],
    reason: '出版経験を活かした伴走型サービスとして差別化できます',
    pricingHint: '¥50,000〜¥100,000（3ヶ月）',
  },
];
