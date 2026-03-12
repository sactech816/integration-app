'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { Crown, ChevronDown, ChevronUp, ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const SAMPLE_TYPES = [
  {
    key: 'shiheki',
    label: '四緑木星 × ライフパス7',
    subtitle: '調和の知識人',
    color: 'from-emerald-500 to-teal-600',
    icon: '🌿',
  },
  {
    key: 'ichihaku',
    label: '一白水星 × ライフパス1',
    subtitle: '先駆者の直感',
    color: 'from-blue-500 to-indigo-600',
    icon: '💧',
  },
  {
    key: 'kyushi',
    label: '九紫火星 × ライフパス11',
    subtitle: '華麗なる導き手',
    color: 'from-rose-500 to-pink-600',
    icon: '🔥',
  },
  {
    key: 'rokuhaku',
    label: '六白金星 × ライフパス8',
    subtitle: '天性のリーダー',
    color: 'from-amber-500 to-orange-600',
    icon: '✨',
  },
];

// ===============================
// 四緑木星 × ライフパス7 サンプル
// ===============================
const SAMPLE_SHIHEKI = `
<div style="font-family: 'Noto Sans JP', sans-serif; max-width: 800px; margin: 0 auto; color: #1a1a2e;">
  <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); color: white; padding: 40px 32px; border-radius: 16px; margin-bottom: 32px; text-align: center;">
    <p style="font-size: 13px; opacity: 0.8; margin: 0 0 8px;">運勢鑑定プレミアムレポート</p>
    <h1 style="font-size: 26px; font-weight: 800; margin: 0 0 8px;">四緑木星 × ライフパス7</h1>
    <p style="font-size: 14px; opacity: 0.85; margin: 0;">1985年6月15日生まれ — 「調和の知識人」</p>
  </div>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #4F46E5; margin: 0 0 12px;">総合性格分析</h2>
    <p style="line-height: 1.8; color: #374151; font-size: 15px;">
      あなたは<strong>九星気学の「四緑木星」</strong>が示す穏やかな協調性と、<strong>数秘術のライフパス7</strong>が示す深い探究心を併せ持つ、非常にユニークなバランスの持ち主です。四柱推命の日干「甲（きのえ）」は、あなたの中に大木のようなまっすぐな志と成長力があることを示しています。
    </p>
    <p style="line-height: 1.8; color: #374151; font-size: 15px; margin-top: 12px;">
      人当たりがよく信頼を集めやすい一方で、内面では常に「なぜ？」と問い続ける知的好奇心を持っています。この二面性が、対人関係では安心感を与えつつ、専門分野では深い洞察を発揮するというあなたならではの強みを生み出しています。
    </p>
  </div>

  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #3B82F6; margin: 0 0 16px;">九星気学 — 四緑木星の詳細</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
      <div style="background: #eff6ff; border-radius: 8px; padding: 12px; text-align: center;">
        <div style="font-size: 12px; color: #1d4ed8; font-weight: 600;">本命星</div>
        <div style="font-size: 18px; font-weight: 800; color: #1e3a5f; margin-top: 4px;">四緑木星</div>
      </div>
      <div style="background: #eff6ff; border-radius: 8px; padding: 12px; text-align: center;">
        <div style="font-size: 12px; color: #1d4ed8; font-weight: 600;">月命星</div>
        <div style="font-size: 18px; font-weight: 800; color: #1e3a5f; margin-top: 4px;">七赤金星</div>
      </div>
      <div style="background: #eff6ff; border-radius: 8px; padding: 12px; text-align: center;">
        <div style="font-size: 12px; color: #1d4ed8; font-weight: 600;">同会</div>
        <div style="font-size: 18px; font-weight: 800; color: #1e3a5f; margin-top: 4px;">二黒土星</div>
      </div>
      <div style="background: #eff6ff; border-radius: 8px; padding: 12px; text-align: center;">
        <div style="font-size: 12px; color: #1d4ed8; font-weight: 600;">傾斜</div>
        <div style="font-size: 18px; font-weight: 800; color: #1e3a5f; margin-top: 4px;">八白土星</div>
      </div>
    </div>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.7;">
      四緑木星は「風」の象徴。柔軟性と社交性に優れ、周囲との調和を自然に築くことができます。特に人脈形成の才能は九星の中でも随一で、信頼関係を通じてチャンスを引き寄せる力があります。同会の二黒土星は「勤勉さと母性」を加え、傾斜の八白土星は「変革と積み重ね」の要素をもたらします。これらが合わさり、穏やかでありながら確実に成果を積み上げるタイプとなっています。
    </p>
  </div>

  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #7C3AED; margin: 0 0 16px;">数秘術 — ライフパス7の深堀り</h2>
    <div style="background: linear-gradient(135deg, #f5f3ff, #ede9fe); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <p style="font-size: 18px; font-weight: 700; color: #5b21b6; margin: 0 0 4px;">「探究者」— 真実を追い求める魂</p>
      <p style="font-size: 14px; color: #6d28d9; line-height: 1.7;">
        ライフパス7のあなたは、表面的な情報では満足できない深い知性の持ち主。物事の本質を見抜く直感力と分析力を兼ね備えています。
      </p>
    </div>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.7;">
      学問、研究、技術、哲学など、深い思考を要する分野で特に力を発揮します。四緑木星の社交性がライフパス7の内省的な傾向をバランスよく補い、「人とつながりながらも自分の世界を持つ」という理想的な生き方が可能です。一人の時間を大切にしつつ、必要な場面では協調性を発揮できるのは、この組み合わせならではの強みです。
    </p>
  </div>

  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #059669; margin: 0 0 16px;">四柱推命 — 日干「甲」の分析</h2>
    <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
      <div style="background: #d1fae5; border-radius: 12px; padding: 16px 24px; text-align: center;">
        <div style="font-size: 36px; font-weight: 800; color: #065f46;">甲</div>
        <div style="font-size: 12px; color: #047857; font-weight: 600;">きのえ（陽の木）</div>
      </div>
      <div style="flex: 1;">
        <p style="font-size: 14px; color: #4b5563; line-height: 1.7; margin: 0;">
          甲は大木を象徴し、まっすぐに上を目指す成長力と志の高さを持ちます。困難にも折れず、時間をかけて大きく成長するタイプです。
        </p>
      </div>
    </div>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.7;">
      六十干支は「甲子（きのえね）」。新しいサイクルの始まりを示し、開拓者としての運命を持っています。甲木は日光（火）と水を必要とするため、情熱を持って取り組める仕事と、感情面での潤い（良好な人間関係）が運気を高める鍵となります。
    </p>
  </div>

  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #d97706; margin: 0 0 16px;">開運アドバイス</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
      <div style="background: #fffbeb; border-radius: 8px; padding: 16px;">
        <div style="font-size: 13px; color: #92400e; font-weight: 600; margin-bottom: 4px;">ラッキーカラー</div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <div style="width: 24px; height: 24px; border-radius: 50%; background: #22c55e; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></div>
          <div style="width: 24px; height: 24px; border-radius: 50%; background: #3b82f6; border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.2);"></div>
          <span style="font-size: 14px; color: #78350f;">グリーン・ブルー</span>
        </div>
      </div>
      <div style="background: #fffbeb; border-radius: 8px; padding: 16px;">
        <div style="font-size: 13px; color: #92400e; font-weight: 600; margin-bottom: 4px;">ラッキー方位</div>
        <p style="font-size: 14px; color: #78350f; margin: 0;">南東・南</p>
      </div>
      <div style="background: #fffbeb; border-radius: 8px; padding: 16px;">
        <div style="font-size: 13px; color: #92400e; font-weight: 600; margin-bottom: 4px;">ラッキーアイテム</div>
        <p style="font-size: 14px; color: #78350f; margin: 0;">観葉植物・手帳</p>
      </div>
      <div style="background: #fffbeb; border-radius: 8px; padding: 16px;">
        <div style="font-size: 13px; color: #92400e; font-weight: 600; margin-bottom: 4px;">ラッキーナンバー</div>
        <p style="font-size: 14px; color: #78350f; margin: 0;">3・7・12</p>
      </div>
    </div>
  </div>

  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #4F46E5; margin: 0 0 16px;">人生指南 — 仕事・健康・財運・対人</h2>

    <div style="margin-bottom: 20px;">
      <h3 style="font-size: 16px; color: #1f2937; margin: 0 0 8px; display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #3b82f6;"></span>
        仕事運
      </h3>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.7;">
        コンサルティング、教育、研究開発、IT関連の分野で特に力を発揮します。四緑木星の人脈力とライフパス7の専門性を活かし、「信頼される専門家」としてのポジションを築くのが最も自然なキャリアパスです。マネジメントよりも専門職やアドバイザーとして活躍する方が、長期的な満足度が高いでしょう。
      </p>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="font-size: 16px; color: #1f2937; margin: 0 0 8px; display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span>
        健康運
      </h3>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.7;">
        四緑木星は呼吸器系と肝臓に注意が必要です。深呼吸や森林浴など、「風」に関連するリフレッシュ法が効果的。甲木の性質から、規則正しい生活リズムを保つことが健康維持の要です。知的活動が多いため、意識的に体を動かす習慣を持ちましょう。
      </p>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="font-size: 16px; color: #1f2937; margin: 0 0 8px; display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #f59e0b;"></span>
        財運
      </h3>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.7;">
        一攫千金よりも、専門性を高めて着実に収入を伸ばすスタイルが合っています。人脈を通じた仕事の紹介や、知識・スキルを活かした副業が財運を高めます。投資は長期・分散型が吉。30代後半から財運が上昇傾向にあります。
      </p>
    </div>

    <div>
      <h3 style="font-size: 16px; color: #1f2937; margin: 0 0 8px; display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #ec4899;"></span>
        対人運・相性
      </h3>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.7;">
        最も相性が良いのは三碧木星と九紫火星。同じ木のエネルギーを持つ三碧とは自然体で付き合え、九紫の情熱はあなたの成長を促進します。注意が必要なのは六白金星と七赤金星。金剋木の関係から、衝突しやすい傾向がありますが、適度な距離感を保てば互いに成長できる関係です。
      </p>
    </div>
  </div>

  <div style="background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; text-align: center;">
    <p style="font-size: 13px; color: #166534; margin: 0;">
      ※ これはサンプルレポートです。実際のレポートはAIがあなたの鑑定結果を基に、より詳細でパーソナライズされた内容を生成します。
    </p>
  </div>
</div>
`;

