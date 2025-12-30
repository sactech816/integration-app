import { Template } from '../types';
import { generateBlockId } from '@/lib/types';

/**
 * コーチ・カウンセラー向けプロフィールLPテンプレート
 */
export const coachTemplates: Template[] = [
  {
    id: 'quiz-content-lp',
    name: '診断コンテンツ',
    description: '診断コンテンツLP - 診断を中心としたリード獲得',
    category: 'コーチ・カウンセラー',
    theme: {
      gradient: 'linear-gradient(-45deg, #7c3aed, #8b5cf6, #a78bfa, #8b5cf6)'
    },
    blocks: [
      {
        id: generateBlockId(),
        type: 'header',
        data: {
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces',
          name: 'あなたの名前',
          title: 'あなたの肩書き',
          category: 'business'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: 'たった3分で、あなたの課題が明確になる',
          text: '無料診断で、今のあなたに最適な解決策を見つけましょう。\n\n1,000人以上が診断を受け、自分の強みと改善点を発見しています。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'quiz',
        data: { title: '無料診断スタート', quizSlug: 'your-quiz-slug' }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '診断を受けると、こんなことが分かります',
          text: '✓ あなたの現在の状況と課題\n✓ 今すぐ取り組むべき優先事項\n✓ あなたに最適な解決策\n✓ 次のステップへの具体的なアクション',
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
              name: 'A様',
              role: '30代・会社員',
              comment: '診断結果が驚くほど的確で、自分の課題が明確になりました。',
              imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces'
            },
            {
              id: generateBlockId(),
              name: 'B様',
              role: '40代・経営者',
              comment: '無料とは思えないクオリティ。すぐに行動に移せるアドバイスが嬉しかったです。',
              imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
            },
            {
              id: generateBlockId(),
              name: 'C様',
              role: '20代・フリーランス',
              comment: '診断後の個別相談で、さらに深い気づきが得られました。',
              imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces'
            }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '診断後の3つのステップ',
          text: 'STEP 1：診断結果をその場で確認\nSTEP 2：詳細レポートをメールで受け取る\nSTEP 3：無料個別相談で具体的な解決策を提案',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'image',
        data: {
          url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
          caption: '診断結果に基づいた個別サポートも提供'
        }
      },
      {
        id: generateBlockId(),
        type: 'pricing',
        data: {
          plans: [
            {
              id: generateBlockId(),
              title: '無料診断',
              price: '¥0',
              features: ['3分で完了する簡単診断', '即座に結果を確認', '詳細レポートをメール送付', '改善のヒントを提供'],
              isRecommended: false
            },
            {
              id: generateBlockId(),
              title: '個別相談',
              price: '¥5,500',
              features: ['診断結果の詳細解説', '60分の個別セッション', 'あなた専用の改善プラン', 'フォローアップメール'],
              isRecommended: true
            },
            {
              id: generateBlockId(),
              title: '継続サポート',
              price: '月額 ¥33,000',
              features: ['月2回の個別セッション', '24時間チャットサポート', '定期的な進捗確認', '目標達成まで伴走'],
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
            { id: generateBlockId(), question: '診断は本当に無料ですか？', answer: 'はい、診断は完全無料です。メールアドレスの登録も不要で、すぐに結果を確認できます。' },
            { id: generateBlockId(), question: '診断結果は信頼できますか？', answer: 'はい、心理学と統計学に基づいた科学的な診断ロジックを使用しています。' },
            { id: generateBlockId(), question: '個別相談は必須ですか？', answer: 'いいえ、診断のみの利用も可能です。個別相談は希望される方のみご利用いただけます。' }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'line_card',
        data: {
          title: 'LINE登録で限定コンテンツ配信中',
          description: '診断結果の活用法や、最新のノウハウを定期的にお届けします',
          url: 'https://lin.ee/example',
          buttonText: 'LINE登録する'
        }
      },
      {
        id: generateBlockId(),
        type: 'lead_form',
        data: { title: '個別相談のお申し込み', buttonText: '相談を申し込む' }
      }
    ]
  }
];

