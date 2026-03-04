export interface FunnelTemplate {
  id: string;
  name: string;
  description: string;
  emoji: string;
  badge: string;
  steps: {
    name: string;
    stepType: string;
    contentRef: { type: string; message?: string; nextAction?: string; ctaText?: string; ctaUrl?: string } | null;
    ctaLabel: string;
  }[];
}

export const FUNNEL_TEMPLATES: FunnelTemplate[] = [
  {
    id: 'lead-magnet',
    name: 'リード獲得ファネル',
    description: 'LPで興味を引き、メルマガ登録でリードを獲得するシンプルなファネル',
    emoji: '🧲',
    badge: '入門におすすめ',
    steps: [
      { name: 'オプトインLP', stepType: 'business_lp', contentRef: null, ctaLabel: '詳しく見る' },
      { name: 'メルマガ登録', stepType: 'newsletter', contentRef: null, ctaLabel: '登録する' },
      { name: 'ありがとうございます', stepType: 'thank_you', contentRef: { type: 'thank_you', message: 'ご登録ありがとうございます！\n確認メールをお送りしましたのでご確認ください。', nextAction: 'メールボックスをご確認ください' }, ctaLabel: '' },
    ],
  },
  {
    id: 'consultation',
    name: '無料相談ファネル',
    description: '自己紹介→診断→予約の流れで無料相談に誘導するファネル',
    emoji: '💼',
    badge: 'コーチ・コンサル向け',
    steps: [
      { name: '自己紹介LP', stepType: 'profile_lp', contentRef: null, ctaLabel: 'もっと知る' },
      { name: '適性診断', stepType: 'quiz', contentRef: null, ctaLabel: '診断を受ける' },
      { name: '無料相談予約', stepType: 'booking', contentRef: null, ctaLabel: '予約する' },
      { name: 'ご予約ありがとうございます', stepType: 'thank_you', contentRef: { type: 'thank_you', message: 'ご予約ありがとうございます！\n当日お会いできることを楽しみにしています。', nextAction: '予約確認メールをお送りしました' }, ctaLabel: '' },
    ],
  },
  {
    id: 'sales',
    name: 'セールスファネル',
    description: 'LP→セールスレター→決済の王道パターンで商品を販売するファネル',
    emoji: '💰',
    badge: '商品販売向け',
    steps: [
      { name: '商品紹介LP', stepType: 'business_lp', contentRef: null, ctaLabel: '詳細を見る' },
      { name: 'セールスレター', stepType: 'salesletter', contentRef: null, ctaLabel: '申し込む' },
      { name: '申し込みフォーム', stepType: 'order_form', contentRef: null, ctaLabel: '購入する' },
      { name: 'ご購入ありがとうございます', stepType: 'thank_you', contentRef: { type: 'thank_you', message: 'ご購入ありがとうございます！\nサービスの詳細を記載したメールをお送りしました。', nextAction: 'メールをご確認ください' }, ctaLabel: '' },
    ],
  },
  {
    id: 'webinar',
    name: 'ウェビナー集客ファネル',
    description: 'LP→メルマガ→ウェビナー案内→申し込みの長期育成ファネル',
    emoji: '🎓',
    badge: 'セミナー・講座向け',
    steps: [
      { name: 'ウェビナー紹介LP', stepType: 'business_lp', contentRef: null, ctaLabel: '詳しく知る' },
      { name: 'メルマガ登録', stepType: 'newsletter', contentRef: null, ctaLabel: '登録する' },
      { name: 'セミナー案内LP', stepType: 'business_lp', contentRef: null, ctaLabel: '参加を申し込む' },
      { name: '参加申し込み', stepType: 'order_form', contentRef: null, ctaLabel: '申し込む' },
      { name: 'お申し込みありがとうございます', stepType: 'thank_you', contentRef: { type: 'thank_you', message: 'お申し込みありがとうございます！\n当日の参加方法をメールでお送りしました。', nextAction: 'メールに記載のZoomリンクからご参加ください' }, ctaLabel: '' },
    ],
  },
  {
    id: 'quiz-nurture',
    name: 'クイズ育成ファネル',
    description: '診断クイズで興味を引き、メルマガ→LPで育成して成約に繋げるファネル',
    emoji: '🎯',
    badge: '教育・サービス向け',
    steps: [
      { name: '適性診断クイズ', stepType: 'quiz', contentRef: null, ctaLabel: '結果を見る' },
      { name: 'メルマガ登録', stepType: 'newsletter', contentRef: null, ctaLabel: '登録して続きを見る' },
      { name: 'サービス紹介LP', stepType: 'business_lp', contentRef: null, ctaLabel: '申し込む' },
      { name: 'ありがとうございます', stepType: 'thank_you', contentRef: { type: 'thank_you', message: 'お申し込みありがとうございます！', nextAction: '詳細をメールでお送りしました' }, ctaLabel: '' },
    ],
  },
];
