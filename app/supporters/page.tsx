import { Metadata } from 'next';
import Link from 'next/link';
import {
  Award, Banknote, GraduationCap, TrendingUp, Users2, Rocket,
  CheckCircle2, ChevronRight, BookOpen, Wrench, Link2, ClipboardList,
  MessageSquare, Handshake, Star,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';
import Footer from '@/components/shared/Footer';
import SupporterApplicationForm from './SupporterApplicationForm';

export const metadata: Metadata = {
  title: 'サポーターズ制度 | 集客メーカー公認パートナープログラム',
  description:
    '集客メーカー公認サポーターとして活動しませんか？教える・作る・紹介するの3つの方法で収益化。認定資格取得で信頼度アップ。プラン不問・審査制。',
  keywords: ['サポーターズ', '公認パートナー', '集客メーカー', '認定制度', '収益化', 'コンサルタント', '制作代行'],
  openGraph: {
    title: 'サポーターズ制度 | 集客メーカー公認パートナープログラム',
    description: '集客メーカー公認サポーターとして、教える・作る・紹介するの3つの方法で収益化。',
    type: 'website',
    url: 'https://makers.tokyo/supporters',
    siteName: '集客メーカー',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'サポーターズ制度 | 集客メーカー公認パートナープログラム',
    description: '集客メーカー公認サポーターとして、教える・作る・紹介するの3つの方法で収益化。',
  },
  alternates: { canonical: 'https://makers.tokyo/supporters' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'サポーターズ制度',
      description: '集客メーカー公認サポーターとして活動できるパートナープログラム。教える・作る・紹介するの3つの方法で収益化。',
      url: 'https://makers.tokyo/supporters',
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'サポーターズ制度とは何ですか？', acceptedAnswer: { '@type': 'Answer', text: '集客メーカーの公認パートナーとして、教える・制作代行・紹介の3つの方法で活動できるプログラムです。' } },
        { '@type': 'Question', name: '有料プランに入っていなくても応募できますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい。プランに関係なくどなたでも応募できます。ただし、集客メーカーの基本的な操作経験は必要です。' } },
        { '@type': 'Question', name: 'アフィリエイトとの違いは何ですか？', acceptedAnswer: { '@type': 'Answer', text: 'アフィリエイトは紹介リンクによる報酬のみですが、サポーターは紹介報酬に加え、教える・制作代行での収益化が可能です。また、公認バッジや専用教材など多くの特典があります。' } },
        { '@type': 'Question', name: '費用はかかりますか？', acceptedAnswer: { '@type': 'Answer', text: '応募・認定・活動のすべてが無料です。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'サポーターズ制度', item: 'https://makers.tokyo/supporters' },
      ],
    },
  ],
};

const features = [
  { icon: Award, iconClass: 'text-yellow-600', bgClass: 'bg-yellow-100', title: '公認サポーター認定', desc: '公式認定バッジを取得して信頼度アップ。名刺やWebサイトで活用できます。' },
  { icon: Banknote, iconClass: 'text-emerald-600', bgClass: 'bg-emerald-100', title: '3つの収益方法', desc: '「教える」「制作代行」「紹介報酬」の3つの方法で収益化が可能です。' },
  { icon: GraduationCap, iconClass: 'text-blue-600', bgClass: 'bg-blue-100', title: '専用教材・研修', desc: 'サポーター限定の教材と定期勉強会で、常にスキルを磨けます。' },
  { icon: TrendingUp, iconClass: 'text-purple-600', bgClass: 'bg-purple-100', title: 'アフィリエイト報酬UP', desc: '通常のアフィリエイトよりも高い報酬率で紹介収益を最大化。' },
  { icon: Users2, iconClass: 'text-cyan-600', bgClass: 'bg-cyan-100', title: '専用コミュニティ', desc: 'サポーター同士の情報交換と運営チームへの直接相談が可能。' },
  { icon: Rocket, iconClass: 'text-rose-600', bgClass: 'bg-rose-100', title: '新機能先行アクセス', desc: '新しいツールや機能をいち早く体験。ベータテスターとして参加。' },
];

