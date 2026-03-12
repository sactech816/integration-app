'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import { Crown, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type Tier = 'simple' | 'full' | 'detailed';

const TIER_INFO: Record<Tier, { label: string; price: string; pages: string; color: string; gradient: string }> = {
  simple: { label: '簡易診断', price: '¥500', pages: '5〜8ページ', color: 'blue', gradient: 'from-blue-500 to-cyan-500' },
  full: { label: '本格診断', price: '¥1,000', pages: '約15ページ', color: 'indigo', gradient: 'from-indigo-500 to-purple-500' },
  detailed: { label: '詳細診断', price: '¥2,000', pages: '25〜30ページ', color: 'amber', gradient: 'from-amber-500 to-orange-500' },
};

// ===============================
// 簡易診断サンプルレポート
// ===============================
const SIMPLE_REPORT = `
<div style="font-family: 'Noto Sans JP', sans-serif; max-width: 800px; margin: 0 auto; color: #1a1a2e;">

  <!-- ヘッダー -->
  <div style="background: linear-gradient(135deg, #3B82F6, #6366F1); color: white; padding: 40px 32px; border-radius: 16px; margin-bottom: 32px; text-align: center;">
    <h1 style="font-size: 28px; font-weight: 800; margin: 0 0 8px;">Big Five パーソナリティレポート</h1>
    <p style="font-size: 14px; opacity: 0.85; margin: 0;">簡易診断（10問）AIプレミアムレポート</p>
  </div>

  <!-- エグゼクティブサマリー -->
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #3B82F6; margin: 0 0 12px;">エグゼクティブサマリー</h2>
    <p style="line-height: 1.8; color: #374151; font-size: 15px;">
      あなたは<strong>高い開放性と誠実性</strong>を併せ持つ、知的好奇心に溢れた計画的な人物です。新しいアイデアや経験に対して積極的でありながら、物事を着実にやり遂げる責任感も兼ね備えています。対人面では穏やかで協力的な姿勢を示しつつ、適度な自己主張もできるバランスの取れたコミュニケーションスタイルが特徴です。
    </p>
  </div>

  <!-- パーソナリティマップ -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #3B82F6; margin: 0 0 16px;">パーソナリティマップ</h2>
    <div style="text-align: center;">
      <svg viewBox="0 0 400 400" width="320" height="320" style="margin: 0 auto;">
        <!-- 背景五角形 -->
        <polygon points="200,40 362,157 300,340 100,340 38,157" fill="none" stroke="#e2e8f0" stroke-width="1"/>
        <polygon points="200,88 329,178 280,316 120,316 71,178" fill="none" stroke="#e2e8f0" stroke-width="1"/>
        <polygon points="200,136 296,199 260,292 140,292 104,199" fill="none" stroke="#e2e8f0" stroke-width="1"/>
        <polygon points="200,184 263,220 240,268 160,268 137,220" fill="none" stroke="#e2e8f0" stroke-width="1"/>
        <!-- データ -->
        <polygon points="200,64 345,168 280,328 140,292 71,157" fill="rgba(59,130,246,0.15)" stroke="#3B82F6" stroke-width="2.5"/>
        <!-- ラベル -->
        <text x="200" y="25" text-anchor="middle" fill="#374151" font-size="13" font-weight="600">開放性 82%</text>
        <text x="380" y="160" text-anchor="start" fill="#374151" font-size="13" font-weight="600">誠実性 75%</text>
        <text x="315" y="360" text-anchor="middle" fill="#374151" font-size="13" font-weight="600">外向性 58%</text>
        <text x="85" y="360" text-anchor="middle" fill="#374151" font-size="13" font-weight="600">協調性 65%</text>
        <text x="20" y="160" text-anchor="end" fill="#374151" font-size="13" font-weight="600">神経症傾向 42%</text>
        <!-- ポイント -->
        <circle cx="200" cy="64" r="5" fill="#3B82F6"/>
        <circle cx="345" cy="168" r="5" fill="#3B82F6"/>
        <circle cx="280" cy="328" r="5" fill="#3B82F6"/>
        <circle cx="140" cy="292" r="5" fill="#3B82F6"/>
        <circle cx="71" cy="157" r="5" fill="#3B82F6"/>
      </svg>
    </div>
  </div>

  <!-- 5特性分析 -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #3B82F6; margin: 0 0 16px;">5特性の分析</h2>

    <div style="margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <div style="width: 10px; height: 10px; border-radius: 50%; background: #8B5CF6;"></div>
        <h3 style="font-size: 16px; color: #1f2937; margin: 0;">開放性 — 82%（高い）</h3>
      </div>
      <div style="background: #f3f4f6; border-radius: 8px; height: 8px; margin-bottom: 8px;">
        <div style="background: linear-gradient(90deg, #8B5CF6, #a78bfa); height: 100%; width: 82%; border-radius: 8px;"></div>
      </div>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.7;">
        あなたは知的好奇心が非常に強く、新しい経験やアイデアに対して開放的です。創造的な活動や抽象的な議論を楽しみ、多様な視点から物事を捉えることができます。芸術的な感受性も高く、美的体験から深い感動を得られるタイプです。
      </p>
    </div>

    <div style="margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <div style="width: 10px; height: 10px; border-radius: 50%; background: #3B82F6;"></div>
        <h3 style="font-size: 16px; color: #1f2937; margin: 0;">誠実性 — 75%（高い）</h3>
      </div>
      <div style="background: #f3f4f6; border-radius: 8px; height: 8px; margin-bottom: 8px;">
        <div style="background: linear-gradient(90deg, #3B82F6, #60a5fa); height: 100%; width: 75%; border-radius: 8px;"></div>
      </div>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.7;">
        計画性と自己規律に優れ、目標に向かって着実に行動する力があります。約束を守り、責任を全うしようとする誠実な姿勢は、周囲からの信頼を集めます。ただし、完璧を求めすぎると柔軟性に欠ける場面もあるかもしれません。
      </p>
    </div>

    <div style="margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <div style="width: 10px; height: 10px; border-radius: 50%; background: #10b981;"></div>
        <h3 style="font-size: 16px; color: #1f2937; margin: 0;">外向性 — 58%（中程度）</h3>
      </div>
      <div style="background: #f3f4f6; border-radius: 8px; height: 8px; margin-bottom: 8px;">
        <div style="background: linear-gradient(90deg, #10b981, #34d399); height: 100%; width: 58%; border-radius: 8px;"></div>
      </div>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.7;">
        社交的な場面も一人の時間も適度に楽しめるバランス型です。必要に応じてリーダーシップを発揮できますが、常に注目を集めたいタイプではありません。小規模なグループでの深い対話を特に好む傾向があります。
      </p>
    </div>

    <div style="margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <div style="width: 10px; height: 10px; border-radius: 50%; background: #f59e0b;"></div>
        <h3 style="font-size: 16px; color: #1f2937; margin: 0;">協調性 — 65%（やや高い）</h3>
      </div>
      <div style="background: #f3f4f6; border-radius: 8px; height: 8px; margin-bottom: 8px;">
        <div style="background: linear-gradient(90deg, #f59e0b, #fbbf24); height: 100%; width: 65%; border-radius: 8px;"></div>
      </div>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.7;">
        他者への思いやりと協力的な姿勢を持ちながらも、必要な場面では自分の意見をしっかり述べることができます。チームワークを大切にしつつ、理不尽な要求には適切に境界線を引ける健全なバランス感覚の持ち主です。
      </p>
    </div>

    <div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
        <div style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444;"></div>
        <h3 style="font-size: 16px; color: #1f2937; margin: 0;">神経症傾向 — 42%（やや低い）</h3>
      </div>
      <div style="background: #f3f4f6; border-radius: 8px; height: 8px; margin-bottom: 8px;">
        <div style="background: linear-gradient(90deg, #ef4444, #f87171); height: 100%; width: 42%; border-radius: 8px;"></div>
      </div>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.7;">
        感情的な安定性が比較的高く、日常的なストレスに対して冷静に対処できます。ただし、大きなプレッシャーの下では不安を感じることもあり、適切なストレス管理が重要です。全体的に落ち着いた判断ができる方です。
      </p>
    </div>
  </div>

  <!-- 16パーソナリティタイプ -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #3B82F6; margin: 0 0 16px;">16パーソナリティタイプ: ENFJ</h2>
    <div style="background: linear-gradient(135deg, #eff6ff, #eef2ff); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <p style="font-size: 18px; font-weight: 700; color: #1e40af; margin: 0 0 4px;">「主人公」— 戦略的ビジョナリー</p>
      <p style="font-size: 14px; color: #3730a3; line-height: 1.7;">
        カリスマ性と共感力を兼ね備えたリーダータイプ。他者の成長を支援し、理想を実現に導く力を持っています。
      </p>
    </div>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.7;">
      ENFJは人々を鼓舞し、チームをまとめる天性のリーダーです。あなたの高い開放性と協調性がこのタイプの特徴をさらに強化しています。直感的に他者のニーズを理解し、温かくも戦略的なコミュニケーションで目標に導くことができます。教育、カウンセリング、マネジメントなど、人と関わる仕事で特に力を発揮します。
    </p>
  </div>

  <!-- DISC行動スタイル -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #3B82F6; margin: 0 0 16px;">DISC行動スタイル: 影響型（I）</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
      <div style="background: #fef3c7; border-radius: 8px; padding: 12px; text-align: center;">
        <div style="font-size: 24px; font-weight: 800; color: #92400e;">D: 45</div>
        <div style="font-size: 12px; color: #78350f;">主導型</div>
      </div>
      <div style="background: #dbeafe; border: 2px solid #3b82f6; border-radius: 8px; padding: 12px; text-align: center;">
        <div style="font-size: 24px; font-weight: 800; color: #1e40af;">I: 72</div>
        <div style="font-size: 12px; color: #1e3a8a;">影響型 ★</div>
      </div>
      <div style="background: #d1fae5; border-radius: 8px; padding: 12px; text-align: center;">
        <div style="font-size: 24px; font-weight: 800; color: #065f46;">S: 58</div>
        <div style="font-size: 12px; color: #064e3b;">安定型</div>
      </div>
      <div style="background: #ede9fe; border-radius: 8px; padding: 12px; text-align: center;">
        <div style="font-size: 24px; font-weight: 800; color: #5b21b6;">C: 55</div>
        <div style="font-size: 12px; color: #4c1d95;">慎重型</div>
      </div>
    </div>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.7;">
      あなたのDISCスタイルは<strong>影響型（I）</strong>が優位です。社交的で楽観的、周囲を巻き込む力に長けています。チーム内では雰囲気づくりの中心となり、アイデアの発信役として活躍します。安定型（S）のスコアも高めなため、変化の中でも落ち着いた対応ができる柔軟さも持ち合わせています。
    </p>
  </div>

  <!-- 強みと成長のヒント -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #3B82F6; margin: 0 0 16px;">強みと成長のヒント</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div style="background: #f0fdf4; border-radius: 8px; padding: 16px;">
        <h3 style="font-size: 15px; color: #166534; margin: 0 0 8px;">💪 主な強み</h3>
        <ul style="font-size: 14px; color: #15803d; padding-left: 16px; margin: 0; line-height: 1.8;">
          <li>知的好奇心と創造力</li>
          <li>計画性と実行力のバランス</li>
          <li>柔軟なコミュニケーション力</li>
          <li>ストレス耐性の高さ</li>
        </ul>
      </div>
      <div style="background: #fffbeb; border-radius: 8px; padding: 16px;">
        <h3 style="font-size: 15px; color: #92400e; margin: 0 0 8px;">🌱 成長のヒント</h3>
        <ul style="font-size: 14px; color: #a16207; padding-left: 16px; margin: 0; line-height: 1.8;">
          <li>完璧主義を手放す練習</li>
          <li>一人の時間の確保</li>
          <li>「No」を言う勇気を育てる</li>
          <li>感情の言語化を意識する</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- キャリアと人間関係 -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #3B82F6; margin: 0 0 16px;">キャリアと人間関係の傾向</h2>
    <div style="margin-bottom: 16px;">
      <h3 style="font-size: 15px; color: #1f2937; margin: 0 0 8px;">🎯 適職傾向</h3>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.7;">
        教育・研修、コンサルティング、プロジェクトマネジメント、マーケティング、カウンセリング、クリエイティブディレクションなど、知性と対人スキルを両立できる職種で力を発揮します。
      </p>
    </div>
    <div>
      <h3 style="font-size: 15px; color: #1f2937; margin: 0 0 8px;">💬 対人関係のポイント</h3>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.7;">
        温かくも知的な関係性を好みます。深い会話を通じて相手と繋がることに価値を感じるため、表面的な付き合いよりも少数の親密な関係を大切にする傾向があります。相手の成長を支援したいという欲求が強く、メンター的な役割を自然と担うことが多いでしょう。
      </p>
    </div>
  </div>

  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>※ このレポートはAIによる自動分析です。専門家の診断に代わるものではありません。</p>
    <p>Big Five 性格診断 プレミアムレポート（簡易版） — makers.tokyo</p>
  </div>
</div>
`;

