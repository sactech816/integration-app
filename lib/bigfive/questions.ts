// =============================================================================
// Big Five 性格診断 — 質問データ
// TIPI-J（簡易10問）+ IPIP-50（本格50問）+ ファセットマッピング
// =============================================================================

export interface Question {
  id: number;
  text: string;
  trait: keyof BigFiveScores;
  facet: string;
  isReverse: boolean;
}

export interface BigFiveScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

// =============================================================================
// 【無料版】簡易診断（10問 — TIPI-Jベース）
// =============================================================================
export const QUESTIONS_SIMPLE: Question[] = [
  { id: 1, text: "活発で、外向的だと思う", trait: "extraversion", facet: "gregariousness", isReverse: false },
  { id: 2, text: "他人に不満を持ち、もめごとを起こしやすい", trait: "agreeableness", facet: "cooperation", isReverse: true },
  { id: 3, text: "しっかりしていて、自分を律することができる", trait: "conscientiousness", facet: "self_discipline", isReverse: false },
  { id: 4, text: "心配性で、うろたえやすい", trait: "neuroticism", facet: "anxiety", isReverse: false },
  { id: 5, text: "新しい体験や、複雑な物事に興味がある", trait: "openness", facet: "adventurousness", isReverse: false },
  { id: 6, text: "無口で、静かだと思う", trait: "extraversion", facet: "assertiveness", isReverse: true },
  { id: 7, text: "思いやりがあり、親切だと思う", trait: "agreeableness", facet: "altruism", isReverse: false },
  { id: 8, text: "だらしなく、うっかりしている", trait: "conscientiousness", facet: "orderliness", isReverse: true },
  { id: 9, text: "冷静で、気分が安定している", trait: "neuroticism", facet: "vulnerability", isReverse: true },
  { id: 10, text: "独創的で、発想力がある", trait: "openness", facet: "imagination", isReverse: false },
];

