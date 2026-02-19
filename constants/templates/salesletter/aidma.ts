// =============================================
// AIDMA / AIDCASテンプレート（マーケティング設計向け）
// =============================================

import { SalesLetterTemplate } from '@/lib/types';
import {
  createHeadline,
  createParagraph,
  createSpacer,
  createDivider,
  createImage,
  defaultSettings,
} from './helpers';

export const aidmaTemplate: SalesLetterTemplate = {
  id: 'aidma',
  name: 'AIDMA / AIDCAS',
  description: '古典的な消費行動の確認用',
  category: 'marketing',
  icon: '📊',
  longDescription: '古典的な消費者行動モデルです。主にマス広告時代のモデルですが、基本的な購買心理を理解するのに役立ちます。AIDCASは確信・満足を追加した発展形です。',
  structure: ['Attention（注意）', 'Interest（興味）', 'Desire（欲求）', 'Memory（記憶）', 'Action（行動）'],
  useCases: ['ブランディング', 'テレビCM', '認知拡大施策'],
  settings: {
    ...defaultSettings,
    pageBackground: {
      type: 'gradient',
      value: 'linear-gradient(135deg, #0891b2 0%, #065f73 100%)',
      opacity: 100,
      animated: false,
      scope: 'outside',
    },
    contentShadow: 'lg',
    contentBorderRadius: 'lg',
  },
  content: [
    // ヘッダー画像
    createImage('https://images.unsplash.com/photo-1533750349088-cd871a92f312?q=80&w=2070&auto=format&fit=crop', {
      alt: 'ヘッダー画像',
      shadow: 'md',
      borderRadius: 'none',
    }),

    createSpacer(32),

    // タイトル
    createHeadline('【構成案】AIDMAモデルに基づく設計', {
      level: 'h1',
      fontSize: 28,
      color: '#0891b2',
      underline: true,
      underlineColor: '#67e8f9',
    }),

    createSpacer(16),

    createParagraph(`<p style="text-align: center; color: #6b7280;">このテンプレートは、古典的なAIDMAモデルに基づいて<br>消費者の購買心理を理解するためのガイドです。</p>`, {
      align: 'center',
    }),

    createSpacer(32),
    createDivider({ variant: 'wave', lineColor: '#67e8f9' }),
    createSpacer(32),

    // A: Attention（注意）
    createHeadline('1. Attention（注意）', {
      level: 'h2',
      fontSize: 24,
      color: '#0891b2',
      underline: true,
      underlineColor: '#67e8f9',
    }),

    createSpacer(16),

    createParagraph(`<p><strong>消費者の状態：</strong>商品・サービスの存在を知る</p>
<p><strong>目標：</strong>認知を獲得する</p>
<p><strong>施策例：</strong></p>
<ul>
<li>• マス広告（テレビ、新聞、雑誌）</li>
<li>• Web広告（ディスプレイ、SNS）</li>
<li>• PR活動</li>
<li>• インフルエンサーマーケティング</li>
</ul>`, {
      backgroundColor: '#ecfeff',
      padding: 20,
    }),

    createSpacer(24),

    // I: Interest（興味）
    createHeadline('2. Interest（興味）', {
      level: 'h2',
      fontSize: 24,
      color: '#0891b2',
      underline: true,
      underlineColor: '#67e8f9',
    }),

    createSpacer(16),

    createParagraph(`<p><strong>消費者の状態：</strong>「これ、気になる」と興味を持つ</p>
<p><strong>目標：</strong>興味関心を高める</p>
<p><strong>施策例：</strong></p>
<ul>
<li>• 魅力的なコピーライティング</li>
<li>• ベネフィットの提示</li>
<li>• ストーリーテリング</li>
<li>• お役立ちコンテンツ</li>
</ul>`, {
      backgroundColor: '#f0fdfa',
      padding: 20,
    }),

    createSpacer(24),

    // D: Desire（欲求）
    createHeadline('3. Desire（欲求）', {
      level: 'h2',
      fontSize: 24,
      color: '#0891b2',
      underline: true,
      underlineColor: '#67e8f9',
    }),

    createSpacer(16),

    createParagraph(`<p><strong>消費者の状態：</strong>「欲しい」という欲求が生まれる</p>
<p><strong>目標：</strong>購買意欲を刺激する</p>
<p><strong>施策例：</strong></p>
<ul>
<li>• 具体的なメリットの提示</li>
<li>• 使用シーンのイメージ化</li>
<li>• お客様の声・事例</li>
<li>• 限定性・希少性の演出</li>
</ul>`, {
      backgroundColor: '#f0fdf4',
      padding: 20,
    }),

    createSpacer(24),

    // M: Memory（記憶）
    createHeadline('4. Memory（記憶）', {
      level: 'h2',
      fontSize: 24,
      color: '#0891b2',
      underline: true,
      underlineColor: '#67e8f9',
    }),

    createSpacer(16),

    createParagraph(`<p><strong>消費者の状態：</strong>商品を記憶し、購入タイミングを待つ</p>
<p><strong>目標：</strong>記憶に残り、想起されやすくする</p>
<p><strong>施策例：</strong></p>
<ul>
<li>• リマーケティング広告</li>
<li>• メールマーケティング</li>
<li>• ブランドの一貫性維持</li>
<li>• 印象的なキャッチフレーズ</li>
<li>• 繰り返しの接触</li>
</ul>
<p style="color: #6b7280; font-size: 14px;">※ AIDMAの特徴的なフェーズ。デジタル時代では「検索」に置き換わることも。</p>`, {
      backgroundColor: '#fffbeb',
      padding: 20,
    }),

    createSpacer(24),

    // A: Action（行動）
    createHeadline('5. Action（行動）', {
      level: 'h2',
      fontSize: 24,
      color: '#0891b2',
      underline: true,
      underlineColor: '#67e8f9',
    }),

    createSpacer(16),

    createParagraph(`<p><strong>消費者の状態：</strong>実際に購入する</p>
<p><strong>目標：</strong>購入のハードルを下げ、行動を促す</p>
<p><strong>施策例：</strong></p>
<ul>
<li>• 明確なCTA</li>
<li>• 購入プロセスの簡略化</li>
<li>• 複数の決済手段</li>
<li>• 返金保証・お試し</li>
<li>• 期間限定オファー</li>
</ul>`, {
      backgroundColor: '#fce7f3',
      padding: 20,
    }),

    createSpacer(32),
    createDivider({ variant: 'wave', lineColor: '#67e8f9' }),
    createSpacer(32),

    // AIDCAS追加要素
    createHeadline('【発展形】AIDCASモデル', {
      level: 'h2',
      fontSize: 24,
      underline: true,
      underlineColor: '#67e8f9',
    }),

    createSpacer(16),

    createParagraph(`<p>AIDMAに「Conviction（確信）」と「Satisfaction（満足）」を追加したモデルです。</p>
<p><strong>C: Conviction（確信）</strong></p>
<p>「これで間違いない」という確信を持たせる。<br>→ 比較情報、専門家の推薦、詳細なスペック提供</p>
<p><strong>S: Satisfaction（満足）</strong></p>
<p>購入後の満足を高め、リピート・紹介につなげる。<br>→ アフターフォロー、コミュニティ、ロイヤルティプログラム</p>`, {
      backgroundColor: '#ecfeff',
      padding: 24,
    }),

    createSpacer(32),

    // チェックリスト
    createHeadline('施策チェックリスト', {
      level: 'h2',
      fontSize: 24,
      underline: true,
      underlineColor: '#67e8f9',
    }),

    createSpacer(16),

    createParagraph(`<ul>
<li>□ Attention：認知獲得の施策は十分か</li>
<li>□ Interest：興味を引くコンテンツがあるか</li>
<li>□ Desire：欲求を刺激する要素があるか</li>
<li>□ Memory：記憶に残る工夫があるか</li>
<li>□ Action：購入しやすい導線があるか</li>
<li>□ （Conviction）：確信を持たせる情報があるか</li>
<li>□ （Satisfaction）：購入後のフォローがあるか</li>
</ul>`, {
      backgroundColor: '#f0fdfa',
      padding: 24,
    }),

    createSpacer(48),
  ],
};
