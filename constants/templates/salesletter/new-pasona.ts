// =============================================
// 新PASONAの法則テンプレート
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

export const newPasonaTemplate: SalesLetterTemplate = {
  id: 'new-pasona',
  name: '新PASONAの法則',
  description: '現代のスタンダード。親近感を軸に自然な購買行動を促す',
  category: 'sales_letter',
  icon: '🎯',
  longDescription: '消費者の心理に寄り添いながら、自然な流れで購買行動を促す現代のスタンダードな構成法です。旧PASONAの「煽り」要素を「親近感」に置き換え、より共感ベースのアプローチを取ります。',
  structure: ['Problem（問題提起）', 'Affinity（親近感）', 'Solution（解決策）', 'Offer（提案）', 'Narrowing（絞込）', 'Action（行動喚起）'],
  useCases: ['コンサルティング', 'コーチング', '教材・講座', 'サービス全般'],
  settings: defaultSettings,
  content: [
    // ヘッダー画像
    createImage('https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop', {
      alt: 'ヘッダー画像',
    }),

    // P: Problem（問題提起）
    createHeadline('その悩み、本当に解決できていますか？', {
      level: 'h1',
      fontSize: 36,
      color: '#1f2937',
    }),
    
    createSpacer(24),
    
    createParagraph(`<p>こんなお悩みはありませんか？</p>
<ul>
<li>何度も同じ失敗を繰り返してしまう</li>
<li>時間とお金をかけても成果が出ない</li>
<li>どこに相談すればいいかわからない</li>
</ul>
<p>このまま放置すると、さらに状況は悪化するかもしれません。</p>`, {
      align: 'left',
    }),

    createSpacer(48),
    createDivider({ variant: 'short', shortWidth: 30 }),
    createSpacer(48),

    // A: Affinity（親近感）
    createHeadline('私も同じ悩みを抱えていました', {
      level: 'h2',
      fontSize: 28,
    }),
    
    createSpacer(24),
    
    createParagraph(`<p>実は、私自身も以前は同じような問題に悩まされていました。</p>
<p>何度も失敗を繰り返し、「自分には無理なのかもしれない」と諦めかけたこともあります。</p>
<p>しかし、<strong>ある方法に出会ってから、すべてが変わりました。</strong></p>
<p>今では〇〇を達成し、多くの方のサポートができるまでになりました。</p>
<p>あなたの気持ち、痛いほどよくわかります。<br>だからこそ、同じ悩みを持つあなたの力になりたいのです。</p>`, {
      align: 'left',
    }),

    createSpacer(48),
    createDivider({ variant: 'short', shortWidth: 30 }),
    createSpacer(48),

    // S: Solution（解決策）
    createHeadline('問題を解決する3つの方法', {
      level: 'h2',
      fontSize: 28,
    }),
    
    createSpacer(24),
    
    createParagraph(`<p><strong>💡 解決策①：〇〇メソッド</strong></p>
<p>独自開発した〇〇メソッドで、根本原因から解決。再発を防ぎます。</p>`, {
      backgroundColor: '#f0fdf4',
      padding: 16,
    }),
    
    createParagraph(`<p><strong>🎯 解決策②：個別カスタマイズ</strong></p>
<p>あなたの状況に合わせた完全オーダーメイドの解決策をご提案します。</p>`, {
      backgroundColor: '#eff6ff',
      padding: 16,
    }),
    
    createParagraph(`<p><strong>🤝 解決策③：継続サポート</strong></p>
<p>一度きりではなく、成果が出るまで継続的にサポートします。</p>`, {
      backgroundColor: '#fef3c7',
      padding: 16,
    }),

    createSpacer(48),
    createDivider({ variant: 'short', shortWidth: 30 }),
    createSpacer(48),

    // O: Offer（提案）
    createHeadline('ご提供サービス', {
      level: 'h2',
      fontSize: 28,
    }),
    
    createSpacer(24),
    
    createParagraph(`<p style="text-align: center;"><strong>3ヶ月集中プログラム</strong></p>
<p style="text-align: center; font-size: 32px; font-weight: bold; color: #ef4444;">¥165,000（税込）</p>
<ul>
<li>週1回の個別セッション（60分×12回）</li>
<li>いつでもチャット相談OK</li>
<li>専用ワークシート・教材付き</li>
<li>成果が出るまで徹底サポート</li>
<li>【特典】フォローアップ1ヶ月無料</li>
</ul>`, {
      align: 'center',
    }),

    createSpacer(48),
    createDivider({ variant: 'short', shortWidth: 30 }),
    createSpacer(48),

    // N: Narrowing（絞込）
    createHeadline('ただし、誰でも受けられるわけではありません', {
      level: 'h2',
      fontSize: 28,
      color: '#dc2626',
    }),
    
    createSpacer(24),
    
    createParagraph(`<p style="text-align: center;">質の高いサポートを提供するため、<strong>毎月の受付人数を限定</strong>しています。</p>
<p style="text-align: center; font-size: 20px; font-weight: bold;">✓ 今月の残り枠：<span style="color: #ef4444;">あと3名様</span></p>
<p style="text-align: center; font-size: 20px; font-weight: bold;">✓ 申込締切：今月末まで</p>
<p style="text-align: center;">本気で解決したい方だけ、今すぐお申し込みください。</p>`, {
      align: 'center',
      backgroundColor: '#fef2f2',
      padding: 16,
    }),

    createSpacer(48),

    // A: Action（行動喚起）
    createHeadline('今すぐ無料相談を申し込む', {
      level: 'h2',
      fontSize: 28,
    }),
    
    createSpacer(24),
    
    createParagraph(`<p style="text-align: center;">まずは無料相談であなたの状況をお聞かせください。<br>あなたに最適な解決策をご提案します。</p>`, {
      align: 'center',
    }),
    
    createSpacer(24),
    
    createCtaButton('無料相談に申し込む（残り3名）', '#contact', {
      size: 'xl',
      fullWidth: true,
      backgroundColor: '#ef4444',
      hoverBackgroundColor: '#dc2626',
    }),
    
    createSpacer(48),
  ],
};
