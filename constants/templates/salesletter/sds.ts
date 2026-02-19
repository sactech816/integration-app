// =============================================
// SDS法テンプレート（ニュース・速報向け）
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

export const sdsTemplate: SalesLetterTemplate = {
  id: 'sds',
  name: 'SDS法',
  description: '要約して伝える。ニュースや速報向け',
  category: 'blog_short',
  icon: '📰',
  longDescription: 'シンプルに要点を伝える構成法です。ニュースや速報、要約文など、短時間で情報を伝える必要がある場合に適しています。',
  structure: ['Summary（要約）', 'Details（詳細）', 'Summary（要約）'],
  useCases: ['ニュース', 'プレスリリース', '要約文', '速報'],
  settings: {
    ...defaultSettings,
    contentWidth: 700,
    pageBackground: {
      type: 'color',
      value: '#f3f4f6',
      opacity: 100,
      animated: false,
      scope: 'outside',
    },
    contentBorder: {
      enabled: true,
      width: 1,
      color: '#374151',
    },
    contentShadow: 'sm',
    contentBorderRadius: 'sm',
  },
  content: [
    // ヘッダー画像
    createImage('https://images.unsplash.com/photo-1504711434969-e33886168d5c?q=80&w=2070&auto=format&fit=crop', {
      alt: 'ヘッダー画像',
      shadow: 'sm',
      borderRadius: 'none',
    }),

    createSpacer(32),

    // S: Summary（要約）
    createHeadline('【速報】〇〇が△△を発表', {
      level: 'h1',
      fontSize: 28,
      underline: true,
      underlineColor: '#374151',
    }),

    createSpacer(16),

    createParagraph(`<p style="text-align: center; font-size: 18px; font-weight: bold;">
〇〇社は本日、△△を正式に発表しました。<br>
これにより、□□が大きく変わる見込みです。
</p>`, {
      align: 'center',
      backgroundColor: '#fef3c7',
      padding: 24,
    }),

    createSpacer(32),
    createDivider({ variant: 'full', lineColor: '#6b7280', lineWidth: 2 }),
    createSpacer(32),

    // D: Details（詳細）
    createHeadline('詳細', {
      level: 'h2',
      fontSize: 24,
      underline: true,
      underlineColor: '#374151',
    }),

    createSpacer(16),

    createParagraph(`<p><strong>発表の背景</strong></p>
<p>〇〇社は、かねてより△△の開発を進めてきました。今回の発表は、その集大成となるものです。</p>`, {
      backgroundColor: '#f8fafc',
      padding: 20,
    }),

    createSpacer(16),

    createParagraph(`<p><strong>主な内容</strong></p>
<ul>
<li>〇〇の新機能が追加</li>
<li>△△の価格が改定（従来比20%ダウン）</li>
<li>□□との連携が可能に</li>
</ul>`, {
      backgroundColor: '#f8fafc',
      padding: 20,
    }),

    createSpacer(16),

    createParagraph(`<p><strong>今後の展開</strong></p>
<p>〇〇社の担当者によると、今後も継続的なアップデートを予定しているとのことです。「ユーザーの皆様のフィードバックを元に、さらなる改善を進めていく」とコメントしています。</p>`, {
      backgroundColor: '#f8fafc',
      padding: 20,
    }),

    createSpacer(16),

    createParagraph(`<p><strong>業界への影響</strong></p>
<p>今回の発表は、業界全体に大きな影響を与えると予想されます。競合他社の動向にも注目が集まっています。</p>`, {
      backgroundColor: '#f8fafc',
      padding: 20,
    }),

    createSpacer(32),
    createDivider({ variant: 'full', lineColor: '#6b7280', lineWidth: 2 }),
    createSpacer(32),

    // S: Summary（まとめ）
    createHeadline('まとめ', {
      level: 'h2',
      fontSize: 24,
      underline: true,
      underlineColor: '#374151',
    }),

    createSpacer(16),

    createParagraph(`<p style="text-align: center; font-size: 16px;">
<strong>〇〇社が△△を発表。</strong><br>
主な変更点は、①〇〇の新機能、②価格改定、③□□連携の3点。<br>
今後の展開に注目です。
</p>`, {
      align: 'center',
      backgroundColor: '#f3f4f6',
      padding: 24,
    }),

    createSpacer(32),

    createCtaButton('公式サイトで詳細を見る', '#official', {
      size: 'lg',
      fullWidth: false,
      backgroundColor: '#374151',
      hoverBackgroundColor: '#1f2937',
      shadow: 'md',
      borderRadius: 'md',
    }),

    createSpacer(48),
  ],
};
