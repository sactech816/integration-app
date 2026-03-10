'use client';

import React, { useState } from 'react';
import SiteViewer from '@/components/site/SiteViewer';
import { Site, SitePage, generateBlockId } from '@/lib/types';

const demoPages: SitePage[] = [
  {
    id: 'demo-freelance-home',
    site_id: 'demo-freelance',
    slug: 'home',
    title: 'トップ',
    is_home: true,
    show_in_nav: true,
    sort_order: 0,
    content: [
      { id: generateBlockId(), type: 'hero', data: { headline: 'Sato Design Studio', subheadline: 'Webデザイン / UI設計 / ブランディング', buttonText: 'お仕事のご相談', buttonUrl: '#contact' } },
      { id: generateBlockId(), type: 'text_card', data: { title: 'About', text: 'デザイナー歴8年。大手Web制作会社を経て独立。「使いやすく、美しいデザイン」をコンセプトに、企業サイト・LP・アプリUIを中心に制作しています。お客様のビジネスの成長をデザインの力でサポートします。', align: 'left' } },
      { id: generateBlockId(), type: 'features', data: { title: 'スキル', items: [{ icon: '🎨', title: 'Webデザイン', description: 'コーポレートサイト・LP・ECサイト' }, { icon: '📱', title: 'UI/UXデザイン', description: 'アプリ・SaaS・管理画面' }, { icon: '✏️', title: 'ブランディング', description: 'ロゴ・名刺・ブランドガイドライン' }] } },
    ] as unknown as any[],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-freelance-works',
    site_id: 'demo-freelance',
    slug: 'works',
    title: '制作実績',
    is_home: false,
    show_in_nav: true,
    sort_order: 1,
    content: [
      { id: generateBlockId(), type: 'text_card', data: { title: '制作実績', text: 'これまでに手がけたプロジェクトの一部をご紹介します。', align: 'center' } },
      { id: generateBlockId(), type: 'features', data: { title: '主な実績', items: [{ icon: '🏢', title: 'IT企業コーポレートサイト', description: 'フルリニューアル・レスポンシブ対応' }, { icon: '🛍️', title: 'アパレルECサイト', description: 'Shopifyテーマカスタマイズ' }, { icon: '📊', title: 'SaaS管理画面UI', description: 'ダッシュボード・データ可視化' }] } },
      { id: generateBlockId(), type: 'gallery', data: { items: [] } },
    ] as unknown as any[],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-freelance-pricing',
    site_id: 'demo-freelance',
    slug: 'pricing',
    title: '料金',
    is_home: false,
    show_in_nav: true,
    sort_order: 2,
    content: [
      { id: generateBlockId(), type: 'text_card', data: { title: '料金について', text: '目安の料金です。ご要望に応じてお見積りいたします。', align: 'center' } },
      { id: generateBlockId(), type: 'pricing', data: { title: '料金目安', plans: [{ name: 'ライトプラン', price: '¥80,000〜', features: ['LP1ページ制作', 'レスポンシブ対応', 'デザイン2案', '修正2回まで'], recommended: false }, { name: 'スタンダード', price: '¥200,000〜', features: ['複数ページサイト（5P）', 'レスポンシブ対応', 'デザイン3案', 'CMS導入', '公開後1ヶ月サポート'], recommended: true }, { name: 'プレミアム', price: '¥500,000〜', features: ['大規模サイト（10P〜）', 'ブランドガイドライン', 'アニメーション実装', '保守サポート3ヶ月', '優先対応'], recommended: false }] } },
      { id: generateBlockId(), type: 'faq', data: { items: [{ id: generateBlockId(), question: '納期はどのくらいですか？', answer: 'LP制作で約2週間、複数ページサイトで約1ヶ月が目安です。' }, { id: generateBlockId(), question: '修正は何回まで可能ですか？', answer: 'プランにより異なります。追加修正は別途ご相談ください。' }] } },
    ] as unknown as any[],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-freelance-contact',
    site_id: 'demo-freelance',
    slug: 'contact',
    title: 'お問い合わせ',
    is_home: false,
    show_in_nav: true,
    sort_order: 3,
    content: [
      { id: generateBlockId(), type: 'text_card', data: { title: 'お仕事のご相談', text: 'まずはお気軽にご連絡ください。ヒアリング後、お見積りをお送りします。', align: 'center' } },
      { id: generateBlockId(), type: 'lead_form', data: { title: 'お問い合わせフォーム', buttonText: '相談する' } },
    ] as unknown as any[],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const demoSite: Site = {
  id: 'demo-freelance',
  user_id: 'demo',
  slug: 'demo-freelance',
  title: 'Sato Design Studio',
  description: 'Webデザイン / UI設計 / ブランディング',
  logo_url: '',
  settings: {
    theme: { primaryColor: '#2563eb' },
  },
  status: 'published',
  pages: demoPages,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function FreelanceDemoClient() {
  const [currentPage, setCurrentPage] = useState<SitePage>(demoPages[0]);

  return (
    <div>
      <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold">
        これはデモページです。ページメニューをクリックすると各ページを確認できます。
      </div>
      <SiteViewer site={{ ...demoSite, pages: demoPages }} currentPage={currentPage} />
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white shadow-2xl rounded-2xl border border-gray-200 px-4 py-2 flex gap-2 z-50">
        {demoPages.map(p => (
          <button
            key={p.id}
            onClick={() => setCurrentPage(p)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentPage.id === p.id
                ? 'bg-blue-600 text-white shadow-md'
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