const revenueMethods = [
  {
    emoji: '📚',
    title: '教える',
    subtitle: 'セミナー・個別指導',
    desc: '集客メーカーの使い方をセミナーや個別指導で教えて報酬を得る。あなたの知識と経験がそのまま収入に。',
    examples: ['使い方セミナーの開催', '個別コンサルティング', 'オンライン講座の販売'],
    color: 'yellow',
  },
  {
    emoji: '🛠️',
    title: '作る',
    subtitle: '制作代行',
    desc: 'クライアントの診断クイズやLP、ビジネスページを制作代行して対価を得る。公認の信頼感で受注力アップ。',
    examples: ['診断クイズの制作代行', 'プロフィールLPの制作', 'ビジネスLPのデザイン'],
    color: 'amber',
  },
  {
    emoji: '🔗',
    title: '紹介する',
    subtitle: '高報酬アフィリエイト',
    desc: 'サポーター専用の高報酬アフィリエイトリンクで紹介報酬を獲得。通常より高い報酬率が適用されます。',
    examples: ['SNSでの紹介投稿', 'ブログ記事での紹介', 'クライアントへの提案'],
    color: 'orange',
  },
];

const steps = [
  { num: '01', title: '応募フォーム送信', desc: 'このページの応募フォームに必要事項を記入して送信します。', icon: ClipboardList },
  { num: '02', title: '審査・面談', desc: '運営チームが応募内容を確認。必要に応じてオンライン面談を実施します。', icon: MessageSquare },
  { num: '03', title: '認定・研修', desc: '審査通過後、サポーター認定。専用教材で研修を受講します。', icon: Award },
  { num: '04', title: '活動開始', desc: '教える・作る・紹介する、あなたのスタイルで自由に活動開始！', icon: Rocket },
];

const useCases = [
  { profession: 'コンサルタント・コーチ', title: 'コンサル＋ツール提案', desc: 'クライアントに集客メーカーを提案＆活用支援。コンサル料＋紹介報酬のW収入。', emoji: '💼', badge: 'W収入' },
  { profession: 'Web制作フリーランサー', title: '制作代行で新収益', desc: '診断クイズやLPの制作代行で新しい収益源。公認の信頼感で受注アップ。', emoji: '💻', badge: '制作代行' },
  { profession: '講師・セミナー主催者', title: '活用セミナーを開催', desc: '集客メーカー活用セミナーを開催。受講料＋紹介報酬で収益化。', emoji: '🎤', badge: 'セミナー' },
  { profession: '起業支援・インキュベーター', title: '起業家への集客支援', desc: '起業家・中小企業に集客ツールとして提案。支援の幅が広がります。', emoji: '🚀', badge: '起業支援' },
];

const benefits = [
  { icon: Award, title: '認定・ブランディング', items: ['公認サポーターバッジ付与', 'サポーター一覧ページ掲載', '修了証書の発行'] },
  { icon: Banknote, title: '収益機会', items: ['アフィリエイト報酬率UP', '制作代行案件の受注', '講師活動の自由な収益化'] },
  { icon: GraduationCap, title: 'スキルアップ', items: ['専用教材・マニュアル提供', '新機能の先行アクセス', '定期勉強会への参加'] },
  { icon: Handshake, title: 'コミュニティ', items: ['専用コミュニティ参加', '運営への直接相談', '優先サポート対応'] },
  { icon: Star, title: 'マーケティング支援', items: ['公式での紹介・宣伝', '共同セミナー開催', '成功事例インタビュー'] },
];

const faqs = [
  { q: 'サポーターズ制度とは何ですか？', a: '集客メーカーの公認パートナーとして、教える・制作代行・紹介の3つの方法で活動できるプログラムです。公認バッジの付与や専用教材の提供など、多くの特典があります。' },
  { q: '有料プランに入っていなくても応募できますか？', a: 'はい。プランに関係なくどなたでも応募できます。ただし、集客メーカーの基本的な操作経験があることが望ましいです。' },
  { q: 'アフィリエイトとの違いは何ですか？', a: 'アフィリエイトは紹介リンクによる報酬のみですが、サポーターは紹介報酬に加え、教える・制作代行での収益化が可能です。また、公認バッジや専用教材、コミュニティアクセスなど多くの特典があります。' },
  { q: '審査基準はありますか？', a: '集客メーカーの利用経験、教える・サポートへの意欲、コミュニケーション能力を総合的に判断します。特別な資格は不要です。' },
  { q: '活動のノルマはありますか？', a: '固定のノルマはありません。ご自身のペースで自由に活動していただけます。' },
  { q: '費用はかかりますか？', a: '応募・認定・活動のすべてが無料です。追加費用は一切かかりません。' },
];

