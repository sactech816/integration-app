import { Metadata } from 'next';
import Link from 'next/link';
import {
  FileText, CreditCard, Users, BarChart3,
  CheckCircle2, ArrowRight, ChevronRight, Globe, ShieldCheck,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: '申し込みフォームメーカー（決済付きフォーム作成）| 集客メーカー',
  description:
    '決済機能付きの申し込みフォームを簡単に作成。Stripe・UnivaPay対応。セミナー・講座・コンサル申し込みの受付と決済を1つのフォームで完結。',
  keywords: ['申し込みフォーム', '決済フォーム', 'Stripe', '決済機能', 'フォーム作成', 'オンライン決済'],
  openGraph: {
    title: '申し込みフォームメーカー | 集客メーカー',
    description: '決済付き申し込みフォームを簡単作成。セミナー・講座・コンサル受付に。',
    type: 'website',
    url: 'https://makers.tokyo/order-form',
    siteName: '集客メーカー',
  },
  alternates: { canonical: 'https://makers.tokyo/order-form' },
};

const features = [
  { icon: FileText, iconClass: 'text-emerald-600', bgClass: 'bg-emerald-100', title: 'カスタムフォームビルダー', desc: 'テキスト・メール・電話番号・選択肢・チェックボックスなど多彩なフィールドを自由に追加。必須項目の設定も可能。' },
  { icon: CreditCard, iconClass: 'text-green-600', bgClass: 'bg-green-100', title: 'Stripe / UnivaPay 決済対応', desc: 'クレジットカード決済に対応。申し込みから決済まで1つのフォームで完結。無料フォームとしても利用可能。' },
  { icon: Users, iconClass: 'text-teal-600', bgClass: 'bg-teal-100', title: '申し込み管理ダッシュボード', desc: '申し込み一覧を管理画面で確認。決済ステータス・フォームデータをまとめて管理。' },
  { icon: ShieldCheck, iconClass: 'text-emerald-700', bgClass: 'bg-emerald-50', title: 'セキュアな決済環境', desc: 'Stripe / UnivaPay のセキュアな決済基盤を利用。PCI DSS準拠で安心のオンライン決済。' },
];

const steps = [
  { num: '01', title: 'フォームを作成', desc: 'タイトル・フィールド・価格・決済方法を設定してフォームを作成。', icon: FileText },
  { num: '02', title: 'URLを共有', desc: '公開URLをメール・SNS・LPに掲載して申し込み受付開始。', icon: Globe },
  { num: '03', title: '申し込み・決済を管理', desc: 'ダッシュボードで申し込み一覧と決済状況を確認。', icon: BarChart3 },
];

const useCases = [
  { profession: 'コーチ・コンサルタント', title: 'セッション申し込み', desc: '個別コーチングやコンサルティングの有料申し込みフォーム。決済完了と同時に申し込み確定。', emoji: '💼', badge: '有料サービスの受付に' },
  { profession: 'セミナー・講座主催', title: 'セミナー参加申し込み', desc: 'セミナーや講座の参加費をオンラインで決済。名前・メール・質問事項など自由にカスタマイズ。', emoji: '🎓', badge: 'イベント受付の効率化に' },
  { profession: 'スクール・教室', title: '講座・コース申し込み', desc: 'オンライン講座や定期コースへの申し込みと受講料決済を一括で処理。', emoji: '📚', badge: '受講者管理の効率化に' },
  { profession: '物販・サービス業', title: '商品・サービス注文', desc: '限定商品の予約受付やカスタムオーダーの受注フォーム。決済まで一気通貫。', emoji: '🛒', badge: '注文管理の効率化に' },
];

const faqs = [
  { q: 'どの決済方法に対応していますか？', a: 'Stripe（クレジットカード）とUnivaPayに対応しています。お客様はカード情報を安全に入力して決済できます。' },
  { q: '無料のフォームも作れますか？', a: 'はい。決済なしの無料申し込みフォームとしても利用可能です。後から決済機能を追加することもできます。' },
  { q: '申し込みデータはどのように管理しますか？', a: 'ダッシュボードで一覧確認できます。名前・メール・カスタムフィールドの回答・決済ステータスを確認できます。' },
  { q: '料金はいくらですか？', a: 'PROプラン（月額3,980円）に含まれる機能です。決済手数料は各決済プロバイダの規定に準じます。' },
];

export default function OrderFormLandingPage() {
  return (
    <>
      <div className="min-h-screen bg-white">
        <LandingHeader currentService="order-form" />

        {/* Hero */}
        <section className="bg-gradient-to-b from-emerald-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold mb-6">
              <CreditCard className="w-4 h-4" />
              PROプラン限定機能
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              申し込みから決済まで<br />
              <span className="text-emerald-600">1つのフォームで完結</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              カスタムフォーム作成＋Stripe / UnivaPay決済。
              <br className="hidden sm:block" />
              セミナー・講座・コンサルの申し込み受付を効率化。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/order-form/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <FileText className="w-5 h-5" />
                フォームを作成する
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-emerald-600 font-semibold text-lg rounded-xl border border-emerald-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">申し込みフォームメーカーの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">フォーム作成から決済・申し込み管理まですべてを簡単に。</p>
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">3ステップで申し込み受付開始</h2>
            <p className="text-gray-600 text-center mb-12">フォーム作成から公開まで数分で完了</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-emerald-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 mb-4 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-emerald-500 mb-1 tracking-widest">STEP {step.num}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <div className="grid sm:grid-cols-2 gap-6 mt-12">
            {useCases.map((uc) => (
              <div key={uc.profession} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{uc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-emerald-600 mb-1 uppercase tracking-wide">{uc.profession}</div>
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
                    <span className="text-emerald-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-emerald-600 to-green-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">決済付きフォームで申し込みを効率化</h2>
            <p className="text-emerald-100 mb-8 text-lg">PROプランで申し込みフォーム作成＋決済機能が使えます。</p>
            <Link href="/order-form/dashboard" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-emerald-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <FileText className="w-5 h-5" />フォームを作成する
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
