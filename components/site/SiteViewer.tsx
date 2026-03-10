'use client';

import React, { useState } from 'react';
import { Site, SitePage } from '@/lib/types';
import { BlockRenderer } from '@/components/shared/BlockRenderer';
import { ViewTracker } from '@/components/shared/ViewTracker';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

interface SiteViewerProps {
  site: Site;
  currentPage: SitePage;
  hideFooter?: boolean;
}

export default function SiteViewer({ site, currentPage, hideFooter }: SiteViewerProps) {
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
      {/* ナビゲーション */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* ロゴ+サイト名 */}
            <Link href={baseUrl} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              {site.logo_url && (
                <img src={site.logo_url} alt="" className="h-10 w-10 rounded-xl object-cover" />
              )}
              <span className="font-bold text-gray-900 text-lg">{site.title}</span>
            </Link>

            {/* デスクトップナビ */}
            <div className="hidden md:flex items-center gap-1">
              {navPages.map(page => {
                const isActive = page.id === currentPage.id;
                return (
                  <Link
                    key={page.id}
                    href={getPageUrl(page)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? 'text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    style={isActive ? { backgroundColor: primaryColor } : {}}
                  >
                    {page.title}
                  </Link>
                );
              })}
            </div>

            {/* モバイルメニューボタン */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-all"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* モバイルメニュー */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-3 space-y-1">
              {navPages.map(page => {
                const isActive = page.id === currentPage.id;
                return (
                  <Link
                    key={page.id}
                    href={getPageUrl(page)}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'text-white'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    style={isActive ? { backgroundColor: primaryColor } : {}}
                  >
                    {page.title}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* ページコンテンツ */}
      <main>
        {(currentPage.content || []).map((block, i) => (
          <div key={block.id || i}>
            <BlockRenderer block={block} variant="business" />
          </div>
        ))}
      </main>

      {/* フッター */}
      {!hideFooter && (
        <footer className="border-t border-gray-200 mt-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                {site.logo_url && (
                  <img src={site.logo_url} alt="" className="h-8 w-8 rounded-lg object-cover" />
                )}
                <span className="font-bold text-gray-700">{site.title}</span>
              </div>
              <div className="flex flex-wrap justify-center gap-4">
                {navPages.map(page => (
                  <Link
                    key={page.id}
                    href={getPageUrl(page)}
                    className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {page.title}
                  </Link>
                ))}
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <p className="text-xs text-gray-400">
                © {new Date().getFullYear()} {site.title}
              </p>
              <p className="text-xs text-gray-300 mt-2">
                Powered by <a href="https://makers.tokyo" className="hover:text-gray-500 transition-colors">集客メーカー</a>
              </p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
