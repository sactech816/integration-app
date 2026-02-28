import { Metadata } from 'next';
import Link from 'next/link';
import {
  BarChart3, MessageSquare, CheckSquare, TrendingUp,
  CheckCircle2, ArrowRight, ChevronRight, Globe, FileText, Download,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'アンケートメーカー（アンケート作成ツール）| 集客メーカー',
  description:
    'アンケートフォームを無料で作成。複数の質問タイプ・回答データの可視化・CSVダウンロードに対応。顧客満足度調査・従業員エンゲージメント・セミナー後アンケートに最適。',
  keywords: ['アンケート', 'アンケート作成', '顧客満足度調査', '従業員エンゲージメント', '無料', 'フォーム作成', '回答分析'],
  openGraph: {
    title: 'アンケートメーカー | 集客メーカー',
    description: 'アンケートフォームを無料で作成。回答データを可視化・分析。顧客満足度調査・社内アンケートに対応。',
    type: 'website',
    url: 'https://makers.tokyo/survey',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'アンケートメーカー | 集客メーカー', description: 'アンケートフォームを無料作成。回答データを可視化・分析。' },
  alternates: { canonical: 'https://makers.tokyo/survey' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'アンケートメーカー',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'アンケートフォーム作成ツール。複数質問タイプ・回答データ可視化・CSV出力に対応。顧客満足度・従業員エンゲージメント向け。',
      url: 'https://makers.tokyo/survey',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'アンケートはどのように作りますか？', acceptedAnswer: { '@type': 'Answer', text: 'テンプレートを選ぶか、質問を自由に追加して作成します。選択式・自由記述・評価スケールなど複数の質問タイプに対応。作成後はURLをシェアするだけで回答収集を開始できます。' } },
        { '@type': 'Question', name: '回答データはどのように確認できますか？', acceptedAnswer: { '@type': 'Answer', text: 'ダッシュボードでリアルタイムに回答数・選択肢の割合・自由記述の内容を確認できます。データはCSV形式でダウンロードして分析にも活用できます。' } },
        { '@type': 'Question', name: 'スマートフォンから回答できますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい。作成したアンケートはスマートフォン・タブレット・PCすべてに対応したレスポンシブデザインで表示されます。' } },
        { '@type': 'Question', name: 'どんな調査に使えますか？', acceptedAnswer: { '@type': 'Answer', text: '顧客満足度調査・従業員エンゲージメント・商品フィードバック・セミナー後アンケート・NPS調査・採用アンケートなど、あらゆる目的のアンケートに対応します。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'アンケートメーカー', item: 'https://makers.tokyo/survey' },
      ],
    },
  ],
};

const features = [
  { icon: CheckSquare, iconClass: 'text-sky-600', bgClass: 'bg-sky-100', title: '多様な質問タイプに対応', desc: '選択式（単一・複数）・自由記述・評価スケール・マトリクスなど、目的に合わせた質問タイプを自由に組み合わせられます。' },
  { icon: BarChart3, iconClass: 'text-blue-600', bgClass: 'bg-blue-100', title: '回答データをグラフで可視化', desc: '収集した回答を円グラフ・棒グラフでリアルタイムに可視化。選択肢の割合・傾向がひと目でわかります。' },
  { icon: Download, iconClass: 'text-indigo-600', bgClass: 'bg-indigo-100', title: 'CSVでデータをダウンロード', desc: '回答データをCSV形式でダウンロードしてExcelやスプレッドシートで詳細分析。レポート作成にも活用できます。' },
  { icon: MessageSquare, iconClass: 'text-sky-700', bgClass: 'bg-sky-50', title: 'テンプレートで素早く作成', desc: '顧客満足度・セミナー後・従業員エンゲージメントなど、目的別のテンプレートから選んで素早くアンケートを作成できます。' },
];

const steps = [
  { num: '01', title: 'テンプレートを選ぶか質問を追加', desc: '目的に合ったテンプレートを選ぶか、質問を追加してアンケートを作成。', icon: FileText },
  { num: '02', title: 'URLをシェアして回答収集', desc: '専用URLをメール・LINE・SNSでシェア。スマホからかんたんに回答できます。', icon: Globe },
  { num: '03', title: '回答データを分析・活用', desc: 'リアルタイムで回答状況を確認。グラフ表示・CSV出力で分析・改善に活用。', icon: TrendingUp },
];

