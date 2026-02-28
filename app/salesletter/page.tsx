import { Metadata } from 'next';
import Link from 'next/link';
import {
  PenLine, Sparkles, TrendingUp, FileText, MousePointerClick,
  CheckCircle2, ArrowRight, ChevronRight, Globe, Layers,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'セールスライター（セールスレター作成）| 集客メーカー',
  description:
    'AIを使ってセールスレター・長文コピーを無料で作成。AIDA・PASフレームワークに対応、読むと買いたくなるコピーをAIが自動生成。オンライン講座・コーチング・情報販売に最適。',
  keywords: ['セールスレター', 'セールスコピー', '長文LP', 'AI', '無料', 'コピーライティング', 'オンライン講座', 'コーチング'],
  openGraph: {
    title: 'セールスライター | 集客メーカー',
    description: 'AIがセールスコピーを自動生成。読むと買いたくなる長文LPを無料作成。',
    type: 'website',
    url: 'https://makers.tokyo/salesletter',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'セールスライター | 集客メーカー', description: 'AIがセールスコピーを自動生成。読むと行動したくなる長文LPを無料作成。' },
  alternates: { canonical: 'https://makers.tokyo/salesletter' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'セールスライター',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      description: 'AIを使ったセールスレター・長文コピー作成ツール。AIDA・PASフレームワーク対応、オンライン講座・コーチング向け。',
      url: 'https://makers.tokyo/salesletter',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'セールスレターとは何ですか？', acceptedAnswer: { '@type': 'Answer', text: 'セールスレターとは、読者を購入・申込みなどのアクションへ導くことを目的とした長文の説得的な文章です。商品・サービスの価値を伝え、読者の疑問や不安を解消しながら行動を促します。' } },
        { '@type': 'Question', name: 'AIはどのようにセールスコピーを生成しますか？', acceptedAnswer: { '@type': 'Answer', text: '商品・サービスの情報、ターゲット、強み、お客様の悩みなどを入力すると、AIがAIDA（注目→興味→欲求→行動）やPAS（問題→扇動→解決）などの実証済みフレームワークに基づいたセールスコピーを自動生成します。' } },
        { '@type': 'Question', name: 'どんな商品・サービスに向いていますか？', acceptedAnswer: { '@type': 'Answer', text: 'オンライン講座・コーチングプログラム・コンサルティングサービス・情報商材・セミナーなど、サービスの価値説明に文章が必要な商品・サービスに最適です。' } },
        { '@type': 'Question', name: 'コピーライティングの知識がなくても使えますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい。商品情報を入力するだけでAIが構成・文章を自動生成します。生成されたコピーを確認・微調整するだけでプロ品質のセールスレターが完成します。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'セールスライター', item: 'https://makers.tokyo/salesletter' },
      ],
    },
  ],
};

const features = [
  { icon: Sparkles, iconClass: 'text-rose-600', bgClass: 'bg-rose-100', title: 'AIが長文コピーを自動生成', desc: '商品情報を入力するだけで、キャッチコピー・本文・FAQ・CTAまで含む長文セールスレターをAIが自動生成。コピーライティングの知識は不要です。' },
  { icon: Layers, iconClass: 'text-pink-600', bgClass: 'bg-pink-100', title: 'AIDA・PAS構成に対応', desc: '「注目→興味→欲求→行動（AIDA）」「問題→扇動→解決（PAS）」などの実証済みフレームワークに基づいたコピー構成を選択できます。' },
  { icon: TrendingUp, iconClass: 'text-red-600', bgClass: 'bg-red-100', title: '購買意欲を高めるセクション', desc: 'お客様の声・実績・よくある疑問（FAQ）・希少性訴求・保証など、コンバージョンに必要なセクションが自動的に組み込まれます。' },
  { icon: MousePointerClick, iconClass: 'text-rose-700', bgClass: 'bg-rose-50', title: '申込みフォームと一体化', desc: '作成したセールスレターに申込みフォームを直接設置。読者がそのまま申込みや購入へ進める動線を作れます。' },
];

const steps = [
  { num: '01', title: '商品・サービス情報を入力', desc: '商品名・価格・ターゲット・強み・お客様の悩みなどを入力。AIが最適なコピーを提案。', icon: FileText },
  { num: '02', title: 'コピーを確認・カスタマイズ', desc: 'AIが生成した長文コピーを確認・編集。ブランドトーンに合わせて調整できます。', icon: PenLine },
  { num: '03', title: '公開して販売・集客開始', desc: '専用URLを広告・メルマガ・SNSで共有。申込みが入り始めます。', icon: Globe },
];