// ===============================
// 一白水星 × ライフパス1 サンプル（短縮版）
// ===============================
const SAMPLE_ICHIHAKU = `
<div style="font-family: 'Noto Sans JP', sans-serif; max-width: 800px; margin: 0 auto; color: #1a1a2e;">
  <div style="background: linear-gradient(135deg, #3B82F6, #6366F1); color: white; padding: 40px 32px; border-radius: 16px; margin-bottom: 32px; text-align: center;">
    <p style="font-size: 13px; opacity: 0.8; margin: 0 0 8px;">運勢鑑定プレミアムレポート</p>
    <h1 style="font-size: 26px; font-weight: 800; margin: 0 0 8px;">一白水星 × ライフパス1</h1>
    <p style="font-size: 14px; opacity: 0.85; margin: 0;">1990年1月10日生まれ — 「先駆者の直感」</p>
  </div>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #3B82F6; margin: 0 0 12px;">総合性格分析</h2>
    <p style="line-height: 1.8; color: #374151; font-size: 15px;">
      一白水星の<strong>深い洞察力と忍耐力</strong>に、ライフパス1の<strong>独立心とリーダーシップ</strong>が融合した、独自の道を切り拓くタイプです。水のように柔軟でありながら、一度決めた道は貫く強い意志を持っています。
    </p>
    <p style="line-height: 1.8; color: #374151; font-size: 15px; margin-top: 12px;">
      周囲をよく観察し、本質を見抜く直感力は随一。静かに情報を集め、最適なタイミングで大胆に行動する戦略家です。一見控えめに見えますが、内面には強い情熱と野心を秘めています。
    </p>
  </div>

  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #3B82F6; margin: 0 0 16px;">九星気学 — 一白水星の詳細</h2>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.7;">
      一白水星は「水」の象徴。困難にも柔軟に対応し、どんな環境にも適応できる能力を持ちます。人間関係においては聞き上手で、相手の本音を引き出す力があります。20代は苦労が多い傾向がありますが、40代以降に大きく飛躍する「大器晩成」タイプです。
    </p>
  </div>

  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #d97706; margin: 0 0 16px;">開運アドバイス</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
      <div style="background: #fffbeb; border-radius: 8px; padding: 16px;">
        <div style="font-size: 13px; color: #92400e; font-weight: 600; margin-bottom: 4px;">ラッキーカラー</div>
        <p style="font-size: 14px; color: #78350f; margin: 0;">ホワイト・シルバー・ブラック</p>
      </div>
      <div style="background: #fffbeb; border-radius: 8px; padding: 16px;">
        <div style="font-size: 13px; color: #92400e; font-weight: 600; margin-bottom: 4px;">ラッキー方位</div>
        <p style="font-size: 14px; color: #78350f; margin: 0;">北</p>
      </div>
    </div>
  </div>

  <div style="background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; text-align: center;">
    <p style="font-size: 13px; color: #166534; margin: 0;">
      ※ これはサンプルレポートです。実際のレポートはAIがあなたの鑑定結果を基に、より詳細でパーソナライズされた内容を生成します。
    </p>
  </div>
</div>
`;

