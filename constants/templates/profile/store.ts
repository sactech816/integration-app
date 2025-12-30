import { Template } from '../types';
import { generateBlockId } from '@/lib/types';

/**
 * 店舗・サロン向けプロフィールLPテンプレート
 */
export const storeTemplates: Template[] = [
  {
    id: 'store-business',
    name: '店舗用',
    description: '店舗LP - 飲食店・美容室・整体院など実店舗向け',
    category: '店舗・サロン',
    theme: {
      gradient: 'linear-gradient(-45deg, #059669, #10b981, #34d399, #10b981)'
    },
    blocks: [
      {
        id: generateBlockId(),
        type: 'header',
        data: {
          avatar: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=200&h=200&fit=crop',
          name: 'カフェ＆ダイニング SAKURA',
          title: '地元で愛される隠れ家カフェ',
          category: 'business'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '心ほどける、やすらぎの時間を。',
          text: '新鮮な地元食材にこだわった料理と、こだわりの自家焙煎コーヒー。落ち着いた空間で、ゆったりとした時間をお過ごしください。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'image',
        data: {
          url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=400&fit=crop',
          caption: '落ち着いた雰囲気の店内'
        }
      },
      {
        id: generateBlockId(),
        type: 'image',
        data: {
          url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=400&fit=crop',
          caption: '自家焙煎のこだわりコーヒー'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '当店の3つのこだわり',
          text: '1. 地元農家から直送の新鮮野菜\n2. 毎朝店内で焙煎する香り高いコーヒー\n3. 季節ごとに変わる限定メニュー',
          align: 'left'
        }
      },
      {
        id: generateBlockId(),
        type: 'pricing',
        data: {
          plans: [
            {
              id: generateBlockId(),
              title: 'ランチセット',
              price: '¥1,200',
              features: ['日替わりメインディッシュ', 'サラダ＆スープ', 'ドリンク付き', '平日11:00〜15:00'],
              isRecommended: false
            },
            {
              id: generateBlockId(),
              title: 'ディナーコース',
              price: '¥3,800',
              features: ['前菜3品', 'メインディッシュ', 'デザート＆コーヒー', '17:00〜22:00（要予約）'],
              isRecommended: true
            },
            {
              id: generateBlockId(),
              title: 'カフェタイム',
              price: '¥800〜',
              features: ['自家焙煎コーヒー', '手作りケーキセット', 'Wi-Fi完備', '15:00〜17:00'],
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
              name: 'Y様',
              role: '30代・女性',
              comment: '雰囲気が最高で、友人とのランチに毎月利用しています。料理も美味しくて大満足です！',
              imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces'
            },
            {
              id: generateBlockId(),
              name: 'T様',
              role: '40代・男性',
              comment: '仕事の合間に立ち寄れる貴重なお店。コーヒーの香りに癒されます。',
              imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
            }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'faq',
        data: {
          items: [
            { id: generateBlockId(), question: '予約は必要ですか？', answer: 'ランチ・カフェタイムは予約不要です。ディナーコースは事前予約をお願いしております。' },
            { id: generateBlockId(), question: '駐車場はありますか？', answer: 'はい、店舗前に5台分の無料駐車場をご用意しております。' },
            { id: generateBlockId(), question: 'テイクアウトはできますか？', answer: 'はい、一部メニューはテイクアウト可能です。お電話でご注文ください。' }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '店舗情報・アクセス',
          text: '📍 住所：東京都渋谷区〇〇1-2-3\n🚃 最寄駅：〇〇駅から徒歩5分\n⏰ 営業時間：11:00〜22:00（月曜定休）\n📞 電話：03-1234-5678',
          align: 'left'
        }
      },
      {
        id: generateBlockId(),
        type: 'line_card',
        data: {
          title: '公式LINEでお得な情報配信中',
          description: '友だち登録で次回使える10%OFFクーポンプレゼント！',
          url: 'https://lin.ee/example',
          buttonText: 'LINE登録してクーポンGET'
        }
      },
      {
        id: generateBlockId(),
        type: 'lead_form',
        data: { title: 'ご予約・お問い合わせ', buttonText: '予約・問い合わせする' }
      }
    ]
  }
];

