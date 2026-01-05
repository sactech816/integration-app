import { Template } from '../types';
import { generateBlockId } from '@/lib/types';

/**
 * コンサル・士業向けプロフィールLPテンプレート
 */
export const consultantTemplates: Template[] = [
  {
    id: 'business-consultant',
    name: 'ビジネス用',
    description: 'ビジネス・コンサルタント - 信頼・権威性重視',
    category: 'コンサル・士業',
    theme: {
      gradient: 'linear-gradient(-45deg, #334155, #475569, #64748b, #475569)'
    },
    blocks: [
      {
        id: generateBlockId(),
        type: 'header',
        data: {
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
          name: '田中 誠',
          title: '中小企業診断士 / 経営コンサルタント',
          category: 'business'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '『経営の孤独』に寄り添い、確かな成長戦略を。',
          text: '大手ファームで10年の経験を経て独立。これまで100社以上の中小企業の経営改善に携わってきました。社長の『想い』を『戦略』へ落とし込みます。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'image',
        data: {
          url: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop',
          caption: '年間50回以上のセミナー登壇実績'
        }
      },
      {
        id: generateBlockId(),
        type: 'testimonial',
        data: {
          items: [
            {
              id: generateBlockId(),
              name: '佐藤様',
              role: '株式会社A 代表',
              comment: '半年で黒字化を達成できました',
              imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces'
            },
            {
              id: generateBlockId(),
              name: '鈴木様',
              role: 'B整骨院 院長',
              comment: '離職率が劇的に下がりました',
              imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
            }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'pricing',
        data: {
          plans: [
            {
              id: generateBlockId(),
              title: 'スポット経営相談',
              price: '¥33,000',
              features: ['90分の個別相談', '経営課題のヒアリング', '具体的な改善提案書', 'メールフォローアップ'],
              isRecommended: false
            },
            {
              id: generateBlockId(),
              title: '月次顧問契約',
              price: '¥110,000〜',
              features: ['月2回の定期面談', '戦略立案と実行支援', '24時間メールサポート', '経営会議への参加'],
              isRecommended: true
            },
            {
              id: generateBlockId(),
              title: '事業計画書作成代行',
              price: '¥220,000〜',
              features: ['包括的な事業計画策定', '資金調達サポート', '金融機関との調整', '3ヶ月間のフォロー'],
              isRecommended: false
            }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'faq',
        data: {
          items: [
            { id: generateBlockId(), question: '地方でも対応可能ですか？', answer: 'はい、オンラインにて全国対応可能です。' },
            { id: generateBlockId(), question: '得意な業種は？', answer: '小売・サービス・IT関連の実績が豊富ですが、業種問わず対応可能です。' }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'line_card',
        data: {
          title: '公式LINEでノウハウ配信中',
          description: '登録者限定で『資金繰りチェックシート』をプレゼント',
          url: 'https://lin.ee/example',
          buttonText: 'LINE登録する'
        }
      },
      {
        id: generateBlockId(),
        type: 'lead_form',
        data: { title: 'お問い合わせ・講演依頼', buttonText: 'お問い合わせする' }
      }
    ]
  }
];























































