// ===============================
// 九紫火星 × ライフパス11 サンプル（短縮版）
// ===============================
const SAMPLE_KYUSHI = `
<div style="font-family: 'Noto Sans JP', sans-serif; max-width: 800px; margin: 0 auto; color: #1a1a2e;">
  <div style="background: linear-gradient(135deg, #e11d48, #be185d); color: white; padding: 40px 32px; border-radius: 16px; margin-bottom: 32px; text-align: center;">
    <p style="font-size: 13px; opacity: 0.8; margin: 0 0 8px;">運勢鑑定プレミアムレポート</p>
    <h1 style="font-size: 26px; font-weight: 800; margin: 0 0 8px;">九紫火星 × ライフパス11</h1>
    <p style="font-size: 14px; opacity: 0.85; margin: 0;">1988年8月8日生まれ — 「華麗なる導き手」</p>
  </div>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #e11d48; margin: 0 0 12px;">総合性格分析</h2>
    <p style="line-height: 1.8; color: #374151; font-size: 15px;">
      九紫火星の<strong>華やかさと直感力</strong>に、マスターナンバー11の<strong>スピリチュアルな感受性</strong>が加わった、カリスマ的な魅力の持ち主です。場の空気を一瞬で変える力と、人の心を見透かすような鋭い洞察力を兼ね備えています。
    </p>
    <p style="line-height: 1.8; color: #374151; font-size: 15px; margin-top: 12px;">
      芸術・美・表現に関する才能に恵まれ、クリエイティブな分野で頭角を現しやすいタイプです。ただし感受性の高さゆえに精神的な波が大きくなりやすいため、自分なりのリフレッシュ方法を持つことが大切です。
    </p>
  </div>

  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #d97706; margin: 0 0 16px;">開運アドバイス</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
      <div style="background: #fffbeb; border-radius: 8px; padding: 16px;">
        <div style="font-size: 13px; color: #92400e; font-weight: 600; margin-bottom: 4px;">ラッキーカラー</div>
        <p style="font-size: 14px; color: #78350f; margin: 0;">パープル・レッド・オレンジ</p>
      </div>
      <div style="background: #fffbeb; border-radius: 8px; padding: 16px;">
        <div style="font-size: 13px; color: #92400e; font-weight: 600; margin-bottom: 4px;">ラッキー方位</div>
        <p style="font-size: 14px; color: #78350f; margin: 0;">南・東</p>
      </div>
    </div>
  </div>

  <div style="background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; text-align: center;">
    <p style="font-size: 13px; color: #166534; margin: 0;">
      ※ これはサンプルレポートです。実際のレポートはAIがあなたの鑑定結果を基に、より詳細でパーソナライズされた内容を生成します。
    </p>
  </div>
</div>
`;

