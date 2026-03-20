'use client';

import { ReactNode } from 'react';
import { ArrowRight, Sparkles, Check, ChevronRight, Crown, Headset } from 'lucide-react';
import HomeAuthProvider from '@/components/home/HomeAuthProvider';
import { AuthCTAButton } from '@/components/home/HomeClientButtons';
import type { LucideIcon } from 'lucide-react';

export interface PersonaStep {
  number: number;
  title: string;
  description: string;
  toolName: string;
  toolDescription: string;
  toolUrl: string;
  icon: LucideIcon;
  color: string;
}

export interface UpgradeFeature {
  text: string;
  plan: string; // 例: 'Standard' | 'Business'
}

export interface PersonaTestimonial {
  before: string;
  after: string;
  persona: string;
}

export interface SupportPackItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface SupportPackProps {
  packName: string;
  packDescription: string;
  includes: SupportPackItem[];
  personaSlug: string;
}

export interface PersonaLPProps {
  // ヒーロー
  badge: string;
  headline: ReactNode;
  headlinePlainText: string; // SEO用プレーンテキスト
  subheadline: string;
  heroColor: string;
  heroBgGradient: string;

  // 共感（課題）
  empathyTitle: string;
  empathyItems: string[];

  // ベネフィット（理想の世界）
  benefitTitle: ReactNode;
  benefitDescription: string;
  benefits: { icon: LucideIcon; title: string; description: string }[];

  // 3ステップ（ツール紹介）
  stepsTitle: string;
  stepsDescription: string;
  steps: PersonaStep[];

  // ビフォーアフター
  testimonial: PersonaTestimonial;

  // 他のタイプへのリンク
  otherTypes: { label: string; href: string; color: string }[];

  // サポートパック
  supportPack?: SupportPackProps;

  // 有料プラン誘導
  freeFeatures?: string[];
  upgradeFeatures?: UpgradeFeature[];

  // SEO
  faqItems?: { question: string; answer: string }[];
  breadcrumbLabel: string;
  breadcrumbSlug: string;

  // SubBrandLPLayout使用時はHomeAuthProviderをスキップ
  skipAuthProvider?: boolean;
}

