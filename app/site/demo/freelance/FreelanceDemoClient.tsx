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
      {
        id: generateBlockId(), type: 'hero',
        data: {
          headline: 'SATO DESIGN',
          subheadline: 'Digital Product Design — ビジネスを加速させるデザインを',
          buttonText: 'プロジェクトを相談する',
          buttonUrl: '#contact',
          backgroundImage: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1920&q=80',
          backgroundOpacity: 28,
        },
      },
      {
        id: generateBlockId(), type: 'text_card',
        data: {
          title: 'About',
          text: 'プロダクトデザイナー 佐藤。東京藝術大学デザイン科卒業後、サイバーエージェント → メルカリのデザインチームを経て2022年に独立。「美しさと使いやすさの両立」を追求し、スタートアップから上場企業まで幅広いクライアントのデジタルプロダクトを手がけています。\n\nGood Design Award 2024 受賞。iF Design Award 2023 ファイナリスト。',
          align: 'left',
        },
      },
      {
        id: generateBlockId(), type: 'features',
        data: {
          title: 'Skills & Services',
          items: [
            { icon: '🎨', title: 'UI/UX Design', description: 'SaaS・アプリ・管理画面のUI設計。ユーザーリサーチからプロトタイプ、デザインシステム構築まで' },
            { icon: '🌐', title: 'Web Design', description: 'コーポレートサイト・LP・EC。ブランドの世界観を伝える、コンバージョンに強いWebデザイン' },
            { icon: '✏️', title: 'Brand Identity', description: 'ロゴ・カラーシステム・タイポグラフィ・ブランドガイドライン。一貫したブランド体験を設計' },
          ],
        },
      },
      {
        id: generateBlockId(), type: 'testimonial',
        data: {
          title: 'Client Voice',
          items: [
            { name: '株式会社 Alpha', role: 'SaaS スタートアップ / シリーズA', comment: 'プロダクトのUI全面リニューアルを依頼。ユーザビリティテストに基づいた改善で、オンボーディング完了率が40%から78%に大幅改善しました。', image: '' },
            { name: '株式会社 Bridge', role: 'D2Cブランド / EC月商3,000万', comment: 'ブランドサイトとECのリデザインを依頼。世界観の統一とUX改善により、CVRが1.8%から3.2%に向上。デザインの力を実感しました。', image: '' },
            { name: '株式会社 Canvas', role: '教育テック / 月間10万ユーザー', comment: '学習プラットフォームのUX改善をお願いしました。継続率が2.3倍に向上し、App Store評価も3.8から4.7に改善。ユーザー目線の設計力が本当に素晴らしいです。', image: '' },
          ],
        },
      },
      {
        id: generateBlockId(), type: 'cta_section',
        data: {
          title: 'デザインの力で、ビジネスを次のステージへ',
          description: 'プロジェクトのご相談から、お気軽にお問い合わせください。通常1営業日以内にご返信いたします。',
          buttonText: 'プロジェクトを相談する',
          buttonUrl: '#contact',
        },
      },
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
      {
        id: generateBlockId(), type: 'hero',
        data: {
          headline: 'Selected Works',
          subheadline: 'これまでに手がけたプロジェクトの一部をご紹介します',
          backgroundImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1920&q=80',
          backgroundOpacity: 25,
        },
      },
      {
        id: generateBlockId(), type: 'features',
        data: {
          title: 'プロジェクト',
          items: [
            { icon: '📊', title: 'SaaS ダッシュボード UI', description: 'BtoB SaaSの分析ダッシュボードをフルリデザイン。複雑なデータを直感的に操作できるUIを設計し、ユーザー満足度92%を達成' },
            { icon: '🛍️', title: 'D2Cブランド EC & ブランドサイト', description: 'アパレルD2Cのブランド体験をトータルデザイン。ロゴ・Webサイト・ECサイト・パッケージまで一貫した世界観を構築' },
            { icon: '📱', title: 'ヘルスケアアプリ UI/UX', description: '500万DL超のヘルスケアアプリのUX改善。行動心理学に基づいた設計でDAUを1.6倍に向上' },
            { icon: '🏢', title: '上場企業コーポレートサイト', description: 'IR情報・採用・サービス紹介を統合したコーポレートサイトをフルリニューアル。ブランド刷新に貢献' },
          ],
        },
      },
      {
        id: generateBlockId(), type: 'gallery',
        data: {
          items: [
            { id: generateBlockId(), url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', caption: 'ダッシュボードUI' },
            { id: generateBlockId(), url: 'https://images.unsplash.com/photo-1517292987719-0369a794ec0f?auto=format&fit=crop&w=800&q=80', caption: 'モバイルアプリ' },
            { id: generateBlockId(), url: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?auto=format&fit=crop&w=800&q=80', caption: 'ブランドデザイン' },
            { id: generateBlockId(), url: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=800&q=80', caption: 'Webデザイン' },
            { id: generateBlockId(), url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?auto=format&fit=crop&w=800&q=80', caption: 'プロトタイプ' },
            { id: generateBlockId(), url: 'https://images.unsplash.com/photo-1586717799252-bd134571d0f5?auto=format&fit=crop&w=800&q=80', caption: 'デザインシステム' },
          ],
        },
      },
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
      {
        id: generateBlockId(), type: 'hero',
        data: {
          headline: 'Pricing',
          subheadline: 'プロジェクトの規模に応じた、透明性のある料金体系',
          backgroundImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1920&q=80',
          backgroundOpacity: 25,
        },
      },
      {
        id: generateBlockId(), type: 'pricing',
        data: {
          title: '料金プラン',
          plans: [
            {
              name: 'Light',
              price: '¥150,000〜',
              features: [
                'LP / シングルページ制作',
                'レスポンシブ対応',
                'デザイン2案提示',
                '修正2回まで',
                '納期：約2週間',
              ],
              recommended: false,
            },
            {
              name: 'Standard',
              price: '¥400,000〜',
              features: [
                '複数ページサイト（〜8P）',
                'デザインシステム構築',
                'プロトタイプ制作',
                'ユーザビリティレビュー',
                '公開後1ヶ月の修正サポート',
                '納期：約1〜1.5ヶ月',
              ],
              recommended: true,
            },
            {
              name: 'Premium',
              price: '¥800,000〜',
              features: [
                '大規模サイト / アプリUI',
                'ユーザーリサーチ & 分析',
                'ブランドガイドライン策定',
                'デザインシステム & コンポーネント',
                'アニメーション / インタラクション設計',
                '保守サポート3ヶ月',
              ],
              recommended: false,
            },
          ],
        },
      },
      {
        id: generateBlockId(), type: 'faq',
        data: {
          items: [
            { id: generateBlockId(), question: '納期はどのくらいですか？', answer: 'プランにより異なります。Lightプランで約2週間、Standardで約1〜1.5ヶ月、Premiumで2〜3ヶ月が目安です。お急ぎの場合はご相談ください。' },
            { id: generateBlockId(), question: '修正回数に制限はありますか？', answer: 'Lightプランは2回まで、Standard以上は公開まで無制限で対応します。公開後の修正はプランごとのサポート期間内で対応いたします。' },
            { id: generateBlockId(), question: '実装（コーディング）もお願いできますか？', answer: 'はい。Next.js / React でのフロントエンド実装まで一貫してお受けしています。デザインのみのご依頼も歓迎です。' },
            { id: generateBlockId(), question: 'リモートでの打ち合わせは可能ですか？', answer: 'もちろん可能です。Zoom / Google Meet でのオンラインミーティングを基本としています。対面をご希望の場合は東京都内で対応可能です。' },
          ],
        },
      },
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
      {
        id: generateBlockId(), type: 'hero',
        data: {
          headline: 'Get in Touch',
          subheadline: 'プロジェクトのご相談はお気軽に。通常1営業日以内にご返信します',
          backgroundImage: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=80',
          backgroundOpacity: 25,
        },
      },
      {
        id: generateBlockId(), type: 'text_card',
        data: {
          title: 'Contact Information',
          text: '所在地：東京都渋谷区神宮前6-35-3 コープオリンピア 6F\nE-mail：hello@satodesign.jp\n\nオンラインミーティング（Zoom / Google Meet）も対応可能です。',
          align: 'center',
        },
      },
      {
        id: generateBlockId(), type: 'google_map',
        data: {
          title: 'Studio Location',
          address: '東京都渋谷区神宮前6-35-3',
          embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.2!2d139.7050!3d35.6650!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188ca44c45e9b3%3A0x8a837e1c4c23a3e0!2z6KGo5Y-C6YGT44OS44Or44K6!5e0!3m2!1sja!2sjp!4v1',
        },
      },
      {
        id: generateBlockId(), type: 'lead_form',
        data: { title: 'お問い合わせフォーム', buttonText: '相談する' },
      },
    ] as unknown as any[],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const demoSite: Site = {
  id: 'demo-freelance',
  user_id: 'demo',
  slug: 'demo-freelance',
  title: 'SATO DESIGN',
  description: 'Digital Product Design Studio',
  logo_url: '',
  settings: {
    theme: { primaryColor: '#0f172a' },
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
      <div className="bg-slate-900 text-white text-center py-2.5 text-sm font-medium tracking-wide">
        DEMO — ページメニューをクリックして各ページをご覧ください
      </div>
      <SiteViewer site={{ ...demoSite, pages: demoPages }} currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-gray-200/60 px-4 py-2 flex gap-2 z-50">
        {demoPages.map(p => (
          <button
            key={p.id}
            onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              currentPage.id === p.id
                ? 'bg-slate-900 text-white shadow-md'
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
