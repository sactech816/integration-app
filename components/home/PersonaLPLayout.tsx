'use client';

import { ReactNode } from 'react';
import { ArrowRight, Sparkles, Check, ChevronRight } from 'lucide-react';
import HomeAuthProvider from '@/components/home/HomeAuthProvider';
import { AuthCTAButton } from '@/components/home/HomeClientButtons';
import type { LucideIcon } from 'lucide-react';

export interface PersonaStep {
  number: number;
  title: string;
  description: string;
  toolName: string;
  toolDescription: string;
  icon: LucideIcon;
  color: string;
}

export interface PersonaTestimonial {
  before: string;
  after: string;
  persona: string;
}

export interface PersonaLPProps {
  // ヒーロー
  badge: string;
  headline: ReactNode;
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
}

export default function PersonaLPLayout({
  badge,
  headline,
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
}: PersonaLPProps) {
  return (
    <HomeAuthProvider>
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

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-6" style={{ color: '#5d4037' }}>
            {headline}
          </h1>

          <p className="text-base md:text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
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
          <h2 className="text-2xl md:text-3xl font-black text-center mb-10" style={{ color: '#5d4037' }}>
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
            <h2 className="text-2xl md:text-3xl font-black mb-4" style={{ color: '#5d4037' }}>
              {benefitTitle}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{benefitDescription}</p>
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
                  <p className="text-sm text-gray-600 leading-relaxed">{b.description}</p>
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
            <h2 className="text-2xl md:text-3xl font-black mb-4" style={{ color: '#5d4037' }}>
              {stepsTitle}
            </h2>
            <p className="text-gray-600">{stepsDescription}</p>
          </div>

          <div className="space-y-8">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative">
                  {/* 接続線 */}
                  {i < steps.length - 1 && (
                    <div
                      className="absolute left-8 top-full w-0.5 h-8 hidden md:block"
                      style={{ backgroundColor: `${heroColor}30` }}
                    />
                  )}
                  <div className="flex items-start gap-6 p-6 sm:p-8 rounded-3xl border border-gray-100 bg-white hover:shadow-lg transition-all duration-300">
                    {/* ステップ番号 */}
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-xl font-black shadow-lg"
                      style={{ backgroundColor: step.color }}
                    >
                      {step.number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#5d4037' }}>{step.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-3">{step.description}</p>
                      <div
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border"
                        style={{ color: step.color, borderColor: `${step.color}40`, backgroundColor: `${step.color}08` }}
                      >
                        <Icon size={16} />
                        {step.toolName}
                        <span className="text-gray-400 text-xs">— {step.toolDescription}</span>
                      </div>
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
              {/* Before */}
              <div className="p-8 border-b md:border-b-0 md:border-r border-gray-100">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold mb-4">
                  BEFORE
                </div>
                <p className="text-gray-600 leading-relaxed text-sm">{testimonial.before}</p>
              </div>
              {/* After */}
              <div className="p-8" style={{ backgroundColor: `${heroColor}05` }}>
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4"
                  style={{ backgroundColor: `${heroColor}15`, color: heroColor }}
                >
                  AFTER
                </div>
                <p className="text-gray-700 leading-relaxed text-sm font-medium">{testimonial.after}</p>
              </div>
            </div>
            <div className="px-8 py-4 border-t border-gray-100 text-center">
              <span className="text-xs text-gray-400">{testimonial.persona}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: heroColor }}>
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-yellow-300 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-black mb-6 text-white leading-tight">
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
    </HomeAuthProvider>
  );
}
