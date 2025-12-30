// プロフィールブロックの型定義

// リンクアイテムの型定義
export type LinkItem = {
  label: string;
  url: string;
  style: string;
};

// 各ブロックタイプのデータ型定義
export type HeaderBlockData = {
  avatar: string; // 空文字列の可能性あり
  name: string;
  title: string;
  category?: string; // カテゴリ（オプショナル）
};

export type TextCardBlockData = {
  title: string;
  text: string;
  align: 'left' | 'center';
};

export type ImageBlockData = {
  url: string; // 空文字列の可能性あり
  alt?: string; // 代替テキスト（オプショナル）
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
  imageUrl: string; // 空文字列の可能性あり
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
  qrImageUrl?: string; // オプショナル
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
  imageUrl?: string; // オプショナル
};

export type TestimonialBlockData = {
  items: TestimonialItem[];
  isFullWidth?: boolean; // フル幅表示オプション
};

export type QuizBlockData = {
  quizId?: string; // クイズID（数値または文字列）
  quizSlug?: string; // クイズのslug
  title?: string; // オプション: カスタムタイトル
};

// ヒーローセクションブロックデータ
export type HeroBlockData = {
  headline: string; // メインキャッチコピー
  subheadline: string; // サブテキスト
  imageUrl?: string; // ヒーロー画像URL（書籍カバーなど）
  ctaText?: string; // CTAボタンテキスト
  ctaUrl?: string; // CTAボタンURL
  backgroundImage?: string; // 背景画像URL
  backgroundColor?: string; // 背景色（グラデーション含む）
  isFullWidth?: boolean; // フル幅表示オプション
};

// 特徴・ベネフィットブロックデータ
export type FeatureItem = {
  id: string;
  icon?: string; // アイコン（絵文字またはURL）
  title: string;
  description: string;
};

export type FeaturesBlockData = {
  title?: string; // セクションタイトル
  items: FeatureItem[]; // 特徴アイテム（最大6個推奨）
  columns: 2 | 3; // カラム数
  isFullWidth?: boolean; // フル幅表示オプション
};

// CTAセクションブロックデータ
export type CTASectionBlockData = {
  title: string; // CTAタイトル
  description: string; // 説明文
  buttonText: string; // ボタンテキスト
  buttonUrl: string; // ボタンURL
  backgroundColor?: string; // 背景色
  backgroundGradient?: string; // 背景グラデーション
  isFullWidth?: boolean; // フル幅表示オプション
};

// 2カラムレイアウトブロックデータ
export type TwoColumnBlockData = {
  layout: 'image-left' | 'image-right'; // レイアウト
  imageUrl: string; // 画像URL
  title: string; // タイトル
  text: string; // テキスト
  listItems?: string[]; // リストアイテム（オプション）
};

// フルワイドヒーローセクションブロックデータ
export type HeroFullwidthBlockData = {
  headline: string; // メインキャッチコピー
  subheadline: string; // サブテキスト
  imageUrl?: string; // ヒーロー画像URL（書籍カバーなど）
  ctaText?: string; // CTAボタンテキスト
  ctaUrl?: string; // CTAボタンURL
  backgroundImage?: string; // 背景画像URL（100%幅）
  backgroundColor?: string; // 背景色（グラデーション含む）
};

// 問題提起カードブロックデータ
export type ProblemCardsBlockData = {
  title?: string; // セクションタイトル
  subtitle?: string; // サブタイトル
  items: {
    id: string;
    icon?: string; // アイコン（絵文字）
    title: string; // カードタイトル
    description: string; // 説明文
    borderColor?: string; // 左ボーダー色（例: 'blue', 'red'）
  }[];
  isFullWidth?: boolean; // フル幅表示オプション
};

// ダークセクションブロックデータ
export type DarkSectionBlockData = {
  title: string; // セクションタイトル
  subtitle?: string; // サブタイトル
  backgroundColor?: string; // 背景色（グラデーション、HEXコード、CSSカラー名など）
  accentColor?: string; // アクセントカラー（グラデーション、HEXコード、CSSカラー名など）
  items: {
    id: string;
    title: string;
    description: string;
    icon?: string; // アイコン（絵文字）
  }[];
  isFullWidth?: boolean; // フル幅表示オプション
};

// 事例紹介カードブロックデータ
export type CaseStudyCardsBlockData = {
  title?: string; // セクションタイトル
  items: {
    id: string;
    imageUrl: string; // 事例画像
    category: string; // カテゴリー（タグ）
    categoryColor?: 'pink' | 'cyan' | 'green' | 'orange' | 'purple'; // タグ色
    title: string; // 事例タイトル
    description: string; // 説明文
  }[];
};

