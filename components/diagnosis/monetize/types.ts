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

// 分野タブの種類（5タブ）
export type MonetizeField = 'kindle' | 'course' | 'consulting' | 'sns' | 'digital';

export const MONETIZE_FIELDS: MonetizeField[] = ['kindle', 'course', 'consulting', 'sns', 'digital'];

export const MONETIZE_FIELD_LABELS: Record<MonetizeField, string> = {
  kindle: 'Kindle出版',
  course: 'オンライン講座',
  consulting: 'コンサル・コーチング',
  sns: 'SNS発信',
  digital: 'デジタル商品',
};

export const MONETIZE_FIELD_DESCRIPTIONS: Record<MonetizeField, string> = {
  kindle: '電子書籍で不労所得を築く',
  course: '知識を体系化して教える',
  consulting: '個別支援で高単価を実現',
  sns: 'フォロワーを資産にする',
  digital: 'テンプレ・ツールを量産販売',
};

// =============================================
// 各分野の提案型（詳細版）
// =============================================

// Kindle向けテーマ提案
export interface KindleThemeSuggestion {
  theme: string;
  targetReader: string;
  reason: string;
  potentialRevenue: string;
  chapterOutline: string[];    // 章構成案（5章）
  differentiator: string;      // 差別化ポイント
  firstStep: string;           // 最初の一歩
}

// オンライン講座テーマ提案
export interface CourseSuggestion {
  courseName: string;
  targetAudience: string;
  curriculum: string[];
  reason: string;
  pricingHint: string;
  format: string;              // 形式（動画/ライブ/テキスト等）
  differentiator: string;
  firstStep: string;
}

// コンサル・コーチングメニュー提案
export interface ConsultingSuggestion {
  menuName: string;
  targetClient: string;
  deliverables: string[];
  reason: string;
  pricingHint: string;
  sessionFormat: string;       // セッション形式（単発/継続/パッケージ等）
  differentiator: string;
  firstStep: string;
}

// SNS発信テーマ提案
export interface SnsSuggestion {
  themeName: string;
  platform: string;            // Instagram/X/YouTube等
  targetFollower: string;
  contentIdeas: string[];      // 具体的な投稿ネタ5つ
  reason: string;
  monetizeRoute: string;       // 収益化ルート（アフィリ/PR案件/集客等）
  differentiator: string;
  firstStep: string;
}

// デジタル商品提案
export interface DigitalProductSuggestion {
  productName: string;
  productType: string;         // テンプレート/チェックリスト/ツール/素材等
  targetBuyer: string;
  features: string[];          // 商品の特徴・含まれるもの
  reason: string;
  pricingHint: string;
  salesChannel: string;        // 販売先（Gumroad/STORES/自社サイト等）
  differentiator: string;
  firstStep: string;
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
  sns: SnsSuggestion[];
  digital: DigitalProductSuggestion[];
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

// =============================================
// モックデータ
// =============================================

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
    chapterOutline: ['副業マインドセット', '時間の作り方', 'スキルの棚卸し', '最初の1万円を稼ぐ方法', '継続と成長の仕組み'],
    differentiator: '「忙しい人」に特化した実践的アプローチ',
    firstStep: 'まずは自分の1週間のタイムログを取り、副業に充てられる時間を可視化する',
  },
];

export const MOCK_COURSE_RESULTS: CourseSuggestion[] = [
  {
    courseName: '実践！ゼロから始める副業マネタイズ講座',
    targetAudience: '副業を始めたい会社員・主婦',
    curriculum: ['マインドセット', 'スキルの棚卸し', '商品設計', '集客の基本', '収益化ステップ'],
    reason: '実務経験をステップバイステップで教えられます',
    pricingHint: '¥9,800〜¥29,800',
    format: '動画講座（全5モジュール・各30分）+ ワークシート付き',
    differentiator: '理論だけでなく毎回の実践ワーク付き',
    firstStep: 'モジュール1の台本を書いてスマホで試し撮りする',
  },
];

export const MOCK_CONSULTING_RESULTS: ConsultingSuggestion[] = [
  {
    menuName: 'キャリア棚卸し × マネタイズ戦略コンサル',
    targetClient: '自分のスキルを活かして副業・独立したい30〜50代',
    deliverables: ['強み分析レポート', 'マネタイズロードマップ', '90日アクションプラン'],
    reason: '個別の状況に合わせた戦略提案ができます',
    pricingHint: '1回 ¥15,000〜¥30,000',
    sessionFormat: '単発90分セッション（Zoom）+ フォローアップメール1回',
    differentiator: '実務経験に基づく実践的なアドバイス',
    firstStep: '知り合い3人にモニター価格で提供し、実績と推薦文を集める',
  },
];

export const MOCK_SNS_RESULTS: SnsSuggestion[] = [
  {
    themeName: '忙しい社会人の副業リアル',
    platform: 'X（Twitter）+ Instagram',
    targetFollower: '副業に興味がある20〜40代の会社員',
    contentIdeas: ['今日の副業タイムログ', 'やってよかった副業ランキング', '副業の失敗談', '月収推移グラフ', '副業に使えるツール紹介'],
    reason: '副業のリアルな過程を発信することでフォロワーの信頼を獲得できます',
    monetizeRoute: 'フォロワー→メルマガ→Kindle/講座への導線',
    differentiator: '「結果」ではなく「過程」を見せるリアルさ',
    firstStep: 'X で「#副業日記」タグを付けて30日間毎日投稿する',
  },
];

export const MOCK_DIGITAL_RESULTS: DigitalProductSuggestion[] = [
  {
    productName: '副業スタートダッシュ・テンプレートパック',
    productType: 'Notionテンプレート',
    targetBuyer: '副業を始めたいが何から手を付けていいかわからない人',
    features: ['スキル棚卸しワークシート', '副業アイデア100リスト', 'タイムマネジメントテンプレート', '収支管理ダッシュボード', '90日アクションプランナー'],
    reason: 'あなたの実務経験を「型」にして繰り返し売れる商品にできます',
    pricingHint: '¥1,980〜¥4,980',
    salesChannel: 'STORES / Gumroad / 自社LP',
    differentiator: '実践者の経験から作られた、すぐに使える具体的なテンプレート',
    firstStep: 'まずはNotionで自分が使っている管理テンプレートを整理・デザインする',
  },
];
