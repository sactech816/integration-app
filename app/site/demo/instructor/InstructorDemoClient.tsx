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
      {
        id: generateBlockId(), type: 'hero',
        data: {
          headline: '山田 太郎',
          subheadline: 'Business Strategist & Executive Advisor — 経営の「次の一手」を共に描く',
          buttonText: '無料相談を予約する',
          buttonUrl: '#contact',
          backgroundImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
          backgroundOpacity: 30,
        },
      },
      {
        id: generateBlockId(), type: 'text_card',
        data: {
          title: 'About',
          text: 'マッキンゼー・アンド・カンパニーで15年間、国内外の経営戦略プロジェクトに従事。Fortune 500企業から中小企業まで、累計200社以上の経営課題を解決してきました。2020年に独立し、「分析だけで終わらない、実行まで伴走するアドバイザリー」をモットーに活動しています。\n\n専門領域は事業戦略・組織変革・DX推進。経営者の意思決定を加速させるパートナーとして、データに基づいた実践的な提案をお届けします。',
          align: 'left',
        },
      },
      {
        id: generateBlockId(), type: 'features',
        data: {
          title: 'Expertise',
          items: [
            { icon: '📊', title: '事業戦略立案', description: '市場分析・競合調査・成長戦略の策定から実行計画まで一貫して支援' },
            { icon: '🏗️', title: '組織変革・DX推進', description: 'デジタルトランスフォーメーション戦略の設計と、変革を推進する組織づくり' },
            { icon: '🎯', title: 'エグゼクティブコーチング', description: '経営者・CxO向けの1on1コーチング。意思決定力と組織リーダーシップを強化' },
          ],
        },
      },
      {
        id: generateBlockId(), type: 'testimonial',
        data: {
          title: 'Client Voice',
          items: [
            { name: '佐藤 健一 様', role: '製造業 代表取締役 / 従業員120名', comment: '3年間停滞していた売上が、山田さんの戦略支援後の1年で前年比145%に成長。特に新規事業の立ち上げフェーズでは、市場選定から組織設計まで的確に導いていただきました。', image: '' },
            { name: '田中 美咲 様', role: 'SaaS企業 COO / シリーズB', comment: '組織が50人を超えて混乱していた時期に伴走いただきました。評価制度の再設計とミドルマネジメント強化により、離職率が18%から6%に改善。数字で結果を出してくれる稀有なアドバイザーです。', image: '' },
            { name: '鈴木 大輔 様', role: '小売チェーン 取締役 / 32店舗展開', comment: 'DX推進プロジェクトを依頼。現場の抵抗感を解きほぐしながら段階的にデジタル化を進める手法が見事でした。導入半年でオペレーションコスト22%削減を実現。', image: '' },
          ],
        },
      },
      {
        id: generateBlockId(), type: 'cta_section',
        data: {
          title: '経営の「次の一手」を、一緒に見つけませんか？',
          description: '初回30分の無料相談で、御社の課題を整理します。戦略コンサルタントならではの視点で、実行可能な打ち手をご提案します。',
          buttonText: '無料相談を予約する',
          buttonUrl: '#contact',
        },
      },
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
      {
        id: generateBlockId(), type: 'hero',
        data: {
          headline: 'Service',
          subheadline: '経営課題のフェーズや規模に応じた3つのプランをご用意',
          backgroundImage: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1920&q=80',
          backgroundOpacity: 25,
        },
      },
      {
        id: generateBlockId(), type: 'features',
        data: {
          title: 'サービスの特長',
          items: [
            { icon: '📚', title: 'エグゼクティブセミナー', description: '経営者・管理職向けの少人数制セミナー。最新の経営フレームワークを実践形式で学ぶ' },
            { icon: '💼', title: 'アドバイザリー契約', description: '月次の戦略レビュー・臨時の経営相談・取締役会への参加など、御社の経営チームの一員として支援' },
            { icon: '📝', title: 'プロジェクト型支援', description: '新規事業立ち上げ・M&A・組織再編など、特定テーマに期間限定で深くコミット' },
          ],
        },
      },
      {
        id: generateBlockId(), type: 'pricing',
        data: {
          title: '料金プラン',
          plans: [
            {
              name: 'Seminar',
              price: '¥15,000',
              features: ['3時間の集中セミナー', 'テキスト資料 & ワークシート', '質疑応答 & 個別アドバイス', '受講後1週間のメール相談'],
              recommended: false,
            },
            {
              name: 'Advisory',
              price: '¥80,000/月',
              features: ['月2回の戦略ミーティング（各90分）', 'Slack / メールでの随時相談', '月次経営レポート作成', '取締役会・経営会議への参加', 'KPIダッシュボード設計支援'],
              recommended: true,
            },
            {
              name: 'Project',
              price: '¥300,000〜',
              features: ['3〜6ヶ月のプロジェクト型支援', '週1回の進捗レビュー', '現場ヒアリング & 課題分析', '実行計画策定 & 伴走', '最終レポート & 引き継ぎ'],
              recommended: false,
            },
          ],
        },
      },
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
      {
        id: generateBlockId(), type: 'hero',
        data: {
          headline: 'Track Record',
          subheadline: '200社以上の経営支援実績 — 数字で証明する戦略の価値',
          backgroundImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1920&q=80',
          backgroundOpacity: 30,
        },
      },
      {
        id: generateBlockId(), type: 'features',
        data: {
          title: '支援実績ハイライト',
          items: [
            { icon: '🏭', title: '製造業 A社（従業員300名）', description: '3ヵ年中期経営計画の策定支援。新規事業として海外展開を推進し、初年度から黒字化を達成' },
            { icon: '💻', title: 'SaaS B社（シリーズB）', description: '組織拡大に伴うマネジメント課題を解決。評価制度再構築でeNPSを+35ポイント改善' },
            { icon: '🏪', title: '小売チェーン C社（32店舗）', description: '全店舗のDX推進プロジェクトを主導。在庫管理の自動化で年間コスト22%削減を実現' },
            { icon: '🏥', title: '医療法人 D社（5拠点）', description: '経営効率化コンサルティング。予約システム導入と業務フロー改善で患者満足度15%向上' },
          ],
        },
      },
      {
        id: generateBlockId(), type: 'text_card',
        data: {
          title: 'メディア掲載・講演',
          text: '・日経ビジネス「次世代の経営コンサルタント50選」選出\n・Harvard Business Review 寄稿（DX推進における組織変革）\n・TEDxTokyo 登壇「データドリブン経営の民主化」\n・年間講演実績：30回以上',
          align: 'left',
        },
      },
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
      {
        id: generateBlockId(), type: 'hero',
        data: {
          headline: 'Free Consultation',
          subheadline: '初回30分の無料相談で、御社の課題を整理します',
          backgroundImage: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1920&q=80',
          backgroundOpacity: 30,
        },
      },
      {
        id: generateBlockId(), type: 'text_card',
        data: {
          title: 'ご相談方法',
          text: 'オンライン（Zoom）・対面（六本木オフィス）いずれも対応可能です。\n経営課題の整理からお手伝いしますので、まずはお気軽にご連絡ください。\n\n所在地：東京都港区六本木1-6-1 泉ガーデンタワー 38F',
          align: 'center',
        },
      },
      {
        id: generateBlockId(), type: 'google_map',
        data: {
          title: '泉ガーデンタワー',
          address: '東京都港区六本木1-6-1 泉ガーデンタワー',
          embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.5!2d139.7383!3d35.6647!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188b9b13e6b535%3A0x2e8e7d43c839e460!2z5rOJ44Ks44O844OH44Oz44K_44Ov44O8!5e0!3m2!1sja!2sjp!4v1',
        },
      },
      {
        id: generateBlockId(), type: 'lead_form',
        data: { title: 'お問い合わせ', buttonText: '無料相談を申し込む' },
      },
    ] as unknown as any[],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const demoSite: Site = {
  id: 'demo-instructor',
  user_id: 'demo',
  slug: 'demo-instructor',
  title: 'Taro Yamada Advisory',
  description: 'Business Strategist & Executive Advisor',
  logo_url: '',
  settings: {
    theme: { primaryColor: '#1e293b' },
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
      <div className="bg-slate-900 text-white text-center py-2.5 text-sm font-medium tracking-wide">
        DEMO — ページメニューをクリックして各ページをご覧ください
      </div>
      <SiteViewer site={{ ...demoSite, pages: demoPages }} currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-gray-200/60 px-4 py-2 flex gap-2 z-50">
        {demoPages.map(p => (
          <button
            key={p.id}
            onClick={() => setCurrentPage(p)}
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
