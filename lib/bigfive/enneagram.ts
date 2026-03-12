// =============================================================================
// エニアグラム性格診断 — 質問データ + 判定ロジック
//
// エニアグラムは古代起源の性格類型論。概念自体に著作権なし。
// 以下の質問は独自に作成（特定テストのコピーではない）。
// 9タイプ × 5問 = 45問
// =============================================================================

export interface EnneagramQuestion {
  id: number;
  text: string;
  type: number; // 1-9
}

export interface EnneagramResult {
  primaryType: number;
  secondaryType: number;
  wing: string;          // e.g. "4w5"
  name: string;
  description: string;
  scores: Record<number, number>; // 各タイプのスコア(%)
  triad: 'gut' | 'heart' | 'head';
}

// =============================================================================
// 9タイプ定義
// =============================================================================

export const ENNEAGRAM_TYPES: Record<number, {
  name: string;
  description: string;
  triad: 'gut' | 'heart' | 'head';
  coreMotivation: string;
  coreFear: string;
}> = {
  1: {
    name: '改革する人',
    description: '高い理想と正義感を持ち、物事を正しくあるべき姿にしようとする完璧主義者。責任感が強く、自分にも他人にも高い基準を求めます。',
    triad: 'gut',
    coreMotivation: '正しくありたい、善良でありたい',
    coreFear: '堕落すること、欠陥があること',
  },
  2: {
    name: '助ける人',
    description: '思いやり深く、他者のニーズに敏感な世話好き。愛情深く寛大で、人々を支えることに喜びを感じます。',
    triad: 'heart',
    coreMotivation: '愛されたい、必要とされたい',
    coreFear: '愛されないこと、不要な存在になること',
  },
  3: {
    name: '達成する人',
    description: '目標志向で適応力が高く、成功に向かって効率的に動く実行者。自信に満ち、エネルギッシュに目標を達成します。',
    triad: 'heart',
    coreMotivation: '価値ある存在でありたい、成功したい',
    coreFear: '無価値であること、失敗すること',
  },
  4: {
    name: '個性的な人',
    description: '繊細で創造的、自己表現を大切にする芸術家タイプ。独自の感性で世界を捉え、深い感情体験を追求します。',
    triad: 'heart',
    coreMotivation: '自分らしくありたい、独自の存在でありたい',
    coreFear: '平凡であること、アイデンティティがないこと',
  },
  5: {
    name: '調べる人',
    description: '知識欲が旺盛で洞察力に優れた思考者。独立心が強く、物事の仕組みを深く理解することに情熱を持ちます。',
    triad: 'head',
    coreMotivation: '有能でありたい、理解したい',
    coreFear: '無力であること、無知であること',
  },
  6: {
    name: '忠実な人',
    description: '責任感があり忠誠心の強い慎重派。安全と安定を重視し、信頼できる人や組織に深いコミットメントを示します。',
    triad: 'head',
    coreMotivation: '安全でありたい、支えを持ちたい',
    coreFear: '支えを失うこと、安全が脅かされること',
  },
  7: {
    name: '熱中する人',
    description: '楽観的で多才、新しい体験を求める冒険家。好奇心旺盛で、人生を最大限に楽しもうとするポジティブなエネルギーの持ち主。',
    triad: 'head',
    coreMotivation: '幸せでありたい、満たされたい',
    coreFear: '苦痛に囚われること、制限されること',
  },
  8: {
    name: '挑戦する人',
    description: '力強く決断力があり、自分の道を切り開くチャレンジャー。弱者を守り、正義のために戦う勇気を持ちます。',
    triad: 'gut',
    coreMotivation: '自分を守りたい、コントロールしたい',
    coreFear: '他者に支配されること、傷つけられること',
  },
  9: {
    name: '平和をもたらす人',
    description: '穏やかで受容的、周囲との調和を大切にする平和主義者。安定した環境を好み、人々をつなげる力を持ちます。',
    triad: 'gut',
    coreMotivation: '平和でありたい、調和を保ちたい',
    coreFear: '対立すること、分断されること',
  },
};

// =============================================================================
// 質問データ（9タイプ × 5問 = 45問）
// 各タイプの核心的な動機・行動パターンを問う独自質問
// =============================================================================

