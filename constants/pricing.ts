// 料金プラン共通データ定義
// トップページ（HomePageClientV3）と /pricing ページで共有

import type { MakersPlanTier } from '@/lib/subscription';

export type FeatureAvailability = 'yes' | 'no' | 'limited';

export interface PlanFeature {
  label: string;
  guest: FeatureAvailability;
  free: FeatureAvailability;
  standard: FeatureAvailability;
  business: FeatureAvailability;
  premium: FeatureAvailability;
  /** 各プランの注記 */
  freeNote?: string;
  standardNote?: string;
  businessNote?: string;
  premiumNote?: string;
}

export interface PlanDefinition {
  id: MakersPlanTier;
  name: string;
  badge: string;
  price: string;
  priceUnit: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  popular?: boolean;
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
    badge: '無料',
    price: '¥0',
    priceUnit: '/ 月',
    description: '30秒でできるアカウント登録だけでOK！\nずっと無料で使い放題。',
    ctaLabel: '無料で登録する',
    ctaHref: '/dashboard',
  },
  {
    id: 'standard',
    name: 'スタンダード',
    badge: '個人・副業向け',
    price: '¥1,980',
    priceUnit: '/ 月',
    description: 'AI機能とアクセス解析で\nコンテンツの質を向上。',
    ctaLabel: 'スタンダードに申し込む',
    ctaHref: '/dashboard',
    popular: true,
  },
  {
    id: 'business',
    name: 'ビジネス',
    badge: '事業者向け',
    price: '¥4,980',
    priceUnit: '/ 月',
    description: '本格的なビジネス運用に。\nAI無制限・全機能解放。',
    ctaLabel: 'ビジネスに申し込む',
    ctaHref: '/dashboard',
  },
  {
    id: 'premium',
    name: 'プレミアム',
    badge: '法人・本格運用',
    price: '¥9,800',
    priceUnit: '/ 月',
    description: '大量配信・優先サポート。\n法人の本格運用に最適。',
    ctaLabel: 'プレミアムに申し込む',
    ctaHref: '/dashboard',
  },
];

// ========== 機能一覧（比較表用） ==========

export const PLAN_FEATURES: PlanFeature[] = [
  { label: '新規作成（全13種）', guest: 'yes', free: 'yes', standard: 'yes', business: 'yes', premium: 'yes' },
  { label: 'ポータル掲載', guest: 'yes', free: 'yes', standard: 'yes', business: 'yes', premium: 'yes' },
  { label: 'URL発行', guest: 'yes', free: 'yes', standard: 'yes', business: 'yes', premium: 'yes' },
  { label: '編集・更新', guest: 'no', free: 'yes', standard: 'yes', business: 'yes', premium: 'yes' },
  { label: 'アフィリエイト', guest: 'no', free: 'yes', standard: 'yes', business: 'yes', premium: 'yes' },
  { label: 'アクセス解析', guest: 'no', free: 'no', standard: 'yes', business: 'yes', premium: 'yes' },
  { label: 'AI利用', guest: 'no', free: 'no', standard: 'limited', business: 'yes', premium: 'yes', standardNote: '月30回' },
  { label: 'フォーム作成', guest: 'no', free: 'limited', standard: 'yes', business: 'yes', premium: 'yes', freeNote: '機能限定' },
  { label: 'ファネル作成', guest: 'no', free: 'limited', standard: 'limited', business: 'yes', premium: 'yes', freeNote: '1件', standardNote: '3件' },
  { label: 'メルマガ配信', guest: 'no', free: 'limited', standard: 'limited', business: 'limited', premium: 'limited', freeNote: '月30通', standardNote: '月300通', businessNote: '月1,000通', premiumNote: '月5,000通' },
  { label: 'サムネイル作成', guest: 'no', free: 'limited', standard: 'limited', business: 'yes', premium: 'yes', freeNote: '1件', standardNote: '5件' },
  { label: 'エンタメ診断作成', guest: 'no', free: 'limited', standard: 'limited', business: 'yes', premium: 'yes', freeNote: '1件', standardNote: '3件' },
  { label: 'ゲーミフィケーション', guest: 'no', free: 'no', standard: 'no', business: 'limited', premium: 'yes', businessNote: '10件' },
  { label: 'HTMLダウンロード', guest: 'no', free: 'no', standard: 'no', business: 'yes', premium: 'yes' },
  { label: '埋め込みコード', guest: 'no', free: 'no', standard: 'no', business: 'yes', premium: 'yes' },
  { label: 'コピーライト非表示', guest: 'no', free: 'no', standard: 'no', business: 'yes', premium: 'yes' },
  { label: '広告枠非表示', guest: 'no', free: 'no', standard: 'no', business: 'yes', premium: 'yes' },
  { label: 'お問い合わせ', guest: 'no', free: 'no', standard: 'no', business: 'yes', premium: 'yes' },
  { label: '優先サポート', guest: 'no', free: 'no', standard: 'no', business: 'no', premium: 'yes' },
];