// ===============================
// 本格診断サンプルレポート
// ===============================
const FULL_REPORT = `
<div style="font-family: 'Noto Sans JP', sans-serif; max-width: 800px; margin: 0 auto; color: #1a1a2e;">

  <!-- ヘッダー -->
  <div style="background: linear-gradient(135deg, #6366F1, #8B5CF6); color: white; padding: 40px 32px; border-radius: 16px; margin-bottom: 32px; text-align: center;">
    <h1 style="font-size: 28px; font-weight: 800; margin: 0 0 8px;">Big Five パーソナリティレポート</h1>
    <p style="font-size: 14px; opacity: 0.85; margin: 0;">本格診断（50問）AIプレミアムレポート — 30ファセット詳細分析付き</p>
  </div>

  <!-- エグゼクティブサマリー -->
  <div style="background: linear-gradient(135deg, #f8fafc, #eef2ff); border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #6366F1; margin: 0 0 12px;">エグゼクティブサマリー</h2>
    <p style="line-height: 1.8; color: #374151; font-size: 15px;">
      あなたは<strong>創造的で計画的、かつ対人感度の高い</strong>多面的な人物です。開放性82%という高スコアは、知的探求心と芸術的感受性の強さを示しています。一方で誠実性75%は、その創造性を「形にする力」があることを意味し、夢想で終わらない実行力を兼ね備えています。外向性58%は社交と内省のバランスが取れた「両向型（アンビバート）」の特性を示し、場面に応じた柔軟な対応が可能です。30ファセットの分析からは、特に「知的好奇心」「達成努力」「温かさ」のスコアが突出しており、学び続けながら成果を出し、周囲との良好な関係を築くという、あなたならではの成功パターンが浮かび上がります。
    </p>
  </div>

  <!-- パーソナリティマップ（レーダーチャート） -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #6366F1; margin: 0 0 16px;">パーソナリティマップ</h2>
    <div style="text-align: center;">
      <svg viewBox="0 0 400 400" width="320" height="320" style="margin: 0 auto;">
        <polygon points="200,40 362,157 300,340 100,340 38,157" fill="none" stroke="#e2e8f0" stroke-width="1"/>
        <polygon points="200,88 329,178 280,316 120,316 71,178" fill="none" stroke="#e2e8f0" stroke-width="1"/>
        <polygon points="200,136 296,199 260,292 140,292 104,199" fill="none" stroke="#e2e8f0" stroke-width="1"/>
        <polygon points="200,184 263,220 240,268 160,268 137,220" fill="none" stroke="#e2e8f0" stroke-width="1"/>
        <polygon points="200,64 345,168 280,328 140,292 71,157" fill="rgba(99,102,241,0.15)" stroke="#6366F1" stroke-width="2.5"/>
        <text x="200" y="25" text-anchor="middle" fill="#374151" font-size="13" font-weight="600">開放性 82%</text>
        <text x="380" y="160" text-anchor="start" fill="#374151" font-size="13" font-weight="600">誠実性 75%</text>
        <text x="315" y="360" text-anchor="middle" fill="#374151" font-size="13" font-weight="600">外向性 58%</text>
        <text x="85" y="360" text-anchor="middle" fill="#374151" font-size="13" font-weight="600">協調性 65%</text>
        <text x="20" y="160" text-anchor="end" fill="#374151" font-size="13" font-weight="600">神経症傾向 42%</text>
        <circle cx="200" cy="64" r="5" fill="#6366F1"/>
        <circle cx="345" cy="168" r="5" fill="#6366F1"/>
        <circle cx="280" cy="328" r="5" fill="#6366F1"/>
        <circle cx="140" cy="292" r="5" fill="#6366F1"/>
        <circle cx="71" cy="157" r="5" fill="#6366F1"/>
      </svg>
    </div>
  </div>

  <!-- 開放性ファセット詳細 -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #6366F1; margin: 0 0 16px;">5特性の詳細分析</h2>

    <div style="margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid #f3f4f6;">
      <h3 style="font-size: 17px; color: #4f46e5; margin: 0 0 12px;">🔮 開放性 — 82%（高い）</h3>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.7; margin-bottom: 12px;">
        あなたの開放性は全体的に高いですが、ファセット間で興味深い凹凸があります。特に<strong>「知的好奇心」（91%）</strong>が突出しており、新しい知識や理論への飽くなき探求心が最大の特徴です。一方で<strong>「空想力」（68%）</strong>はやや控えめで、あなたの創造性が「空想型」ではなく「実証型」であることを示しています。
      </p>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
        <div style="background: #f5f3ff; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 18px; font-weight: 700; color: #7c3aed;">91%</div>
          <div style="font-size: 11px; color: #6d28d9;">知的好奇心</div>
        </div>
        <div style="background: #f5f3ff; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 18px; font-weight: 700; color: #7c3aed;">85%</div>
          <div style="font-size: 11px; color: #6d28d9;">美的感受性</div>
        </div>
        <div style="background: #f5f3ff; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 18px; font-weight: 700; color: #7c3aed;">82%</div>
          <div style="font-size: 11px; color: #6d28d9;">感情の豊かさ</div>
        </div>
        <div style="background: #f5f3ff; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 18px; font-weight: 700; color: #7c3aed;">80%</div>
          <div style="font-size: 11px; color: #6d28d9;">冒険心</div>
        </div>
        <div style="background: #f5f3ff; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 18px; font-weight: 700; color: #7c3aed;">68%</div>
          <div style="font-size: 11px; color: #6d28d9;">空想力</div>
        </div>
        <div style="background: #f5f3ff; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 18px; font-weight: 700; color: #7c3aed;">78%</div>
          <div style="font-size: 11px; color: #6d28d9;">価値観の柔軟性</div>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 28px; padding-bottom: 24px; border-bottom: 1px solid #f3f4f6;">
      <h3 style="font-size: 17px; color: #2563eb; margin: 0 0 12px;">📋 誠実性 — 75%（高い）</h3>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.7; margin-bottom: 12px;">
        <strong>「達成努力」（88%）</strong>と<strong>「自己統制」（80%）</strong>が非常に高く、目標達成への強い意志を持っています。一方で<strong>「秩序性」（62%）</strong>はやや控えめで、ルールに縛られるより「自分なりの方法」で物事を進める柔軟さがあります。この組み合わせは、創造的な仕事を計画的に遂行する能力として表れます。
      </p>
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px;">
        <div style="background: #eff6ff; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 18px; font-weight: 700; color: #2563eb;">88%</div>
          <div style="font-size: 11px; color: #1d4ed8;">達成努力</div>
        </div>
        <div style="background: #eff6ff; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 18px; font-weight: 700; color: #2563eb;">80%</div>
          <div style="font-size: 11px; color: #1d4ed8;">自己統制</div>
        </div>
        <div style="background: #eff6ff; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 18px; font-weight: 700; color: #2563eb;">75%</div>
          <div style="font-size: 11px; color: #1d4ed8;">責任感</div>
        </div>
        <div style="background: #eff6ff; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 18px; font-weight: 700; color: #2563eb;">72%</div>
          <div style="font-size: 11px; color: #1d4ed8;">思慮深さ</div>
        </div>
        <div style="background: #eff6ff; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 18px; font-weight: 700; color: #2563eb;">68%</div>
          <div style="font-size: 11px; color: #1d4ed8;">有能感</div>
        </div>
        <div style="background: #eff6ff; border-radius: 8px; padding: 10px; text-align: center;">
          <div style="font-size: 18px; font-weight: 700; color: #2563eb;">62%</div>
          <div style="font-size: 11px; color: #1d4ed8;">秩序性</div>
        </div>
      </div>
    </div>

    <p style="font-size: 13px; color: #9ca3af; text-align: center; margin: 0;">
      ※ 外向性・協調性・神経症傾向の30ファセット分析は完全版レポートに含まれます
    </p>
  </div>

  <!-- 16パーソナリティタイプ詳細 -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #6366F1; margin: 0 0 16px;">16パーソナリティタイプ: ENFJ「主人公」</h2>
    <div style="background: linear-gradient(135deg, #eef2ff, #faf5ff); border-radius: 8px; padding: 16px; margin-bottom: 16px;">
      <p style="font-size: 14px; color: #4b5563; line-height: 1.8;">
        ENFJは16タイプの中で最も「人を動かす力」を持つタイプです。あなたの高い開放性（82%）はENFJの中でも特に<strong>ビジョナリー型</strong>であり、単に人を導くだけでなく、革新的なアイデアで組織を変革する力を持っています。
      </p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
      <div style="background: #f0fdf4; border-radius: 8px; padding: 12px;">
        <h4 style="font-size: 13px; color: #166534; margin: 0 0 6px;">認知機能スタック</h4>
        <div style="font-size: 13px; color: #15803d; line-height: 1.6;">
          主機能: <strong>Fe</strong>（外向的感情）<br/>
          補助機能: <strong>Ni</strong>（内向的直観）<br/>
          第三機能: Se（外向的感覚）<br/>
          劣等機能: Ti（内向的思考）
        </div>
      </div>
      <div style="background: #fffbeb; border-radius: 8px; padding: 12px;">
        <h4 style="font-size: 13px; color: #92400e; margin: 0 0 6px;">ストレス時の傾向</h4>
        <p style="font-size: 13px; color: #a16207; line-height: 1.6;">
          過度なストレスで劣等機能Tiが暴走し、過度に論理的・批判的になることがあります。「人の気持ちを考えない」と思われがちな行動が出たら、休息のサインです。
        </p>
      </div>
    </div>
  </div>

  <!-- DISC詳細 -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #6366F1; margin: 0 0 16px;">DISC行動スタイル: I（影響型）/ S（安定型）</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
      <div style="background: #dbeafe; border: 2px solid #3b82f6; border-radius: 8px; padding: 16px; text-align: center;">
        <div style="font-size: 28px; font-weight: 800; color: #1e40af;">I: 72</div>
        <div style="font-size: 13px; color: #1e3a8a; font-weight: 600;">影響型 ★</div>
      </div>
      <div style="background: #d1fae5; border: 2px solid #10b981; border-radius: 8px; padding: 16px; text-align: center;">
        <div style="font-size: 28px; font-weight: 800; color: #065f46;">S: 58</div>
        <div style="font-size: 13px; color: #064e3b; font-weight: 600;">安定型</div>
      </div>
    </div>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.7; margin-bottom: 12px;">
      IS型の組み合わせは「<strong>温かいファシリテーター</strong>」タイプです。人を巻き込み（I）ながらも、チーム全体の調和を保つ（S）ことに長けています。
    </p>
    <div style="background: #f8fafc; border-radius: 8px; padding: 16px;">
      <h4 style="font-size: 14px; color: #1f2937; margin: 0 0 8px;">チーム内での役割</h4>
      <ul style="font-size: 14px; color: #4b5563; padding-left: 16px; margin: 0; line-height: 1.8;">
        <li>アイデアの発信と合意形成の橋渡し</li>
        <li>メンバーのモチベーション管理</li>
        <li>対外的なプレゼンテーション・交渉</li>
        <li>チームの雰囲気づくりと衝突の仲裁</li>
      </ul>
    </div>
  </div>

  <!-- 行動パターン -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #6366F1; margin: 0 0 16px;">行動パターンと傾向</h2>
    <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
      <div style="background: #f8fafc; border-left: 4px solid #6366F1; padding: 16px;">
        <h4 style="font-size: 14px; color: #1f2937; margin: 0 0 6px;">意思決定スタイル</h4>
        <p style="font-size: 14px; color: #4b5563; margin: 0; line-height: 1.7;">
          直感と分析のハイブリッド型。まず直感で方向性を定め、その後データや論理で検証するアプローチを取ります。重要な決断ほど、信頼できる人に相談してから行動する傾向があります。
        </p>
      </div>
      <div style="background: #f8fafc; border-left: 4px solid #8B5CF6; padding: 16px;">
        <h4 style="font-size: 14px; color: #1f2937; margin: 0 0 6px;">学習パターン</h4>
        <p style="font-size: 14px; color: #4b5563; margin: 0; line-height: 1.7;">
          概念理解 → 実践 → 教える のサイクルが最も効果的。特に「他者に教える」プロセスで理解が深まるタイプです。独学も可能ですが、ディスカッション型の学習でより力を発揮します。
        </p>
      </div>
      <div style="background: #f8fafc; border-left: 4px solid #3B82F6; padding: 16px;">
        <h4 style="font-size: 14px; color: #1f2937; margin: 0 0 6px;">ストレス対処</h4>
        <p style="font-size: 14px; color: #4b5563; margin: 0; line-height: 1.7;">
          普段は落ち着いた対処ができますが、「他者からの期待に応えられない」と感じた時にストレスが急増する傾向。一人の時間を確保し、創造的な活動（読書・音楽・アート）で回復するパターンが見られます。
        </p>
      </div>
    </div>
  </div>

  <!-- 強みと成長 -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #6366F1; margin: 0 0 16px;">強みと成長領域</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div style="background: #f0fdf4; border-radius: 12px; padding: 20px;">
        <h3 style="font-size: 16px; color: #166534; margin: 0 0 12px;">💪 トップ5の強み</h3>
        <ol style="font-size: 14px; color: #15803d; padding-left: 18px; margin: 0; line-height: 2;">
          <li>知的好奇心と学習意欲（開放性91%）</li>
          <li>目標達成への執着力（誠実性88%）</li>
          <li>美的・文化的感受性（開放性85%）</li>
          <li>自己管理能力（誠実性80%）</li>
          <li>共感と傾聴力（協調性70%）</li>
        </ol>
      </div>
      <div style="background: #fffbeb; border-radius: 12px; padding: 20px;">
        <h3 style="font-size: 16px; color: #92400e; margin: 0 0 12px;">🌱 成長のための3つの課題</h3>
        <ol style="font-size: 14px; color: #a16207; padding-left: 18px; margin: 0; line-height: 2;">
          <li>完璧主義と「十分」の感覚のバランス</li>
          <li>人に委ねる力（デリゲーション）</li>
          <li>短期的な楽しさへの許容</li>
        </ol>
      </div>
    </div>
  </div>

  <!-- キャリア -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #6366F1; margin: 0 0 16px;">キャリア適性と仕事スタイル</h2>
    <div style="margin-bottom: 16px;">
      <h3 style="font-size: 15px; color: #1f2937; margin: 0 0 8px;">推薦される職種カテゴリ</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px;">
        <span style="background: #eff6ff; color: #1e40af; font-size: 12px; padding: 4px 10px; border-radius: 12px;">教育・研修</span>
        <span style="background: #f5f3ff; color: #6d28d9; font-size: 12px; padding: 4px 10px; border-radius: 12px;">戦略コンサルティング</span>
        <span style="background: #ecfdf5; color: #065f46; font-size: 12px; padding: 4px 10px; border-radius: 12px;">UXデザイン</span>
        <span style="background: #fef3c7; color: #92400e; font-size: 12px; padding: 4px 10px; border-radius: 12px;">プロダクトマネジメント</span>
        <span style="background: #fce7f3; color: #9d174d; font-size: 12px; padding: 4px 10px; border-radius: 12px;">心理カウンセリング</span>
        <span style="background: #f0f9ff; color: #0c4a6e; font-size: 12px; padding: 4px 10px; border-radius: 12px;">コーチング</span>
      </div>
    </div>
    <div style="background: #f8fafc; border-radius: 8px; padding: 16px;">
      <h4 style="font-size: 14px; color: #1f2937; margin: 0 0 8px;">理想の職場環境</h4>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.7; margin: 0;">
        自律性が高く、創造的な挑戦が推奨される環境。フラットな組織構造で、多様なバックグラウンドを持つメンバーとの協働がある職場が最適です。ルーティンワーク中心の環境ではモチベーションが低下しやすいため、プロジェクトベースの働き方が合っています。
      </p>
    </div>
  </div>

  <!-- 人間関係 -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #6366F1; margin: 0 0 16px;">人間関係とコミュニケーション</h2>
    <p style="font-size: 14px; color: #4b5563; line-height: 1.8;">
      あなたのコミュニケーションスタイルは<strong>「温かく知的」</strong>。相手の話に深く耳を傾け、本質的な問いかけで会話を深められます。初対面でも自然に場を和ませる力がありますが、真に心を開くまでには時間がかかる傾向も。大勢の前でのプレゼンテーションは得意ですが、その後の懇親会では疲労を感じやすい「社交的内向性」の特徴を持っています。
    </p>
    <div style="background: #faf5ff; border-radius: 8px; padding: 16px; margin-top: 12px;">
      <h4 style="font-size: 14px; color: #6d28d9; margin: 0 0 6px;">相性の良いタイプ</h4>
      <p style="font-size: 14px; color: #7c3aed; margin: 0;">INFP, INFJ, INTJ, ENFP — 知的な深い対話を楽しめるタイプと特に相性が良いです。</p>
    </div>
  </div>

  <!-- 自己開発ロードマップ -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #6366F1; margin: 0 0 16px;">3ヶ月 自己開発ロードマップ</h2>
    <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
      <div style="background: #eff6ff; border-radius: 8px; padding: 16px;">
        <h4 style="font-size: 14px; color: #1e40af; margin: 0 0 6px;">Month 1: 自己認識の深化</h4>
        <p style="font-size: 13px; color: #1d4ed8; margin: 0; line-height: 1.7;">
          毎日5分のジャーナリング。感情と思考を記録し、パターンを発見する。週末に1つ「初めて」の体験をする。
        </p>
      </div>
      <div style="background: #f5f3ff; border-radius: 8px; padding: 16px;">
        <h4 style="font-size: 14px; color: #6d28d9; margin: 0 0 6px;">Month 2: コミュニケーション実験</h4>
        <p style="font-size: 13px; color: #7c3aed; margin: 0; line-height: 1.7;">
          「No」を週に2回意識的に練習する。1対1の深い対話の時間を週3回設ける。フィードバックを求める習慣づけ。
        </p>
      </div>
      <div style="background: #ecfdf5; border-radius: 8px; padding: 16px;">
        <h4 style="font-size: 14px; color: #065f46; margin: 0 0 6px;">Month 3: 統合と実践</h4>
        <p style="font-size: 13px; color: #047857; margin: 0; line-height: 1.7;">
          学んだことをメンタリングに活かす。自分の「エネルギー管理」ルーティンを確立する。3ヶ月の振り返りを行い次の目標を設定。
        </p>
      </div>
    </div>
  </div>

  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>※ このレポートはAIによる自動分析です。専門家の診断に代わるものではありません。</p>
    <p>Big Five 性格診断 プレミアムレポート（本格版） — makers.tokyo</p>
  </div>
</div>
`;

