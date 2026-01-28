// =============================================
// CREMAの法則テンプレート（短文構成向け）
// =============================================

import { SalesLetterTemplate } from '@/lib/types';
import {
  createHeadline,
  createParagraph,
  createCtaButton,
  createSpacer,
  defaultSettings,
} from './helpers';

export const cremaTemplate: SalesLetterTemplate = {
  id: 'crema',
  name: 'CREMAの法則',
  description: '短めの説明で行動を促す際に有効',
  category: 'ec_catalog',
  icon: '⚡',
  longDescription: '短い文章で効果的に行動を促す構成法です。SNS広告やメルマガなど、限られたスペースで伝える場合に最適です。',
  structure: ['Conclusion（結論）', 'Reason（理由）', 'Evidence（証拠）', 'Method（手段）', 'Action（行動）'],
  useCases: ['SNS広告', 'メルマガ', 'ランディングページ', '短い説明文'],
  settings: {
    ...defaultSettings,
    contentWidth: 600,
  },
  content: [
    // C: Conclusion（結論）
    createHeadline('たった5分で〇〇が手に入る', {
      level: 'h1',
      fontSize: 32,
      color: '#1f2937',
    }),
    
    createSpacer(16),
    
    createParagraph(`<p style="text-align: center; font-size: 18px;">もう<strong>〇〇で悩む必要はありません。</strong></p>`, {
      align: 'center',
    }),

    createSpacer(32),

    // R: Reason（理由）
    createParagraph(`<p style="text-align: center;">なぜなら、この方法は</p>
<p style="text-align: center; font-size: 20px; font-weight: bold; color: #059669;">初心者でも、忙しい人でも<br>すぐに実践できる</p>
<p style="text-align: center;">からです。</p>`, {
      align: 'center',
    }),

    createSpacer(32),

    // E: Evidence（証拠）
    createParagraph(`<p style="text-align: center; font-size: 14px; color: #6b7280;">実際の利用者の声</p>
<p style="text-align: center; font-size: 24px; font-weight: bold;">満足度 <span style="color: #f59e0b;">98%</span></p>
<p style="text-align: center; font-size: 14px;">「こんなに簡単だとは思わなかった！」</p>`, {
      align: 'center',
    }),

    createSpacer(32),

    // M: Method（手段）
    createParagraph(`<p style="text-align: center; font-weight: bold;">やることは3つだけ</p>
<p style="text-align: center;">① 登録する（1分）</p>
<p style="text-align: center;">② 〇〇を選ぶ（2分）</p>
<p style="text-align: center;">③ スタートする（2分）</p>`, {
      align: 'center',
      backgroundColor: '#f0fdf4',
      padding: 16,
    }),

    createSpacer(32),

    // A: Action（行動）
    createCtaButton('今すぐ無料で始める', '#start', {
      size: 'xl',
      fullWidth: true,
      backgroundColor: '#059669',
      hoverBackgroundColor: '#047857',
    }),
    
    createSpacer(16),
    
    createParagraph(`<p style="text-align: center; font-size: 12px; color: #6b7280;">※登録は無料です。クレジットカード不要。</p>`, {
      align: 'center',
    }),
    
    createSpacer(32),
  ],
};
