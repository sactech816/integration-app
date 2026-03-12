/**
 * 九星気学の詳細ロジック（村山幸徳式）
 * 本命星・月命星・同会・傾斜・最大吉方 + 盤データ
 */

// ============================================================
// 型定義
// ============================================================

export type NineStar =
  | "1_water" | "2_earth" | "3_wood"
  | "4_wood" | "5_earth" | "6_metal"
  | "7_metal" | "8_earth" | "9_fire";

export type Palace =
  | "kan"   // 坎宮（北）
  | "kon"   // 坤宮（南西）
  | "shin"  // 震宮（東）
  | "son"   // 巽宮（南東）
  | "chu"   // 中宮（中央）
  | "ken"   // 乾宮（北西）
  | "da"    // 兌宮（西）
  | "gon"   // 艮宮（北東）
  | "ri";   // 離宮（南）

export interface KigakuResult {
  inputDate: { year: number; month: number; day: number };
  kigakuDate: { year: number; month: number };
  honmei: {
    star: NineStar;
    number: number;
    name: string;
    element: string;
    luckyColor: string[];
    luckyNumber: number[];
  };
  getsumei: {
    star: NineStar;
    number: number;
    name: string;
    element: string;
  };
  dokai: {
    palace: Palace;
    palaceName: string;
    star: NineStar;
    starName: string;
  };
  keisha: {
    star: NineStar;
    number: number;
    starName: string;
  };
  saidaiKippo: {
    stars: NineStar[];
    names: string[];
  };
  boards?: {
    year: number[][];
    month: number[][];
  };
}

// ============================================================
// 定数
// ============================================================

export const STAR_INFO: Record<NineStar, {
  name: string;
  element: string;
  defaultPalace: Palace;
  number: number;
  luckyColor: string[];
  luckyNumber: number[];
}> = {
  "1_water": { name: "一白水星", element: "water", defaultPalace: "kan", number: 1, luckyColor: ["白", "黒", "グレー"], luckyNumber: [1, 6] },
  "2_earth": { name: "二黒土星", element: "earth", defaultPalace: "kon", number: 2, luckyColor: ["黄", "茶", "ベージュ"], luckyNumber: [2, 5, 8] },
  "3_wood":  { name: "三碧木星", element: "wood",  defaultPalace: "shin", number: 3, luckyColor: ["青", "緑", "碧"], luckyNumber: [3, 8] },
  "4_wood":  { name: "四緑木星", element: "wood",  defaultPalace: "son", number: 4, luckyColor: ["緑", "青緑", "翡翠色"], luckyNumber: [3, 4, 8] },
  "5_earth": { name: "五黄土星", element: "earth", defaultPalace: "chu", number: 5, luckyColor: ["黄", "金", "黄土色"], luckyNumber: [5, 0] },
  "6_metal": { name: "六白金星", element: "metal", defaultPalace: "ken", number: 6, luckyColor: ["白", "銀", "ゴールド"], luckyNumber: [1, 6, 4, 9] },
  "7_metal": { name: "七赤金星", element: "metal", defaultPalace: "da", number: 7, luckyColor: ["金", "銀", "ピンク", "オレンジ"], luckyNumber: [4, 9] },
  "8_earth": { name: "八白土星", element: "earth", defaultPalace: "gon", number: 8, luckyColor: ["白", "黄", "クリーム色"], luckyNumber: [2, 5, 8] },
  "9_fire":  { name: "九紫火星", element: "fire",  defaultPalace: "ri", number: 9, luckyColor: ["赤", "紫", "オレンジ"], luckyNumber: [2, 7, 9] },
};

export const PALACE_NAMES: Record<Palace, string> = {
  kan: "坎宮（北）",
  kon: "坤宮（南西）",
  shin: "震宮（東）",
  son: "巽宮（南東）",
  chu: "中宮（中央）",
  ken: "乾宮（北西）",
  da: "兌宮（西）",
  gon: "艮宮（北東）",
  ri: "離宮（南）",
};

const SETSU_IRI_DAYS = [6, 4, 6, 5, 6, 6, 7, 8, 8, 9, 8, 7];

const TEII_BAN = [
  [4, 9, 2],
  [3, 5, 7],
  [8, 1, 6],
];

const COMPATIBILITY: Record<string, string[]> = {
  wood: ["water", "fire", "wood"],
  fire: ["wood", "earth", "fire"],
  earth: ["fire", "metal", "earth"],
  metal: ["earth", "water", "metal"],
  water: ["metal", "wood", "water"],
};

// ============================================================
// ヘルパー関数
// ============================================================

function numToStar(n: number): NineStar {
  const stars: NineStar[] = [
    "1_water", "2_earth", "3_wood", "4_wood", "5_earth",
    "6_metal", "7_metal", "8_earth", "9_fire",
  ];
  let idx = (n - 1) % 9;
  if (idx < 0) idx += 9;
  return stars[idx];
}

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

function findStarPosition(pan: number[][], star: number): { row: number; col: number } {
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 3; col++) {
      if (pan[row][col] === star) return { row, col };
    }
  }
  return { row: -1, col: -1 };
}