// ===============================
// 詳細診断サンプルレポート（抜粋）
// ===============================
const DETAILED_REPORT = `
<div style="font-family: 'Noto Sans JP', sans-serif; max-width: 800px; margin: 0 auto; color: #1a1a2e;">

  <!-- ヘッダー -->
  <div style="background: linear-gradient(135deg, #f59e0b, #d97706, #b45309); color: white; padding: 40px 32px; border-radius: 16px; margin-bottom: 32px; text-align: center;">
    <div style="font-size: 11px; letter-spacing: 2px; text-transform: uppercase; opacity: 0.8; margin-bottom: 8px;">COMPREHENSIVE PERSONALITY ANALYSIS</div>
    <h1 style="font-size: 28px; font-weight: 800; margin: 0 0 8px;">Big Five × エニアグラム 総合パーソナリティレポート</h1>
    <p style="font-size: 14px; opacity: 0.85; margin: 0;">詳細診断（145問）AIプレミアムレポート — 完全版</p>
  </div>

  <!-- 目次 -->
  <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 18px; color: #92400e; margin: 0 0 12px;">📋 目次</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 13px; color: #78350f; line-height: 1.8;">
      <div>1. エグゼクティブサマリー</div>
      <div>8. Big Five × エニアグラム統合分析</div>
      <div>2. パーソナリティマップ</div>
      <div>9. 行動パターンと深層心理</div>
      <div>3. 5特性の詳細分析（30ファセット）</div>
      <div>10. 強みと成長領域</div>
      <div>4. 30ファセット クロス分析</div>
      <div>11. キャリア適性と仕事スタイル</div>
      <div>5. 16パーソナリティタイプ深層分析</div>
      <div>12. 人間関係とコミュニケーション</div>
      <div>6. DISC行動スタイル詳細分析</div>
      <div>13. ストレス管理とウェルビーイング</div>
      <div>7. エニアグラム総合分析</div>
      <div>14. 6ヶ月自己開発ロードマップ</div>
    </div>
  </div>

  <!-- エグゼクティブサマリー -->
  <div style="background: linear-gradient(135deg, #fffbeb, #fef3c7); border: 1px solid #fde68a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #b45309; margin: 0 0 12px;">1. エグゼクティブサマリー</h2>
    <p style="line-height: 1.8; color: #374151; font-size: 15px;">
      145問の詳細診断により、あなたの性格プロファイルが高解像度で浮かび上がりました。Big Fiveでは<strong>「高い開放性（82%）× 高い誠実性（75%）」</strong>という稀有な組み合わせが最大の特徴です。通常、創造性（開放性）と計画性（誠実性）は相反する傾向がありますが、あなたはこの両方を高いレベルで両立しています。エニアグラムの結果では<strong>タイプ5（探求者）ウィング4</strong>と判定され、「知識を深く追求しながらも、独自の美的感覚で表現する」という特性が確認されました。Big Fiveの知的好奇心91%と、エニアグラム5w4の組み合わせは、研究者・クリエイター・イノベーターに多く見られるパターンであり、あなたの「思考と創造の統合力」は際立った才能と言えるでしょう。16パーソナリティタイプENFJとの掛け合わせにより、この深い内的世界を他者と共有し、人々を導く力も兼ね備えています。
    </p>
  </div>

  <!-- パーソナリティマップ -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #b45309; margin: 0 0 16px;">2. パーソナリティマップ</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
      <div style="text-align: center;">
        <h4 style="font-size: 14px; color: #6b7280; margin: 0 0 8px;">Big Five レーダーチャート</h4>
        <svg viewBox="0 0 300 300" width="260" height="260">
          <polygon points="150,30 271,118 225,255 75,255 29,118" fill="none" stroke="#e2e8f0" stroke-width="1"/>
          <polygon points="150,66 247,136 210,241 90,241 53,136" fill="none" stroke="#e2e8f0" stroke-width="1"/>
          <polygon points="150,102 223,155 195,226 105,226 77,155" fill="none" stroke="#e2e8f0" stroke-width="1"/>
          <polygon points="150,48 259,127 218,248 82,248 41,127" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" stroke-width="2.5"/>
          <text x="150" y="18" text-anchor="middle" fill="#374151" font-size="11" font-weight="600">O 82%</text>
          <text x="285" y="120" text-anchor="start" fill="#374151" font-size="11" font-weight="600">C 75%</text>
          <text x="235" y="270" text-anchor="middle" fill="#374151" font-size="11" font-weight="600">E 58%</text>
          <text x="65" y="270" text-anchor="middle" fill="#374151" font-size="11" font-weight="600">A 65%</text>
          <text x="15" y="120" text-anchor="end" fill="#374151" font-size="11" font-weight="600">N 42%</text>
        </svg>
      </div>
      <div style="text-align: center;">
        <h4 style="font-size: 14px; color: #6b7280; margin: 0 0 8px;">エニアグラム プロファイル</h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; padding: 10px;">
          <div style="background: #fef3c7; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 11px; color: #92400e;">タイプ1</div>
            <div style="font-size: 15px; font-weight: 700; color: #b45309;">52%</div>
          </div>
          <div style="background: #fef3c7; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 11px; color: #92400e;">タイプ2</div>
            <div style="font-size: 15px; font-weight: 700; color: #b45309;">45%</div>
          </div>
          <div style="background: #fef3c7; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 11px; color: #92400e;">タイプ3</div>
            <div style="font-size: 15px; font-weight: 700; color: #b45309;">58%</div>
          </div>
          <div style="background: #fef3c7; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 11px; color: #92400e;">タイプ4</div>
            <div style="font-size: 15px; font-weight: 700; color: #b45309;">72%</div>
          </div>
          <div style="background: #f59e0b; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 11px; color: white;">タイプ5 ★</div>
            <div style="font-size: 15px; font-weight: 700; color: white;">85%</div>
          </div>
          <div style="background: #fef3c7; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 11px; color: #92400e;">タイプ6</div>
            <div style="font-size: 15px; font-weight: 700; color: #b45309;">48%</div>
          </div>
          <div style="background: #fef3c7; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 11px; color: #92400e;">タイプ7</div>
            <div style="font-size: 15px; font-weight: 700; color: #b45309;">62%</div>
          </div>
          <div style="background: #fef3c7; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 11px; color: #92400e;">タイプ8</div>
            <div style="font-size: 15px; font-weight: 700; color: #b45309;">38%</div>
          </div>
          <div style="background: #fef3c7; border-radius: 8px; padding: 8px; text-align: center;">
            <div style="font-size: 11px; color: #92400e;">タイプ9</div>
            <div style="font-size: 15px; font-weight: 700; color: #b45309;">55%</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 30ファセット一覧（抜粋） -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #b45309; margin: 0 0 4px;">3. 5特性の詳細分析（30ファセット）</h2>
    <p style="font-size: 13px; color: #9ca3af; margin: 0 0 16px;">各特性を構成する6つのファセットを個別に分析</p>

    <!-- 開放性 -->
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 17px; color: #7c3aed; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #ede9fe;">🔮 開放性 — 82%（高い）</h3>
      <div style="display: grid; grid-template-columns: 1fr; gap: 8px; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 13px; color: #6b7280; width: 90px; flex-shrink: 0;">知的好奇心</span>
          <div style="flex: 1; background: #f3f4f6; border-radius: 4px; height: 20px; position: relative;">
            <div style="background: linear-gradient(90deg, #8b5cf6, #a78bfa); height: 100%; width: 91%; border-radius: 4px;"></div>
            <span style="position: absolute; right: 8px; top: 2px; font-size: 11px; font-weight: 700; color: #5b21b6;">91%</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 13px; color: #6b7280; width: 90px; flex-shrink: 0;">美的感受性</span>
          <div style="flex: 1; background: #f3f4f6; border-radius: 4px; height: 20px; position: relative;">
            <div style="background: linear-gradient(90deg, #8b5cf6, #a78bfa); height: 100%; width: 85%; border-radius: 4px;"></div>
            <span style="position: absolute; right: 8px; top: 2px; font-size: 11px; font-weight: 700; color: #5b21b6;">85%</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 13px; color: #6b7280; width: 90px; flex-shrink: 0;">感情の豊かさ</span>
          <div style="flex: 1; background: #f3f4f6; border-radius: 4px; height: 20px; position: relative;">
            <div style="background: linear-gradient(90deg, #8b5cf6, #a78bfa); height: 100%; width: 82%; border-radius: 4px;"></div>
            <span style="position: absolute; right: 8px; top: 2px; font-size: 11px; font-weight: 700; color: #5b21b6;">82%</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 13px; color: #6b7280; width: 90px; flex-shrink: 0;">冒険心</span>
          <div style="flex: 1; background: #f3f4f6; border-radius: 4px; height: 20px; position: relative;">
            <div style="background: linear-gradient(90deg, #8b5cf6, #a78bfa); height: 100%; width: 80%; border-radius: 4px;"></div>
            <span style="position: absolute; right: 8px; top: 2px; font-size: 11px; font-weight: 700; color: #5b21b6;">80%</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 13px; color: #6b7280; width: 90px; flex-shrink: 0;">価値観の柔軟性</span>
          <div style="flex: 1; background: #f3f4f6; border-radius: 4px; height: 20px; position: relative;">
            <div style="background: linear-gradient(90deg, #8b5cf6, #a78bfa); height: 100%; width: 78%; border-radius: 4px;"></div>
            <span style="position: absolute; right: 8px; top: 2px; font-size: 11px; font-weight: 700; color: #5b21b6;">78%</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 13px; color: #6b7280; width: 90px; flex-shrink: 0;">空想力</span>
          <div style="flex: 1; background: #f3f4f6; border-radius: 4px; height: 20px; position: relative;">
            <div style="background: linear-gradient(90deg, #8b5cf6, #a78bfa); height: 100%; width: 68%; border-radius: 4px;"></div>
            <span style="position: absolute; right: 8px; top: 2px; font-size: 11px; font-weight: 700; color: #5b21b6;">68%</span>
          </div>
        </div>
      </div>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.7;">
        知的好奇心（91%）と空想力（68%）の差は23ポイント。これは「夢想するよりも、実際に調べ、検証し、学ぶ」タイプの創造性を示しています。エニアグラムタイプ5の「体系的に知識を蓄積する」欲求と完全に一致しており、あなたの創造性は<strong>「根拠のある革新」</strong>として発揮されます。
      </p>
    </div>

    <p style="font-size: 13px; color: #9ca3af; text-align: center;">
      ※ 誠実性・外向性・協調性・神経症傾向の詳細分析は省略（実際のレポートでは全30ファセットを個別分析します）
    </p>
  </div>

  <!-- エニアグラム総合分析 -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #b45309; margin: 0 0 16px;">7. エニアグラム総合分析</h2>

    <div style="background: linear-gradient(135deg, #fffbeb, #fef3c7); border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; gap: 16px;">
        <div style="width: 64px; height: 64px; background: linear-gradient(135deg, #f59e0b, #d97706); border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span style="font-size: 28px; font-weight: 800; color: white;">5</span>
        </div>
        <div>
          <h3 style="font-size: 18px; color: #92400e; margin: 0 0 4px;">タイプ5 — 探求者（The Investigator）</h3>
          <p style="font-size: 14px; color: #a16207; margin: 0;">ウィング4 — 「独創的な思索家」</p>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="font-size: 16px; color: #1f2937; margin: 0 0 8px;">深層心理と動機</h3>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.8;">
        タイプ5の根源的な動機は<strong>「世界を理解し、自分の内的リソースを守ること」</strong>です。あなたは情報を集め、分析し、体系化することで安心感を得ます。ウィング4の影響により、単なる知識の蓄積ではなく、<strong>「独自の美的感覚で知識を再構成する」</strong>創造的な知性が特徴です。Big Fiveの美的感受性85%がこのウィング4の特性を裏付けています。
      </p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
      <div style="background: #ecfdf5; border-radius: 8px; padding: 16px;">
        <h4 style="font-size: 14px; color: #065f46; margin: 0 0 8px;">⬆️ 統合の方向（タイプ8へ）</h4>
        <p style="font-size: 13px; color: #047857; line-height: 1.7; margin: 0;">
          成長時、あなたはタイプ8の行動力を獲得します。知識を「行動」に変え、リーダーシップを発揮できるようになります。ENFJの特性と合わさると、<strong>知識に裏付けられた力強いビジョンを示すリーダー</strong>として開花します。
        </p>
      </div>
      <div style="background: #fef2f2; border-radius: 8px; padding: 16px;">
        <h4 style="font-size: 14px; color: #991b1b; margin: 0 0 8px;">⬇️ 後退の方向（タイプ7へ）</h4>
        <p style="font-size: 13px; color: #b91c1c; line-height: 1.7; margin: 0;">
          ストレス過多時、タイプ7の散漫さが出現します。一つのテーマを深める代わりに、新しいものに次々と手を出す「知的逃避」のパターンに陥りがちです。Big Fiveの知的好奇心91%が「健全な探求」と「逃避的な散漫」の両方に振れる可能性を示しています。
        </p>
      </div>
    </div>

    <div style="margin-bottom: 16px;">
      <h3 style="font-size: 16px; color: #1f2937; margin: 0 0 8px;">トライアド分析: 思考グループ（5-6-7）</h3>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.7;">
        あなたは思考トライアドに属し、<strong>「恐れ」</strong>を基底感情としています。ただし、タイプ5の恐れは「無能さ」と「外的世界に圧倒されること」への恐れであり、それが「十分な知識を蓄えてから行動する」という慎重さとして現れます。Big Fiveの誠実性75%（特に思慮深さ72%）がこの「準備を重視する」姿勢と一致しています。
      </p>
    </div>
  </div>

  <!-- Big Five × エニアグラム統合分析 -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #b45309; margin: 0 0 16px;">8. Big Five × エニアグラム統合分析</h2>

    <div style="background: linear-gradient(135deg, #fef3c7, #ede9fe); border-radius: 12px; padding: 20px; margin-bottom: 16px;">
      <h3 style="font-size: 16px; color: #1f2937; margin: 0 0 8px;">あなたのユニークな組み合わせ</h3>
      <p style="font-size: 14px; color: #4b5563; line-height: 1.8; margin: 0;">
        <strong>ENFJ × タイプ5w4 × 高開放性・高誠実性</strong> — この組み合わせは非常に稀少です。通常、タイプ5は内向的（I）傾向が強いのですが、あなたはENFJの外向的感情（Fe）主機能を持っています。これは「<strong>深い知識を持ちながら、それを人々のために使いたい</strong>」という独特の動機パターンを生み出しています。学者でありながらリーダー、研究者でありながら教育者——という二面性が、あなたの最大の個性です。
      </p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
      <div style="background: #f8fafc; border-left: 4px solid #f59e0b; padding: 16px;">
        <h4 style="font-size: 14px; color: #1f2937; margin: 0 0 6px;">一致するパターン</h4>
        <p style="font-size: 14px; color: #4b5563; margin: 0; line-height: 1.7;">
          Big Five開放性82% ↔ エニアグラム5型の知識欲：両方とも知的探求の強さを示す。誠実性75% ↔ 5型の体系化欲求：知識を整理し構造化する力。
        </p>
      </div>
      <div style="background: #f8fafc; border-left: 4px solid #8B5CF6; padding: 16px;">
        <h4 style="font-size: 14px; color: #1f2937; margin: 0 0 6px;">興味深い緊張関係</h4>
        <p style="font-size: 14px; color: #4b5563; margin: 0; line-height: 1.7;">
          ENFJ（人を導きたい）↔ タイプ5（一人で探求したい）：この内的な緊張は、「教える」「メンタリングする」ことで昇華されます。知識を独占せず共有することで、両方のニーズが満たされます。
        </p>
      </div>
      <div style="background: #f8fafc; border-left: 4px solid #10b981; padding: 16px;">
        <h4 style="font-size: 14px; color: #1f2937; margin: 0 0 6px;">成長のための統合ポイント</h4>
        <p style="font-size: 14px; color: #4b5563; margin: 0; line-height: 1.7;">
          「十分な準備ができてから行動する」という5型の傾向と、「今すぐ人を助けたい」というENFJの衝動のバランスを意識することが鍵です。Big Fiveの神経症傾向42%は比較的安定しており、この内的葛藤をうまく管理できる素地があります。
        </p>
      </div>
    </div>
  </div>

  <!-- ストレス管理 -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #b45309; margin: 0 0 16px;">13. ストレス管理とウェルビーイング</h2>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
      <div style="background: #fef2f2; border-radius: 8px; padding: 16px;">
        <h4 style="font-size: 14px; color: #991b1b; margin: 0 0 8px;">🚨 ストレスシグナル</h4>
        <ul style="font-size: 13px; color: #b91c1c; padding-left: 14px; margin: 0; line-height: 1.8;">
          <li>人との接触を急に避け始める</li>
          <li>新しいことに手を出して集中できなくなる</li>
          <li>「もっと情報が必要」と行動を先延ばしする</li>
          <li>他者への共感力が低下し、批判的になる</li>
        </ul>
      </div>
      <div style="background: #ecfdf5; border-radius: 8px; padding: 16px;">
        <h4 style="font-size: 14px; color: #065f46; margin: 0 0 8px;">💚 回復パターン</h4>
        <ul style="font-size: 13px; color: #047857; padding-left: 14px; margin: 0; line-height: 1.8;">
          <li>一人で没頭できる知的活動（読書・研究）</li>
          <li>自然の中での散歩や瞑想</li>
          <li>信頼できる1-2人との深い対話</li>
          <li>芸術的活動（音楽・絵・写真）</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- 6ヶ月ロードマップ -->
  <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
    <h2 style="font-size: 20px; color: #b45309; margin: 0 0 16px;">14. 6ヶ月 自己開発ロードマップ</h2>
    <div style="display: grid; grid-template-columns: 1fr; gap: 12px;">
      <div style="background: #eff6ff; border-radius: 8px; padding: 16px;">
        <h4 style="font-size: 14px; color: #1e40af; margin: 0 0 4px;">Month 1-2: 内的探求</h4>
        <p style="font-size: 13px; color: #1d4ed8; margin: 0; line-height: 1.6;">
          毎日10分のジャーナリング。エニアグラム5型の「引きこもり」パターンに気づく練習。感情を言語化するトレーニング。
        </p>
      </div>
      <div style="background: #f5f3ff; border-radius: 8px; padding: 16px;">
        <h4 style="font-size: 14px; color: #6d28d9; margin: 0 0 4px;">Month 3-4: 行動実験</h4>
        <p style="font-size: 13px; color: #7c3aed; margin: 0; line-height: 1.6;">
          「70%の準備で行動する」実験を週1回。タイプ8（統合方向）の行動力を意識的に練習。小さなリーダーシップ機会を探す。
        </p>
      </div>
      <div style="background: #ecfdf5; border-radius: 8px; padding: 16px;">
        <h4 style="font-size: 14px; color: #065f46; margin: 0 0 4px;">Month 5-6: 統合と展開</h4>
        <p style="font-size: 13px; color: #047857; margin: 0; line-height: 1.6;">
          Big Five×エニアグラムの理解を日常に活かす。メンタリングやコーチングの機会を作る。6ヶ月の振り返りと次の目標設定。
        </p>
      </div>
    </div>
  </div>

  <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>※ このレポートはAIによる自動分析です。専門家の診断に代わるものではありません。</p>
    <p>※ 本サンプルは抜粋版です。実際のレポートでは全14セクション（25〜30ページ）が含まれます。</p>
    <p>Big Five × エニアグラム 総合パーソナリティレポート（完全版） — makers.tokyo</p>
  </div>
</div>
`;

