'use client';

import React, { useState } from 'react';
import { Block } from '@/lib/types';
import { BlockRenderer } from '@/components/shared/BlockRenderer';
import { getVideoEmbedInfo } from '@/lib/utils';
import { Check, ArrowRight, ChevronDown, Plus, Minus } from 'lucide-react';

interface SiteBlockRendererProps {
  block: Block;
  primaryColor: string;
  sectionIndex: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type D = any;

/**
 * サイト専用のスタイリッシュなブロックレンダラー
 * 対応外のブロックは共通 BlockRenderer へフォールバック
 */
export function SiteBlockRenderer({ block, primaryColor, sectionIndex }: SiteBlockRendererProps) {
  const isEven = sectionIndex % 2 === 0;
  const d = block.data as D;

  switch (block.type) {
    case 'hero':
      return <SiteHero d={d} primaryColor={primaryColor} />;
    case 'text_card':
      return <SiteTextCard d={d} isEven={isEven} />;
    case 'features':
      return <SiteFeatures d={d} isEven={isEven} />;
    case 'testimonial':
      return <SiteTestimonial d={d} primaryColor={primaryColor} />;
    case 'pricing':
      return <SitePricing d={d} primaryColor={primaryColor} />;
    case 'faq':
      return <SiteFaq d={d} primaryColor={primaryColor} />;
    case 'google_map':
      return <SiteGoogleMap d={d} />;
    case 'youtube':
      return <SiteYouTube d={d} />;
    case 'cta_section':
      return <SiteCTA d={d} primaryColor={primaryColor} />;
    case 'gallery':
      return <SiteGallery d={d} />;
    default:
      return <BlockRenderer block={block} variant="business" />;
  }
}

/* ─── Hero ───────────────────────────────────────────── */
function SiteHero({ d, primaryColor }: { d: D; primaryColor: string }) {
  const bgStyle = d.backgroundImage
    ? {}
    : {
        background: d.backgroundColor || `linear-gradient(160deg, ${primaryColor} 0%, ${adjustColor(primaryColor, -30)} 100%)`,
      };

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden" style={bgStyle}>
      {d.backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${d.backgroundImage})`,
              opacity: (d.backgroundOpacity ?? 30) / 100,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60" />
        </>
      )}
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6"
          style={{ color: d.headlineColor || '#ffffff' }}
        >
          {d.headline}
        </h1>
        <p
          className="text-base sm:text-lg md:text-xl font-light max-w-2xl mx-auto mb-12 leading-relaxed"
          style={{ color: d.subheadlineColor || 'rgba(255,255,255,0.75)' }}
        >
          {d.subheadline}
        </p>
        {(d.buttonText || d.ctaText) && (
          <a
            href={d.buttonUrl || d.ctaUrl || '#'}
            className="group inline-flex items-center gap-3 bg-white text-gray-900 font-semibold px-8 py-4 rounded-full text-base transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
          >
            {d.buttonText || d.ctaText}
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        )}
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown size={24} className="text-white/40" />
      </div>
    </section>
  );
}

/* ─── Text Card ──────────────────────────────────────── */
function SiteTextCard({ d, isEven }: { d: D; isEven: boolean }) {
  return (
    <section className={`py-20 sm:py-28 px-6 ${isEven ? 'bg-white' : 'bg-gray-50/60'}`}>
      <div className="max-w-3xl mx-auto">
        {d.title && (
          <div className={`mb-8 ${d.align === 'center' ? 'text-center' : ''}`}>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {d.title}
            </h2>
            <div className="mt-4 w-12 h-[2px] bg-gray-900/20 rounded-full" style={d.align === 'center' ? { margin: '1rem auto 0' } : {}} />
          </div>
        )}
        {d.htmlContent ? (
          <>
            <div
              className={`site-rich-content text-gray-600 leading-[1.9] text-[15px] ${d.align === 'center' ? 'text-center' : ''}`}
              dangerouslySetInnerHTML={{ __html: d.htmlContent }}
            />
            <style jsx global>{`
              .site-rich-content p { margin: 0.75rem 0; min-height: 1em; }
              .site-rich-content p:empty::before { content: '\\00a0'; visibility: hidden; }
              .site-rich-content ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
              .site-rich-content ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
              .site-rich-content li { margin: 0.25rem 0; }
              .site-rich-content strong { font-weight: 700; }
              .site-rich-content em { font-style: italic; }
            `}</style>
          </>
        ) : (
          <p className={`text-gray-600 whitespace-pre-wrap leading-[1.9] text-[15px] ${d.align === 'center' ? 'text-center' : ''}`}>
            {d.text}
          </p>
        )}
      </div>
    </section>
  );
}

/* ─── Features ───────────────────────────────────────── */
function SiteFeatures({ d, isEven }: { d: D; isEven: boolean }) {
  const items = d.items || [];
  const cols = items.length <= 2 ? 2 : items.length === 4 ? 2 : 3;

  return (
    <section className={`py-20 sm:py-28 px-6 ${isEven ? 'bg-white' : 'bg-gray-50/60'}`}>
      <div className="max-w-5xl mx-auto">
        {d.title && (
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {d.title}
            </h2>
            <div className="mt-4 w-12 h-[2px] bg-gray-900/20 rounded-full mx-auto" />
          </div>
        )}
        <div className={`grid grid-cols-1 ${cols === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-x-12 gap-y-14`}>
          {items.map((item: D, i: number) => (
            <div key={item.id || i} className="text-center group">
              {item.icon && (
                <div className="text-4xl mb-5 transition-transform duration-300 group-hover:scale-110">{item.icon}</div>
              )}
              <h3 className="text-lg font-bold text-gray-900 mb-3">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonial ────────────────────────────────────── */
function SiteTestimonial({ d, primaryColor }: { d: D; primaryColor: string }) {
  const items = d.items || [];

  return (
    <section className="py-20 sm:py-28 px-6 bg-gray-50/60">
      <div className="max-w-5xl mx-auto">
        {d.title && (
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {d.title}
            </h2>
            <div className="mt-4 w-12 h-[2px] bg-gray-900/20 rounded-full mx-auto" />
          </div>
        )}
        <div className={`grid grid-cols-1 ${items.length === 1 ? '' : 'md:grid-cols-2'} gap-8`}>
          {items.map((item: D, i: number) => (
            <div
              key={item.id || i}
              className="bg-white rounded-2xl p-8 sm:p-10 border border-gray-100 relative"
            >
              <div className="absolute top-6 left-8 text-6xl font-serif leading-none opacity-[0.06] select-none">&ldquo;</div>
              <p className="text-gray-600 leading-[1.9] text-[15px] relative z-10 mb-6">
                {item.comment}
              </p>
              <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                {item.image || item.imageUrl ? (
                  <img
                    src={item.image || item.imageUrl}
                    alt={item.name}
                    className="w-11 h-11 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {(item.name || '?')[0]}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{item.name}</p>
                  {item.role && <p className="text-xs text-gray-400 mt-0.5">{item.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ────────────────────────────────────────── */
function SitePricing({ d, primaryColor }: { d: D; primaryColor: string }) {
  const plans = d.plans || [];
  const cols = plans.length <= 2 ? plans.length : 3;

  return (
    <section className="py-20 sm:py-28 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        {d.title && (
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {d.title}
            </h2>
            <div className="mt-4 w-12 h-[2px] bg-gray-900/20 rounded-full mx-auto" />
          </div>
        )}
        <div className={`grid grid-cols-1 ${cols >= 3 ? 'lg:grid-cols-3' : cols === 2 ? 'md:grid-cols-2' : ''} gap-6 items-start`}>
          {plans.map((plan: D, i: number) => {
            const isRec = plan.recommended || plan.isRecommended;
            return (
              <div
                key={plan.id || i}
                className={`rounded-2xl p-8 sm:p-10 transition-all duration-300 ${
                  isRec
                    ? 'bg-gray-900 text-white ring-1 ring-gray-900 scale-[1.02] shadow-xl'
                    : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-lg'
                }`}
              >
                {isRec && (
                  <span
                    className="inline-block text-xs font-bold px-3 py-1 rounded-full mb-5"
                    style={{ backgroundColor: primaryColor, color: '#fff' }}
                  >
                    おすすめ
                  </span>
                )}
                <h3 className={`text-lg font-bold mb-2 ${isRec ? 'text-white' : 'text-gray-900'}`}>
                  {plan.name || plan.title}
                </h3>
                <p className={`text-3xl font-bold mb-8 ${isRec ? 'text-white' : 'text-gray-900'}`}>
                  {plan.price}
                </p>
                <ul className="space-y-3.5">
                  {(plan.features || []).map((f: string, fi: number) => (
                    <li key={fi} className={`flex items-start gap-3 text-sm ${isRec ? 'text-gray-300' : 'text-gray-500'}`}>
                      <Check size={16} className={`flex-shrink-0 mt-0.5 ${isRec ? 'text-white/70' : 'text-gray-400'}`} />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ ────────────────────────────────────────────── */
function SiteFaq({ d }: { d: D; primaryColor: string }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const items = d.items || [];

  return (
    <section className="py-20 sm:py-28 px-6 bg-gray-50/60">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            よくある質問
          </h2>
          <div className="mt-4 w-12 h-[2px] bg-gray-900/20 rounded-full mx-auto" />
        </div>
        <div className="divide-y divide-gray-200">
          {items.map((item: D) => {
            const isOpen = openId === item.id;
            return (
              <div key={item.id} className="group">
                <button
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  className="flex items-center justify-between w-full py-6 text-left transition-colors"
                >
                  <span className="font-semibold text-gray-900 text-[15px] pr-4">{item.question}</span>
                  <span className="flex-shrink-0 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center transition-all duration-300 group-hover:border-gray-400">
                    {isOpen ? <Minus size={14} className="text-gray-500" /> : <Plus size={14} className="text-gray-500" />}
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="text-gray-500 text-sm leading-[1.8]">{item.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Google Map ──────────────────────────────────────── */
function SiteGoogleMap({ d }: { d: D }) {
  if (!d.embedUrl) {
    return (
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          {d.title && (
            <div className="text-center mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{d.title}</h2>
              <div className="mt-4 w-12 h-[2px] bg-gray-900/20 rounded-full mx-auto" />
            </div>
          )}
          <div className="rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center" style={{ height: '400px' }}>
            <p className="text-gray-400 text-sm">Google Maps の埋め込みURLを設定してください</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-4xl mx-auto">
        {d.title && (
          <div className="text-center mb-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{d.title}</h2>
            <div className="mt-4 w-12 h-[2px] bg-gray-900/20 rounded-full mx-auto" />
          </div>
        )}
        {d.address && (
          <p className="text-center text-gray-500 text-sm mt-4 mb-8">{d.address}</p>
        )}
        <div className="rounded-2xl overflow-hidden" style={{ height: d.height || '450px' }}>
          <iframe
            src={d.embedUrl}
            className="w-full h-full border-0 grayscale-[30%] contrast-[1.05]"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}

/* ─── YouTube ────────────────────────────────────────── */
function SiteYouTube({ d }: { d: D }) {
  const embedInfo = getVideoEmbedInfo(d.url);

  if (!embedInfo.embedUrl) {
    return (
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden bg-gray-100 flex flex-col items-center justify-center">
          <p className="text-gray-400 text-sm">動画URLを設定してください</p>
          <p className="text-gray-300 text-xs mt-1">YouTube / Vimeo / TikTok に対応</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 px-6 bg-white">
      <div className={`max-w-4xl mx-auto ${embedInfo.aspectClass || 'aspect-video'} rounded-2xl overflow-hidden shadow-lg`}>
        <iframe
          src={embedInfo.embedUrl}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </section>
  );
}

/* ─── CTA Section ────────────────────────────────────── */
function SiteCTA({ d, primaryColor }: { d: D; primaryColor: string }) {
  return (
    <section
      className="py-24 sm:py-32 px-6 text-white"
      style={{ background: d.backgroundGradient || d.backgroundColor || primaryColor }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">{d.title}</h2>
        <p className="text-lg opacity-80 mb-12 leading-relaxed">{d.description}</p>
        {d.buttonText && (
          <a
            href={d.buttonUrl || '#'}
            className="group inline-flex items-center gap-3 bg-white text-gray-900 font-semibold px-8 py-4 rounded-full text-base transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
          >
            {d.buttonText}
            <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        )}
      </div>
    </section>
  );
}

/* ─── Gallery ────────────────────────────────────────── */
function SiteGallery({ d }: { d: D }) {
  const items = d.items || [];

  if (items.length === 0) {
    return (
      <section className="py-16 px-6 bg-gray-50/60">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-gray-100/80 p-16 text-center">
            <p className="text-gray-400 text-sm">ギャラリー画像を追加してください</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 px-6 bg-gray-50/60">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {items.map((item: D, i: number) => (
            <div key={item.id || i} className="aspect-square rounded-xl overflow-hidden group">
              <img
                src={item.url || item.imageUrl}
                alt={item.caption || ''}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── ユーティリティ ─────────────────────────────────── */
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount));
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}
