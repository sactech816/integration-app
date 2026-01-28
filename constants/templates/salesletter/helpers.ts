// =============================================
// セールスレターテンプレート - ヘルパー関数
// =============================================

import {
  Block,
  SalesLetterSettings,
  SalesHeadlineBlockData,
  SalesParagraphBlockData,
  SalesImageBlockData,
  SalesCtaBlockData,
  SalesSpacerBlockData,
  SalesDividerBlockData,
} from '@/lib/types';

// ユニークID生成
export const generateBlockId = (): string => {
  return `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// 見出しブロック作成
export const createHeadline = (
  text: string,
  options: Partial<SalesHeadlineBlockData> = {}
): Block => {
  return {
    id: generateBlockId(),
    type: 'sales_headline',
    data: {
      text,
      level: options.level || 'h2',
      align: options.align || 'center',
      color: options.color || '#1f2937',
      fontSize: options.fontSize || 32,
      fontWeight: options.fontWeight || 'bold',
      letterSpacing: options.letterSpacing || 0,
      lineHeight: options.lineHeight || 1.4,
      underline: options.underline || false,
      underlineColor: options.underlineColor,
      backgroundColor: options.backgroundColor,
      padding: options.padding,
    } as SalesHeadlineBlockData,
  };
};

// 本文ブロック作成
export const createParagraph = (
  htmlContent: string,
  options: Partial<SalesParagraphBlockData> = {}
): Block => {
  return {
    id: generateBlockId(),
    type: 'sales_paragraph',
    data: {
      htmlContent,
      align: options.align || 'left',
      defaultFontSize: options.defaultFontSize || 16,
      defaultColor: options.defaultColor || '#374151',
      lineHeight: options.lineHeight || 1.8,
      backgroundColor: options.backgroundColor,
      padding: options.padding,
    } as SalesParagraphBlockData,
  };
};

// 画像ブロック作成
export const createImage = (
  src: string,
  options: Partial<SalesImageBlockData> = {}
): Block => {
  return {
    id: generateBlockId(),
    type: 'sales_image',
    data: {
      src,
      alt: options.alt || '',
      caption: options.caption || '',
      link: options.link,
      width: options.width || 'full',
      align: options.align || 'center',
      borderRadius: options.borderRadius || 'md',
      shadow: options.shadow || 'none',
    } as SalesImageBlockData,
  };
};

// CTAボタンブロック作成
export const createCtaButton = (
  text: string,
  url: string,
  options: Partial<SalesCtaBlockData> = {}
): Block => {
  return {
    id: generateBlockId(),
    type: 'sales_cta',
    data: {
      text,
      url,
      size: options.size || 'lg',
      backgroundColor: options.backgroundColor || '#ef4444',
      textColor: options.textColor || '#ffffff',
      hoverBackgroundColor: options.hoverBackgroundColor,
      borderRadius: options.borderRadius || 'lg',
      shadow: options.shadow || 'md',
      fullWidth: options.fullWidth !== undefined ? options.fullWidth : true,
      icon: options.icon || 'arrow',
      iconPosition: options.iconPosition || 'right',
    } as SalesCtaBlockData,
  };
};

// 余白ブロック作成
export const createSpacer = (height: number, mobileHeight?: number): Block => {
  return {
    id: generateBlockId(),
    type: 'sales_spacer',
    data: {
      height,
      mobileHeight: mobileHeight || Math.floor(height * 0.6),
    } as SalesSpacerBlockData,
  };
};

// 区切り線ブロック作成
export const createDivider = (
  options: Partial<SalesDividerBlockData> = {}
): Block => {
  return {
    id: generateBlockId(),
    type: 'sales_divider',
    data: {
      variant: options.variant || 'full',
      lineStyle: options.lineStyle || 'solid',
      lineColor: options.lineColor || '#e5e7eb',
      lineWidth: options.lineWidth || 1,
      shortWidth: options.shortWidth || 30,
    } as SalesDividerBlockData,
  };
};

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
  hideFooter: false,
};

// カードスタイル（互換性のため残す）
export const cardStyle = {};
