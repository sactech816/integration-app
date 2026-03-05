import {
  GraduationCap, Briefcase, ShoppingCart, MessageSquare, UserCheck, Repeat,
  type LucideIcon,
} from 'lucide-react';

export interface OrderFormTemplateField {
  fieldType: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox';
  label: string;
  placeholder: string;
  required: boolean;
  options: string[] | null;
}

export interface OrderFormCtaButton {
  text?: string;
  bgColor?: string;
  textColor?: string;
  borderRadius?: 'sm' | 'md' | 'lg' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  animation?: 'none' | 'pulse' | 'shimmer' | 'bounce';
  size?: 'md' | 'lg';
}

export interface OrderFormTemplate {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  title: string;
  formDescription: string;
  paymentType: 'free' | 'one_time' | 'subscription';
  price: number;
  successMessage: string;
  replyEmailSubject: string;
  fields: OrderFormTemplateField[];
  ctaButton?: OrderFormCtaButton;
}

export const ORDER_FORM_TEMPLATES: OrderFormTemplate[] = [
  {
    id: 'seminar',
    name: 'セミナー・講座申込',
    description: 'セミナーや講座の参加申し込みフォーム',
    icon: GraduationCap,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    title: 'セミナー申し込みフォーム',
    formDescription: 'ご参加をご希望の方は下記フォームよりお申し込みください。',
    paymentType: 'one_time',
    price: 5000,
    successMessage: 'お申し込みありがとうございます。参加詳細をメールでお送りしますのでご確認ください。',
    replyEmailSubject: 'セミナーへのお申し込みありがとうございます',
    fields: [
      { fieldType: 'text', label: 'お名前', placeholder: '山田太郎', required: true, options: null },
      { fieldType: 'email', label: 'メールアドレス', placeholder: 'you@example.com', required: true, options: null },
      { fieldType: 'tel', label: '電話番号', placeholder: '090-1234-5678', required: false, options: null },
      { fieldType: 'select', label: '参加希望日', placeholder: '選択してください', required: true, options: ['第1回: 〇月〇日', '第2回: 〇月〇日', '第3回: 〇月〇日'] },
      { fieldType: 'textarea', label: '備考・ご質問', placeholder: 'ご質問やご要望があればご記入ください', required: false, options: null },
    ],
    ctaButton: { text: '今すぐ参加する', bgColor: '#059669', textColor: '#ffffff', borderRadius: 'full', shadow: 'lg', animation: 'pulse', size: 'lg' },
  },
  {
    id: 'consulting',
    name: 'コンサルティング申込',
    description: 'コンサルティングや個別相談の申し込みフォーム',
    icon: Briefcase,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    title: 'コンサルティング申し込み',
    formDescription: '個別コンサルティングのお申し込みフォームです。',
    paymentType: 'one_time',
    price: 30000,
    successMessage: 'お申し込みありがとうございます。日程調整のご連絡をメールでお送りいたします。',
    replyEmailSubject: 'コンサルティングへのお申し込みありがとうございます',
    fields: [
      { fieldType: 'text', label: 'お名前', placeholder: '山田太郎', required: true, options: null },
      { fieldType: 'email', label: 'メールアドレス', placeholder: 'you@example.com', required: true, options: null },
      { fieldType: 'tel', label: '電話番号', placeholder: '090-1234-5678', required: true, options: null },
      { fieldType: 'text', label: '会社名', placeholder: '株式会社〇〇', required: false, options: null },
      { fieldType: 'textarea', label: '相談内容', placeholder: '現在のお悩みやご相談内容をお書きください', required: true, options: null },
      { fieldType: 'textarea', label: '希望日程', placeholder: '第1希望: 〇月〇日 〇時〜\n第2希望: 〇月〇日 〇時〜', required: false, options: null },
    ],
    ctaButton: { text: 'コンサルティングを申し込む', bgColor: '#2563eb', textColor: '#ffffff', borderRadius: 'lg', shadow: 'lg', animation: 'shimmer', size: 'lg' },
  },
  {
    id: 'product-order',
    name: '商品注文フォーム',
    description: '商品の注文・購入用フォーム',
    icon: ShoppingCart,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    title: '商品注文フォーム',
    formDescription: 'ご注文は下記フォームよりお願いいたします。',
    paymentType: 'one_time',
    price: 3000,
    successMessage: 'ご注文ありがとうございます。発送準備が整い次第、メールでお知らせいたします。',
    replyEmailSubject: 'ご注文ありがとうございます',
    fields: [
      { fieldType: 'text', label: 'お名前', placeholder: '山田太郎', required: true, options: null },
      { fieldType: 'email', label: 'メールアドレス', placeholder: 'you@example.com', required: true, options: null },
      { fieldType: 'tel', label: '電話番号', placeholder: '090-1234-5678', required: true, options: null },
      { fieldType: 'textarea', label: 'お届け先住所', placeholder: '〒000-0000\n東京都〇〇区〇〇 1-2-3', required: true, options: null },
      { fieldType: 'number', label: '数量', placeholder: '1', required: true, options: null },
      { fieldType: 'textarea', label: '備考', placeholder: 'ギフト包装・配送日時のご希望などがあればご記入ください', required: false, options: null },
    ],
    ctaButton: { text: '注文する', bgColor: '#d97706', textColor: '#ffffff', borderRadius: 'md', shadow: 'lg', animation: 'none', size: 'md' },
  },
  {
    id: 'contact',
    name: 'お問い合わせフォーム',
    description: '汎用的なお問い合わせ受付フォーム',
    icon: MessageSquare,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    title: 'お問い合わせフォーム',
    formDescription: 'お気軽にお問い合わせください。',
    paymentType: 'free',
    price: 0,
    successMessage: 'お問い合わせありがとうございます。内容を確認の上、折り返しご連絡いたします。',
    replyEmailSubject: 'お問い合わせを受け付けました',
    fields: [
      { fieldType: 'text', label: 'お名前', placeholder: '山田太郎', required: true, options: null },
      { fieldType: 'email', label: 'メールアドレス', placeholder: 'you@example.com', required: true, options: null },
      { fieldType: 'select', label: 'お問い合わせ種類', placeholder: '選択してください', required: true, options: ['サービスについて', '料金について', 'その他'] },
      { fieldType: 'textarea', label: 'お問い合わせ内容', placeholder: 'お問い合わせ内容を詳しくお書きください', required: true, options: null },
    ],
    ctaButton: { text: '送信する', bgColor: '#0d9488', textColor: '#ffffff', borderRadius: 'lg', shadow: 'md', animation: 'none', size: 'md' },
  },
  {
    id: 'monitor',
    name: 'モニター・体験申込',
    description: 'モニターや無料体験の募集フォーム',
    icon: UserCheck,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    title: 'モニター・体験申し込み',
    formDescription: 'モニター（体験）にご興味のある方は、下記フォームよりお申し込みください。',
    paymentType: 'free',
    price: 0,
    successMessage: 'お申し込みありがとうございます。選考結果をメールでお知らせいたします。',
    replyEmailSubject: 'モニター・体験へのお申し込みありがとうございます',
    fields: [
      { fieldType: 'text', label: 'お名前', placeholder: '山田太郎', required: true, options: null },
      { fieldType: 'email', label: 'メールアドレス', placeholder: 'you@example.com', required: true, options: null },
      { fieldType: 'number', label: '年齢', placeholder: '30', required: false, options: null },
      { fieldType: 'text', label: '職業', placeholder: '会社員', required: false, options: null },
      { fieldType: 'textarea', label: '応募動機', placeholder: 'モニターに応募された理由をお書きください', required: true, options: null },
    ],
    ctaButton: { text: '無料で応募する', bgColor: '#7c3aed', textColor: '#ffffff', borderRadius: 'full', shadow: 'lg', animation: 'bounce', size: 'lg' },
  },
  {
    id: 'subscription',
    name: '月額サービス申込',
    description: '月額・サブスクリプションサービスの申し込みフォーム',
    icon: Repeat,
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    title: '月額サービス申し込み',
    formDescription: 'ご希望のプランを選択してお申し込みください。',
    paymentType: 'subscription',
    price: 5000,
    successMessage: 'お申し込みありがとうございます。サービス開始のご案内をメールでお送りします。',
    replyEmailSubject: '月額サービスへのお申し込みありがとうございます',
    fields: [
      { fieldType: 'text', label: 'お名前', placeholder: '山田太郎', required: true, options: null },
      { fieldType: 'email', label: 'メールアドレス', placeholder: 'you@example.com', required: true, options: null },
      { fieldType: 'select', label: 'プラン選択', placeholder: '選択してください', required: true, options: ['ライトプラン', 'スタンダードプラン', 'プレミアムプラン'] },
      { fieldType: 'textarea', label: '備考', placeholder: 'ご質問やご要望があればご記入ください', required: false, options: null },
    ],
    ctaButton: { text: '今すぐ始める', bgColor: '#e11d48', textColor: '#ffffff', borderRadius: 'full', shadow: 'xl', animation: 'shimmer', size: 'lg' },
  },
];
