// ===========================================
// 統合アプリケーション 型定義
// ===========================================

// -------------------------------------------
// サービスタイプ
// -------------------------------------------
export type ServiceType = 'quiz' | 'profile' | 'business';

export const SERVICE_LABELS: Record<ServiceType, string> = {
  quiz: '診断クイズ',
  profile: 'プロフィールLP',
  business: 'ビジネスLP'
};

export const SERVICE_COLORS: Record<ServiceType, { primary: string; bg: string; text: string }> = {
  quiz: { primary: 'indigo', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  profile: { primary: 'emerald', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  business: { primary: 'amber', bg: 'bg-amber-50', text: 'text-amber-600' }
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
};

export type TextCardBlockData = {
  title: string;
  text: string;
  align: 'left' | 'center';
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
  | { id: string; type: 'checklist_section'; data: ChecklistSectionBlockData };

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
