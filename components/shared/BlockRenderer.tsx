'use client';

import React, { useState, useEffect } from 'react';
import { Block } from '@/lib/types';
import { extractYouTubeId } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';
import { 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Check,
  AlertCircle,
  Gift,
  CheckCircle2
} from 'lucide-react';

// QuizPlayerを動的インポート
const QuizPlayer = dynamic(() => import('@/components/quiz/QuizPlayer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-gray-600">診断クイズを読み込み中...</div>
    </div>
  )
});

interface BlockRendererProps {
  block: Block;
  variant?: 'profile' | 'business' | 'salesletter';
  onLinkClick?: (url: string) => void;
}

/**
 * 共通ブロックレンダラーコンポーネント
 * プロフィールLP・ビジネスLPの両方で使用可能
 */
export function BlockRenderer({ block, variant = 'business', onLinkClick }: BlockRendererProps) {
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  
  const handleLinkClick = (url: string) => {
    if (onLinkClick) {
      onLinkClick(url);
    }
  };

  switch (block.type) {
    // --- 共通ブロック ---
    case 'header':
      return (
        <div className="text-center py-8">
          {block.data.avatar && (
            <img
              src={block.data.avatar}
              alt={block.data.name}
              className="rounded-full mx-auto mb-4 border-4 border-white/30 shadow-lg object-cover"
              style={{
                width: `${Math.round(96 * (block.data.avatarScale || 1))}px`,
                height: `${Math.round(96 * (block.data.avatarScale || 1))}px`,
              }}
            />
          )}
          <h1 className="text-2xl font-bold text-white mb-2">{block.data.name}</h1>
          <p className="text-white/80">{block.data.title}</p>
        </div>
      );

    case 'text_card':
      if (variant === 'profile') {
        return (
          <div className="glass rounded-2xl p-6 mb-4">
            {block.data.title && (
              <h3 className="font-bold text-gray-900 mb-3">{block.data.title}</h3>
            )}
            {block.data.htmlContent ? (
              <>
                <div
                  className={`text-card-rich-content text-gray-700 ${block.data.align === 'center' ? 'text-center' : ''}`}
                  dangerouslySetInnerHTML={{ __html: block.data.htmlContent }}
                />
                <style jsx>{`
                  .text-card-rich-content p { margin: 0.5rem 0; }
                  .text-card-rich-content ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
                  .text-card-rich-content ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
                  .text-card-rich-content li { margin: 0.25rem 0; }
                  .text-card-rich-content strong { font-weight: 700; }
                  .text-card-rich-content em { font-style: italic; }
                  .text-card-rich-content u { text-decoration: underline; }
                  .text-card-rich-content s { text-decoration: line-through; }
                `}</style>
              </>
            ) : (
              <p
                className={`text-gray-700 whitespace-pre-wrap ${block.data.align === 'center' ? 'text-center' : ''}`}
              >
                {block.data.text}
              </p>
            )}
          </div>
        );
      }
      return (
        <section className="py-12 px-6">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            {block.data.title && (
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{block.data.title}</h3>
            )}
            {block.data.htmlContent ? (
              <>
                <div
                  className={`text-card-rich-content text-gray-700 ${block.data.align === 'center' ? 'text-center' : ''}`}
                  dangerouslySetInnerHTML={{ __html: block.data.htmlContent }}
                />
                <style jsx>{`
                  .text-card-rich-content p { margin: 0.5rem 0; }
                  .text-card-rich-content ul { list-style-type: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
                  .text-card-rich-content ol { list-style-type: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
                  .text-card-rich-content li { margin: 0.25rem 0; }
                  .text-card-rich-content strong { font-weight: 700; }
                  .text-card-rich-content em { font-style: italic; }
                  .text-card-rich-content u { text-decoration: underline; }
                  .text-card-rich-content s { text-decoration: line-through; }
                `}</style>
              </>
            ) : (
              <p
                className={`text-gray-700 whitespace-pre-wrap ${block.data.align === 'center' ? 'text-center' : ''}`}
              >
                {block.data.text}
              </p>
            )}
          </div>
        </section>
      );

    case 'image':
      if (!block.data.url) {
        // URLが未設定の場合はプレースホルダーを表示
        if (variant === 'profile') {
          return (
            <div className="mb-4 rounded-2xl overflow-hidden shadow-lg bg-white/90 backdrop-blur p-8 text-center">
              <div className="w-12 h-12 mx-auto mb-2 text-gray-400 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              </div>
              <p className="text-gray-500 text-sm">画像URLを設定してください</p>
            </div>
          );
        }
        return (
          <section className="py-12 px-6">
            <div className="max-w-4xl mx-auto bg-gray-100 rounded-2xl p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              </div>
              <p className="text-gray-500">画像URLを設定してください</p>
            </div>
          </section>
        );
      }
      if (variant === 'profile') {
        return (
          <div className="mb-4">
            <img
              src={block.data.url}
              alt={block.data.caption || ''}
              className="w-full rounded-2xl shadow-lg"
            />
            {block.data.caption && (
              <p className="text-center text-white/70 text-sm mt-2">{block.data.caption}</p>
            )}
          </div>
        );
      }
      return (
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            <img
              src={block.data.url}
              alt={block.data.caption || ''}
              className="w-full rounded-2xl shadow-lg"
            />
            {block.data.caption && (
              <p className="text-center text-gray-500 text-sm mt-4">{block.data.caption}</p>
            )}
          </div>
        </section>
      );

    case 'youtube':
      const videoId = extractYouTubeId(block.data.url);
      if (!videoId) {
        // URLが未設定または無効な場合はプレースホルダーを表示
        if (variant === 'profile') {
          return (
            <div className="mb-4 aspect-video rounded-2xl overflow-hidden shadow-lg bg-white/90 backdrop-blur flex flex-col items-center justify-center">
              <div className="w-12 h-12 mb-2 text-red-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
              </div>
              <p className="text-gray-500 text-sm">YouTube URLを設定してください</p>
            </div>
          );
        }
        return (
          <section className="py-12 px-6">
            <div className="max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-lg bg-gray-100 flex flex-col items-center justify-center">
              <div className="w-16 h-16 mb-4 text-red-500 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
              </div>
              <p className="text-gray-500">YouTube URLを設定してください</p>
            </div>
          </section>
        );
      }
      if (variant === 'profile') {
        return (
          <div className="mb-4 aspect-video rounded-2xl overflow-hidden shadow-lg">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        );
      }
      return (
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto aspect-video rounded-2xl overflow-hidden shadow-lg">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        </section>
      );

    case 'links':
      return (
        <div className="space-y-3 mb-4">
          {block.data.links.map((link, i) => {
            const styleClasses: Record<string, string> = {
              '': 'bg-white/90 text-gray-900 hover:bg-white',
              'orange': 'bg-orange-500 text-white hover:bg-orange-600',
              'blue': 'bg-blue-500 text-white hover:bg-blue-600',
              'green': 'bg-green-500 text-white hover:bg-green-600',
              'purple': 'bg-purple-500 text-white hover:bg-purple-600',
              'line': 'bg-[#06C755] text-white hover:bg-[#05B34C]',
            };
            const styleClass = styleClasses[link.style || ''] || styleClasses[''];
            
            return (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleLinkClick(link.url)}
                className={`flex items-center justify-between w-full px-6 py-4 backdrop-blur rounded-xl font-medium hover:scale-[1.02] transition-all shadow-sm ${styleClass}`}
              >
                <span>{link.label}</span>
                <ExternalLink size={18} className={link.style ? 'text-white/70' : 'text-gray-400'} />
              </a>
            );
          })}
        </div>
      );

    case 'kindle':
      return (
        <div className="glass rounded-2xl p-6 mb-4">
          <div className="flex gap-4">
            {block.data.imageUrl && (
              <img
                src={block.data.imageUrl}
                alt={block.data.title}
                className="w-24 h-auto rounded-lg shadow"
              />
            )}
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-2">{block.data.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{block.data.description}</p>
              {block.data.asin && (
                <a
                  href={`https://www.amazon.co.jp/dp/${block.data.asin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleLinkClick(`https://www.amazon.co.jp/dp/${block.data.asin}`)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-orange-600 hover:underline"
                >
                  Amazonで見る
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      );

    case 'line_card':
      return (
        <div className="bg-[#06C755] rounded-2xl p-6 mb-4 text-white">
          <h4 className="font-bold text-lg mb-2">{block.data.title}</h4>
          <p className="text-white/80 text-sm mb-4">{block.data.description}</p>
          <a
            href={block.data.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => handleLinkClick(block.data.url)}
            className="inline-block w-full text-center bg-white text-[#06C755] font-bold py-3 rounded-xl hover:bg-gray-100 transition-colors"
          >
            {block.data.buttonText}
          </a>
        </div>
      );

    case 'faq':
      return (
        <div className={variant === 'profile' ? 'space-y-3 mb-4' : 'py-20 px-6'}>
          {variant === 'business' && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-black text-center text-gray-900 mb-12">よくある質問</h2>
            </div>
          )}
          <div className={`space-y-${variant === 'profile' ? '3' : '4'} ${variant === 'business' ? 'max-w-3xl mx-auto' : ''}`}>
            {block.data.items.map((item) => (
              <div 
                key={item.id} 
                className={variant === 'profile' 
                  ? 'glass rounded-xl overflow-hidden' 
                  : 'bg-white rounded-xl border border-gray-100 overflow-hidden'
                }
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === item.id ? null : item.id)}
                  className={`w-full flex items-center justify-between p-${variant === 'profile' ? '4' : '5'} text-left ${variant === 'business' ? 'hover:bg-gray-50' : ''}`}
                >
                  <span className={`font-${variant === 'profile' ? 'medium' : 'semibold'} text-gray-900`}>
                    Q. {item.question}
                  </span>
                  {expandedFaq === item.id ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </button>
                {expandedFaq === item.id && (
                  <div className={`px-${variant === 'profile' ? '4' : '5'} pb-${variant === 'profile' ? '4' : '5'} text-gray-600`}>
                    A. {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    case 'testimonial':
      if (variant === 'profile') {
        return (
          <div className="space-y-4 mb-4">
            {block.data.items.map((item) => (
              <div key={item.id} className="glass rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.role}</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">{item.comment}</p>
              </div>
            ))}
          </div>
        );
      }
      return (
        <section className={`py-20 px-6 bg-white ${block.data.isFullWidth ? 'w-full' : ''}`}>
          <div className={block.data.isFullWidth ? 'w-full px-4 lg:px-8' : 'max-w-4xl mx-auto'}>
            <h2 className="text-3xl font-black text-center text-gray-900 mb-12">お客様の声</h2>
            <div className={`grid ${block.data.isFullWidth ? 'md:grid-cols-3 lg:grid-cols-4' : 'md:grid-cols-2'} gap-8`}>
              {block.data.items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.role}</p>
                    </div>
                  </div>
                  <p className="text-gray-700">&ldquo;{item.comment}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'pricing':
      if (variant === 'profile') {
        return (
          <div className="space-y-4 mb-4">
            {block.data.plans.map((plan) => (
              <div 
                key={plan.id} 
                className={`rounded-2xl p-6 ${plan.isRecommended ? 'bg-white ring-2 ring-indigo-500' : 'glass'}`}
              >
                {plan.isRecommended && (
                  <span className="inline-block bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3">
                    おすすめ
                  </span>
                )}
                <h4 className="font-bold text-lg text-gray-900">{plan.title}</h4>
                <p className="text-2xl font-black text-gray-900 my-2">{plan.price}</p>
                <ul className="space-y-2">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        );
      }
      return (
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-black text-center text-gray-900 mb-12">料金プラン</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {block.data.plans.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`rounded-2xl p-8 ${
                    plan.isRecommended 
                      ? 'bg-amber-500 text-white ring-4 ring-amber-300 scale-105' 
                      : 'bg-white shadow-lg'
                  }`}
                >
                  {plan.isRecommended && (
                    <span className="inline-block bg-white text-amber-600 text-xs font-bold px-3 py-1 rounded-full mb-4">
                      おすすめ
                    </span>
                  )}
                  <h3 className={`text-xl font-bold ${plan.isRecommended ? '' : 'text-gray-900'}`}>
                    {plan.title}
                  </h3>
                  <p className={`text-3xl font-black my-4 ${plan.isRecommended ? '' : 'text-gray-900'}`}>
                    {plan.price}
                  </p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className={`flex items-center gap-2 text-sm ${plan.isRecommended ? 'text-white/90' : 'text-gray-600'}`}>
                        <Check size={16} className={plan.isRecommended ? 'text-white' : 'text-green-500'} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'lead_form':
      return <LeadFormBlockRenderer block={block} variant={variant} />;

    case 'quiz':
      return <QuizBlockRenderer block={block} />;

    case 'countdown':
      return <CountdownBlockRenderer block={block} />;

    case 'gallery':
      return <GalleryBlockRenderer block={block} variant={variant} />;

    // --- ビジネスLP専用ブロック ---
    case 'hero':
      return (
        <section 
          className="relative py-24 px-6 text-white overflow-hidden"
          style={{ background: block.data.backgroundColor || 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
        >
          {block.data.backgroundImage && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${block.data.backgroundImage})`,
                opacity: (block.data.backgroundOpacity ?? 20) / 100,
              }}
            />
          )}
          <div className={`relative ${block.data.isFullWidth ? 'max-w-6xl' : 'max-w-4xl'} mx-auto text-center`}>
            <h1
              className={`text-4xl sm:text-5xl lg:text-6xl ${block.data.headlineBold !== false ? 'font-black' : 'font-normal'} mb-6 leading-tight whitespace-pre-line`}
              style={{ color: block.data.headlineColor || 'white' }}
            >
              {block.data.headline}
            </h1>
            <p
              className="text-xl sm:text-2xl mb-10"
              style={{ color: block.data.subheadlineColor || 'rgba(255,255,255,0.9)' }}
            >
              {block.data.subheadline}
            </p>
            {block.data.ctaText && (
              <a
                href={block.data.ctaUrl || '#'}
                onClick={() => block.data.ctaUrl && handleLinkClick(block.data.ctaUrl)}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-full text-lg transition-all shadow-xl hover:shadow-2xl"
              >
                {block.data.ctaText}
                <ArrowRight size={20} />
              </a>
            )}
          </div>
        </section>
      );

    case 'features':
      return (
        <section className={`py-20 px-6 bg-gray-50 ${block.data.isFullWidth ? 'w-full' : ''}`}>
          <div className={block.data.isFullWidth ? 'w-full px-4 lg:px-8' : 'max-w-6xl mx-auto'}>
            {block.data.title && (
              <h2 className="text-3xl sm:text-4xl font-black text-center text-gray-900 mb-16">
                {block.data.title}
              </h2>
            )}
            <div className={`grid grid-cols-1 md:grid-cols-${block.data.columns || 3} gap-8`}>
              {block.data.items.map((item) => (
                <div key={item.id} className="text-center p-6">
                  {item.icon && (
                    <div className="text-5xl mb-4">{item.icon}</div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'two_column':
      const isImageLeft = block.data.layout === 'image-left';
      return (
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div className={isImageLeft ? '' : 'order-2'}>
              {block.data.imageUrl && (
                <img 
                  src={block.data.imageUrl} 
                  alt={block.data.title}
                  className="w-full rounded-2xl shadow-lg"
                />
              )}
            </div>
            <div className={isImageLeft ? '' : 'order-1'}>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                {block.data.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">{block.data.text}</p>
              {block.data.listItems && (
                <ul className="space-y-3">
                  {block.data.listItems.map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <Check size={20} className="text-green-500 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      );

    case 'cta_section':
      return (
        <section 
          className={`py-20 px-6 text-white ${block.data.isFullWidth ? 'w-full' : ''}`}
          style={{ background: block.data.backgroundGradient || block.data.backgroundColor || '#f59e0b' }}
        >
          <div className={`${block.data.isFullWidth ? 'max-w-5xl' : 'max-w-3xl'} mx-auto text-center`}>
            <h2 className="text-3xl sm:text-4xl font-black mb-6">{block.data.title}</h2>
            <p className="text-xl opacity-90 mb-10">{block.data.description}</p>
            <a
              href={block.data.buttonUrl || '#'}
              onClick={() => block.data.buttonUrl && handleLinkClick(block.data.buttonUrl)}
              className="inline-flex items-center gap-2 bg-white text-gray-900 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-all shadow-xl"
            >
              {block.data.buttonText}
              <ArrowRight size={20} />
            </a>
          </div>
        </section>
      );

    case 'google_map':
      return (
        <section className="py-12 px-6">
          <div className="max-w-4xl mx-auto">
            {block.data.title && (
              <h3 className="text-2xl font-bold text-center text-gray-900 mb-6">{block.data.title}</h3>
            )}
            {block.data.address && (
              <p className="text-center text-gray-600 mb-4">{block.data.address}</p>
            )}
            <div 
              className="rounded-2xl overflow-hidden shadow-lg"
              style={{ height: block.data.height || '400px' }}
            >
              <iframe
                src={block.data.embedUrl}
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        </section>
      );

    // --- 新規追加ブロック（ビジネスLP拡張） ---
    case 'hero_fullwidth':
      const heightClass = {
        short: 'min-h-[50vh]',
        medium: 'min-h-[70vh]',
        tall: 'min-h-[85vh]',
        full: 'min-h-screen'
      }[block.data.height || 'medium'];
      
      return (
        <section 
          className={`relative ${heightClass} flex items-center justify-center px-6 text-white overflow-hidden`}
          style={{ background: block.data.backgroundColor || '#1e293b' }}
        >
          {block.data.backgroundImage && (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${block.data.backgroundImage})`,
                opacity: (block.data.backgroundOpacity ?? (block.data.overlay ? 40 : 100)) / 100,
              }}
            />
          )}
          {block.data.overlay && block.data.backgroundImage && (
            <div className="absolute inset-0 bg-black/50" />
          )}
          <div className="relative max-w-4xl mx-auto text-center">
            <h1
              className={`text-4xl sm:text-5xl lg:text-7xl ${block.data.headlineBold !== false ? 'font-black' : 'font-normal'} mb-6 leading-tight whitespace-pre-line`}
              style={{ color: block.data.headlineColor || 'white' }}
            >
              {block.data.headline}
            </h1>
            {block.data.subheadline && (
              <p
                className="text-xl sm:text-2xl mb-10"
                style={{ color: block.data.subheadlineColor || 'rgba(255,255,255,0.9)' }}
              >
                {block.data.subheadline}
              </p>
            )}
            {block.data.ctaText && (
              <a
                href={block.data.ctaUrl || '#'}
                onClick={() => block.data.ctaUrl && handleLinkClick(block.data.ctaUrl)}
                className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-10 py-5 rounded-full text-xl transition-all shadow-xl hover:shadow-2xl"
              >
                {block.data.ctaText}
                <ArrowRight size={24} />
              </a>
            )}
          </div>
        </section>
      );

    case 'problem_cards':
      return (
        <section className={`py-20 px-6 bg-red-50 ${block.data.isFullWidth ? 'w-full' : ''}`}>
          <div className={block.data.isFullWidth ? 'w-full px-4 lg:px-8' : 'max-w-5xl mx-auto'}>
            {block.data.sectionTitle && (
              <h2 className="text-3xl sm:text-4xl font-black text-center text-gray-900 mb-12">
                {block.data.sectionTitle}
              </h2>
            )}
            <div className={`grid md:grid-cols-2 ${block.data.isFullWidth ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
              {block.data.items.map((item) => (
                <div key={item.id} className="bg-white rounded-2xl p-6 shadow-lg border-l-4 border-red-400">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="text-red-500 flex-shrink-0 mt-1" size={24} />
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'dark_section':
      return (
        <section 
          className={`py-20 px-6 text-white ${block.data.isFullWidth ? 'w-full' : ''}`}
          style={{ background: block.data.backgroundColor || 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}
        >
          <div className={`${block.data.isFullWidth ? 'max-w-6xl' : 'max-w-4xl'} mx-auto text-center`}>
            <h2 className="text-3xl sm:text-4xl font-black mb-6">{block.data.title}</h2>
            <p className="text-xl opacity-90 mb-8 leading-relaxed">{block.data.description}</p>
            {block.data.bulletPoints && block.data.bulletPoints.length > 0 && (
              <ul className="inline-block text-left space-y-3 mt-6">
                {block.data.bulletPoints.map((point, i) => (
                  <li key={i} className="flex items-center gap-3 text-lg">
                    <Check className="text-green-400 flex-shrink-0" size={20} />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      );

    case 'case_study_cards':
      return (
        <section className="py-20 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            {block.data.sectionTitle && (
              <h2 className="text-3xl sm:text-4xl font-black text-center text-gray-900 mb-12">
                {block.data.sectionTitle}
              </h2>
            )}
            <div className="grid md:grid-cols-2 gap-8">
              {block.data.items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-2xl overflow-hidden shadow-lg">
                  {item.imageUrl && (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="font-bold text-xl text-gray-900 mb-4">{item.title}</h3>
                    {(item.beforeText || item.afterText) && (
                      <div className="flex gap-4 mb-4">
                        {item.beforeText && (
                          <div className="flex-1 bg-red-50 rounded-lg p-3">
                            <span className="text-xs text-red-600 font-bold">Before</span>
                            <p className="text-sm text-gray-700 mt-1">{item.beforeText}</p>
                          </div>
                        )}
                        {item.afterText && (
                          <div className="flex-1 bg-green-50 rounded-lg p-3">
                            <span className="text-xs text-green-600 font-bold">After</span>
                            <p className="text-sm text-gray-700 mt-1">{item.afterText}</p>
                          </div>
                        )}
                      </div>
                    )}
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case 'bonus_section':
      return (
        <section className={`py-20 px-6 bg-gradient-to-r from-amber-500 to-orange-500 ${block.data.isFullWidth ? 'w-full' : ''}`}>
          <div className={block.data.isFullWidth ? 'w-full px-4 lg:px-8' : 'max-w-5xl mx-auto'}>
            {block.data.sectionTitle && (
              <h2 className="text-3xl sm:text-4xl font-black text-center text-white mb-12">
                {block.data.sectionTitle}
              </h2>
            )}
            <div className={`grid md:grid-cols-2 ${block.data.isFullWidth ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-6`}>
              {block.data.items.map((item, index) => (
                <div key={item.id} className="bg-white rounded-2xl p-6 shadow-xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                      <Gift className="text-amber-600" size={20} />
                    </div>
                    <span className="text-amber-600 font-bold">特典 {index + 1}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                  {item.value && (
                    <p className="text-amber-600 font-bold text-sm">
                      通常価格 {item.value}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {block.data.totalValue && (
              <div className="mt-10 text-center">
                <p className="text-white text-2xl font-bold">
                  総額 <span className="text-4xl">{block.data.totalValue}</span> 相当
                </p>
              </div>
            )}
          </div>
        </section>
      );

    case 'checklist_section':
      const styleClass = {
        simple: 'bg-white',
        card: 'bg-gray-50',
        highlight: 'bg-green-50'
      }[block.data.style || 'simple'];
      
      return (
        <section className={`py-20 px-6 ${styleClass} ${block.data.isFullWidth ? 'w-full' : ''}`}>
          <div className={block.data.isFullWidth ? 'max-w-6xl mx-auto px-4 lg:px-8' : 'max-w-3xl mx-auto'}>
            {block.data.sectionTitle && (
              <h2 className="text-3xl font-black text-center text-gray-900 mb-12">
                {block.data.sectionTitle}
              </h2>
            )}
            <ul className={`${block.data.isFullWidth ? 'grid md:grid-cols-2 gap-4' : 'space-y-4'}`}>
              {block.data.items.map((item, i) => {
                // itemはChecklistItem型のオブジェクト
                const itemId = item.id;
                const itemTitle = item.title;
                const itemDescription = item.description;
                const itemIcon = item.icon;
                
                return (
                  <li 
                    key={itemId ?? i} 
                    className={`flex items-start gap-4 p-4 rounded-xl ${
                      block.data.style === 'card' ? 'bg-white shadow-md' : 
                      block.data.style === 'highlight' ? 'bg-green-100' : ''
                    }`}
                  >
                    {itemIcon ? (
                      <span className="text-2xl flex-shrink-0">{itemIcon}</span>
                    ) : (
                      <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={24} />
                    )}
                    <div>
                      <span className="text-gray-800 font-medium">{itemTitle}</span>
                      {itemDescription && (
                        <p className="text-gray-600 text-sm mt-1">{itemDescription}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      );

    // --- セールスレター専用ブロック ---
    case 'sales_headline':
      const HeadlineTag = block.data.level as 'h1' | 'h2' | 'h3' | 'h4';
      const headlineTextStyle: React.CSSProperties = {
        color: block.data.color || '#1f2937',
        fontSize: `${block.data.fontSize || 32}px`,
        fontWeight: block.data.fontWeight === 'normal' ? 400 :
                    block.data.fontWeight === 'medium' ? 500 :
                    block.data.fontWeight === 'semibold' ? 600 :
                    block.data.fontWeight === 'bold' ? 700 : 800,
        letterSpacing: block.data.letterSpacing ? `${block.data.letterSpacing}em` : undefined,
        lineHeight: block.data.lineHeight || 1.4,
        textAlign: block.data.align,
        padding: block.data.padding ? `${block.data.padding}px` : '16px 0',
        textDecoration: block.data.underline ? 'underline' : 'none',
        textDecorationColor: block.data.underlineColor || block.data.color || '#1f2937',
      };
      
      // 背景スタイル
      const headlineBgStyle: React.CSSProperties = {};
      const headlineOpacity = (block.data.backgroundOpacity ?? 100) / 100;
      
      if (block.data.backgroundType === 'image' && block.data.backgroundImage) {
        headlineBgStyle.backgroundImage = `linear-gradient(rgba(255,255,255,${1-headlineOpacity}), rgba(255,255,255,${1-headlineOpacity})), url(${block.data.backgroundImage})`;
        headlineBgStyle.backgroundSize = 'cover';
        headlineBgStyle.backgroundPosition = 'center';
      } else if (block.data.backgroundType === 'color' && block.data.backgroundColor) {
        headlineBgStyle.backgroundColor = block.data.backgroundColor;
        headlineBgStyle.opacity = headlineOpacity;
      }
      
      // 幅設定
      const headlineWidth = block.data.backgroundWidth === 'full' ? '100vw' :
                           block.data.backgroundWidth === 'custom' ? `${block.data.customBackgroundWidth || 600}px` :
                           '100%';
      const headlineMargin = block.data.backgroundWidth === 'full' ? 'calc(-50vw + 50%)' : '0';
      
      return (
        <div 
          className="mb-6" 
          style={{
            ...(block.data.backgroundType && block.data.backgroundType !== 'none' ? {
              ...headlineBgStyle,
              width: headlineWidth,
              marginLeft: headlineMargin,
              marginRight: headlineMargin,
            } : {}),
          }}
        >
          <HeadlineTag style={headlineTextStyle}>{block.data.text}</HeadlineTag>
        </div>
      );

    case 'sales_paragraph':
      // 背景スタイル
      const paragraphBgStyle: React.CSSProperties = {};
      const paragraphOpacity = (block.data.backgroundOpacity ?? 100) / 100;
      
      if (block.data.backgroundType === 'image' && block.data.backgroundImage) {
        paragraphBgStyle.backgroundImage = `linear-gradient(rgba(255,255,255,${1-paragraphOpacity}), rgba(255,255,255,${1-paragraphOpacity})), url(${block.data.backgroundImage})`;
        paragraphBgStyle.backgroundSize = 'cover';
        paragraphBgStyle.backgroundPosition = 'center';
      } else if (block.data.backgroundType === 'color' && block.data.backgroundColor) {
        paragraphBgStyle.backgroundColor = block.data.backgroundColor;
        if (paragraphOpacity < 1) {
          const hexToRgba = (hex: string, alpha: number) => {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
          };
          paragraphBgStyle.backgroundColor = hexToRgba(block.data.backgroundColor, paragraphOpacity);
        }
      }
      
      // 幅設定
      const paragraphWidth = block.data.backgroundWidth === 'full' ? '100vw' :
                            block.data.backgroundWidth === 'custom' ? `${block.data.customBackgroundWidth || 600}px` :
                            '100%';
      const paragraphMargin = block.data.backgroundWidth === 'full' ? 'calc(-50vw + 50%)' : '0';
      
      const paragraphContentStyle: React.CSSProperties = {
        textAlign: block.data.align,
        fontSize: `${block.data.defaultFontSize || 16}px`,
        lineHeight: block.data.lineHeight || 1.8,
        padding: block.data.padding ? `${block.data.padding}px` : '8px 0',
      };
      
      return (
        <div 
          className="mb-6"
          style={{
            ...(block.data.backgroundType && block.data.backgroundType !== 'none' ? {
              ...paragraphBgStyle,
              width: paragraphWidth,
              marginLeft: paragraphMargin,
              marginRight: paragraphMargin,
            } : {}),
          }}
        >
          <div
            style={paragraphContentStyle}
            className="sales-paragraph-content"
            dangerouslySetInnerHTML={{ __html: block.data.htmlContent }}
          />
          <style jsx>{`
            .sales-paragraph-content {
              color: ${block.data.defaultColor || '#374151'};
            }
            .sales-paragraph-content p {
              margin: 0.5rem 0;
            }
            .sales-paragraph-content ul {
              list-style-type: disc;
              padding-left: 1.5rem;
              margin: 0.5rem 0;
            }
            .sales-paragraph-content ol {
              list-style-type: decimal;
              padding-left: 1.5rem;
              margin: 0.5rem 0;
            }
            .sales-paragraph-content li {
              margin: 0.25rem 0;
            }
            .sales-paragraph-content strong {
              font-weight: 700;
            }
            .sales-paragraph-content em {
              font-style: italic;
            }
            .sales-paragraph-content u {
              text-decoration: underline;
            }
            .sales-paragraph-content s {
              text-decoration: line-through;
            }
          `}</style>
        </div>
      );

    case 'sales_image':
      if (!block.data.src) {
        return (
          <div className="mb-6 bg-gray-100 rounded-lg p-12 text-center">
            <p className="text-gray-500">画像URLを設定してください</p>
          </div>
        );
      }
      const imageWidthClass = {
        full: 'w-full',
        large: 'max-w-4xl mx-auto',
        medium: 'max-w-2xl mx-auto',
        small: 'max-w-md mx-auto',
      }[block.data.width || 'full'];
      const imageRadiusClass = {
        none: 'rounded-none',
        sm: 'rounded',
        md: 'rounded-lg',
        lg: 'rounded-xl',
        xl: 'rounded-2xl',
      }[block.data.borderRadius || 'md'];
      const imageShadowClass = {
        none: '',
        sm: 'shadow-sm',
        md: 'shadow-md',
        lg: 'shadow-lg',
      }[block.data.shadow || 'none'];
      const imageAlignClass = {
        left: 'mr-auto',
        center: 'mx-auto',
        right: 'ml-auto',
      }[block.data.align || 'center'];

      const salesImageElement = (
        <img
          src={block.data.src}
          alt={block.data.alt}
          className={`${imageWidthClass} ${imageRadiusClass} ${imageShadowClass} ${imageAlignClass}`}
        />
      );
      return (
        <figure className="mb-6">
          {block.data.link ? (
            <a href={block.data.link} target="_blank" rel="noopener noreferrer" onClick={() => handleLinkClick(block.data.link!)}>
              {salesImageElement}
            </a>
          ) : (
            salesImageElement
          )}
          {block.data.caption && (
            <figcaption className={`text-${block.data.align || 'center'} text-sm text-gray-500 mt-2`}>
              {block.data.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'sales_cta':
      const ctaSizeClasses = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
        xl: 'px-10 py-5 text-xl',
      }[block.data.size];
      const ctaRadiusMap = {
        none: '0px',
        sm: '4px',
        md: '8px',
        lg: '16px',
        full: '9999px',
      }[block.data.borderRadius];
      const ctaShadowMap = {
        none: 'none',
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      }[block.data.shadow || 'none'];

      const iconElement = block.data.icon !== 'none' && block.data.icon && (
        block.data.icon === 'arrow' ? <ArrowRight size={20} /> :
        block.data.icon === 'external' ? <ExternalLink size={20} /> : null
      );

      return (
        <div className={`mb-6 ${block.data.fullWidth ? '' : 'text-center'}`}>
          <a
            href={block.data.url}
            target={block.data.url.startsWith('http') ? '_blank' : undefined}
            rel={block.data.url.startsWith('http') ? 'noopener noreferrer' : undefined}
            onClick={() => handleLinkClick(block.data.url)}
            className={`
              inline-flex items-center justify-center gap-2 font-bold transition-all hover:opacity-90
              ${ctaSizeClasses}
              ${block.data.fullWidth ? 'w-full' : ''}
            `}
            style={{
              backgroundColor: block.data.backgroundColor,
              color: block.data.textColor,
              borderRadius: ctaRadiusMap,
              boxShadow: ctaShadowMap,
            }}
          >
            {block.data.iconPosition === 'left' && iconElement}
            {block.data.text}
            {block.data.iconPosition === 'right' && iconElement}
          </a>
        </div>
      );

    case 'sales_spacer':
      return (
        <div
          style={{ height: `${block.data.height}px` }}
          className="md:block"
        />
      );

    case 'sales_divider':
      if (block.data.variant === 'dots') {
        return (
          <div className="flex justify-center gap-2 my-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: block.data.lineColor }}
              />
            ))}
          </div>
        );
      }
      if (block.data.variant === 'wave') {
        return (
          <div className="text-center my-6" style={{ color: block.data.lineColor }}>
            <span className="text-2xl">〜〜〜</span>
          </div>
        );
      }
      const dividerLineStyle: React.CSSProperties = {
        borderTopWidth: `${block.data.lineWidth}px`,
        borderTopStyle: block.data.lineStyle as 'solid' | 'dashed' | 'dotted',
        borderTopColor: block.data.lineColor,
      };
      if (block.data.variant === 'short') {
        dividerLineStyle.width = `${block.data.shortWidth || 30}%`;
        dividerLineStyle.marginLeft = 'auto';
        dividerLineStyle.marginRight = 'auto';
      }
      return <hr style={dividerLineStyle} className="border-0 my-6" />;

    case 'sales_countdown':
      return (
        <SalesCountdownBlock
          targetDate={block.data.targetDate}
          title={block.data.title}
          expiredAction={block.data.expiredAction}
          expiredText={block.data.expiredText}
          expiredUrl={block.data.expiredUrl}
          backgroundColor={block.data.backgroundColor}
          textColor={block.data.textColor}
        />
      );

    case 'sales_youtube':
      if (!block.data.url) {
        return (
          <div className="mb-6 bg-gray-100 rounded-lg p-12 text-center">
            <p className="text-gray-500">YouTube URLを設定してください</p>
          </div>
        );
      }
      const getYouTubeId = (url: string) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
        return match ? match[1] : null;
      };
      const ytVideoId = getYouTubeId(block.data.url);
      const ytAspectRatio = block.data.aspectRatio === '4:3' ? 'aspect-[4/3]' : 
                          block.data.aspectRatio === '1:1' ? 'aspect-square' : 'aspect-video';
      return (
        <div className="mb-6">
          {block.data.title && (
            <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">{block.data.title}</h3>
          )}
          {ytVideoId ? (
            <div className={`relative ${ytAspectRatio} rounded-lg overflow-hidden`}>
              <iframe
                src={`https://www.youtube.com/embed/${ytVideoId}${block.data.autoplay ? '?autoplay=1' : ''}${block.data.muted ? '&mute=1' : ''}`}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-12 text-center">
              <p className="text-gray-500">無効なYouTube URLです</p>
            </div>
          )}
        </div>
      );

    case 'sales_faq':
      return (
        <div className="mb-6">
          <div
            className="rounded-xl overflow-hidden"
            style={{ backgroundColor: block.data.backgroundColor || '#ffffff' }}
          >
            {block.data.items?.map((item: { id: string; question: string; answer: string }, index: number) => (
              <SalesFaqItem
                key={item.id}
                question={item.question}
                answer={item.answer}
                isLast={index === block.data.items.length - 1}
                questionColor={block.data.questionColor}
                answerColor={block.data.answerColor}
              />
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
}

// Countdown Block Renderer Component
function CountdownBlockRenderer({ block }: { block: Extract<Block, { type: 'countdown' }> }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetDate = new Date(block.data.targetDate);
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
      setIsExpired(false);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [block.data.targetDate]);

  if (isExpired) {
    return (
      <div className="glass rounded-2xl p-6 mb-4 text-center">
        {block.data.title && (
          <h3 className="text-xl font-bold text-gray-900 mb-2">{block.data.title}</h3>
        )}
        <p className="text-gray-600">{block.data.expiredText || '期限切れ'}</p>
      </div>
    );
  }

  if (!timeLeft) {
    return (
      <div className="glass rounded-2xl p-6 mb-4 text-center">
        <div className="text-gray-600">読み込み中...</div>
      </div>
    );
  }

  return (
    <div 
      className="glass rounded-2xl p-6 mb-4 text-center"
      style={{ backgroundColor: block.data.backgroundColor || undefined }}
    >
      {block.data.title && (
        <h3 className="text-xl font-bold text-white mb-4">{block.data.title}</h3>
      )}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white/20 backdrop-blur rounded-xl p-4">
          <div className="text-3xl font-black text-white">{timeLeft.days}</div>
          <div className="text-sm text-white/80 mt-1">日</div>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-xl p-4">
          <div className="text-3xl font-black text-white">{timeLeft.hours}</div>
          <div className="text-sm text-white/80 mt-1">時間</div>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-xl p-4">
          <div className="text-3xl font-black text-white">{timeLeft.minutes}</div>
          <div className="text-sm text-white/80 mt-1">分</div>
        </div>
        <div className="bg-white/20 backdrop-blur rounded-xl p-4">
          <div className="text-3xl font-black text-white">{timeLeft.seconds}</div>
          <div className="text-sm text-white/80 mt-1">秒</div>
        </div>
      </div>
    </div>
  );
}

// Gallery Block Renderer Component
function GalleryBlockRenderer({ block, variant }: { block: Extract<Block, { type: 'gallery' }>; variant?: 'profile' | 'business' | 'salesletter' }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!block.data.items || block.data.items.length === 0) {
    return (
      <div className="glass rounded-2xl p-6 mb-4 text-center">
        <p className="text-gray-600">画像が設定されていません</p>
      </div>
    );
  }

  const columns = block.data.columns || 3;
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  }[columns] || 'grid-cols-3';

  if (variant === 'profile') {
    return (
      <div className="mb-4">
        {block.data.title && (
          <h3 className="text-xl font-bold text-white mb-4 text-center">{block.data.title}</h3>
        )}
        <div className={`grid ${gridCols} gap-2`}>
          {block.data.items.map((item) => (
            <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden shadow-lg cursor-pointer" onClick={() => setSelectedImage(item.imageUrl)}>
              <img
                src={item.imageUrl}
                alt={item.caption || ''}
                className="w-full h-full object-cover hover:scale-105 transition-transform"
              />
              {block.data.showCaptions && item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-sm p-2 text-center">
                  {item.caption}
                </div>
              )}
            </div>
          ))}
        </div>
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <img src={selectedImage} alt="" className="max-w-full max-h-full object-contain" />
          </div>
        )}
      </div>
    );
  }

  return (
    <section className="py-12 px-6">
      <div className="max-w-6xl mx-auto">
        {block.data.title && (
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{block.data.title}</h3>
        )}
        <div className={`grid ${gridCols} gap-4`}>
          {block.data.items.map((item) => (
            <div key={item.id} className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer group" onClick={() => setSelectedImage(item.imageUrl)}>
              <img
                src={item.imageUrl}
                alt={item.caption || ''}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
              {block.data.showCaptions && item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white p-4">
                  <p className="text-sm">{item.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <img src={selectedImage} alt="" className="max-w-full max-h-full object-contain" />
          </div>
        )}
      </div>
    </section>
  );
}

// Quiz Block Renderer Component
function QuizBlockRenderer({ block }: { block: Extract<Block, { type: 'quiz' }> }) {
  const [quiz, setQuiz] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!supabase) {
        setError('データベースに接続できません');
        setIsLoading(false);
        return;
      }

      try {
        let query = supabase.from('quizzes').select('*');
        
        if (block.data.quizSlug) {
          query = query.eq('slug', block.data.quizSlug);
        } else if (block.data.quizId) {
          const id = isNaN(Number(block.data.quizId)) 
            ? block.data.quizId 
            : Number(block.data.quizId);
          query = query.eq('id', id);
        } else {
          setError('診断クイズのIDまたはSlugが設定されていません');
          setIsLoading(false);
          return;
        }

        const { data, error: fetchError } = await query.single();

        if (fetchError) {
          console.error('診断クイズ取得エラー:', fetchError);
          setError('診断クイズが見つかりませんでした');
        } else if (data) {
          setQuiz(data);
        }
      } catch (err) {
        console.error('診断クイズ取得エラー:', err);
        setError('診断クイズの読み込みに失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [block.data.quizId, block.data.quizSlug]);

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-6 mb-4 text-center">
        <div className="text-gray-600">診断クイズを読み込み中...</div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="glass rounded-2xl p-6 mb-4 text-center">
        <p className="text-gray-600">{error || '診断クイズが見つかりませんでした'}</p>
      </div>
    );
  }

  const handleBack = () => {
    // 埋め込み時は戻る動作を無効化
  };

  return (
    <div className="glass rounded-2xl p-4 mb-4 overflow-hidden">
      {block.data.title && (
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
          {block.data.title}
        </h3>
      )}
      <div className="relative w-full">
        <QuizPlayer quiz={quiz} onBack={handleBack} />
      </div>
    </div>
  );
}

// Lead Form Block Renderer Component
function LeadFormBlockRenderer({ block, variant }: { block: Extract<Block, { type: 'lead_form' }>; variant?: 'profile' | 'business' | 'salesletter' }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      // メール送信が有効な場合はAPIを呼び出す
      if (block.data.sendEmail) {
        const response = await fetch('/api/lead-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name: block.data.showName ? name : undefined,
            message: block.data.showMessage ? message : undefined,
            content_title: block.data.title,
            admin_email: block.data.adminEmail,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '送信に失敗しました');
        }
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 送信完了後の表示
  if (isSubmitted) {
    return (
      <div className={variant === 'profile' ? 'glass rounded-2xl p-6 mb-4 text-center' : 'bg-white rounded-2xl shadow-lg p-8 text-center'}>
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">登録完了！</h3>
        <p className="text-gray-600">ご登録ありがとうございます。</p>
      </div>
    );
  }

  if (variant === 'profile') {
    return (
      <div className="glass rounded-2xl p-6 mb-4">
        <h4 className="font-bold text-lg text-gray-900 mb-4 text-center">{block.data.title}</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          {block.data.showName && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="お名前"
              className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white shadow-sm placeholder:text-gray-500"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="メールアドレス"
            className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white shadow-sm placeholder:text-gray-500"
          />
          {block.data.showMessage && (
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="メッセージ（任意）"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white shadow-sm resize-none placeholder:text-gray-500"
            />
          )}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '送信中...' : block.data.buttonText}
          </button>
        </form>
      </div>
    );
  }

  // business variant
  return (
    <section className="py-12 px-6">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8">
        <h4 className="font-bold text-xl text-gray-900 mb-6 text-center">{block.data.title}</h4>
        <form onSubmit={handleSubmit} className="space-y-4">
          {block.data.showName && (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="お名前"
              className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white shadow-sm placeholder:text-gray-500"
            />
          )}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="メールアドレス"
            className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white shadow-sm placeholder:text-gray-500"
          />
          {block.data.showMessage && (
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="メッセージ（任意）"
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-400 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white shadow-sm resize-none placeholder:text-gray-500"
            />
          )}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting || !email}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '送信中...' : block.data.buttonText}
          </button>
        </form>
      </div>
    </section>
  );
}

export default BlockRenderer;

// セールスレター用カウントダウンブロック
function SalesCountdownBlock({
  targetDate,
  title,
  expiredAction,
  expiredText,
  expiredUrl,
  backgroundColor,
  textColor,
}: {
  targetDate: string;
  title?: string;
  expiredAction: 'text' | 'redirect';
  expiredText?: string;
  expiredUrl?: string;
  backgroundColor?: string;
  textColor?: string;
}) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        setIsExpired(true);
        if (expiredAction === 'redirect' && expiredUrl) {
          window.location.href = expiredUrl;
        }
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate, expiredAction, expiredUrl]);

  if (isExpired && expiredAction === 'text') {
    return (
      <div
        className="mb-6 py-6 px-4 rounded-xl text-center"
        style={{ backgroundColor: backgroundColor || '#1f2937', color: textColor || '#ffffff' }}
      >
        <p className="text-lg font-bold">{expiredText || 'このキャンペーンは終了しました'}</p>
      </div>
    );
  }

  return (
    <div
      className="mb-6 py-6 px-4 rounded-xl"
      style={{ backgroundColor: backgroundColor || '#1f2937', color: textColor || '#ffffff' }}
    >
      {title && <p className="text-center text-lg font-bold mb-4">{title}</p>}
      <div className="flex justify-center gap-4">
        <div className="text-center">
          <div className="text-3xl md:text-5xl font-bold">{String(timeLeft.days).padStart(2, '0')}</div>
          <div className="text-xs md:text-sm opacity-80 mt-1">日</div>
        </div>
        <div className="text-3xl md:text-5xl font-bold opacity-50">:</div>
        <div className="text-center">
          <div className="text-3xl md:text-5xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
          <div className="text-xs md:text-sm opacity-80 mt-1">時間</div>
        </div>
        <div className="text-3xl md:text-5xl font-bold opacity-50">:</div>
        <div className="text-center">
          <div className="text-3xl md:text-5xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
          <div className="text-xs md:text-sm opacity-80 mt-1">分</div>
        </div>
        <div className="text-3xl md:text-5xl font-bold opacity-50">:</div>
        <div className="text-center">
          <div className="text-3xl md:text-5xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
          <div className="text-xs md:text-sm opacity-80 mt-1">秒</div>
        </div>
      </div>
    </div>
  );
}

// セールスレター用FAQアイテム
function SalesFaqItem({
  question,
  answer,
  isLast,
  questionColor,
  answerColor,
}: {
  question: string;
  answer: string;
  isLast: boolean;
  questionColor?: string;
  answerColor?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={!isLast ? 'border-b border-gray-200' : ''}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span
          className="font-bold pr-4"
          style={{ color: questionColor || '#1f2937' }}
        >
          Q. {question}
        </span>
        {isOpen ? (
          <ChevronUp className="flex-shrink-0 text-gray-400" size={20} />
        ) : (
          <ChevronDown className="flex-shrink-0 text-gray-400" size={20} />
        )}
      </button>
      {isOpen && (
        <div
          className="px-4 pb-4"
          style={{ color: answerColor || '#4b5563' }}
        >
          <p className="whitespace-pre-wrap">A. {answer}</p>
        </div>
      )}
    </div>
  );
}