// ========== 有料プラン機能詳細（/pricing ページ用） ==========

export const PRO_FEATURE_DETAILS: ProFeatureDetail[] = [
  {
    icon: 'Zap',
    title: 'AI利用',
    description: 'AIがあなたのコンテンツ作成をフルサポート。文章生成、構成提案、キャッチコピー作成など、プロレベルのコンテンツを短時間で作成できます。待ち時間なくスムーズに利用可能。',
    freeComparison: '利用不可',
    proHighlight: 'スタンダード: 月30回 / ビジネス以上: 無制限',
  },
  {
    icon: 'CreditCard',
    title: 'フォーム作成（フル機能）',
    description: '申し込みフォーム・注文フォームをフル機能で作成。決済連携、自動返信メール、条件分岐など、本格的なビジネス運用に必要な機能をすべて解放。',
    freeComparison: '基本機能のみ',
    proHighlight: '決済連携・自動返信・条件分岐など全機能利用可能',
  },
  {
    icon: 'Share2',
    title: 'ファネル作成（フル機能）',
    description: '複数ステップのセールスファネルをフル機能で構築。LPからフォーム、サンキューページまで、成約率を最大化する導線設計を自由にカスタマイズできます。',
    freeComparison: '基本機能のみ',
    proHighlight: 'ビジネス以上: ステップ数無制限・条件分岐・A/Bテスト対応',
  },
  {
    icon: 'Mail',
    title: 'メルマガ配信（大量配信）',
    description: '診断クイズやフォームで獲得したリードに対して、ステップメールやキャンペーンメールを配信。リスト管理からメール作成、配信スケジュールまでを一元管理。',
    freeComparison: '月30通まで',
    proHighlight: 'スタンダード: 月300通 / ビジネス: 月1,000通 / プレミアム: 月5,000通',
  },
  {
    icon: 'ImagePlus',
    title: 'サムネイル作成（フル機能）',
    description: 'SNS投稿やブログ記事に使うサムネイル画像をプロ品質で作成。豊富なテンプレートとカスタマイズ機能で、目を引くビジュアルを簡単に作れます。',
    freeComparison: '1件まで',
    proHighlight: 'スタンダード: 5件 / ビジネス以上: 無制限',
  },
  {
    icon: 'Sparkles',
    title: 'エンタメ診断作成（フル機能）',
    description: 'バズを生む診断コンテンツをフル機能で作成。結果パターンのカスタマイズ、SNSシェア最適化、リード獲得フォーム連携など、集客に直結する仕掛けが満載。',
    freeComparison: '1件まで',
    proHighlight: 'スタンダード: 3件 / ビジネス以上: 無制限',
  },
  {
    icon: 'Gamepad2',
    title: 'ゲーミフィケーション',
    description: '福引き、ガチャ、スロット、スクラッチ、スタンプラリー、ログインボーナスなど、エンゲージメントを高めるゲーム要素を自由に作成。リピーター獲得やSNS拡散に効果的です。',
    freeComparison: '利用不可',
    proHighlight: 'ビジネス: 10件 / プレミアム: 無制限',
  },
  {
    icon: 'MessageCircle',
    title: 'お問い合わせ機能',
    description: 'ビジネスプラン以上のお問い合わせフォームで、顧客からの質問や相談をスムーズに受付。通知設定やフォームカスタマイズで、ビジネスチャンスを逃しません。',
    freeComparison: '利用不可',
    proHighlight: 'カスタマイズ可能なお問い合わせフォーム',
  },
];

// ========== 今後追加予定の有料専用機能 ==========

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
    question: '有料プランはいつでも解約できますか？',
    answer: 'はい、いつでも解約可能です。解約後も、次の請求日まで有料プランの機能をご利用いただけます。解約手続きはマイページからワンクリックで完了します。',
  },
  {
    question: '支払い方法は何がありますか？',
    answer: 'クレジットカード（Visa, Mastercard, JCB, American Express）でのお支払いに対応しています。',
  },
  {
    question: 'プランの変更は簡単ですか？',
    answer: 'はい、マイページから数クリックでアップグレード・ダウングレードできます。アップグレード時は即座に新プランの機能が有効になり、これまで作成したコンテンツもそのまま引き継がれます。',
  },
  {
    question: '有料プランで作成したコンテンツは、解約後どうなりますか？',
    answer: '解約後もコンテンツは削除されません。ただし、有料プラン専用機能（アクセス解析、HTMLダウンロード、埋め込みコード、コピーライト非表示など）はフリープランの制限に戻ります。',
  },
  {
    question: '単品購入はできますか？',
    answer: 'はい、AI生成パック、HTMLダウンロード、コピーライト非表示などの個別機能を、サブスクなしで1回¥500〜で購入できます。必要な機能だけをお得にご利用いただけます。',
  },
];
