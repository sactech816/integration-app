// 料金プラン共通データ定義
// トップページ（PricingSection）と /pricing ページで共有

import type { MakersPlanTier } from '@/lib/subscription';

// ========== 型定義 ==========

export type FeatureAvailability = 'yes' | 'no' | 'limited';

export interface PlanFeature {
  label: string;
  guest: FeatureAvailability;
  free: FeatureAvailability;
  standard: FeatureAvailability;
  business: FeatureAvailability;
  premium: FeatureAvailability;
  guestNote?: string;
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

/** プラン別の詳細説明（タブ表示用） */
export interface PlanDetailItem {
  text: string;
  href?: string;
}

export interface PlanDetailSection {
  title: string;
  items: (string | PlanDetailItem)[];
  /** セクションの強調表示（このプランで追加される機能） */
  highlight?: boolean;
}

export interface PlanDetail {
  id: MakersPlanTier;
  name: string;
  tagline: string;
  color: string;
  sections: PlanDetailSection[];
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
    description: '登録なしで、今すぐお試し。\nプロフィール・LP・出欠表が作れます。',
    ctaLabel: '登録せず試す',
    ctaHref: '/#create-section',
  },
  {
    id: 'free',
    name: 'フリープラン',
    badge: '無料',
    price: '¥0',
    priceUnit: '/ 月',
    description: '全ツールを各1個ずつ作成・編集。\nまずは無料で始めましょう。',
    ctaLabel: '無料で登録する',
    ctaHref: '/dashboard',
  },
  {
    id: 'standard',
    name: 'スタンダード',
    badge: '個人・副業向け',
    price: '¥1,980',
    priceUnit: '/ 月',
    description: 'AI機能・アクセス解析・HTML出力で\nコンテンツの質を向上。',
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
    description: '無制限作成・メルマガ・ファネルで\n本格的なビジネス運用を。',
    ctaLabel: 'ビジネスに申し込む',
    ctaHref: '/dashboard',
  },
  {
    id: 'premium',
    name: 'プレミアム',
    badge: '法人・本格運用',
    price: '¥9,800',
    priceUnit: '/ 月',
    description: '大量配信・Googleカレンダー連携・\n優先サポートで法人運用に最適。',
    ctaLabel: 'プレミアムに申し込む',
    ctaHref: '/dashboard',
  },
];

// ========== ツール名一覧（表示用） ==========

/** 全ツールの短縮名（カード・詳細説明で使用） */
export const ALL_TOOL_NAMES = 'プロフィール / LP / ウェビナーLP / マイサイト / ガイド / 診断クイズ / エンタメ診断 / セールスライター / サムネイル / SNS投稿 / 予約 / 出欠表 / アンケート / メルマガ / ステップメール / ファネル / フォーム（決済付） / ゲーミフィケーション / スキルマーケット / Kindle体験版 ほか多数';

// ========== 機能一覧（簡潔な比較表用） ==========

