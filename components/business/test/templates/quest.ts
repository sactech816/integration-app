import { generateBlockId } from '@/lib/types';
import { Template } from './types';

// QUEST法則テンプレート
// Qualify（絞込）→ Understand（理解）→ Educate（教育）→ Stimulate（刺激）→ Transition（変化）
export const questTemplate: Template = {
  id: 'quest',
  name: 'QUEST法則',
  description: 'ターゲットを明確にし、理解と教育を経て購買意欲を高める。信頼構築型のLP構成',
  category: 'マーケティング法則',
  icon: 'Target',
  recommended: true,
  order: 9,
  theme: {
    gradient: 'linear-gradient(-45deg, #14b8a6, #0d9488, #14b8a6, #0d9488)'
  },
  blocks: [
    {
      id: generateBlockId(),
      type: 'header',
      data: {
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces',
        name: 'あなたの名前',
        title: '〇〇で本気で成果を出したい方へ',
        category: 'business'
      }
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '【Qualify】このサービスは、こんな方のためのものです',
        text: '✓ 〇〇で本気で結果を出したい方\n✓ 一時的な解決ではなく、根本的な改善を求める方\n✓ 自己投資を惜しまない、成長意欲の高い方\n✓ 素直に実践できる方\n✓ 最低3ヶ月は継続できる方\n\nもし一つでも当てはまらない場合は、このページを閉じていただいて構いません。\n\n私たちは、本気の方だけを全力でサポートしたいのです。',
        align: 'center'
      }
    },
    {
      id: generateBlockId(),
      type: 'problem_cards',
      data: {
        title: 'あなたは、こんな課題を抱えていませんか？',
        subtitle: 'もし当てはまるなら、このまま読み進めてください',
        items: [
          {
            id: generateBlockId(),
            icon: '🤔',
            title: '課題①',
            description: '自己流で頑張っているが、なかなか成果が出ない…',
            borderColor: 'teal'
          },
          {
            id: generateBlockId(),
            icon: '😰',
            title: '課題②',
            description: '情報が多すぎて、何が正しいのかわからない…',
            borderColor: 'teal'
          },
          {
            id: generateBlockId(),
            icon: '😓',
            title: '課題③',
            description: '一人では継続できず、いつも途中で挫折してしまう…',
            borderColor: 'teal'
          }
        ]
      }
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '【Understand】その気持ち、よくわかります',
        text: '実は、あなたが抱えている課題は、多くの方が通る道なのです。\n\n私自身も、以前は同じような悩みを抱えていました。\n\n・何から始めればいいかわからない\n・頑張っても結果が出ない\n・相談できる相手がいない\n\nしかし、正しい知識と適切なサポートがあれば、誰でも確実に成果を出せることを、私は知っています。\n\nなぜなら、これまで500名以上の方をサポートし、その多くが目標を達成してきたからです。',
        align: 'left'
      }
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '【Educate】なぜ、多くの人が失敗するのか？',
        text: '成果が出ない理由は、大きく3つあります。\n\n【理由①】間違った方法を選んでいる\n→ 自分に合わない方法では、どれだけ頑張っても成果は出ません\n\n【理由②】基礎を疎かにしている\n→ 応用ばかり追いかけて、土台ができていない状態です\n\n【理由③】継続できる環境がない\n→ 一人では挫折してしまうのは、当然のことなのです\n\nこれらの問題を解決できれば、成果は自然とついてきます。',
        align: 'center'
      }
    },
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: '私のサービスが選ばれる理由',
        items: [
          {
            id: generateBlockId(),
            icon: '📚',
            title: '体系的なカリキュラム',
            description: '10年以上かけて磨き上げた独自メソッド。初心者でも着実にステップアップできます。'
          },
          {
            id: generateBlockId(),
            icon: '👨‍🏫',
            title: 'プロの個別指導',
            description: '1,000件以上の実績を持つプロが、あなた専用のプランを作成。無駄なく最短で成果へ。'
          },
          {
            id: generateBlockId(),
            icon: '🤝',
            title: '継続サポート環境',
            description: '専用コミュニティとチャットサポートで、挫折せずに続けられます。'
          },
          {
            id: generateBlockId(),
            icon: '📊',
            title: 'データに基づく改善',
            description: '定期的な進捗チェックと軌道修正で、確実にゴールへ導きます。'
          }
        ],
        columns: 2
      }
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '実際の成功プロセス',
        text: '【ステップ①】現状分析（1週目）\nあなたの強み・弱み・目標を明確化します\n\n【ステップ②】基礎固め（2-4週目）\n成果を出すための土台を作ります\n\n【ステップ③】実践（5-8週目）\n学んだことを実際に行動に移します\n\n【ステップ④】最適化（9-12週目）\nさらに成果を高めるための改善を行います\n\nこのプロセスを通じて、誰でも確実に成長できます。',
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
            name: '中村様',
            role: '32歳・会社員',
            comment: '理論的でわかりやすい説明と、実践的なサポートが素晴らしかったです。3ヶ月で明確な成果が出ました。',
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
          },
          {
            id: generateBlockId(),
            name: '伊藤様',
            role: '45歳・個人事業主',
            comment: '基礎から丁寧に教えていただき、自信を持って実践できました。売上が2倍になりました！',
            imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces'
          },
          {
            id: generateBlockId(),
            name: '木村様',
            role: '28歳・フリーランス',
            comment: '独学では絶対に得られない知識とサポート。投資以上の価値がありました。',
            imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces'
          }
        ]
      }
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '【Stimulate】想像してみてください',
        text: '3ヶ月後のあなたは…\n\n✨ 自信を持って〇〇ができるようになっている\n✨ 周りから一目置かれる存在になっている\n✨ 収入が増え、生活に余裕が生まれている\n✨ 新しいチャレンジに前向きになっている\n✨ 同じ志を持つ仲間ができている\n\nこれは、あなたにも実現可能な未来です。\n\n多くの先輩たちが、この道を歩んできました。\n次は、あなたの番です。',
        align: 'center'
      }
    },
    {
      id: generateBlockId(),
      type: 'pricing',
      data: {
        plans: [
          {
            id: generateBlockId(),
            title: '無料体験セッション',
            price: '¥0',
            features: [
              '60分の個別相談',
              '現状分析とゴール設定',
              'あなた専用プランのご提案',
              '継続プランのご案内'
            ],
            isRecommended: false
          },
          {
            id: generateBlockId(),
            title: '3ヶ月集中プログラム',
            price: '¥198,000',
            features: [
              '週1回の個別セッション',
              '体系的なカリキュラム',
              'チャットサポート無制限',
              '専用教材・ツール提供',
              'コミュニティ参加権',
              '録画視聴可能'
            ],
            isRecommended: true
          },
          {
            id: generateBlockId(),
            title: '6ヶ月マスタープログラム',
            price: '¥330,000',
            features: [
              '週1回の個別セッション',
              '全カリキュラム＋応用編',
              '優先チャットサポート',
              '月1回のグループコンサル',
              '永久コミュニティ参加権',
              '修了後3ヶ月フォロー'
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
            question: '初心者でも大丈夫ですか？',
            answer: 'はい、むしろ初心者の方にこそおすすめです。基礎から体系的に学べるので、正しい知識とスキルが身につきます。'
          },
          {
            id: generateBlockId(),
            question: 'どのくらいの時間が必要ですか？',
            answer: '週に3-5時間程度を確保していただくのが理想ですが、個々のペースに合わせて調整可能です。'
          },
          {
            id: generateBlockId(),
            question: '本当に成果が出ますか？',
            answer: 'はい。ただし、素直に実践していただくことが前提です。これまでの受講生の90%以上が、3ヶ月以内に成果を実感されています。'
          },
          {
            id: generateBlockId(),
            question: '支払い方法は？',
            answer: 'クレジットカード、銀行振込に対応しています。分割払い（最大12回）も可能ですので、お気軽にご相談ください。'
          }
        ]
      }
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '【Transition】変化は、行動からしか生まれません',
        text: 'どれだけ知識を得ても、行動しなければ何も変わりません。\n\nこのページを読んでいるあなたは、すでに一歩を踏み出しています。\n\nあとは、決断するだけです。\n\n「今」始めるのか、それとも「いつか」のために先延ばしにするのか。\n\n本気で変わりたいなら、今すぐ無料体験セッションにお申し込みください。\n\nあなたの人生を変える、最高のサポートを約束します。',
        align: 'center'
      }
    },
    {
      id: generateBlockId(),
      type: 'lead_form',
      data: {
        title: '無料体験セッションに申し込む',
        buttonText: '今すぐ無料で相談する'
      }
    }
  ]
};