// =============================================================================
// 【本格版】50問診断（IPIP-50尺度準拠 + ファセットマッピング）
// 各特性10問 × 5特性 = 50問
// 各特性内で6ファセットに割り振り（一部ファセットは2問）
// =============================================================================
export const QUESTIONS_FULL: Question[] = [
  // --- 外向性 (Extraversion) 10問 ---
  { id: 101, text: "パーティーや社交的な集まりが好きだ", trait: "extraversion", facet: "gregariousness", isReverse: false },
  { id: 102, text: "あまり口数が多い方ではない", trait: "extraversion", facet: "assertiveness", isReverse: true },
  { id: 103, text: "人との会話をすぐに始めることができる", trait: "extraversion", facet: "friendliness", isReverse: false },
  { id: 104, text: "背景や裏方に回るのが好きだ", trait: "extraversion", facet: "assertiveness", isReverse: true },
  { id: 105, text: "注目の的になるのが好きだ", trait: "extraversion", facet: "excitement_seeking", isReverse: false },
  { id: 106, text: "あまり自己主張しない方だ", trait: "extraversion", facet: "assertiveness", isReverse: true },
  { id: 107, text: "様々な種類の人と話すのが好きだ", trait: "extraversion", facet: "friendliness", isReverse: false },
  { id: 108, text: "パーティーでは人混みを避ける方だ", trait: "extraversion", facet: "gregariousness", isReverse: true },
  { id: 109, text: "活発で、エネルギーに満ちている", trait: "extraversion", facet: "activity_level", isReverse: false },
  { id: 110, text: "見知らぬ人の周りでは静かになる", trait: "extraversion", facet: "cheerfulness", isReverse: true },

  // --- 協調性 (Agreeableness) 10問 ---
  { id: 201, text: "他人の感情に共感しやすい", trait: "agreeableness", facet: "sympathy", isReverse: false },
  { id: 202, text: "他人の問題には興味がない", trait: "agreeableness", facet: "altruism", isReverse: true },
  { id: 203, text: "人の悩みを聞いてあげることが多い", trait: "agreeableness", facet: "altruism", isReverse: false },
  { id: 204, text: "他人に対して批判的な方だ", trait: "agreeableness", facet: "trust", isReverse: true },
  { id: 205, text: "他人の良いところを見つけるのが得意だ", trait: "agreeableness", facet: "trust", isReverse: false },
  { id: 206, text: "人を侮辱してしまうことがある", trait: "agreeableness", facet: "morality", isReverse: true },
  { id: 207, text: "困っている人がいれば、進んで手助けする", trait: "agreeableness", facet: "cooperation", isReverse: false },
  { id: 208, text: "子供や弱い立場の人の相手をするのは苦手だ", trait: "agreeableness", facet: "sympathy", isReverse: true },
  { id: 209, text: "人とは円満な関係でいたいと思う", trait: "agreeableness", facet: "cooperation", isReverse: false },
  { id: 210, text: "自分とは違う意見の人には冷たく接してしまう", trait: "agreeableness", facet: "modesty", isReverse: true },

  // --- 誠実性 (Conscientiousness) 10問 ---
  { id: 301, text: "いつも準備を整えている", trait: "conscientiousness", facet: "orderliness", isReverse: false },
  { id: 302, text: "部屋や机が散らかっていることが多い", trait: "conscientiousness", facet: "orderliness", isReverse: true },
  { id: 303, text: "細かいことにもよく気がつく", trait: "conscientiousness", facet: "cautiousness", isReverse: false },
  { id: 304, text: "大事なものを置き忘れることがある", trait: "conscientiousness", facet: "self_discipline", isReverse: true },
  { id: 305, text: "スケジュール通りに物事を進めるのが好きだ", trait: "conscientiousness", facet: "achievement_striving", isReverse: false },
  { id: 306, text: "約束や期限を破ってしまうことがある", trait: "conscientiousness", facet: "dutifulness", isReverse: true },
  { id: 307, text: "家事や雑務はすぐに片付ける方だ", trait: "conscientiousness", facet: "self_efficacy", isReverse: false },
  { id: 308, text: "やるべきことを先延ばしにする癖がある", trait: "conscientiousness", facet: "self_discipline", isReverse: true },
  { id: 309, text: "正確さが求められる作業が得意だ", trait: "conscientiousness", facet: "cautiousness", isReverse: false },
  { id: 310, text: "計画を立てずに物事を始めることが多い", trait: "conscientiousness", facet: "achievement_striving", isReverse: true },

  // --- 神経症的傾向 (Neuroticism) 10問 ---
  { id: 401, text: "些細なことでもストレスを感じやすい", trait: "neuroticism", facet: "anxiety", isReverse: false },
  { id: 402, text: "たいていリラックスしている", trait: "neuroticism", facet: "anxiety", isReverse: true },
  { id: 403, text: "気分の浮き沈みが激しい方だ", trait: "neuroticism", facet: "depression", isReverse: false },
  { id: 404, text: "プレッシャーがかかっても落ち着いていられる", trait: "neuroticism", facet: "vulnerability", isReverse: true },
  { id: 405, text: "将来のことが心配で不安になる", trait: "neuroticism", facet: "anxiety", isReverse: false },
  { id: 406, text: "過去の失敗をいつまでも引きずらない", trait: "neuroticism", facet: "depression", isReverse: true },
  { id: 407, text: "イライラして人に当たってしまうことがある", trait: "neuroticism", facet: "anger", isReverse: false },
  { id: 408, text: "感情をコントロールするのは得意だ", trait: "neuroticism", facet: "immoderation", isReverse: true },
  { id: 409, text: "孤独を感じて落ち込むことがある", trait: "neuroticism", facet: "self_consciousness", isReverse: false },
  { id: 410, text: "自分に自信を持っている", trait: "neuroticism", facet: "self_consciousness", isReverse: true },

  // --- 開放性 (Openness) 10問 ---
  { id: 501, text: "言葉の意味や使い回しに興味がある", trait: "openness", facet: "intellect", isReverse: false },
  { id: 502, text: "抽象的なアイデアを理解するのは難しい", trait: "openness", facet: "intellect", isReverse: true },
  { id: 503, text: "芸術や自然の美しさに感動することが多い", trait: "openness", facet: "artistic", isReverse: false },
  { id: 504, text: "空想や夢みたいな話には興味がない", trait: "openness", facet: "imagination", isReverse: true },
  { id: 505, text: "新しいやり方を試すのが好きだ", trait: "openness", facet: "adventurousness", isReverse: false },
  { id: 506, text: "決まったルーチンワークをこなす方が好きだ", trait: "openness", facet: "adventurousness", isReverse: true },
  { id: 507, text: "哲学的な議論をするのが好きだ", trait: "openness", facet: "emotionality", isReverse: false },
  { id: 508, text: "美術館や博物館に行っても退屈する", trait: "openness", facet: "artistic", isReverse: true },
  { id: 509, text: "発想が豊かで、アイデアが次々と浮かぶ", trait: "openness", facet: "imagination", isReverse: false },
  { id: 510, text: "難しい本を読むのは避ける方だ", trait: "openness", facet: "liberalism", isReverse: true },
];
