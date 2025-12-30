"use client";

import React, { useState, useEffect } from 'react';
import { Block } from '@/lib/types';
import { saveAnalytics } from '@/app/actions/analytics';
import { saveLead } from '@/app/actions/leads';
import { ChevronDown as ChevronDownIcon, Star } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { supabase } from '@/lib/supabase';
import dynamic from 'next/dynamic';

// QuizPlayerを動的インポート（SSRを無効化、.jsxファイルなので拡張子を指定）
const QuizPlayer = dynamic(() => import('./QuizPlayer.jsx'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-12">
      <div className="text-gray-600">診断クイズを読み込み中...</div>
    </div>
  )
});

// YouTube URLから動画IDを抽出
function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export function BlockRenderer({ block, profileId, contentType = 'profile' }: { block: Block; profileId?: string; contentType?: 'profile' | 'business' }) {
  switch (block.type) {
    case 'header':
      return (
        <header className="text-center space-y-4 pt-8 animate-fade-in">
          <div className="relative inline-block">
            {block.data.avatar ? (
              <img 
                src={block.data.avatar} 
                alt={`${block.data.name} プロフィール写真`}
                className="w-32 h-32 md:w-36 md:h-36 rounded-full mx-auto shadow-xl border-4 border-white object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder-avatar.png';
                }}
              />
            ) : (
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-full mx-auto shadow-xl border-4 border-white bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">
                  {block.data.name ? block.data.name.charAt(0) : '?'}
                </span>
              </div>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
            {block.data.name}
          </h1>
          <p 
            className="text-base md:text-lg text-white font-semibold px-4 drop-shadow-md"
            dangerouslySetInnerHTML={{ __html: (block.data.title || '').replace(/\n/g, '<br>') }}
          />
        </header>
      );

    case 'text_card':
      const alignmentClass = block.data.align === 'center' ? 'text-center' : 'text-left';
      return (
        <section className={`glass-card rounded-2xl p-6 shadow-lg animate-fade-in ${alignmentClass}`}>
          {block.data.title && (
            <h2 className="text-xl font-bold mb-4 accent-color">
              {block.data.title}
            </h2>
          )}
          <div 
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: (block.data.text || '').replace(/\n/g, '<br>') }}
          />
        </section>
      );

    case 'image':
      return (
        <section className="animate-fade-in">
          <div className="glass-card rounded-2xl p-4 shadow-lg">
            <img 
              src={block.data.url} 
              alt={block.data.caption || '画像'} 
              className="w-full rounded-xl object-cover"
            />
            {block.data.caption && (
              <p className="text-sm text-gray-600 mt-2 text-center">
                {block.data.caption}
              </p>
            )}
          </div>
        </section>
      );

    case 'youtube':
      const videoId = extractYouTubeId(block.data.url);
      if (!videoId) {
        return (
          <section className="animate-fade-in">
            <div className="glass-card rounded-2xl p-6 shadow-lg text-center text-gray-600">
              <p>無効なYouTube URLです</p>
            </div>
          </section>
        );
      }
      return (
        <section className="animate-fade-in">
          <div className="glass-card rounded-2xl p-4 shadow-lg">
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                className="absolute top-0 left-0 w-full h-full rounded-xl"
                src={`https://www.youtube.com/embed/${videoId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      );

    case 'links':
      return (
        <section className="space-y-4 animate-fade-in">
          <h3 className="text-center font-bold text-white drop-shadow-md mb-4">Follow Me & More Info</h3>
          {block.data.links.map((link, index) => {
            const isLine = link.url?.includes('lin.ee') || link.label?.includes('LINE');

            // 背景/文字色のパレット（リンクスタイルが反映されない問題を解消）
            const palette: Record<string, { bg: string; text: string; border: string }> = {
              default: { bg: 'rgba(255,255,255,0.95)', text: '#111827', border: 'rgba(229,231,235,0.8)' },
              orange: { bg: '#f97316', text: '#fff', border: '#ea580c' },
              blue: { bg: '#3b82f6', text: '#fff', border: '#2563eb' },
              green: { bg: '#22c55e', text: '#fff', border: '#16a34a' },
              purple: { bg: '#a855f7', text: '#fff', border: '#9333ea' },
              line: { bg: '#06C755', text: '#fff', border: '#05b34c' },
            };

            const activePalette = isLine
              ? palette.line
              : palette[link.style] || palette.default;

            const handleClick = async () => {
              if (profileId && profileId !== 'demo') {
                console.log('[LinkClick] Tracking click:', link.url);
                try {
                  const result = await saveAnalytics(profileId, 'click', { url: link.url });
                  console.log('[LinkClick] Tracked:', result);
                  if (result.error) {
                    console.error('[LinkClick] Tracking error:', result.error);
                  }
                } catch (error) {
                  console.error('[LinkClick] Tracking exception:', error);
                }
              }
            };

            return (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                className="link-button"
                style={{
                  backgroundColor: activePalette.bg,
                  color: activePalette.text,
                  borderColor: activePalette.border,
                }}
              >
                {link.label?.includes('note') && <span className="mr-3 text-2xl">📓</span>}
                {link.label?.includes('X') || link.label?.includes('Twitter') ? (
                  <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                  </svg>
                ) : null}
                {link.label?.includes('Facebook') ? (
                  <svg className="w-6 h-6 mr-3 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                ) : null}
                {link.label?.includes('ホームページ') || link.label?.includes('公式HP') ? (
                  <span className="mr-3 text-2xl">🏢</span>
                ) : null}
                {link.label?.includes('Kindle') || link.label?.includes('Amazon') ? (
                  <span className="mr-3 text-2xl">📕</span>
                ) : null}
                <span className="flex-1 text-left">
                  {link.label}
                </span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </a>
            );
          })}
        </section>
      );

    case 'kindle':
      const asinMatch = block.data.asin?.match(/\/dp\/([A-Z0-9]{10})/);
      const asin = asinMatch ? asinMatch[1] : (block.data.asin?.length === 10 ? block.data.asin : '');
      const amazonUrl = asin ? `https://www.amazon.co.jp/dp/${asin}` : (block.data.asin || '');
      return (
        <section className="animate-fade-in">
          <div className="glass-card rounded-2xl p-6 shadow-2xl transform hover:scale-[1.02] transition-transform">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                {block.data.imageUrl ? (
                  <img 
                    src={block.data.imageUrl} 
                    alt={block.data.title}
                    className="w-full md:w-48 h-auto rounded-lg shadow-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300?text=Book+Cover';
                    }}
                  />
                ) : (
                  <div className="w-full md:w-48 h-64 bg-gray-200 rounded-lg shadow-lg flex items-center justify-center">
                    <span className="text-gray-400 text-sm">画像なし</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{block.data.title}</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">{block.data.description}</p>
                <a
                  href={amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={async () => {
                    if (profileId && profileId !== 'demo') {
                      console.log('[KindleClick] Tracking click:', amazonUrl);
                      try {
                        const result = await saveAnalytics(profileId, 'click', { url: amazonUrl });
                        console.log('[KindleClick] Tracked:', result);
                        if (result.error) {
                          console.error('[KindleClick] Tracking error:', result.error);
                        }
                      } catch (error) {
                        console.error('[KindleClick] Tracking exception:', error);
                      }
                    }
                  }}
                  className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-lg shadow-lg transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  <span>📕</span>
                  Amazonで見る
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </section>
      );

    case 'lead_form':
      return <LeadFormBlock block={block} profileId={profileId} />;

    case 'line_card':
      return <LineCardBlock block={block} profileId={profileId} />;

    case 'faq':
      return <FAQBlock block={block} />;

    case 'pricing':
      return <PricingBlock block={block} />;

    case 'testimonial':
      return <TestimonialBlock block={block} />;

    case 'quiz':
      return <QuizBlock block={block} />;

    case 'hero':
      return <HeroBlock block={block} profileId={profileId} />;

    case 'features':
      return <FeaturesBlock block={block} />;

    case 'cta_section':
      return <CTASectionBlock block={block} profileId={profileId} />;

    case 'two_column':
      return <TwoColumnBlock block={block} />;

    case 'google_map':
      return <GoogleMapBlock block={block} />;

    default:
      return null;
  }
}

// FAQブロックコンポーネント
function FAQBlock({ block }: { block: Extract<Block, { type: 'faq' }> }) {
  const [openItems, setOpenItems] = React.useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  if (!block.data.items || block.data.items.length === 0) {
    return null;
  }

  return (
    <section className="animate-fade-in">
      <div className="glass-card rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">よくある質問</h3>
        <div className="space-y-3">
          {block.data.items.map((item) => {
            const isOpen = openItems.has(item.id);
            return (
              <div key={item.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleItem(item.id)}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-left"
                >
                  <span className="font-bold text-gray-900 pr-4">{item.question || '質問を入力してください'}</span>
                  <ChevronDownIcon 
                    className={`text-gray-500 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    size={20}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 py-3 bg-white border-t border-gray-200">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {item.answer || '回答を入力してください'}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// 料金表ブロックコンポーネント
function PricingBlock({ block }: { block: Extract<Block, { type: 'pricing' }> }) {
  if (!block.data.plans || block.data.plans.length === 0) {
    return null;
  }

  return (
    <section className="animate-fade-in">
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white drop-shadow-md text-center mb-6">料金プラン</h3>
        <div className="space-y-4">
          {block.data.plans.map((plan) => (
            <div
              key={plan.id}
              className={`glass-card rounded-2xl p-6 shadow-lg transition-all ${
                plan.isRecommended
                  ? 'ring-2 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50'
                  : ''
              }`}
            >
              {plan.isRecommended && (
                <div className="flex justify-center mb-3">
                  <span className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Star size={12} fill="currentColor" />
                    おすすめ
                  </span>
                </div>
              )}
              <h4 className="text-xl font-bold text-gray-900 mb-2 text-center">{plan.title || 'プラン名'}</h4>
              <div className="text-center mb-4">
                <span className="text-3xl font-extrabold text-indigo-600">{plan.price || '¥0'}</span>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
                {plan.features.length === 0 && (
                  <li className="text-sm text-gray-400 text-center py-2">特徴を追加してください</li>
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// お客様の声ブロックコンポーネント
function TestimonialBlock({ block }: { block: Extract<Block, { type: 'testimonial' }> }) {
  if (!block.data.items || block.data.items.length === 0) {
    return null;
  }

  return (
    <section className="animate-fade-in">
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white drop-shadow-md text-center mb-6">お客様の声</h3>
        <div className="space-y-4">
          {block.data.items.map((item) => (
            <div key={item.id} className="glass-card rounded-2xl p-6 shadow-lg w-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
                      {item.name ? item.name.charAt(0) : '?'}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">{item.name || 'お名前'}</h4>
                  <p className="text-sm text-gray-600">{item.role || '肩書き'}</p>
                </div>
              </div>
              <div className="relative bg-white rounded-lg p-4 border-l-4 border-indigo-500">
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {item.comment || 'コメントを入力してください'}
                </p>
                <div className="absolute -bottom-2 left-6 w-4 h-4 bg-white transform rotate-45 border-r border-b border-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// LINE登録カードブロックコンポーネント
function LineCardBlock({ block, profileId }: { block: Extract<Block, { type: 'line_card' }>; profileId?: string }) {
  const handleClick = async () => {
    if (profileId && profileId !== 'demo') {
      console.log('[LineClick] Tracking click:', block.data.url);
      try {
        const result = await saveAnalytics(profileId, 'click', { url: block.data.url });
        console.log('[LineClick] Tracked:', result);
        if (result.error) {
          console.error('[LineClick] Tracking error:', result.error);
        }
      } catch (error) {
        console.error('[LineClick] Tracking exception:', error);
      }
    }
    window.open(block.data.url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="animate-fade-in">
      <div className="glass-card rounded-2xl p-6 shadow-lg bg-gradient-to-br from-[#06C755] to-[#05b34c]">
        <div className="text-center text-white">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.63.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766-.028 1.08l-.164.38c-.213.5-.577.694-1.111.477-.636-.255-1.726-.581-2.448-1.005-.193-.127-.232-.127-.538-.08-2.09.35-4.11.63-4.475.63-.63 0-1.095-.389-1.095-1.057 0-.66.465-1.045 1.095-1.045.365 0 2.385-.28 4.475-.63.306-.05.345-.047.538.08.722.424 1.812.75 2.448 1.005.534.217.898.023 1.111-.477l.164-.38c.107-.314.148-.779.028-1.08-.135-.332-.667-.508-1.058-.59C4.27 19.156 0 15.125 0 10.314z"/>
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2">{block.data.title || 'LINE公式アカウント'}</h3>
          <p className="text-white/90 mb-4">{block.data.description || '最新情報をお届けします'}</p>
          
          {/* QRコード表示（画像が指定されている場合のみ表示） */}
          {block.data.qrImageUrl && (
            <div className="mb-4 flex justify-center">
              <div className="bg-white p-3 rounded-lg inline-block">
                <img 
                  src={block.data.qrImageUrl} 
                  alt="QRコード" 
                  className="w-32 h-32 object-contain"
                />
              </div>
            </div>
          )}
          
          <button
            onClick={handleClick}
            className="bg-white text-[#06C755] font-bold px-8 py-4 rounded-full shadow-lg hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            {block.data.buttonText || '友だち追加'}
          </button>
        </div>
      </div>
    </section>
  );
}

// リード獲得フォームコンポーネント
function LeadFormBlock({ block, profileId }: { block: Extract<Block, { type: 'lead_form' }>; profileId?: string }) {
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !profileId) return;

    setIsSubmitting(true);
    try {
      const result = await saveLead(profileId, email);
      if (result.success) {
        setSubmitted(true);
        setEmail('');
      } else {
        alert('登録に失敗しました。もう一度お試しください。');
      }
    } catch (error) {
      alert('登録に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="animate-fade-in">
        <div className="glass-card rounded-2xl p-6 shadow-lg text-center">
          <div className="text-4xl mb-4">✅</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">登録ありがとうございます！</h3>
          <p className="text-gray-600">メールアドレスを登録いただき、ありがとうございます。</p>
        </div>
      </section>
    );
  }

  return (
    <section className="animate-fade-in">
      <div className="glass-card rounded-2xl p-6 shadow-lg">
        <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">{block.data.title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メールアドレスを入力"
            required
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white text-gray-900 placeholder-gray-400"
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? '送信中...' : block.data.buttonText || '登録する'}
          </button>
        </form>
      </div>
    </section>
  );
}

// 診断クイズブロックコンポーネント
function QuizBlock({ block }: { block: Extract<Block, { type: 'quiz' }> }) {
  const [quiz, setQuiz] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!supabase) {
        setError('Supabaseが初期化されていません');
        setIsLoading(false);
        return;
      }

      try {
        let query = supabase.from('quizzes').select('*');
        
        if (block.data.quizSlug) {
          query = query.eq('slug', block.data.quizSlug);
        } else if (block.data.quizId) {
          // IDが数値か文字列かを判定
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
      <section className="animate-fade-in">
        <div className="glass-card rounded-2xl p-6 shadow-lg text-center">
          <div className="text-gray-600">診断クイズを読み込み中...</div>
        </div>
      </section>
    );
  }

  if (error || !quiz) {
    return (
      <section className="animate-fade-in">
        <div className="glass-card rounded-2xl p-6 shadow-lg text-center">
          <p className="text-gray-600">{error || '診断クイズが見つかりませんでした'}</p>
        </div>
      </section>
    );
  }

  // 埋め込み用のonBackハンドラー（何もしない）
  const handleBack = () => {
    // 埋め込み時は戻る動作を無効化
  };

  return (
    <section className="animate-fade-in">
      <div className="glass-card rounded-2xl p-4 shadow-lg overflow-hidden">
        {block.data.title && (
          <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
            {block.data.title}
          </h3>
        )}
        <div className="relative w-full">
          <QuizPlayer quiz={quiz} onBack={handleBack} />
        </div>
      </div>
    </section>
  );
}

// ヒーローセクションブロックコンポーネント
function HeroBlock({ block, profileId }: { block: Extract<Block, { type: 'hero' }>; profileId?: string }) {
  const handleCtaClick = async () => {
    if (profileId && profileId !== 'demo' && block.data.ctaUrl) {
      console.log('[HeroClick] Tracking CTA click:', block.data.ctaUrl);
      try {
        const result = await saveAnalytics(profileId, 'click', { url: block.data.ctaUrl });
        console.log('[HeroClick] Tracked:', result);
        if (result.error) {
          console.error('[HeroClick] Tracking error:', result.error);
        }
      } catch (error) {
        console.error('[HeroClick] Tracking exception:', error);
      }
    }
  };

  const backgroundStyle: React.CSSProperties = {};
  if (block.data.backgroundImage) {
    backgroundStyle.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${block.data.backgroundImage})`;
    backgroundStyle.backgroundSize = 'cover';
    backgroundStyle.backgroundPosition = 'center';
  } else if (block.data.backgroundColor) {
    backgroundStyle.background = block.data.backgroundColor;
  } else {
    backgroundStyle.background = 'linear-gradient(-45deg, #1e293b, #334155, #475569, #334155)';
  }

  return (
    <section className="animate-fade-in -mx-4 md:-mx-6 mb-6">
      <div className="relative py-16 md:py-24 px-6" style={backgroundStyle}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
            {block.data.headline || 'あなたのキャッチコピーをここに'}
          </h2>
          <p className="text-lg md:text-xl text-white mb-8 drop-shadow-md">
            {block.data.subheadline || 'サブテキストを入力してください'}
          </p>
          
          {block.data.imageUrl && (
            <div className="flex justify-center mb-8">
              <img 
                src={block.data.imageUrl} 
                alt="Hero" 
                className="rounded-lg shadow-2xl w-48 md:w-64 object-cover"
                style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.25))' }}
              />
            </div>
          )}

          {block.data.ctaText && block.data.ctaUrl && (
            <a
              href={block.data.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleCtaClick}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 px-8 rounded-full shadow-lg transition-all transform hover:scale-105"
            >
              {block.data.ctaText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

// 特徴・ベネフィットブロックコンポーネント
function FeaturesBlock({ block }: { block: Extract<Block, { type: 'features' }> }) {
  if (!block.data.items || block.data.items.length === 0) {
    return null;
  }

  const columns = block.data.columns || 3;
  const gridClass = columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';

  return (
    <section className="animate-fade-in">
      <div className="space-y-6">
        {block.data.title && (
          <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-md text-center mb-8">
            {block.data.title}
          </h3>
        )}
        <div className={`grid grid-cols-1 ${gridClass} gap-6`}>
          {block.data.items.map((item) => (
            <div key={item.id} className="glass-card rounded-2xl p-6 shadow-lg text-center">
              {item.icon && (
                <div className="text-4xl mb-3">
                  {item.icon.startsWith('http') ? (
                    <img src={item.icon} alt={item.title} className="w-12 h-12 mx-auto" />
                  ) : (
                    <span>{item.icon}</span>
                  )}
                </div>
              )}
              <h4 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h4>
              <p className="text-gray-700 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTAセクションブロックコンポーネント
function CTASectionBlock({ block, profileId }: { block: Extract<Block, { type: 'cta_section' }>; profileId?: string }) {
  const handleClick = async () => {
    if (profileId && profileId !== 'demo' && block.data.buttonUrl) {
      console.log('[CTAClick] Tracking CTA click:', block.data.buttonUrl);
      try {
        const result = await saveAnalytics(profileId, 'click', { url: block.data.buttonUrl });
        console.log('[CTAClick] Tracked:', result);
        if (result.error) {
          console.error('[CTAClick] Tracking error:', result.error);
        }
      } catch (error) {
        console.error('[CTAClick] Tracking exception:', error);
      }
    }
  };

  const backgroundStyle: React.CSSProperties = {};
  if (block.data.backgroundGradient) {
    backgroundStyle.background = block.data.backgroundGradient;
  } else if (block.data.backgroundColor) {
    backgroundStyle.backgroundColor = block.data.backgroundColor;
  } else {
    backgroundStyle.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }

  return (
    <section className="animate-fade-in -mx-4 md:-mx-6 mb-6">
      <div className="py-12 md:py-16 px-6 text-center" style={backgroundStyle}>
        <div className="max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-4xl font-bold text-white mb-4">
            {block.data.title || 'CTAタイトル'}
          </h3>
          <p className="text-lg text-white/90 mb-8">
            {block.data.description || '説明文を入力してください'}
          </p>
          <a
            href={block.data.buttonUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className="inline-block bg-white text-purple-600 font-bold text-lg py-4 px-8 rounded-full shadow-lg hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            {block.data.buttonText || 'ボタンテキスト'}
          </a>
        </div>
      </div>
    </section>
  );
}

// 2カラムレイアウトブロックコンポーネント
function TwoColumnBlock({ block }: { block: Extract<Block, { type: 'two_column' }> }) {
  const isImageLeft = block.data.layout === 'image-left';

  return (
    <section className="animate-fade-in">
      <div className="glass-card rounded-2xl p-6 md:p-8 shadow-lg">
        <div className={`flex flex-col ${isImageLeft ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 md:gap-8 items-center`}>
          <div className="w-full md:w-1/2">
            <img 
              src={block.data.imageUrl || 'https://via.placeholder.com/600x400'} 
              alt={block.data.title}
              className="w-full rounded-lg shadow-md object-cover"
            />
          </div>
          <div className="w-full md:w-1/2">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {block.data.title || 'タイトルを入力'}
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-line">
              {block.data.text || 'テキストを入力してください'}
            </p>
            {block.data.listItems && block.data.listItems.length > 0 && (
              <ul className="space-y-2">
                {block.data.listItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="text-green-500 mt-1">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// Googleマップブロックコンポーネント
function GoogleMapBlock({ block }: { block: Extract<Block, { type: 'google_map' }> }) {
  const height = block.data.height || '400px';
  
  // URLのバリデーション（google.comドメインのみ許可）
  const isValidGoogleMapsUrl = (url: string): boolean => {
    if (!url) return false;
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.includes('google.com');
    } catch {
      return false;
    }
  };

  if (!block.data.embedUrl || !isValidGoogleMapsUrl(block.data.embedUrl)) {
    return (
      <section className="animate-fade-in">
        <div className="glass-card rounded-2xl p-6 shadow-lg text-center">
          <p className="text-gray-600">地図のURLが設定されていません</p>
          <p className="text-sm text-gray-500 mt-2">Google Mapsの埋め込みURLを設定してください</p>
        </div>
      </section>
    );
  }

  return (
    <section className="animate-fade-in">
      <div className="glass-card rounded-2xl p-6 shadow-lg">
        {(block.data.title || block.data.address) && (
          <div className="mb-4 text-center">
            {block.data.title && (
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {block.data.title}
              </h3>
            )}
            {block.data.address && (
              <p className="text-gray-700 text-sm">
                {block.data.address}
              </p>
            )}
          </div>
        )}
        <div className="relative w-full overflow-hidden rounded-xl" style={{ height }}>
          <iframe
            src={block.data.embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={block.data.title || '地図'}
          />
        </div>
      </div>
    </section>
  );
}

