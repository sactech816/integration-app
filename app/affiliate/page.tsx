import { Metadata } from 'next';
import Link from 'next/link';
import {
  Share2, TrendingUp, DollarSign, Users,
  CheckCircle2, ArrowRight, ChevronRight, BarChart3, Link2,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';
import Footer from '@/components/shared/Footer';

export const metadata: Metadata = {
  title: 'アフィリエイトプログラム | 集客メーカー',
  description:
    '集客メーカーのアフィリエイトプログラム。紹介リンクをシェアするだけで報酬を獲得。ブロガー・インフルエンサー・コンサルタントに最適な収益化手段です。',
  keywords: ['アフィリエイト', '紹介プログラム', '収益化', '集客メーカー', '副収入', '紹介報酬'],
  openGraph: {
    title: 'アフィリエイトプログラム | 集客メーカー',
    description: '集客メーカーを紹介して報酬を獲得。紹介リンクをシェアするだけの簡単収益化。',
    type: 'website',
    url: 'https://makers.tokyo/affiliate',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'アフィリエイトプログラム | 集客メーカー', description: '集客メーカーを紹介して報酬を獲得。' },
  alternates: { canonical: 'https://makers.tokyo/affiliate' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'アフィリエイトプログラム',
      description: '集客メーカーのアフィリエイトプログラム。紹介リンクをシェアして報酬を獲得。',
      url: 'https://makers.tokyo/affiliate',
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'アフィリエイトとは何ですか？', acceptedAnswer: { '@type': 'Answer', text: '集客メーカーを紹介し、紹介リンク経由でユーザーが有料プランに申し込むと報酬が発生するプログラムです。' } },
        { '@type': 'Question', name: '報酬はどのように受け取れますか？', acceptedAnswer: { '@type': 'Answer', text: '毎月の報酬は管理画面で確認でき、所定の金額に達した時点で振込申請が可能です。' } },
        { '@type': 'Question', name: '登録に費用はかかりますか？', acceptedAnswer: { '@type': 'Answer', text: 'アフィリエイトプログラムへの登録・利用は完全無料です。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'アフィリエイト', item: 'https://makers.tokyo/affiliate' },
      ],
    },
  ],
};

const features = [
  { icon: DollarSign, iconClass: 'text-purple-600', bgClass: 'bg-purple-100', title: '紹介報酬を獲得', desc: '紹介リンク経由で有料プランの申し込みがあると報酬が発生。継続的な収入が期待できます。' },
  { icon: Link2, iconClass: 'text-indigo-600', bgClass: 'bg-indigo-100', title: '専用リンクで簡単紹介', desc: '管理画面で発行される専用リンクをSNSやブログでシェアするだけ。特別なスキルは不要です。' },
  { icon: BarChart3, iconClass: 'text-cyan-600', bgClass: 'bg-cyan-100', title: 'リアルタイム成果確認', desc: 'クリック数・成約数・報酬額をダッシュボードでリアルタイムに確認。成果を可視化できます。' },
  { icon: Users, iconClass: 'text-emerald-600', bgClass: 'bg-emerald-100', title: '幅広いターゲット', desc: '集客メーカーは個人〜中小企業まで幅広い層が利用。紹介しやすいサービスです。' },
];

const steps = [
  { num: '01', title: '無料アカウント登録', desc: '集客メーカーに無料登録し、ダッシュボードからアフィリエイトプログラムに参加します。', icon: Users },
  { num: '02', title: '紹介リンクをシェア', desc: '専用の紹介リンクをSNS・ブログ・YouTube・メルマガなどでシェアします。', icon: Share2 },
  { num: '03', title: '報酬を獲得', desc: '紹介リンク経由でユーザーが有料プランに申し込むと報酬が発生します。', icon: DollarSign },
];

const useCases = [
  { profession: 'ブロガー・アフィリエイター', title: 'ブログ記事で紹介', desc: '集客ツールのレビュー記事を書いて紹介リンクを設置。読者のニーズに合ったツールを提案。', emoji: '✍️', badge: 'ブログ収益化' },
  { profession: 'SNSインフルエンサー', title: 'SNS投稿で紹介', desc: 'X・Instagram・YouTubeで集客メーカーの魅力を発信。フォロワーのビジネスを支援しながら収益化。', emoji: '📱', badge: 'SNS収益化' },
  { profession: 'コンサルタント・講師', title: 'クライアントに提案', desc: 'クライアントの集客課題に集客メーカーを提案。問題解決と報酬の両方を実現。', emoji: '💼', badge: '提案+収益化' },
  { profession: 'コミュニティ運営者', title: 'メンバーに紹介', desc: 'ビジネスコミュニティのメンバーに便利なツールとして紹介。コミュニティの価値向上にも貢献。', emoji: '👥', badge: 'コミュニティ活用' },
];