function positionToPalace(row: number, col: number): Palace {
  const palaceMap: Palace[][] = [
    ["son", "ri", "kon"],
    ["shin", "chu", "da"],
    ["gon", "kan", "ken"],
  ];
  return palaceMap[row][col];
}

function calculateDokai(yearStar: number, monthStar: number): { star: number; palace: Palace } {
  const getsumeBan = createKyuseiPan(monthStar);
  const yearPos = findStarPosition(getsumeBan, yearStar);
  if (yearPos.row === -1) return { star: 5, palace: "chu" };
  return {
    star: TEII_BAN[yearPos.row][yearPos.col],
    palace: positionToPalace(yearPos.row, yearPos.col),
  };
}

function calculateKeisha(yearStar: number, monthStar: number): { star: number; palace: Palace } {
  const honmeiBan = createKyuseiPan(yearStar);
  const monthPos = findStarPosition(honmeiBan, monthStar);
  if (monthPos.row === -1) return { star: 5, palace: "chu" };
  return {
    star: TEII_BAN[monthPos.row][monthPos.col],
    palace: positionToPalace(monthPos.row, monthPos.col),
  };
}

function calculateSaidaiKippo(yearStar: number, monthStar: number): number[] {
  const yearElement = STAR_INFO[numToStar(yearStar)].element;
  const monthElement = STAR_INFO[numToStar(monthStar)].element;
  const goodForYear = COMPATIBILITY[yearElement];
  const goodForMonth = COMPATIBILITY[monthElement];
  const luckyStars: number[] = [];

  for (let star = 1; star <= 9; star++) {
    if (star === 5 || star === yearStar || star === monthStar) continue;
    const starElement = STAR_INFO[numToStar(star)].element;
    if (goodForYear.includes(starElement) && goodForMonth.includes(starElement)) {
      luckyStars.push(star);
    }
  }

  return luckyStars.sort((a, b) => a - b);
}

// ============================================================
// メイン計算関数
// ============================================================

export function calculateKigaku(year: number, month: number, day: number): KigakuResult {
  let kYear = year;
  let kMonth = month;

  if (day < SETSU_IRI_DAYS[month - 1]) {
    if (month === 1) { kMonth = 12; kYear = year - 1; }
    else { kMonth = month - 1; }
  }

  if (month === 1 || (month === 2 && day < SETSU_IRI_DAYS[1])) {
    if (kYear === year) kYear = year - 1;
  }

  // 本命星
  let remainder = Array.from(String(kYear), Number).reduce((a, b) => a + b, 0);
  while (remainder > 9) {
    remainder = Array.from(String(remainder), Number).reduce((a, b) => a + b, 0);
  }
  let yearStarNum = 11 - remainder;
  if (yearStarNum > 9) yearStarNum -= 9;
  if (yearStarNum === 0) yearStarNum = 9;
  const honmeiStar = numToStar(yearStarNum);

  // 月命星
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
  const getsumeiStar = numToStar(monthStarNum);

  const dokaiResult = calculateDokai(yearStarNum, monthStarNum);
  const keishaResult = calculateKeisha(yearStarNum, monthStarNum);
  const saidaiKippoNums = calculateSaidaiKippo(yearStarNum, monthStarNum);

  return {
    inputDate: { year, month, day },
    kigakuDate: { year: kYear, month: kMonth },
    honmei: {
      star: honmeiStar,
      number: yearStarNum,
      name: STAR_INFO[honmeiStar].name,
      element: STAR_INFO[honmeiStar].element,
      luckyColor: STAR_INFO[honmeiStar].luckyColor,
      luckyNumber: STAR_INFO[honmeiStar].luckyNumber,
    },
    getsumei: {
      star: getsumeiStar,
      number: monthStarNum,
      name: STAR_INFO[getsumeiStar].name,
      element: STAR_INFO[getsumeiStar].element,
    },
    dokai: {
      palace: dokaiResult.palace,
      palaceName: PALACE_NAMES[dokaiResult.palace],
      star: numToStar(dokaiResult.star),
      starName: STAR_INFO[numToStar(dokaiResult.star)].name,
    },
    keisha: {
      star: numToStar(keishaResult.star),
      number: keishaResult.star,
      starName: STAR_INFO[numToStar(keishaResult.star)].name,
    },
    saidaiKippo: {
      stars: saidaiKippoNums.map(numToStar),
      names: saidaiKippoNums.map(n => STAR_INFO[numToStar(n)].name),
    },
    boards: {
      year: createKyuseiPan(yearStarNum),
      month: createKyuseiPan(monthStarNum),
    },
  };
}

/** calculateKigaku の結果を FortuneResult.nineStar 形式に変換 */
export function toFortuneNineStarFormat(result: KigakuResult) {
  return {
    year: result.honmei.star,
    month: result.getsumei.star,
    doukai: result.dokai.star,
    keisha: result.keisha.star,
    luckyDirections: result.saidaiKippo.stars,
  };
}
