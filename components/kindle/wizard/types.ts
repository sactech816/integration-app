// タイトル案の型定義
export interface TitleSuggestion {
  title: string;
  score: number;
  description: string;
}

// サブタイトル案の型定義
export interface SubtitleSuggestion {
  subtitle: string;
  score: number;
  reason: string;
}

// ターゲット案の型定義
export interface TargetSuggestion {
  profile: string;
  merits: string[];
  benefits: string[];
  differentiation: string[];
  usp: string;
}

// 章・節の型定義
export interface Section {
  title: string;
}

export interface Chapter {
  title: string;
  summary: string;
  sections: Section[];
}

// ウィザードの状態型定義
export interface WizardState {
  theme: string;
  selectedTitle: string;
  subtitle: string;
  selectedTarget: TargetSuggestion | null;
  chapters: Chapter[];
  tocPatternId?: string; // 目次で選択したパターンID（執筆スタイルのデフォルト決定用）
}

// 目次スロットの型定義
export interface TOCSlot {
  chapters: Chapter[];
  patternId: string;
  patternName: string;
  estimatedWords: string;
}

// 推奨パターンの型定義
export interface RecommendedPattern {
  patternId: string;
  reason: string;
  score: number;
}

// パターン定義
export const CHAPTER_PATTERNS = {
  basic: { id: 'basic', name: '基礎→応用→実践型', description: '基礎→応用→実践→差別化→未来展望', icon: '📚' },
  problem: { id: 'problem', name: '問題解決型', description: '問題提起→原因分析→解決法→事例→行動計画', icon: '🔍' },
  story: { id: 'story', name: 'ストーリー型', description: '過去→現在→未来／失敗→学び→成功', icon: '📖' },
  qa: { id: 'qa', name: 'Q&A型', description: '読者の疑問を章ごとに取り上げ回答する', icon: '❓' },
  workbook: { id: 'workbook', name: 'ワークブック型', description: '解説＋実践ワークを交互に配置', icon: '✏️' },
  original: { id: 'original', name: 'オリジナル構成', description: 'タイトル・ターゲットに最も合う独自構成', icon: '✨' },
} as const;

// ユーティリティ関数：ターゲットオブジェクトをクリーンにコピー（循環参照を避ける）
export const cleanTarget = (target: TargetSuggestion | null): TargetSuggestion | null => {
  if (!target) return null;
  return {
    profile: target.profile,
    merits: [...target.merits],
    benefits: [...target.benefits],
    differentiation: [...target.differentiation],
    usp: target.usp,
  };
};

// ユーティリティ関数：章のディープコピーを作成（循環参照を避ける）
export const cleanChapters = (chapters: Chapter[]): Chapter[] => {
  return chapters.map(ch => ({
    title: ch.title,
    summary: ch.summary,
    sections: ch.sections.map(s => ({ title: s.title }))
  }));
};

// =============================================
// デモモード用モックデータ
// =============================================

// モックタイトル案
export const MOCK_TITLES: TitleSuggestion[] = [
  { title: '【完全版】副業で月10万円を稼ぐ！初心者からプロになる最強メソッド', score: 95, description: '想定ターゲット: 初心者〜中級者。強み: 「完全版」「最強」で検索需要が高く、ベネフィットが明確' },
  { title: '副業の教科書｜知識ゼロから始める実践ガイド', score: 92, description: '想定ターゲット: 完全初心者。強み: 「教科書」「知識ゼロ」で入門者に訴求' },
  { title: 'たった3ヶ月で成果が出る！副業の成功法則', score: 90, description: '想定ターゲット: 早く結果を出したい人。強み: 具体的な期間で成果をイメージさせる' },
  { title: '副業入門｜今日から使える実践テクニック50選', score: 88, description: '想定ターゲット: 実践派の初心者。強み: 「50選」で具体性と網羅性をアピール' },
  { title: 'なぜあなたの副業はうまくいかないのか？', score: 86, description: '想定ターゲット: 挫折経験者。強み: 問題提起型で悩みに刺さる' },
  { title: '副業で月10万円稼ぐ！副業成功の完全ロードマップ', score: 85, description: '想定ターゲット: 副業希望者。強み: 具体的な金額とロードマップで行動を促す' },
  { title: 'プロが教える副業の極意｜成功者だけが知っている秘訣', score: 83, description: '想定ターゲット: 中級者〜上級者。強み: 「プロ」「極意」で権威性を演出' },
  { title: '副業大全｜これ1冊で全てがわかる決定版', score: 82, description: '想定ターゲット: 網羅的に学びたい人。強み: 「大全」「決定版」で圧倒的な情報量を訴求' },
  { title: '忙しい人のための副業｜1日10分で身につく超効率メソッド', score: 80, description: '想定ターゲット: 時間がない社会人。強み: 「1日10分」で手軽さをアピール' },
  { title: '副業の新常識｜2025年版・最新トレンド完全解説', score: 78, description: '想定ターゲット: 最新情報を求める人。強み: 「新常識」「最新」で鮮度をアピール' },
];

