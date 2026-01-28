// =============================================
// セールスレターテンプレート - インデックス
// =============================================

import { SalesLetterTemplate, salesLetterTemplateCategories } from '@/lib/types';

// 王道のセールスレター型
import { newPasonaTemplate } from './new-pasona';
import { pasbeconaTemplate } from './pasbecona';
import { questTemplate } from './quest';
import { oldPasonaTemplate } from './old-pasona';

// EC・物販・カタログ型
import { beafTemplate } from './beaf';
import { cremaTemplate } from './crema';

// ブログ・メルマガ・短文構成型
import { prepTemplate } from './prep';
import { sdsTemplate } from './sds';

// マーケティング思考・全体設計型
import { aisasTemplate } from './aisas';
import { aidmaTemplate } from './aidma';

// すべてのテンプレート
export const salesLetterTemplates: SalesLetterTemplate[] = [
  // 王道のセールスレター型
  newPasonaTemplate,
  pasbeconaTemplate,
  questTemplate,
  oldPasonaTemplate,
  
  // EC・物販・カタログ型
  beafTemplate,
  cremaTemplate,
  
  // ブログ・メルマガ・短文構成型
  prepTemplate,
  sdsTemplate,
  
  // マーケティング思考・全体設計型
  aisasTemplate,
  aidmaTemplate,
];

// カテゴリ別にテンプレートを取得
export const getTemplatesByCategory = (category: string): SalesLetterTemplate[] => {
  return salesLetterTemplates.filter(t => t.category === category);
};

// テンプレートをIDで取得
export const getTemplateById = (id: string): SalesLetterTemplate | undefined => {
  return salesLetterTemplates.find(t => t.id === id);
};

// カテゴリ情報をエクスポート
export { salesLetterTemplateCategories as templateCategories };