const useCases = [
  { profession: '飲食店・小売店', title: '顧客満足度アンケート', desc: 'サービス・商品・スタッフ対応への満足度を収集。改善点を把握してリピート率を向上。', emoji: '⭐', badge: '顧客満足度の向上に' },
  { profession: '企業・組織の人事・総務', title: '従業員エンゲージメント調査', desc: '従業員の仕事満足度・組織への帰属意識を定期的に調査。職場環境改善のデータとして活用。', emoji: '🏢', badge: '組織の課題把握に' },
  { profession: 'セミナー・研修主催', title: '受講者フィードバック調査', desc: 'セミナー・研修終了後の満足度・理解度を収集。次回の内容改善に直接活かせる。', emoji: '📝', badge: 'コンテンツ改善に' },
  { profession: '商品・サービス開発', title: '顧客ニーズ調査', desc: '新商品・サービスの需要・価格感・機能ニーズを調査。データに基づいた開発・改善が可能。', emoji: '💡', badge: '商品開発の精度向上に' },
];

const faqs = [
  { q: 'アンケートはどのように作りますか？', a: 'テンプレートを選ぶか、質問を自由に追加して作成します。選択式・自由記述・評価スケールなど複数の質問タイプに対応。作成後はURLをシェアするだけで回答収集を開始できます。' },
  { q: '回答データはどのように確認できますか？', a: 'ダッシュボードでリアルタイムに回答数・選択肢の割合・自由記述の内容を確認できます。データはCSV形式でダウンロードして分析にも活用できます。' },
  { q: 'スマートフォンから回答できますか？', a: 'はい。作成したアンケートはスマートフォン・タブレット・PCすべてに対応したレスポンシブデザインで表示されます。' },
  { q: 'どんな調査に使えますか？', a: '顧客満足度調査・従業員エンゲージメント・商品フィードバック・セミナー後アンケート・NPS調査など、あらゆる目的のアンケートに対応します。' },
  { q: '無料で使えますか？', a: '基本的なアンケート作成・回答収集は無料でご利用いただけます。高度な分析機能はPROプランでご利用いただけます。' },
];

export default function SurveyLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader currentService="survey" />

        {/* Hero */}
        <section className="bg-gradient-to-b from-sky-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-sky-100 text-sky-700 rounded-full text-sm font-semibold mb-6">
              <BarChart3 className="w-4 h-4" />
              顧客・従業員・受講者の声を収集
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              大切な声を集めて<br />
              <span className="text-sky-600">ビジネスを改善する</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              アンケートフォームを無料で作成・公開。
              <br className="hidden sm:block" />
              回答データをグラフで可視化し、改善につながるインサイトを得られます。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/survey/new" className="inline-flex items-center gap-2 px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <BarChart3 className="w-5 h-5" />
                無料でアンケートを作る
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-sky-600 font-semibold text-lg rounded-xl border border-sky-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />無料で作成・公開</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />グラフで可視化</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />CSVエクスポート対応</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">アンケートメーカーの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">作成から回答収集・分析まで、アンケート運用に必要な機能をすべて備えています。</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">3ステップでアンケート開始</h2>
            <p className="text-gray-600 text-center mb-12">数分で作成完了。すぐに回答収集が始められます</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-sky-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 mb-4 bg-sky-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-sky-500 mb-1 tracking-widest">STEP {step.num}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/survey/new" className="inline-flex items-center gap-2 px-8 py-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <BarChart3 className="w-5 h-5" />今すぐ試してみる（無料）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">あらゆる業種・目的の調査・フィードバック収集に活用できます</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div key={uc.profession} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{uc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-sky-600 mb-1 uppercase tracking-wide">{uc.profession}</div>
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
                    <span className="text-sky-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-sky-600 to-blue-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">今すぐアンケートを作ってみよう</h2>
            <p className="text-sky-100 mb-8 text-lg">無料で作成・公開できます。数分で回答収集が始められます。</p>
            <Link href="/survey/new" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-sky-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <BarChart3 className="w-5 h-5" />無料でアンケートを作る
            </Link>
            <p className="text-sky-200 text-sm mt-4">クレジットカード不要・すぐに利用開始</p>
          </div>
        </section>
      </div>
    </>
  );
}