// モックサブタイトル案
export const MOCK_SUBTITLES: SubtitleSuggestion[] = [
  { subtitle: '忙しい会社員でも1日30分で実践できる再現性の高いメソッド', score: 94, reason: '具体的な時間と「再現性」で読者の行動を促す' },
  { subtitle: '知識ゼロから始めて3ヶ月で月5万円を達成する具体的ステップ', score: 91, reason: '明確な数字と期間でゴールをイメージさせる' },
  { subtitle: '本業を辞めずにリスクなく始められる2025年最新の副業戦略', score: 88, reason: 'リスクへの不安を解消し、最新感をアピール' },
  { subtitle: '失敗しない副業選びから収益化まで徹底解説', score: 85, reason: '網羅性と「失敗しない」で安心感を与える' },
  { subtitle: '元会社員が教える実体験に基づく成功の秘訣', score: 82, reason: '著者の実体験で信頼性を高める' },
];

// モックターゲット案
export const MOCK_TARGETS: TargetSuggestion[] = [
  {
    profile: '副業を始めたいが何から手をつけていいかわからない30代会社員',
    merits: ['具体的なステップで迷わず進められる', '本業と両立できる時間管理術が学べる', 'リスクを最小限に抑えた始め方がわかる'],
    benefits: ['経済的な余裕ができて将来への不安が減る', '新しいスキルを身につけてキャリアの選択肢が広がる', '家族との時間を犠牲にせず収入を増やせる'],
    differentiation: ['理論だけでなく実践的なワークシート付き', '著者の実体験に基づくリアルなアドバイス', 'つまずきやすいポイントを先回りして解説'],
    usp: '「忙しい会社員でも、1日30分の積み重ねで確実に成果を出せる」再現性の高い実践メソッド',
  },
  {
    profile: '以前副業に挑戦したが挫折した経験のある40代サラリーマン',
    merits: ['失敗の原因を分析して対策がわかる', '継続するためのモチベーション管理法が学べる', '自分に合った副業の見つけ方がわかる'],
    benefits: ['過去の失敗を糧にして今度こそ成功できる', '定年後のセカンドキャリアの土台が作れる', '自信を取り戻してポジティブに行動できる'],
    differentiation: ['挫折経験者向けのリカバリー戦略を詳説', 'メンタル面のサポートも充実', '小さな成功体験を積み重ねるステップ設計'],
    usp: '「一度失敗しても大丈夫。なぜ失敗したかがわかれば、必ず成功できる」リベンジのための完全ガイド',
  },
  {
    profile: '育休中にスキルを身につけて復帰後のキャリアアップを目指す女性',
    merits: ['育児の合間にできる副業の選び方がわかる', '在宅でできるスキルの習得方法が学べる', '復帰後も続けられる仕組みづくりがわかる'],
    benefits: ['育休期間を有意義に使って成長できる', '経済的な自立で家庭内の発言力が上がる', '仕事と育児の両立に自信が持てる'],
    differentiation: ['女性目線での具体的なアドバイス', '育児との両立事例を多数紹介', '短時間で成果を出すための効率化テクニック'],
    usp: '「育児の合間の隙間時間を使って、復帰後のキャリアも収入もアップできる」女性のための副業戦略',
  },
];

// モック目次（章構成）
export const MOCK_CHAPTERS: Chapter[] = [
  { 
    title: 'はじめに', 
    summary: '本書の目的と全体像', 
    sections: [
      { title: '本書の目的と全体像' }, 
      { title: '著者の実績と信頼性' }, 
      { title: '対象読者と読むメリット' }
    ] 
  },
  { 
    title: '第1章　副業の基礎を理解する', 
    summary: '成功に必要な基礎知識', 
    sections: [
      { title: '本章の概要' }, 
      { title: '副業の種類と特徴' }, 
      { title: '自分に合った副業の見つけ方' }, 
      { title: '本章のまとめ' }
    ] 
  },
  { 
    title: '第2章　準備と心構え', 
    summary: '始める前に整えるべきこと', 
    sections: [
      { title: '本章の概要' }, 
      { title: '時間管理の基本' }, 
      { title: '必要なツールと環境整備' }, 
      { title: 'マインドセットの重要性' }, 
      { title: '本章のまとめ' }
    ] 
  },
  { 
    title: '第3章　実践のステップ', 
    summary: '具体的な行動ステップ', 
    sections: [
      { title: '本章の概要' }, 
      { title: 'ステップ1：リサーチと市場調査' }, 
      { title: 'ステップ2：小さく始める' }, 
      { title: 'ステップ3：改善と拡大' }, 
      { title: '本章のまとめ' }
    ] 
  },
  { 
    title: '第4章　収益化と成長', 
    summary: '収入を増やすための戦略', 
    sections: [
      { title: '本章の概要' }, 
      { title: '収益化のポイント' }, 
      { title: 'スケールアップの方法' }, 
      { title: '継続のためのコツ' }, 
      { title: '本章のまとめ' }
    ] 
  },
  { 
    title: 'おわりに', 
    summary: '読者への最終メッセージ', 
    sections: [
      { title: '最後に伝えたいこと' }, 
      { title: 'カスタマーレビューのお願い' }, 
      { title: '著者紹介' }
    ] 
  },
];

// デモモード用の遅延処理（ローディング演出）
export const demoDelay = (ms: number = 1000): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};


















