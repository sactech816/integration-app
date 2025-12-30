import { generateBlockId } from '@/lib/types';
import { Template } from './types';

// 店舗ビジネステンプレート
export const storeTemplate: Template = {
  id: 'store',
  name: '店舗ビジネス',
  description: '美容室、整体院、エステ、ジムなど実店舗向け。メニュー・アクセス・予約導線を最適化',
  category: '店舗ビジネス',
  icon: 'Store',
  recommended: true,
  order: 4,
  theme: {
    gradient: 'linear-gradient(-45deg, #10b981, #059669, #047857, #059669)'
  },
  blocks: [
    {
      id: generateBlockId(),
      type: 'header',
      data: {
        avatar: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&h=200&fit=crop',
        name: 'リラクゼーションサロン CALM',
        title: '心と体を癒す、至福のひととき',
        category: 'business'
      }
    },
    {
      id: generateBlockId(),
      type: 'hero_fullwidth',
      data: {
        headline: '日々の疲れを、ここで手放す。',
        subheadline: '完全個室・予約制のプライベートサロン。あなただけの癒しの時間をお約束します。',
        backgroundImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop',
        ctaText: '今すぐ予約する',
        ctaUrl: '#contact'
      }
    },
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: '当サロンの特徴',
        items: [
          {
            id: generateBlockId(),
            icon: '🏠',
            title: '完全個室・予約制',
            description: '他のお客様と顔を合わせることなく、リラックスした時間をお過ごしいただけます。'
          },
          {
            id: generateBlockId(),
            icon: '👐',
            title: 'オーダーメイド施術',
            description: 'お一人おひとりの状態に合わせて、最適な施術プランをご提案します。'
          },
          {
            id: generateBlockId(),
            icon: '🌿',
            title: '天然由来の製品',
            description: 'オーガニックオイルなど、肌に優しい厳選素材のみを使用しています。'
          }
        ],
        columns: 3
      }
    },
    {
      id: generateBlockId(),
      type: 'pricing',
      data: {
        plans: [
          {
            id: generateBlockId(),
            title: 'ボディケア 60分',
            price: '¥8,800',
            features: [
              '全身のコリをほぐす',
              'オイルトリートメント',
              'ヘッドマッサージ付き',
              '初回限定 ¥6,600'
            ],
            isRecommended: false
          },
          {
            id: generateBlockId(),
            title: 'スペシャルコース 90分',
            price: '¥12,800',
            features: [
              'ボディ＋フェイシャル',
              'アロマオイル選択可',
              'ホットストーン付き',
              '一番人気のコース'
            ],
            isRecommended: true
          },
          {
            id: generateBlockId(),
            title: 'プレミアム 120分',
            price: '¥16,800',
            features: [
              'フルコース施術',
              '足湯＋ハーブティー',
              'お好みのアロマ調合',
              '至福の贅沢タイム'
            ],
            isRecommended: false
          }
        ]
      }
    },
    {
      id: generateBlockId(),
      type: 'testimonial',
      data: {
        items: [
          {
            id: generateBlockId(),
            name: 'M.T様',
            role: '40代・会社員',
            comment: '仕事のストレスで肩こりがひどかったのですが、施術後は体が軽くなりました。月1で通っています。',
            imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces'
          },
          {
            id: generateBlockId(),
            name: 'K.Y様',
            role: '30代・主婦',
            comment: '完全個室なので、子育ての疲れを気兼ねなく癒せます。スタッフの方も優しくて安心です。',
            imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces'
          }
        ]
      }
    },
    {
      id: generateBlockId(),
      type: 'google_map',
      data: {
        address: '東京都渋谷区神宮前1-2-3 〇〇ビル3F',
        title: 'アクセス',
        description: 'JR原宿駅 竹下口より徒歩3分\n東京メトロ明治神宮前駅 5番出口より徒歩5分\n\n【営業時間】10:00〜21:00（最終受付20:00）\n【定休日】毎週火曜日',
        zoom: 16,
        showDirections: true
      }
    },
    {
      id: generateBlockId(),
      type: 'faq',
      data: {
        items: [
          {
            id: generateBlockId(),
            question: '予約なしでも利用できますか？',
            answer: '完全予約制となっております。当日予約も空きがあれば可能ですので、お電話またはLINEでお問い合わせください。'
          },
          {
            id: generateBlockId(),
            question: '駐車場はありますか？',
            answer: '専用駐車場はございませんが、近隣にコインパーキングがございます。'
          },
          {
            id: generateBlockId(),
            question: 'クレジットカードは使えますか？',
            answer: 'はい、各種クレジットカード・電子マネー・PayPayに対応しております。'
          }
        ]
      }
    },
    {
      id: generateBlockId(),
      type: 'line_card',
      data: {
        title: 'LINE予約で初回20%OFF',
        description: 'お得なクーポンや空き状況をLINEでお知らせ。24時間いつでも予約OK！',
        url: 'https://lin.ee/example',
        buttonText: 'LINEで予約する'
      }
    }
  ]
};