export const PLAN_FEATURES: PlanFeature[] = [
  // 作成
  { label: 'ツール作成数', guest: 'limited', free: 'limited', standard: 'limited', business: 'yes', premium: 'yes', guestNote: '特定2種×1個', freeNote: '各1個', standardNote: '各10個', businessNote: '無制限', premiumNote: '無制限' },
  { label: '出欠表・スキルマーケット・フォーム', guest: 'limited', free: 'yes', standard: 'yes', business: 'yes', premium: 'yes', guestNote: '出欠表・スキルのみ' },
  { label: '編集・更新', guest: 'no', free: 'yes', standard: 'yes', business: 'yes', premium: 'yes' },
  // 共通
  { label: 'ポータル掲載・URL発行', guest: 'yes', free: 'yes', standard: 'yes', business: 'yes', premium: 'yes' },
  { label: 'SEO（AEO）対策', guest: 'no', free: 'yes', standard: 'yes', business: 'yes', premium: 'yes' },
  { label: 'アフィリエイト', guest: 'no', free: 'yes', standard: 'yes', business: 'yes', premium: 'yes' },
  // AI
  { label: 'テキストAI', guest: 'no', free: 'no', standard: 'limited', business: 'limited', premium: 'limited', standardNote: '10回/日', businessNote: '50回/日', premiumNote: '200回/日' },
  { label: 'サムネイルAI（画像生成）', guest: 'no', free: 'no', standard: 'no', business: 'limited', premium: 'limited', businessNote: '5回/日', premiumNote: '20回/日' },
  // Standard+
  { label: 'アクセス解析', guest: 'no', free: 'no', standard: 'yes', business: 'yes', premium: 'yes' },
  { label: 'HTMLダウンロード', guest: 'no', free: 'no', standard: 'yes', business: 'yes', premium: 'yes' },
  { label: '埋め込みコード', guest: 'no', free: 'no', standard: 'yes', business: 'yes', premium: 'yes' },
  // Business+
  { label: 'コピーライト非表示', guest: 'no', free: 'no', standard: 'no', business: 'yes', premium: 'yes' },
  { label: '広告枠非表示', guest: 'no', free: 'no', standard: 'no', business: 'yes', premium: 'yes' },
  { label: 'フォーム決済手数料', guest: 'no', free: 'limited', standard: 'limited', business: 'yes', premium: 'yes', freeNote: '5%', standardNote: '5%', businessNote: '0%', premiumNote: '0%' },
  { label: 'メルマガ配信', guest: 'no', free: 'no', standard: 'no', business: 'limited', premium: 'limited', businessNote: '月500通', premiumNote: '月1,000通' },
  { label: 'ステップメール', guest: 'no', free: 'no', standard: 'no', business: 'limited', premium: 'limited', businessNote: '月500通', premiumNote: '月1,000通' },
  { label: 'ファネル', guest: 'no', free: 'no', standard: 'no', business: 'yes', premium: 'yes' },
  { label: 'ゲーミフィケーション', guest: 'no', free: 'no', standard: 'no', business: 'yes', premium: 'yes' },
  // Premium
  { label: 'Googleカレンダー連携', guest: 'no', free: 'no', standard: 'no', business: 'no', premium: 'yes' },
  { label: '優先サポート', guest: 'no', free: 'no', standard: 'no', business: 'no', premium: 'yes' },
];

// ========== プラン詳細説明（タブ切替表示用） ==========