// ===============================
// 六白金星 × ライフパス8 サンプル（短縮版）
// ===============================
const SAMPLE_ROKUHAKU = `
<div style="font-family: 'Noto Sans JP', sans-serif; max-width: 800px; margin: 0 auto; color: #1a1a2e;">
  <div style="background: linear-gradient(135deg, #d97706, #ea580c); color: white; padding: 40px 32px; border-radius: 16px; margin-bottom: 32px; text-align: center;">
    <p style="font-size: 13px; opacity: 0.8; margin: 0 0 8px;">運勢鑑定プレミアムレポート</p>
    <h1 style="font-size: 26px; font-weight: 800; margin: 0 0 8px;">六白金星 × ライフパス8</h1>
    <p style="font-size: 14px; opacity: 0.85; margin: 0;">1978年11月23日生まれ — 「天性のリーダー」</p>
  </div>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #d97706; margin: 0 0 12px;">総合性格分析</h2>
    <p style="line-height: 1.8; color: #374151; font-size: 15px;">
      六白金星の<strong>天賦のリーダーシップと高い理想</strong>に、ライフパス8の<strong>実行力と経営センス</strong>が融合した、最強の実力者タイプです。「天」を象徴する六白金星は、生まれながらのカリスマ性と正義感を備えています。
    </p>
    <p style="line-height: 1.8; color: #374151; font-size: 15px; margin-top: 12px;">
      大きなビジョンを描き、それを現実にする力を持っています。ビジネスの世界では経営者・起業家として成功しやすい組み合わせです。ただし、完璧主義になりやすい傾向があるため、周囲への期待値をコントロールすることが重要です。
    </p>
  </div>

  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #d97706; margin: 0 0 16px;">開運アドバイス</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
      <div style="background: #fffbeb; border-radius: 8px; padding: 16px;">
        <div style="font-size: 13px; color: #92400e; font-weight: 600; margin-bottom: 4px;">ラッキーカラー</div>
        <p style="font-size: 14px; color: #78350f; margin: 0;">ゴールド・シルバー・ホワイト</p>
      </div>
      <div style="background: #fffbeb; border-radius: 8px; padding: 16px;">
        <div style="font-size: 13px; color: #92400e; font-weight: 600; margin-bottom: 4px;">ラッキー方位</div>
        <p style="font-size: 14px; color: #78350f; margin: 0;">北西・西</p>
      </div>
    </div>
  </div>

  <div style="background: linear-gradient(135deg, #f0fdf4, #ecfdf5); border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; text-align: center;">
    <p style="font-size: 13px; color: #166534; margin: 0;">
      ※ これはサンプルレポートです。実際のレポートはAIがあなたの鑑定結果を基に、より詳細でパーソナライズされた内容を生成します。
    </p>
  </div>
</div>
`;