export default function PersonaLPLayout({
  badge,
  headline,
  headlinePlainText,
  subheadline,
  heroColor,
  heroBgGradient,
  empathyTitle,
  empathyItems,
  benefitTitle,
  benefitDescription,
  benefits,
  stepsTitle,
  stepsDescription,
  steps,
  testimonial,
  otherTypes,
  supportPack,
  freeFeatures,
  upgradeFeatures,
  faqItems,
  breadcrumbLabel,
  breadcrumbSlug,
  skipAuthProvider = false,
}: PersonaLPProps) {
  const siteUrl = 'https://makers.tokyo';

  // 構造化データ: BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: '集客メーカー', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: breadcrumbLabel, item: `${siteUrl}/for/${breadcrumbSlug}` },
    ],
  };

  // 構造化データ: FAQPage
  const faqSchema = faqItems && faqItems.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  } : null;

  // 構造化データ: HowTo (ステップ)
  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: stepsTitle,
    description: stepsDescription,
    step: steps.map((s) => ({
      '@type': 'HowToStep',
      position: s.number,
      name: s.title,
      text: s.description,
      itemListElement: {
        '@type': 'HowToTool',
        name: s.toolName,
      },
    })),
  };

  const Wrapper = skipAuthProvider ? ({ children }: { children: ReactNode }) => <>{children}</> : HomeAuthProvider;

  return (
    <Wrapper>
      {/* 構造化データ */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

      {/* ========== Hero ========== */}
      <section
        className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden"
        style={{ background: heroBgGradient }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(${heroColor}40 1px, transparent 1px)`, backgroundSize: '40px 40px', opacity: 0.08 }} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div
            className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-white/80 backdrop-blur text-sm font-bold mb-8 border shadow-sm"
            style={{ color: heroColor, borderColor: `${heroColor}40` }}
          >
            <Sparkles size={16} />
            {badge}
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-6" style={{ color: '#5d4037' }} data-speakable>
            {headline}
          </h1>

          <p className="text-base md:text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed" data-speakable>
            {subheadline}
          </p>

          <AuthCTAButton
            className="text-white text-lg font-bold py-4 px-10 rounded-full shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl inline-flex items-center gap-2"
            style={{ backgroundColor: heroColor }}
          >
            <Sparkles size={20} />
            無料で始める
          </AuthCTAButton>
          <p className="text-xs text-gray-500 mt-3">※ クレジットカード不要・30秒で登録完了</p>
        </div>
      </section>

      {/* ========== 共感セクション ========== */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-10" style={{ color: '#5d4037' }} data-speakable>
            {empathyTitle}
          </h2>
          <div className="space-y-3">
            {empathyItems.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-xl border"
                style={{ backgroundColor: `${heroColor}08`, borderColor: `${heroColor}20` }}
              >
                <span style={{ color: heroColor }} className="mt-0.5 flex-shrink-0">●</span>
                <span className="text-gray-700 text-sm font-medium leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-lg font-bold" style={{ color: '#5d4037' }}>
              それ、<span style={{ color: heroColor }}>仕組みで解決</span>できます。
            </p>
          </div>
        </div>
      </section>

      {/* ========== ベネフィット（理想の世界） ========== */}
      <section className="py-20" style={{ backgroundColor: '#fffbf0' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-black mb-4" style={{ color: '#5d4037' }} data-speakable>
              {benefitTitle}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto" data-speakable>{benefitDescription}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((b, i) => {
              const Icon = b.icon;
              return (
                <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300 text-center group">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition"
                    style={{ backgroundColor: `${heroColor}15`, color: heroColor }}
                  >
                    <Icon size={32} />
                  </div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: '#5d4037' }}>{b.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed" data-speakable>{b.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== あなた専用の3ステップ（ツール紹介） ========== */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
              style={{ backgroundColor: `${heroColor}15`, color: heroColor }}
            >
              あなた専用の集客ステップ
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-4" style={{ color: '#5d4037' }} data-speakable>
              {stepsTitle}
            </h2>
            <p className="text-gray-600" data-speakable>{stepsDescription}</p>
          </div>

          <div className="space-y-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative">
                  {i < steps.length - 1 && (
                    <div
                      className="absolute left-8 top-full w-0.5 h-8 hidden md:block"
                      style={{ backgroundColor: `${heroColor}30` }}
                    />
                  )}
                  <div className="flex items-start gap-6 p-6 sm:p-8 rounded-3xl border border-gray-100 bg-white hover:shadow-lg transition-all duration-300">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-xl font-black shadow-lg"
                      style={{ backgroundColor: step.color }}
                    >
                      {step.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#5d4037' }}>{step.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3" data-speakable>{step.description}</p>
                      <a
                        href={step.toolUrl}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                        style={{ color: step.color, borderColor: `${step.color}40`, backgroundColor: `${step.color}08` }}
                      >
                        <Icon size={16} />
                        {step.toolName}
                        <span className="text-gray-400 text-xs">— {step.toolDescription}</span>
                        <ArrowRight size={14} className="opacity-50" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== ビフォーアフター ========== */}
      <section className="py-20" style={{ backgroundColor: '#fffbf0' }}>
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-10" style={{ color: '#5d4037' }}>
            こんな変化が起きています
          </h2>
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-lg">
            <div className="grid md:grid-cols-2">
              <div className="p-8 border-b md:border-b-0 md:border-r border-gray-100">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold mb-4">
                  BEFORE
                </div>
                <p className="text-gray-600 leading-relaxed text-sm">{testimonial.before}</p>
              </div>
              <div className="p-8" style={{ backgroundColor: `${heroColor}05` }}>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4"
                  style={{ backgroundColor: `${heroColor}15`, color: heroColor }}
                >
                  AFTER
                </div>
                <p className="text-gray-700 leading-relaxed text-sm font-medium" data-speakable>{testimonial.after}</p>
              </div>
            </div>
            <div className="px-8 py-4 border-t border-gray-100 text-center">
              <span className="text-xs text-gray-400">{testimonial.persona}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== サポートパック ========== */}
      {supportPack && (
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-10">
              <div
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4"
                style={{ backgroundColor: `${heroColor}15`, color: heroColor }}
              >
                <Headset size={16} />
                プロのサポート
              </div>
              <h2 className="text-2xl md:text-3xl font-black mb-4" style={{ color: '#5d4037' }}>
                プロと一緒に、最短で<br className="sm:hidden" />仕組みをつくりませんか？
              </h2>
              <p className="text-gray-600">
                {supportPack.packDescription}
              </p>
            </div>

            <div className="p-8 rounded-3xl border-2 relative overflow-hidden" style={{ borderColor: heroColor, backgroundColor: `${heroColor}05` }}>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10" style={{ backgroundColor: heroColor }} />
              <div className="relative z-10">
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-6"
                  style={{ backgroundColor: `${heroColor}15`, color: heroColor }}
                >
                  {supportPack.packName}
                </div>

                <div className="space-y-4 mb-8">
                  {supportPack.includes.map((item, i) => {
                    const ItemIcon = item.icon;
                    return (
                      <div key={i} className="flex items-start gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ backgroundColor: `${heroColor}15`, color: heroColor }}
                        >
                          <ItemIcon size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: '#5d4037' }}>{item.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center">
                  <a
                    href={`/support?persona=${supportPack.personaSlug}`}
                    className="inline-flex items-center gap-2 text-white text-sm font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    style={{ backgroundColor: heroColor }}
                  >
                    <Headset size={16} />
                    まずは無料で相談する
                    <ArrowRight size={14} />
                  </a>
                  <p className="text-xs text-gray-400 mt-3">※ ツール利用は無料のまま。サポートだけの追加オプションです。</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========== 有料プラン誘導 ========== */}
      {freeFeatures && upgradeFeatures && (
        <section className="py-20" style={{ backgroundColor: '#fffbf0' }}>
          <div className="max-w-3xl mx-auto px-4">
            {supportPack && (
              <p className="text-center text-sm text-gray-500 mb-6">
                自分のペースで進めたい方には、セルフサービスプランもあります
              </p>
            )}
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-black mb-4" style={{ color: '#5d4037' }}>
                さらに成果を加速させるなら
              </h2>
              <p className="text-gray-600">
                まずは無料で十分始められます。効果を実感してから、次のステップへ。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* 無料でできること */}
              <div className="p-6 rounded-2xl border border-gray-200 bg-white">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-bold mb-4">
                  フリープラン（¥0）
                </div>
                <ul className="space-y-3">
                  {freeFeatures.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 有料でさらに */}
              <div className="p-6 rounded-2xl border-2 relative overflow-hidden" style={{ borderColor: heroColor, backgroundColor: `${heroColor}05` }}>
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-10" style={{ backgroundColor: heroColor }} />
                <div className="relative z-10">
                  <div
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4"
                    style={{ backgroundColor: `${heroColor}15`, color: heroColor }}
                  >
                    <Crown size={12} />
                    有料プラン（¥1,980〜/月）
                  </div>
                  <ul className="space-y-3">
                    {upgradeFeatures.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Sparkles size={16} style={{ color: heroColor }} className="mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">
                          {feat.text}
                          <span className="text-xs text-gray-400 ml-1">({feat.plan}〜)</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-sm text-gray-500 mb-4">
                まずは無料プランで効果を実感 → 必要に応じてアップグレード
              </p>
              <a
                href="/pricing"
                className="inline-flex items-center gap-2 text-sm font-bold hover:underline transition"
                style={{ color: heroColor }}
              >
                プラン詳細を見る <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ========== FAQ（SEOリッチリザルト対応） ========== */}
      {faqItems && faqItems.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-black text-center mb-10" style={{ color: '#5d4037' }}>
              よくある質問
            </h2>
            <div className="space-y-4">
              {faqItems.map((faq, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-orange-50 bg-white">
                  <details className="group">
                    <summary data-speakable="question" className="flex justify-between items-center px-6 py-5 font-bold cursor-pointer select-none list-none" style={{ color: '#5d4037' }}>
                      <span>{faq.question}</span>
                      <span className="transition group-open:rotate-180" style={{ color: heroColor }}>▼</span>
                    </summary>
                    <div data-speakable="answer" className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t pt-4" style={{ borderColor: '#ffedd5' }}>
                      {faq.answer}
                    </div>
                  </details>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ========== CTA ========== */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: heroColor }}>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-yellow-300 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-black mb-6 text-white leading-tight" data-speakable>
            「いつかやろう」を、<br />今日にしませんか？
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto leading-relaxed text-white/80">
            テンプレートを選ぶだけで始められます。<br />
            まずは無料で、集客の仕組みを体験してください。
          </p>
          <AuthCTAButton className="bg-white text-lg font-bold py-4 px-12 rounded-full shadow-2xl transition transform hover:-translate-y-1 inline-flex items-center gap-2" style={{ color: heroColor }}>
            <Sparkles size={20} />無料で始める
          </AuthCTAButton>
          <p className="text-sm text-white/60 mt-4">※ クレジットカード不要 / いつでも無料で使えます</p>
        </div>
      </section>

      {/* ========== 他のタイプも見る ========== */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h3 className="text-xl font-bold text-center mb-8" style={{ color: '#5d4037' }}>
            他のビジネスタイプの方はこちら
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {otherTypes.map((type, i) => (
              <a
                key={i}
                href={type.href}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <span className="font-bold text-sm" style={{ color: '#5d4037' }}>{type.label}</span>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-orange-500 transition" />
              </a>
            ))}
          </div>
          <div className="text-center mt-8">
            <a href="/" className="text-sm font-bold hover:underline transition" style={{ color: '#f97316' }}>
              ← トップページに戻る
            </a>
          </div>
        </div>
      </section>
    </Wrapper>
  );
}
