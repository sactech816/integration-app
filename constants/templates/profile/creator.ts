import { Template } from '../types';
import { generateBlockId } from '@/lib/types';

/**
 * クリエイター・アーティスト向けプロフィールLPテンプレート
 */
export const creatorTemplates: Template[] = [
  {
    id: 'creator-portfolio',
    name: '自己紹介用',
    description: 'クリエイター・自己紹介 - 親しみやすさ・SNSハブ',
    category: 'クリエイター・アーティスト',
    theme: {
      gradient: 'linear-gradient(-45deg, #f472b6, #ec4899, #fbbf24, #f59e0b)'
    },
    blocks: [
      {
        id: generateBlockId(),
        type: 'header',
        data: {
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
          name: '鈴木 アイリ',
          title: 'Illustrator / Graphic Designer',
          category: 'other'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '日常に、少しの彩りを。',
          text: '東京在住のフリーランスイラストレーターです。水彩画のような柔らかいタッチで、見る人の心がホッとする作品作りを心がけています。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'image',
        data: {
          url: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
          caption: 'Recent Works'
        }
      },
      {
        id: generateBlockId(),
        type: 'image',
        data: {
          url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
          caption: 'Portfolio Gallery'
        }
      },
      {
        id: generateBlockId(),
        type: 'links',
        data: {
          links: [
            { label: 'Instagram - イラスト作品を毎日投稿中', url: 'https://instagram.com/example', style: '' },
            { label: 'X (Twitter) - お仕事の告知や日常のつぶやき', url: 'https://x.com/example', style: '' }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'youtube',
        data: { url: 'https://www.youtube.com/watch?v=N2NIQztcYyw' }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: 'アナログ水彩のメイキング動画を公開しています。',
          text: 'YouTubeチャンネルでは、水彩画の制作過程や画材の使い方、イラストのコツなどを紹介しています。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'kindle',
        data: {
          asin: 'B08XXXXXXX',
          imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
          title: '鈴木アイリ作品集 Vol.1',
          description: '2023年までに制作したお気に入りのイラストをまとめたZINEです。'
        }
      },
      {
        id: generateBlockId(),
        type: 'line_card',
        data: {
          title: 'お仕事のご依頼はこちら',
          description: 'イラスト制作のご依頼やお見積もりのご相談はLINEからお気軽にどうぞ',
          url: 'https://lin.ee/example',
          buttonText: 'LINEで問い合わせる'
        }
      }
    ]
  }
];

















































































































