import { Metadata } from 'next';

export type UGCType = 'quiz' | 'entertainment_quiz' | 'profile' | 'business' | 'survey' | 'salesletter'
  | 'gacha' | 'fukubiki' | 'scratch' | 'slot' | 'stamp-rally' | 'login-bonus'
  | 'booking' | 'kindle' | 'point-quiz' | 'arcade' | 'attendance' | 'thumbnail';

interface UGCMetadataInput {
  title: string;
  description: string;
  type: UGCType;
  slug: string;
  imageUrl?: string | null;
  keywords?: string[];
  noindex?: boolean;
}

const TYPE_CONFIG: Record<UGCType, {
  pathPrefix: string;
  label: string;
  defaultKeywords: string[];
  descriptionTemplate: (title: string) => string;
}> = {
  quiz: {
    pathPrefix: 'quiz',
    label: '診断クイズメーカー',
    defaultKeywords: ['診断クイズ', '性格診断', '心理テスト', '無料診断'],
    descriptionTemplate: (title) => `「${title}」であなたのタイプを無料診断。集客メーカーの診断クイズメーカーで作成された診断コンテンツです。`,
  },
  entertainment_quiz: {
    pathPrefix: 'entertainment',
    label: 'エンタメ診断メーカー',
    defaultKeywords: ['エンタメ診断', '占い', '性格診断', '無料診断', '心理テスト', 'おもしろ診断'],
    descriptionTemplate: (title) => `「${title}」で楽しく診断！SNSでシェアして友達と結果を比べよう。集客メーカーのエンタメ診断メーカーで作成されました。`,
  },
  profile: {
    pathPrefix: 'profile',
    label: 'プロフィールメーカー',
    defaultKeywords: ['プロフィール', 'リンクまとめ', 'プロフィールサイト'],
    descriptionTemplate: (title) => `${title}のプロフィールページ。SNSリンク・実績・サービス情報をまとめてチェックできます。`,
  },
  business: {
    pathPrefix: 'business',
    label: 'LPメーカー',
    defaultKeywords: ['ランディングページ', 'LP', 'ビジネスLP'],
    descriptionTemplate: (title) => `${title}のサービス詳細・特徴・料金をご紹介。集客メーカーのLPメーカーで作成されたランディングページです。`,
  },
  survey: {
    pathPrefix: 'survey',
    label: 'アンケートメーカー',
    defaultKeywords: ['アンケート', 'アンケート作成', 'フィードバック'],
    descriptionTemplate: (title) => `「${title}」へのご回答をお願いします。集客メーカーのアンケートメーカーで作成されたアンケートです。`,
  },
  salesletter: {
    pathPrefix: 's',
    label: 'セールスレターメーカー',
    defaultKeywords: ['セールスレター', 'LP'],
    descriptionTemplate: (title) => `${title}の詳細をご覧ください。集客メーカーのセールスレターメーカーで作成されたページです。`,
  },
  gacha: {
    pathPrefix: 'gacha',
    label: 'ガチャメーカー',
    defaultKeywords: ['ガチャ', 'オンラインガチャ', 'デジタルガチャ', '集客ツール'],
    descriptionTemplate: (title) => `「${title}」ガチャに挑戦しよう！集客メーカーのガチャメーカーで作成されたオンラインガチャです。`,
  },
  fukubiki: {
    pathPrefix: 'fukubiki',
    label: '福引きメーカー',
    defaultKeywords: ['福引き', 'デジタル福引き', '抽選', 'オンライン抽選'],
    descriptionTemplate: (title) => `「${title}」福引きに挑戦！集客メーカーの福引きメーカーで作成されたデジタル福引きです。`,
  },
  scratch: {
    pathPrefix: 'scratch',
    label: 'スクラッチメーカー',
    defaultKeywords: ['スクラッチ', 'デジタルスクラッチ', 'スクラッチくじ'],
    descriptionTemplate: (title) => `「${title}」スクラッチくじに挑戦！集客メーカーのスクラッチメーカーで作成されたデジタルスクラッチです。`,
  },
  slot: {
    pathPrefix: 'slot',
    label: 'スロットメーカー',
    defaultKeywords: ['スロット', 'デジタルスロット', 'オンラインスロット'],
    descriptionTemplate: (title) => `「${title}」スロットに挑戦！集客メーカーのスロットメーカーで作成されたオンラインスロットです。`,
  },
  'stamp-rally': {
    pathPrefix: 'stamp-rally',
    label: 'スタンプラリーメーカー',
    defaultKeywords: ['スタンプラリー', 'デジタルスタンプラリー', 'ポイントカード'],
    descriptionTemplate: (title) => `「${title}」スタンプラリーに参加しよう！集客メーカーのスタンプラリーメーカーで作成されたデジタルスタンプラリーです。`,
  },
  'login-bonus': {
    pathPrefix: 'login-bonus',
    label: 'ログインボーナスメーカー',
    defaultKeywords: ['ログインボーナス', '来店ポイント', 'リピート集客'],
    descriptionTemplate: (title) => `「${title}」のログインボーナスをゲットしよう！集客メーカーで作成されたログインボーナスです。`,
  },
  'point-quiz': {
    pathPrefix: 'point-quiz',
    label: 'ポイントクイズメーカー',
    defaultKeywords: ['ポイントクイズ', 'クイズゲーム', 'ポイント獲得'],
    descriptionTemplate: (title) => `「${title}」クイズに挑戦してポイントをゲット！集客メーカーのポイントクイズメーカーで作成されたクイズです。`,
  },
  arcade: {
    pathPrefix: 'arcade',
    label: 'アーケードメーカー',
    defaultKeywords: ['アーケードゲーム', 'ミニゲーム', 'ブラウザゲーム'],
    descriptionTemplate: (title) => `「${title}」ゲームに挑戦！集客メーカーのアーケードメーカーで作成されたブラウザゲームです。`,
  },
  booking: {
    pathPrefix: 'booking',
    label: '予約メーカー',
    defaultKeywords: ['予約システム', 'オンライン予約', '予約受付'],
    descriptionTemplate: (title) => `「${title}」のオンライン予約ページです。集客メーカーの予約メーカーで作成された予約受付ページです。`,
  },
  kindle: {
    pathPrefix: 'kindle',
    label: 'Kindle出版メーカー',
    defaultKeywords: ['Kindle出版', 'KDP', '電子書籍'],
    descriptionTemplate: (title) => `「${title}」の電子書籍情報ページです。集客メーカーのKindle出版メーカーで作成されたページです。`,
  },
  attendance: {
    pathPrefix: 'attendance',
    label: '出席管理メーカー',
    defaultKeywords: ['出席管理', '出欠確認', 'イベント管理'],
    descriptionTemplate: (title) => `「${title}」の出席管理ページです。集客メーカーの出席管理メーカーで作成されたページです。`,
  },
  thumbnail: {
    pathPrefix: 'thumbnail',
    label: 'サムネイルメーカー',
    defaultKeywords: ['サムネイル', 'サムネイル作成', 'AI画像生成'],
    descriptionTemplate: (title) => `「${title}」のサムネイル。集客メーカーのサムネイルメーカーでAI生成されたサムネイル画像です。`,
  },
};

