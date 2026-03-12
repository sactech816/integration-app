// =============================================================================
// Big Five 性格診断 — 質問データ
// TIPI-J（簡易10問）+ IPIP-50（本格50問）+ IPIP-100拡張（追加50問）
// + ファセットマッピング
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

// =============================================================================
// 【詳細版】追加50問（IPIP-100拡張）
// 既存50問のファセットカバレッジを補強し、各ファセット最低3問を確保
// IPIP (International Personality Item Pool) はパブリックドメイン
// =============================================================================
export const QUESTIONS_EXTENDED: Question[] = [
  // --- 外向性 (Extraversion) 追加10問 ---
  { id: 601, text: "初対面の人ともすぐに打ち解けられる", trait: "extraversion", facet: "friendliness", isReverse: false },
  { id: 602, text: "一人で過ごす時間の方が落ち着く", trait: "extraversion", facet: "gregariousness", isReverse: true },
  { id: 603, text: "グループの中で自然とリーダー役を引き受ける", trait: "extraversion", facet: "assertiveness", isReverse: false },
  { id: 604, text: "スリルや冒険的な体験にわくわくする", trait: "extraversion", facet: "excitement_seeking", isReverse: false },
  { id: 605, text: "いつも何かしら体を動かしていたい", trait: "extraversion", facet: "activity_level", isReverse: false },
  { id: 606, text: "楽しい気分でいることが多い", trait: "extraversion", facet: "cheerfulness", isReverse: false },
  { id: 607, text: "大人数の場所に行くと疲れてしまう", trait: "extraversion", facet: "gregariousness", isReverse: true },
  { id: 608, text: "自分の意見をはっきり伝えることができる", trait: "extraversion", facet: "assertiveness", isReverse: false },
  { id: 609, text: "変化のない生活は退屈に感じる", trait: "extraversion", facet: "excitement_seeking", isReverse: false },
  { id: 610, text: "よく笑い、周りの人を明るくする方だ", trait: "extraversion", facet: "cheerfulness", isReverse: false },

  // --- 協調性 (Agreeableness) 追加10問 ---
  { id: 701, text: "大抵の人は善意を持っていると思う", trait: "agreeableness", facet: "trust", isReverse: false },
  { id: 702, text: "約束は必ず守るようにしている", trait: "agreeableness", facet: "morality", isReverse: false },
  { id: 703, text: "ボランティア活動に関心がある", trait: "agreeableness", facet: "altruism", isReverse: false },
  { id: 704, text: "争いごとはできるだけ避けたい", trait: "agreeableness", facet: "cooperation", isReverse: false },
  { id: 705, text: "自分の能力を過大評価しないようにしている", trait: "agreeableness", facet: "modesty", isReverse: false },
  { id: 706, text: "映画や小説で泣くことがある", trait: "agreeableness", facet: "sympathy", isReverse: false },
  { id: 707, text: "人の話を途中でさえぎってしまうことがある", trait: "agreeableness", facet: "cooperation", isReverse: true },
  { id: 708, text: "ルールや規範をごまかすことがある", trait: "agreeableness", facet: "morality", isReverse: true },
  { id: 709, text: "自慢話をすることがある", trait: "agreeableness", facet: "modesty", isReverse: true },
  { id: 710, text: "他人の苦しみを見て見ぬふりはできない", trait: "agreeableness", facet: "sympathy", isReverse: false },

  // --- 誠実性 (Conscientiousness) 追加10問 ---
  { id: 801, text: "自分で決めた目標は最後までやり遂げる", trait: "conscientiousness", facet: "achievement_striving", isReverse: false },
  { id: 802, text: "誘惑に負けてしまうことがある", trait: "conscientiousness", facet: "self_discipline", isReverse: true },
  { id: 803, text: "物事を始める前にリスクをよく考える", trait: "conscientiousness", facet: "cautiousness", isReverse: false },
  { id: 804, text: "義務や責任を果たすことに誇りを持っている", trait: "conscientiousness", facet: "dutifulness", isReverse: false },
  { id: 805, text: "自分の能力で大抵のことは解決できると思う", trait: "conscientiousness", facet: "self_efficacy", isReverse: false },
  { id: 806, text: "持ち物はいつも整理整頓している", trait: "conscientiousness", facet: "orderliness", isReverse: false },
  { id: 807, text: "面倒な仕事でも手を抜かずにやる", trait: "conscientiousness", facet: "dutifulness", isReverse: false },
  { id: 808, text: "衝動的に買い物をしてしまうことがある", trait: "conscientiousness", facet: "self_discipline", isReverse: true },
  { id: 809, text: "目標を達成するために計画的に行動する", trait: "conscientiousness", facet: "achievement_striving", isReverse: false },
  { id: 810, text: "難しい問題に直面しても自分で解決策を見つけられる", trait: "conscientiousness", facet: "self_efficacy", isReverse: false },

  // --- 神経症的傾向 (Neuroticism) 追加10問 ---
  { id: 901, text: "些細な批判でも深く傷つくことがある", trait: "neuroticism", facet: "vulnerability", isReverse: false },
  { id: 902, text: "人前で恥ずかしい思いをするのが怖い", trait: "neuroticism", facet: "self_consciousness", isReverse: false },
  { id: 903, text: "怒りを爆発させてしまうことがある", trait: "neuroticism", facet: "anger", isReverse: false },
  { id: 904, text: "食べすぎや飲みすぎを止められないことがある", trait: "neuroticism", facet: "immoderation", isReverse: false },
  { id: 905, text: "気持ちが沈んで何もやる気が起きない日がある", trait: "neuroticism", facet: "depression", isReverse: false },
  { id: 906, text: "不安な気持ちに振り回されやすい", trait: "neuroticism", facet: "anxiety", isReverse: false },
  { id: 907, text: "ちょっとしたことですぐに腹が立つ", trait: "neuroticism", facet: "anger", isReverse: false },
  { id: 908, text: "困難な状況でも冷静に判断できる", trait: "neuroticism", facet: "vulnerability", isReverse: true },
  { id: 909, text: "欲しいものがあると我慢できない方だ", trait: "neuroticism", facet: "immoderation", isReverse: false },
  { id: 910, text: "自分が他人にどう見られているか気になる", trait: "neuroticism", facet: "self_consciousness", isReverse: false },

  // --- 開放性 (Openness) 追加10問 ---
  { id: 1001, text: "空想にふけることが好きだ", trait: "openness", facet: "imagination", isReverse: false },
  { id: 1002, text: "音楽や映画に深く心を動かされることがある", trait: "openness", facet: "emotionality", isReverse: false },
  { id: 1003, text: "伝統よりも新しい考え方を好む", trait: "openness", facet: "liberalism", isReverse: false },
  { id: 1004, text: "行ったことのない場所を訪れるのが好きだ", trait: "openness", facet: "adventurousness", isReverse: false },
  { id: 1005, text: "科学や技術の最新動向に興味がある", trait: "openness", facet: "intellect", isReverse: false },
  { id: 1006, text: "美しいデザインや芸術作品に惹かれる", trait: "openness", facet: "artistic", isReverse: false },
  { id: 1007, text: "感情の機微を繊細に感じ取る方だ", trait: "openness", facet: "emotionality", isReverse: false },
  { id: 1008, text: "慣れたやり方を変えるのには抵抗がある", trait: "openness", facet: "liberalism", isReverse: true },
  { id: 1009, text: "複雑なパズルや問題を解くのが楽しい", trait: "openness", facet: "intellect", isReverse: false },
  { id: 1010, text: "白昼夢を見ることが多い", trait: "openness", facet: "imagination", isReverse: false },
];

// IPIP-100: 50問 + 追加50問 = 100問を結合
export const QUESTIONS_DETAILED: Question[] = [...QUESTIONS_FULL, ...QUESTIONS_EXTENDED];