const REPORTS: Record<Tier, string> = {
  simple: SIMPLE_REPORT,
  full: FULL_REPORT,
  detailed: DETAILED_REPORT,
};

export default function SampleReportsPage() {
  const [activeTier, setActiveTier] = useState<Tier>('simple');
  const [expandedTier, setExpandedTier] = useState<Tier | null>('simple');
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    supabase?.auth.getUser().then(({ data }) => {
      if (data?.user) setUser(data.user);
    });
  }, []);

  return (
    <>
      <Header
        user={user}
        onLogout={async () => { await supabase?.auth.signOut(); setUser(null); }}
        setShowAuth={setShowAuth}
      />
      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          {/* ヘッダー */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Crown className="w-7 h-7 text-yellow-500" />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">AIプレミアムレポート サンプル</h1>
            </div>
            <p className="text-gray-600 text-sm sm:text-base">
              各診断コースのレポート内容をご確認いただけます
            </p>
          </div>

          {/* ティア切替 */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {(['simple', 'full', 'detailed'] as Tier[]).map((tier) => {
              const info = TIER_INFO[tier];
              const isActive = activeTier === tier;
              return (
                <button
                  key={tier}
                  onClick={() => { setActiveTier(tier); setExpandedTier(tier); }}
                  className={`relative p-4 rounded-xl border transition-all text-center ${
                    isActive
                      ? 'border-gray-400 bg-white shadow-md'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-bold text-gray-900">{info.label}</div>
                  <div className={`text-lg font-bold bg-gradient-to-r ${info.gradient} bg-clip-text text-transparent`}>
                    {info.price}
                  </div>
                  <div className="text-xs text-gray-500">{info.pages}</div>
                </button>
              );
            })}
          </div>

          {/* レポート表示 */}
          {(['simple', 'full', 'detailed'] as Tier[]).map((tier) => {
            const info = TIER_INFO[tier];
            const isExpanded = expandedTier === tier;
            return (
              <div key={tier} className="mb-4">
                <button
                  onClick={() => setExpandedTier(isExpanded ? null : tier)}
                  className="w-full flex items-center justify-between p-4 bg-white border border-gray-300 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3">
                    <FileText className={`w-5 h-5 text-${info.color}-500`} />
                    <span className="font-bold text-gray-900">{info.label}レポート</span>
                    <span className="text-sm text-gray-500">（{info.price} / {info.pages}）</span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>

                {isExpanded && (
                  <div className="mt-2 bg-white border border-gray-200 rounded-xl shadow-md p-4 sm:p-6 overflow-x-auto">
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: REPORTS[tier] }}
                    />
                  </div>
                )}
              </div>
            );
          })}

          {/* CTA */}
          <div className="mt-10 text-center">
            <Link
              href="/bigfive"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              無料で診断を始める
            </Link>
            <p className="text-xs text-gray-400 mt-2">診断は無料 — レポートは購入者のみ</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