export function generateUGCMetadata(input: UGCMetadataInput): Metadata {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://makers.tokyo';
  const config = TYPE_CONFIG[input.type];
  const ogImage = input.imageUrl ||
    `${siteUrl}/api/og?title=${encodeURIComponent(input.title)}&type=${input.type}`;
  const canonical = `${siteUrl}/${config.pathPrefix}/${input.slug}`;

  // descriptionはユーザー入力を優先、なければテンプレートから自動生成
  const description = input.description || config.descriptionTemplate(input.title);

  // <title>タグ: layout.tsxのtemplate「%s｜集客メーカー」が適用される
  // → 「ユーザータイトル｜ツール名｜集客メーカー」 の形式になる
  const pageTitle = `${input.title}｜${config.label}`;

  // OG/Twitterタイトル: templateが適用されないため、完全な形式を直接指定
  const ogTitle = `${input.title}｜${config.label}｜集客メーカー`;

  return {
    title: pageTitle,
    description,
    keywords: [...config.defaultKeywords, ...(input.keywords || []), '集客メーカー'],
    alternates: { canonical },
    ...(input.noindex && {
      robots: { index: false, follow: true },
    }),
    openGraph: {
      type: 'website',
      locale: 'ja_JP',
      url: canonical,
      siteName: '集客メーカー',
      title: ogTitle,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: input.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description,
      images: [ogImage],
      creator: '@syukaku_maker',
    },
  };
}
