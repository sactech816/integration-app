// 料金プラン共通データ定義
// トップページ（HomePageClientV3）と /pricing ページで共有

export type FeatureAvailability = 'yes' | 'no' | 'limited';

export interface PlanFeature {
  label: string;
  guest: FeatureAvailability;
  free: FeatureAvailability;
  pro: FeatureAvailability;
  /** free/proで「回数制限」等の注記がある場合 */
  freeNote?: string;
  proNote?: string;
}

export interface PlanDefinition {
  id: 'guest' | 'free' | 'pro';
  name: string;
  badge: string;
  price: string;
  priceUnit: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface ProFeatureDetail {
  icon: string; // lucide-react icon name
  title: string;
  description: string;
  freeComparison: string;
  proHighlight: string;
}

export interface ComingSoonFeature {
  icon: string;
  title: string;
  description: string;
}

export interface PricingFaq {
  question: string;
  answer: string;
}

// ========== プラン定義 ==========

export const PLANS: PlanDefinition[] = [
  {
    id: 'guest',
    name: 'ゲスト',
    badge: 'お試し体験',
    price: '¥0',
    priceUnit: '/ 回',
    description: '登録なしで、今すぐお試し作成。\n※保存はされません',
    ctaLabel: '登録せず試す',
    ctaHref: '/#create-section',
  },
  {
    id: 'free',
    name: 'フリープラン',
    badge: '標準',
    price: '¥0',
    priceUnit: '/ 月',
    description: '30秒でできるアカウント登録だけでOK！\nずっと無料で使い放題。',
    ctaLabel: '無料で登録する',
    ctaHref: '/dashboard',
  },
  {
    id: 'pro',
    name: 'プロプラン',
    badge: 'ビジネス向け',
    price: '¥3,980',
    priceUnit: '/ 月',
    description: '本格的なビジネス運用に。\n制限なしで使い放題。',
    ctaLabel: 'プロプランに申し込む',
    ctaHref: '/dashboard',
  },
];

// ========== 機能一覧（比較表用） ==========

export const PLAN_FEATURES: PlanFeature[] = [
  { label: '新規作成（全13種）', guest: 'yes', free: 'yes', pro: 'yes' },
  { label: 'ポータル掲載', guest: 'yes', free: 'yes', pro: 'yes' },
  { label: 'URL発行', guest: 'yes', free: 'yes', pro: 'yes' },
  { label: '編集・更新', guest: 'no', free: 'yes', pro: 'yes' },
  { label: 'アフィリエイト', guest: 'no', free: 'yes', pro: 'yes' },
  { label: 'アクセス解析', guest: 'no', free: 'no', pro: 'yes' },
  { label: 'AI利用', guest: 'no', free: 'limited', pro: 'yes', freeNote: '回数制限', proNote: '優先' },
  { label: 'ゲーミフィケーション', guest: 'no', free: 'limited', pro: 'yes', freeNote: '回数制限', proNote: '無制限' },
  { label: 'HTMLダウンロード', guest: 'no', free: 'no', pro: 'yes' },
  { label: '埋め込みコード', guest: 'no', free: 'no', pro: 'yes' },
  { label: 'コピーライト非表示', guest: 'no', free: 'no', pro: 'yes' },
  { label: '各種セミナー', guest: 'no', free: 'no', pro: 'yes' },
  { label: 'グループコンサル', guest: 'no', free: 'no', pro: 'yes' },
];

// ========== Pro機能詳細（/pricing ページ用） ==========

export const PRO_FEATURE_DETAILS: ProFeatureDetail[] = [
  {
    icon: 'PlusCircle',
    title: '新規作成（全13種）',
    description: '診断クイズ、プロフィールLP、ビジネスLP、予約、出欠、アンケート、セールスライター、福引き、ガチャ、スロット、スクラッチ、スタンプラリー、ログインボーナスなど、全13種類のコンテンツを自由に作成できます。テンプレートを選んで文字を変えるだけの簡単操作。',
    freeComparison: '全プラン共通で利用可能',
    proHighlight: 'すべてのテンプレート・機能が制限なく使い放題',
  },
  {
    icon: 'Globe',
    title: 'ポータル掲載',
    description: '作成したコンテンツは集客メーカーのポータルサイトに自動掲載。他のユーザーからの発見・流入が期待でき、あなたのコンテンツへのアクセスが増加します。',
    freeComparison: '全プラン共通で利用可能',
    proHighlight: '上位表示の優先枠でより多くの露出を獲得',
  },
  {
    icon: 'Link',
    title: 'URL発行',
    description: 'makers.tokyo/あなたのID の形式で専用URLが発行されます。SNSプロフィール、名刺、チラシなど、あらゆる場所で共有可能。短くて覚えやすいURLでブランディングにも効果的。',
    freeComparison: '全プラン共通で利用可能',
    proHighlight: '独自のブランディングURLで信頼性アップ',
  },
  {
    icon: 'Edit3',
    title: '編集・更新',
    description: '一度作成したコンテンツをいつでも編集・更新できます。キャンペーン情報の差し替え、季節に合わせた内容変更、反応を見ながらの改善など、継続的な運用に必須の機能です。',
    freeComparison: 'フリープランから利用可能',
    proHighlight: '回数制限なく何度でも編集・最適化',
  },
  {
    icon: 'Share2',
    title: 'アフィリエイト',
    description: '作成したコンテンツにアフィリエイトリンクを設置。紹介報酬を通じて収益化の幅が広がります。アフィリエイトダッシュボードで成果を確認・管理できます。',
    freeComparison: 'フリープランから利用可能',
    proHighlight: '高度なトラッキングと成果レポート',
  },
  {
    icon: 'BarChart3',
    title: 'アクセス解析',
    description: 'PV数、ユニークユーザー数、滞在時間、流入元など、コンテンツのパフォーマンスを詳細に分析。データに基づいた改善で、集客効果を最大化できます。',
    freeComparison: '利用不可',
    proHighlight: '詳細なアクセスデータで効果的なPDCAサイクルを実現',
  },
  {
    icon: 'Zap',
    title: 'AI利用（優先）',
    description: 'AIがあなたのコンテンツ作成をサポート。文章生成、構成提案、キャッチコピー作成など、プロレベルのコンテンツを短時間で作成できます。プロプランではAIの処理が優先され、待ち時間なくスムーズに利用可能。',
    freeComparison: '回数制限あり',
    proHighlight: '優先処理・高品質モデルで制限なく利用',
  },
  {
    icon: 'Gamepad2',
    title: 'ゲーミフィケーション（無制限）',
    description: '福引き、ガチャ、スロット、スクラッチ、スタンプラリー、ログインボーナスなど、エンゲージメントを高めるゲーム要素を無制限に作成。リピーター獲得やSNS拡散に効果的です。',
    freeComparison: '作成数に制限あり',
    proHighlight: '作成数無制限・全種類のゲーム要素が使い放題',
  },
  {
    icon: 'Download',
    title: 'HTMLダウンロード',
    description: '作成したコンテンツをHTMLファイルとしてダウンロード。自分のサーバーやWordPressなど、任意の環境にコンテンツを移植・バックアップできます。',
    freeComparison: '利用不可',
    proHighlight: 'いつでもHTMLをダウンロードしてバックアップ・移植',
  },
  {
    icon: 'Code',
    title: '埋め込みコード',
    description: 'iframeの埋め込みコードを発行。既存のWebサイトやブログにコンテンツをそのまま埋め込めます。WordPressやWix、ペライチなど、あらゆるサイトに対応。',
    freeComparison: '利用不可',
    proHighlight: 'ワンクリックで埋め込みコードを取得',
  },
  {
    icon: 'EyeOff',
    title: 'コピーライト非表示',
    description: 'コンテンツ下部に表示される「集客メーカーで作成」のクレジット表記を非表示に。自社ブランドのコンテンツとして、よりプロフェッショナルな印象を与えます。',
    freeComparison: '常にクレジット表示',
    proHighlight: 'クレジット非表示でブランドイメージを統一',
  },
  {
    icon: 'GraduationCap',
    title: '各種セミナー',
    description: '集客メーカーの活用法、マーケティング手法、コンテンツ制作のコツなど、ビジネスに直結するセミナーに参加可能。最新のノウハウを学び、他のユーザーとの交流も生まれます。',
    freeComparison: '利用不可',
    proHighlight: 'Pro限定セミナーで最新ノウハウを習得',
  },
  {
    icon: 'Users',
    title: 'グループコンサル',
    description: '少人数制のグループコンサルティングで、あなたのビジネス課題を直接相談。他の参加者の事例からも学びが得られ、実践的なアドバイスで成果につなげます。',
    freeComparison: '利用不可',
    proHighlight: '月1回のグループコンサルで個別アドバイス',
  },
];

// ========== 今後追加予定のPro専用機能 ==========

export const COMING_SOON_FEATURES: ComingSoonFeature[] = [
  {
    icon: 'Handshake',
    title: 'スキルマッチング機能',
    description: '集客メーカー利用者同士をスキルでマッチング。あなたの得意分野を登録しておくだけで、仕事の依頼や協業のチャンスが広がります。フリーランスやスモールビジネスの仕事獲得を強力にサポート。',
  },
  {
    icon: 'Share2',
    title: 'SNS投稿機能',
    description: '作成したコンテンツをワンクリックでX（旧Twitter）、Instagram、Facebookなどに同時シェア。予約投稿にも対応し、最適なタイミングでの情報発信を自動化します。',
  },
  {
    icon: 'CreditCard',
    title: '決済機能',
    description: 'コンテンツに決済フォームを直接組み込み、商品販売やサービス予約の決済をその場で完結。有料コンテンツの販売、セミナー参加費の集金、サブスクリプションの管理まで対応予定。',
  },
  {
    icon: 'Mail',
    title: 'メルマガ機能',
    description: '診断クイズやアンケートで獲得したリードに対して、ステップメールやキャンペーンメールを配信。リスト管理からメール作成、配信スケジュールまでを一元管理できます。',
  },
  {
    icon: 'ImagePlus',
    title: 'AI画像生成',
    description: 'コンテンツに使うオリジナル画像をAIで自動生成。アイキャッチ、バナー、SNS投稿用画像など、デザイナーに依頼しなくてもプロ品質のビジュアルを瞬時に作成できます。',
  },
  {
    icon: 'MessageCircle',
    title: 'LINE公式アカウント連携',
    description: 'コンテンツにLINE友だち追加ボタンを設置し、リード獲得からLINEでのフォローアップまでをシームレスに連携。自動応答メッセージやリッチメニューとの組み合わせで、顧客対応を効率化します。',
  },
];

// ========== FAQ ==========

export const PRICING_FAQ: PricingFaq[] = [
  {
    question: '本当にずっと無料ですか？',
    answer: 'はい、フリープランはずっと無料でご利用いただけます。クレジットカード登録も不要です。個人・スモールビジネス向け機能はずっと無料提供をお約束します。',
  },
  {
    question: 'プロプランはいつでも解約できますか？',
    answer: 'はい、いつでも解約可能です。解約後も、次の請求日までプロプランの機能をご利用いただけます。解約手続きはマイページからワンクリックで完了します。',
  },
  {
    question: '支払い方法は何がありますか？',
    answer: 'クレジットカード（Visa, Mastercard, JCB, American Express）でのお支払いに対応しています。',
  },
  {
    question: 'フリープランからプロプランへの切り替えは簡単ですか？',
    answer: 'はい、マイページから数クリックでアップグレードできます。プロプランの機能は即座に有効になり、これまで作成したコンテンツもそのまま引き継がれます。',
  },
  {
    question: 'プロプランで作成したコンテンツは、解約後どうなりますか？',
    answer: '解約後もコンテンツは削除されません。ただし、プロプラン専用機能（アクセス解析、HTMLダウンロード、埋め込みコード、コピーライト非表示など）はフリープランの制限に戻ります。',
  },
];
