import { generateBlockId } from '@/lib/types';
import { Template } from './types';

// フルセットテンプレート（全ブロック網羅版）
export const fullsetTemplate: Template = {
  id: 'fullset',
  name: 'フルセット',
  description: '15ブロック構成｜全要素を網羅したプロ仕様のLP構成',
  category: 'フルセット',
  icon: 'Layers',
  recommended: true,
  order: 0,
  theme: {
    gradient: 'linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)'
  },
  blocks: [
    // 1. ヒーローセクション
    {
      id: generateBlockId(),
      type: 'hero_fullwidth',
      data: {
        headline: 'あなたのビジネスを次のステージへ',
        subheadline: '〇〇分野で10年の実績。1,000社以上のサポート経験から導き出した、確実に成果を出すメソッドをご提供します。',
        backgroundImage: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=2074&auto=format&fit=crop',
        ctaText: '無料で相談する',
        ctaUrl: '#contact'
      }
    },
    // 2. 問題提起
    {
      id: generateBlockId(),
      type: 'problem_cards',
      data: {
        title: 'こんなお悩みありませんか？',
        subtitle: '一つでも当てはまる方は、ぜひご相談ください',
        isFullWidth: true,
        items: [
          {
            id: generateBlockId(),
            icon: '😰',
            title: '何から始めればいいかわからない',
            description: '情報が多すぎて、何が正解かわからない。一人で調べても答えが見つからない…',
            borderColor: 'blue'
          },
          {
            id: generateBlockId(),
            icon: '😓',
            title: '時間とお金をかけても成果が出ない',
            description: '色々試してみたけど、思ったような結果が出ない。このまま続けていいのか不安…',
            borderColor: 'red'
          },
          {
            id: generateBlockId(),
            icon: '🤔',
            title: '相談できる専門家がいない',
            description: '周りに同じ悩みを抱えている人がいない。誰に相談すればいいかわからない…',
            borderColor: 'orange'
          }
        ]
      }
    },
    // 3. 共感・ストーリー
    {
      id: generateBlockId(),
      type: 'two_column',
      data: {
        layout: 'image-left',
        imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=600&fit=crop&crop=faces',
        title: '私も同じ悩みを抱えていました',
        text: '10年前の私も、まさに同じ状況でした。何をしても上手くいかず、諦めかけたこともあります。\n\nしかし、ある方法に出会ってから全てが変わりました。\n\nその経験を活かし、今では1,000社以上の企業様をサポートしています。あなたの気持ち、痛いほどわかります。だからこそ、全力でサポートさせてください。'
      }
    },
    // 4. 特徴・ベネフィット
    {
      id: generateBlockId(),
      type: 'features',
      data: {
        title: '選ばれる5つの理由',
        isFullWidth: true,
        items: [
          {
            id: generateBlockId(),
            icon: '🏆',
            title: '10年以上の実績',
            description: '業界トップクラスの経験と実績。1,000社以上のサポート経験があります。'
          },
          {
            id: generateBlockId(),
            icon: '🎯',
            title: '完全オーダーメイド',
            description: 'あなたの状況に合わせた完全カスタマイズ。テンプレートではない本物の解決策を。'
          },
          {
            id: generateBlockId(),
            icon: '📊',
            title: 'データに基づく提案',
            description: '勘や経験だけでなく、データ分析に基づいた客観的な提案で確実な成果を。'
          },
          {
            id: generateBlockId(),
            icon: '🤝',
            title: '徹底的な伴走サポート',
            description: '計画を立てて終わりではありません。成果が出るまで責任を持ってサポートします。'
          },
          {
            id: generateBlockId(),
            icon: '🛡️',
            title: '安心の全額返金保証',
            description: '万が一効果を実感できない場合は全額返金。リスクなくお試しいただけます。'
          }
        ],
        columns: 3
      }
    },
    // 5. 事例紹介
    {
      id: generateBlockId(),
      type: 'case_study_cards',
      data: {
        title: '導入事例・実績',
        items: [
          {
            id: generateBlockId(),
            imageUrl: 'https://images.unsplash.com/photo-1664575602276-acd073f104c1?w=600&h=400&fit=crop',
            category: '売上改善',
            title: '半年で売上2倍を達成',
            description: '徹底的な分析と実行支援で、わずか6ヶ月で売上を200%に。',
            categoryColor: 'blue'
          },
          {
            id: generateBlockId(),
            imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop',
            category: 'コスト削減',
            title: '年間1,000万円のコスト削減',
            description: '業務プロセスの見直しにより、大幅なコスト削減を実現。',
            categoryColor: 'green'
          },
          {
            id: generateBlockId(),
            imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop',
            category: '組織改革',
            title: '離職率50%改善',
            description: '組織診断と制度設計で、社員満足度とエンゲージメントを大幅向上。',
            categoryColor: 'purple'
          }
        ]
      }
    },
    // 6. お客様の声
    {
      id: generateBlockId(),
      type: 'testimonial',
      data: {
        isFullWidth: true,
        items: [
          {
            id: generateBlockId(),
            name: '佐藤様',
            role: '株式会社A 代表取締役',
            comment: '半年で黒字化を達成できました。数字に基づいた的確なアドバイスと、実行までの手厚いサポートに感謝しています。もっと早く相談すればよかったです。',
            imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces'
          },
          {
            id: generateBlockId(),
            name: '田中様',
            role: '株式会社B マーケティング部長',
            comment: '正直、半信半疑で始めましたが、3ヶ月で明確な成果が出ました。投資以上のリターンがあり、継続をお願いしています。',
            imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
          },
          {
            id: generateBlockId(),
            name: '鈴木様',
            role: '個人事業主',
            comment: 'これまで一人で悩んでいたことが、すべてクリアになりました。寄り添ってくれるサポート体制が本当にありがたいです。',
            imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces'
          }
        ]
      }
    },
    // 7. サービス詳細（ダークセクション）
    {
      id: generateBlockId(),
      type: 'dark_section',
      data: {
        title: 'サービス内容',
        subtitle: 'プログラムに含まれるもの',
        isFullWidth: true,
        items: [
          {
            id: generateBlockId(),
            icon: '✓',
            title: '戦略立案・計画策定',
            description: '現状分析から目標設定、具体的なアクションプランまで一貫してサポート'
          },
          {
            id: generateBlockId(),
            icon: '✓',
            title: '週次セッション',
            description: '週1回のマンツーマンセッションで進捗確認と軌道修正'
          },
          {
            id: generateBlockId(),
            icon: '✓',
            title: '24時間チャットサポート',
            description: 'いつでも気軽に相談できる専用チャットで迅速に回答'
          },
          {
            id: generateBlockId(),
            icon: '✓',
            title: '専用教材・テンプレート',
            description: '成果を加速させるオリジナル教材とテンプレートを提供'
          }
        ],
        accentColor: 'orange'
      }
    },
    // 8. 特典セクション
    {
      id: generateBlockId(),
      type: 'bonus_section',
      data: {
        title: '今だけの特別特典',
        subtitle: '期間限定でお申し込みの方に',
        isFullWidth: true,
        items: [
          {
            id: generateBlockId(),
            icon: '🎁',
            title: '【特典1】スタートアップガイドブック',
            description: '成功者の90%が実践している、スタートダッシュを決める完全ガイド（PDF 50ページ）'
          },
          {
            id: generateBlockId(),
            icon: '📚',
            title: '【特典2】実践ワークシート集',
            description: 'すぐに使える10種類のワークシート。行動を加速させるテンプレート付き'
          },
          {
            id: generateBlockId(),
            icon: '🎥',
            title: '【特典3】限定セミナー動画',
            description: '通常5万円相当のセミナー動画を無料でご提供。いつでも復習可能'
          }
        ],
        backgroundGradient: 'linear-gradient(to right, #10b981, #3b82f6)'
      }
    },
    // 9. 料金プラン
    {
      id: generateBlockId(),
      type: 'pricing',
      data: {
        plans: [
          {
            id: generateBlockId(),
            title: '体験プラン',
            price: '¥11,000',
            features: [
              '60分の個別相談',
              '現状分析レポート',
              '改善提案書',
              '7日間メールサポート'
            ],
            isRecommended: false
          },
          {
            id: generateBlockId(),
            title: '3ヶ月集中プログラム',
            price: '¥198,000',
            features: [
              '週1回のセッション（計12回）',
              '24時間チャットサポート',
              '専用教材・テンプレート',
              '3大特典付き',
              '全額返金保証'
            ],
            isRecommended: true
          },
          {
            id: generateBlockId(),
            title: '6ヶ月マスタープログラム',
            price: '¥330,000',
            features: [
              '週1回のセッション（計24回）',
              '優先チャットサポート',
              '月1回のグループコンサル',
              '修了後3ヶ月フォロー',
              '永久コミュニティ参加権'
            ],
            isRecommended: false
          }
        ]
      }
    },
    // 10. チェックリスト
    {
      id: generateBlockId(),
      type: 'checklist_section',
      data: {
        title: 'こんな方におすすめです',
        columns: 2,
        items: [
          { id: generateBlockId(), icon: '✓', title: '本気で成果を出したい方', description: '' },
          { id: generateBlockId(), icon: '✓', title: '一人で悩んでいる方', description: '' },
          { id: generateBlockId(), icon: '✓', title: '自己投資を惜しまない方', description: '' },
          { id: generateBlockId(), icon: '✓', title: '素直に実践できる方', description: '' },
          { id: generateBlockId(), icon: '✓', title: '継続できる方', description: '' },
          { id: generateBlockId(), icon: '✓', title: '成長意欲の高い方', description: '' }
        ]
      }
    },
    // 11. FAQ
    {
      id: generateBlockId(),
      type: 'faq',
      data: {
        items: [
          {
            id: generateBlockId(),
            question: '初心者でも大丈夫ですか？',
            answer: 'はい、むしろ初心者の方にこそおすすめです。基礎から体系的に学べるので、正しい知識とスキルが身につきます。これまでの受講生の80%以上が初心者からスタートしています。'
          },
          {
            id: generateBlockId(),
            question: 'どのくらいの期間で成果が出ますか？',
            answer: '個人差はありますが、多くの方が3ヶ月以内に明確な変化を実感されています。まずは無料相談で、あなたのケースについて詳しくお話しします。'
          },
          {
            id: generateBlockId(),
            question: 'オンラインでも対応可能ですか？',
            answer: 'はい、全てオンラインで完結可能です。ZoomやGoogle Meetを使用して、全国どこからでもご参加いただけます。'
          },
          {
            id: generateBlockId(),
            question: '全額返金保証の条件は？',
            answer: 'プログラム通りに取り組んでいただいた上で、効果を実感できない場合は理由を問わず全額返金いたします。詳細は無料相談でご説明します。'
          },
          {
            id: generateBlockId(),
            question: '支払い方法は何がありますか？',
            answer: 'クレジットカード、銀行振込に対応しています。分割払い（最大12回）も可能ですので、お気軽にご相談ください。'
          }
        ]
      }
    },
    // 12. CTAセクション
    {
      id: generateBlockId(),
      type: 'cta_section',
      data: {
        title: '今すぐ無料相談を申し込む',
        description: '毎月先着10名様限定。枠が埋まり次第、募集を終了します。',
        buttonText: '無料相談に申し込む',
        buttonUrl: '#contact',
        isFullWidth: true
      }
    },
    // 13. LINE登録
    {
      id: generateBlockId(),
      type: 'line_card',
      data: {
        title: 'LINE登録で無料特典プレゼント',
        description: '「成功者だけが知っている7つの習慣」PDFを無料でプレゼント。限定コラムも配信中！',
        url: 'https://lin.ee/example',
        buttonText: 'LINEで受け取る'
      }
    },
    // 14. リンク集
    {
      id: generateBlockId(),
      type: 'links',
      data: {
        links: [
          { label: '🌐 公式サイト', url: 'https://example.com', style: '' },
          { label: '🐦 X（Twitter）', url: 'https://x.com/example', style: '' },
          { label: '📸 Instagram', url: 'https://instagram.com/example', style: '' },
          { label: '📺 YouTube', url: 'https://youtube.com/@example', style: '' }
        ]
      }
    },
    // 15. リードフォーム
    {
      id: generateBlockId(),
      type: 'lead_form',
      data: {
        title: '無料相談・お問い合わせ',
        buttonText: '無料相談を申し込む'
      }
    }
  ]
};






























































































