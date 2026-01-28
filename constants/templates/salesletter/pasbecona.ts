// =============================================
// PASBECONAの法則テンプレート
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

export const pasbeconaTemplate: SalesLetterTemplate = {
  id: 'pasbecona',
  name: 'PASBECONAの法則',
  description: '情報商材や高額商品など、説得要素が多い場合に最強',
  category: 'sales_letter',
  icon: '💎',
  longDescription: 'PASONAをさらに拡張した最も説得力の高い構成法です。特に高額商品や情報商材など、十分な説得が必要な場合に効果を発揮します。',
  structure: ['Problem（問題）', 'Affinity（親近感）', 'Solution（解決策）', 'Benefit（利益）', 'Evidence（証拠）', 'Contents（内容）', 'Offer（提案）', 'Narrowing（絞込）', 'Action（行動）'],
  useCases: ['高額講座', '情報商材', 'コンサル契約', 'BtoB商材'],
  settings: defaultSettings,
  content: [
    // ヘッダー
    createImage('', {
      alt: 'ヘッダー画像',
    }),

    // P: Problem
    createHeadline('なぜ、あなたの〇〇はうまくいかないのか？', {
      level: 'h1',
      fontSize: 36,
    }),
    
    createSpacer(24),
    
    createParagraph(`<p>もしあなたが以下のような状況なら、このページは重要です。</p>
<ul>
<li>いくら頑張っても成果が出ない</li>
<li>情報は集めたが、何から始めればいいかわからない</li>
<li>このまま続けて本当に結果が出るのか不安</li>
</ul>
<p>実は、<strong>多くの人が同じ間違いを犯しています。</strong></p>`, {
    }),

    createSpacer(48),
    createDivider({ variant: 'short', shortWidth: 30 }),
    createSpacer(48),

    // A: Affinity
    createHeadline('私も3年前まで同じ状況でした', {
      level: 'h2',
      fontSize: 28,
    }),
    
    createSpacer(24),
    
    createParagraph(`<p>正直に告白します。</p>
<p>私も以前は〇〇で全くうまくいかず、何度も挫折を繰り返していました。セミナーに参加し、教材を買い、コンサルも受けました。</p>
<p>でも、<strong>なぜか成果が出ない。</strong></p>
<p>「自分には才能がないのかも...」そう思ったこともあります。</p>
<p>しかし、ある「きっかけ」で全てが変わりました。</p>`, {
    }),

    createSpacer(48),
    createDivider({ variant: 'short', shortWidth: 30 }),
    createSpacer(48),

    // S: Solution
    createHeadline('成功の鍵は「〇〇」だった', {
      level: 'h2',
      fontSize: 28,
    }),
    
    createSpacer(24),
    
    createParagraph(`<p>うまくいかない人と、成功する人の違い。</p>
<p>それは、<strong>〇〇を正しく理解しているかどうか</strong>でした。</p>
<p>多くの人は△△ばかりに注目しますが、本当に重要なのは〇〇なのです。</p>
<p>この本質に気づいてから、私の結果は劇的に変わりました。</p>`, {
    }),

    createSpacer(48),
    createDivider({ variant: 'short', shortWidth: 30 }),
    createSpacer(48),

    // B: Benefit
    createHeadline('あなたが手に入れる未来', {
      level: 'h2',
      fontSize: 28,
    }),
    
    createSpacer(24),
    
    createParagraph(`<p><strong>✓ 〇〇を達成し、収入が3倍に</strong></p>
<p>正しい方法を実践することで、効率的に成果を出せるようになります。</p>`, {
      backgroundColor: '#f0fdf4',
      padding: 16,
    }),
    
    createParagraph(`<p><strong>✓ 時間の自由を手に入れる</strong></p>
<p>無駄な作業から解放され、本当に大切なことに時間を使えます。</p>`, {
      backgroundColor: '#eff6ff',
      padding: 16,
    }),
    
    createParagraph(`<p><strong>✓ 自信を持って行動できる</strong></p>
<p>迷いがなくなり、確信を持って前に進めるようになります。</p>`, {
      backgroundColor: '#fef3c7',
      padding: 16,
    }),

    createSpacer(48),
    createDivider({ variant: 'short', shortWidth: 30 }),
    createSpacer(48),

    // E: Evidence
    createHeadline('実績・お客様の声', {
      level: 'h2',
      fontSize: 28,
    }),
    
    createSpacer(24),
    
    createParagraph(`<p style="text-align: center; font-size: 24px; font-weight: bold;">累計受講者数 <span style="color: #ef4444;">1,000名以上</span></p>
<p style="text-align: center; font-size: 24px; font-weight: bold;">満足度 <span style="color: #ef4444;">98.5%</span></p>`, {
      align: 'center',
    }),
    
    createSpacer(24),
    
    createParagraph(`<p><strong>「人生が変わりました」</strong>（40代・会社員 佐藤様）</p>
<p>長年悩んでいた問題が、たった3ヶ月で解決しました。もっと早く出会いたかったです。</p>`, {
    }),
    
    createParagraph(`<p><strong>「投資以上のリターンがありました」</strong>（30代・経営者 田中様）</p>
<p>他のサービスでは改善しなかった課題が、見事にクリアできました。</p>`, {
    }),

    createSpacer(48),
    createDivider({ variant: 'short', shortWidth: 30 }),
    createSpacer(48),

    // C: Contents
    createHeadline('プログラム内容', {
      level: 'h2',
      fontSize: 28,
    }),
    
    createSpacer(24),
    
    createParagraph(`<p><strong>【Module 1】基礎理論</strong></p>
<p>〇〇の本質を理解し、正しい土台を作ります。</p>
<p><strong>【Module 2】実践スキル</strong></p>
<p>具体的なテクニックを身につけ、すぐに行動できるようになります。</p>
<p><strong>【Module 3】応用・発展</strong></p>
<p>さらなる成果を出すための高度なノウハウを習得します。</p>
<p><strong>【特典】個別コンサルティング（30分×3回）</strong></p>
<p>あなただけの課題に合わせたアドバイスを提供します。</p>`, {
    }),

    createSpacer(48),
    createDivider({ variant: 'short', shortWidth: 30 }),
    createSpacer(48),

    // O: Offer
    createHeadline('受講料', {
      level: 'h2',
      fontSize: 28,
    }),
    
    createSpacer(24),
    
    createParagraph(`<p style="text-align: center;"><span style="text-decoration: line-through; color: #9ca3af;">通常価格 ¥298,000</span></p>
<p style="text-align: center; font-size: 18px;">今だけ特別価格</p>
<p style="text-align: center; font-size: 40px; font-weight: bold; color: #ef4444;">¥198,000（税込）</p>
<p style="text-align: center; font-size: 14px;">※分割払い可能（最大12回）</p>`, {
      align: 'center',
    }),

    createSpacer(48),
    createDivider({ variant: 'short', shortWidth: 30 }),
    createSpacer(48),

    // N: Narrowing
    createHeadline('【重要】限定募集のお知らせ', {
      level: 'h2',
      fontSize: 28,
      color: '#dc2626',
    }),
    
    createSpacer(24),
    
    createParagraph(`<p style="text-align: center;">サポートの質を担保するため、<strong>毎月10名限定</strong>での募集となります。</p>
<p style="text-align: center; font-size: 20px; font-weight: bold; color: #ef4444;">今月の残り枠：あと3名</p>
<p style="text-align: center;">定員に達し次第、募集を終了します。</p>`, {
      align: 'center',
      backgroundColor: '#fef2f2',
      padding: 16,
    }),

    createSpacer(48),

    // A: Action
    createCtaButton('今すぐ申し込む', '#apply', {
      size: 'xl',
      fullWidth: true,
      backgroundColor: '#ef4444',
      hoverBackgroundColor: '#dc2626',
    }),
    
    createSpacer(24),
    
    createParagraph(`<p style="text-align: center; font-size: 14px; color: #6b7280;">※お申し込み後、24時間以内にメールでご連絡します</p>`, {
      align: 'center',
    }),
    
    createSpacer(48),
  ],
};
