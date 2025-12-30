import { generateBlockId } from '@/lib/types';
import { Template } from './types';

// PASONA法則テンプレート
// Problem（問題）→ Affinity（親近感）→ Solution（解決策）→ Offer（提案）→ Narrowing（絞込）→ Action（行動）
export const pasonaTemplate: Template = {
  id: 'pasona',
  name: 'PASONA法則',
  description: '問題提起から解決策提示、限定性を持たせた行動喚起まで。説得力の高いLP構成',
  category: 'マーケティング法則',
  icon: 'TrendingUp',
  recommended: true,
  order: 7,
  theme: {
    gradient: 'linear-gradient(-45deg, #ec4899, #f43f5e, #fb7185, #f43f5e)'
  },
  blocks: [
    {
      id: generateBlockId(),
      type: 'header',
      data: {
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces',
        name: 'あなたの名前',
        title: 'その悩み、本当に解決できていますか？',
        category: 'business'
      }
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '【Problem】多くの方が抱える深刻な問題',
        text: '〇〇でお困りではありませんか？\n\n✗ 何度も同じ失敗を繰り返してしまう\n✗ 時間とお金をかけても成果が出ない\n✗ どこに相談すればいいかわからない\n\nこのまま放置すると、さらに状況は悪化します。\n今こそ、根本的な解決が必要です。',
        align: 'center'
      }
    },
    {
      id: generateBlockId(),
      type: 'problem_cards',
      data: {
        title: 'こんな状況に陥っていませんか？',
        subtitle: '一つでも当てはまる方は要注意です',
        items: [
          {
            id: generateBlockId(),
            icon: '😰',
            title: '問題①',
            description: '〇〇がうまくいかず、いつも途中で挫折してしまう…',
            borderColor: 'pink'
          },
          {
            id: generateBlockId(),
            icon: '😓',
            title: '問題②',
            description: '△△に時間とお金を使っても、思ったような成果が出ない…',
            borderColor: 'pink'
          },
          {
            id: generateBlockId(),
            icon: '😔',
            title: '問題③',
            description: '誰に相談すればいいかわからず、一人で悩み続けている…',
            borderColor: 'pink'
          }
        ]
      }
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: '【Affinity】私も同じ悩みを抱えていました',
        text: '実は、私自身も以前は同じような問題に悩まされていました。\n\n何度も失敗を繰り返し、「自分には無理なのかもしれない」と諦めかけたこともあります。\n\nしかし、ある方法に出会ってから、すべてが変わりました。\n今では〇〇を達成し、多くの方のサポートができるまでになりました。\n\nあなたの気持ち、痛いほどよくわかります。\nだからこそ、同じ悩みを持つあなたの力になりたいのです。',
        align: 'left'
      }
    },
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: '【Solution】問題を解決する3つの方法',
        items: [
          {
            id: generateBlockId(),
            icon: '💡',
            title: '解決策①：〇〇メソッド',
            description: '独自開発した〇〇メソッドで、根本原因から解決。再発を防ぎます。'
          },
          {
            id: generateBlockId(),
            icon: '🎯',
            title: '解決策②：個別カスタマイズ',
            description: 'あなたの状況に合わせた完全オーダーメイドの解決策をご提案します。'
          },
          {
            id: generateBlockId(),
            icon: '🤝',
            title: '解決策③：継続サポート',
            description: '一度きりではなく、成果が出るまで継続的にサポートします。'
          }
        ],
        columns: 3
      }
    },
    {
      id: generateBlockId(),
      type: 'text_card',
      data: {
        title: 'なぜこの方法で解決できるのか？',
        text: '私のサービスは、単なる対症療法ではありません。\n\n【特徴①】10年以上の実践で磨き上げた独自メソッド\n【特徴②】1,000件以上の成功事例に基づく確実な方法\n【特徴③】一人ひとりに寄り添う丁寧なサポート体制\n\nこれらの組み合わせにより、他では実現できない成果を出すことができるのです。',
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
            name: '佐藤様',
            role: '40代・会社員',
            comment: '長年悩んでいた問題が、たった3ヶ月で解決しました。もっと早く相談すればよかったです！',
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
          },
          {
            id: generateBlockId(),
            name: '田中様',
            role: '30代・経営者',
            comment: '他のサービスでは改善しなかった課題が、見事にクリアできました。投資以上のリターンがありました。',
            imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces'
          },
          {
            id: generateBlockId(),
            name: '鈴木様',
            role: '50代・フリーランス',
            comment: '親身になって相談に乗っていただき、安心してお任せできました。結果も期待以上です。',
            imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces'
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
            title: '初回相談',
            price: '¥11,000',
            features: [
              '60分の個別相談',
              '現状分析と課題整理',
              '解決策のご提案',
              '継続プランのご案内'
            ],
            isRecommended: false
          },
          {
            id: generateBlockId(),
            title: '【Offer】3ヶ月集中プログラム',
            price: '¥165,000',
            features: [
              '週1回の個別セッション',
              'いつでもチャット相談OK',
              '専用ワークシート・教材',
              '成果が出るまで徹底サポート',
              '【特典】フォローアップ1ヶ月無料'
            ],
            isRecommended: true
          },
          {
            id: generateBlockId(),
            title: '継続サポート',
            price: '¥55,000/月',
            features: [
              '月2回のセッション',
              'チャットサポート',
              '定期的な進捗確認',
              'いつでも解約可能'
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
        title: '【Narrowing】ただし、誰でも受けられるわけではありません',
        text: '質の高いサポートを提供するため、毎月の受付人数を限定しています。\n\n✓ 今月の残り枠：あと3名様\n✓ 申込締切：今月末まで\n✓ 次回募集：未定\n\n本気で解決したい方だけ、今すぐお申し込みください。\n\n※お申し込み多数の場合は、先着順とさせていただきます',
        align: 'center'
      }
    },
    {
      id: generateBlockId(),
      type: 'faq',
      data: {
        items: [
          {
            id: generateBlockId(),
            question: '本当に効果がありますか？',
            answer: 'はい。これまで1,000件以上の実績があり、95%以上の方が満足されています。万が一効果を実感できない場合は、全額返金保証もございます。'
          },
          {
            id: generateBlockId(),
            question: 'どのくらいの期間で成果が出ますか？',
            answer: '個人差はありますが、多くの方が3ヶ月以内に明確な変化を実感されています。まずは初回相談で、あなたのケースについて詳しくお話しします。'
          },
          {
            id: generateBlockId(),
            question: '支払い方法は何がありますか？',
            answer: 'クレジットカード、銀行振込、分割払いに対応しています。分割の場合は最大12回まで可能です。'
          }
        ]
      }
    },
    {
      id: generateBlockId(),
      type: 'lead_form',
      data: {
        title: '【Action】今すぐ無料相談を申し込む',
        buttonText: '無料相談に申し込む（残り3名）'
      }
    }
  ]
};

