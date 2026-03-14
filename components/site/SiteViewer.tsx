'use client';

import React, { useState } from 'react';
import { Site, SitePage } from '@/lib/types';
import { SiteBlockRenderer } from '@/components/site/SiteBlockRenderer';
import { ViewTracker } from '@/components/shared/ViewTracker';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

interface SiteViewerProps {
  site: Site;
  currentPage: SitePage;
  hideFooter?: boolean;
  onNavigate?: (page: SitePage) => void;
}

export default function SiteViewer({ site, currentPage, hideFooter, onNavigate }: SiteViewerProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navPages = (site.pages || []).filter(p => p.show_in_nav !== false);
  const primaryColor = site.settings?.theme?.primaryColor || '#0891b2';
  const baseUrl = `/site/${site.slug}`;

  const getPageUrl = (page: SitePage) => {
    return page.is_home ? baseUrl : `${baseUrl}/${page.slug}`;
  };

  return (
    <div className="min-h-screen bg-white">
      <ViewTracker contentId={site.slug} contentType="site" />

      {/* ─── ナビゲーション ─── */}
      <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-[68px]">
            {/* ロゴ + サイト名 */}
            {onNavigate ? (
              <button
                onClick={() => { const home = navPages.find(p => p.is_home) || navPages[0]; if (home) onNavigate(home); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="flex items-center gap-3 hover:opacity-70 transition-opacity"
              >
                {site.logo_url && (
                  <img src={site.logo_url} alt="" className="h-9 w-9 rounded-lg object-cover" />
                )}
                <span className="text-sm font-bold tracking-[0.12em] uppercase text-gray-900">
                  {site.title}
                </span>
              </button>
            ) : (
              <Link href={baseUrl} className="flex items-center gap-3 hover:opacity-70 transition-opacity">
                {site.logo_url && (
                  <img src={site.logo_url} alt="" className="h-9 w-9 rounded-lg object-cover" />
                )}
                <span className="text-sm font-bold tracking-[0.12em] uppercase text-gray-900">
                  {site.title}
                </span>
              </Link>
            )}

            {/* デスクトップナビ */}
            <div className="hidden md:flex items-center gap-8">
              {navPages.map(page => {
                const isActive = page.id === currentPage.id;
                const navClass = `relative text-[13px] font-medium tracking-wide transition-colors duration-200 py-1 ${
                  isActive ? 'text-gray-900' : 'text-gray-400 hover:text-gray-700'
                }`;
                const indicator = (
                  <span
                    className={`absolute -bottom-[1px] left-0 right-0 h-[2px] transition-all duration-300 ${
                      isActive ? 'opacity-100' : 'opacity-0'
                    }`}
                    style={{ backgroundColor: primaryColor }}
                  />
                );
                return onNavigate ? (
                  <button key={page.id} onClick={() => { onNavigate(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className={navClass}>
                    {page.title}
                    {indicator}
                  </button>
                ) : (
                  <Link key={page.id} href={getPageUrl(page)} className={navClass}>
                    {page.title}
                    {indicator}
                  </Link>
                );
              })}
            </div>

            {/* モバイルメニューボタン */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2.5 -mr-2.5 rounded-lg hover:bg-gray-100/80 transition-colors"
              aria-label="メニューを開く"
            >
              <Menu size={22} className="text-gray-700" />
            </button>
          </div>
        </div>
      </nav>

      {/* ─── モバイルメニュー（フルスクリーンオーバーレイ） ─── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-in fade-in duration-200">
          {/* メニューヘッダー */}
          <div className="flex items-center justify-between px-6 h-[68px] border-b border-gray-100">
            <span className="text-sm font-bold tracking-[0.12em] uppercase text-gray-900">
              {site.title}
            </span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 -mr-2.5 rounded-lg hover:bg-gray-100/80 transition-colors"
              aria-label="メニューを閉じる"
            >
              <X size={22} className="text-gray-700" />
            </button>
          </div>
          {/* メニューリンク */}
          <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6">
            {navPages.map(page => {
              const isActive = page.id === currentPage.id;
              const mobileClass = `text-2xl font-light tracking-wider transition-colors ${
                isActive ? 'text-gray-900' : 'text-gray-400'
              }`;
              return onNavigate ? (
                <button
                  key={page.id}
                  onClick={() => { onNavigate(page); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  className={mobileClass}
                >
                  {page.title}
                </button>
              ) : (
                <Link
                  key={page.id}
                  href={getPageUrl(page)}
                  onClick={() => setMobileMenuOpen(false)}
                  className={mobileClass}
                >
                  {page.title}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── ページコンテンツ ─── */}
      <main>
        {(currentPage.content || []).map((block, i) => (
          <div key={block.id || i}>
            <SiteBlockRenderer
              block={block}
              primaryColor={primaryColor}
              sectionIndex={i}
            />
          </div>
        ))}
      </main>

      {/* ─── フッター ─── */}
      {!hideFooter && (
        <footer className="border-t border-gray-100 bg-white">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16">
            <div className="text-center">
              {/* サイト名 */}
              <p className="text-xs font-bold tracking-[0.15em] uppercase text-gray-300 mb-6">
                {site.title}
              </p>
              {/* ナビリンク */}
              <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10">
                {navPages.map(page => onNavigate ? (
                  <button
                    key={page.id}
                    onClick={() => { onNavigate(page); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors tracking-wide"
                  >
                    {page.title}
                  </button>
                ) : (
                  <Link
                    key={page.id}
                    href={getPageUrl(page)}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors tracking-wide"
                  >
                    {page.title}
                  </Link>
                ))}
              </nav>
              {/* コピーライト */}
              <div className="pt-8 border-t border-gray-50">
                <p className="text-[11px] text-gray-300 tracking-wide">
                  &copy; {new Date().getFullYear()} {site.title}
                </p>
                <p className="text-[11px] text-gray-300 mt-2">
                  Powered by{' '}
                  <a
                    href="https://makers.tokyo"
                    className="hover:text-gray-500 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    集客メーカー
                  </a>
                </p>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
