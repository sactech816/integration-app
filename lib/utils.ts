// ===========================================
// 統合アプリケーション ユーティリティ関数
// ===========================================

/**
 * ランダムなSlugを生成（5文字の英数字）
 */
export const generateSlug = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

/**
 * 診断クイズの結果計算ロジック (3モード対応 & 動的ランク判定)
 */
interface AnswerOption {
  score?: Record<string, number>;
}

interface QuizResultType {
  type?: string;
  title?: string;
  description?: string;
  [key: string]: unknown;
}

export const calculateResult = (
  answers: Record<string, AnswerOption>,
  results: QuizResultType[],
  mode: 'diagnosis' | 'test' | 'fortune' = 'diagnosis'
): QuizResultType & { score?: number; total?: number } => {
  // 1. テストモード (Education)
  if (mode === 'test') {
    let correctCount = 0;
    Object.values(answers).forEach(option => {
      if (option.score && option.score.A === 1) {
        correctCount++;
      }
    });
    
    const totalQuestions = Object.keys(answers).length;
    const ratio = totalQuestions === 0 ? 0 : correctCount / totalQuestions;

    let resultIndex = Math.floor((1 - ratio) * results.length);
    
    if (ratio === 1) resultIndex = 0;
    if (resultIndex >= results.length) resultIndex = results.length - 1;

    return { ...results[resultIndex], score: correctCount, total: totalQuestions };
  }

  // 2. 占いモード (Fortune) - 完全ランダム
  if (mode === 'fortune') {
    const randomIndex = Math.floor(Math.random() * results.length);
    return results[randomIndex];
  }

  // 3. 診断モード (Business/Default) - ポイント加算方式
  const scores: Record<string, number> = { A: 0, B: 0, C: 0 };
  Object.values(answers).forEach(option => {
    if (option.score) {
      Object.entries(option.score).forEach(([type, point]) => {
        scores[type] = (scores[type] || 0) + (Number(point) || 0);
      });
    }
  });
  
  let maxType = 'A';
  let maxScore = -1;
  Object.entries(scores).forEach(([type, score]) => {
    if (score > maxScore) {
      maxScore = score;
      maxType = type;
    }
  });
  
  return results.find(r => r.type === maxType) || results[0];
};

/**
 * 日付をフォーマット
 */
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * 日時をフォーマット
 */
export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * 相対時間を取得（例: 3時間前、2日前）
 */
export const getRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const target = new Date(date);
  const diffMs = now.getTime() - target.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 30) {
    return formatDate(date);
  } else if (diffDay > 0) {
    return `${diffDay}日前`;
  } else if (diffHour > 0) {
    return `${diffHour}時間前`;
  } else if (diffMin > 0) {
    return `${diffMin}分前`;
  } else {
    return 'たった今';
  }
};

/**
 * URLからYouTube動画IDを抽出
 */
export const extractYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * 文字列を指定文字数で切り詰め
 */
export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
};

/**
 * クラス名を結合（falsy値は除外）
 */
export const cn = (...classes: (string | boolean | undefined | null)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * デバウンス関数
 */
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
    }, wait);
  };
};

/**
 * URLが有効かどうかをチェック
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * メールアドレスが有効かどうかをチェック
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
