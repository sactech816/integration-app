import { Metadata } from 'next';
import Link from 'next/link';
import {
  ListChecks, Sparkles, BookOpen, Users, CheckCircle2,
  ArrowRight, ChevronRight, Globe, FileText, Smartphone,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'はじめかたメーカー（オンボーディングガイド作成）| 集客メーカー',
  description:
    'サービス・商品の使い始め方をわかりやすく伝えるオンボーディングガイドを無料で作成。ステップバイステップのガイドページで顧客の離脱を防ぎ、満足度を向上。講師・SaaS・コーチに最適。',
  keywords: ['オンボーディング', 'はじめかた', 'スタートガイド', '使い方ガイド', '無料', '顧客サポート', 'SaaS', '講師', 'コーチ'],
  openGraph: {
    title: 'はじめかたメーカー | 集客メーカー',
    description: 'サービス・商品の使い始め方をわかりやすく伝えるガイドページを無料作成。顧客の離脱を防ぎ満足度を向上。',
    type: 'website',
    url: 'https://makers.tokyo/onboarding',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'はじめかたメーカー | 集客メーカー', description: '使い始め方ガイドを無料作成。顧客の離脱を防ぎ満足度を向上。' },
  alternates: { canonical: 'https://makers.tokyo/onboarding' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'はじめかたメーカー',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'サービス・商品のオンボーディングガイド作成ツール。ステップバイステップのガイドで顧客の使い始めをサポート。',
      url: 'https://makers.tokyo/onboarding',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'はじめかたガイドはどのように作りますか？', acceptedAnswer: { '@type': 'Answer', text: 'ガイドのタイトルとステップ数を設定し、各ステップに説明文・画像・チェックリストを追加するだけで完成します。作成後はURLをシェアしてお客様に渡せます。' } },
        { '@type': 'Question', name: 'どんな場面で使えますか？', acceptedAnswer: { '@type': 'Answer', text: '商品・サービスの使い方説明、オンライン講座の受講開始ガイド、会員サービスの入会後フォロー、業務の引継ぎ資料など、「何かを始める手順」を伝えるすべての場面で活用できます。' } },
        { '@type': 'Question', name: 'お客様の進捗を確認できますか？', acceptedAnswer: { '@type': 'Answer', text: 'ガイド内にチェックリストを設置できます。お客様自身が進捗を管理しながら進められます。' } },
        { '@type': 'Question', name: 'テキストと画像の両方で説明できますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい。各ステップにテキスト説明・画像・動画リンクを追加できます。視覚的にわかりやすいガイドを作成できます。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'はじめかたメーカー', item: 'https://makers.tokyo/onboarding' },
      ],
    },
  ],
};

const features = [
  { icon: ListChecks, iconClass: 'text-orange-600', bgClass: 'bg-orange-100', title: 'ステップバイステップで作成', desc: '「STEP 1→2→3」の流れでガイドを構成。お客様がどこまで進んだか一目でわかる構成で、迷わず使い始められます。' },
  { icon: BookOpen, iconClass: 'text-amber-600', bgClass: 'bg-amber-100', title: 'テキスト・画像で視覚的に説明', desc: '各ステップにテキスト・画像・チェックリストを追加。スクリーンショットを使った直感的なガイドで、サポートの問い合わせを大幅に削減できます。' },
  { icon: Smartphone, iconClass: 'text-orange-700', bgClass: 'bg-orange-50', title: 'スマホ・PCで快適に閲覧', desc: '作成したガイドはスマートフォン・タブレット・PCすべてに対応。いつでもどこでも参照できます。' },
  { icon: Globe, iconClass: 'text-yellow-700', bgClass: 'bg-yellow-100', title: '専用URLで共有・埋め込み', desc: '専用URLをメール・LINE・サービス内のリンクで共有。いつでも参照できるガイドがお客様の手元に残ります。' },
];

const steps = [
  { num: '01', title: 'ガイドのタイトルとステップを設定', desc: '「サービス名のはじめかた」などのタイトルと、ステップ数・ステップ名を設定します。', icon: FileText },
  { num: '02', title: '各ステップに説明を追加', desc: '説明文・スクリーンショット・チェックリストを各ステップに追加。わかりやすいガイドを完成。', icon: BookOpen },
  { num: '03', title: '公開してお客様に共有', desc: '専用URLをメール・LINE・ダッシュボードのリンクとして共有。すぐに利用開始できます。', icon: Globe },
];

