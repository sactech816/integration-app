// =============================================================================
// Big Five 性格診断 — 計算ロジック
// スコア計算 + ファセット分析 + MBTI風16タイプ変換
// =============================================================================

import { Question, BigFiveScores } from './questions';

// =============================================================================
// 型定義
// =============================================================================

export interface FacetScore {
  name: string;
  label: string;
  score: number;
  maxScore: number;
  percentage: number;
}

export interface TraitResult {
  score: number;
  maxScore: number;
  percentage: number;
  level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  facets: FacetScore[];
}

export interface DISCType {
  primary: 'D' | 'I' | 'S' | 'C';
  secondary: 'D' | 'I' | 'S' | 'C';
  name: string;
  description: string;
  scores: {
    D: number; // 主導型 (Dominance)
    I: number; // 感化型 (Influence)
    S: number; // 安定型 (Steadiness)
    C: number; // 慎重型 (Conscientiousness)
  };
}

export interface BigFiveResult {
  traits: {
    openness: TraitResult;
    conscientiousness: TraitResult;
    extraversion: TraitResult;
    agreeableness: TraitResult;
    neuroticism: TraitResult;
  };
  mbtiType: MBTIType;
  discType: DISCType;
  testType: 'simple' | 'full' | 'detailed';
}

export interface MBTIType {
  code: string;         // e.g. "INFP"
  name: string;         // e.g. "仲介者"
  description: string;
  dimensions: {
    EI: { label: string; value: 'E' | 'I'; score: number };
    SN: { label: string; value: 'S' | 'N'; score: number };
    TF: { label: string; value: 'T' | 'F'; score: number };
    JP: { label: string; value: 'J' | 'P'; score: number };
  };
}

// =============================================================================
// ファセット定義（日本語ラベル）
// =============================================================================

export const FACET_LABELS: Record<string, Record<string, string>> = {
  openness: {
    imagination: '想像力',
    artistic: '芸術的興味',
    emotionality: '情動性',
    adventurousness: '冒険心',
    intellect: '知的好奇心',
    liberalism: '進歩性',
  },
  conscientiousness: {
    self_efficacy: '自己効力感',
    orderliness: '秩序性',
    dutifulness: '誠実さ',
    achievement_striving: '達成努力',
    self_discipline: '自己統制',
    cautiousness: '慎重さ',
  },
  extraversion: {
    friendliness: '親しみやすさ',
    gregariousness: '社交性',
    assertiveness: '自己主張',
    activity_level: '活動性',
    excitement_seeking: '刺激希求',
    cheerfulness: '陽気さ',
  },
  agreeableness: {
    trust: '信頼性',
    morality: '道徳性',
    altruism: '利他性',
    cooperation: '協調性',
    modesty: '謙虚さ',
    sympathy: '共感性',
  },
  neuroticism: {
    anxiety: '不安',
    anger: '怒り',
    depression: '抑うつ',
    self_consciousness: '自意識',
    immoderation: '衝動性',
    vulnerability: '傷つきやすさ',
  },
};

// =============================================================================
// MBTI 16タイプ定義
// =============================================================================

const MBTI_TYPES: Record<string, { name: string; description: string }> = {
  INTJ: { name: '建築家', description: '戦略的で独立心が強く、長期的なビジョンを持って計画を立てる合理的な思考者。知識への探究心が深く、複雑な問題を解決することに喜びを感じます。' },
  INTP: { name: '論理学者', description: '知的好奇心が旺盛で、論理的な分析と独創的なアイデアを追求する思考者。既存の概念に疑問を投げかけ、新しい理論を構築することを楽しみます。' },
  ENTJ: { name: '指揮官', description: '決断力があり、効率的にチームを率いるカリスマ的なリーダー。目標達成に向けて戦略を立て、周囲を鼓舞しながら組織を動かします。' },
  ENTP: { name: '討論者', description: '機知に富み、知的な議論を楽しむ革新者。常識に挑戦し、新しい可能性を探求することに情熱を持ちます。' },
  INFJ: { name: '提唱者', description: '深い洞察力と強い理想を持つ静かな影響者。他者の成長を支援し、より良い世界の実現に向けて献身的に取り組みます。' },
  INFP: { name: '仲介者', description: '豊かな内面世界を持ち、理想と価値観に忠実な夢想家。創造性と共感力を活かして、人々の間に調和をもたらします。' },
  ENFJ: { name: '主人公', description: 'カリスマ性があり、他者を導くことに喜びを感じる情熱的なリーダー。人々の可能性を引き出し、共通の目標に向かって団結させます。' },
  ENFP: { name: '広報運動家', description: '熱意にあふれ、創造的で社交的な自由人。新しい可能性を見出し、周囲の人々にインスピレーションを与えます。' },
  ISTJ: { name: '管理者', description: '責任感が強く、実直で信頼できる実務家。規則と伝統を重んじ、着実に義務を果たすことに誇りを持ちます。' },
  ISFJ: { name: '擁護者', description: '献身的で温かく、他者を守ることに使命感を持つ保護者。控えめながらも、人々の幸福のために静かに尽力します。' },
  ESTJ: { name: '幹部', description: '組織力に優れ、秩序と効率を重視する実行力のあるリーダー。明確なルールに基づいて物事を管理し、チームをまとめます。' },
  ESFJ: { name: '領事官', description: '思いやりがあり、社交的で、他者の世話をすることに喜びを感じる人。調和を大切にし、コミュニティの絆を強めます。' },
  ISTP: { name: '巨匠', description: '冷静で観察力が鋭く、実践的な問題解決を得意とする職人気質の人。好奇心旺盛で、仕組みを理解することに情熱を持ちます。' },
  ISFP: { name: '冒険家', description: '感受性が豊かで、自由を愛する芸術家気質の人。自分の価値観に忠実に生き、美しいものに囲まれることを好みます。' },
  ESTP: { name: '起業家', description: 'エネルギッシュで行動力があり、リスクを恐れないチャレンジャー。現実的な判断力と社交性を活かして、ビジネスチャンスを掴みます。' },
  ESFP: { name: 'エンターテイナー', description: '明るく社交的で、人生を楽しむことに長けた楽天家。周囲を楽しませ、場の雰囲気を盛り上げる天性のエンターテイナーです。' },
};

