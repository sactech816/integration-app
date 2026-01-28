// =============================================
// セールスレターLP 型定義
// =============================================

// ブロック共通スタイリング
export interface BlockStyle {
  // 横幅設定
  width: {
    type: 'full' | 'fixed' | 'percent';
    value: number;
  };
  
  // 角丸設定
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  
  // 背景設定
  background: {
    type: 'none' | 'color' | 'gradient' | 'image';
    value: string;
    opacity: number;
    animated: boolean;
  };
  
  // 枠線設定
  border: {
    enabled: boolean;
    width: number;
    style: 'solid' | 'dashed' | 'dotted';
    color: string;
  };
  
  // 影設定
  shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  
  // 余白（内側）
  padding: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  
  // マージン（外側）
  margin: {
    top: number;
    bottom: number;
  };
  
  // ブロック全体の透過度
  opacity: number;
}

// デフォルトスタイル
export const defaultBlockStyle: BlockStyle = {
  width: { type: 'full', value: 100 },
  borderRadius: 'none',
  background: { type: 'none', value: '', opacity: 100, animated: false },
  border: { enabled: false, width: 1, style: 'solid', color: '#e5e7eb' },
  shadow: 'none',
  padding: { top: 24, bottom: 24, left: 16, right: 16 },
  margin: { top: 0, bottom: 0 },
  opacity: 100,
};

// === 各ブロックのデータ型 ===

// 見出しブロック
export interface HeadlineData {
  text: string;
  level: 'h1' | 'h2' | 'h3' | 'h4';
  align: 'left' | 'center' | 'right';
  color: string;
  fontSize: number;
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  letterSpacing: number;
  lineHeight: number;
  textShadow: boolean;
}

// 本文ブロック
export interface ParagraphData {
  htmlContent: string;
  align: 'left' | 'center' | 'right' | 'justify';
  defaultColor: string;
  defaultFontSize: number;
  lineHeight: number;
}

// 画像ブロック
export interface ImageData {
  src: string;
  alt: string;
  caption?: string;
  objectFit: 'cover' | 'contain' | 'fill' | 'none';
  aspectRatio: '16:9' | '4:3' | '1:1' | 'auto';
  hoverEffect: 'none' | 'zoom' | 'brightness' | 'blur';
  link?: string;
}

// CTAボタンブロック
export interface CtaButtonData {
  text: string;
  url: string;
  size: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth: boolean;
  backgroundColor: string;
  textColor: string;
  hoverBackgroundColor: string;
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  shadow: 'none' | 'sm' | 'md' | 'lg';
  hoverEffect: 'none' | 'lift' | 'glow' | 'pulse';
  icon: 'arrow' | 'external' | 'download' | 'none';
  iconPosition: 'left' | 'right';
}

// 余白ブロック
export interface SpacerData {
  height: number;
  mobileHeight?: number;
}

// 区切り線ブロック
export interface DividerData {
  lineStyle: 'solid' | 'dashed' | 'dotted' | 'gradient';
  lineWidth: number;
  lineColor: string;
  variant: 'full' | 'short' | 'dots' | 'wave';
  shortWidth: number;
}

// ブロックタイプ
export type BlockType = 'headline' | 'paragraph' | 'image' | 'cta_button' | 'spacer' | 'divider';

// ブロックデータのユニオン型
export type BlockData = HeadlineData | ParagraphData | ImageData | CtaButtonData | SpacerData | DividerData;

// ブロック定義
export interface SalesLetterBlock {
  id: string;
  type: BlockType;
  data: BlockData;
  style: BlockStyle;
}

// 全体設定
export interface SalesLetterSettings {
  // コンテンツ幅
  contentWidth: number;
  contentWidthUnit: 'px' | '%';
  
  // 全体背景
  pageBackground: {
    type: 'none' | 'color' | 'gradient' | 'image';
    value: string;
    opacity: number;
    animated: boolean;
  };
  
  // フッター非表示
  hideFooter?: boolean;
}

