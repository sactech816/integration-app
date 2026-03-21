'use client';

import React, { useState } from 'react';
import {
  ChevronDown, CheckCircle, ExternalLink, BookOpen, Target,
  HelpCircle, Star, ArrowRight, User, Lightbulb, Users,
  ArrowRightLeft, Gift, MessageCircle, Quote,
} from 'lucide-react';

// ===== テーマシステム =====
export const LP_THEMES = {
  orange: {
    name: 'Warm Orange',
    heroBg: 'from-amber-50 via-orange-50 to-yellow-50',
    heroBlob1: 'bg-orange-300',
    heroBlob2: 'bg-amber-300',
    heroBlob3: 'bg-yellow-200',
    heroAccent: 'text-orange-600',
    heroBookIcon: 'text-orange-500',
    primaryBtn: 'from-orange-500 to-amber-500',
    primaryBtnShadow: 'shadow-orange-500/25',
    primaryBtnText: 'text-orange-600',
    sectionLabel: 'text-orange-500',
    sectionDivider: 'via-orange-200',
    painBg: 'from-red-50 to-orange-50',
    painBorder: 'border-red-100',
    painIconBg: 'bg-red-100',
    painIcon: 'text-red-500',
    benefitBg: 'from-green-50 to-emerald-50',
    benefitBorder: 'border-green-100',
    benefitAccent: 'border-l-green-400',
    benefitIconBg: 'bg-green-100',
    benefitIcon: 'text-green-600',
    chapterBg: 'from-blue-50 to-indigo-50',
    chapterBorder: 'border-blue-100',
    chapterNumBg: 'bg-blue-100',
    chapterNum: 'text-blue-700',
    chapterLine: 'bg-blue-200',
    ctaBg: 'from-orange-500 to-amber-500',
    ctaLight: 'text-orange-100',
    ctaBtnText: 'text-orange-600',
    takeawayAccent: 'from-orange-500 to-amber-500',
    takeawayNumText: 'text-white',
    takeawayLine: 'bg-orange-200',
    authorBg: 'from-gray-50 to-slate-50',
    authorBorderTop: 'border-t-orange-400',
    transformBeforeBg: 'bg-red-50',
    transformBeforeBorder: 'border-red-200',
    transformAfterBg: 'bg-emerald-50',
    transformAfterBorder: 'border-emerald-200',
    transformArrowBg: 'from-orange-400 to-amber-400',
    socialStarColor: 'text-amber-400',
    socialCardStripe: 'from-orange-400 to-amber-400',
    bonusBg: 'from-amber-50 to-yellow-50',
    bonusBorder: 'border-amber-200',
    bonusIconBg: 'bg-amber-100',
    bonusIcon: 'text-amber-600',
    bonusRibbon: 'bg-amber-500',
    faqLabelColor: 'text-orange-500',
    faqIconColor: 'text-orange-500',
    faqAccentBorder: 'border-l-orange-300',
    closingBg: 'from-orange-50 to-amber-50',
    footerAccent: 'from-orange-500 to-amber-500',
    svgDivider: '#fff7ed',
  },
  navy: {
    name: 'Professional Navy',
    heroBg: 'from-slate-50 via-blue-50 to-indigo-50',
    heroBlob1: 'bg-blue-300',
    heroBlob2: 'bg-indigo-300',
    heroBlob3: 'bg-sky-200',
    heroAccent: 'text-blue-700',
    heroBookIcon: 'text-blue-600',
    primaryBtn: 'from-blue-600 to-indigo-600',
    primaryBtnShadow: 'shadow-blue-500/25',
    primaryBtnText: 'text-blue-700',
    sectionLabel: 'text-blue-600',
    sectionDivider: 'via-blue-200',
    painBg: 'from-slate-50 to-blue-50',
    painBorder: 'border-slate-200',
    painIconBg: 'bg-slate-100',
    painIcon: 'text-slate-600',
    benefitBg: 'from-sky-50 to-blue-50',
    benefitBorder: 'border-sky-100',
    benefitAccent: 'border-l-sky-400',
    benefitIconBg: 'bg-sky-100',
    benefitIcon: 'text-sky-600',
    chapterBg: 'from-indigo-50 to-blue-50',
    chapterBorder: 'border-indigo-100',
    chapterNumBg: 'bg-indigo-100',
    chapterNum: 'text-indigo-700',
    chapterLine: 'bg-indigo-200',
    ctaBg: 'from-blue-700 to-indigo-700',
    ctaLight: 'text-blue-200',
    ctaBtnText: 'text-blue-700',
    takeawayAccent: 'from-blue-600 to-indigo-600',
    takeawayNumText: 'text-white',
    takeawayLine: 'bg-blue-200',
    authorBg: 'from-slate-50 to-blue-50',
    authorBorderTop: 'border-t-blue-500',
    transformBeforeBg: 'bg-slate-50',
    transformBeforeBorder: 'border-slate-300',
    transformAfterBg: 'bg-sky-50',
    transformAfterBorder: 'border-sky-200',
    transformArrowBg: 'from-blue-500 to-indigo-500',
    socialStarColor: 'text-blue-400',
    socialCardStripe: 'from-blue-500 to-indigo-500',
    bonusBg: 'from-indigo-50 to-blue-50',
    bonusBorder: 'border-indigo-200',
    bonusIconBg: 'bg-indigo-100',
    bonusIcon: 'text-indigo-600',
    bonusRibbon: 'bg-indigo-500',
    faqLabelColor: 'text-blue-600',
    faqIconColor: 'text-blue-500',
    faqAccentBorder: 'border-l-blue-300',
    closingBg: 'from-blue-50 to-indigo-50',
    footerAccent: 'from-blue-600 to-indigo-600',
    svgDivider: '#eff6ff',
  },
  purple: {
    name: 'Elegant Purple',
    heroBg: 'from-purple-50 via-fuchsia-50 to-pink-50',
    heroBlob1: 'bg-purple-300',
    heroBlob2: 'bg-fuchsia-300',
    heroBlob3: 'bg-violet-200',
    heroAccent: 'text-purple-700',
    heroBookIcon: 'text-purple-500',
    primaryBtn: 'from-purple-500 to-fuchsia-500',
    primaryBtnShadow: 'shadow-purple-500/25',
    primaryBtnText: 'text-purple-700',
    sectionLabel: 'text-purple-600',
    sectionDivider: 'via-purple-200',
    painBg: 'from-pink-50 to-purple-50',
    painBorder: 'border-pink-100',
    painIconBg: 'bg-pink-100',
    painIcon: 'text-pink-500',
    benefitBg: 'from-violet-50 to-purple-50',
    benefitBorder: 'border-violet-100',
    benefitAccent: 'border-l-violet-400',
    benefitIconBg: 'bg-violet-100',
    benefitIcon: 'text-violet-600',
    chapterBg: 'from-purple-50 to-indigo-50',
    chapterBorder: 'border-purple-100',
    chapterNumBg: 'bg-purple-100',
    chapterNum: 'text-purple-700',
    chapterLine: 'bg-purple-200',
    ctaBg: 'from-purple-600 to-fuchsia-600',
    ctaLight: 'text-purple-200',
    ctaBtnText: 'text-purple-700',
    takeawayAccent: 'from-purple-500 to-fuchsia-500',
    takeawayNumText: 'text-white',
    takeawayLine: 'bg-purple-200',
    authorBg: 'from-purple-50 to-fuchsia-50',
    authorBorderTop: 'border-t-purple-400',
    transformBeforeBg: 'bg-pink-50',
    transformBeforeBorder: 'border-pink-200',
    transformAfterBg: 'bg-violet-50',
    transformAfterBorder: 'border-violet-200',
    transformArrowBg: 'from-purple-500 to-fuchsia-500',
    socialStarColor: 'text-purple-400',
    socialCardStripe: 'from-purple-500 to-fuchsia-500',
    bonusBg: 'from-fuchsia-50 to-purple-50',
    bonusBorder: 'border-fuchsia-200',
    bonusIconBg: 'bg-fuchsia-100',
    bonusIcon: 'text-fuchsia-600',
    bonusRibbon: 'bg-fuchsia-500',
    faqLabelColor: 'text-purple-600',
    faqIconColor: 'text-purple-500',
    faqAccentBorder: 'border-l-purple-300',
    closingBg: 'from-purple-50 to-fuchsia-50',
    footerAccent: 'from-purple-500 to-fuchsia-500',
    svgDivider: '#faf5ff',
  },
  green: {
    name: 'Fresh Green',
    heroBg: 'from-emerald-50 via-green-50 to-teal-50',
    heroBlob1: 'bg-emerald-300',
    heroBlob2: 'bg-teal-300',
    heroBlob3: 'bg-green-200',
    heroAccent: 'text-emerald-700',
    heroBookIcon: 'text-emerald-500',
    primaryBtn: 'from-emerald-500 to-teal-500',
    primaryBtnShadow: 'shadow-emerald-500/25',
    primaryBtnText: 'text-emerald-700',
    sectionLabel: 'text-emerald-600',
    sectionDivider: 'via-emerald-200',
    painBg: 'from-amber-50 to-orange-50',
    painBorder: 'border-amber-100',
    painIconBg: 'bg-amber-100',
    painIcon: 'text-amber-600',
    benefitBg: 'from-emerald-50 to-green-50',
    benefitBorder: 'border-emerald-100',
    benefitAccent: 'border-l-emerald-400',
    benefitIconBg: 'bg-emerald-100',
    benefitIcon: 'text-emerald-600',
    chapterBg: 'from-teal-50 to-cyan-50',
    chapterBorder: 'border-teal-100',
    chapterNumBg: 'bg-teal-100',
    chapterNum: 'text-teal-700',
    chapterLine: 'bg-teal-200',
    ctaBg: 'from-emerald-600 to-teal-600',
    ctaLight: 'text-emerald-200',
    ctaBtnText: 'text-emerald-700',
    takeawayAccent: 'from-emerald-500 to-teal-500',
    takeawayNumText: 'text-white',
    takeawayLine: 'bg-emerald-200',
    authorBg: 'from-emerald-50 to-teal-50',
    authorBorderTop: 'border-t-emerald-400',
    transformBeforeBg: 'bg-amber-50',
    transformBeforeBorder: 'border-amber-200',
    transformAfterBg: 'bg-emerald-50',
    transformAfterBorder: 'border-emerald-200',
    transformArrowBg: 'from-emerald-500 to-teal-500',
    socialStarColor: 'text-emerald-400',
    socialCardStripe: 'from-emerald-500 to-teal-500',
    bonusBg: 'from-teal-50 to-emerald-50',
    bonusBorder: 'border-teal-200',
    bonusIconBg: 'bg-teal-100',
    bonusIcon: 'text-teal-600',
    bonusRibbon: 'bg-teal-500',
    faqLabelColor: 'text-emerald-600',
    faqIconColor: 'text-emerald-500',
    faqAccentBorder: 'border-l-emerald-300',
    closingBg: 'from-emerald-50 to-teal-50',
    footerAccent: 'from-emerald-500 to-teal-500',
    svgDivider: '#ecfdf5',
  },
  red: {
    name: 'Bold Red',
    heroBg: 'from-red-50 via-rose-50 to-pink-50',
    heroBlob1: 'bg-red-300',
    heroBlob2: 'bg-rose-300',
    heroBlob3: 'bg-pink-200',
    heroAccent: 'text-red-700',
    heroBookIcon: 'text-red-500',
    primaryBtn: 'from-red-500 to-rose-500',
    primaryBtnShadow: 'shadow-red-500/25',
    primaryBtnText: 'text-red-700',
    sectionLabel: 'text-red-600',
    sectionDivider: 'via-red-200',
    painBg: 'from-red-50 to-rose-50',
    painBorder: 'border-red-100',
    painIconBg: 'bg-red-100',
    painIcon: 'text-red-500',
    benefitBg: 'from-rose-50 to-pink-50',
    benefitBorder: 'border-rose-100',
    benefitAccent: 'border-l-rose-400',
    benefitIconBg: 'bg-rose-100',
    benefitIcon: 'text-rose-600',
    chapterBg: 'from-red-50 to-orange-50',
    chapterBorder: 'border-red-100',
    chapterNumBg: 'bg-red-100',
    chapterNum: 'text-red-700',
    chapterLine: 'bg-red-200',
    ctaBg: 'from-red-600 to-rose-600',
    ctaLight: 'text-red-200',
    ctaBtnText: 'text-red-700',
    takeawayAccent: 'from-red-500 to-rose-500',
    takeawayNumText: 'text-white',
    takeawayLine: 'bg-red-200',
    authorBg: 'from-rose-50 to-red-50',
    authorBorderTop: 'border-t-red-400',
    transformBeforeBg: 'bg-gray-50',
    transformBeforeBorder: 'border-gray-300',
    transformAfterBg: 'bg-rose-50',
    transformAfterBorder: 'border-rose-200',
    transformArrowBg: 'from-red-500 to-rose-500',
    socialStarColor: 'text-rose-400',
    socialCardStripe: 'from-red-500 to-rose-500',
    bonusBg: 'from-rose-50 to-red-50',
    bonusBorder: 'border-rose-200',
    bonusIconBg: 'bg-rose-100',
    bonusIcon: 'text-rose-600',
    bonusRibbon: 'bg-rose-500',
    faqLabelColor: 'text-red-600',
    faqIconColor: 'text-red-500',
    faqAccentBorder: 'border-l-red-300',
    closingBg: 'from-red-50 to-rose-50',
    footerAccent: 'from-red-500 to-rose-500',
    svgDivider: '#fef2f2',
  },
} as const;

