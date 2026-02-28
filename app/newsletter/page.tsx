import { Metadata } from 'next';
import Link from 'next/link';
import {
  Mail, Users, Send, BarChart3,
  CheckCircle2, ArrowRight, ChevronRight, FileText, Globe,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'メルマガメーカー（メールマガジン配信）| 集客メーカー',
  description:
    '読者リスト管理・メールマガジン一斉配信を簡単に。配信停止管理・開封トラッキングにも対応。見込み客との関係構築にメルマガを活用しましょう。',
  keywords: ['メルマガ', 'メールマガジン', 'メール配信', '読者管理', 'ニュースレター', '一斉送信', '配信停止'],
  openGraph: {
    title: 'メルマガメーカー | 集客メーカー',
    description: 'メールマガジン配信を簡単に。読者リスト管理・一斉配信・配信停止を一元管理。',
    type: 'website',
    url: 'https://makers.tokyo/newsletter',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'メルマガメーカー | 集客メーカー', description: 'メルマガ配信を簡単に。読者管理・一斉送信・配信停止に対応。' },
  alternates: { canonical: 'https://makers.tokyo/newsletter' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'メルマガメーカー',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'メールマガジン配信ツール。読者リスト管理・一斉配信・配信停止管理に対応。見込み客との関係構築に。',
      url: 'https://makers.tokyo/newsletter',
      offers: { '@type': 'Offer', price: '3980', priceCurrency: 'JPY', description: 'PROプランで利用可能' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'メルマガはどのように配信しますか？', acceptedAnswer: { '@type': 'Answer', text: '読者リストを作成し、メール本文を作成して一斉送信します。購読フォームのURLを公開して読者を自動で集めることもできます。' } },
        { '@type': 'Question', name: '配信停止はどのように管理しますか？', acceptedAnswer: { '@type': 'Answer', text: '配信するメールに自動で配信停止リンクが付きます。読者がクリックすると自動で配信停止処理が行われます。' } },
        { '@type': 'Question', name: '読者の登録方法は？', acceptedAnswer: { '@type': 'Answer', text: '公開購読フォームのURLを共有する方法と、管理画面から手動・CSV一括で追加する方法があります。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'メルマガメーカー', item: 'https://makers.tokyo/newsletter' },
      ],
    },
  ],
};

const features = [
  { icon: Users, iconClass: 'text-violet-600', bgClass: 'bg-violet-100', title: '読者リスト管理', desc: '購読者リストを作成・管理。公開フォームで自動収集、手動追加、CSV一括インポートに対応。配信停止も自動管理。' },
  { icon: FileText, iconClass: 'text-purple-600', bgClass: 'bg-purple-100', title: 'メール作成エディタ', desc: 'シンプルなエディタでメール本文を作成。プレビュー機能で送信前に仕上がりを確認できます。' },
  { icon: Send, iconClass: 'text-indigo-600', bgClass: 'bg-indigo-100', title: 'ワンクリック一斉配信', desc: 'リストの全読者にワンクリックで一斉送信。配信停止リンクも自動で挿入されます。' },
  { icon: BarChart3, iconClass: 'text-violet-700', bgClass: 'bg-violet-50', title: '配信履歴・実績管理', desc: '過去のキャンペーン一覧で送信数・送信日を確認。配信内容の振り返りにも活用できます。' },
];

const steps = [
  { num: '01', title: '読者リストを作成', desc: 'リスト名を設定して作成。公開購読フォームのURLが自動生成されます。', icon: Users },
  { num: '02', title: 'メール本文を作成', desc: '件名・本文を入力。プレビューで確認してから送信準備完了。', icon: FileText },
  { num: '03', title: '一斉送信', desc: 'ワンクリックでリスト全員に一斉配信。配信停止リンクも自動付与。', icon: Send },
];

const useCases = [
  { profession: 'コーチ・コンサルタント', title: '定期的な情報発信', desc: '見込み客に有益な情報を定期配信して信頼関係を構築。セミナーや個別相談の案内にも活用。', emoji: '💼', badge: '見込み客との関係構築に' },
  { profession: 'オンラインスクール・講師', title: '受講生への連絡', desc: 'コースの最新情報・特別オファー・新講座の案内を一斉配信。受講生のエンゲージメントを向上。', emoji: '📚', badge: '受講生との継続的な接点に' },
  { profession: 'EC・物販事業者', title: '新商品・セール告知', desc: '新商品入荷やセール情報をタイムリーに配信。購買意欲を高めてリピート購入を促進。', emoji: '🛒', badge: 'リピート率の向上に' },
  { profession: '著者・クリエイター', title: 'ファンコミュニティ運営', desc: '新作情報・舞台裏・限定コンテンツを配信してファンとの距離を縮める。', emoji: '✨', badge: 'ファンとの絆づくりに' },
];

const faqs = [
  { q: 'メルマガはどのように配信しますか？', a: '読者リストを作成し、メール本文を作成して一斉送信します。購読フォームのURLを公開して読者を自動で集めることもできます。' },
  { q: '配信停止はどのように管理しますか？', a: '配信するメールに自動で配信停止リンクが付きます。読者がクリックすると自動で配信停止処理が行われます。' },
  { q: '読者の登録方法は？', a: '公開購読フォームのURLを共有する方法と、管理画面から手動で追加する方法があります。' },
  { q: '何通まで送れますか？', a: 'PROプラン加入中は読者数・配信数に制限はありません。大量配信も安心してご利用いただけます。' },
  { q: '料金はいくらですか？', a: 'PROプラン（月額3,980円）に含まれる機能です。診断クイズ・プロフィールLP・予約システムなど他のPRO機能もすべて利用可能です。' },
];

export default function NewsletterLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader currentService="newsletter" />

        {/* Hero */}
        <section className="bg-gradient-to-b from-violet-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-semibold mb-6">
              <Mail className="w-4 h-4" />
              PROプラン限定機能
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              見込み客との関係を<br />
              <span className="text-violet-600">メルマガで深める</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              読者リスト管理からメール配信まで、
              <br className="hidden sm:block" />
              メルマガ運用に必要なすべてを集客メーカーで完結。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/newsletter/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Mail className="w-5 h-5" />
                メルマガを始める
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-violet-600 font-semibold text-lg rounded-xl border border-violet-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />読者リスト管理</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />一斉配信</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />配信停止自動管理</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">メルマガメーカーの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">読者管理から配信まで、メルマガ運用に必要な機能をすべて備えています。</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">3ステップでメルマガ配信</h2>
            <p className="text-gray-600 text-center mb-12">リスト作成からメール配信まで、シンプルな操作で完了</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-violet-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 mb-4 bg-violet-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-violet-500 mb-1 tracking-widest">STEP {step.num}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/newsletter/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-violet-600 hover:bg-violet-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Mail className="w-5 h-5" />メルマガを始める（PROプラン）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">見込み客・顧客・ファンとの継続的な関係構築にメルマガを活用</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div key={uc.profession} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{uc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-violet-600 mb-1 uppercase tracking-wide">{uc.profession}</div>
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
                    <span className="text-violet-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">メルマガで集客を加速しよう</h2>
            <p className="text-violet-100 mb-8 text-lg">PROプランに含まれる機能です。読者リスト作成から一斉配信まで簡単に始められます。</p>
            <Link href="/newsletter/dashboard" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-violet-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <Mail className="w-5 h-5" />メルマガを始める
            </Link>
            <p className="text-violet-200 text-sm mt-4">PROプラン（月額3,980円）で利用可能</p>
          </div>
        </section>
      </div>
    </>
  );
}