export const PLAN_DETAILS: PlanDetail[] = [
  {
    id: 'guest',
    name: 'ゲスト',
    tagline: '登録なしで今すぐ体験',
    color: '#a1887f',
    sections: [
      {
        title: '作成できるツール',
        items: [
          { text: 'プロフィールLP — 自己紹介ページを1個作成', href: '/profile' },
          { text: 'LPメーカー — ランディングページを1個作成', href: '/business' },
          { text: '出欠表メーカー — イベント出欠管理を無制限作成', href: '/attendance' },
          { text: 'スキルマーケット — スキル登録・閲覧が無制限', href: '/marketplace' },
        ],
      },
      {
        title: '含まれる機能',
        items: [
          'ポータルサイトへの掲載',
          'URL発行・SNSシェア',
        ],
      },
      {
        title: 'ご注意',
        items: [
          '編集・更新にはログイン（無料）が必要です',
          'AI機能は利用できません',
          '無料登録すると全ツールが使えるようになります',
        ],
      },
    ],
  },
  {
    id: 'free',
    name: 'フリープラン',
    tagline: 'ずっと無料で全ツールを体験',
    color: '#f97316',
    sections: [
      {
        title: 'ツール作成',
        items: [
          '全20種類以上のツールを各1個ずつ作成・編集可能',
          '削除すれば新しく作り直せます（同時に存在できるのが1個）',
          '出欠表メーカー・スキルマーケット・フォームメーカーは無制限作成',
        ],
      },
      {
        title: '集客・連携機能',
        items: [
          'ポータルサイトへの掲載で露出アップ',
          'SEO（AEO）対策で検索エンジンからの集客',
          'アフィリエイト機能で紹介報酬を獲得',
          'URL発行・SNSシェア',
        ],
      },
      {
        title: 'フォームメーカー（決済付き）',
        items: [
          '申し込みフォーム・注文フォームを無制限作成',
          'Stripe・UnivaPayによるオンライン決済対応',
          'プラットフォーム決済手数料: 5%',
        ],
      },
      {
        title: 'ご注意',
        items: [
          'AI機能は利用できません（スタンダード以上）',
          'アクセス解析・HTML出力は利用できません（スタンダード以上）',
          'メルマガ・ファネル・ゲーミフィケーションは利用できません（ビジネス以上）',
        ],
      },
    ],
  },
  {
    id: 'standard',
    name: 'スタンダード',
    tagline: 'AI・解析・HTML出力でコンテンツの質を向上',
    color: '#3b82f6',
    sections: [
      {
        title: 'このプランで追加される機能',
        highlight: true,
        items: [
          '全ツールを各10個まで作成・編集（フリーは各1個）',
          'テキストAI: 1日10回まで利用可能',
          'アクセス解析（PV数・日別推移をグラフで確認）',
          'HTMLダウンロード（作成したページをHTML出力）',
          '埋め込みコード（外部サイトにiframeで設置）',
        ],
      },
      {
        title: 'AI機能の活用例',
        items: [
          '診断クイズ・プロフィール・LP・セールスレターなどをAIが自動生成',
          'キャッチコピー提案・文章ブラッシュアップ',
        ],
      },
      {
        title: 'フォームメーカー（決済付き）',
        items: [
          'プラットフォーム決済手数料: 5%',
        ],
      },
      {
        title: 'フリープランの全機能も含まれます',
        items: [
          '全ツール作成・ポータル掲載・SEO対策・アフィリエイト・URL発行',
        ],
      },
    ],
  },
  {
    id: 'business',
    name: 'ビジネス',
    tagline: '無制限作成・メルマガ・ファネルで本格ビジネス運用',
    color: '#f97316',
    sections: [
      {
        title: 'このプランで追加される機能',
        highlight: true,
        items: [
          '全ツールを無制限に作成（スタンダードは各10個）',
          'テキストAI: 1日50回（スタンダードの5倍）',
          'サムネイルAI（画像生成）: 1日5回 ※新機能',
          'メルマガ配信: 月500通 ※新機能',
          'ステップメール: 月500通 ※新機能',
          'ファネル構築: 無制限 ※新機能',
          'ゲーミフィケーション: 無制限 ※新機能',
          'コピーライト・広告枠を非表示 ※新機能',
          'フォーム決済手数料: 0%（通常5%→無料）',
        ],
      },
      {
        title: 'メルマガ・ステップメールの活用',
        items: [
          '診断クイズやフォームで獲得したリードに自動フォローアップ',
          'リスト管理・配信スケジュールを一元管理',
        ],
      },
      {
        title: 'ファネル・ゲーミフィケーション',
        items: [
          'LP → フォーム → サンキューページまでの導線設計',
          '福引き・ガチャ・スロット・スクラッチ・スタンプラリーで集客強化',
        ],
      },
      {
        title: 'スタンダードの全機能も含まれます',
        items: [
          'AI（テキスト）・アクセス解析・HTMLダウンロード・埋め込みコード・全ツール作成',
        ],
      },
    ],
  },
  {
    id: 'premium',
    name: 'プレミアム',
    tagline: '大量配信・外部連携・優先サポートで法人運用に最適',
    color: '#8b5cf6',
    sections: [
      {
        title: 'このプランで追加される機能',
        highlight: true,
        items: [
          'テキストAI: 1日200回（ビジネスの4倍）',
          'サムネイルAI: 1日20回（ビジネスの4倍）',
          'メルマガ: 月1,000通（ビジネスの2倍）',
          'ステップメール: 月1,000通（ビジネスの2倍）',
          'Googleカレンダー連携 ※新機能',
          '優先サポート ※新機能',
        ],
      },
      {
        title: 'Googleカレンダー連携の詳細',
        items: [
          '予約が確定すると自動でGoogleカレンダーに追加',
          'キャンセル時はカレンダーから自動削除',
          'チームの予定管理をシームレスに',
        ],
      },
      {
        title: '優先サポートの詳細',
        items: [
          '専用のお問い合わせ窓口で優先対応',
          '機能リクエストやカスタマイズの相談が可能',
          '返信を最優先でお返しします',
        ],
      },
      {
        title: 'ビジネスの全機能も含まれます',
        items: [
          '無制限作成・ファネル・ゲーミフィケーション・メルマガ・ブランディング・決済手数料0%',
        ],
      },
    ],
  },
];

