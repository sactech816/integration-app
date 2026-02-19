// =============================================
// QUESTの法則テンプレート
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

export const questTemplate: SalesLetterTemplate = {
  id: 'quest',
  name: 'QUESTの法則',
  description: '物語のようにスムーズに読ませたい場合に最適',
  category: 'sales_letter',
  icon: '📖',
  longDescription: '読者を物語に引き込むように自然に読ませる構成法です。ストーリーテリングを重視し、感情に訴えかけることで行動を促します。',
  structure: ['Qualify（適格化）', 'Understand（理解）', 'Educate（教育）', 'Stimulate（刺激）', 'Transition（転換）'],
  useCases: ['自己啓発系', '転職・キャリア', 'ダイエット・美容', 'ストーリー重視の商材'],
  settings: {
    ...defaultSettings,
    pageBackground: {
      type: 'gradient',
      value: 'linear-gradient(180deg, #fef7ed 0%, #f5f0e8 100%)',
      opacity: 100,
      animated: false,
      scope: 'outside',
    },
    contentShadow: 'md',
    contentBorderRadius: 'xl',
  },
  content: [
    // ヘッダー
    createImage('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop', {
      alt: 'ヘッダー画像',
      shadow: 'md',
      borderRadius: 'none',
    }),

    createSpacer(40),

    // Q: Qualify（適格化）
    createHeadline('〇〇でお悩みのあなたへ', {
      level: 'h1',
      fontSize: 36,
      underline: true,
      underlineColor: '#d97706',
      backgroundColor: '#fffbeb',
      padding: 20,
    }),

    createSpacer(24),

    createParagraph(`<p style="text-align: center;">このページは、以下のような方のために書きました。</p>`, {
      align: 'center',
    }),

    createSpacer(16),

    createParagraph(`<ul>
<li>〇〇を本気で改善したいと思っている方</li>
<li>これまで色々試したが、うまくいかなかった方</li>
<li>正しい方法を知りたい方</li>
<li>変わりたいという強い意志がある方</li>
</ul>
<p>もし一つでも当てはまるなら、このまま読み進めてください。<br><strong>あなたの人生を変えるきっかけ</strong>になるかもしれません。</p>`, {
      backgroundColor: '#fffbeb',
      padding: 24,
    }),

    createSpacer(40),
    createDivider({ variant: 'wave', lineColor: '#fbbf24' }),
    createSpacer(40),

    // U: Understand（理解）
    createHeadline('あなたの気持ち、よくわかります', {
      level: 'h2',
      fontSize: 28,
      underline: true,
      underlineColor: '#d97706',
      backgroundColor: '#fffbeb',
      padding: 20,
    }),

    createSpacer(24),

    createParagraph(`<p>毎日頑張っているのに、なぜか結果が出ない。</p>
<p>周りは上手くいっているように見えるのに、自分だけが取り残されている気がする。</p>
<p>「自分には向いていないのかも...」</p>
<p>そんな風に、<strong>自分を責めていませんか？</strong></p>
<p>でも、安心してください。</p>
<p>それは<strong>あなたのせいではありません。</strong></p>
<p>正しい方法を知らなかっただけなのです。</p>`, {
      backgroundColor: '#fefce8',
      padding: 20,
    }),

    createSpacer(40),
    createDivider({ variant: 'wave', lineColor: '#fbbf24' }),
    createSpacer(40),

    // E: Educate（教育）
    createHeadline('なぜ、多くの人が失敗するのか？', {
      level: 'h2',
      fontSize: 28,
      underline: true,
      underlineColor: '#d97706',
      backgroundColor: '#fffbeb',
      padding: 20,
    }),

    createSpacer(24),

    createParagraph(`<p>実は、〇〇がうまくいかない人には<strong>共通点</strong>があります。</p>
<p>それは...</p>`, {
      backgroundColor: '#fefce8',
      padding: 20,
    }),

    createSpacer(16),

    createParagraph(`<p style="text-align: center; font-size: 24px; font-weight: bold; color: #dc2626;">「△△を間違えている」</p>`, {
      align: 'center',
      backgroundColor: '#fef2f2',
      padding: 24,
    }),

    createSpacer(24),

    createParagraph(`<p>多くの人は、〇〇をするとき、まず△△から始めます。</p>
<p>しかし、これこそが<strong>最大の間違い</strong>なのです。</p>
<p>本当に重要なのは、△△ではなく<strong>□□</strong>。</p>
<p>この順序を変えるだけで、結果は180度変わります。</p>`, {
      backgroundColor: '#fefce8',
      padding: 20,
    }),

    createSpacer(40),
    createDivider({ variant: 'wave', lineColor: '#fbbf24' }),
    createSpacer(40),

    // S: Stimulate（刺激）
    createHeadline('想像してみてください...', {
      level: 'h2',
      fontSize: 28,
      underline: true,
      underlineColor: '#d97706',
      backgroundColor: '#fffbeb',
      padding: 20,
    }),

    createSpacer(24),

    createParagraph(`<p>もし、〇〇を手に入れたら、あなたの人生はどう変わりますか？</p>`, {
      backgroundColor: '#fefce8',
      padding: 20,
    }),

    createSpacer(16),

    createParagraph(`<p><strong>朝起きた時</strong></p>
<p>「今日も頑張らなきゃ...」というプレッシャーから解放され、<br>ワクワクした気持ちで一日をスタートできる。</p>`, {
      backgroundColor: '#f0fdf4',
      padding: 20,
    }),

    createParagraph(`<p><strong>仕事をしている時</strong></p>
<p>自信を持って行動でき、周りからも認められる。<br>「あなたに頼みたい」と言われることが増える。</p>`, {
      backgroundColor: '#eff6ff',
      padding: 20,
    }),

    createParagraph(`<p><strong>1年後のあなた</strong></p>
<p>「あの時、始めて本当によかった」<br>そう心から思える未来が待っています。</p>`, {
      backgroundColor: '#fffbeb',
      padding: 20,
    }),

    createSpacer(40),
    createDivider({ variant: 'wave', lineColor: '#fbbf24' }),
    createSpacer(40),

    // T: Transition（転換）
    createHeadline('その未来を、今すぐ手に入れませんか？', {
      level: 'h2',
      fontSize: 28,
      underline: true,
      underlineColor: '#d97706',
      backgroundColor: '#fffbeb',
      padding: 20,
    }),

    createSpacer(24),

    createParagraph(`<p style="text-align: center;">私が提供する「〇〇プログラム」では、</p>
<p style="text-align: center;"><strong>あなたが最短で結果を出すための</strong></p>
<p style="text-align: center;"><strong>すべてをお伝えします。</strong></p>`, {
      align: 'center',
      backgroundColor: '#fefce8',
      padding: 20,
    }),

    createSpacer(24),

    createParagraph(`<p style="text-align: center; font-size: 32px; font-weight: bold; color: #d97706;">¥98,000（税込）</p>
<p style="text-align: center;">30日間の返金保証付き</p>`, {
      align: 'center',
      backgroundColor: '#fffbeb',
      padding: 24,
    }),

    createSpacer(32),

    createCtaButton('今すぐ始める', '#apply', {
      size: 'xl',
      fullWidth: true,
      backgroundColor: '#d97706',
      hoverBackgroundColor: '#b45309',
      shadow: 'lg',
      borderRadius: 'lg',
    }),

    createSpacer(24),

    createParagraph(`<p style="text-align: center; font-size: 14px; color: #6b7280;">あなたの人生を変える一歩は、ここから始まります。</p>`, {
      align: 'center',
    }),

    createSpacer(48),
  ],
};
