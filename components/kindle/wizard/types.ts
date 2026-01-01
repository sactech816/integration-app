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












