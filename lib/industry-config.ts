import {
  Scale,
  Scissors,
  Building2,
  Paintbrush,
  Stethoscope,
  UtensilsCrossed,
  Briefcase,
  GraduationCap,
  ShoppingBag,
  Home,
  LucideIcon,
} from 'lucide-react';

// ============================================================
// 業種別設定
// ============================================================

export type IndustryId =
  | 'shigyou'
  | 'salon'
  | 'franchise'
  | 'agency'
  | 'clinic'
  | 'restaurant'
  | 'consultant'
  | 'school-biz'
  | 'ec'
  | 'realestate';

export type IndustryDef = {
  id: IndustryId;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  color: string;       // hex
  bgColor: string;     // hex (薄い背景)
  slug: string;
  matchTools: string[]; // 特にマッチするツール名
};

export const INDUSTRIES: IndustryDef[] = [
  {
    id: 'shigyou',
    label: '士業（税理士・行政書士・社労士 等）',
    shortLabel: '士業',
    description: '信頼と専門性で選ばれる仕組みを構築',
    icon: Scale,
    color: '#1e40af',
    bgColor: '#dbeafe',
    slug: 'shigyou',
    matchTools: ['診断クイズ', 'プロフィールLP', 'メルマガ', 'ガイドメーカー'],
  },
  {
    id: 'salon',
    label: 'サロン・美容',
    shortLabel: 'サロン',
    description: 'リピーターが増え、口コミが広がる仕組み',
    icon: Scissors,
    color: '#db2777',
    bgColor: '#fce7f3',
    slug: 'salon',
    matchTools: ['予約フォーム', 'ガミフィケーション', 'SNS投稿', '診断クイズ'],
  },
  {
    id: 'franchise',
    label: 'フランチャイズ本部',
    shortLabel: 'FC本部',
    description: '加盟店募集から説明会まで一気通貫',
    icon: Building2,
    color: '#0d9488',
    bgColor: '#ccfbf1',
    slug: 'franchise',
    matchTools: ['ビジネスLP', 'ファネル', '申し込みフォーム', 'ステップメール'],
  },
  {
    id: 'agency',
    label: '制作会社・代理店',
    shortLabel: '制作会社',
    description: 'ポートフォリオと実績で案件を獲得',
    icon: Paintbrush,
    color: '#7c3aed',
    bgColor: '#ede9fe',
    slug: 'agency',
    matchTools: ['ビジネスLP', 'プロフィールLP', '申し込みフォーム', 'ウェビナーLP'],
  },
  {
    id: 'clinic',
    label: 'クリニック・治療院',
    shortLabel: 'クリニック',
    description: '患者さんの「不安」を「安心」に変える',
    icon: Stethoscope,
    color: '#059669',
    bgColor: '#d1fae5',
    slug: 'clinic',
    matchTools: ['診断クイズ', '予約フォーム', 'プロフィールLP', 'ガイドメーカー'],
  },
  {
    id: 'restaurant',
    label: '飲食店・カフェ',
    shortLabel: '飲食店',
    description: '来店のきっかけとリピートを仕組み化',
    icon: UtensilsCrossed,
    color: '#ea580c',
    bgColor: '#ffedd5',
    slug: 'restaurant',
    matchTools: ['予約フォーム', 'アンケート', 'ガミフィケーション', 'SNS投稿'],
  },
  {
    id: 'consultant',
    label: 'コンサルタント・コーチ',
    shortLabel: 'コンサル',
    description: '専門性を伝え、相談予約を自動化',
    icon: Briefcase,
    color: '#4f46e5',
    bgColor: '#e0e7ff',
    slug: 'consultant',
    matchTools: ['診断クイズ', 'ファネル', 'メルマガ', 'ウェビナーLP'],
  },
  {
    id: 'school-biz',
    label: '教室・スクール',
    shortLabel: '教室',
    description: '体験申込から入会まで自然な流れを構築',
    icon: GraduationCap,
    color: '#0891b2',
    bgColor: '#cffafe',
    slug: 'school-biz',
    matchTools: ['出欠管理', 'ガミフィケーション', '申し込みフォーム', '予約フォーム'],
  },
  {
    id: 'ec',
    label: 'EC・物販・D2C',
    shortLabel: 'EC・物販',
    description: '商品の魅力を伝え、購入につなげる',
    icon: ShoppingBag,
    color: '#c026d3',
    bgColor: '#fae8ff',
    slug: 'ec',
    matchTools: ['セールスライター', 'サムネイル', 'メルマガ', 'ビジネスLP'],
  },
  {
    id: 'realestate',
    label: '不動産・住宅',
    shortLabel: '不動産',
    description: '物件の魅力を伝え、内見予約を獲得',
    icon: Home,
    color: '#b45309',
    bgColor: '#fef3c7',
    slug: 'realestate',
    matchTools: ['診断クイズ', 'ビジネスLP', 'ガイドメーカー', '予約フォーム'],
  },
];

export function getIndustryById(id: IndustryId): IndustryDef | undefined {
  return INDUSTRIES.find((ind) => ind.id === id);
}

export function getIndustryBySlug(slug: string): IndustryDef | undefined {
  return INDUSTRIES.find((ind) => ind.slug === slug);
}