export type ThemeKey = keyof typeof LP_THEMES;

// ===== 型定義 =====
export interface BookLPData {
  hero: { catchcopy: string; subtitle: string; description: string };
  pain_points: Array<{ title: string; description: string }>;
  author_profile?: { name: string; credentials: string; story: string };
  benefits: Array<{ title: string; description: string }>;
  key_takeaways?: Array<{ number: number; title: string; description: string }>;
  target_readers?: { heading: string; items: string[] };
  transformation?: { before: string[]; after: string[] };
  chapter_summaries: Array<{ chapter_title: string; summary: string }>;
  social_proof?: Array<{ quote: string; reviewer_name: string; rating: number }>;
  bonus?: Array<{ title: string; description: string }>;
  faq: Array<{ question: string; answer: string }>;
  closing_message?: { title: string; message: string };
  cta: { amazon_link: string; line_link: string; cta_text: string };
}

export interface SectionVisibility {
  [key: string]: boolean;
}

interface BookLPDisplayProps {
  lpData: BookLPData;
  bookTitle: string;
  bookSubtitle?: string;
  themeColor?: ThemeKey;
  sectionVisibility?: SectionVisibility;
  coverImageUrl?: string;
}

export default function BookLPDisplay({
  lpData,
  bookTitle,
  bookSubtitle,
  themeColor = 'orange',
  sectionVisibility = {},
  coverImageUrl,
}: BookLPDisplayProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const t = LP_THEMES[themeColor] || LP_THEMES.orange;

  const isVisible = (key: string) => sectionVisibility[key] !== false;

  const scrollToCta = () => {
    document.getElementById('book-lp-cta')?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={16} className={n <= rating ? `${t.socialStarColor} fill-current` : 'text-gray-200'} />
      ))}
    </div>
  );

  // セクションラベル（統一デザイン）
  const SectionLabel = ({ label }: { label: string }) => (
    <div className="flex items-center justify-center gap-4 mb-3">
      <div className={`h-px w-8 bg-gradient-to-r from-transparent ${t.sectionDivider} to-transparent`} />
      <p className={`${t.sectionLabel} font-semibold text-xs tracking-[0.2em] uppercase`}>{label}</p>
      <div className={`h-px w-8 bg-gradient-to-l from-transparent ${t.sectionDivider} to-transparent`} />
    </div>
  );

  // セクション仕切り線
  const SectionDivider = () => (
    <div className="relative py-1">
      <div className={`h-px bg-gradient-to-r from-transparent ${t.sectionDivider} to-transparent mx-auto max-w-md`} />
    </div>
  );

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Noto Sans JP', 'M PLUS Rounded 1c', sans-serif" }}>

      {/* ===== 1. Hero Section ===== */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${t.heroBg}`}>
        {/* 装飾: 浮遊Blob */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-10 left-10 w-60 h-60 ${t.heroBlob1} rounded-full blur-3xl opacity-[0.08] animate-lp-float`} />
          <div className={`absolute bottom-10 right-10 w-80 h-80 ${t.heroBlob2} rounded-full blur-3xl opacity-[0.08] animate-lp-float-reverse`} />
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${t.heroBlob3} rounded-full blur-3xl opacity-[0.06]`} />
        </div>
        {/* 装飾: ドットグリッド */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '24px 24px' }}
        />

        <div className="relative max-w-5xl mx-auto px-4 py-20 md:py-28">
          <div className={`flex flex-col ${coverImageUrl ? 'md:flex-row md:items-center md:gap-16' : ''} text-center ${coverImageUrl ? 'md:text-left' : ''}`}>
            <div className="flex-1">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                <div className={`h-px w-6 bg-gradient-to-r from-transparent ${t.sectionDivider} to-transparent`} />
                <p className={`${t.heroAccent} font-semibold text-sm md:text-base tracking-[0.15em] uppercase`}>
                  {bookSubtitle || lpData.hero.subtitle}
                </p>
                <div className={`h-px w-6 bg-gradient-to-l from-transparent ${t.sectionDivider} to-transparent`} />
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6 tracking-tight">
                {lpData.hero.catchcopy}
              </h1>
              <p className="text-gray-600 text-lg md:text-xl max-w-2xl mb-8 leading-[1.8]">
                {lpData.hero.description}
              </p>
              <div className="inline-block bg-white/60 backdrop-blur-md rounded-2xl px-6 py-3 shadow-lg border border-white/50 mb-8">
                <p className="text-gray-700 font-medium flex items-center gap-2">
                  <BookOpen size={20} className={t.heroBookIcon} />
                  {bookTitle}
                </p>
              </div>
              <div>
                <button
                  onClick={scrollToCta}
                  className={`inline-flex items-center gap-2 bg-gradient-to-r ${t.primaryBtn} text-white font-bold text-lg px-10 py-5 rounded-full shadow-xl ${t.primaryBtnShadow} hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-lp-cta-ring`}
                >
                  {lpData.cta.cta_text || '今すぐ読む'}
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
            {coverImageUrl && (
              <div className="mt-10 md:mt-0 flex-shrink-0 flex justify-center">
                <div className="relative animate-lp-book" style={{ perspective: '800px' }}>
                  <img
                    src={coverImageUrl}
                    alt={bookTitle}
                    className="w-48 md:w-64 rounded-lg shadow-2xl"
                    style={{ transform: 'rotateY(-5deg)' }}
                  />
                  {/* 反射グロー */}
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-black/10 rounded-full blur-xl" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SVGカーブディバイダー */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
            <path d="M0 48h1440V24C1200 42 960 48 720 40S240 6 0 24v24z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ===== 2. Pain Points ===== */}
      {isVisible('pain_points') && lpData.pain_points?.length > 0 && (
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <SectionLabel label="PROBLEMS" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                こんなお悩みはありませんか？
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {lpData.pain_points.map((point, i) => (
                <div
                  key={i}
                  className={`bg-gradient-to-br ${t.painBg} rounded-2xl p-6 border ${t.painBorder} hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-lp-card-in`}
                  style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-full ${t.painIconBg} flex items-center justify-center flex-shrink-0 ring-2 ring-offset-2 ring-red-100`}>
                      <Target size={18} className={t.painIcon} />
                    </div>
                    <h3 className="font-bold text-gray-800">{point.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-[1.8]">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* ===== 3. Author Profile ===== */}
      {isVisible('author_profile') && lpData.author_profile?.name && (
        <section className="py-20 md:py-28 bg-gray-50/50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <SectionLabel label="ABOUT THE AUTHOR" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">著者について</h2>
            </div>
            <div className={`bg-gradient-to-br ${t.authorBg} rounded-3xl p-8 md:p-12 shadow-lg border-t-4 ${t.authorBorderTop} relative overflow-hidden`}>
              {/* 装飾: 大きな引用符 */}
              <div className="absolute top-4 right-8 text-gray-100 text-[120px] leading-none font-serif pointer-events-none select-none">&ldquo;</div>
              <div className="relative flex flex-col md:flex-row items-start gap-6">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${t.primaryBtn} shadow-lg flex items-center justify-center flex-shrink-0 ring-4 ring-white`}>
                  <User size={28} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{lpData.author_profile.name}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {lpData.author_profile.credentials.split(/[、,]/).map((cred, i) => (
                      <span key={i} className="inline-block bg-white/70 backdrop-blur rounded-full px-3 py-1 text-xs text-gray-600 border border-gray-200">
                        {cred.trim()}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-700 text-base leading-[1.8]">{lpData.author_profile.story}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* ===== 4. Benefits ===== */}
      {isVisible('benefits') && lpData.benefits?.length > 0 && (
        <section className={`py-20 md:py-28 bg-gradient-to-br ${t.benefitBg}`}>
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <SectionLabel label="BENEFITS" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                この本を読むことで得られること
              </h2>
            </div>
            <div className="space-y-4">
              {lpData.benefits.map((benefit, i) => (
                <div
                  key={i}
                  className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${t.benefitAccent} hover:shadow-md hover:bg-white/90 transition-all duration-300 flex items-start gap-4 animate-lp-card-in`}
                  style={{ animationDelay: `${i * 0.08}s`, opacity: 0 }}
                >
                  <div className="flex items-center gap-3 flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-gray-300 w-5 text-right">{String(i + 1).padStart(2, '0')}</span>
                    <div className={`w-8 h-8 rounded-full ${t.benefitIconBg} flex items-center justify-center`}>
                      <CheckCircle size={18} className={t.benefitIcon} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm leading-[1.8]">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* ===== 5. Key Takeaways ===== */}
      {isVisible('key_takeaways') && lpData.key_takeaways && lpData.key_takeaways.length > 0 && (
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <SectionLabel label="KEY TAKEAWAYS" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                本書で得られる重要なインサイト
              </h2>
            </div>
            <div className="relative space-y-8">
              {/* タイムライン縦線 */}
              <div className={`absolute left-6 top-6 bottom-6 w-px ${t.takeawayLine} hidden md:block`} />
              {lpData.key_takeaways.map((item, i) => (
                <div key={i} className="flex items-start gap-5 relative">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.takeawayAccent} flex items-center justify-center flex-shrink-0 shadow-lg relative z-10`}>
                    <span className={`${t.takeawayNumText} font-bold text-lg`}>{item.number}</span>
                  </div>
                  <div className="flex-1 pt-1 pb-2">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h3>
                    <p className="text-gray-600 leading-[1.8]">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* ===== 6. Target Readers ===== */}
      {isVisible('target_readers') && lpData.target_readers?.items?.length > 0 && (
        <section className="py-20 md:py-28 bg-gray-50/50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <SectionLabel label="TARGET READERS" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                {lpData.target_readers.heading || 'この本はこんなあなたのための本です'}
              </h2>
            </div>
            <div className="max-w-2xl mx-auto space-y-3">
              {lpData.target_readers.items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md hover:border-l-4 hover:border-l-current transition-all duration-300"
                >
                  <div className={`w-7 h-7 rounded-full ${t.benefitIconBg} flex items-center justify-center flex-shrink-0`}>
                    <CheckCircle size={16} className={`${t.benefitIcon} fill-current`} />
                  </div>
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* ===== 7. Transformation (Before / After) ===== */}
      {isVisible('transformation') && lpData.transformation?.before?.length > 0 && (
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <SectionLabel label="TRANSFORMATION" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">
                読む前と読んだ後の変化
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 md:gap-4 relative">
              {/* 中央の矢印コネクター（デスクトップ） */}
              <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${t.transformArrowBg} shadow-lg flex items-center justify-center`}>
                  <ArrowRight size={20} className="text-white" />
                </div>
              </div>
              {/* Before */}
              <div className={`${t.transformBeforeBg} rounded-2xl p-6 border ${t.transformBeforeBorder} relative overflow-hidden`}>
                {/* 斜線パターン装飾 */}
                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{ backgroundImage: 'repeating-linear-gradient(45deg, currentColor, currentColor 1px, transparent 1px, transparent 8px)' }}
                />
                <div className="relative">
                  <span className="inline-block bg-red-100 text-red-600 text-xs font-bold px-3 py-1 rounded-full mb-4">Before &mdash; 読む前</span>
                  <div className="space-y-3">
                    {lpData.transformation.before.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <span className="text-red-400 mt-0.5 flex-shrink-0 text-lg">&#x2717;</span>
                        <span className="text-gray-600 leading-[1.8]">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* モバイル矢印 */}
              <div className="flex md:hidden justify-center -my-2">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-r ${t.transformArrowBg} shadow-lg flex items-center justify-center rotate-90`}>
                  <ArrowRight size={18} className="text-white" />
                </div>
              </div>
              {/* After */}
              <div className={`${t.transformAfterBg} rounded-2xl p-6 border ${t.transformAfterBorder} relative`}>
                <span className="inline-block bg-emerald-100 text-emerald-600 text-xs font-bold px-3 py-1 rounded-full mb-4">After &mdash; 読んだ後</span>
                <div className="space-y-3">
                  {lpData.transformation.after.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 font-medium leading-[1.8]">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* ===== 8. Chapter Summaries ===== */}
      {isVisible('chapter_summaries') && lpData.chapter_summaries?.length > 0 && (
        <section className="py-20 md:py-28 bg-gray-50/50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <SectionLabel label="TABLE OF CONTENTS" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">本書の内容</h2>
            </div>
            <div className="relative space-y-3">
              {/* タイムライン縦線 */}
              <div className={`absolute left-5 top-5 bottom-5 w-px ${t.chapterLine} hidden md:block`} />
              {lpData.chapter_summaries.map((chapter, i) => (
                <div
                  key={i}
                  className={`bg-gradient-to-r ${t.chapterBg} rounded-xl p-5 border ${t.chapterBorder} border-l-4 hover:shadow-md transition-all duration-300`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full ${t.chapterNumBg} flex items-center justify-center flex-shrink-0 shadow-sm relative z-10`}>
                      <span className={`${t.chapterNum} font-bold text-sm`}>{i + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">{chapter.chapter_title}</h3>
                      <p className="text-gray-600 text-sm leading-[1.8]">{chapter.summary}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* ===== 9. Social Proof ===== */}
      {isVisible('social_proof') && lpData.social_proof && lpData.social_proof.length > 0 && (
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <SectionLabel label="REVIEWS" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">読者の声</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {lpData.social_proof.map((review, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
                  {/* カード上部のテーマカラーストライプ */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${t.socialCardStripe}`} />
                  {/* 装飾Quote */}
                  <Quote size={40} className="absolute top-4 right-4 text-gray-100 group-hover:text-gray-200 transition-colors" />
                  <div className="relative">
                    {renderStars(review.rating)}
                    <div className="mt-4 mb-4">
                      <p className="text-gray-700 text-sm leading-[1.8] italic">{review.quote}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-gray-400">{review.reviewer_name.charAt(0)}</span>
                      </div>
                      <p className="text-gray-500 text-sm font-medium">{review.reviewer_name}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* ===== 10. Bonus ===== */}
      {isVisible('bonus') && lpData.bonus && lpData.bonus.length > 0 && (
        <section className={`py-20 md:py-28 bg-gradient-to-br ${t.bonusBg}`}>
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-16">
              <SectionLabel label="BONUS" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">読者限定の特典</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {lpData.bonus.map((item, i) => (
                <div key={i} className={`bg-white rounded-2xl p-6 border-2 border-dashed ${t.bonusBorder} shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}>
                  {/* リボン */}
                  <div className={`absolute -top-1 -right-1 ${t.bonusRibbon} text-white text-[10px] font-bold px-4 py-1 rounded-bl-lg rounded-tr-xl shadow`}>
                    特典 {i + 1}
                  </div>
                  <div className="flex items-start gap-4 pt-2">
                    <div className={`w-12 h-12 rounded-full ${t.bonusIconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <Gift size={22} className={t.bonusIcon} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm leading-[1.8]">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* ===== 11. FAQ ===== */}
      {isVisible('faq') && lpData.faq?.length > 0 && (
        <section className="py-20 md:py-28 bg-gray-50/50">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-16">
              <SectionLabel label="FAQ" />
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 tracking-tight">よくあるご質問</h2>
            </div>
            <div className="space-y-3">
              {lpData.faq.map((item, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle size={20} className={`${t.faqIconColor} flex-shrink-0`} />
                      <span className="font-medium text-gray-800">{item.question}</span>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-400 transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300 ease-in-out"
                    style={{ maxHeight: openFaq === i ? '500px' : '0px' }}
                  >
                    <div className={`px-5 pb-5 pt-0`}>
                      <div className={`pl-8 text-gray-600 text-sm leading-[1.8] border-t border-gray-100 pt-4 border-l-2 ${t.faqAccentBorder} ml-2 pl-6`}>
                        {item.answer}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <SectionDivider />

      {/* ===== 12. Closing Message ===== */}
      {isVisible('closing_message') && lpData.closing_message?.message && (
        <section className={`py-20 md:py-28 bg-gradient-to-br ${t.closingBg} relative overflow-hidden`}>
          {/* 装飾: 引用符 */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 text-gray-200/50 text-[200px] leading-none font-serif pointer-events-none select-none">&ldquo;</div>
          <div className="relative max-w-3xl mx-auto px-4 text-center">
            <div className={`h-px w-16 bg-gradient-to-r from-transparent ${t.sectionDivider} to-transparent mx-auto mb-8`} />
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 tracking-tight">
              {lpData.closing_message.title || '最後に'}
            </h2>
            <p className="text-gray-700 text-lg md:text-xl leading-[1.9] font-light">
              {lpData.closing_message.message}
            </p>
            {lpData.author_profile?.name && (
              <p className="mt-8 text-gray-500 text-sm">
                &mdash; {lpData.author_profile.name}
              </p>
            )}
          </div>
        </section>
      )}

      {/* ===== 13. CTA Section ===== */}
      <section id="book-lp-cta" className={`py-20 md:py-28 bg-gradient-to-br ${t.ctaBg} relative overflow-hidden`}>
        {/* 装飾: 白半透明Blob */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl animate-lp-float" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-lp-float-reverse" />
        </div>
        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 tracking-tight" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
            {lpData.hero.catchcopy}
          </h2>
          <p className={`${t.ctaLight} text-lg mb-10 max-w-xl mx-auto leading-[1.8]`}>
            {lpData.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {lpData.cta.amazon_link && (
              <a
                href={lpData.cta.amazon_link}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 bg-white ${t.ctaBtnText} font-bold text-lg px-10 py-5 rounded-full shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 animate-lp-cta-ring`}
              >
                <ExternalLink size={20} />
                Amazonで購入
              </a>
            )}
            {lpData.cta.line_link && (
              <a
                href={lpData.cta.line_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-green-500 text-white font-bold text-lg px-10 py-5 rounded-full shadow-xl shadow-green-500/30 hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300"
              >
                LINE登録で特典を受け取る
              </a>
            )}
            {!lpData.cta.amazon_link && !lpData.cta.line_link && (
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-8 py-6 inline-block">
                <p className="text-white text-lg font-medium">
                  {lpData.cta.cta_text || '近日公開予定'}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="relative py-8 bg-gray-900 text-center">
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${t.footerAccent}`} />
        <p className="text-gray-400 text-xs tracking-wider">
          Powered by Kindle出版メーカー
        </p>
      </footer>
    </div>
  );
}
