// =============================================
// BEAFの法則テンプレート（EC・物販向け）
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

export const beafTemplate: SalesLetterTemplate = {
  id: 'beaf',
  name: 'BEAFの法則',
  description: 'ECサイトの商品説明文に最適',
  category: 'ec_catalog',
  icon: '🛒',
  longDescription: 'ECサイトの商品説明に最適化された構成法です。シンプルで分かりやすく、購入の決め手となる情報を効率的に伝えます。',
  structure: ['Benefit（利益）', 'Evidence（証拠）', 'Advantage（優位性）', 'Feature（特徴）'],
  useCases: ['EC商品ページ', '物販', 'ガジェット・家電', '日用品'],
  settings: defaultSettings,
  content: [
    // 商品画像
    createImage('https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=2070&auto=format&fit=crop', {
      alt: '商品画像',
    }),

    // 商品名
    createHeadline('〇〇〇〇（商品名）', {
      level: 'h1',
      fontSize: 32,
    }),
    
    createSpacer(8),
    
    createParagraph(`<p style="text-align: center; color: #6b7280;">シンプルに、あなたの毎日を変える</p>`, {
      align: 'center',
    }),

    createSpacer(32),
    createDivider({ variant: 'full' }),
    createSpacer(32),

    // B: Benefit（利益）
    createHeadline('この商品があなたにもたらすもの', {
      level: 'h2',
      fontSize: 24,
    }),
    
    createSpacer(16),
    
    createParagraph(`<p><strong>✓ 毎朝の準備時間が10分短縮</strong></p>
<p>忙しい朝も、これ1つでサッと完了。時間に余裕が生まれます。</p>`, {
      backgroundColor: '#f0fdf4',
      padding: 16,
    }),
    
    createParagraph(`<p><strong>✓ 疲れにくい設計で一日中快適</strong></p>
<p>人間工学に基づいた設計で、長時間使用しても疲れにくい。</p>`, {
      backgroundColor: '#eff6ff',
      padding: 16,
    }),
    
    createParagraph(`<p><strong>✓ お手入れ簡単、いつも清潔</strong></p>
<p>丸洗いOK。忙しい毎日でも清潔を保てます。</p>`, {
      backgroundColor: '#fef3c7',
      padding: 16,
    }),

    createSpacer(32),
    createDivider({ variant: 'full' }),
    createSpacer(32),

    // E: Evidence（証拠）
    createHeadline('選ばれ続けている理由', {
      level: 'h2',
      fontSize: 24,
    }),
    
    createSpacer(16),
    
    createParagraph(`<p style="text-align: center;">
<span style="font-size: 40px; font-weight: bold; color: #f59e0b;">★ 4.8</span>
<span style="font-size: 18px; color: #6b7280;"> / 5.0</span>
</p>
<p style="text-align: center; font-size: 14px; color: #6b7280;">レビュー 1,234件</p>`, {
      align: 'center',
    }),
    
    createSpacer(16),
    
    createParagraph(`<p style="text-align: center; font-size: 18px; font-weight: bold;">累計販売数 <span style="color: #ef4444;">50,000個</span> 突破！</p>
<p style="text-align: center; font-size: 14px; color: #6b7280;">〇〇カテゴリ 売上ランキング1位獲得</p>`, {
      align: 'center',
    }),
    
    createSpacer(16),
    
    createParagraph(`<p><strong>「毎日使っています！」</strong>（30代女性）</p>
<p>★★★★★ もっと早く買えばよかった。今では手放せません。</p>`, {
    }),
    
    createParagraph(`<p><strong>「期待以上の品質」</strong>（40代男性）</p>
<p>★★★★★ 価格以上の価値があります。リピート購入決定。</p>`, {
    }),

    createSpacer(32),
    createDivider({ variant: 'full' }),
    createSpacer(32),

    // A: Advantage（優位性）
    createHeadline('他社製品との違い', {
      level: 'h2',
      fontSize: 24,
    }),
    
    createSpacer(16),
    
    createParagraph(`<table style="width: 100%; border-collapse: collapse; font-size: 14px;">
<tr style="background: #f3f4f6;">
<th style="padding: 12px; border: 1px solid #e5e7eb;"></th>
<th style="padding: 12px; border: 1px solid #e5e7eb; color: #ef4444;">当社製品</th>
<th style="padding: 12px; border: 1px solid #e5e7eb;">A社</th>
<th style="padding: 12px; border: 1px solid #e5e7eb;">B社</th>
</tr>
<tr>
<td style="padding: 12px; border: 1px solid #e5e7eb;">耐久性</td>
<td style="padding: 12px; border: 1px solid #e5e7eb; background: #fef2f2; font-weight: bold;">◎</td>
<td style="padding: 12px; border: 1px solid #e5e7eb;">○</td>
<td style="padding: 12px; border: 1px solid #e5e7eb;">△</td>
</tr>
<tr>
<td style="padding: 12px; border: 1px solid #e5e7eb;">軽量性</td>
<td style="padding: 12px; border: 1px solid #e5e7eb; background: #fef2f2; font-weight: bold;">◎</td>
<td style="padding: 12px; border: 1px solid #e5e7eb;">△</td>
<td style="padding: 12px; border: 1px solid #e5e7eb;">○</td>
</tr>
<tr>
<td style="padding: 12px; border: 1px solid #e5e7eb;">保証期間</td>
<td style="padding: 12px; border: 1px solid #e5e7eb; background: #fef2f2; font-weight: bold;">3年</td>
<td style="padding: 12px; border: 1px solid #e5e7eb;">1年</td>
<td style="padding: 12px; border: 1px solid #e5e7eb;">1年</td>
</tr>
</table>`, {
    }),

    createSpacer(32),
    createDivider({ variant: 'full' }),
    createSpacer(32),

    // F: Feature（特徴）
    createHeadline('製品仕様', {
      level: 'h2',
      fontSize: 24,
    }),
    
    createSpacer(16),
    
    createParagraph(`<ul>
<li><strong>サイズ：</strong>W 200mm × D 150mm × H 50mm</li>
<li><strong>重量：</strong>約 350g</li>
<li><strong>素材：</strong>本体：ABS樹脂 / カバー：シリコン</li>
<li><strong>カラー：</strong>ホワイト / ブラック / グレー</li>
<li><strong>付属品：</strong>取扱説明書、保証書、専用ケース</li>
<li><strong>保証：</strong>3年間メーカー保証</li>
</ul>`, {
    }),

    createSpacer(32),

    // 価格・CTA
    createParagraph(`<p style="text-align: center;"><span style="text-decoration: line-through; color: #9ca3af;">通常価格 ¥5,980</span></p>
<p style="text-align: center; font-size: 36px; font-weight: bold; color: #ef4444;">¥3,980（税込）</p>
<p style="text-align: center; font-size: 14px; color: #059669;">✓ 送料無料 ✓ 即日発送</p>`, {
      align: 'center',
    }),
    
    createSpacer(24),
    
    createCtaButton('カートに入れる', '#cart', {
      size: 'xl',
      fullWidth: true,
      backgroundColor: '#ef4444',
      hoverBackgroundColor: '#dc2626',
    }),
    
    createSpacer(48),
  ],
};
