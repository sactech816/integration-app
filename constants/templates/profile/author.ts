import { Template } from '../types';
import { generateBlockId } from '@/lib/types';

/**
 * 著者・出版向けプロフィールLPテンプレート
 */
export const authorTemplates: Template[] = [
  {
    id: 'book-promotion',
    name: '書籍プロモーション',
    description: '書籍LP - Kindle・書籍プロモーション特化',
    category: '著者・出版',
    theme: {
      gradient: 'linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)'
    },
    blocks: [
      {
        id: generateBlockId(),
        type: 'header',
        data: {
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces',
          name: '著者名',
          title: '著者 / コンサルタント',
          category: 'business'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '売り込みゼロで、理想のお客様が自然と集まる。',
          text: 'あなたのビジネスを自動化する「すごい仕掛け」、知りたくありませんか？\n\n心理学に基づいた「診断コンテンツ」を使えば、お客様が自らの課題に気づき、楽しみながらあなたのファンになる。そんな、ストレスフリーな事業の作り方を解説します。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'kindle',
        data: {
          asin: 'B0FL5SG9BX',
          imageUrl: 'https://m.media-amazon.com/images/I/81RxK39ovgL._SY522_.jpg',
          title: '診断コンテンツのすごい仕掛け',
          description: 'お客様が自らの課題に気づき、「ぜひ、あなたに相談したい」と自然に思ってくれる"すごい仕掛け"の作り方を科学的に解説。'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: 'もし、あなたのビジネスがこんな状態になったら…',
          text: '✓ 価格ではなく「あなただから」という理由で選ばれる。\n✓ 営業活動はゼロ。お客様を喜ばせることに100%集中できる。\n✓ お客様が自分の課題を深く理解した上で「ぜひ相談したい」とやってくる。\n\nこれは夢物語ではありません。「診断コンテンツ」なら、この未来を実現できます。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '本書で手に入る「すごい仕掛け」の一部',
          text: '• 見込み客が楽しみながら"集まる"最新手法\n• 売り込み感ゼロで「この人、分かってる！」と信頼される科学\n• 営業が苦手でも結果が出る、自動営業システムの作り方\n• 価格競争から完全に脱却し、適正価格で選ばれる思考法\n• お客様の回答データから、次のヒットサービスを生み出す方法',
          align: 'left'
        }
      },
      {
        id: generateBlockId(),
        type: 'quiz',
        data: { title: 'あなたの「理想の集客スタイル」無料診断', quizSlug: 'ideal-marketing-style' }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '5つの質問で、あなたのビジネスが飛躍するヒントを見つけよう！',
          text: '診断を体験することで、本書で解説している「診断コンテンツ」の威力を実感できます。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: 'こんな方におすすめ',
          text: '1. フリーランス、コーチ、コンサルタント、クリエイターなど、個人でビジネスをされている方\n2. 自分の価値が伝わらず、価格競争に疲弊している方\n3. 売り込みなしで、お客様から「お願いしたい」と言われる仕組みを作りたい方',
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
              name: 'M様',
              role: 'コーチング業',
              comment: '「この方法なら、私にもできる！」と確信しました。診断を作ってから、問い合わせの質が明らかに変わりました。',
              imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces'
            },
            {
              id: generateBlockId(),
              name: 'K様',
              role: 'Webデザイナー',
              comment: '営業が苦手でしたが、診断コンテンツのおかげで自然と相談が来るようになりました。',
              imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
            }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'line_card',
        data: {
          title: '読者限定・豪華特典のご案内',
          description: '専用エディタ＆テンプレート、業種別「質問テンプレート集」など、すぐに使える特典をプレゼント！',
          url: 'https://lin.ee/kVeOUXF',
          buttonText: 'LINEで特典を受け取る'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: 'さあ、あなたも「営業しない営業」で理想の顧客と出会う。',
          text: 'お客様との関係が、ビジネスが、そしてあなた自身の働き方が、劇的に変わる。そのための科学的な設計図が、この一冊にすべて詰まっています。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'faq',
        data: {
          items: [
            { id: generateBlockId(), question: 'Kindle Unlimitedで読めますか？', answer: 'はい、Kindle Unlimited会員は無料で読めます。' },
            { id: generateBlockId(), question: '初心者でも実践できますか？', answer: 'はい、基礎から丁寧に解説しており、Googleフォームを使った簡単な方法から始められます。' }
          ]
        }
      }
    ]
  }
];