export const ENNEAGRAM_QUESTIONS: EnneagramQuestion[] = [
  // --- タイプ1: 改革する人 ---
  { id: 2001, text: "物事が正しい方法で行われていないと気になる", type: 1 },
  { id: 2002, text: "自分の行動が道徳的に正しいか常に考える", type: 1 },
  { id: 2003, text: "ミスや不完全さが目についてしまう", type: 1 },
  { id: 2004, text: "「こうあるべき」という理想が明確にある", type: 1 },
  { id: 2005, text: "自分に対して厳しい基準を設けている", type: 1 },

  // --- タイプ2: 助ける人 ---
  { id: 2011, text: "人の役に立てることが自分の幸せだと感じる", type: 2 },
  { id: 2012, text: "相手が何を必要としているか直感的にわかる", type: 2 },
  { id: 2013, text: "頼まれると断れない性格だ", type: 2 },
  { id: 2014, text: "人に感謝されると大きな満足感を得る", type: 2 },
  { id: 2015, text: "自分のニーズよりも他人のニーズを優先しがちだ", type: 2 },

  // --- タイプ3: 達成する人 ---
  { id: 2021, text: "目標を達成することに強いやりがいを感じる", type: 3 },
  { id: 2022, text: "効率的に物事を進めるのが得意だ", type: 3 },
  { id: 2023, text: "他人からの評価や認められることが大切だ", type: 3 },
  { id: 2024, text: "常に何かに向かって努力している", type: 3 },
  { id: 2025, text: "状況に合わせて自分のイメージを変えることができる", type: 3 },

  // --- タイプ4: 個性的な人 ---
  { id: 2031, text: "自分は他の人とは違う感性を持っていると思う", type: 4 },
  { id: 2032, text: "感情を深く味わうことが大切だ", type: 4 },
  { id: 2033, text: "平凡な日常に物足りなさを感じることがある", type: 4 },
  { id: 2034, text: "芸術や創作で自分を表現したいと思う", type: 4 },
  { id: 2035, text: "メランコリックな気分に浸ることがある", type: 4 },

  // --- タイプ5: 調べる人 ---
  { id: 2041, text: "物事の仕組みを深く理解したいと思う", type: 5 },
  { id: 2042, text: "一人で考える時間がないと消耗してしまう", type: 5 },
  { id: 2043, text: "知識や情報を集めることが好きだ", type: 5 },
  { id: 2044, text: "感情よりも論理で判断する方が安心する", type: 5 },
  { id: 2045, text: "自分のプライバシーと境界線を大切にする", type: 5 },

  // --- タイプ6: 忠実な人 ---
  { id: 2051, text: "最悪の事態を想定して準備しておきたい", type: 6 },
  { id: 2052, text: "信頼できる人や組織に忠誠を尽くす方だ", type: 6 },
  { id: 2053, text: "決断する前にリスクを慎重に検討する", type: 6 },
  { id: 2054, text: "権威に対して疑いを持つことがある", type: 6 },
  { id: 2055, text: "安全や安心を確保することが重要だ", type: 6 },

  // --- タイプ7: 熱中する人 ---
  { id: 2061, text: "新しい体験やワクワクすることを求めている", type: 7 },
  { id: 2062, text: "計画やアイデアが次々と浮かんでくる", type: 7 },
  { id: 2063, text: "辛い状況でもポジティブな面を見つけられる", type: 7 },
  { id: 2064, text: "一つのことに集中するより、いろいろ試したい", type: 7 },
  { id: 2065, text: "制限や束縛を感じるのが苦手だ", type: 7 },

  // --- タイプ8: 挑戦する人 ---
  { id: 2071, text: "弱い立場の人を守りたいという気持ちが強い", type: 8 },
  { id: 2072, text: "不正や嘘を見ると黙っていられない", type: 8 },
  { id: 2073, text: "自分の人生は自分でコントロールしたい", type: 8 },
  { id: 2074, text: "困難な状況でも決断を下すことができる", type: 8 },
  { id: 2075, text: "弱みを見せることに抵抗がある", type: 8 },

  // --- タイプ9: 平和をもたらす人 ---
  { id: 2081, text: "争いや対立を避けたいと思う", type: 9 },
  { id: 2082, text: "人の意見に合わせる方が楽だと感じる", type: 9 },
  { id: 2083, text: "穏やかで安定した日常が好きだ", type: 9 },
  { id: 2084, text: "自分の意見や希望をはっきり言うのが苦手だ", type: 9 },
  { id: 2085, text: "いろいろな人の立場を理解できる", type: 9 },
];

// =============================================================================
// エニアグラム計算
// =============================================================================

export function calculateEnneagram(
  answers: Record<number, number>
): EnneagramResult {
  // 各タイプのスコアを集計
  const typeScores: Record<number, { total: number; count: number }> = {};
  for (let t = 1; t <= 9; t++) {
    typeScores[t] = { total: 0, count: 0 };
  }

  ENNEAGRAM_QUESTIONS.forEach((q) => {
    const answer = answers[q.id] ?? 4; // 未回答は中間値
    typeScores[q.type].total += answer;
    typeScores[q.type].count += 1;
  });

  // パーセンテージに変換
  const scores: Record<number, number> = {};
  for (let t = 1; t <= 9; t++) {
    const { total, count } = typeScores[t];
    const maxScore = count * 7;
    scores[t] = maxScore > 0 ? Math.round((total / maxScore) * 100) : 0;
  }

  // プライマリ・セカンダリ判定
  const sorted = Object.entries(scores)
    .map(([k, v]) => ({ type: parseInt(k), score: v }))
    .sort((a, b) => b.score - a.score);

  const primaryType = sorted[0].type;
  const secondaryType = sorted[1].type;

  // ウィング判定（隣接タイプのうちスコアが高い方）
  const leftWing = primaryType === 1 ? 9 : primaryType - 1;
  const rightWing = primaryType === 9 ? 1 : primaryType + 1;
  const wing = scores[leftWing] >= scores[rightWing]
    ? `${primaryType}w${leftWing}`
    : `${primaryType}w${rightWing}`;

  const typeInfo = ENNEAGRAM_TYPES[primaryType];

  return {
    primaryType,
    secondaryType,
    wing,
    name: typeInfo.name,
    description: typeInfo.description,
    scores,
    triad: typeInfo.triad,
  };
}
