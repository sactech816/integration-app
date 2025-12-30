import { generateBlockId } from '@/lib/types';
import { Template } from './types';

// フリーランステンプレート
export const freelanceTemplate: Template = {
  id: 'freelance',
  name: 'フリーランス',
  description: 'デザイナー、エンジニア、ライターなどフリーランス向け。スキル・実績・料金を効果的にアピール',
  category: 'フリーランス',
  icon: 'Laptop',
  recommended: true,
  order: 6,
  theme: {
    gradient: 'linear-gradient(-45deg, #3b82f6, #2563eb, #1d4ed8, #2563eb)'
  },
  blocks: [
    {
      id: generateBlockId(),
      type: 'header',
      data: {
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces',
        name: '佐藤 健太',
        title: 'Webデザイナー / UIデザイナー',
        category: 'business'
      }
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'デザインの力で、ビジネスを加速させる。',
        text: 'フリーランス歴8年。これまで100以上のWebサイト・アプリのデザインを手がけてきました。\n\n「見た目が良い」だけでなく、「成果が出る」デザインを。\nユーザー目線とビジネス目線、両方を大切にしたデザインをご提供します。',
        align: 'center'
      }
    },
    {
      id: generateBlockId(),
      type: 'image',
      data: {
        url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=500&fit=crop',
        caption: 'これまでの制作実績（一部）'
      }
    },
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: '提供サービス',
        items: [
          {
            id: generateBlockId(),
            icon: '🎨',
            title: 'Webデザイン',
            description: 'コーポレートサイト、LP、ECサイトなど。WordPressやShopifyにも対応。'
          },
          {
            id: generateBlockId(),
            icon: '📱',
            title: 'UI/UXデザイン',
            description: 'アプリやWebサービスのUI設計。ユーザビリティを重視した設計をご提案。'
          },
          {
            id: generateBlockId(),
            icon: '✏️',
            title: 'ロゴ・バナー制作',
            description: 'ブランドイメージを形にするロゴデザイン。SNS用バナーも対応。'
          }
        ],
        columns: 3
      }
    },
    {
      id: generateBlockId(),
      type: 'testimonial',
      data: {
        items: [
          {
            id: generateBlockId(),
            name: 'A社 マーケティング担当様',
            role: 'IT企業',
            comment: 'リニューアル後、問い合わせ数が2倍に。デザインだけでなく、導線設計までしっかり考えてくれました。',
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
          },
          {
            id: generateBlockId(),
            name: 'B様',
            role: '個人事業主',
            comment: 'イメージを伝えるのが苦手でしたが、丁寧にヒアリングしてくれて、理想以上のサイトができました。',
            imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces'
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
            title: 'ランディングページ',
            price: '¥150,000〜',
            features: [
              '1ページ完結型',
              'レスポンシブ対応',
              '修正2回まで込み',
              '納期：約2週間'
            ],
            isRecommended: false
          },
          {
            id: generateBlockId(),
            title: 'コーポレートサイト',
            price: '¥300,000〜',
            features: [
              '5ページ構成',
              'CMS（WordPress）実装',
              '更新マニュアル付き',
              '納期：約1ヶ月'
            ],
            isRecommended: true
          },
          {
            id: generateBlockId(),
            title: 'UI/UXデザイン',
            price: '¥400,000〜',
            features: [
              'ユーザー調査・分析',
              'ワイヤーフレーム作成',
              'UIデザイン一式',
              'プロトタイプ作成'
            ],
            isRecommended: false
          }
        ]
      }
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '制作の流れ',
        text: '① ヒアリング（無料）\n目的・ターゲット・ご予算などをお伺いします。\n\n② ご提案・お見積り\n最適なプランをご提案。納得いただいてから着手します。\n\n③ デザイン制作\n初稿提出後、ご要望に沿って修正を行います。\n\n④ 納品・公開\n納品後も、簡単なご質問にはお答えします。',
        align: 'left'
      }
    },
    {
      id: generateBlockId(),
      type: 'links',
      data: {
        links: [
          { label: '💼 ポートフォリオサイト', url: 'https://example.com/portfolio', style: '' },
          { label: '🐦 X（Twitter）', url: 'https://x.com/example', style: '' },
          { label: '📷 Dribbble', url: 'https://dribbble.com/example', style: '' }
        ]
      }
    },
    {
      id: generateBlockId(),
      type: 'lead_form',
      data: {
        title: 'お問い合わせ・ご相談',
        buttonText: '無料相談を申し込む'
      }
    }
  ]
};

