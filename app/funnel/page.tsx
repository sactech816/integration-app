import { Metadata } from 'next';
import Link from 'next/link';
import {
  GitBranch, BarChart3, MousePointerClick, ArrowRight,
  CheckCircle2, ChevronRight, Layers, Target, TrendingUp,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'ファネルメーカー（簡易ファネル構築）| 集客メーカー',
  description:
    '既存のLP・診断クイズ・申し込みフォームを繋いで集客ファネルを構築。各ステップのコンバージョン率を可視化して改善に活かせます。',
  keywords: ['ファネル', 'マーケティングファネル', 'コンバージョン', 'CVR', '集客', '導線設計'],
  openGraph: {
    title: 'ファネルメーカー | 集客メーカー',
    description: '既存ページを繋いで集客ファネルを構築。CVRを可視化して改善。',
    type: 'website',
    url: 'https://makers.tokyo/funnel',
    siteName: '集客メーカー',
  },
  alternates: { canonical: 'https://makers.tokyo/funnel' },
};

const features = [
  { icon: Layers, iconClass: 'text-amber-600', bgClass: 'bg-amber-100', title: '既存ページをステップに', desc: 'プロフィールLP・診断クイズ・申し込みフォーム・メルマガ登録など、既存コンテンツをファネルのステップとして接続。' },
  { icon: MousePointerClick, iconClass: 'text-orange-600', bgClass: 'bg-orange-100', title: 'CVR自動計測', desc: '各ステップのPV数・クリック数・完了数を自動で計測。どこで離脱が起きているか一目で把握。' },
  { icon: BarChart3, iconClass: 'text-yellow-600', bgClass: 'bg-yellow-100', title: 'ウォーターフォールチャート', desc: 'ファネル全体のCVRをグラフで可視化。ボトルネックの特定と改善にデータを活用。' },
  { icon: Target, iconClass: 'text-amber-700', bgClass: 'bg-amber-50', title: '柔軟なステップ設定', desc: 'LP → クイズ → メルマガ → 申し込み → サンキュー等、自由な順序でステップを構成。' },
];

const steps = [
  { num: '01', title: 'ステップを追加', desc: '既存のLP・クイズ・フォーム等を選んでファネルのステップに設定。', icon: Layers },
  { num: '02', title: 'ファネルを公開', desc: '専用URLが発行され、最初のステップから順にページが遷移。', icon: GitBranch },
  { num: '03', title: 'CVRを分析', desc: '各ステップのPV・クリック・完了をダッシュボードで確認。改善ポイントを発見。', icon: TrendingUp },
];

const useCases = [
  { profession: 'コーチ・コンサルタント', title: '無料相談→有料サービス', desc: 'プロフィールLP → 診断クイズ → メルマガ登録 → 個別相談申し込み。見込み客を段階的に育成。', emoji: '💼', badge: '成約率の向上に' },
  { profession: 'オンラインスクール', title: '体験→入会', desc: '講座LP → 無料体験申し込み → メルマガ → 有料コース申し込み。体験から入会への導線を最適化。', emoji: '📚', badge: '入会率の改善に' },
  { profession: 'EC・物販', title: '認知→購入', desc: '商品LP → クイズでニーズ診断 → おすすめ商品 → 申し込みフォーム。商品との相性を高めて購買促進。', emoji: '🛒', badge: '購入率の向上に' },
  { profession: '著者・クリエイター', title: 'ファン獲得→収益化', desc: '自己紹介LP → 無料コンテンツ → メルマガ登録 → 有料コンテンツ販売。段階的にファンを収益化。', emoji: '✨', badge: '収益化の効率化に' },
];

const faqs = [
  { q: 'ファネルのステップには何を設定できますか？', a: '集客メーカーで作成したプロフィールLP・診断クイズ・申し込みフォーム・メルマガ登録フォーム・予約ページのほか、外部URLも設定できます。' },
  { q: 'CVR計測はどのように行われますか？', a: 'ファネルの各ステップのページビュー・CTAクリック・完了を自動で記録します。ダッシュボードでウォーターフォールチャートとして可視化されます。' },
  { q: '無料で使えますか？', a: 'PROプラン（月額3,980円）に含まれる機能です。他のPRO機能と合わせてご利用いただけます。' },
];

export default function FunnelLandingPage() {
  return (
    <>
      <div className="min-h-screen bg-white">
        <LandingHeader currentService="funnel" />

        {/* Hero */}
        <section className="bg-gradient-to-b from-amber-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-6">
              <GitBranch className="w-4 h-4" />
              PROプラン限定機能
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              集客の導線を設計し<br />
              <span className="text-amber-600">CVRを最大化する</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              LP → クイズ → メルマガ → 申し込みフォーム。
              <br className="hidden sm:block" />
              既存ページを繋いで集客ファネルを構築し、各ステップのCVRを計測。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/funnel/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <GitBranch className="w-5 h-5" />
                ファネルを作成する
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-amber-600 font-semibold text-lg rounded-xl border border-amber-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">ファネルメーカーの特長</h2>
          <div className="grid sm:grid-cols-2 gap-6 mt-12">
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-3">3ステップでファネル構築</h2>
            <div className="grid sm:grid-cols-3 gap-8 mt-12">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-amber-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 mb-4 bg-amber-600 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-amber-500 mb-1 tracking-widest">STEP {step.num}</div>
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
                    <div className="text-xs font-semibold text-amber-600 mb-1 uppercase tracking-wide">{uc.profession}</div>
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
                    <span className="text-amber-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-amber-600 to-orange-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">集客ファネルでCVRを最大化</h2>
            <p className="text-amber-100 mb-8 text-lg">PROプランで利用可能。既存ページを繋いでファネルを構築し、データに基づいた改善を。</p>
            <Link href="/funnel/dashboard" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-amber-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <GitBranch className="w-5 h-5" />ファネルを作成する
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