const useCases = [
  { profession: 'オンライン講座・教育', title: '講座販売セールスレター', desc: '講座の価値・カリキュラム・受講者の声・Q&Aをまとめた長文LPで受講者を獲得。', emoji: '🎓', badge: '講座申込みの増加に' },
  { profession: 'コーチング・コンサルティング', title: 'プログラム案内ページ', desc: '変化のビフォー・アフター・コーチの実績・プログラム内容を伝えて体験申込みへ誘導。', emoji: '💡', badge: '体験・相談申込みに' },
  { profession: '情報商材・デジタル商品', title: '商品販売ページ', desc: '電子書籍・テンプレート・動画教材などの価値を丁寧に伝えて購入率を高める。', emoji: '📦', badge: '販売コンバージョンに' },
  { profession: 'セミナー・イベント主催', title: '参加申込みセールスレター', desc: 'セミナーの価値・登壇者・参加者メリットを伝えて申込み率を向上。', emoji: '🎤', badge: '参加者募集の強化に' },
];

const faqs = [
  { q: 'セールスレターとは何ですか？', a: 'セールスレターとは、読者を購入・申込みなどのアクションへ導くことを目的とした長文の説得的な文章です。商品・サービスの価値を伝え、読者の疑問や不安を解消しながら行動を促します。' },
  { q: 'AIはどのようにセールスコピーを生成しますか？', a: '商品・サービスの情報、ターゲット、強み、お客様の悩みなどを入力すると、AIがAIDA（注目→興味→欲求→行動）やPAS（問題→扇動→解決）などの実証済みフレームワークに基づいたセールスコピーを自動生成します。' },
  { q: 'どんな商品・サービスに向いていますか？', a: 'オンライン講座・コーチングプログラム・コンサルティングサービス・情報商材・セミナーなど、サービスの価値説明に文章が必要な商品・サービスに最適です。' },
  { q: 'コピーライティングの知識がなくても使えますか？', a: 'はい。商品情報を入力するだけでAIが構成・文章を自動生成します。生成されたコピーを確認・微調整するだけでプロ品質のセールスレターが完成します。' },
  { q: '無料で使えますか？', a: '基本的なセールスレター作成・公開は無料でご利用いただけます。高度な機能はPROプランでご利用いただけます。' },
];

export default function SalesletterLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader currentService="salesletter" />

        {/* Hero */}
        <section className="bg-gradient-to-b from-rose-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-full text-sm font-semibold mb-6">
              <PenLine className="w-4 h-4" />
              オンライン講座・コーチング・情報販売向け
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              読むと行動したくなる<br />
              <span className="text-rose-600">セールスレターをAIと作る</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              AIが長文セールスコピーを自動生成。
              <br className="hidden sm:block" />
              キャッチコピーから申込みフォームまで、売れる構成を自動で作ります。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/salesletter/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <PenLine className="w-5 h-5" />
                無料でセールスレターを作る
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-rose-600 font-semibold text-lg rounded-xl border border-rose-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />無料で作成・公開</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />AIDA・PAS構成対応</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />申込みフォーム一体化</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">セールスライターの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">コピーライターに依頼すると高額になる長文セールスレターを、AIのサポートで誰でも作れます。</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">3ステップで完成</h2>
            <p className="text-gray-600 text-center mb-12">コピーライティングの知識は不要です</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-rose-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 mb-4 bg-rose-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-rose-500 mb-1 tracking-widest">STEP {step.num}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/salesletter/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <PenLine className="w-5 h-5" />今すぐ試してみる（無料）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">サービスの価値を伝えて、申込み・購入へつなげるすべての方に</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div key={uc.profession} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{uc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-rose-600 mb-1 uppercase tracking-wide">{uc.profession}</div>
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
                    <span className="text-rose-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-rose-600 to-pink-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">今すぐセールスレターを作ってみよう</h2>
            <p className="text-rose-100 mb-8 text-lg">無料で作成・公開できます。AIが売れるコピーを自動で生成します。</p>
            <Link href="/salesletter/editor" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-rose-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <PenLine className="w-5 h-5" />無料でセールスレターを作る
            </Link>
            <p className="text-rose-200 text-sm mt-4">クレジットカード不要・いつでも編集可能</p>
          </div>
        </section>
      </div>
    </>
  );
}
