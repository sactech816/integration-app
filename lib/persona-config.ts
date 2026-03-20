import {
  Rocket,
  GraduationCap,
  BookOpen,
  School,
  Palette,
  Layout,
  Calendar,
  PenTool,
  Search,
  Megaphone,
  DollarSign,
  LucideIcon,
} from 'lucide-react';

// ============================================================
// ペルソナ定義
// ============================================================

export type PersonaId = 'startup' | 'coach' | 'kindle' | 'school' | 'creator';

export type PersonaDef = {
  id: PersonaId;
  label: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  color: string;        // Tailwind color name (e.g. 'amber')
  hexColor: string;     // hex for custom styling
  defaultToolIds: string[];
  lpSlug: string;
  legacySlugs: string[];
};

export const PERSONAS: PersonaDef[] = [
  {
    id: 'startup',
    label: 'これから起業サポーター',
    shortLabel: '起業準備',
    description: '副業・起業をこれから始める方向け。自分の強みを見つけ、最初のサービスを形にする基本セット。',
    icon: Rocket,
    color: 'amber',
    hexColor: '#f59e0b',
    defaultToolIds: ['quiz', 'profile', 'business', 'order-form'],
    lpSlug: 'startup',
    legacySlugs: ['starter', 'freelance'],
  },
  {
    id: 'coach',
    label: 'コーチ・講師集客パック',
    shortLabel: 'コーチ・講師',
    description: 'コーチング・講座・コンサルの集客を自動化。診断クイズで見込み客を集め、メルマガで育成する仕組みを構築。',
    icon: GraduationCap,
    color: 'indigo',
    hexColor: '#6366f1',
    defaultToolIds: ['quiz', 'profile', 'business', 'booking', 'newsletter', 'step-email', 'funnel'],
    lpSlug: 'coach',
    legacySlugs: [],
  },
  {
    id: 'kindle',
    label: 'Kindle出版スタートキット',
    shortLabel: 'Kindle出版',
    description: '本を書く・出す・売るをすべてサポート。AI執筆から表紙デザイン、販促まで一気通貫。',
    icon: BookOpen,
    color: 'pink',
    hexColor: '#ec4899',
    defaultToolIds: ['kindle', 'kindle-cover', 'thumbnail', 'profile', 'sns-post', 'salesletter'],
    lpSlug: 'kindle',
    legacySlugs: [],
  },
  {
    id: 'school',
    label: 'イベント・教室運営セット',
    shortLabel: '教室・サロン',
    description: '教室・サロン・ワークショップの運営をまるごと支援。告知から予約、フォローアップまで。',
    icon: School,
    color: 'emerald',
    hexColor: '#10b981',
    defaultToolIds: ['webinar', 'booking', 'attendance', 'survey', 'newsletter'],
    lpSlug: 'school',
    legacySlugs: ['shop'],
  },
  {
    id: 'creator',
    label: 'コンテンツ販売・収益化パック',
    shortLabel: 'コンテンツ販売',
    description: 'オンライン講座・情報商材・デジタルコンテンツの販売を仕組み化。集客→販売の自動導線を構築。',
    icon: Palette,
    color: 'purple',
    hexColor: '#8b5cf6',
    defaultToolIds: ['salesletter', 'business', 'order-form', 'funnel', 'my-games', 'quiz'],
    lpSlug: 'creator',
    legacySlugs: ['business'],
  },
];

// ============================================================
// ツール探索カテゴリ（行動ベース）
// ============================================================

export type DiscoveryCategoryId = 'make-page' | 'booking-event' | 'content' | 'research' | 'marketing' | 'monetize';

export type DiscoveryCategoryDef = {
  id: DiscoveryCategoryId;
  label: string;
  icon: LucideIcon;
  toolIds: string[];
};

export const DISCOVERY_CATEGORIES: DiscoveryCategoryDef[] = [
  {
    id: 'make-page',
    label: 'ページを作りたい',
    icon: Layout,
    toolIds: ['profile', 'business', 'webinar', 'onboarding', 'site'],
  },
  {
    id: 'booking-event',
    label: '予約・イベント管理したい',
    icon: Calendar,
    toolIds: ['booking', 'attendance', 'survey'],
  },
  {
    id: 'content',
    label: '文章・コンテンツを作りたい',
    icon: PenTool,
    toolIds: ['salesletter', 'thumbnail', 'sns-post', 'kindle', 'kindle-cover', 'kindle-discovery'],
  },
  {
    id: 'research',
    label: '調査・分析したい',
    icon: Search,
    toolIds: [
      'survey', 'bigfive', 'entertainment', 'fortune',
      'youtube-analysis', 'youtube-keyword-research', 'kindle-keywords',
      'google-keyword-research', 'rakuten-research', 'niconico-keyword-research', 'reddit-keyword-research',
    ],
  },
  {
    id: 'marketing',
    label: '集客・発信したい',
    icon: Megaphone,
    toolIds: ['newsletter', 'step-email', 'funnel', 'line', 'concierge', 'quiz', 'sns-post'],
  },
  {
    id: 'monetize',
    label: '販売・収益化したい',
    icon: DollarSign,
    toolIds: ['order-form', 'my-games', 'marketplace-seller', 'affiliate'],
  },
];

// ============================================================
// ヘルパー関数
// ============================================================

export function getPersonaById(id: PersonaId): PersonaDef | undefined {
  return PERSONAS.find((p) => p.id === id);
}

export function getPersonaBySlug(slug: string): PersonaDef | undefined {
  return PERSONAS.find(
    (p) => p.lpSlug === slug || p.legacySlugs.includes(slug)
  );
}

export function getDefaultToolIds(personaId: PersonaId): string[] {
  const persona = getPersonaById(personaId);
  return persona?.defaultToolIds ?? [];
}

export function getVisibleToolIds(
  personaId: PersonaId,
  enabledToolIds: string[],
  showAllTools: boolean
): string[] | null {
  if (showAllTools) return null; // null = 全ツール表示
  const defaults = getDefaultToolIds(personaId);
  return [...new Set([...defaults, ...enabledToolIds])];
}

export function resolvePersonaSlug(slug: string): PersonaId | null {
  const persona = getPersonaBySlug(slug);
  return persona?.id ?? null;
}

export function isValidPersonaId(id: string): id is PersonaId {
  return PERSONAS.some((p) => p.id === id);
}