const useCases = [
  { profession: 'SaaS・Webサービス', title: '新規ユーザー向けスタートガイド', desc: '登録直後のユーザーに「最初にすること5ステップ」を提示。早期活用を促してチャーン（解約）を防止。', emoji: '💻', badge: 'ユーザー定着率の向上に' },
  { profession: 'オンライン講座・コーチ', title: '受講開始ガイド', desc: '「講座の受け方・教材の使い方」を丁寧に案内。受講者の迷いをゼロにして学習を加速。', emoji: '🎓', badge: '受講者の満足度向上に' },
  { profession: '商品販売・EC', title: '商品の使い方ガイド', desc: '購入後の使い方・活用法を視覚的に説明。「使いこなせない」不満を解消してリピート購入を促進。', emoji: '📦', badge: '顧客満足度とリピートに' },
  { profession: '士業・専門家', title: '手続き・業務フローガイド', desc: '手続きの流れ・必要書類・注意事項を整理したガイドで、顧客の不安を解消し問い合わせを削減。', emoji: '📋', badge: '業務効率化と顧客対応に' },
];

const faqs = [
  { q: 'はじめかたガイドはどのように作りますか？', a: 'ガイドのタイトルとステップ数を設定し、各ステップに説明文・画像・チェックリストを追加するだけで完成します。作成後はURLをシェアしてお客様に渡せます。' },
  { q: 'どんな場面で使えますか？', a: '商品・サービスの使い方説明、オンライン講座の受講開始ガイド、会員サービスの入会後フォロー、業務の引継ぎ資料など、「何かを始める手順」を伝えるすべての場面で活用できます。' },
  { q: 'お客様の進捗を確認できますか？', a: 'ガイド内にチェックリストを設置できます。お客様自身が進捗を管理しながら進められます。' },
  { q: 'テキストと画像の両方で説明できますか？', a: 'はい。各ステップにテキスト説明・画像・動画リンクを追加できます。視覚的にわかりやすいガイドを作成できます。' },
  { q: '無料で使えますか？', a: '基本的なガイド作成・公開は無料でご利用いただけます。高度な機能はPROプランでご利用いただけます。' },
];

export default function OnboardingLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader currentService="onboarding" />

        {/* Hero */}
        <section className="bg-gradient-to-b from-orange-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-6">
              <ListChecks className="w-4 h-4" />
              SaaS・講師・コーチ・商品販売者向け
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              お客様が迷わない<br />
              <span className="text-orange-600">「はじめかた」ガイドを作る</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              サービス・商品の使い始め方をステップバイステップで案内。
              <br className="hidden sm:block" />
              お客様の「どうすればいいの？」をゼロにして、満足度を高めます。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/onboarding/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <ListChecks className="w-5 h-5" />
                無料でガイドを作る
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-semibold text-lg rounded-xl border border-orange-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />無料で作成・公開</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />ステップ形式で分かりやすく</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />スマホ・PC対応</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">はじめかたメーカーの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">お客様の「わからない」を解消し、サービスを使いこなしてもらうためのガイドが作れます。</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className={`w-12 h-12 mb-4 ${f.bgClass} rounded-xl flex items-center justify-center`}>
                  <f.icon className={`w-6 h-6 ${f.iconClass}`} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">3ステップでガイド完成</h2>
            <p className="text-gray-600 text-center mb-12">数分でオリジナルのはじめかたガイドが完成します</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-orange-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 mb-4 bg-orange-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-orange-500 mb-1 tracking-widest">STEP {step.num}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/onboarding/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <ListChecks className="w-5 h-5" />今すぐ試してみる（無料）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">「使い始め」の体験を改善するすべての事業者・クリエイターに</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div key={uc.profession} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{uc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-orange-600 mb-1 uppercase tracking-wide">{uc.profession}</div>
                    <h3 className="font-bold text-gray-900 mb-2">「{uc.title}」</h3>
                    <p className="text-sm text-gray-600 mb-3 leading-relaxed">{uc.desc}</p>
                    <div className="inline-flex items-center gap-1.5 text-xs text-green-700 font-semibold bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />{uc.badge}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">よくある質問</h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <details key={faq.q} className="group bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer font-semibold text-gray-900 select-none hover:bg-gray-50 transition-colors duration-150 list-none">
                    <span>{faq.q}</span>
                    <span className="text-orange-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">今すぐはじめかたガイドを作ってみよう</h2>
            <p className="text-orange-100 mb-8 text-lg">無料で作成・公開できます。お客様の「使い始め」体験を改善しましょう。</p>
            <Link href="/onboarding/editor" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-orange-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <ListChecks className="w-5 h-5" />無料でガイドを作る
            </Link>
            <p className="text-orange-200 text-sm mt-4">クレジットカード不要・すぐに利用開始</p>
          </div>
        </section>
      </div>
    </>
  );
}
