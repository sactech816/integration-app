'use client';

import React, { useState } from 'react';
import SiteViewer from '@/components/site/SiteViewer';
import { Site, SitePage, generateBlockId } from '@/lib/types';

const demoPages: SitePage[] = [
  {
    id: 'demo-instructor-home',
    site_id: 'demo-instructor',
    slug: 'home',
    title: 'トップ',
    is_home: true,
    show_in_nav: true,
    sort_order: 0,
    content: [
      { id: generateBlockId(), type: 'hero', data: { headline: '山田 太郎', subheadline: 'ビジネスコンサルタント / 経営戦略アドバイザー', buttonText: '無料相談を予約', buttonUrl: '#contact' } },
      { id: generateBlockId(), type: 'text_card', data: { title: '自己紹介', text: '大手コンサルティングファームで15年の経験を経て独立。中小企業の経営課題を解決するパートナーとして、これまでに200社以上を支援してきました。「わかりやすく、実行できるアドバイス」をモットーに活動しています。', align: 'left' } },
      { id: generateBlockId(), type: 'features', data: { title: '専門分野', items: [{ icon: '📊', title: '経営戦略', description: '事業計画の策定・市場分析・競合戦略' }, { icon: '🚀', title: '組織改革', description: 'チームビルディング・人材育成・業務改善' }, { icon: '💡', title: 'DX推進', description: 'デジタル化戦略・ツール導入支援' }] } },
      { id: generateBlockId(), type: 'testimonial', data: { title: 'お客様の声', items: [{ name: '佐藤様', role: '製造業 代表取締役', comment: '具体的で実行しやすいアドバイスのおかげで、売上が前年比130%に成長しました。', image: '' }, { name: '田中様', role: 'IT企業 事業部長', comment: '組織の課題を的確に見抜き、チーム全体の生産性が大幅に向上しました。', image: '' }] } },
    ] as unknown as any[],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-instructor-service',
    site_id: 'demo-instructor',
    slug: 'service',
    title: 'サービス',
    is_home: false,
    show_in_nav: true,
    sort_order: 1,
    content: [
      { id: generateBlockId(), type: 'text_card', data: { title: 'サービス一覧', text: 'お客様のニーズに合わせた3つのプランをご用意しています。', align: 'center' } },
      { id: generateBlockId(), type: 'features', data: { title: 'サービスの特徴', items: [{ icon: '📚', title: 'セミナー・研修', description: '経営者向け・管理職向けの実践型セミナー' }, { icon: '💼', title: '個別コンサルティング', description: '御社の課題に合わせたオーダーメイド支援' }, { icon: '📝', title: 'オンライン講座', description: 'いつでも学べる動画講座シリーズ' }] } },
      { id: generateBlockId(), type: 'pricing', data: { title: '料金プラン', plans: [{ name: '単発セミナー', price: '¥5,000', features: ['2時間のセミナー', 'テキスト資料付き', '質疑応答あり'], recommended: false }, { name: '継続コンサル', price: '¥50,000/月', features: ['月2回の面談（各90分）', 'チャット相談無制限', '経営レポート作成', '優先サポート'], recommended: true }] } },
    ] as unknown as any[],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-instructor-works',
    site_id: 'demo-instructor',
    slug: 'works',
    title: '実績',
    is_home: false,
    show_in_nav: true,
    sort_order: 2,
    content: [
      { id: generateBlockId(), type: 'text_card', data: { title: '実績・事例', text: 'これまでの支援実績の一部をご紹介します。業種・規模を問わず、さまざまな企業様を支援してきました。', align: 'center' } },
      { id: generateBlockId(), type: 'features', data: { title: '支援実績', items: [{ icon: '🏭', title: '製造業A社', description: '業務改善で生産性30%向上' }, { icon: '🏢', title: 'IT企業B社', description: '新規事業立ち上げで初年度黒字化' }, { icon: '🏪', title: '小売C社', description: 'DX推進でコスト20%削減' }] } },
    ] as unknown as any[],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'demo-instructor-contact',
    site_id: 'demo-instructor',
    slug: 'contact',
    title: 'お問い合わせ',
    is_home: false,
    show_in_nav: true,
    sort_order: 3,
    content: [
      { id: generateBlockId(), type: 'text_card', data: { title: '無料相談受付中', text: '初回30分の無料相談を実施しています。まずはお気軽にご連絡ください。', align: 'center' } },
      { id: generateBlockId(), type: 'lead_form', data: { title: 'お問い合わせ', buttonText: '無料相談を申し込む' } },
    ] as unknown as any[],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const demoSite: Site = {
  id: 'demo-instructor',
  user_id: 'demo',
  slug: 'demo-instructor',
  title: '山田太郎 コンサルティング',
  description: 'ビジネスコンサルタント・経営戦略アドバイザー',
  logo_url: '',
  settings: {
    theme: { primaryColor: '#7c3aed' },
  },
  status: 'published',
  pages: demoPages,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export default function InstructorDemoClient() {
  const [currentPage, setCurrentPage] = useState<SitePage>(demoPages[0]);

  return (
    <div>
      <div className="bg-violet-600 text-white text-center py-2 text-sm font-semibold">
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
                ? 'bg-violet-600 text-white shadow-md'
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
