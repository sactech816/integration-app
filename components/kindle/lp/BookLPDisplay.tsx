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
    heroAccent: 'text-orange-600',
    heroBookIcon: 'text-orange-500',
    primaryBtn: 'from-orange-500 to-amber-500',
    primaryBtnText: 'text-orange-600',
    sectionLabel: 'text-orange-500',
    painBg: 'from-red-50 to-orange-50',
    painBorder: 'border-red-100',
    painIconBg: 'bg-red-100',
    painIcon: 'text-red-500',
    benefitBg: 'from-green-50 to-emerald-50',
    benefitBorder: 'border-green-100',
    benefitIconBg: 'bg-green-100',
    benefitIcon: 'text-green-600',
    chapterBg: 'from-blue-50 to-indigo-50',
    chapterBorder: 'border-blue-100',
    chapterNumBg: 'bg-blue-100',
    chapterNum: 'text-blue-700',
    ctaBg: 'from-orange-500 to-amber-500',
    ctaLight: 'text-orange-100',
    ctaBtnText: 'text-orange-600',
    takeawayAccent: 'bg-orange-500',
    takeawayNumText: 'text-white',
    authorBg: 'from-gray-50 to-slate-50',
    transformBeforeBg: 'bg-red-50',
    transformBeforeBorder: 'border-red-200',
    transformAfterBg: 'bg-emerald-50',
    transformAfterBorder: 'border-emerald-200',
    socialStarColor: 'text-amber-400',
    bonusBg: 'from-amber-50 to-yellow-50',
    bonusBorder: 'border-amber-200',
    bonusIconBg: 'bg-amber-100',
    bonusIcon: 'text-amber-600',
    closingBg: 'from-orange-50 to-amber-50',
  },
  navy: {
    name: 'Professional Navy',
    heroBg: 'from-slate-50 via-blue-50 to-indigo-50',
    heroBlob1: 'bg-blue-300',
    heroBlob2: 'bg-indigo-300',
    heroAccent: 'text-blue-700',
    heroBookIcon: 'text-blue-600',
    primaryBtn: 'from-blue-600 to-indigo-600',
    primaryBtnText: 'text-blue-700',
    sectionLabel: 'text-blue-600',
    painBg: 'from-slate-50 to-blue-50',
    painBorder: 'border-slate-200',
    painIconBg: 'bg-slate-100',
    painIcon: 'text-slate-600',
    benefitBg: 'from-sky-50 to-blue-50',
    benefitBorder: 'border-sky-100',
    benefitIconBg: 'bg-sky-100',
    benefitIcon: 'text-sky-600',
    chapterBg: 'from-indigo-50 to-blue-50',
    chapterBorder: 'border-indigo-100',
    chapterNumBg: 'bg-indigo-100',
    chapterNum: 'text-indigo-700',
    ctaBg: 'from-blue-700 to-indigo-700',
    ctaLight: 'text-blue-200',
    ctaBtnText: 'text-blue-700',
    takeawayAccent: 'bg-blue-600',
    takeawayNumText: 'text-white',
    authorBg: 'from-slate-50 to-blue-50',
    transformBeforeBg: 'bg-slate-50',
    transformBeforeBorder: 'border-slate-300',
    transformAfterBg: 'bg-sky-50',
    transformAfterBorder: 'border-sky-200',
    socialStarColor: 'text-blue-400',
    bonusBg: 'from-indigo-50 to-blue-50',
    bonusBorder: 'border-indigo-200',
    bonusIconBg: 'bg-indigo-100',
    bonusIcon: 'text-indigo-600',
    closingBg: 'from-blue-50 to-indigo-50',
  },
  purple: {
    name: 'Elegant Purple',
    heroBg: 'from-purple-50 via-fuchsia-50 to-pink-50',
    heroBlob1: 'bg-purple-300',
    heroBlob2: 'bg-fuchsia-300',
    heroAccent: 'text-purple-700',
    heroBookIcon: 'text-purple-500',
    primaryBtn: 'from-purple-500 to-fuchsia-500',
    primaryBtnText: 'text-purple-700',
    sectionLabel: 'text-purple-600',
    painBg: 'from-pink-50 to-purple-50',
    painBorder: 'border-pink-100',
    painIconBg: 'bg-pink-100',
    painIcon: 'text-pink-500',
    benefitBg: 'from-violet-50 to-purple-50',
    benefitBorder: 'border-violet-100',
    benefitIconBg: 'bg-violet-100',
    benefitIcon: 'text-violet-600',
    chapterBg: 'from-purple-50 to-indigo-50',
    chapterBorder: 'border-purple-100',
    chapterNumBg: 'bg-purple-100',
    chapterNum: 'text-purple-700',
    ctaBg: 'from-purple-600 to-fuchsia-600',
    ctaLight: 'text-purple-200',
    ctaBtnText: 'text-purple-700',
    takeawayAccent: 'bg-purple-500',
    takeawayNumText: 'text-white',
    authorBg: 'from-purple-50 to-fuchsia-50',
    transformBeforeBg: 'bg-pink-50',
    transformBeforeBorder: 'border-pink-200',
    transformAfterBg: 'bg-violet-50',
    transformAfterBorder: 'border-violet-200',
    socialStarColor: 'text-purple-400',
    bonusBg: 'from-fuchsia-50 to-purple-50',
    bonusBorder: 'border-fuchsia-200',
    bonusIconBg: 'bg-fuchsia-100',
    bonusIcon: 'text-fuchsia-600',
    closingBg: 'from-purple-50 to-fuchsia-50',
  },
  green: {
    name: 'Fresh Green',
    heroBg: 'from-emerald-50 via-green-50 to-teal-50',
    heroBlob1: 'bg-emerald-300',
    heroBlob2: 'bg-teal-300',
    heroAccent: 'text-emerald-700',
    heroBookIcon: 'text-emerald-500',
    primaryBtn: 'from-emerald-500 to-teal-500',
    primaryBtnText: 'text-emerald-700',
    sectionLabel: 'text-emerald-600',
    painBg: 'from-amber-50 to-orange-50',
    painBorder: 'border-amber-100',
    painIconBg: 'bg-amber-100',
    painIcon: 'text-amber-600',
    benefitBg: 'from-emerald-50 to-green-50',
    benefitBorder: 'border-emerald-100',
    benefitIconBg: 'bg-emerald-100',
    benefitIcon: 'text-emerald-600',
    chapterBg: 'from-teal-50 to-cyan-50',
    chapterBorder: 'border-teal-100',
    chapterNumBg: 'bg-teal-100',
    chapterNum: 'text-teal-700',
    ctaBg: 'from-emerald-600 to-teal-600',
    ctaLight: 'text-emerald-200',
    ctaBtnText: 'text-emerald-700',
    takeawayAccent: 'bg-emerald-500',
    takeawayNumText: 'text-white',
    authorBg: 'from-emerald-50 to-teal-50',
    transformBeforeBg: 'bg-amber-50',
    transformBeforeBorder: 'border-amber-200',
    transformAfterBg: 'bg-emerald-50',
    transformAfterBorder: 'border-emerald-200',
    socialStarColor: 'text-emerald-400',
    bonusBg: 'from-teal-50 to-emerald-50',
    bonusBorder: 'border-teal-200',
    bonusIconBg: 'bg-teal-100',
    bonusIcon: 'text-teal-600',
    closingBg: 'from-emerald-50 to-teal-50',
  },
  red: {
    name: 'Bold Red',
    heroBg: 'from-red-50 via-rose-50 to-pink-50',
    heroBlob1: 'bg-red-300',
    heroBlob2: 'bg-rose-300',
    heroAccent: 'text-red-700',
    heroBookIcon: 'text-red-500',
    primaryBtn: 'from-red-500 to-rose-500',
    primaryBtnText: 'text-red-700',
    sectionLabel: 'text-red-600',
    painBg: 'from-red-50 to-rose-50',
    painBorder: 'border-red-100',
    painIconBg: 'bg-red-100',
    painIcon: 'text-red-500',
    benefitBg: 'from-rose-50 to-pink-50',
    benefitBorder: 'border-rose-100',
    benefitIconBg: 'bg-rose-100',
    benefitIcon: 'text-rose-600',
    chapterBg: 'from-red-50 to-orange-50',
    chapterBorder: 'border-red-100',
    chapterNumBg: 'bg-red-100',
    chapterNum: 'text-red-700',
    ctaBg: 'from-red-600 to-rose-600',
    ctaLight: 'text-red-200',
    ctaBtnText: 'text-red-700',
    takeawayAccent: 'bg-red-500',
    takeawayNumText: 'text-white',
    authorBg: 'from-rose-50 to-red-50',
    transformBeforeBg: 'bg-gray-50',
    transformBeforeBorder: 'border-gray-300',
    transformAfterBg: 'bg-rose-50',
    transformAfterBorder: 'border-rose-200',
    socialStarColor: 'text-rose-400',
    bonusBg: 'from-rose-50 to-red-50',
    bonusBorder: 'border-rose-200',
    bonusIconBg: 'bg-rose-100',
    bonusIcon: 'text-rose-600',
    closingBg: 'from-red-50 to-rose-50',
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
        <Star key={n} size={14} className={n <= rating ? `${t.socialStarColor} fill-current` : 'text-gray-200'} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Noto Sans JP', 'M PLUS Rounded 1c', sans-serif" }}>

      {/* ===== 1. Hero Section ===== */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${t.heroBg}`}>
        <div className="absolute inset-0 opacity-10">
          <div className={`absolute top-10 left-10 w-40 h-40 ${t.heroBlob1} rounded-full blur-3xl`} />
          <div className={`absolute bottom-10 right-10 w-60 h-60 ${t.heroBlob2} rounded-full blur-3xl`} />
        </div>
        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24">
          <div className={`flex flex-col ${coverImageUrl ? 'md:flex-row md:items-center md:gap-12' : ''} text-center ${coverImageUrl ? 'md:text-left' : ''}`}>
            <div className="flex-1">
              <p className={`${t.heroAccent} font-semibold text-sm md:text-base mb-4 tracking-wider`}>
                {bookSubtitle || lpData.hero.subtitle}
              </p>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                {lpData.hero.catchcopy}
              </h1>
              <p className="text-gray-600 text-lg md:text-xl max-w-2xl mb-8 leading-relaxed">
                {lpData.hero.description}
              </p>
              <div className="inline-block bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg mb-8">
                <p className="text-gray-700 font-medium flex items-center gap-2">
                  <BookOpen size={20} className={t.heroBookIcon} />
                  {bookTitle}
                </p>
              </div>
              <div>
                <button
                  onClick={scrollToCta}
                  className={`inline-flex items-center gap-2 bg-gradient-to-r ${t.primaryBtn} text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all`}
                >
                  {lpData.cta.cta_text || '今すぐ読む'}
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
            {coverImageUrl && (
              <div className="mt-8 md:mt-0 flex-shrink-0 flex justify-center">
                <img
                  src={coverImageUrl}
                  alt={bookTitle}
                  className="w-48 md:w-64 rounded-lg shadow-2xl"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ===== 2. Pain Points ===== */}
      {isVisible('pain_points') && lpData.pain_points?.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className={`${t.sectionLabel} font-semibold text-sm mb-2`}>PROBLEMS</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                こんなお悩みはありませんか？
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {lpData.pain_points.map((point, i) => (
                <div key={i} className={`bg-gradient-to-br ${t.painBg} rounded-2xl p-6 border ${t.painBorder}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-full ${t.painIconBg} flex items-center justify-center flex-shrink-0`}>
                      <Target size={16} className={t.painIcon} />
                    </div>
                    <h3 className="font-bold text-gray-800">{point.title}</h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{point.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 3. Author Profile ===== */}
      {isVisible('author_profile') && lpData.author_profile?.name && (
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className={`${t.sectionLabel} font-semibold text-sm mb-2`}>ABOUT THE AUTHOR</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">著者について</h2>
            </div>
            <div className={`bg-gradient-to-br ${t.authorBg} rounded-3xl p-8 md:p-12`}>
              <div className="flex items-start gap-6">
                <div className="w-16 h-16 rounded-full bg-white shadow-md flex items-center justify-center flex-shrink-0">
                  <User size={28} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{lpData.author_profile.name}</h3>
                  <p className="text-gray-500 text-sm mb-4">{lpData.author_profile.credentials}</p>
                  <p className="text-gray-700 leading-relaxed">{lpData.author_profile.story}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== 4. Benefits ===== */}
      {isVisible('benefits') && lpData.benefits?.length > 0 && (
        <section className={`py-16 md:py-20 bg-gradient-to-br ${t.benefitBg}`}>
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className={`${t.sectionLabel} font-semibold text-sm mb-2`}>BENEFITS</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                この本を読むことで得られること
              </h2>
            </div>
            <div className="space-y-4">
              {lpData.benefits.map((benefit, i) => (
                <div key={i} className={`bg-white rounded-xl p-5 shadow-sm border ${t.benefitBorder} flex items-start gap-4`}>
                  <div className={`w-8 h-8 rounded-full ${t.benefitIconBg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <CheckCircle size={18} className={t.benefitIcon} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 mb-1">{benefit.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 5. Key Takeaways ===== */}
      {isVisible('key_takeaways') && lpData.key_takeaways && lpData.key_takeaways.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className={`${t.sectionLabel} font-semibold text-sm mb-2`}>KEY TAKEAWAYS</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                本書で得られる重要なインサイト
              </h2>
            </div>
            <div className="space-y-6">
              {lpData.key_takeaways.map((item, i) => (
                <div key={i} className="flex items-start gap-5">
                  <div className={`w-12 h-12 rounded-full ${t.takeawayAccent} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <span className={`${t.takeawayNumText} font-bold text-lg`}>{item.number}</span>
                  </div>
                  <div className="flex-1 pt-1">
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 6. Target Readers ===== */}
      {isVisible('target_readers') && lpData.target_readers?.items?.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className={`${t.sectionLabel} font-semibold text-sm mb-2`}>TARGET READERS</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                {lpData.target_readers.heading || 'この本はこんなあなたのための本です'}
              </h2>
            </div>
            <div className="max-w-2xl mx-auto space-y-3">
              {lpData.target_readers.items.map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className={`w-6 h-6 rounded-full ${t.benefitIconBg} flex items-center justify-center flex-shrink-0`}>
                    <CheckCircle size={14} className={t.benefitIcon} />
                  </div>
                  <span className="text-gray-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 7. Transformation (Before / After) ===== */}
      {isVisible('transformation') && lpData.transformation?.before?.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className={`${t.sectionLabel} font-semibold text-sm mb-2`}>TRANSFORMATION</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                読む前と読んだ後の変化
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 md:gap-4">
              {/* Before */}
              <div className={`${t.transformBeforeBg} rounded-2xl p-6 border ${t.transformBeforeBorder}`}>
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="text-red-400 text-lg">Before</span>
                  <span className="text-sm text-gray-500">読む前</span>
                </h3>
                <div className="space-y-3">
                  {lpData.transformation.before.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">&#x2717;</span>
                      <span className="text-gray-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* After */}
              <div className={`${t.transformAfterBg} rounded-2xl p-6 border ${t.transformAfterBorder}`}>
                <h3 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="text-emerald-500 text-lg">After</span>
                  <span className="text-sm text-gray-500">読んだ後</span>
                </h3>
                <div className="space-y-3">
                  {lpData.transformation.after.map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===== 8. Chapter Summaries ===== */}
      {isVisible('chapter_summaries') && lpData.chapter_summaries?.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className={`${t.sectionLabel} font-semibold text-sm mb-2`}>TABLE OF CONTENTS</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">本書の内容</h2>
            </div>
            <div className="space-y-3">
              {lpData.chapter_summaries.map((chapter, i) => (
                <div key={i} className={`bg-gradient-to-r ${t.chapterBg} rounded-xl p-5 border ${t.chapterBorder}`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg ${t.chapterNumBg} flex items-center justify-center flex-shrink-0`}>
                      <span className={`${t.chapterNum} font-bold text-sm`}>{i + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">{chapter.chapter_title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{chapter.summary}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 9. Social Proof ===== */}
      {isVisible('social_proof') && lpData.social_proof && lpData.social_proof.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className={`${t.sectionLabel} font-semibold text-sm mb-2`}>REVIEWS</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">読者の声</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {lpData.social_proof.map((review, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  {renderStars(review.rating)}
                  <div className="mt-4 mb-4">
                    <Quote size={20} className="text-gray-200 mb-2" />
                    <p className="text-gray-700 text-sm leading-relaxed italic">{review.quote}</p>
                  </div>
                  <p className="text-gray-500 text-xs font-medium">{review.reviewer_name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 10. Bonus ===== */}
      {isVisible('bonus') && lpData.bonus && lpData.bonus.length > 0 && (
        <section className={`py-16 md:py-20 bg-gradient-to-br ${t.bonusBg}`}>
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className={`${t.sectionLabel} font-semibold text-sm mb-2`}>BONUS</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">読者限定の特典</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {lpData.bonus.map((item, i) => (
                <div key={i} className={`bg-white rounded-2xl p-6 border ${t.bonusBorder} shadow-sm`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full ${t.bonusIconBg} flex items-center justify-center flex-shrink-0`}>
                      <Gift size={20} className={t.bonusIcon} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 11. FAQ ===== */}
      {isVisible('faq') && lpData.faq?.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-purple-600 font-semibold text-sm mb-2">FAQ</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">よくあるご質問</h2>
            </div>
            <div className="space-y-3">
              {lpData.faq.map((item, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <div className="flex items-center gap-3">
                      <HelpCircle size={20} className="text-purple-500 flex-shrink-0" />
                      <span className="font-medium text-gray-800">{item.question}</span>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-gray-400 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 pt-0">
                      <div className="pl-8 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                        {item.answer}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 12. Closing Message ===== */}
      {isVisible('closing_message') && lpData.closing_message?.message && (
        <section className={`py-16 md:py-20 bg-gradient-to-br ${t.closingBg}`}>
          <div className="max-w-3xl mx-auto px-4 text-center">
            <MessageCircle size={32} className={`${t.sectionLabel} mx-auto mb-4`} />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              {lpData.closing_message.title || '最後に'}
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">
              {lpData.closing_message.message}
            </p>
          </div>
        </section>
      )}

      {/* ===== 13. CTA Section ===== */}
      <section id="book-lp-cta" className={`py-16 md:py-20 bg-gradient-to-br ${t.ctaBg}`}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {lpData.hero.catchcopy}
          </h2>
          <p className={`${t.ctaLight} text-lg mb-8 max-w-xl mx-auto`}>
            {lpData.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {lpData.cta.amazon_link && (
              <a
                href={lpData.cta.amazon_link}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center justify-center gap-2 bg-white ${t.ctaBtnText} font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all`}
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
                className="inline-flex items-center justify-center gap-2 bg-green-500 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
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
      <footer className="py-6 bg-gray-900 text-center">
        <p className="text-gray-500 text-xs">
          Powered by Kindle出版メーカー
        </p>
      </footer>
    </div>
  );
}
