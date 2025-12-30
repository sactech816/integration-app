import { generateBlockId } from '@/lib/types';
import { Template } from './types';

// AIDOMA法則テンプレート
// Attention（注目）→ Interest（興味）→ Desire（欲求）→ Opportunity（機会）→ Memory（記憶）→ Action（行動）
export const aidomaTemplate: Template = {
  id: 'aidoma',
  name: 'AIDOMA法則',
  description: '注目を集め、興味を引き、欲求を刺激。記憶に残る体験で確実に行動へ導く構成',
  category: 'マーケティング法則',
  icon: 'Zap',
  recommended: true,
  order: 8,
  theme: {
    gradient: 'linear-gradient(-45deg, #f59e0b, #f97316, #fb923c, #f97316)'
  },
  blocks: [
    {
      id: generateBlockId(),
      type: 'header',
      data: {
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=faces',
        name: 'あなたの名前',
        title: '【驚愕】たった30日で人生が変わる！',
        category: 'business'
      }
    },
    {
      id: generateBlockId(),
      type: 'hero_fullwidth',
      data: {
        headline: '【Attention】あなたの常識を覆す、革新的な方法',
        subheadline: '従来の方法では絶対に実現できなかった成果を、最短最速で手に入れる。業界騒然の新メソッドをついに公開！',
        backgroundImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074&auto=format&fit=crop',
        ctaText: '今すぐ詳細を見る',
        ctaUrl: '#details'
      }
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '【Interest】なぜ、多くの人が失敗してきたのか？',
        text: 'これまで〇〇で結果が出なかった理由、それは…\n\n❌ 間違った方法を続けていた\n❌ 自己流で進めて遠回りしていた\n❌ 重要なポイントを見落としていた\n\nしかし、正しい方法さえ知れば、誰でも確実に成果を出せるのです。\n\n実際に、私のクライアント様の98%が、3ヶ月以内に明確な変化を実感されています。',
        align: 'center'
      }
    },
    {
      id: generateBlockId(),
      type: 'image',
      data: {
        url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop',
        alt: '成功イメージ画像',
        caption: '多くの方が、この方法で人生を変えています'
      }
    },
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: '【Desire】この方法で得られる5つのメリット',
        items: [
          {
            id: generateBlockId(),
            icon: '⚡',
            title: '圧倒的スピード',
            description: '従来の1/3の期間で、同等以上の成果を実現。時間を無駄にしません。'
          },
          {
            id: generateBlockId(),
            icon: '💰',
            title: '確実な投資回収',
            description: '投資額の3倍以上のリターンを、ほぼ全てのクライアントが達成しています。'
          },
          {
            id: generateBlockId(),
            icon: '🎯',
            title: '完全カスタマイズ',
            description: 'あなた専用のプランを作成。無駄なく、最短ルートで目標達成へ。'
          },
          {
            id: generateBlockId(),
            icon: '🛡️',
            title: '安心の保証制度',
            description: '万が一効果を実感できない場合、全額返金保証。リスクはゼロです。'
          },
          {
            id: generateBlockId(),
            icon: '📱',
            title: '24時間サポート',
            description: 'いつでもLINEで相談可能。困ったときもすぐに解決できます。'
          }
        ],
        columns: 3
      }
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'あなたも、こんな未来を手に入れませんか？',
        text: '✨ 朝起きるのが楽しみになる毎日\n✨ 自信に満ち溢れた新しい自分\n✨ 周りから尊敬される存在へ\n✨ 経済的な不安から解放される\n✨ 本当にやりたいことに集中できる\n\nこれは夢物語ではありません。\n正しい方法さえ知れば、誰でも実現可能なのです。',
        align: 'center'
      }
    },
    {
      id: generateBlockId(),
      type: 'testimonial',
      data: {
        items: [
          {
            id: generateBlockId(),
            name: '山田様',
            role: '35歳・会社員 → 起業家',
            comment: '信じられないくらい短期間で結果が出ました。人生が180度変わりました！周りからも「変わったね」と驚かれます。',
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
          },
          {
            id: generateBlockId(),
            name: '佐々木様',
            role: '42歳・主婦',
            comment: '家事育児の合間でも無理なく続けられました。今では月収50万円！家族との時間も増えて幸せです。',
            imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces'
          },
          {
            id: generateBlockId(),
            name: '高橋様',
            role: '28歳・フリーター → 経営者',
            comment: '将来に不安しかなかった私が、今では年商3,000万円の会社を経営。本当に感謝しかありません。',
            imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces'
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
            title: 'お試しプラン',
            price: '¥9,800',
            features: [
              '初回カウンセリング60分',
              '現状分析レポート',
              'あなた専用プラン設計',
              '7日間メールサポート'
            ],
            isRecommended: false
          },
          {
            id: generateBlockId(),
            title: '【Opportunity】スタンダード',
            price: '¥198,000',
            features: [
              '3ヶ月間の集中プログラム',
              '週1回のマンツーマン指導',
              '24時間LINEサポート',
              '専用教材・ツール提供',
              '全額返金保証付き',
              '【今だけ】追加1ヶ月無料！'
            ],
            isRecommended: true
          },
          {
            id: generateBlockId(),
            title: 'VIPプラン',
            price: '¥498,000',
            features: [
              '6ヶ月間のプレミアムサポート',
              '週2回のマンツーマン指導',
              '優先24時間サポート',
              '成果保証制度',
              '永久アフターフォロー'
            ],
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
          {
            id: generateBlockId(),
            question: '【Memory】初心者でも本当に大丈夫ですか？',
            answer: 'はい、むしろ初心者の方こそおすすめです。変な癖がないため、正しい方法をストレートに吸収できます。98%の方が初心者からスタートしています。'
          },
          {
            id: generateBlockId(),
            question: '忙しくて時間がないのですが…',
            answer: '1日30分からでOKです。スキマ時間を活用できるプログラム設計なので、忙しい方でも無理なく続けられます。'
          },
          {
            id: generateBlockId(),
            question: '本当に全額返金してもらえますか？',
            answer: 'はい。プログラム終了後、効果を実感できなければ、理由を問わず全額返金いたします。私たちはそれだけ自信を持っています。'
          },
          {
            id: generateBlockId(),
            question: 'この結果は一時的なものではないですか？',
            answer: 'いいえ。一時的な効果ではなく、一生使えるスキルとマインドが身につきます。多くの卒業生が、数年経った今も成果を出し続けています。'
          }
        ]
      }
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '最後に、あなたに伝えたいこと',
        text: '人生を変えるチャンスは、そう何度もありません。\n\n「いつか」「そのうち」と先延ばしにして、何も変わらない人生を送りますか？\nそれとも、今この瞬間に決断して、理想の未来を手に入れますか？\n\n選ぶのは、あなた自身です。\n\n私たちは、本気で変わりたいあなたを、全力でサポートします。\n一緒に、最高の未来を創りましょう。',
        align: 'center'
      }
    },
    {
      id: generateBlockId(),
      type: 'lead_form',
      data: {
        title: '【Action】今すぐ人生を変える一歩を踏み出す',
        buttonText: '無料カウンセリングに申し込む（残り5名）'
      }
    }
  ]
};