// 各テンプレートの詳細説明（モーダル用）
export const templateGuides: Record<string, {
  whatIs: string;
  structure: { step: string; description: string }[];
  tips: string[];
  bestFor: string[];
}> = {
  'new-pasona': {
    whatIs: '新PASONAの法則は、消費者の心理に寄り添いながら、自然な流れで購買行動を促す現代のスタンダードな構成法です。旧PASONAの「煽り」要素を「親近感」に置き換え、より共感ベースのアプローチを取ります。',
    structure: [
      { step: 'Problem（問題提起）', description: '読者が抱える問題や悩みを明確に提示' },
      { step: 'Affinity（親近感）', description: '「私も同じでした」と共感を示す' },
      { step: 'Solution（解決策）', description: '問題を解決する方法を提示' },
      { step: 'Offer（提案）', description: '具体的な商品・サービスを提案' },
      { step: 'Narrowing（絞込）', description: '限定性や希少性を伝える' },
      { step: 'Action（行動喚起）', description: '今すぐ行動を促す' },
    ],
    tips: [
      '問題提起は読者が「まさに自分のこと」と感じる具体性を持たせる',
      '親近感パートでは自分の失敗体験や苦労話を正直に語る',
      '解決策は「なぜそれで解決できるのか」の理由を明確に',
    ],
    bestFor: ['コンサルティング', 'コーチング', '教材・講座', 'サービス全般'],
  },
  'pasbecona': {
    whatIs: 'PASBECONAの法則は、PASONAをさらに拡張した最も説得力の高い構成法です。特に高額商品や情報商材など、十分な説得が必要な場合に効果を発揮します。',
    structure: [
      { step: 'Problem（問題）', description: '読者の問題・悩みを提示' },
      { step: 'Affinity（親近感）', description: '共感と信頼関係を構築' },
      { step: 'Solution（解決策）', description: '解決の方向性を示す' },
      { step: 'Benefit（利益）', description: '得られるメリットを具体的に' },
      { step: 'Evidence（証拠）', description: '実績・データ・お客様の声' },
      { step: 'Contents（内容）', description: '商品・サービスの詳細' },
      { step: 'Offer（提案）', description: '価格・条件を提示' },
      { step: 'Narrowing（絞込）', description: '限定性・希少性' },
      { step: 'Action（行動）', description: '申込みを促す' },
    ],
    tips: [
      '証拠パートは量より質。具体的な数字や第三者の声が効果的',
      '内容パートでは「何が含まれるか」を箇条書きで明確に',
      '高額商品では分割払いなどの選択肢も提示すると効果的',
    ],
    bestFor: ['高額講座', '情報商材', 'コンサル契約', 'BtoB商材'],
  },
  'quest': {
    whatIs: 'QUESTの法則は、読者を物語に引き込むように自然に読ませる構成法です。ストーリーテリングを重視し、感情に訴えかけることで行動を促します。',
    structure: [
      { step: 'Qualify（適格化）', description: 'ターゲットを明確にし、「あなたのための情報です」と示す' },
      { step: 'Understand（理解）', description: '読者の悩みを深く理解していることを示す' },
      { step: 'Educate（教育）', description: '解決策について教え、価値を伝える' },
      { step: 'Stimulate（刺激）', description: '感情を刺激し、欲求を高める' },
      { step: 'Transition（転換）', description: '読者から購入者への転換を促す' },
    ],
    tips: [
      '最初の「適格化」で読者をしっかり絞り込む',
      '理解パートでは読者以上に悩みを言語化する',
      '刺激パートでは「手に入れた後の未来」を描く',
    ],
    bestFor: ['自己啓発系', '転職・キャリア', 'ダイエット・美容', 'ストーリー重視の商材'],
  },
  'old-pasona': {
    whatIs: '旧PASONAの法則は、問題を煽ることで購買意欲を高める手法です。現在は新PASONAが主流ですが、緊急性が高い商材では今でも効果を発揮します。※過度な煽りは逆効果になるので注意。',
    structure: [
      { step: 'Problem（問題）', description: '問題を提示し、危機感を煽る' },
      { step: 'Agitation（煽り）', description: '問題を放置した場合の最悪の結果を描写' },
      { step: 'Solution（解決策）', description: '救いとなる解決策を提示' },
      { step: 'Offer（提案）', description: '具体的な商品・サービスを提案' },
      { step: 'Narrowing（絞込）', description: '限定性で緊急性を高める' },
      { step: 'Action（行動）', description: '今すぐの行動を強く促す' },
    ],
    tips: [
      '煽りすぎると不信感を招くので、事実ベースで語る',
      '問題→煽りの後は、必ず希望を見せる構成に',
      '緊急性が高い商材（保険、防犯など）に向いている',
    ],
    bestFor: ['保険・金融', '防犯・セキュリティ', '緊急性の高いサービス'],
  },
  'beaf': {
    whatIs: 'BEAFの法則は、ECサイトの商品説明に最適化された構成法です。シンプルで分かりやすく、購入の決め手となる情報を効率的に伝えます。',
    structure: [
      { step: 'Benefit（利益）', description: '商品を使うことで得られるメリット' },
      { step: 'Evidence（証拠）', description: 'レビュー・販売実績・受賞歴など' },
      { step: 'Advantage（優位性）', description: '他社製品との違い・独自の強み' },
      { step: 'Feature（特徴）', description: 'スペック・仕様・素材などの詳細' },
    ],
    tips: [
      '最初にベネフィットを持ってくることで興味を引く',
      '証拠は数字で示す（レビュー4.8、累計10万個など）',
      '特徴は箇条書きで読みやすく',
    ],
    bestFor: ['EC商品ページ', '物販', 'ガジェット・家電', '日用品'],
  },
  'crema': {
    whatIs: 'CREMAの法則は、短い文章で効果的に行動を促す構成法です。SNS広告やメルマガなど、限られたスペースで伝える場合に最適です。',
    structure: [
      { step: 'Conclusion（結論）', description: '最初に結論・メリットを伝える' },
      { step: 'Reason（理由）', description: 'なぜそう言えるのか理由を説明' },
      { step: 'Evidence（証拠）', description: '証拠・実績を示す' },
      { step: 'Method（手段）', description: '具体的な方法・手順を伝える' },
      { step: 'Action（行動）', description: '行動を促す' },
    ],
    tips: [
      '結論を最初に持ってくることで離脱を防ぐ',
      '各パートは簡潔に、長くなりすぎない',
      'CTAは具体的に（「今すぐダウンロード」など）',
    ],
    bestFor: ['SNS広告', 'メルマガ', 'ランディングページ', '短い説明文'],
  },
  'prep': {
    whatIs: 'PREP法は、論理的で説得力のある文章構成の基本形です。ビジネス文書からプレゼンまで幅広く使える汎用性の高いフレームワークです。',
    structure: [
      { step: 'Point（結論）', description: '最初に結論・主張を述べる' },
      { step: 'Reason（理由）', description: 'なぜそう言えるのか理由を説明' },
      { step: 'Example（具体例）', description: '具体的な事例で補強' },
      { step: 'Point（結論）', description: '再度結論を述べて締める' },
    ],
    tips: [
      '結論は一文で簡潔に',
      '理由は3つ程度に絞ると分かりやすい',
      '具体例は読者がイメージしやすいものを選ぶ',
    ],
    bestFor: ['ブログ記事', 'プレゼン資料', 'ビジネスメール', 'レポート'],
  },
  'sds': {
    whatIs: 'SDS法は、シンプルに要点を伝える構成法です。ニュースや速報、要約文など、短時間で情報を伝える必要がある場合に適しています。',
    structure: [
      { step: 'Summary（要約）', description: '全体の要約を最初に伝える' },
      { step: 'Details（詳細）', description: '詳しい内容を説明' },
      { step: 'Summary（要約）', description: '再度要約して締める' },
    ],
    tips: [
      '最初のSummaryで全体像を把握させる',
      'Detailsは重要度順に並べる',
      '最後のSummaryでは行動を促す要素を入れても良い',
    ],
    bestFor: ['ニュース', 'プレスリリース', '要約文', '速報'],
  },
  'aisas': {
    whatIs: 'AISASは、インターネット時代の消費者行動モデルです。検索と共有が含まれているのが特徴で、Web施策の全体設計に活用できます。',
    structure: [
      { step: 'Attention（注意）', description: '広告などで注意を引く' },
      { step: 'Interest（興味）', description: '興味を持ってもらう' },
      { step: 'Search（検索）', description: '検索して情報収集' },
      { step: 'Action（行動）', description: '購入・申込み' },
      { step: 'Share（共有）', description: 'SNSなどで共有' },
    ],
    tips: [
      'Search対策（SEO）が重要',
      'Share（共有）しやすい仕組みを用意する',
      '各段階に合わせたコンテンツを用意する',
    ],
    bestFor: ['Webマーケティング戦略', 'SNSマーケティング', 'コンテンツマーケティング'],
  },
  'aidma': {
    whatIs: 'AIDMAは、古典的な消費者行動モデルです。主にマス広告時代のモデルですが、基本的な購買心理を理解するのに役立ちます。',
    structure: [
      { step: 'Attention（注意）', description: '商品の存在に気づく' },
      { step: 'Interest（興味）', description: '興味を持つ' },
      { step: 'Desire（欲求）', description: '欲しいと思う' },
      { step: 'Memory（記憶）', description: '記憶に残る' },
      { step: 'Action（行動）', description: '購入する' },
    ],
    tips: [
      'Memory（記憶）の段階が重要。印象に残る工夫を',
      '繰り返し接触することで記憶を強化',
      'インパクトのあるキャッチコピーが効果的',
    ],
    bestFor: ['ブランディング', 'テレビCM', '認知拡大施策'],
  },
};