// ========== 今後追加予定の機能 ==========

export const COMING_SOON_FEATURES: ComingSoonFeature[] = [
  {
    icon: 'Handshake',
    title: 'スキルマッチング機能',
    description: '集客メーカー利用者同士をスキルでマッチング。得意分野を登録するだけで、仕事の依頼や協業のチャンスが広がります。',
  },
  {
    icon: 'CalendarCheck',
    title: '独自ドメイン設定',
    description: '自分のドメインでコンテンツを公開。ブランディングを強化し、プロフェッショナルな印象を与えます。（プレミアムプラン予定）',
  },
  {
    icon: 'Share2',
    title: 'SNS自動投稿',
    description: '作成したコンテンツをX・Instagram・Facebookに同時シェア。予約投稿にも対応し、最適なタイミングでの情報発信を自動化。',
  },
  {
    icon: 'MessageCircle',
    title: 'LINE公式アカウント連携',
    description: 'LINEの友だち追加ボタン設置からフォローアップまでをシームレスに連携。自動応答やリッチメニューとの組み合わせで顧客対応を効率化。',
  },
];

// ========== FAQ ==========

export const PRICING_FAQ: PricingFaq[] = [
  {
    question: '本当にずっと無料ですか？',
    answer: 'はい、フリープランはずっと無料でご利用いただけます。クレジットカード登録も不要です。全ツールを各1個ずつ、ずっと無料でお使いいただけます。',
  },
  {
    question: 'ゲストとフリープランの違いは？',
    answer: 'ゲストは登録なしで一部ツール（プロフィール・LP・出欠表・スキルマーケット）をお試しできます。フリープランは無料登録するだけで全20種類以上のツールが使え、編集・更新も可能です。',
  },
  {
    question: '有料プランはいつでも解約できますか？',
    answer: 'はい、いつでも解約可能です。解約後も次の請求日まで有料プランの機能をご利用いただけます。解約手続きはマイページからワンクリックで完了します。',
  },
  {
    question: '作成数の「各1個」「各10個」はどういう意味ですか？',
    answer: '同時に存在できる数です。例えばフリープランでプロフィールLPを1個作成後、削除すれば新しいプロフィールLPを作成できます。出欠表・スキルマーケット・フォームメーカーはどのプランでも無制限です。',
  },
  {
    question: 'フォームメーカーの決済手数料とは？',
    answer: 'フォームメーカーでオンライン決済を利用する際、Stripe等の決済手数料とは別に、プラットフォーム手数料がかかります。フリー・スタンダードは5%、ビジネス以上は0%です。',
  },
  {
    question: 'プランの変更は簡単ですか？',
    answer: 'はい、マイページから数クリックでアップグレード・ダウングレードできます。アップグレード時は即座に新プランの機能が有効になります。',
  },
  {
    question: '有料プランで作成したコンテンツは、解約後どうなりますか？',
    answer: 'コンテンツは削除されません。ただし有料プラン専用機能（AI・メルマガ・ファネル・コピーライト非表示など）はフリープランの制限に戻ります。',
  },
  {
    question: '支払い方法は何がありますか？',
    answer: 'クレジットカード（Visa, Mastercard, JCB, American Express）でのお支払いに対応しています。',
  },
  {
    question: '法人向けのカスタマイズは可能ですか？',
    answer: 'はい、法人様向けにツールのカスタマイズや専用機能の開発を承っております。お気軽にお問い合わせください。',
  },
];