export default function SupportersLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader />

        {/* Hero */}
        <section className="bg-gradient-to-b from-yellow-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold mb-6">
              <Award className="w-4 h-4" />
              公認パートナープログラム
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              教えて、作って、<br />
              <span className="text-yellow-600">収益を得る</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              集客メーカー公認サポーターとして、
              <br className="hidden sm:block" />
              あなたのスキルと経験を活かして収益化しませんか？
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="#apply" className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Award className="w-5 h-5" />
                サポーターに応募する
              </a>
              <a href="#features" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-yellow-700 font-semibold text-lg rounded-xl border border-yellow-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                詳しく見る <ChevronRight className="w-5 h-5" />
              </a>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />応募無料</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />プラン不問</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />認定バッジ付与</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">サポーターの特典</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">公認サポーターには多くの特典やメリットが用意されています。</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* 3つの収益方法 */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">3つの収益方法</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">あなたのスタイルに合わせて、自由に組み合わせて活動できます。</p>
          <div className="grid md:grid-cols-3 gap-6">
            {revenueMethods.map((method) => (
              <div key={method.title} className={`bg-white border-2 border-${method.color}-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200`}>
                <div className="text-4xl mb-4">{method.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{method.title}</h3>
                <p className={`text-sm font-semibold text-${method.color}-600 mb-3`}>{method.subtitle}</p>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">{method.desc}</p>
                <div className="space-y-2">
                  {method.examples.map((ex) => (
                    <div key={ex} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className={`w-4 h-4 text-${method.color}-500 shrink-0`} />
                      {ex}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">サポーターになるまで</h2>
            <p className="text-gray-600 text-center mb-12">4つのステップで活動開始</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-yellow-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 bg-yellow-100 rounded-2xl flex items-center justify-center mb-4">
                    <step.icon className="w-8 h-8 text-yellow-600" />
                  </div>
                  <span className="text-xs font-bold text-yellow-500 mb-1">STEP {step.num}</span>
                  <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方におすすめ</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">さまざまな立場の方がサポーターとして活躍できます。</p>
            <div className="grid sm:grid-cols-2 gap-6">
              {useCases.map((uc) => (
                <div key={uc.profession} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{uc.emoji}</span>
                    <div>
                      <span className="text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">{uc.badge}</span>
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

        {/* Benefits Detail */}
        <section className="bg-gray-50 py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">特典・メリット一覧</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">サポーターには充実した特典をご用意しています。</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b) => (
                <div key={b.title} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <b.icon className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="font-bold text-gray-900">{b.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {b.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-yellow-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
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
                <summary className="flex items-center justify-between p-5 cursor-pointer select-none font-semibold text-gray-900 hover:text-yellow-600 transition-colors min-h-[44px]">
                  {faq.q}
                  <ChevronRight className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-90 shrink-0 ml-2" />
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* Application Form */}
        <section id="apply" className="bg-gradient-to-b from-yellow-50 to-white py-16">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">サポーターに応募する</h2>
            <p className="text-gray-600 text-center mb-8">以下のフォームに必要事項を記入して送信してください。</p>
            <SupporterApplicationForm />
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-yellow-600 to-amber-700 py-16 text-white text-center">
          <div className="max-w-3xl mx-auto px-4">
            <Award className="w-12 h-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">あなたの経験を活かしませんか？</h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
              教えて、作って、紹介して。<br className="hidden sm:block" />
              集客メーカー公認サポーターとして活躍しましょう。
            </p>
            <a href="#apply" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-yellow-700 font-bold text-lg rounded-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-200 min-h-[44px]">
              <Award className="w-5 h-5" />
              今すぐ応募する
            </a>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