// 特典セクションブロックデータ
export type BonusSectionBlockData = {
  title: string; // セクションタイトル
  subtitle?: string; // サブタイトル
  backgroundGradient?: string; // 背景グラデーション
  items: {
    id: string;
    icon?: string; // アイコン（✓など）
    title: string;
    description: string;
  }[];
  qrImageUrl?: string; // QRコード画像URL
  qrText?: string; // QRコード説明文
  ctaText?: string; // CTAボタンテキスト
  ctaUrl?: string; // CTAボタンURL
  isFullWidth?: boolean; // フル幅表示オプション
};

// チェックリストセクションブロックデータ
export type ChecklistSectionBlockData = {
  title?: string; // セクションタイトル
  backgroundColor?: string; // 背景色
  items: {
    id: string;
    icon?: string; // Font Awesomeアイコンクラス or 絵文字
    title: string;
    description?: string;
  }[];
  columns?: 1 | 2; // カラム数
  isFullWidth?: boolean; // フル幅表示オプション
};

// Googleマップブロックデータ
export type GoogleMapBlockData = {
  address?: string; // 住所
  placeId?: string; // Google Place ID
  lat?: number; // 緯度
  lng?: number; // 経度
  zoom?: number; // ズームレベル（デフォルト: 15）
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain'; // マップタイプ
  title?: string; // セクションタイトル（例: "アクセス"）
  description?: string; // 説明文（例: "JR渋谷駅から徒歩5分"）
  showDirections?: boolean; // 経路案内リンク表示
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
  | { id: string; type: 'hero_fullwidth'; data: HeroFullwidthBlockData }
  | { id: string; type: 'problem_cards'; data: ProblemCardsBlockData }
  | { id: string; type: 'dark_section'; data: DarkSectionBlockData }
  | { id: string; type: 'case_study_cards'; data: CaseStudyCardsBlockData }
  | { id: string; type: 'bonus_section'; data: BonusSectionBlockData }
  | { id: string; type: 'checklist_section'; data: ChecklistSectionBlockData }
  | { id: string; type: 'google_map'; data: GoogleMapBlockData };

// プロフィール設定の型定義
export type ProfileSettings = {
  gtmId?: string;
  fbPixelId?: string;
  lineTagId?: string;
  theme?: {
    gradient?: string;
    backgroundImage?: string;
  };
};

// プロフィールデータの型定義
export interface Profile {
  id: string;
  slug: string;
  nickname?: string | null; // ユーザー設定の覚えやすいニックネーム（任意）
  content: Block[];
  user_id?: string | null;
  created_at?: string;
  updated_at?: string;
  settings?: ProfileSettings;
  featured_on_top?: boolean;
}

// ユーティリティ関数：一意のIDを生成
export function generateBlockId(): string {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 後方互換性のためのマイグレーション関数
export function migrateOldContent(oldContent: any): Block[] {
  // null や undefined の場合は空配列を返す
  if (!oldContent) return [];
  
  // 配列でない場合は空配列を返す
  if (!Array.isArray(oldContent)) {
    // オブジェクトの場合は配列に変換を試みる
    if (typeof oldContent === 'object') {
      console.warn('migrateOldContent: content is not an array, returning empty array');
      return [];
    }
    return [];
  }
  
  return oldContent
    .filter((oldBlock) => oldBlock && typeof oldBlock === 'object' && oldBlock.type)
    .map((oldBlock) => {
      // 既にidがある場合は検証して使用
      if (oldBlock.id && typeof oldBlock.id === 'string') {
        // 型が正しいか簡易チェック
        if (oldBlock.type && oldBlock.data) {
          return oldBlock as Block;
        }
      }
      
      const id = generateBlockId();
      
      // 旧形式のブロックを新形式に変換
      switch (oldBlock.type) {
        case 'header':
          return {
            id,
            type: 'header',
            data: {
              avatar: oldBlock.data?.avatarUrl || oldBlock.data?.avatar || '',
              name: oldBlock.data?.name || '',
              title: oldBlock.data?.tagline || oldBlock.data?.title || '',
              category: oldBlock.data?.category || 'other'
            }
          } as Block;
        
        case 'glass_card_text':
          return {
            id,
            type: 'text_card',
            data: {
              title: oldBlock.data?.title || '',
              text: oldBlock.data?.text || '',
              align: (oldBlock.data?.alignment || oldBlock.data?.align || 'center') as 'left' | 'center'
            }
          } as Block;
        
        case 'link_list':
          return {
            id,
            type: 'links',
            data: {
              links: Array.isArray(oldBlock.data?.links) ? oldBlock.data.links : []
            }
          } as Block;
        
        default:
          // 未知のタイプはidを追加してそのまま返す（型安全性のため）
          if (oldBlock.type && oldBlock.data) {
            return { ...oldBlock, id } as Block;
          }
          // 不正なブロックはスキップ（空配列にフィルタされる）
          return null;
      }
    })
    .filter((block): block is Block => block !== null);
}

