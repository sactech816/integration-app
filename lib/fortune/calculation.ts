/**
 * 生年月日占い - メイン計算ロジック
 * 3つの占い体系を統合:
 *   1. 九星気学（本命星・月命星・同会・傾斜・最大吉方）
 *   2. 数秘術（ライフパスナンバー）
 *   3. 四柱推命（日干支）
 */

// ============================================================
// 型定義
// ============================================================

export interface FortuneResult {
  targetDate: string;
  nineStar: {
    year: string;   // 本命星キー (例: "7_red")
    month: string;  // 月命星キー (例: "2_earth")
    doukai?: string;        // 同会星キー
    keisha?: string;        // 傾斜星キー
    luckyDirections?: string[]; // 最大吉方
  };
  numerology: {
    lifePath: string; // 誕生数キー (例: "lp_5")
  };
  fourPillars: {
    sexagenaryCycle: number; // 0-59 (日干支番号)
    heavenlyStem: string;    // 日干キー (例: "stem_1")
  };
}

// ============================================================
// 定数
// ============================================================

const NINE_STARS = [
  "1_water", "2_earth", "3_wood", "4_wood", "5_earth",
  "6_metal", "7_red", "8_earth", "9_fire",
];

const HEAVENLY_STEMS = [
  "stem_1", "stem_2", "stem_3", "stem_4", "stem_5",
  "stem_6", "stem_7", "stem_8", "stem_9", "stem_10",
];

/** 節入り日（各月の開始日）の目安 */
const SETSU_IRI_DAYS = [6, 4, 6, 5, 6, 6, 7, 8, 8, 9, 8, 7];

/** 定位盤（固定の九星配置） */
const TEII_BAN = [
  [4, 9, 2],  // 南東、南、南西
  [3, 5, 7],  // 東、中央、西
  [8, 1, 6],  // 北東、北、北西
];

// ============================================================
// 九星盤ユーティリティ
// ============================================================

/** 九星盤を作成する（中宮の星を指定） */
function createKyuseiPan(centerStar: number): number[][] {
  const pan: number[][] = [];
  for (let row = 0; row < 3; row++) {
    pan[row] = [];
    for (let col = 0; col < 3; col++) {
      if (row === 1 && col === 1) {
        pan[row][col] = centerStar;
      } else {
        const offset = TEII_BAN[row][col] - 5;
        let star = centerStar + offset;
        while (star <= 0) star += 9;
        while (star > 9) star -= 9;
        pan[row][col] = star;
      }
    }
  }
  return pan;
}

/** 九星盤から指定した星の位置を探す */
function findStarPosition(pan: number[][], star: number): { row: number; col: number } {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (pan[row][col] === star) return { row, col };
    }
  }
  return { row: -1, col: -1 };
}

// ============================================================
// 九星気学 高度計算
// ============================================================

/**
 * 同会を求める
 * 月盤（月命星を中宮）において本命星が入っている位置の定位盤の星
 */
function calculateDoukai(yearStar: number, monthStar: number): number {
  const getsumeBan = createKyuseiPan(monthStar);
  const yearPos = findStarPosition(getsumeBan, yearStar);
  if (yearPos.row === -1) return 5; // 中宮の場合
  return TEII_BAN[yearPos.row][yearPos.col];
}

/**
 * 傾斜を求める
 * 本命盤（本命星を中宮）において月命星が入っている位置の定位盤の星
 */
function calculateKeisha(yearStar: number, monthStar: number): number {
  const honmeiBan = createKyuseiPan(yearStar);
  const monthPos = findStarPosition(honmeiBan, monthStar);
  if (monthPos.row === -1) return 5; // 中宮の場合
  return TEII_BAN[monthPos.row][monthPos.col];
}

/**
 * 最大吉方を求める（五行相生ベース）
 * 本命星と月命星の両方と相性の良い星を探す
 */
function calculateLuckyDirections(yearStar: number, monthStar: number): number[] {
  const elements: Record<number, string> = {
    1: 'water', 2: 'earth', 3: 'wood', 4: 'wood', 5: 'earth',
    6: 'metal', 7: 'metal', 8: 'earth', 9: 'fire',
  };

  const compatibility: Record<string, string[]> = {
    wood: ['water', 'fire', 'wood'],
    fire: ['wood', 'earth', 'fire'],
    earth: ['fire', 'metal', 'earth'],
    metal: ['earth', 'water', 'metal'],
    water: ['metal', 'wood', 'water'],
  };

  const yearElement = elements[yearStar];
  const monthElement = elements[monthStar];
  const goodForYear = compatibility[yearElement];
  const goodForMonth = compatibility[monthElement];
  const luckyStars: number[] = [];

  for (let star = 1; star <= 9; star++) {
    if (star === 5 || star === yearStar || star === monthStar) continue;
    const starElement = elements[star];
    if (goodForYear.includes(starElement) && goodForMonth.includes(starElement)) {
      luckyStars.push(star);
    }
  }

  return luckyStars.sort((a, b) => a - b);
}