// =============================================================================
// メイン計算関数
// =============================================================================

export function calculateBigFive(
  answers: Record<number, number>,
  questions: Question[],
  testType: 'simple' | 'full' | 'detailed'
): BigFiveResult {
  // --- 特性別スコア計算 ---
  const traitScores: BigFiveScores = {
    openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0,
  };
  const traitCounts: BigFiveScores = {
    openness: 0, conscientiousness: 0, extraversion: 0, agreeableness: 0, neuroticism: 0,
  };

  // --- ファセット別スコア計算 ---
  const facetScores: Record<string, Record<string, { total: number; count: number }>> = {};
  for (const trait of Object.keys(FACET_LABELS)) {
    facetScores[trait] = {};
    for (const facet of Object.keys(FACET_LABELS[trait])) {
      facetScores[trait][facet] = { total: 0, count: 0 };
    }
  }

  // --- 各質問を処理 ---
  questions.forEach((q) => {
    let point = answers[q.id] ?? 4; // 未回答は中間値
    if (q.isReverse) {
      point = 8 - point; // 1-7スケールの逆転
    }

    // 特性スコア加算
    traitScores[q.trait] += point;
    traitCounts[q.trait] += 1;

    // ファセットスコア加算
    if (facetScores[q.trait]?.[q.facet]) {
      facetScores[q.trait][q.facet].total += point;
      facetScores[q.trait][q.facet].count += 1;
    }
  });

  // --- TraitResult 構築 ---
  const traits = {} as BigFiveResult['traits'];
  for (const trait of Object.keys(traitScores) as (keyof BigFiveScores)[]) {
    const score = traitScores[trait];
    const maxScore = traitCounts[trait] * 7;
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

    // ファセット結果
    const facets: FacetScore[] = Object.keys(FACET_LABELS[trait]).map((facetKey) => {
      const f = facetScores[trait][facetKey];
      const fMax = f.count * 7;
      return {
        name: facetKey,
        label: FACET_LABELS[trait][facetKey],
        score: f.total,
        maxScore: fMax,
        percentage: fMax > 0 ? Math.round((f.total / fMax) * 100) : 0,
      };
    });

    traits[trait] = {
      score,
      maxScore,
      percentage,
      level: getLevel(percentage),
      facets,
    };
  }

  // --- MBTI変換 ---
  const mbtiType = convertToMBTI(traits);

  // --- DISC変換 ---
  const discType = convertToDISC(traits);

  return { traits, mbtiType, discType, testType };
}

// =============================================================================
// レベル判定（5段階）
// =============================================================================

function getLevel(percentage: number): TraitResult['level'] {
  if (percentage <= 20) return 'very_low';
  if (percentage <= 40) return 'low';
  if (percentage <= 60) return 'medium';
  if (percentage <= 80) return 'high';
  return 'very_high';
}

// =============================================================================
// Big Five → MBTI風16タイプ変換
//
// 学術的根拠:
// - E/I ← 外向性 (Extraversion)
// - S/N ← 開放性 (Openness)  ※高い=N(直観), 低い=S(感覚)
// - T/F ← 協調性 (Agreeableness) ※高い=F(感情), 低い=T(思考)
// - J/P ← 誠実性 (Conscientiousness) ※高い=J(判断), 低い=P(知覚)
//
// 参考: McCrae & Costa (1989), Furnham (1996)
// =============================================================================

