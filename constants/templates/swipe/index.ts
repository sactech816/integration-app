import { SwipeTemplate } from '../types';

// ブロックID生成
const bid = () => `block_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

// ===========================================
// 商品紹介テンプレート
// ===========================================
const productTemplate: SwipeTemplate = {
  id: 'swipe-product',
  name: '商品紹介',
  description: '商品の魅力をカードで伝え、購入に導くLP',
  category: 'product',
  icon: 'ShoppingBag',
  recommended: true,
  aspectRatio: '9:16',
  theme: { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  cards: [
    { type: 'template', textOverlay: { title: '商品名をここに', subtitle: 'キャッチコピー' } },
    { type: 'template', textOverlay: { title: '特徴①', subtitle: '詳細説明' } },
    { type: 'template', textOverlay: { title: '特徴②', subtitle: '詳細説明' } },
    { type: 'template', textOverlay: { title: 'お客様の声', subtitle: '★★★★★' } },
    { type: 'template', textOverlay: { title: '今だけ特別価格', subtitle: '詳しくは下へ ↓' } },
  ],
  blocks: [
    { id: bid(), type: 'text_card', data: { title: '商品の特徴', text: 'ここに商品の詳細を記載してください。', align: 'left' } },
    { id: bid(), type: 'pricing', data: { title: '料金プラン', plans: [{ name: '通常価格', price: '¥9,800', features: ['特徴1', '特徴2', '特徴3'], recommended: true }] } },
    { id: bid(), type: 'faq', data: { title: 'よくある質問', items: [{ question: 'Q. 送料はかかりますか？', answer: 'A. 全国送料無料です。' }] } },
    { id: bid(), type: 'cta_section', data: { title: '今すぐ購入', subtitle: '数量限定', buttonText: '購入する', buttonUrl: '#' } },
  ],
  carouselSettings: { autoPlay: true, intervalSeconds: 5, mobileDisplay: 'swipe' },
};

// ===========================================
// セミナー集客テンプレート
// ===========================================
const seminarTemplate: SwipeTemplate = {
  id: 'swipe-seminar',
  name: 'セミナー集客',
  description: 'セミナー・講座の参加者を集めるLP',
  category: 'seminar',
  icon: 'Presentation',
  recommended: true,
  aspectRatio: '9:16',
  theme: { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  cards: [
    { type: 'template', textOverlay: { title: 'セミナータイトル', subtitle: '開催日時' } },
    { type: 'template', textOverlay: { title: 'こんなお悩みありませんか？', subtitle: '' } },
    { type: 'template', textOverlay: { title: '解決方法を伝授', subtitle: '3つのポイント' } },
    { type: 'template', textOverlay: { title: '講師プロフィール', subtitle: '' } },
    { type: 'template', textOverlay: { title: '参加者の声', subtitle: '' } },
    { type: 'template', textOverlay: { title: '参加申し込み', subtitle: '残りわずか ↓' } },
  ],
  blocks: [
    { id: bid(), type: 'text_card', data: { title: 'セミナー概要', text: 'セミナーの詳細をここに記載。', align: 'left' } },
    { id: bid(), type: 'testimonial', data: { title: '参加者の声', items: [{ name: '参加者A', role: '会社員', text: 'とても参考になりました！', rating: 5 }] } },
    { id: bid(), type: 'countdown', data: { title: '申込締切まで', targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), expiredText: '受付終了', backgroundColor: '#f5576c' } },
    { id: bid(), type: 'lead_form', data: { title: '参加申し込み', description: '下記フォームからお申し込みください', buttonText: '申し込む', fields: ['name', 'email'] } },
  ],
  carouselSettings: { autoPlay: true, intervalSeconds: 7, mobileDisplay: 'swipe' },
};

// ===========================================
// ポートフォリオテンプレート
// ===========================================
const portfolioTemplate: SwipeTemplate = {
  id: 'swipe-portfolio',
  name: 'ポートフォリオ',
  description: '作品・実績をカードで紹介',
  category: 'portfolio',
  icon: 'Images',
  aspectRatio: '1:1',
  theme: { gradient: 'linear-gradient(135deg, #0c3483 0%, #a2b6df 100%)' },
  cards: [
    { type: 'template', textOverlay: { title: 'ポートフォリオ', subtitle: '名前・肩書き' } },
    { type: 'template', textOverlay: { title: '作品 1', subtitle: '' } },
    { type: 'template', textOverlay: { title: '作品 2', subtitle: '' } },
    { type: 'template', textOverlay: { title: '作品 3', subtitle: '' } },
    { type: 'template', textOverlay: { title: '作品 4', subtitle: '' } },
    { type: 'template', textOverlay: { title: '作品 5', subtitle: '' } },
    { type: 'template', textOverlay: { title: '作品 6', subtitle: '' } },
    { type: 'template', textOverlay: { title: 'お問い合わせ', subtitle: '↓ 詳細はこちら' } },
  ],
  blocks: [
    { id: bid(), type: 'text_card', data: { title: '自己紹介', text: 'あなたのプロフィールをここに記載。', align: 'center' } },
    { id: bid(), type: 'links', data: { title: 'SNS・連絡先', links: [{ label: 'Instagram', url: '#', icon: 'instagram' }, { label: 'X (Twitter)', url: '#', icon: 'twitter' }] } },
  ],
  carouselSettings: { autoPlay: false, intervalSeconds: 5, mobileDisplay: 'swipe' },
};

// ===========================================
// サービス紹介テンプレート
// ===========================================
const serviceTemplate: SwipeTemplate = {
  id: 'swipe-service',
  name: 'サービス紹介',
  description: 'コンサル・コーチングなどのサービスLP',
  category: 'service',
  icon: 'Briefcase',
  recommended: true,
  aspectRatio: '9:16',
  theme: { gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)' },
  cards: [
    { type: 'template', textOverlay: { title: 'サービス名', subtitle: 'あなたの理想を実現' } },
    { type: 'template', textOverlay: { title: 'こんな方におすすめ', subtitle: '' } },
    { type: 'template', textOverlay: { title: '3つの特徴', subtitle: '' } },
    { type: 'template', textOverlay: { title: '料金プラン', subtitle: '' } },
    { type: 'template', textOverlay: { title: 'お客様の声', subtitle: '' } },
    { type: 'template', textOverlay: { title: 'まずは無料相談', subtitle: '↓ 詳細はこちら' } },
  ],
  blocks: [
    { id: bid(), type: 'text_card', data: { title: 'サービス詳細', text: 'サービスの詳しい説明をここに。', align: 'left' } },
    { id: bid(), type: 'pricing', data: { title: '料金プラン', plans: [{ name: 'ライト', price: '¥9,800/月', features: ['特徴1', '特徴2'] }, { name: 'スタンダード', price: '¥19,800/月', features: ['特徴1', '特徴2', '特徴3'], recommended: true }] } },
    { id: bid(), type: 'testimonial', data: { title: 'お客様の声', items: [{ name: 'Aさん', role: '経営者', text: '素晴らしいサービスでした。', rating: 5 }] } },
    { id: bid(), type: 'faq', data: { title: 'よくある質問', items: [{ question: 'Q. 無料相談はありますか？', answer: 'A. はい、初回30分無料でご相談いただけます。' }] } },
    { id: bid(), type: 'cta_section', data: { title: '無料相談はこちら', subtitle: 'まずはお気軽にご連絡ください', buttonText: '申し込む', buttonUrl: '#' } },
  ],
  carouselSettings: { autoPlay: true, intervalSeconds: 5, mobileDisplay: 'swipe' },
};

// ===========================================
// 飲食・店舗テンプレート
// ===========================================
const restaurantTemplate: SwipeTemplate = {
  id: 'swipe-restaurant',
  name: '飲食・店舗',
  description: 'メニュー・店舗の魅力をカードで紹介',
  category: 'restaurant',
  icon: 'UtensilsCrossed',
  aspectRatio: '9:16',
  theme: { gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)' },
  cards: [
    { type: 'template', textOverlay: { title: '店舗名', subtitle: 'キャッチコピー' } },
    { type: 'template', textOverlay: { title: 'おすすめメニュー①', subtitle: '' } },
    { type: 'template', textOverlay: { title: 'おすすめメニュー②', subtitle: '' } },
    { type: 'template', textOverlay: { title: 'おすすめメニュー③', subtitle: '' } },
    { type: 'template', textOverlay: { title: '店内の雰囲気', subtitle: '' } },
    { type: 'template', textOverlay: { title: 'アクセス・予約', subtitle: '↓ 詳細はこちら' } },
  ],
  blocks: [
    { id: bid(), type: 'text_card', data: { title: '当店について', text: '店舗の紹介文をここに。', align: 'center' } },
    { id: bid(), type: 'google_map', data: { title: 'アクセス', address: '東京都渋谷区...', embedUrl: '' } },
    { id: bid(), type: 'line_card', data: { title: 'LINE予約', description: 'LINEでかんたん予約！', lineUrl: '', buttonText: '友だち追加' } },
  ],
  carouselSettings: { autoPlay: true, intervalSeconds: 5, mobileDisplay: 'swipe' },
};

// ===========================================
// エクスポート
// ===========================================
export const swipeTemplates: SwipeTemplate[] = [
  productTemplate,
  seminarTemplate,
  portfolioTemplate,
  serviceTemplate,
  restaurantTemplate,
];

export const getSwipeTemplateById = (id: string) => swipeTemplates.find(t => t.id === id);
export const getSwipeTemplatesByCategory = (category: string) => swipeTemplates.filter(t => t.category === category);
export const recommendedSwipeTemplates = swipeTemplates.filter(t => t.recommended);
