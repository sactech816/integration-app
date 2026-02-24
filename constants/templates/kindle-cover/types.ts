export type KindleCoverGenre =
  | 'business'       // ビジネス書
  | 'self_help'      // 自己啓発
  | 'how_to'         // ハウツー・実用書
  | 'novel'          // 小説・エッセイ
  | 'education';     // 教育・学習

export interface KindleCoverColorTheme {
  id: string;
  name: string;
  colors: string[];
  promptModifier: string;
}

export interface KindleCoverTemplate {
  id: string;
  name: string;
  description: string;
  genre: KindleCoverGenre;
  promptTemplate: string;
  colorThemes: KindleCoverColorTheme[];
  tags: string[];
}