// =============================================================================
// Big Five → DISC行動スタイル変換
//
// 学術的根拠:
// - D (主導型): 高外向性 + 低協調性（自己主張が強く、結果志向）
// - I (感化型): 高外向性 + 高協調性（社交的で、人を巻き込む）
// - S (安定型): 低外向性 + 高協調性（穏やかで、安定志向）
// - C (慎重型): 低外向性 + 低協調性 + 高誠実性（分析的で、正確さ重視）
//
// DISC理論はウィリアム・マーストン (1928) に基づく。概念はパブリックドメイン。
// =============================================================================

const DISC_TYPES: Record<string, { name: string; description: string }> = {
  D: { name: '主導型（D）', description: '目標達成への強い意志を持ち、決断力と行動力で周囲を引っ張るリーダータイプ。チャレンジを楽しみ、効率的に結果を出すことを重視します。' },
  I: { name: '感化型（I）', description: '明るく社交的で、人々を巻き込み鼓舞する力に優れたコミュニケーター。アイデアと熱意で周囲にポジティブな影響を与えます。' },
  S: { name: '安定型（S）', description: '穏やかで忍耐強く、チームの調和を大切にするサポーター。安定した環境の中で着実に力を発揮し、信頼される存在です。' },
  C: { name: '慎重型（C）', description: '分析力と正確さに優れ、論理的に物事を進めるアナリスト。品質とデータを重視し、細部にまで目を配る慎重な姿勢を持ちます。' },
};

function convertToDISC(traits: BigFiveResult['traits']): DISCType {
  const e = traits.extraversion.percentage;
  const a = traits.agreeableness.percentage;
  const c = traits.conscientiousness.percentage;
  const n = traits.neuroticism.percentage;

  // DISC各スタイルへのスコア算出（0-100に正規化）
  // D: 高外向性 + 低協調性 + 低神経症（自信があり、対立を恐れない）
  const dScore = Math.round((e * 0.4 + (100 - a) * 0.35 + (100 - n) * 0.25));
  // I: 高外向性 + 高協調性 + 高開放性（社交的で楽観的）
  const iScore = Math.round((e * 0.4 + a * 0.3 + traits.openness.percentage * 0.3));
  // S: 低外向性 + 高協調性 + 低開放性（安定志向で忠実）
  const sScore = Math.round(((100 - e) * 0.35 + a * 0.35 + (100 - traits.openness.percentage) * 0.3));
  // C: 低外向性 + 高誠実性 + 低協調性（分析的で独立的）
  const cScore = Math.round(((100 - e) * 0.3 + c * 0.4 + (100 - a) * 0.3));

  const scores = { D: dScore, I: iScore, S: sScore, C: cScore };

  // プライマリ・セカンダリ判定
  const sorted = (Object.entries(scores) as [DISCType['primary'], number][])
    .sort((x, y) => y[1] - x[1]);

  const primary = sorted[0][0];
  const secondary = sorted[1][0];

  const typeInfo = DISC_TYPES[primary];

  return {
    primary,
    secondary,
    name: typeInfo.name,
    description: typeInfo.description,
    scores,
  };
}

function convertToMBTI(traits: BigFiveResult['traits']): MBTIType {
  const e = traits.extraversion.percentage;
  const o = traits.openness.percentage;
  const a = traits.agreeableness.percentage;
  const c = traits.conscientiousness.percentage;

  // 各次元のスコアを-100〜+100に正規化（50%を基準に）
  const eiScore = (e - 50) * 2;  // +: E, -: I
  const snScore = (o - 50) * 2;  // +: N, -: S
  const tfScore = (a - 50) * 2;  // +: F, -: T
  const jpScore = (c - 50) * 2;  // +: J, -: P

  const EI = eiScore >= 0 ? 'E' : 'I';
  const SN = snScore >= 0 ? 'N' : 'S';
  const TF = tfScore >= 0 ? 'F' : 'T';
  const JP = jpScore >= 0 ? 'J' : 'P';

  const code = `${EI}${SN}${TF}${JP}`;
  const typeInfo = MBTI_TYPES[code] || { name: '未分類', description: '' };

  return {
    code,
    name: typeInfo.name,
    description: typeInfo.description,
    dimensions: {
      EI: {
        label: EI === 'E' ? '外向型 (E)' : '内向型 (I)',
        value: EI,
        score: Math.round(Math.abs(eiScore)),
      },
      SN: {
        label: SN === 'N' ? '直観型 (N)' : '感覚型 (S)',
        value: SN,
        score: Math.round(Math.abs(snScore)),
      },
      TF: {
        label: TF === 'F' ? '感情型 (F)' : '思考型 (T)',
        value: TF,
        score: Math.round(Math.abs(tfScore)),
      },
      JP: {
        label: JP === 'J' ? '判断型 (J)' : '知覚型 (P)',
        value: JP,
        score: Math.round(Math.abs(jpScore)),
      },
    },
  };
}