const faqs = [
  { q: 'アフィリエイトとは何ですか？', a: '集客メーカーを紹介し、紹介リンク経由でユーザーが有料プランに申し込むと報酬が発生するプログラムです。登録・利用は完全無料です。' },
  { q: '報酬はどのように発生しますか？', a: 'あなたの専用紹介リンク経由でユーザーが有料プランに申し込むと、成約金額に応じた報酬が発生します。' },
  { q: '登録に費用はかかりますか？', a: 'いいえ。アフィリエイトプログラムへの登録・利用は完全無料です。集客メーカーの無料アカウントがあれば誰でも参加できます。' },
  { q: 'どんな方法で紹介できますか？', a: 'ブログ記事・SNS投稿・YouTube動画・メールマガジン・口コミなど、あらゆるチャネルで紹介できます。専用リンクをシェアするだけです。' },
  { q: '報酬はどのように受け取れますか？', a: '毎月の報酬は管理画面で確認でき、所定の金額に達した時点で振込申請が可能です。' },
];

export default function AffiliateLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader />

        {/* Hero */}
        <section className="bg-gradient-to-b from-purple-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-6">
              <Share2 className="w-4 h-4" />
              紹介プログラムで収益化
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              紹介するだけで<br />
              <span className="text-purple-600">報酬を獲得</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              集客メーカーのアフィリエイトプログラムに参加して、
              <br className="hidden sm:block" />
              紹介リンクをシェアするだけで報酬を獲得できます。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard?view=affiliate" className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Share2 className="w-5 h-5" />
                アフィリエイトを始める
              </Link>
              <Link href="/tools" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-600 font-semibold text-lg rounded-xl border border-purple-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                ツール一覧を見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />登録無料</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />専用リンクでかんたん紹介</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />リアルタイム成果確認</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">アフィリエイトの特長</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">シェアするだけで報酬が発生。手軽に始められる収益化プログラムです。</p>
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
          </div>
        </section>

        {/* Steps */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">3ステップで始められる</h2>
          <p className="text-gray-600 text-center mb-12">登録から報酬獲得まで、すべて無料でかんたん</p>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.num} className="flex flex-col items-center text-center relative">
                {i < steps.length - 1 && (
                  <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                    <ChevronRight className="w-6 h-6 text-purple-300" />
                  </div>
                )}
                <div className="w-20 h-20 bg-purple-100 rounded-2xl flex items-center justify-center mb-4">
                  <step.icon className="w-8 h-8 text-purple-600" />
                </div>
                <span className="text-xs font-bold text-purple-400 mb-1">STEP {step.num}</span>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Use Cases */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方におすすめ</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">さまざまな立場の方がアフィリエイトプログラムで収益化しています。</p>
            <div className="grid sm:grid-cols-2 gap-6">
              {useCases.map((uc) => (
                <div key={uc.profession} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{uc.emoji}</span>
                    <div>
                      <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">{uc.badge}</span>
                      <h3 className="font-bold text-gray-900 mt-1">{uc.profession}</h3>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1 text-sm">{uc.title}</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{uc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="max-w-3xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-10">よくある質問</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.q} className="group bg-white border border-gray-200 rounded-2xl shadow-sm">
                <summary className="flex items-center justify-between p-5 cursor-pointer select-none font-semibold text-gray-900 hover:text-purple-600 transition-colors min-h-[44px]">
                  {faq.q}
                  <ChevronRight className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-90 shrink-0 ml-2" />
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-purple-600 to-indigo-700 py-16 text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">今すぐ始めよう</h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
              無料登録してアフィリエイトリンクを取得。<br className="hidden sm:block" />
              紹介するだけで報酬が発生します。
            </p>
            <Link href="/dashboard?view=affiliate" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-700 font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 min-h-[44px]">
              <Share2 className="w-5 h-5" />
              アフィリエイトを始める
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
