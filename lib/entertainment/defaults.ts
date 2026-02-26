import type { Quiz } from '@/lib/types';

// --- フォーム型定義 ---
export interface EntertainmentForm {
  title: string;
  description: string;
  mode: 'diagnosis' | 'fortune';
  style: 'cute' | 'cool' | 'pop' | 'vibrant';
  layout: string;
  theme: string;
  questions: Array<{
    text: string;
    options: Array<{ label: string; score: Record<string, number> }>;
  }>;
  results: Array<{
    type: string;
    title: string;
    description: string;
    image_url?: string;
    imageHint?: string;
  }>;
  entertainment_meta: {
    shareTemplate?: string;
    ogStyle?: string;
    resultImages?: Record<string, string>;
  };
  show_in_portal: boolean;
}

// --- 定数 ---
export const STYLE_OPTIONS = [
  { label: 'かわいい系', value: 'cute' as const, emoji: '🐱' },
  { label: 'クール系', value: 'cool' as const, emoji: '🐺' },
  { label: 'ポップ系', value: 'pop' as const, emoji: '🎉' },
  { label: 'ビビッド系', value: 'vibrant' as const, emoji: '🌈' },
];

export const MODE_OPTIONS = [
  { label: '診断', value: 'diagnosis' as const, emoji: '🎯' },
  { label: '占い', value: 'fortune' as const, emoji: '🔮' },
];

export const RESULT_COUNT_OPTIONS = [3, 4, 6];

export const STYLE_TO_THEME: Record<string, string> = {
  cute: 'kawaii',
  cool: 'galaxy',
  pop: 'vibrant',
  vibrant: 'vibrant',
};

export const THEME_PRESETS = [
  { id: 'vibrant', name: 'ビビッド', color: 'bg-gradient-to-r from-red-400 to-yellow-400', desc: 'エンタメ' },
  { id: 'kawaii', name: 'かわいい', color: 'bg-gradient-to-r from-pink-400 to-purple-400', desc: 'ファンシー' },
  { id: 'galaxy', name: 'ギャラクシー', color: 'bg-gradient-to-r from-indigo-800 to-purple-800', desc: '宇宙' },
  { id: 'standard', name: 'スタンダード', color: 'bg-indigo-600', desc: 'シンプル' },
  { id: 'pastel', name: 'パステル', color: 'bg-gradient-to-r from-pink-300 to-purple-300', desc: '優しい' },
  { id: 'cyberpunk', name: 'サイバーパンク', color: 'bg-black', desc: '未来的' },
];

// --- デフォルト値 ---
function makeDefaultResults(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const type = String.fromCharCode(65 + i);
    return { type, title: `結果${type}`, description: `結果${type}の説明文` };
  });
}

function makeDefaultQuestions(resultCount: number) {
  const types = Array.from({ length: resultCount }, (_, i) => String.fromCharCode(65 + i));
  return Array.from({ length: 5 }, (_, qi) => ({
    text: `質問${qi + 1}`,
    options: Array.from({ length: 4 }, (_, oi) => ({
      label: `選択肢${oi + 1}`,
      score: Object.fromEntries(types.map((t, ti) => [t, oi === ti ? 3 : 0])),
    })),
  }));
}

export function createDefaultForm(resultCount = 4): EntertainmentForm {
  return {
    title: '新しいエンタメ診断',
    description: '説明文を入力してください',
    mode: 'diagnosis',
    style: 'pop',
    layout: 'pop',
    theme: 'vibrant',
    questions: makeDefaultQuestions(resultCount),
    results: makeDefaultResults(resultCount),
    entertainment_meta: {
      shareTemplate: 'わたしは「{{result_title}}」タイプでした！\n{{quiz_title}}\n#エンタメ診断',
      ogStyle: 'pop',
    },
    show_in_portal: true,
  };
}

export const defaultEntertainmentForm = createDefaultForm(4);

// --- 変換関数 ---
export function quizFromForm(form: EntertainmentForm): Quiz {
  return {
    id: 0,
    slug: 'preview',
    title: form.title,
    description: form.description,
    category: 'Entertainment',
    color: 'bg-pink-500',
    questions: form.questions.map((q, i) => ({
      id: `q-${i}`,
      text: q.text,
      options: q.options.map((o) => ({
        label: o.label,
        text: o.label,
        score: o.score,
      })),
    })),
    results: form.results,
    layout: (form.layout as Quiz['layout']) || 'pop',
    mode: form.mode,
    theme: (form.theme as Quiz['theme']) || 'vibrant',
    quiz_type: 'entertainment',
    entertainment_meta: {
      shareTemplate: form.entertainment_meta.shareTemplate,
      ogStyle: form.entertainment_meta.ogStyle as 'vibrant' | 'cute' | 'cool' | 'pop',
      resultImages: form.entertainment_meta.resultImages,
    },
  };
}

export function applyGeneratedData(
  form: EntertainmentForm,
  apiData: { quiz: { title: string; description: string; questions: any[]; results: any[] }; shareTemplate?: string },
  style: string,
  mode: string,
): EntertainmentForm {
  const quiz = apiData.quiz;
  const resultTypes = quiz.results.map((r: { type: string }) => r.type);

  return {
    ...form,
    title: quiz.title,
    description: quiz.description,
    mode: mode as 'diagnosis' | 'fortune',
    style: style as EntertainmentForm['style'],
    theme: STYLE_TO_THEME[style] || 'vibrant',
    questions: quiz.questions.map((q: { text: string; options: { label: string; score: Record<string, number> }[] }) => ({
      text: q.text,
      options: q.options.map((opt: { label: string; score: Record<string, number> }) => ({
        label: opt.label,
        score: opt.score,
      })),
    })),
    results: quiz.results.map((r: { type: string; title: string; description: string; imageHint?: string }) => ({
      type: r.type,
      title: r.title,
      description: r.description,
      ...(r.imageHint ? { imageHint: r.imageHint } : {}),
    })),
    entertainment_meta: {
      ...form.entertainment_meta,
      shareTemplate: apiData.shareTemplate || form.entertainment_meta.shareTemplate,
      ogStyle: style,
    },
  };
}
