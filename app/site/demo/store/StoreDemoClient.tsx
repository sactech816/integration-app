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
      {
        id: generateBlockId(), type: 'hero',
        data: {
          headline: 'The Roastery Roppongi',
          subheadline: 'Specialty Coffee & Artisan Bakery — 毎朝届く、焙煎したての一杯',
          buttonText: '席を予約する',
          buttonUrl: '#contact',
          backgroundImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1920&q=80',
          backgroundOpacity: 35,
        },
      },
      {
        id: generateBlockId(), type: 'text_card',
        data: {
          title: 'Our Philosophy',
          text: '六本木の路地裏に佇む、焙煎士が一杯ずつ淹れるスペシャルティコーヒーショップ。世界各地の農園から厳選したシングルオリジンを、店内の焙煎機で毎朝ローストしています。併設のベーカリーでは、北海道産小麦と発酵バターで焼き上げるクロワッサンやカンパーニュをご用意。「素材の個性を最大限に引き出す」をコンセプトに、コーヒーとパンの最高のペアリングをお届けします。',
          align: 'center',
        },
      },
      {
        id: generateBlockId(), type: 'features',
        data: {
          title: 'What Makes Us Special',
          items: [
            { icon: '☕', title: 'シングルオリジン専門', description: 'エチオピア・コロンビア・グアテマラなど、常時8種類以上のシングルオリジンをご用意' },
            { icon: '🔥', title: '店内自家焙煎', description: 'ドイツ製プロバット焙煎機で毎朝ロースト。焙煎日から72時間以内の豆のみ提供' },
            { icon: '🥐', title: 'アルチザンベーカリー', description: '北海道産小麦・発酵バター・天然酵母。フランス仕込みの製法で毎朝5時から焼き上げ' },
          ],
        },
      },
      {
        id: generateBlockId(), type: 'gallery',
        data: {
          items: [
            { id: generateBlockId(), url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=800&q=80', caption: 'ハンドドリップコーヒー' },
            { id: generateBlockId(), url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80', caption: 'ラテアート' },
            { id: generateBlockId(), url: 'https://images.unsplash.com/photo-1447933601403-56dc2f6421d0?auto=format&fit=crop&w=800&q=80', caption: '焙煎豆' },
            { id: generateBlockId(), url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80', caption: '店内の雰囲気' },
            { id: generateBlockId(), url: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?auto=format&fit=crop&w=800&q=80', caption: 'クロワッサン' },
            { id: generateBlockId(), url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80', caption: 'カフェの朝' },
          ],
        },
      },
      {
        id: generateBlockId(), type: 'testimonial',
        data: {
          title: 'お客様の声',
          items: [
            { name: 'M.S. 様', role: 'IT企業勤務', comment: '毎朝出勤前に立ち寄っています。エチオピアのナチュラルが絶品で、クロワッサンとのペアリングが最高です。六本木で一番好きなカフェ。', image: '' },
            { name: 'K.T. 様', role: 'デザイナー', comment: '焙煎したての豆の香りに包まれる空間が素晴らしい。リモートワークにも最適な落ち着いた雰囲気で、週3回は通っています。', image: '' },
            { name: 'Y.N. 様', role: 'フリーランスライター', comment: 'コーヒーの味はもちろん、焼きたてのカンパーニュが絶品。仕事の合間に訪れるのが日課になりました。バリスタの丁寧な接客にも癒されます。', image: '' },
          ],
        },
      },
      {
        id: generateBlockId(), type: 'cta_section',
        data: {
          title: '特別な一杯を、あなたに',
          description: '焙煎したてのコーヒーとアルチザンベーカリーを、六本木でお楽しみください。ご予約・お取り置きもオンラインで承っています。',
          buttonText: '予約する',
          buttonUrl: '#contact',
        },
      },
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
      {
        id: generateBlockId(), type: 'hero',
        data: {
          headline: 'Menu',
          subheadline: '厳選素材で仕上げるドリンクとフードのラインナップ',
          backgroundImage: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=1920&q=80',
          backgroundOpacity: 30,
        },
      },
      {
        id: generateBlockId(), type: 'pricing',
        data: {
          title: 'セットメニュー',
          plans: [
            {
              name: 'Morning Set',
              price: '¥1,200',
              features: [
                'クロワッサン or カンパーニュトースト',
                'スクランブルエッグ & グリーンサラダ',
                'ハンドドリップコーヒー（お好きな豆）',
                '7:00〜10:00 限定',
              ],
              recommended: false,
            },
            {
              name: 'Pairing Set',
              price: '¥1,800',
              features: [
                'バリスタおすすめの豆でハンドドリップ',
                '季節のヴィエノワズリー2種',
                'ミニデザート',
                '焙煎士のテイスティングノート付き',
              ],
              recommended: true,
            },
            {
              name: 'Afternoon Tea Set',
              price: '¥2,500',
              features: [
                'スペシャルティコーヒー or 紅茶',
                'パティシエ特製スイーツ3種',
                '焼き菓子アソート',
                '14:00〜17:00 限定',
              ],
              recommended: false,
            },
          ],
        },
      },
      {
        id: generateBlockId(), type: 'features',
        data: {
          title: 'ドリンクメニュー',
          items: [
            { icon: '☕', title: 'ハンドドリップ', description: '¥600〜 ── 8種類のシングルオリジンから選択' },
            { icon: '🥛', title: 'カフェラテ / カプチーノ', description: '¥650〜 ── 北海道産ミルク使用。オーツミルク変更可' },
            { icon: '🍵', title: '抹茶ラテ / ほうじ茶ラテ', description: '¥700 ── 京都・宇治の石臼挽き茶葉を使用' },
          ],
        },
      },
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
      {
        id: generateBlockId(), type: 'hero',
        data: {
          headline: 'Access',
          subheadline: '六本木ヒルズすぐ、緑に囲まれた隠れ家カフェ',
          backgroundImage: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=1920&q=80',
          backgroundOpacity: 35,
        },
      },
      {
        id: generateBlockId(), type: 'text_card',
        data: {
          title: '店舗情報',
          text: '〒106-6108 東京都港区六本木6丁目10-1 六本木ヒルズ ウェストウォーク 1F\n\n営業時間：7:00〜20:00（L.O. 19:30）\n定休日：不定休\nTEL：03-6434-7890\n\n東京メトロ 日比谷線「六本木」駅 1C出口 徒歩3分\n都営大江戸線「六本木」駅 3番出口 徒歩6分\n都営大江戸線「麻布十番」駅 7番出口 徒歩8分',
          align: 'left',
        },
      },
      {
        id: generateBlockId(), type: 'google_map',
        data: {
          title: '六本木ヒルズ ウェストウォーク',
          address: '東京都港区六本木6丁目10-1 六本木ヒルズ',
          embedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.748!2d139.72679!3d35.66047!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x60188b771049dc33%3A0x4e27aa62cbe24495!2z5YWt5pys5pyo44OS44Or44K6!5e0!3m2!1sja!2sjp!4v1',
        },
      },
      {
        id: generateBlockId(), type: 'gallery',
        data: {
          items: [
            { id: generateBlockId(), url: 'https://images.unsplash.com/photo-1453614512568-c4024d13c247?auto=format&fit=crop&w=800&q=80', caption: '外観' },
            { id: generateBlockId(), url: 'https://images.unsplash.com/photo-1559305616-3f99cd43e353?auto=format&fit=crop&w=800&q=80', caption: 'テラス席' },
            { id: generateBlockId(), url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80', caption: '店内' },
          ],
        },
      },
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
      {
        id: generateBlockId(), type: 'hero',
        data: {
          headline: 'Contact',
          subheadline: 'ご予約・貸切・ケータリングのご相談はこちらから',
          backgroundImage: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=1920&q=80',
          backgroundOpacity: 35,
        },
      },
      {
        id: generateBlockId(), type: 'text_card',
        data: {
          title: 'お気軽にご連絡ください',
          text: 'ご予約・貸切・ケータリングなど、お気軽にお問い合わせください。\n法人様のミーティング利用やイベント開催もご相談いただけます。\n\nお電話でのご予約：03-6434-7890（営業時間内）',
          align: 'center',
        },
      },
      {
        id: generateBlockId(), type: 'lead_form',
        data: { title: 'お問い合わせフォーム', buttonText: '送信する' },
      },
    ] as unknown as any[],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const demoSite: Site = {
  id: 'demo-store',
  user_id: 'demo',
  slug: 'demo-store',
  title: 'The Roastery Roppongi',
  description: 'Specialty Coffee & Artisan Bakery',
  logo_url: '',
  settings: {
    theme: { primaryColor: '#292524' },
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
      <div className="bg-stone-900 text-white text-center py-2.5 text-sm font-medium tracking-wide">
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
                ? 'bg-stone-900 text-white shadow-md'
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
