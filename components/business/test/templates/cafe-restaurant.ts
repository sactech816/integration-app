import { generateBlockId } from '@/lib/types';
import { Template } from './types';

// カフェ・飲食店テンプレート
export const cafeRestaurantTemplate: Template = {
  id: 'cafe-restaurant',
  name: 'カフェ・飲食店',
  description: 'カフェ、レストラン、居酒屋など飲食店向け。メニュー・こだわり・アクセスを魅力的に紹介',
  category: 'カフェ・飲食店',
  icon: 'Coffee',
  recommended: false,
  order: 5,
  theme: {
    gradient: 'linear-gradient(-45deg, #92400e, #b45309, #d97706, #b45309)'
  },
  blocks: [
    {
      id: generateBlockId(),
      type: 'header',
      data: {
        avatar: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop',
        name: 'Café Lumière',
        title: '光あふれる、くつろぎの空間',
        category: 'other'
      }
    },
    {
      id: generateBlockId(),
      type: 'image',
      data: {
        url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=500&fit=crop',
        caption: '大きな窓から自然光が差し込む、開放的な店内'
      }
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '日常に、ちょっとした贅沢を。',
        text: '自家焙煎のスペシャルティコーヒーと、毎朝手作りするスイーツ。\n\n忙しい日々の中で、ほっと一息つける場所でありたい。\nそんな想いで、一杯一杯丁寧にお淹れしています。\n\nお一人でも、大切な人とでも。\nあなたのお気に入りの時間を見つけてください。',
        align: 'center'
      }
    },
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: '当店のこだわり',
        items: [
          {
            id: generateBlockId(),
            icon: '☕',
            title: '自家焙煎コーヒー',
            description: '厳選した豆を店内で焙煎。鮮度にこだわった一杯をお届けします。'
          },
          {
            id: generateBlockId(),
            icon: '🍰',
            title: '手作りスイーツ',
            description: '毎朝パティシエが手作り。季節のフルーツを使った限定メニューも。'
          },
          {
            id: generateBlockId(),
            icon: '🌿',
            title: '居心地の良い空間',
            description: 'Wi-Fi・電源完備。お仕事や読書にもご利用いただけます。'
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
            title: 'ドリンク',
            price: '¥450〜',
            features: [
              'ブレンドコーヒー ¥450',
              'カフェラテ ¥550',
              'スペシャルティ ¥650',
              '紅茶各種 ¥500'
            ],
            isRecommended: false
          },
          {
            id: generateBlockId(),
            title: 'ランチセット',
            price: '¥1,200〜',
            features: [
              '日替わりプレート',
              'サラダ・スープ付き',
              'ドリンク＋200円',
              '11:30〜14:00限定'
            ],
            isRecommended: true
          },
          {
            id: generateBlockId(),
            title: 'スイーツ',
            price: '¥500〜',
            features: [
              '本日のケーキ ¥500',
              'パフェ ¥800',
              'ケーキセット ¥900',
              'テイクアウトOK'
            ],
            isRecommended: false
          }
        ]
      }
    },
    {
      id: generateBlockId(),
      type: 'image',
      data: {
        url: 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&h=400&fit=crop',
        caption: '季節限定のスペシャルメニューも好評です'
      }
    },
    {
      id: generateBlockId(),
      type: 'google_map',
      data: {
        address: '東京都目黒区自由が丘1-2-3',
        title: 'アクセス・営業時間',
        description: '東急東横線 自由が丘駅 正面口より徒歩2分\n\n【営業時間】\n平日 9:00〜20:00\n土日祝 8:00〜19:00\n\n【定休日】毎週水曜日',
        zoom: 16,
        showDirections: true
      }
    },
    {
      id: generateBlockId(),
      type: 'links',
      data: {
        links: [
          { label: '📸 Instagram - 新メニュー情報', url: 'https://instagram.com/example', style: '' },
          { label: '🍽️ 食べログで口コミを見る', url: 'https://tabelog.com/example', style: '' },
          { label: '📍 Googleマップで見る', url: 'https://maps.google.com/example', style: '' }
        ]
      }
    },
    {
      id: generateBlockId(),
      type: 'line_card',
      data: {
        title: 'LINE登録でドリンク1杯無料',
        description: '新メニュー情報や限定クーポンをお届け。お誕生日特典も！',
        url: 'https://lin.ee/example',
        buttonText: 'LINEで友だち追加'
      }
    }
  ]
};

