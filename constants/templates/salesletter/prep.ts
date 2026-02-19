// =============================================
// PREP法テンプレート（ブログ・短文向け）
// =============================================

import { SalesLetterTemplate } from '@/lib/types';
import {
  createHeadline,
  createParagraph,
  createCtaButton,
  createSpacer,
  createDivider,
  createImage,
  defaultSettings,
} from './helpers';

export const prepTemplate: SalesLetterTemplate = {
  id: 'prep',
  name: 'PREP法',
  description: '説得力のある論理構成。証拠提示パートなどに使える',
  category: 'blog_short',
  icon: '📝',
  longDescription: '論理的で説得力のある文章構成の基本形です。ビジネス文書からプレゼンまで幅広く使える汎用性の高いフレームワークです。',
  structure: ['Point（結論）', 'Reason（理由）', 'Example（具体例）', 'Point（結論）'],
  useCases: ['ブログ記事', 'プレゼン資料', 'ビジネスメール', 'レポート'],
  settings: {
    ...defaultSettings,
    contentWidth: 700,
  },
  content: [
    // ヘッダー画像
    createImage('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop', {
      alt: 'ヘッダー画像',
    }),

    // P: Point（結論）
    createHeadline('結論：〇〇は△△すべきです', {
      level: 'h1',
      fontSize: 28,
    }),
    
    createSpacer(16),
    
    createParagraph(`<p style="text-align: center; font-size: 18px; font-weight: bold; color: #1f2937;">最も重要なポイントを最初に伝えます。</p>`, {
      align: 'center',
      backgroundColor: '#dbeafe',
      padding: 16,
    }),

    createSpacer(32),
    createDivider({ variant: 'short', shortWidth: 30 }),
    createSpacer(32),

    // R: Reason（理由）
    createHeadline('理由', {
      level: 'h2',
      fontSize: 24,
    }),
    
    createSpacer(16),
    
    createParagraph(`<p>なぜそう言えるのか、3つの理由があります。</p>
<p><strong>理由①：〇〇だから</strong></p>
<p>△△という背景があり、〇〇することで□□が実現できます。</p>
<p><strong>理由②：△△だから</strong></p>
<p>多くの調査で、△△が重要であることが示されています。</p>
<p><strong>理由③：□□だから</strong></p>
<p>実際に□□を行った結果、〇〇%の改善が見られました。</p>`, {
    }),

    createSpacer(32),
    createDivider({ variant: 'short', shortWidth: 30 }),
    createSpacer(32),

    // E: Example（具体例）
    createHeadline('具体例', {
      level: 'h2',
      fontSize: 24,
    }),
    
    createSpacer(16),
    
    createParagraph(`<p><strong>例えば、Aさんの場合...</strong></p>
<p>Aさんは〇〇を実践する前、△△という課題を抱えていました。</p>
<p>しかし、〇〇を始めてから3ヶ月で、□□という成果を得ることができました。</p>`, {
    }),
    
    createSpacer(16),
    
    createParagraph(`<p><strong>また、B社の事例では...</strong></p>
<p>B社は〇〇を導入した結果、売上が前年比150%に成長しました。</p>
<p>担当者は「〇〇がなければ、この成果は出なかった」と語っています。</p>`, {
    }),

    createSpacer(32),
    createDivider({ variant: 'short', shortWidth: 30 }),
    createSpacer(32),

    // P: Point（結論・まとめ）
    createHeadline('まとめ', {
      level: 'h2',
      fontSize: 24,
    }),
    
    createSpacer(16),
    
    createParagraph(`<p style="text-align: center; font-size: 18px; font-weight: bold;">改めて結論です。</p>
<p style="text-align: center; font-size: 20px; color: #1d4ed8;"><strong>〇〇は△△すべきです。</strong></p>
<p style="text-align: center;">理由は3つありました。</p>
<p style="text-align: center;">①〇〇 ②△△ ③□□</p>
<p style="text-align: center;">具体例からも分かるように、〇〇の効果は明らかです。</p>`, {
      align: 'center',
      backgroundColor: '#dbeafe',
      padding: 16,
    }),

    createSpacer(32),
    
    createCtaButton('詳しく見る', '#detail', {
      size: 'lg',
      fullWidth: false,
      backgroundColor: '#2563eb',
      hoverBackgroundColor: '#1d4ed8',
    }),
    
    createSpacer(48),
  ],
};
