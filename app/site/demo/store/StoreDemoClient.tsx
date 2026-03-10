'use client';

import React, { useState } from 'react';
import SiteViewer from '@/components/site/SiteViewer';
import { Site, SitePage, generateBlockId } from '@/lib/types';

const demoPages: SitePage[] = [
  {
    id: 'demo-store-home',
    site_id: 'demo-store',
    slug: 'home',
    title: 'トップ',
    is_home: true,
    show_in_nav: true,
    sort_order: 0,
    content: [
      { id: generateBlockId(), type: 'hero', data: { headline: 'Café & Bakery DEMO', subheadline: '焼きたてパンと自家焙煎コーヒーのお店', buttonText: 'ご予約はこちら', buttonUrl: '#contact' } },
      { id: generateBlockId(), type: 'text_card', data: { title: 'コンセプト', text: '毎朝5時から焼き上げるパンと、自家焙煎コーヒー。地元の素材にこだわり、一つひとつ丁寧に作っています。テイクアウトもイートインもお気軽にどうぞ。', align: 'center' } },
      { id: generateBlockId(), type: 'features', data: { title: '当店の特徴', items: [{ icon: '🍞', title: '焼きたてパン', description: '毎朝5時から焼き上げる20種類以上' }, { icon: '☕', title: '自家焙煎コーヒー', description: '厳選した豆を店内で焙煎' }, { icon: '🌿', title: '地元素材', description: '地元農家から直接仕入れ' }] } },
      { id: generateBlockId(), type: 'gallery', data: { items: [] } },
    ] as unknown as any[],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-store-menu',
    site_id: 'demo-store',
    slug: 'menu',
    title: 'メニュー',
    is_home: false,
    show_in_nav: true,
    sort_order: 1,
    content: [
      { id: generateBlockId(), type: 'text_card', data: { title: 'メニュー', text: '季節のおすすめパンと定番メニューをご紹介します。', align: 'center' } },
      { id: generateBlockId(), type: 'pricing', data: { title: '料金表', plans: [{ name: 'パンセット', price: '¥800', features: ['お好きなパン2個', 'ドリンク1杯', 'ミニサラダ付き'], recommended: false }, { name: 'モーニングセット', price: '¥1,200', features: ['トースト or クロワッサン', 'スクランブルエッグ', 'サラダ・スープ', 'コーヒー or 紅茶'], recommended: true }, { name: 'アフタヌーンセット', price: '¥1,500', features: ['パン3種盛り', 'スイーツ1品', 'ドリンク1杯'], recommended: false }] } },
    ] as unknown as any[],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-store-access',
    site_id: 'demo-store',
    slug: 'access',
    title: 'アクセス',
    is_home: false,
    show_in_nav: true,
    sort_order: 2,
    content: [
      { id: generateBlockId(), type: 'text_card', data: { title: 'アクセス', text: '〒100-0001 東京都千代田区千代田1-1\n\n営業時間：7:00〜18:00（定休日：火曜日）\nTEL：03-1234-5678\n\n最寄り駅：東京メトロ 大手町駅 徒歩5分', align: 'left' } },
      { id: generateBlockId(), type: 'google_map', data: { address: '東京都千代田区千代田1-1', embedUrl: '' } },
    ] as unknown as any[],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-store-contact',
    site_id: 'demo-store',
    slug: 'contact',
    title: 'お問い合わせ',
    is_home: false,
    show_in_nav: true,
    sort_order: 3,
    content: [
      { id: generateBlockId(), type: 'text_card', data: { title: 'お問い合わせ', text: 'ご予約・お問い合わせはお気軽にどうぞ。', align: 'center' } },
      { id: generateBlockId(), type: 'lead_form', data: { title: 'お問い合わせフォーム', buttonText: '送信する' } },
    ] as unknown as any[],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const demoSite: Site = {
  id: 'demo-store',
  user_id: 'demo',
  slug: 'demo-store',
  title: 'Café & Bakery DEMO',
  description: '焼きたてパンと自家焙煎コーヒーのお店',
  logo_url: '',
  settings: {
    theme: { primaryColor: '#0891b2' },
  },
  status: 'published',
  pages: demoPages,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function StoreDemoClient() {
  const [currentPage, setCurrentPage] = useState<SitePage>(demoPages[0]);

  return (
    <div>
      <div className="bg-cyan-600 text-white text-center py-2 text-sm font-semibold">
        これはデモページです。ページメニューをクリックすると各ページを確認できます。
      </div>
      <SiteViewer site={{ ...demoSite, pages: demoPages }} currentPage={currentPage} />
      {/* ページ切替ナビ（デモ用） */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-2xl rounded-2xl border border-gray-200 px-4 py-2 flex gap-2 z-50">
        {demoPages.map(p => (
          <button
            key={p.id}
            onClick={() => setCurrentPage(p)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentPage.id === p.id
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {p.title}
          </button>
        ))}
      </div>
    </div>
  );
}
