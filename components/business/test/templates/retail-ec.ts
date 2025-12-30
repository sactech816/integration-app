import { generateBlockId } from '@/lib/types';
import { Template } from './types';

// 物販・ECテンプレート
export const retailEcTemplate: Template = {
  id: 'retail-ec',
  name: '物販・EC',
  description: 'ネットショップ、ハンドメイド作家、物販ビジネス向け。商品の魅力を伝え、購入へ導く',
  category: '物販・EC',
  icon: 'ShoppingBag',
  recommended: false,
  order: 3,
  theme: {
    gradient: 'linear-gradient(-45deg, #f472b6, #ec4899, #db2777, #ec4899)'
  },
  blocks: [
    {
      id: generateBlockId(),
      type: 'header',
      data: {
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
        name: 'Handmade Shop LUNA',
        title: '天然素材にこだわったハンドメイドアクセサリー',
        category: 'other'
      }
    },
    {
      id: generateBlockId(),
      type: 'image',
      data: {
        url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=500&fit=crop',
        caption: '一つひとつ心を込めて、手作りしています'
      }
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '自然の美しさを、あなたの日常に。',
        text: '天然石とドライフラワーを使った、世界に一つだけのアクセサリー。\n\n素材選びから仕上げまで、すべて手作業で丁寧に制作しています。大量生産では出せない、温かみのある作品をお届けします。',
        align: 'center'
      }
    },
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: 'LUNAのこだわり',
        items: [
          {
            id: generateBlockId(),
            icon: '💎',
            title: '厳選した天然素材',
            description: '品質にこだわり、一つひとつ目で見て選んだ天然石のみを使用しています。'
          },
          {
            id: generateBlockId(),
            icon: '🌿',
            title: '肌に優しい素材',
            description: '金属アレルギーの方にも安心。サージカルステンレスや14Kゴールドフィルドを使用。'
          },
          {
            id: generateBlockId(),
            icon: '🎁',
            title: 'ギフト対応',
            description: '大切な方への贈り物に。無料ラッピング・メッセージカードをお付けします。'
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
            name: 'A.M様',
            role: '30代・会社員',
            comment: '写真で見るより実物がずっと素敵でした！友人にも褒められて、リピート購入しています。',
            imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces'
          },
          {
            id: generateBlockId(),
            name: 'K.S様',
            role: '20代・学生',
            comment: '金属アレルギーでも安心して使えるのが嬉しい。デザインも可愛くてお気に入りです。',
            imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces'
          }
        ]
      }
    },
    {
      id: generateBlockId(),
      type: 'links',
      data: {
        links: [
          { label: '🛒 オンラインショップ（minne）', url: 'https://minne.com/example', style: '' },
          { label: '🛍️ Creema店はこちら', url: 'https://www.creema.jp/example', style: '' },
          { label: '📸 Instagram - 新作情報を発信中', url: 'https://instagram.com/example', style: '' },
          { label: '📌 Pinterest - 作品ギャラリー', url: 'https://pinterest.com/example', style: '' }
        ]
      }
    },
    {
      id: generateBlockId(),
      type: 'faq',
      data: {
        items: [
          {
            id: generateBlockId(),
            question: '注文から届くまでどのくらいかかりますか？',
            answer: '受注制作のため、ご注文から7〜10日程度でお届けします。お急ぎの場合はご相談ください。'
          },
          {
            id: generateBlockId(),
            question: 'サイズ調整は可能ですか？',
            answer: 'はい、ブレスレットやリングはサイズオーダーを承っております。ご注文時にお知らせください。'
          },
          {
            id: generateBlockId(),
            question: '返品・交換はできますか？',
            answer: '商品到着後7日以内、未使用品に限り交換を承ります。詳しくはショップページをご確認ください。'
          }
        ]
      }
    },
    {
      id: generateBlockId(),
      type: 'line_card',
      data: {
        title: 'LINE登録で10%OFFクーポンプレゼント',
        description: '新作情報・セール情報をいち早くお届け。登録者限定の特別価格も！',
        url: 'https://lin.ee/example',
        buttonText: 'LINEで友だち追加'
      }
    }
  ]
};

