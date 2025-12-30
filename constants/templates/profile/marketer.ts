import { Template } from '../types';
import { generateBlockId } from '@/lib/types';

/**
 * マーケター・講師向けプロフィールLPテンプレート
 */
export const marketerTemplates: Template[] = [
  {
    id: 'marketer-fullpackage',
    name: 'フルセット',
    description: 'Webマーケター・フルセット - 高機能・CV重視',
    category: 'マーケター・講師',
    theme: {
      gradient: 'linear-gradient(-45deg, #3b82f6, #1d4ed8, #06b6d4, #0891b2)'
    },
    blocks: [
      {
        id: generateBlockId(),
        type: 'header',
        data: {
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=faces',
          name: '山田 太郎',
          title: 'Web集客コンサルタント / 著者',
          category: 'business'
        }
      },
      {
        id: generateBlockId(),
        type: 'image',
        data: {
          url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop',
          caption: '年間300社の集客改善実績'
        }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '『良い商品なのに売れない』その悩みを仕組みで解決します',
          text: '根性論の営業ではなく、科学的なWebマーケティングでビジネスを自動化。集客に追われる日々を卒業しましょう。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'quiz',
        data: { title: 'Web集客力診断', quizSlug: 'web-marketing-diagnosis' }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: 'たった3分！あなたのビジネスの課題と今やるべき施策が分かります。',
          text: '無料診断で現状を把握し、最適な集客戦略を見つけましょう。',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'youtube',
        data: { url: 'https://www.youtube.com/watch?v=N2NIQztcYyw' }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '最新のセミナー動画',
          text: '【完全解説】広告費0円で月100リスト獲得する方法',
          align: 'center'
        }
      },
      {
        id: generateBlockId(),
        type: 'kindle',
        data: {
          asin: 'B09YYYYYYY',
          imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
          title: 'Web集客1年生の教科書',
          description: 'Amazonランキング1位獲得（マーケティング部門）'
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
              comment: '仕組み化してから、月商が3倍になりました！',
              imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces'
            },
            {
              id: generateBlockId(),
              name: 'K様',
              role: '整体院経営',
              comment: 'リピート率が50%から80%に改善しました。',
              imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'
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
              title: 'オンラインサロン',
              price: '月額 3,300円',
              features: ['月2回のオンライン勉強会', '限定コンテンツ配信', 'メンバー限定Q&A', '実践ワークシート提供'],
              isRecommended: false
            },
            {
              id: generateBlockId(),
              title: 'Web集客集中講座',
              price: '59,800円',
              features: ['6週間の集中プログラム', '個別フィードバック', '実践課題とサポート', '修了証書発行'],
              isRecommended: true
            },
            {
              id: generateBlockId(),
              title: '個別コンサルティング',
              price: '月額 165,000円',
              features: ['月4回の個別面談', 'カスタム戦略立案', '24時間チャットサポート', '成果保証付き'],
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
            { id: generateBlockId(), question: '初心者でも成果は出ますか？', answer: 'はい、基礎からステップバイステップで解説しています。' },
            { id: generateBlockId(), question: '返金保証は？', answer: '30日間の全額返金保証をつけております。' }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'links',
        data: {
          links: [
            { label: 'Twitter', url: 'https://x.com/example', style: '' },
            { label: 'Facebook', url: 'https://facebook.com/example', style: '' },
            { label: 'Instagram', url: 'https://instagram.com/example', style: '' },
            { label: 'TikTok', url: 'https://tiktok.com/@example', style: '' }
          ]
        }
      },
      {
        id: generateBlockId(),
        type: 'line_card',
        data: {
          title: '公式LINEに登録する',
          description: '非公開動画をプレゼント',
          url: 'https://lin.ee/example',
          buttonText: 'LINE登録して特典を受け取る'
        }
      },
      {
        id: generateBlockId(),
        type: 'countdown',
        data: { 
          title: '期間限定キャンペーン', 
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), 
          expiredText: 'キャンペーン終了', 
          backgroundColor: '#f59e0b' 
        }
      },
      {
        id: generateBlockId(),
        type: 'gallery',
        data: { 
          title: 'セミナー・イベント実績', 
          items: [
            { id: generateBlockId(), imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=400&fit=crop', caption: 'セミナー登壇' },
            { id: generateBlockId(), imageUrl: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400&h=400&fit=crop', caption: 'ワークショップ' },
            { id: generateBlockId(), imageUrl: 'https://images.unsplash.com/photo-1558403194-611308249627?w=400&h=400&fit=crop', caption: '企業研修' }
          ], 
          columns: 3, 
          showCaptions: true 
        }
      },
      {
        id: generateBlockId(),
        type: 'lead_form',
        data: { title: '無料個別相談会', buttonText: '相談会に申し込む' }
      },
      {
        id: generateBlockId(),
        type: 'text_card',
        data: {
          title: '毎月3名様限定で、あなたのビジネスの悩みを直接伺います。',
          text: 'Zoomにて60分間、完全無料でご相談いただけます。お気軽にお申し込みください。',
          align: 'center'
        }
      }
    ]
  }
];










