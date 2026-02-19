// ===========================================
// 統合アプリケーション 型定義
// ===========================================

// -------------------------------------------
// サービスタイプ
// -------------------------------------------
export type ServiceType = 'quiz' | 'profile' | 'business' | 'salesletter' | 'survey' | 'gamification' | 'attendance' | 'booking';

export const SERVICE_LABELS: Record<ServiceType, string> = {
  quiz: '診断クイズ',
  profile: 'プロフィールLP',
  business: 'ビジネスLP',
  salesletter: 'セールスレター',
  survey: 'アンケート',
  gamification: 'ゲーミフィケーション',
  attendance: '出欠表',
  booking: '予約'
};

export const SERVICE_COLORS: Record<ServiceType, { primary: string; bg: string; text: string }> = {
  quiz: { primary: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  profile: { primary: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  business: { primary: 'amber', bg: 'bg-amber-50', text: 'text-amber-600' },
  salesletter: { primary: 'rose', bg: 'bg-rose-50', text: 'text-rose-600' },
  survey: { primary: 'teal', bg: 'bg-teal-50', text: 'text-teal-600' },
  gamification: { primary: 'purple', bg: 'bg-purple-50', text: 'text-purple-600' },
  attendance: { primary: 'purple', bg: 'bg-purple-50', text: 'text-purple-600' },
  booking: { primary: 'blue', bg: 'bg-blue-50', text: 'text-blue-600' }
};

// -------------------------------------------
// 診断クイズ関連の型定義
// -------------------------------------------
export interface QuizOption {
  text: string;
  score: Record<string, number>;
}

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
}

export interface QuizResult {
  type: string;
  title: string;
  description: string;
  image_url?: string;
  // 誘導ボタン設定
  ctaUrl?: string;
  ctaText?: string;
  lineUrl?: string;
  lineButtonText?: string;
  qrImageUrl?: string;
  qrButtonText?: string;
}

export interface Quiz {
  id: number;
  slug: string;
  title: string;
  description: string;
  category: string;
  color: string;
  questions: QuizQuestion[];
  results: QuizResult[];
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
  layout?: 'card' | 'chat';
  image_url?: string | null;
  mode?: 'diagnosis' | 'test' | 'fortune';
  collect_email?: boolean;
  theme?: 'standard' | 'cyberpunk' | 'japanese' | 'pastel' | 'monochrome';
  hideFooter?: boolean; // フッター非表示（Proプラン特典）
  // アナリティクス関連（データベースから取得時に含まれる可能性あり）
  views_count?: number;
  completions_count?: number;
  clicks_count?: number;
}

// -------------------------------------------
// プロフィールLP関連の型定義
// -------------------------------------------

// リンクアイテムの型定義
export type LinkItem = {
  label: string;
  url: string;
  style: string;
};

// 各ブロックタイプのデータ型定義
export type HeaderBlockData = {
  avatar: string;
  name: string;
  title: string;
  category?: string;
  avatarScale?: number; // 0.5〜2.0、デフォルト1.0
};

export type TextCardBlockData = {
  title: string;
  text: string;
  align: 'left' | 'center';
  htmlContent?: string; // リッチテキストHTML（TipTapエディタ）
};

export type ImageBlockData = {
  url: string;
  alt?: string;
  caption?: string;
};

export type YouTubeBlockData = {
  url: string;
};

export type LinksBlockData = {
  links: LinkItem[];
};

export type KindleBlockData = {
  asin: string;
  imageUrl: string;
  title: string;
  description: string;
};

export type LeadFormBlockData = {
  title: string;
  buttonText: string;
  // メール送信設定
  sendEmail?: boolean;           // メール送信有効化
  adminEmail?: string;           // 管理者通知先メール
  showName?: boolean;            // 名前入力欄表示
  showMessage?: boolean;         // メッセージ入力欄表示
};

export type LineCardBlockData = {
  title: string;
  description: string;
  url: string;
  buttonText: string;
  qrImageUrl?: string;
};

export type FAQItem = {
  id: string;
  question: string;
  answer: string;
};

export type FAQBlockData = {
  items: FAQItem[];
};

export type PricingPlan = {
  id: string;
  title: string;
  price: string;
  features: string[];
  isRecommended: boolean;
};

export type PricingBlockData = {
  plans: PricingPlan[];
};

export type TestimonialItem = {
  id: string;
  name: string;
  role: string;
  comment: string;
  imageUrl?: string;
};

export type TestimonialBlockData = {
  items: TestimonialItem[];
  isFullWidth?: boolean;
};

export type QuizBlockData = {
  quizId?: string;
  quizSlug?: string;
  title?: string;
};

export type HeroBlockData = {
  headline: string;
  subheadline: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  isFullWidth?: boolean;
  headlineColor?: string;
  subheadlineColor?: string;
  headlineBold?: boolean;
  backgroundOpacity?: number; // 0-100、デフォルト20
};

export type FeatureItem = {
  id: string;
  icon?: string;
  title: string;
  description: string;
};

export type FeaturesBlockData = {
  title?: string;
  items: FeatureItem[];
  columns: 2 | 3;
  isFullWidth?: boolean;
};

export type CTASectionBlockData = {
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
  backgroundColor?: string;
  backgroundGradient?: string;
  isFullWidth?: boolean;
};

export type TwoColumnBlockData = {
  layout: 'image-left' | 'image-right';
  imageUrl: string;
  title: string;
  text: string;
  listItems?: string[];
};

export type GoogleMapBlockData = {
  address?: string;
  embedUrl?: string;
  title?: string;
  description?: string;
  height?: string;
  showDirections?: boolean;
  zoom?: number;
  lat?: number;
  lng?: number;
};

// --- ビジネスLP追加ブロック型定義 ---

export type HeroFullwidthBlockData = {
  headline: string;
  subheadline?: string;
  backgroundImage?: string;
  backgroundColor?: string;
  imageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  overlay?: boolean;
  height?: 'short' | 'medium' | 'tall' | 'full';
  headlineColor?: string;
  subheadlineColor?: string;
  headlineBold?: boolean;
  backgroundOpacity?: number; // 0-100、デフォルト40
};

export type ProblemCardItem = {
  id: string;
  icon?: string;
  title: string;
  description: string;
  borderColor?: string;
};

export type ProblemCardsBlockData = {
  sectionTitle?: string;
  title?: string;
  subtitle?: string;
  items: ProblemCardItem[];
  isFullWidth?: boolean;
};

export type DarkSectionItem = {
  id: string;
  icon?: string;
  title: string;
  description: string;
};

export type DarkSectionBlockData = {
  title: string;
  subtitle?: string;
  description?: string;
  bulletPoints?: string[];
  items?: DarkSectionItem[];
  backgroundColor?: string;
  accentColor?: string;
  isFullWidth?: boolean;
};

export type CaseStudyItem = {
  id: string;
  imageUrl?: string;
  title: string;
  category?: string;
  categoryColor?: string;
  beforeText?: string;
  afterText?: string;
  description: string;
};

export type CaseStudyCardsBlockData = {
  sectionTitle?: string;
  title?: string;
  items: CaseStudyItem[];
  isFullWidth?: boolean;
};

export type BonusItem = {
  id: string;
  icon?: string;
  title: string;
  description: string;
  value?: string;
};

export type BonusSectionBlockData = {
  sectionTitle?: string;
  title?: string;
  subtitle?: string;
  items: BonusItem[];
  totalValue?: string;
  backgroundGradient?: string;
  ctaText?: string;
  ctaUrl?: string;
  isFullWidth?: boolean;
};

export type ChecklistItem = {
  id: string;
  icon?: string;
  title: string;
  description?: string;
};

export type ChecklistSectionBlockData = {
  sectionTitle?: string;
  title?: string;
  items: ChecklistItem[];
  columns?: number;
  style?: 'simple' | 'card' | 'highlight';
  isFullWidth?: boolean;
};

// --- セールスレター専用ブロック型定義 ---

// セールス用見出しブロック
export type SalesHeadlineBlockData = {
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4';
  align: 'left' | 'center' | 'right';
  fontSize?: number;
  color?: string;
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  underline?: boolean;
  underlineColor?: string;
  letterSpacing?: number;
  lineHeight?: number;
  // 背景設定
  backgroundType?: 'none' | 'color' | 'image';
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
  backgroundWidth?: 'full' | 'content' | 'custom';
  customBackgroundWidth?: number;
  padding?: number;
};

// セールス用本文ブロック（リッチテキスト）
export type SalesParagraphBlockData = {
  htmlContent: string;
  align: 'left' | 'center' | 'right';
  defaultFontSize?: number;
  defaultColor?: string;
  lineHeight?: number;
  // 背景設定
  backgroundType?: 'none' | 'color' | 'image';
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundOpacity?: number;
  backgroundWidth?: 'full' | 'content' | 'custom';
  customBackgroundWidth?: number;
  padding?: number;
};

// セールス用画像ブロック
export type SalesImageBlockData = {
  src: string;
  alt: string;
  caption?: string;
  link?: string;
  width?: 'full' | 'large' | 'medium' | 'small';
  align?: 'left' | 'center' | 'right';
  borderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
};

// セールス用CTAボタンブロック
export type SalesCtaBlockData = {
  text: string;
  url: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  backgroundColor: string;
  textColor: string;
  hoverBackgroundColor?: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: 'none' | 'arrow' | 'external' | 'download';
  iconPosition?: 'left' | 'right';
};

// セールス用余白ブロック
export type SalesSpacerBlockData = {
  height: number;
  mobileHeight?: number;
};

// セールス用区切り線ブロック
export type SalesDividerBlockData = {
  variant: 'full' | 'short' | 'dots' | 'wave';
  lineStyle: 'solid' | 'dashed' | 'dotted';
  lineColor: string;
  lineWidth: number;
  shortWidth?: number;
};

// セールス用カウントダウンタイマーブロック
export type SalesCountdownBlockData = {
  targetDate: string; // ISO形式の日時
  title?: string;
  expiredAction: 'text' | 'redirect';
  expiredText?: string;
  expiredUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  showDays?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
};

// セールス用YouTube埋め込みブロック
export type SalesYoutubeBlockData = {
  url: string;
  title?: string;
  aspectRatio?: '16:9' | '4:3' | '1:1';
  autoplay?: boolean;
  muted?: boolean;
};

// セールス用FAQブロック
export type SalesFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type SalesFaqBlockData = {
  items: SalesFaqItem[];
  style?: 'accordion' | 'list';
  backgroundColor?: string;
  questionColor?: string;
  answerColor?: string;
};

// プロフィールLP追加ブロック型定義
export type CountdownBlockData = {
  title?: string;
  targetDate: string; // ISO形式の日時
  expiredText?: string; // 期限切れ時の表示テキスト
  backgroundColor?: string;
};

export type GalleryItem = {
  id: string;
  imageUrl: string;
  caption?: string;
};

export type GalleryBlockData = {
  title?: string;
  items: GalleryItem[];
  columns?: 2 | 3 | 4; // グリッド列数
  showCaptions?: boolean;
};

// ブロックの型定義（Union型）
export type Block = 
  | { id: string; type: 'header'; data: HeaderBlockData }
  | { id: string; type: 'text_card'; data: TextCardBlockData }
  | { id: string; type: 'image'; data: ImageBlockData }
  | { id: string; type: 'youtube'; data: YouTubeBlockData }
  | { id: string; type: 'links'; data: LinksBlockData }
  | { id: string; type: 'kindle'; data: KindleBlockData }
  | { id: string; type: 'lead_form'; data: LeadFormBlockData }
  | { id: string; type: 'line_card'; data: LineCardBlockData }
  | { id: string; type: 'faq'; data: FAQBlockData }
  | { id: string; type: 'pricing'; data: PricingBlockData }
  | { id: string; type: 'testimonial'; data: TestimonialBlockData }
  | { id: string; type: 'quiz'; data: QuizBlockData }
  | { id: string; type: 'hero'; data: HeroBlockData }
  | { id: string; type: 'features'; data: FeaturesBlockData }
  | { id: string; type: 'cta_section'; data: CTASectionBlockData }
  | { id: string; type: 'two_column'; data: TwoColumnBlockData }
  | { id: string; type: 'google_map'; data: GoogleMapBlockData }
  | { id: string; type: 'countdown'; data: CountdownBlockData }
  | { id: string; type: 'gallery'; data: GalleryBlockData }
  // ビジネスLP追加ブロック
  | { id: string; type: 'hero_fullwidth'; data: HeroFullwidthBlockData }
  | { id: string; type: 'problem_cards'; data: ProblemCardsBlockData }
  | { id: string; type: 'dark_section'; data: DarkSectionBlockData }
  | { id: string; type: 'case_study_cards'; data: CaseStudyCardsBlockData }
  | { id: string; type: 'bonus_section'; data: BonusSectionBlockData }
  | { id: string; type: 'checklist_section'; data: ChecklistSectionBlockData }
  // セールスレター専用ブロック
  | { id: string; type: 'sales_headline'; data: SalesHeadlineBlockData }
  | { id: string; type: 'sales_paragraph'; data: SalesParagraphBlockData }
  | { id: string; type: 'sales_image'; data: SalesImageBlockData }
  | { id: string; type: 'sales_cta'; data: SalesCtaBlockData }
  | { id: string; type: 'sales_spacer'; data: SalesSpacerBlockData }
  | { id: string; type: 'sales_divider'; data: SalesDividerBlockData }
  | { id: string; type: 'sales_countdown'; data: SalesCountdownBlockData }
  | { id: string; type: 'sales_youtube'; data: SalesYoutubeBlockData }
  | { id: string; type: 'sales_faq'; data: SalesFaqBlockData };

// トラッキング設定の型定義
export type TrackingSettings = {
  gtmId?: string;
  fbPixelId?: string;
  lineTagId?: string;
};

// プロフィール設定の型定義
export type ProfileSettings = {
  gtmId?: string;
  fbPixelId?: string;
  lineTagId?: string;
  showInPortal?: boolean;
  hideFooter?: boolean; // フッター非表示（Proプラン特典）
  theme?: {
    gradient?: string;
    backgroundImage?: string;
    animated?: boolean;
  };
  tracking?: TrackingSettings;
};

// プロフィールデータの型定義
export interface Profile {
  id: string;
  slug: string;
  nickname?: string | null;
  content: Block[];
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
  settings?: ProfileSettings;
  featured_on_top?: boolean;
}

// -------------------------------------------
// ビジネスLP関連の型定義
// -------------------------------------------
export interface BusinessLP {
  id: string;
  slug: string;
  title: string;
  description?: string;
  content: Block[];
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
  settings?: ProfileSettings;
  template_id?: string;
}

// -------------------------------------------
// セールスレター関連の型定義
// -------------------------------------------
export interface SalesLetterSettings {
  contentWidth?: number;
  contentWidthUnit?: 'px' | '%';
  pageBackground?: {
    type: 'none' | 'color' | 'gradient' | 'image';
    value: string;
    opacity?: number;
    animated?: boolean;
    scope?: 'all' | 'inside' | 'outside'; // 全体 / コンテンツ幅内 / コンテンツ幅外
    imageUrl?: string; // 背景画像URL
  };
  // 枠線設定
  contentBorder?: {
    enabled: boolean;
    width: number;       // 1-5 px
    color: string;       // 例: '#e5e7eb'
  };
  // 影設定
  contentShadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  // 角丸設定
  contentBorderRadius?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hideFooter?: boolean;
  showInPortal?: boolean; // ポータルに掲載
  tracking?: TrackingSettings;
}

export interface SalesLetter {
  id: string;
  slug: string;
  title: string;
  content: Block[];
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
  settings?: SalesLetterSettings;
  template_id?: string;
  views_count?: number;
}

// セールスレターテンプレート関連
export type SalesLetterTemplateCategory = 
  | 'sales_letter'    // 王道のセールスレター型
  | 'ec_catalog'      // EC・物販・カタログ型
  | 'blog_short'      // ブログ・メルマガ・短文構成型
  | 'marketing';      // マーケティング思考・全体設計型

export interface SalesLetterTemplate {
  id: string;
  name: string;
  description: string;
  category: SalesLetterTemplateCategory;
  icon: string;
  content: Block[];
  settings: SalesLetterSettings;
  // オプション: 詳細説明（ガイドモーダル用）
  longDescription?: string;
  structure?: string[];
  useCases?: string[];
}

export const salesLetterTemplateCategories: Record<SalesLetterTemplateCategory, { name: string; description: string }> = {
  sales_letter: {
    name: '王道のセールスレター型',
    description: '商品をしっかり売り込みたい場合に最適。LP・長い手紙向け。',
  },
  ec_catalog: {
    name: 'EC・物販・カタログ型',
    description: '商品の魅力やスペックを端的に伝えたい場合に最適。',
  },
  blog_short: {
    name: 'ブログ・メルマガ・短文構成型',
    description: 'セクションやコラムなど短いコンテンツに最適。',
  },
  marketing: {
    name: 'マーケティング思考・全体設計型',
    description: '執筆前の構成案（プロット）作成に活用。',
  },
};

// -------------------------------------------
// ユーティリティ関数
// -------------------------------------------

// 一意のIDを生成
export function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 後方互換性のためのマイグレーション関数
export function migrateOldContent(oldContent: unknown): Block[] {
  if (!oldContent) return [];
  
  if (!Array.isArray(oldContent)) {
    if (typeof oldContent === 'object') {
      console.warn('migrateOldContent: content is not an array, returning empty array');
      return [];
    }
    return [];
  }
  
  return oldContent
    .filter((oldBlock): oldBlock is Record<string, unknown> => 
      oldBlock && typeof oldBlock === 'object' && 'type' in oldBlock
    )
    .map((oldBlock) => {
      if (oldBlock.id && typeof oldBlock.id === 'string') {
        if (oldBlock.type && oldBlock.data) {
          return oldBlock as unknown as Block;
        }
      }
      
      const id = generateBlockId();
      
      switch (oldBlock.type) {
        case 'header':
          return {
            id,
            type: 'header',
            data: {
              avatar: (oldBlock.data as Record<string, unknown>)?.avatarUrl as string || 
                     (oldBlock.data as Record<string, unknown>)?.avatar as string || '',
              name: (oldBlock.data as Record<string, unknown>)?.name as string || '',
              title: (oldBlock.data as Record<string, unknown>)?.tagline as string || 
                    (oldBlock.data as Record<string, unknown>)?.title as string || '',
              category: (oldBlock.data as Record<string, unknown>)?.category as string || 'other'
            }
          } as Block;
        
        case 'glass_card_text':
          return {
            id,
            type: 'text_card',
            data: {
              title: (oldBlock.data as Record<string, unknown>)?.title as string || '',
              text: (oldBlock.data as Record<string, unknown>)?.text as string || '',
              align: ((oldBlock.data as Record<string, unknown>)?.alignment as string || 
                     (oldBlock.data as Record<string, unknown>)?.align as string || 'center') as 'left' | 'center'
            }
          } as Block;
        
        case 'link_list':
          return {
            id,
            type: 'links',
            data: {
              links: Array.isArray((oldBlock.data as Record<string, unknown>)?.links) 
                ? (oldBlock.data as Record<string, unknown>).links as LinkItem[]
                : []
            }
          } as Block;
        
        default:
          if (oldBlock.type && oldBlock.data) {
            return { ...oldBlock, id } as unknown as Block;
          }
          return null;
      }
    })
    .filter((block): block is Block => block !== null);
}

// -------------------------------------------
// 共通ユーザー型
// -------------------------------------------
export interface User {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

// -------------------------------------------
// アンケート関連の型定義
// -------------------------------------------

// 質問タイプ
export type SurveyQuestionType = 'choice' | 'rating' | 'text';

// アンケートの質問
export interface SurveyQuestion {
  id: string;
  text: string;
  type: SurveyQuestionType;
  required?: boolean;
  options?: string[]; // choice タイプの場合のみ
  maxRating?: number; // rating タイプの場合のみ（デフォルト: 5）
  placeholder?: string; // text タイプの場合のみ
}

// アンケート設定
export interface SurveySettings {
  showInPortal?: boolean;
  hideFooter?: boolean; // フッター非表示（Proプラン特典）
  theme?: string; // テーマID（teal, blue, purple, rose, orange, green）
  primaryColor?: string;
  headerImage?: string; // ヘッダー画像URL
}

// アンケートデータ
export interface Survey {
  id: number;
  slug: string;
  title: string;
  description?: string;
  questions: SurveyQuestion[];
  creator_email: string;
  creator_name?: string;
  thank_you_message?: string;
  user_id?: string | null;
  settings?: SurveySettings;
  show_in_portal?: boolean;
  show_results_after_submission?: boolean; // 投票モード: trueの場合、回答後に結果を表示
  created_at?: string;
  updated_at?: string;
}

// 投票結果の集計データ
export interface SurveyResultData {
  question_id: string;
  question_text: string;
  question_type: SurveyQuestionType;
  options?: string[];
  counts: Record<string, number>; // 選択肢/評価値 => 票数
  total: number;
  average?: number; // rating タイプの場合のみ
}

// アンケート回答データ（API送信用）
export interface SurveyResponse {
  survey_id: number;
  survey_title: string;
  creator_email: string;
  respondent_name: string;
  respondent_email: string;
  answers: Record<string, string | number>;
  questions: SurveyQuestion[];
}

// 一意のアンケート質問IDを生成
export function generateSurveyQuestionId(): string {
  return `sq_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// -------------------------------------------
// ゲーミフィケーション関連の型定義
// -------------------------------------------

// キャンペーンタイプ
export type CampaignType = 'stamp_rally' | 'login_bonus' | 'gacha' | 'scratch' | 'fukubiki' | 'slot';

// キャンペーンステータス
export type CampaignStatus = 'active' | 'inactive';

// ガチャアニメーションタイプ
export type GachaAnimationType = 'capsule' | 'roulette' | 'omikuji';

// ポイントイベントタイプ
export type PointEventType = 'stamp_get' | 'login_bonus' | 'gacha_play' | 'gacha_win' | 'manual_adjust' | 'stamp_completion' | 'scratch_play' | 'scratch_win' | 'fukubiki_play' | 'fukubiki_win' | 'slot_play' | 'slot_win' | 'quiz_correct';

// キャンペーン設定（JSONB）
// スタンプラリーのトリガータイプ
export type StampTriggerType = 'page_view' | 'content_create' | 'quiz_play' | 'share';

// スタンプラリーのトリガー設定
export interface StampTrigger {
  id: string;
  type: StampTriggerType;
  target?: string; // page_viewの場合はURL、content_createの場合はタイプ（quiz, profile等）
  stamp_index: number;
  name: string;
}

// 固定ページの選択肢
export const STAMP_PAGE_OPTIONS = [
  { value: '/faq', label: 'よくある質問' },
  { value: '/howto', label: '使い方ガイド' },
  { value: '/effective-use', label: '効果的な活用法' },
  { value: '/gamification/effective-use', label: 'ゲーミフィケーション活用法' },
  { value: '/arcade', label: 'ゲームセンター' },
  { value: '/portal', label: 'ポータルサイト' },
  { value: '/announcements', label: 'お知らせ一覧' },
  { value: '/contact', label: 'お問い合わせ' },
  { value: '/privacy', label: 'プライバシーポリシー' },
  { value: '/legal', label: '特定商取引法' },
  { value: '/donation', label: '開発支援' },
  { value: '/dashboard', label: 'マイページ' },
  { value: '/login-bonus', label: 'ログインボーナス' },
  { value: '/stamp', label: 'スタンプラリー' },
  { value: 'custom', label: 'カスタムURL...' },
];

// コンテンツ作成の選択肢
export const STAMP_CONTENT_OPTIONS = [
  { value: 'quiz', label: '診断クイズ作成' },
  { value: 'profile', label: 'プロフィールLP作成' },
  { value: 'business', label: 'ビジネスLP作成' },
  { value: 'survey', label: 'アンケート作成' },
  { value: 'booking', label: '予約ページ作成' },
  { value: 'gacha', label: 'ガチャ作成' },
  { value: 'slot', label: 'スロット作成' },
  { value: 'scratch', label: 'スクラッチ作成' },
  { value: 'fukubiki', label: '福引作成' },
  { value: 'custom', label: 'カスタムURL...' },
];

// トリガータイプのラベル
export const STAMP_TRIGGER_TYPE_LABELS: Record<StampTriggerType, string> = {
  page_view: 'ページ閲覧',
  content_create: 'コンテンツ作成',
  quiz_play: 'クイズプレイ',
  share: 'SNSシェア',
};

export interface StampRallySettings {
  total_stamps: number;
  points_per_stamp: number;
  completion_bonus?: number;
  stamp_ids?: string[]; // スタンプID一覧
  triggers?: StampTrigger[]; // トリガー設定
}

export interface LoginBonusSettings {
  points_per_day: number;
}

export interface GachaSettings {
  cost_per_play: number;
}

export type CampaignSettings = StampRallySettings | LoginBonusSettings | GachaSettings;

// ゲーミフィケーションキャンペーン
export interface GamificationCampaign {
  id: string;
  owner_id: string | null;
  title: string;
  description?: string;
  campaign_type: CampaignType;
  status: CampaignStatus;
  animation_type?: GachaAnimationType;
  settings: CampaignSettings;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

// ユーザーポイント残高
export interface UserPointBalance {
  id: string;
  user_id?: string | null;
  session_id?: string | null;
  current_points: number;
  total_accumulated_points: number;
  created_at?: string;
  updated_at?: string;
}

// ポイントログ
export interface PointLog {
  id: string;
  user_id?: string | null;
  session_id?: string | null;
  campaign_id?: string | null;
  change_amount: number;
  event_type: PointEventType;
  event_data?: Record<string, unknown>;
  created_at?: string;
}

// ガチャ景品
export interface GachaPrize {
  id: string;
  campaign_id: string;
  name: string;
  description?: string;
  image_url?: string;
  probability: number;
  is_winning: boolean;
  stock?: number | null;
  won_count: number;
  display_order: number;
  point_reward?: number; // 当選時に付与されるポイント報酬
  created_at?: string;
  updated_at?: string;
}

// ユーザー獲得景品
export interface UserPrize {
  id: string;
  user_id?: string | null;
  session_id?: string | null;
  prize_id: string;
  campaign_id: string;
  claimed: boolean;
  claimed_at?: string;
  created_at?: string;
  // 結合時に含まれる景品情報
  prize?: GachaPrize;
}

// スタンプ取得状況
export interface UserStamp {
  stamp_id: string;
  stamp_index: number;
  acquired_at: string;
}

// ガチャ抽選結果
export interface GachaResult {
  success: boolean;
  error_code?: 'campaign_not_found' | 'insufficient_points' | 'no_prizes_available';
  prize_id?: string;
  prize_name?: string;
  prize_image_url?: string;
  is_winning?: boolean;
  new_balance?: number;
  points_won?: number; // 獲得したポイント報酬
}

// キャンペーン統計
export interface CampaignStats {
  total_participants: number;
  total_points_distributed: number;
  total_gacha_plays: number;
  total_prizes_won: number;
}

// キャンペーンラベル
export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  stamp_rally: 'スタンプラリー',
  login_bonus: 'ログインボーナス',
  gacha: 'ガチャ/抽選',
  scratch: 'スクラッチ',
  fukubiki: '福引き',
  slot: 'スロット'
};

// アニメーションタイプラベル
export const ANIMATION_TYPE_LABELS: Record<GachaAnimationType, string> = {
  capsule: 'カプセルトイ',
  roulette: 'ルーレット',
  omikuji: 'おみくじ'
};

// 一意のキャンペーンIDを生成
export function generateCampaignId(): string {
  return `camp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 一意のスタンプIDを生成
export function generateStampId(): string {
  return `stamp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// -------------------------------------------
// ゲーミフィケーション v2 拡張型定義
// -------------------------------------------

// ユーザーゲーミフィケーション設定
export interface UserGamificationSettings {
  id: string;
  user_id: string;
  welcome_bonus_claimed: boolean;
  welcome_bonus_claimed_at?: string;
  hide_login_bonus_toast: boolean;
  hide_welcome_toast: boolean;
  hide_stamp_notifications: boolean;
  hide_mission_notifications: boolean;
  hide_point_notifications: boolean;
  created_at?: string;
  updated_at?: string;
}

// 管理者ゲーミフィケーション設定
export interface AdminGamificationSetting {
  id: string;
  setting_key: string;
  setting_value: Record<string, unknown>;
  updated_by?: string;
  updated_at?: string;
}

// ウェルカムボーナス設定
export interface WelcomeBonusSettings {
  enabled: boolean;
  points: number;
  message: string;
}

// デイリーログインボーナス設定
export interface DailyLoginBonusSettings {
  enabled: boolean;
  points: number;
}

// デイリーミッション
export interface DailyMission {
  id: string;
  title: string;
  description?: string;
  mission_type: MissionType;
  target_count: number;
  reward_points: number;
  is_active: boolean;
  display_order: number;
  created_at?: string;
}

// ミッションタイプ
export type MissionType = 
  | 'login'
  | 'quiz_play'
  | 'quiz_create'
  | 'profile_view'
  | 'profile_create'
  | 'gacha_play'
  | 'share'
  | 'stamp_get'
  | 'survey_answer';

// ユーザーデイリーミッション進捗
export interface UserDailyMissionProgress {
  id: string;
  user_id: string;
  mission_id: string;
  progress_date: string;
  current_count: number;
  completed: boolean;
  completed_at?: string;
  reward_claimed: boolean;
  reward_claimed_at?: string;
  created_at?: string;
  updated_at?: string;
}

// ミッション進捗（結合データ）
export interface MissionProgressWithDetails {
  mission_id: string;
  title: string;
  description?: string;
  mission_type: MissionType;
  target_count: number;
  reward_points: number;
  current_count: number;
  completed: boolean;
  reward_claimed: boolean;
}

// ウェルカムボーナス結果
export interface WelcomeBonusResult {
  success: boolean;
  points_granted: number;
  already_claimed: boolean;
  message: string;
}

// ミッション更新結果
export interface MissionUpdateResult {
  mission_id: string;
  newly_completed: boolean;
  reward_points: number;
}

// ミッション報酬結果
export interface MissionRewardResult {
  success: boolean;
  points_granted: number;
  error_message?: string;
}

// 全ミッションボーナスチェック結果
export interface AllMissionsBonusCheck {
  all_completed: boolean;
  bonus_available: boolean;
  bonus_points: number;
}

// 拡張アニメーションタイプ（v2）
export type GachaAnimationTypeV2 = 'capsule' | 'roulette' | 'omikuji' | 'slot' | 'scratch' | 'fukubiki';

// アニメーションタイプラベル（v2）
export const ANIMATION_TYPE_LABELS_V2: Record<GachaAnimationTypeV2, string> = {
  capsule: 'カプセルトイ',
  roulette: 'ルーレット',
  omikuji: 'おみくじ',
  slot: 'スロットマシン',
  scratch: 'スクラッチ',
  fukubiki: '福引き'
};

// ミッションタイプラベル
export const MISSION_TYPE_LABELS: Record<MissionType, string> = {
  login: 'ログイン',
  quiz_play: 'クイズプレイ',
  quiz_create: 'クイズ作成',
  profile_view: 'プロフィール閲覧',
  profile_create: 'プロフィール作成',
  gacha_play: 'ガチャプレイ',
  share: 'SNSシェア',
  stamp_get: 'スタンプ獲得',
  survey_answer: 'アンケート回答'
};

// -------------------------------------------
// ハイブリッドAIクレジット関連の型定義
// -------------------------------------------

// AIモード（quality: 高品質AI, speed: 高速AI）
export type AIMode = 'quality' | 'speed';

// AI使用タイプ（premium: Premium Credits, standard: Standard Credits）
export type AIUsageType = 'premium' | 'standard';

// AIクレジット残高
export interface AICreditBalance {
  premiumCredits: number;      // Premium残回数
  standardCredits: number;     // Standard残回数
  premiumLimit: number;        // Premium上限
  standardLimit: number;       // Standard上限
  canUsePremium: boolean;      // Premium利用可能か
  canUseStandard: boolean;     // Standard利用可能か
}

// AI生成リクエスト
export interface AIGenerationRequest {
  mode: AIMode;                // quality または speed
  phase: 'outline' | 'writing'; // 処理フェーズ
  userId: string;
  actionType: string;
  prompt?: string;
  metadata?: Record<string, any>;
}

// AIモデル設定
export interface AIModelConfig {
  quality: {
    outline: string;
    writing: string;
    provider: 'openai' | 'gemini';
  };
  speed: {
    outline: string;
    writing: string;
    provider: 'openai' | 'gemini';
  };
}

// AIクレジットチェック結果
export interface AICreditCheckResult {
  canProceed: boolean;
  usageType: AIUsageType;
  remainingCredits: number;
  errorMessage?: string;
  suggestFallback?: boolean;  // Speedモードへのフォールバックを提案
}

// AIモードラベル
export const AI_MODE_LABELS: Record<AIMode, string> = {
  quality: '高品質AI',
  speed: '高速AI'
};

// AI使用タイプラベル
export const AI_USAGE_TYPE_LABELS: Record<AIUsageType, string> = {
  premium: 'Premium Credits',
  standard: 'Standard Credits'
};

// -------------------------------------------
// マーケットプレイス関連の型定義
// -------------------------------------------

export type MarketplaceOrderStatus =
  | 'requested'
  | 'accepted'
  | 'in_progress'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type MarketplacePriceType = 'fixed' | 'range' | 'negotiable';
export type MarketplaceListingStatus = 'draft' | 'published' | 'paused' | 'archived';
export type MarketplacePaymentStatus = 'none' | 'held' | 'captured' | 'refunded';

export interface MarketplaceProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  skills: string[];
  portfolio_urls: string[];
  response_time: string | null;
  supported_tools: string[];
  kindle_subtypes: string[];
  stripe_connect_id: string | null;
  avg_rating: number;
  total_reviews: number;
  total_orders: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MarketplaceListing {
  id: string;
  seller_id: string;
  category: string;
  is_tool_linked: boolean;
  linked_service_type: string | null;
  title: string;
  description: string;
  thumbnail_url: string | null;
  price_min: number;
  price_max: number | null;
  price_type: MarketplacePriceType;
  delivery_days: number | null;
  status: MarketplaceListingStatus;
  order_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // JOIN結果
  seller_profile?: MarketplaceProfile;
}

export interface MarketplaceOrder {
  id: string;
  listing_id: string | null;
  buyer_id: string;
  seller_id: string;
  title: string;
  description: string | null;
  budget: number | null;
  status: MarketplaceOrderStatus;
  payment_intent_id: string | null;
  payment_status: MarketplacePaymentStatus;
  platform_fee: number | null;
  seller_payout: number | null;
  accepted_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
  // JOIN結果
  listing?: MarketplaceListing;
  buyer_email?: string;
  seller_profile?: MarketplaceProfile;
}

export interface MarketplaceMessage {
  id: string;
  order_id: string;
  sender_id: string;
  sender_type: 'buyer' | 'seller';
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface MarketplaceReview {
  id: string;
  order_id: string;
  reviewer_id: string;
  seller_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  // JOIN結果
  reviewer_email?: string;
}

