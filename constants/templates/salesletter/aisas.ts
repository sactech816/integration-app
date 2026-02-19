// =============================================
// AISAS（＋AISCEAS）テンプレート（マーケティング設計向け）
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

export const aisasTemplate: SalesLetterTemplate = {
  id: 'aisas',
  name: 'AISAS / AISCEAS',
  description: 'Webマーケティング全体の流れ確認用',
  category: 'marketing',
  icon: '🔄',
  longDescription: 'インターネット時代の消費者行動モデルです。検索と共有が含まれているのが特徴で、Web施策の全体設計に活用できます。AISCEASは比較・検討のフェーズを追加した発展形です。',
  structure: ['Attention（注意）', 'Interest（興味）', 'Search（検索）', 'Action（行動）', 'Share（共有）'],
  useCases: ['Webマーケティング戦略', 'SNSマーケティング', 'コンテンツマーケティング'],
  settings: defaultSettings,
  content: [
    // ヘッダー画像
    createImage('https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop', {
      alt: 'ヘッダー画像',
    }),

    // タイトル
    createHeadline('【構成案】AISASモデルに基づくLP設計', {
      level: 'h1',
      fontSize: 28,
      color: '#7c3aed',
    }),
    
    createSpacer(16),
    
    createParagraph(`<p style="text-align: center; color: #6b7280;">このテンプレートは、AISASモデルに基づいてLP全体の流れを設計するためのガイドです。<br>各セクションに必要な要素を記載しています。</p>`, {
      align: 'center',
    }),

    createSpacer(32),
    createDivider({ variant: 'full' }),
    createSpacer(32),

    // A: Attention（注意）
    createHeadline('1. Attention（注意を引く）', {
      level: 'h2',
      fontSize: 24,
      color: '#7c3aed',
    }),
    
    createSpacer(16),
    
    createParagraph(`<p><strong>目的：</strong>ユーザーの目を止め、興味を持ってもらう</p>
<p><strong>このセクションに必要な要素：</strong></p>
<ul>
<li>✓ インパクトのあるキャッチコピー</li>
<li>✓ 目を引くビジュアル（画像・動画）</li>
<li>✓ ターゲットに刺さるメッセージ</li>
</ul>
<p><strong>施策例：</strong>SNS広告、バナー広告、キャッチーなファーストビュー</p>`, {
      backgroundColor: '#f5f3ff',
      padding: 16,
    }),

    createSpacer(32),

    // I: Interest（興味）
    createHeadline('2. Interest（興味を持たせる）', {
      level: 'h2',
      fontSize: 24,
      color: '#7c3aed',
    }),
    
    createSpacer(16),
    
    createParagraph(`<p><strong>目的：</strong>「もっと知りたい」と思わせる</p>
<p><strong>このセクションに必要な要素：</strong></p>
<ul>
<li>✓ 具体的なベネフィットの提示</li>
<li>✓ 共感を得る問題提起</li>
<li>✓ ストーリー性のある導入</li>
</ul>
<p><strong>施策例：</strong>課題への共感、Before/After、ユーザーの声</p>`, {
      backgroundColor: '#eff6ff',
      padding: 16,
    }),

    createSpacer(32),

    // S: Search（検索）
    createHeadline('3. Search（検索される）', {
      level: 'h2',
      fontSize: 24,
      color: '#7c3aed',
    }),
    
    createSpacer(16),
    
    createParagraph(`<p><strong>目的：</strong>検索されたときに見つけてもらう</p>
<p><strong>このセクションに必要な要素：</strong></p>
<ul>
<li>✓ SEO対策（キーワード最適化）</li>
<li>✓ 比較検討材料の提供</li>
<li>✓ FAQ・詳細情報</li>
</ul>
<p><strong>施策例：</strong>比較表、詳細スペック、よくある質問、ブログ記事</p>`, {
      backgroundColor: '#f0fdf4',
      padding: 16,
    }),

    createSpacer(32),

    // A: Action（行動）
    createHeadline('4. Action（行動させる）', {
      level: 'h2',
      fontSize: 24,
      color: '#7c3aed',
    }),
    
    createSpacer(16),
    
    createParagraph(`<p><strong>目的：</strong>購入・申込みを促す</p>
<p><strong>このセクションに必要な要素：</strong></p>
<ul>
<li>✓ 明確なCTA（行動喚起）</li>
<li>✓ 限定性・緊急性</li>
<li>✓ リスク軽減（返金保証など）</li>
<li>✓ 簡単な申込みフロー</li>
</ul>
<p><strong>施策例：</strong>CTAボタン、限定オファー、保証、簡単フォーム</p>`, {
      backgroundColor: '#fef3c7',
      padding: 16,
    }),

    createSpacer(32),

    // S: Share（共有）
    createHeadline('5. Share（共有してもらう）', {
      level: 'h2',
      fontSize: 24,
      color: '#7c3aed',
    }),
    
    createSpacer(16),
    
    createParagraph(`<p><strong>目的：</strong>口コミ・シェアで拡散</p>
<p><strong>このセクションに必要な要素：</strong></p>
<ul>
<li>✓ シェアボタンの設置</li>
<li>✓ シェアしたくなる要素</li>
<li>✓ レビュー・口コミの促進</li>
<li>✓ 紹介キャンペーン</li>
</ul>
<p><strong>施策例：</strong>SNSシェアボタン、レビュー依頼、紹介特典</p>`, {
      backgroundColor: '#fce7f3',
      padding: 16,
    }),

    createSpacer(32),
    createDivider({ variant: 'full' }),
    createSpacer(32),

    // まとめ
    createHeadline('チェックリスト', {
      level: 'h2',
      fontSize: 24,
    }),
    
    createSpacer(16),
    
    createParagraph(`<p>LP作成時に以下を確認してください：</p>
<ul>
<li>□ Attention：ファーストビューで注意を引けているか</li>
<li>□ Interest：ベネフィットが明確に伝わっているか</li>
<li>□ Search：SEO対策・比較情報は十分か</li>
<li>□ Action：CTAは明確で、申込みは簡単か</li>
<li>□ Share：シェアしやすい仕組みがあるか</li>
</ul>`, {
    }),
    
    createSpacer(48),
  ],
};