// ============================================================
// 気学年月補正
// ============================================================

function adjustKigakuDate(year: number, month: number, day: number): { kYear: number; kMonth: number } {
  let kYear = year;
  let kMonth = month;

  // 節入り前なら前月扱い
  if (day < SETSU_IRI_DAYS[month - 1]) {
    if (month === 1) {
      kMonth = 12;
      kYear = year - 1;
    } else {
      kMonth = month - 1;
    }
  }

  // 立春前（1月、または2月で節入り前）は前年扱い
  if (month === 1 || (month === 2 && day < SETSU_IRI_DAYS[1])) {
    if (kYear === year) kYear = year - 1;
  }

  return { kYear, kMonth };
}

// ============================================================
// メイン計算関数
// ============================================================

export function calculateFortune(year: number, month: number, day: number): FortuneResult {
  const { kYear, kMonth } = adjustKigakuDate(year, month, day);

  // --- 1. 九星気学 ---

  // 本命星: (11 - 西暦各桁和の1桁化)
  let remainder = Array.from(String(kYear), Number).reduce((a, b) => a + b, 0);
  while (remainder > 9) {
    remainder = Array.from(String(remainder), Number).reduce((a, b) => a + b, 0);
  }
  let yearStarNum = 11 - remainder;
  if (yearStarNum > 9) yearStarNum -= 9;
  if (yearStarNum === 0) yearStarNum = 9;
  const yearStarKey = NINE_STARS[yearStarNum - 1];

  // 月命星（村山幸徳式・早見表）
  let group = 0;
  if ([1, 4, 7].includes(yearStarNum)) group = 1;
  else if ([2, 5, 8].includes(yearStarNum)) group = 2;
  else group = 3;

  const monthStarTable: Record<number, number[]> = {
    1: [6, 8, 7, 6, 5, 4, 3, 2, 1, 9, 8, 7],
    2: [9, 5, 4, 3, 2, 1, 9, 8, 7, 6, 5, 4],
    3: [3, 5, 4, 3, 2, 1, 9, 8, 7, 6, 5, 4],
  };

  const monthStarNum = monthStarTable[group][kMonth - 1];
  const monthStarKey = NINE_STARS[monthStarNum - 1];

  // 同会・傾斜・最大吉方
  const doukaiStar = calculateDoukai(yearStarNum, monthStarNum);
  const keishaStar = calculateKeisha(yearStarNum, monthStarNum);
  const luckyDirectionStars = calculateLuckyDirections(yearStarNum, monthStarNum);

  const doukaiKey = doukaiStar > 0 ? NINE_STARS[doukaiStar - 1] : undefined;
  const keishaKey = keishaStar > 0 ? NINE_STARS[keishaStar - 1] : undefined;
  const luckyDirectionKeys = luckyDirectionStars.map(s => NINE_STARS[s - 1]);

  // --- 2. 数秘術 ---

  const dateStr = `${year}${month}${day}`;
  let sum = 0;
  for (const char of dateStr) sum += Number(char);
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    const sumStr = String(sum);
    sum = 0;
    for (const char of sumStr) sum += Number(char);
  }
  const lpKey = `lp_${sum}`;

  // --- 3. 四柱推命 ---

  const baseDate = new Date(Date.UTC(1900, 0, 1));
  const target = new Date(Date.UTC(year, month - 1, day));
  const diffDays = Math.floor((target.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const sexagenaryIndex = (diffDays + 10) % 60;
  const stemIndex = sexagenaryIndex % 10;
  const stemKey = HEAVENLY_STEMS[stemIndex];

  return {
    targetDate: `${year}-${month}-${day}`,
    nineStar: {
      year: yearStarKey,
      month: monthStarKey,
      doukai: doukaiKey,
      keisha: keishaKey,
      luckyDirections: luckyDirectionKeys,
    },
    numerology: { lifePath: lpKey },
    fourPillars: {
      sexagenaryCycle: sexagenaryIndex,
      heavenlyStem: stemKey,
    },
  };
}
