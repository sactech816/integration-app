'use client';

import React, { useState } from 'react';
import { ChevronDown, CheckCircle, ExternalLink, BookOpen, Target, HelpCircle, Star, ArrowRight } from 'lucide-react';

interface BookLPData {
  hero: { catchcopy: string; subtitle: string; description: string };
  pain_points: Array<{ title: string; description: string }>;
  benefits: Array<{ title: string; description: string }>;
  chapter_summaries: Array<{ chapter_title: string; summary: string }>;
  faq: Array<{ question: string; answer: string }>;
  cta: { amazon_link: string; line_link: string; cta_text: string };
}

interface BookLPDisplayProps {
  lpData: BookLPData;
  bookTitle: string;
  bookSubtitle?: string;
}

export default function BookLPDisplay({ lpData, bookTitle, bookSubtitle }: BookLPDisplayProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const scrollToCta = () => {
    document.getElementById('book-lp-cta')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Noto Sans JP', 'M PLUS Rounded 1c', sans-serif" }}>
      {/* ===== Hero Section ===== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-orange-300 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-amber-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24 text-center">
          <p className="text-orange-600 font-semibold text-sm md:text-base mb-4 tracking-wider">
            {bookSubtitle || lpData.hero.subtitle}
          </p>
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            {lpData.hero.catchcopy}
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            {lpData.hero.description}
          </p>
          <div className="inline-block bg-white/80 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg mb-8">
            <p className="text-gray-700 font-medium flex items-center gap-2">
              <BookOpen size={20} className="text-orange-500" />
              {bookTitle}
            </p>
          </div>
          <div>
            <button
              onClick={scrollToCta}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
            >
              {lpData.cta.cta_text || '今すぐ読む'}
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* ===== Pain Points Section ===== */}
      {lpData.pain_points && lpData.pain_points.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-orange-500 font-semibold text-sm mb-2">PROBLEMS</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                こんなお悩みはありませんか？
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {lpData.pain_points.map((point, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border border-red-100"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                      <Target size={16} className="text-red-500" />
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

      {/* ===== Benefits Section ===== */}
      {lpData.benefits && lpData.benefits.length > 0 && (
        <section className="py-16 md:py-20 bg-gradient-to-br from-green-50 to-emerald-50">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-green-600 font-semibold text-sm mb-2">BENEFITS</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                この本を読むことで得られること
              </h2>
            </div>
            <div className="space-y-4">
              {lpData.benefits.map((benefit, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl p-5 shadow-sm border border-green-100 flex items-start gap-4"
                >
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle size={18} className="text-green-600" />
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

      {/* ===== Table of Contents Section ===== */}
      {lpData.chapter_summaries && lpData.chapter_summaries.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-blue-600 font-semibold text-sm mb-2">TABLE OF CONTENTS</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                本書の内容
              </h2>
            </div>
            <div className="space-y-3">
              {lpData.chapter_summaries.map((chapter, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-700 font-bold text-sm">{i + 1}</span>
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

      {/* ===== FAQ Section ===== */}
      {lpData.faq && lpData.faq.length > 0 && (
        <section className="py-16 md:py-20 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4">
            <div className="text-center mb-12">
              <p className="text-purple-600 font-semibold text-sm mb-2">FAQ</p>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                よくあるご質問
              </h2>
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

      {/* ===== CTA Section ===== */}
      <section id="book-lp-cta" className="py-16 md:py-20 bg-gradient-to-br from-orange-500 to-amber-500">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            {lpData.hero.catchcopy}
          </h2>
          <p className="text-orange-100 text-lg mb-8 max-w-xl mx-auto">
            {lpData.hero.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {lpData.cta.amazon_link && (
              <a
                href={lpData.cta.amazon_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 font-bold text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
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