const SAMPLE_MAP: Record<string, string> = {
  shiheki: SAMPLE_SHIHEKI,
  ichihaku: SAMPLE_ICHIHAKU,
  kyushi: SAMPLE_KYUSHI,
  rokuhaku: SAMPLE_ROKUHAKU,
};

export default function FortuneSampleReportPage() {
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [activeReport, setActiveReport] = useState<string>('shiheki');
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user: u } }) => setUser(u));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50">
      <Header
        user={user}
        onLogout={async () => {
          await supabase.auth.signOut();
          setUser(null);
        }}
        setShowAuth={setShowAuth}
      />

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        {/* 戻る */}
        <Link
          href="/fortune"
          className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          占いトップに戻る
        </Link>

        {/* ヘッダー */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/80 rounded-full">
            <Crown className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">サンプルレポート</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            プレミアム鑑定レポートのサンプル
          </h1>
          <p className="text-sm text-gray-600">
            代表的な4タイプの鑑定レポートを無料でご覧いただけます
          </p>
        </div>

        {/* タイプ選択 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SAMPLE_TYPES.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setActiveReport(t.key);
                setExpanded(true);
              }}
              className={`relative bg-white border rounded-xl p-4 text-center transition-all cursor-pointer ${
                activeReport === t.key
                  ? 'border-indigo-400 shadow-lg ring-2 ring-indigo-200'
                  : 'border-gray-200 hover:shadow-md hover:border-indigo-200'
              }`}
            >
              <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center mb-2`}>
                <span className="text-xl">{t.icon}</span>
              </div>
              <p className="font-bold text-gray-900 text-sm">{t.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.subtitle}</p>
            </button>
          ))}
        </div>

        {/* レポート表示 */}
        <div className="bg-white border border-gray-300 rounded-2xl shadow-md overflow-hidden">
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-6 py-4 flex items-center justify-between border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-gray-900">
                {SAMPLE_TYPES.find(t => t.key === activeReport)?.label} のサンプルレポート
              </span>
            </div>
            {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {expanded && (
            <div className="p-6 overflow-x-auto">
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: SAMPLE_MAP[activeReport] || '' }}
              />
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200 rounded-2xl shadow-md p-6 text-center">
          <Crown className="w-10 h-10 text-yellow-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            あなた専用のレポートを手に入れよう
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            AIが3つの占術を統合して、あなただけの詳細レポートを生成します
          </p>
          <p className="text-2xl font-bold text-gray-900 mb-4">
            ¥500<span className="text-sm text-gray-500 ml-1">（税込）</span>
          </p>
          <Link
            href="/fortune"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:brightness-110 transition-all text-lg"
          >
            <Sparkles className="w-5 h-5" />
            鑑定を始める
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
