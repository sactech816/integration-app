import { generateBlockId } from '@/lib/types';
import { Template } from './types';

// コーチ・講師テンプレート
export const coachTemplate: Template = {
  id: 'coach',
  name: 'コーチ・講師',
  description: 'ライフコーチ、ビジネスコーチ、セミナー講師向け。悩み共感から解決策提示、LINE登録への導線',
  category: 'コーチ・講師',
  icon: 'GraduationCap',
  recommended: false,
  order: 2,
  theme: {
    gradient: 'linear-gradient(-45deg, #7c3aed, #8b5cf6, #a78bfa, #8b5cf6)'
  },
  blocks: [
    {
      id: generateBlockId(),
      type: 'header',
      data: {
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
        name: '山田 美咲',
        title: 'ライフコーチ / キャリアコンサルタント',
        category: 'business'
      }
    },
    {
      id: generateBlockId(),
      type: 'hero_fullwidth',
      data: {
        headline: '「本当の自分」を見つけ、理想の人生を歩み始める',
        subheadline: '1,000人以上のキャリア相談実績。あなたの強みを活かした、オンリーワンの人生設計をサポートします。',
        backgroundImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop',
        ctaText: '無料診断を受ける',
        ctaUrl: '#quiz'
      }
    },
    {
      id: generateBlockId(),
      type: 'problem_cards',
      data: {
        title: 'こんなお悩みありませんか？',
        subtitle: '一つでも当てはまる方は、ぜひご相談ください',
        items: [
          {
            id: generateBlockId(),
            icon: '😔',
            title: '自分の強みがわからない',
            description: '何が得意で、何をしたいのか。自分のことなのに、よくわからない…',
            borderColor: 'purple'
          },
          {
            id: generateBlockId(),
            icon: '😰',
            title: 'このままでいいのか不安',
            description: '今の仕事を続けていいのか、転職すべきか。将来が見えない…',
            borderColor: 'purple'
          },
          {
            id: generateBlockId(),
            icon: '😓',
            title: '行動に移せない',
            description: 'やりたいことはあるけど、一歩が踏み出せない。自信がない…',
            borderColor: 'purple'
          }
        ]
      }
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '私のコーチングメソッド',
        text: '独自の「強み発見メソッド」で、あなたの中に眠る可能性を引き出します。\n\n① 過去の経験を棚卸し\n② 価値観・強みの言語化\n③ 理想の未来像を設計\n④ 行動計画の策定\n⑤ 継続サポート\n\n一人で悩まず、一緒に答えを見つけましょう。',
        align: 'left'
      }
    },
    {
      id: generateBlockId(),
      type: 'testimonial',
      data: {
        items: [
          {
            id: generateBlockId(),
            name: 'M.K様',
            role: '30代・会社員',
            comment: '自分の強みが明確になり、転職活動に自信を持って臨めました。年収も100万円アップ！',
            imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces'
          },
          {
            id: generateBlockId(),
            name: 'T.S様',
            role: '40代・起業準備中',
            comment: '漠然としていた起業の夢が、具体的な計画になりました。半年後に独立できました。',
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
          },
          {
            id: generateBlockId(),
            name: 'Y.N様',
            role: '20代・フリーランス',
            comment: '自分の価値を正しく伝えられるようになり、単価が2倍になりました。',
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
            title: '体験セッション',
            price: '¥5,500',
            features: [
              '60分のオンラインセッション',
              '現状の課題を整理',
              '今後の方向性をアドバイス',
              '継続プランのご案内'
            ],
            isRecommended: false
          },
          {
            id: generateBlockId(),
            title: '3ヶ月集中プログラム',
            price: '¥165,000',
            features: [
              '月2回のセッション（計6回）',
              'LINEで随時相談OK',
              'ワークシート・教材付き',
              '修了後1ヶ月フォロー'
            ],
            isRecommended: true
          },
          {
            id: generateBlockId(),
            title: '継続サポート',
            price: '¥33,000/月',
            features: [
              '月1回のセッション',
              'LINEで随時相談OK',
              '目標達成まで伴走',
              'いつでも解約可能'
            ],
            isRecommended: false
          }
        ]
      }
    },
    {
      id: generateBlockId(),
      type: 'line_card',
      data: {
        title: 'LINE登録で「強み発見ワークシート」プレゼント',
        description: '今すぐ使える自己分析ツールを無料でお届け。限定コラムも配信中！',
        url: 'https://lin.ee/example',
        buttonText: 'LINEで受け取る'
      }
    }
  ]
};

