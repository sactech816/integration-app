import type { SwipeTemplate } from '../types';
import type { Block } from '@/lib/types';
import { getTemplateImagePath } from '../thumbnail';

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
    { type: 'template', textOverlay: { title: '商品名をここに', subtitle: 'キャッチコピー', backgroundImageUrl: getTemplateImagePath('ig-story-gradient', 'sunset') } },
    { type: 'template', textOverlay: { title: '特徴①', subtitle: '詳細説明', backgroundImageUrl: getTemplateImagePath('ig-story-gradient', 'ocean') } },
    { type: 'template', textOverlay: { title: '特徴②', subtitle: '詳細説明', backgroundImageUrl: getTemplateImagePath('ig-story-gradient', 'aurora') } },
    { type: 'template', textOverlay: { title: 'お客様の声', subtitle: '★★★★★', backgroundImageUrl: getTemplateImagePath('ig-story-quote', 'dark-gold') } },
    { type: 'template', textOverlay: { title: '今だけ特別価格', subtitle: '詳しくは下へ ↓', backgroundImageUrl: getTemplateImagePath('ig-story-countdown', 'countdown-neon') } },
  ],
  blocks: [
    { id: bid(), type: 'text_card', data: { title: '商品の特徴', text: 'ここに商品の詳細を記載してください。', align: 'left' } } as Block,
    { id: bid(), type: 'pricing', data: { plans: [{ id: bid(), title: '通常価格', price: '¥9,800', features: ['特徴1', '特徴2', '特徴3'], isRecommended: true }] } } as Block,
    { id: bid(), type: 'faq', data: { items: [{ id: bid(), question: 'Q. 送料はかかりますか？', answer: 'A. 全国送料無料です。' }] } } as Block,
    { id: bid(), type: 'cta_section', data: { title: '今すぐ購入', description: '数量限定', buttonText: '購入する', buttonUrl: '#' } } as Block,
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
    { type: 'template', textOverlay: { title: 'セミナータイトル', subtitle: '開催日時', backgroundImageUrl: getTemplateImagePath('ig-story-reels-cover', 'reels-gradient') } },
    { type: 'template', textOverlay: { title: 'こんなお悩みありませんか？', subtitle: '', backgroundImageUrl: getTemplateImagePath('ig-story-quote', 'soft-white') } },
    { type: 'template', textOverlay: { title: '解決方法を伝授', subtitle: '3つのポイント', backgroundImageUrl: getTemplateImagePath('ig-story-qa', 'qa-pastel') } },
    { type: 'template', textOverlay: { title: '講師プロフィール', subtitle: '', backgroundImageUrl: getTemplateImagePath('ig-story-quote', 'forest') } },
    { type: 'template', textOverlay: { title: '参加者の声', subtitle: '', backgroundImageUrl: getTemplateImagePath('ig-story-gradient', 'ocean') } },
    { type: 'template', textOverlay: { title: '参加申し込み', subtitle: '残りわずか ↓', backgroundImageUrl: getTemplateImagePath('ig-story-countdown', 'countdown-gold') } },
  ],
  blocks: [
    { id: bid(), type: 'text_card', data: { title: 'セミナー概要', text: 'セミナーの詳細をここに記載。', align: 'left' } } as Block,
    { id: bid(), type: 'testimonial', data: { items: [{ id: bid(), name: '参加者A', role: '会社員', comment: 'とても参考になりました！' }] } } as Block,
    { id: bid(), type: 'countdown', data: { title: '申込締切まで', targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), expiredText: '受付終了', backgroundColor: '#f5576c' } } as Block,
    { id: bid(), type: 'lead_form', data: { title: '参加申し込み', buttonText: '申し込む' } } as Block,
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
    { type: 'template', textOverlay: { title: 'ポートフォリオ', subtitle: '名前・肩書き', backgroundImageUrl: getTemplateImagePath('ig-post-lifestyle', 'cream-brown') } },
    { type: 'template', textOverlay: { title: '作品 1', subtitle: '', backgroundImageUrl: getTemplateImagePath('ig-post-carousel', 'carousel-blue') } },
    { type: 'template', textOverlay: { title: '作品 2', subtitle: '', backgroundImageUrl: getTemplateImagePath('ig-post-carousel', 'carousel-pink') } },
    { type: 'template', textOverlay: { title: '作品 3', subtitle: '', backgroundImageUrl: getTemplateImagePath('ig-post-carousel', 'carousel-green') } },
    { type: 'template', textOverlay: { title: '作品 4', subtitle: '', backgroundImageUrl: getTemplateImagePath('ig-post-lifestyle', 'minimal-gray') } },
    { type: 'template', textOverlay: { title: '作品 5', subtitle: '', backgroundImageUrl: getTemplateImagePath('ig-post-announcement', 'announce-blue') } },
    { type: 'template', textOverlay: { title: '作品 6', subtitle: '', backgroundImageUrl: getTemplateImagePath('ig-post-announcement', 'announce-pink') } },
    { type: 'template', textOverlay: { title: 'お問い合わせ', subtitle: '↓ 詳細はこちら', backgroundImageUrl: getTemplateImagePath('ig-post-lifestyle', 'pastel-pink') } },
  ],
  blocks: [
    { id: bid(), type: 'text_card', data: { title: '自己紹介', text: 'あなたのプロフィールをここに記載。', align: 'center' } } as Block,
    { id: bid(), type: 'links', data: { links: [{ label: 'Instagram', url: '#', style: '' }, { label: 'X (Twitter)', url: '#', style: '' }] } } as Block,
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
    { type: 'template', textOverlay: { title: 'サービス名', subtitle: 'あなたの理想を実現', backgroundImageUrl: getTemplateImagePath('tiktok-trend', 'tiktok-neon') } },
    { type: 'template', textOverlay: { title: 'こんな方におすすめ', subtitle: '', backgroundImageUrl: getTemplateImagePath('tiktok-trend', 'tiktok-dark') } },
    { type: 'template', textOverlay: { title: '3つの特徴', subtitle: '', backgroundImageUrl: getTemplateImagePath('tiktok-howto', 'howto-blue') } },
    { type: 'template', textOverlay: { title: '料金プラン', subtitle: '', backgroundImageUrl: getTemplateImagePath('tiktok-howto', 'howto-green') } },
    { type: 'template', textOverlay: { title: 'お客様の声', subtitle: '', backgroundImageUrl: getTemplateImagePath('ig-story-quote', 'dark-gold') } },
    { type: 'template', textOverlay: { title: 'まずは無料相談', subtitle: '↓ 詳細はこちら', backgroundImageUrl: getTemplateImagePath('tiktok-trend', 'tiktok-rainbow') } },
  ],
  blocks: [
    { id: bid(), type: 'text_card', data: { title: 'サービス詳細', text: 'サービスの詳しい説明をここに。', align: 'left' } } as Block,
    { id: bid(), type: 'pricing', data: { plans: [{ id: bid(), title: 'ライト', price: '¥9,800/月', features: ['特徴1', '特徴2'], isRecommended: false }, { id: bid(), title: 'スタンダード', price: '¥19,800/月', features: ['特徴1', '特徴2', '特徴3'], isRecommended: true }] } } as Block,
    { id: bid(), type: 'testimonial', data: { items: [{ id: bid(), name: 'Aさん', role: '経営者', comment: '素晴らしいサービスでした。' }] } } as Block,
    { id: bid(), type: 'faq', data: { items: [{ id: bid(), question: 'Q. 無料相談はありますか？', answer: 'A. はい、初回30分無料でご相談いただけます。' }] } } as Block,
    { id: bid(), type: 'cta_section', data: { title: '無料相談はこちら', description: 'まずはお気軽にご連絡ください', buttonText: '申し込む', buttonUrl: '#' } } as Block,
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
    { type: 'template', textOverlay: { title: '店舗名', subtitle: 'キャッチコピー', backgroundImageUrl: getTemplateImagePath('ig-story-gradient', 'sunset') } },
    { type: 'template', textOverlay: { title: 'おすすめメニュー①', subtitle: '', backgroundImageUrl: getTemplateImagePath('ig-story-qa', 'qa-orange') } },
    { type: 'template', textOverlay: { title: 'おすすめメニュー②', subtitle: '', backgroundImageUrl: getTemplateImagePath('ig-story-qa', 'qa-mint') } },
    { type: 'template', textOverlay: { title: 'おすすめメニュー③', subtitle: '', backgroundImageUrl: getTemplateImagePath('ig-story-qa', 'qa-pastel') } },
    { type: 'template', textOverlay: { title: '店内の雰囲気', subtitle: '', backgroundImageUrl: getTemplateImagePath('ig-story-gradient', 'aurora') } },
    { type: 'template', textOverlay: { title: 'アクセス・予約', subtitle: '↓ 詳細はこちら', backgroundImageUrl: getTemplateImagePath('ig-story-countdown', 'countdown-dark') } },
  ],
  blocks: [
    { id: bid(), type: 'text_card', data: { title: '当店について', text: '店舗の紹介文をここに。', align: 'center' } } as Block,
    { id: bid(), type: 'google_map', data: { address: '東京都渋谷区...' } } as Block,
    { id: bid(), type: 'line_card', data: { title: 'LINE予約', description: 'LINEでかんたん予約！', url: '', buttonText: '友だち追加' } } as Block,
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
