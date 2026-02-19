// =============================================
// 旧PASONAの法則テンプレート
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

export const oldPasonaTemplate: SalesLetterTemplate = {
  id: 'old-pasona',
  name: 'PASONAの法則（旧型）',
  description: 'あえて煽りや痛みを強調したい場合に有効',
  category: 'sales_letter',
  icon: '⚡',
  longDescription: '問題を煽ることで購買意欲を高める手法です。現在は新PASONAが主流ですが、緊急性が高い商材では今でも効果を発揮します。※過度な煽りは逆効果になるので注意。',
  structure: ['Problem（問題）', 'Agitation（煽り）', 'Solution（解決策）', 'Offer（提案）', 'Narrowing（絞込）', 'Action（行動）'],
  useCases: ['保険・金融', '防犯・セキュリティ', '緊急性の高いサービス'],
  settings: {
    ...defaultSettings,
    pageBackground: {
      type: 'color',
      value: '#1c1917',
      opacity: 100,
      animated: false,
      scope: 'outside',
    },
    contentBorder: {
      enabled: true,
      width: 2,
      color: '#dc2626',
    },
    contentShadow: 'lg',
    contentBorderRadius: 'sm',
  },
  content: [
    // ヘッダー
    createImage('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=2070&auto=format&fit=crop', {
      alt: 'ヘッダー画像',
      shadow: 'md',
    }),

    createSpacer(40),

    // P: Problem（問題）
    createHeadline('【警告】あなたの〇〇、このままで大丈夫ですか？', {
      level: 'h1',
      fontSize: 36,
      color: '#dc2626',
      underline: true,
      underlineColor: '#dc2626',
    }),

    createSpacer(24),

    createParagraph(`<p style="text-align: center; font-size: 18px;">今、多くの人が気づかないうちに<strong style="color: #dc2626;">深刻な問題</strong>を抱えています。</p>`, {
      align: 'center',
    }),

    createSpacer(16),

    createParagraph(`<ul>
<li>〇〇の危険性を知らずに放置している</li>
<li>△△が原因で取り返しのつかない事態に</li>
<li>「まだ大丈夫」という油断が命取りに</li>
</ul>
<p><strong>あなたは、本当に大丈夫ですか？</strong></p>`, {
      backgroundColor: '#fef2f2',
      padding: 24,
    }),

    createSpacer(40),
    createDivider({ variant: 'full', lineColor: '#fca5a5', lineWidth: 2 }),
    createSpacer(40),

    // A: Agitation（煽り）
    createHeadline('放置すると、こんな最悪の事態が...', {
      level: 'h2',
      fontSize: 28,
      color: '#dc2626',
      underline: true,
      underlineColor: '#dc2626',
    }),

    createSpacer(24),

    createParagraph(`<p>「自分は大丈夫」</p>
<p>そう思っていた人たちが、実際に経験した<strong>悲劇</strong>をお伝えします。</p>`, {
    }),

    createSpacer(16),

    createParagraph(`<p><strong>Aさん（50代・会社員）の場合</strong></p>
<p>「まさか自分がこんな目に遭うとは...」<br>気づいた時には、すでに手遅れでした。<br><strong style="color: #dc2626;">結果：〇〇万円の損失</strong></p>`, {
      backgroundColor: '#fff7ed',
      padding: 20,
    }),

    createParagraph(`<p><strong>Bさん（40代・主婦）の場合</strong></p>
<p>「もっと早く対策していれば...」<br>後悔しても、時間は戻りません。<br><strong style="color: #dc2626;">結果：家族に大きな負担</strong></p>`, {
      backgroundColor: '#fff7ed',
      padding: 20,
    }),

    createSpacer(24),

    createParagraph(`<p style="text-align: center; font-size: 20px; font-weight: bold; color: #dc2626;">あなたも、同じ後悔をしたいですか？</p>`, {
      align: 'center',
      backgroundColor: '#fef2f2',
      padding: 20,
    }),

    createSpacer(40),
    createDivider({ variant: 'full', lineColor: '#fca5a5', lineWidth: 2 }),
    createSpacer(40),

    // S: Solution（解決策）
    createHeadline('でも、安心してください', {
      level: 'h2',
      fontSize: 28,
      color: '#059669',
      underline: true,
      underlineColor: '#34d399',
    }),

    createSpacer(24),

    createParagraph(`<p style="text-align: center;">そんな最悪の事態を<strong>完全に防ぐ方法</strong>があります。</p>`, {
      align: 'center',
    }),

    createSpacer(16),

    createParagraph(`<p>私たちの「〇〇サービス」は、</p>
<ul>
<li>✓ 24時間365日、あなたを守り続けます</li>
<li>✓ 万が一の時も、すぐに対応</li>
<li>✓ プロがあなたの代わりに〇〇を管理</li>
</ul>
<p><strong>もう、一人で不安を抱える必要はありません。</strong></p>`, {
      backgroundColor: '#f0fdf4',
      padding: 24,
    }),

    createSpacer(40),
    createDivider({ variant: 'full', lineColor: '#fca5a5', lineWidth: 2 }),
    createSpacer(40),

    // O: Offer（提案）
    createHeadline('あなたの安心を守る料金', {
      level: 'h2',
      fontSize: 28,
      underline: true,
      underlineColor: '#dc2626',
    }),

    createSpacer(24),

    createParagraph(`<p style="text-align: center;">1日あたり、たったの<strong style="font-size: 32px; color: #059669;">約100円</strong></p>
<p style="text-align: center; font-size: 14px;">コーヒー1杯よりも安い金額で、<br>あなたと家族の安心を守れます。</p>`, {
      align: 'center',
      backgroundColor: '#f0fdf4',
      padding: 24,
    }),

    createSpacer(16),

    createParagraph(`<p style="text-align: center; font-size: 32px; font-weight: bold;">月額 ¥2,980（税込）</p>
<p style="text-align: center;">初月無料 / いつでも解約OK</p>`, {
      align: 'center',
      backgroundColor: '#fef2f2',
      padding: 24,
    }),

    createSpacer(40),
    createDivider({ variant: 'full', lineColor: '#fca5a5', lineWidth: 2 }),
    createSpacer(40),

    // N: Narrowing（絞込）
    createHeadline('【本日限り】特別キャンペーン実施中', {
      level: 'h2',
      fontSize: 28,
      color: '#dc2626',
      underline: true,
      underlineColor: '#dc2626',
    }),

    createSpacer(24),

    createParagraph(`<p style="text-align: center; font-size: 18px;">今日中にお申し込みの方限定で</p>
<p style="text-align: center; font-size: 24px; font-weight: bold; color: #dc2626;">初期費用 ¥10,000 → 無料</p>
<p style="text-align: center; font-size: 14px;">※このページを閉じると、特典は受けられません</p>`, {
      align: 'center',
      backgroundColor: '#fef2f2',
      padding: 24,
    }),

    createSpacer(40),

    // A: Action（行動）
    createCtaButton('今すぐ申し込む（初月無料）', '#apply', {
      size: 'xl',
      fullWidth: true,
      backgroundColor: '#dc2626',
      hoverBackgroundColor: '#b91c1c',
      shadow: 'lg',
      borderRadius: 'lg',
    }),

    createSpacer(16),

    createParagraph(`<p style="text-align: center; font-size: 14px; color: #6b7280;">手続きは1分で完了します</p>`, {
      align: 'center',
    }),

    createSpacer(48),
  ],
};
