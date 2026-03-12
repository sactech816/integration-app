/**
 * 占い結果表示用の定数とヘルパー関数
 */

/** 六十干支の名称一覧（0-59のインデックスに対応） */
export const SEXAGENARY_CYCLE_NAMES = [
  '甲子（きのえね）',
  '乙丑（きのとうし）',
  '丙寅（ひのえとら）',
  '丁卯（ひのとう）',
  '戊辰（つちのえたつ）',
  '己巳（つちのとみ）',
  '庚午（かのえうま）',
  '辛未（かのとひつじ）',
  '壬申（みずのえさる）',
  '癸酉（みずのととり）',
  '甲戌（きのえいぬ）',
  '乙亥（きのとい）',
  '丙子（ひのえね）',
  '丁丑（ひのとうし）',
  '戊寅（つちのえとら）',
  '己卯（つちのとう）',
  '庚辰（かのえたつ）',
  '辛巳（かのとみ）',
  '壬午（みずのえうま）',
  '癸未（みずのとひつじ）',
  '甲申（きのえさる）',
  '乙酉（きのととり）',
  '丙戌（ひのえいぬ）',
  '丁亥（ひのとい）',
  '戊子（つちのえね）',
  '己丑（つちのとうし）',
  '庚寅（かのえとら）',
  '辛卯（かのとう）',
  '壬辰（みずのえたつ）',
  '癸巳（みずのとみ）',
  '甲午（きのえうま）',
  '乙未（きのとひつじ）',
  '丙申（ひのえさる）',
  '丁酉（ひのととり）',
  '戊戌（つちのえいぬ）',
  '己亥（つちのとい）',
  '庚子（かのえね）',
  '辛丑（かのとうし）',
  '壬寅（みずのえとら）',
  '癸卯（みずのとう）',
  '甲辰（きのえたつ）',
  '乙巳（きのとみ）',
  '丙午（ひのえうま）',
  '丁未（ひのとひつじ）',
  '戊申（つちのえさる）',
  '己酉（つちのととり）',
  '庚戌（かのえいぬ）',
  '辛亥（かのとい）',
  '壬子（みずのえね）',
  '癸丑（みずのとうし）',
  '甲寅（きのえとら）',
  '乙卯（きのとう）',
  '丙辰（ひのえたつ）',
  '丁巳（ひのとみ）',
  '戊午（つちのえうま）',
  '己未（つちのとひつじ）',
  '庚申（かのえさる）',
  '辛酉（かのととり）',
  '壬戌（みずのえいぬ）',
  '癸亥（みずのとい）',
];

/** 干支番号から日本語名称を取得 */
export function getSexagenaryName(index: number): string {
  if (index < 0 || index >= 60) return `干支${index}`;
  return SEXAGENARY_CYCLE_NAMES[index];
}

/** 九星の色と五行属性 */
export const NINE_STAR_ATTRIBUTES: Record<string, { color: string; element: string; number: string }> = {
  '1_water': { color: '白', element: '水', number: '一白' },
  '2_earth': { color: '黒', element: '土', number: '二黒' },
  '3_wood':  { color: '碧', element: '木', number: '三碧' },
  '4_wood':  { color: '緑', element: '木', number: '四緑' },
  '5_earth': { color: '黄', element: '土', number: '五黄' },
  '6_metal': { color: '白', element: '金', number: '六白' },
  '7_red':   { color: '赤', element: '金', number: '七赤' },
  '8_earth': { color: '白', element: '土', number: '八白' },
  '9_fire':  { color: '紫', element: '火', number: '九紫' },
};

/** 九星キーから属性情報を取得 */
export function getNineStarAttributes(key: string) {
  return NINE_STAR_ATTRIBUTES[key] || { color: '', element: '', number: '' };
}