// デフォルト設定
export const defaultSettings: SalesLetterSettings = {
  contentWidth: 800,
  contentWidthUnit: 'px',
  pageBackground: {
    type: 'color',
    value: '#ffffff',
    opacity: 100,
    animated: false,
  },
};

// セールスレター全体
export interface SalesLetter {
  id: string;
  user_id: string;
  slug: string;
  title: string;
  content: SalesLetterBlock[];
  settings: SalesLetterSettings;
  template_id?: string;
  views_count?: number;
  created_at?: string;
  updated_at?: string;
}

// === テンプレート関連 ===

export type TemplateCategory = 
  | 'sales_letter'    // 王道のセールスレター型
  | 'ec_catalog'      // EC・物販・カタログ型
  | 'blog_short'      // ブログ・メルマガ・短文構成型
  | 'marketing';      // マーケティング思考・全体設計型

export interface SalesLetterTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  icon: string;
  longDescription: string;  // モーダル用の詳細説明
  structure: string[];      // 構成要素の説明
  useCases: string[];       // 適した用途
  content: SalesLetterBlock[];
  settings: SalesLetterSettings;
}

// テンプレートカテゴリ情報
export const templateCategories: Record<TemplateCategory, { name: string; description: string }> = {
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

// スタイルプリセット
export interface StylePreset {
  id: string;
  name: string;
  style: Partial<BlockStyle>;
}

export const stylePresets: StylePreset[] = [
  {
    id: 'simple',
    name: 'シンプル',
    style: {
      borderRadius: 'none',
      shadow: 'none',
      border: { enabled: false, width: 1, style: 'solid', color: '#e5e7eb' },
    },
  },
  {
    id: 'card',
    name: 'カード風',
    style: {
      borderRadius: 'lg',
      shadow: 'md',
      background: { type: 'color', value: '#ffffff', opacity: 100, animated: false },
    },
  },
  {
    id: 'floating',
    name: 'フローティング',
    style: {
      borderRadius: 'xl',
      shadow: 'xl',
      background: { type: 'gradient', value: 'linear-gradient(-45deg, #667eea, #764ba2)', opacity: 100, animated: true },
    },
  },
  {
    id: 'bordered',
    name: '枠線付き',
    style: {
      borderRadius: 'md',
      border: { enabled: true, width: 2, style: 'solid', color: '#e5e7eb' },
    },
  },
  {
    id: 'glass',
    name: '透過グラス',
    style: {
      borderRadius: 'lg',
      background: { type: 'color', value: '#ffffff', opacity: 70, animated: false },
      shadow: 'md',
    },
  },
];

// デフォルトブロックデータ生成関数
export const createDefaultHeadlineData = (): HeadlineData => ({
  text: '見出しテキスト',
  level: 'h2',
  align: 'center',
  color: '#1f2937',
  fontSize: 32,
  fontWeight: 'bold',
  letterSpacing: 0,
  lineHeight: 1.4,
  textShadow: false,
});

export const createDefaultParagraphData = (): ParagraphData => ({
  htmlContent: '<p>本文を入力してください。</p>',
  align: 'left',
  defaultColor: '#374151',
  defaultFontSize: 16,
  lineHeight: 1.8,
});

export const createDefaultImageData = (): ImageData => ({
  src: '',
  alt: '',
  caption: '',
  objectFit: 'cover',
  aspectRatio: 'auto',
  hoverEffect: 'none',
  link: '',
});

export const createDefaultCtaButtonData = (): CtaButtonData => ({
  text: '今すぐ申し込む',
  url: '#',
  size: 'lg',
  fullWidth: false,
  backgroundColor: '#ef4444',
  textColor: '#ffffff',
  hoverBackgroundColor: '#dc2626',
  borderRadius: 'lg',
  shadow: 'md',
  hoverEffect: 'lift',
  icon: 'arrow',
  iconPosition: 'right',
});

export const createDefaultSpacerData = (): SpacerData => ({
  height: 48,
  mobileHeight: 32,
});

export const createDefaultDividerData = (): DividerData => ({
  lineStyle: 'solid',
  lineWidth: 1,
  lineColor: '#e5e7eb',
  variant: 'full',
  shortWidth: 50,
});
