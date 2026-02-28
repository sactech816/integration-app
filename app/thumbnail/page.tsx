import { Metadata } from 'next';
import Link from 'next/link';
import {
  Image, Layers, Type, Download, Smartphone,
  CheckCircle2, ArrowRight, ChevronRight, Palette, Monitor, Crop,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'サムネイルメーカー（画像作成ツール）| 集客メーカー',
  description:
    'YouTube・ブログ・SNS用サムネイル画像を無料で作成。テンプレートから選んでテキスト・画像を編集するだけ。高画質でダウンロード可能。コンテンツクリエイター・ブロガー・YouTuberに最適。',
  keywords: ['サムネイル作成', 'YouTube サムネイル', 'ブログ アイキャッチ', 'SNS画像', '無料', 'テンプレート', '画像作成'],
  openGraph: {
    title: 'サムネイルメーカー | 集客メーカー',
    description: 'YouTube・ブログ・SNS用サムネイルを無料作成。テンプレートから選んで高画質ダウンロード。',
    type: 'website',
    url: 'https://makers.tokyo/thumbnail',
    siteName: '集客メーカー',
  },
  twitter: { card: 'summary_large_image', title: 'サムネイルメーカー | 集客メーカー', description: 'YouTube・ブログ・SNS用サムネイルを無料作成。テンプレートから高画質ダウンロード。' },
  alternates: { canonical: 'https://makers.tokyo/thumbnail' },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'SoftwareApplication',
      name: 'サムネイルメーカー',
      applicationCategory: 'DesignApplication',
      operatingSystem: 'Web',
      description: 'YouTube・ブログ・SNS用サムネイル画像作成ツール。テンプレートから選んでテキスト・画像を編集、高画質ダウンロード対応。',
      url: 'https://makers.tokyo/thumbnail',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
      provider: { '@type': 'Organization', name: '集客メーカー', url: 'https://makers.tokyo' },
    },
    {
      '@type': 'FAQPage',
      mainEntity: [
        { '@type': 'Question', name: 'サムネイルはどのように作りますか？', acceptedAnswer: { '@type': 'Answer', text: 'テンプレートを選んでテキスト・画像・カラーを変更するだけで完成します。デザインの知識がなくてもプロ品質のサムネイルが作れます。' } },
        { '@type': 'Question', name: 'YouTubeのサムネイルサイズに対応していますか？', acceptedAnswer: { '@type': 'Answer', text: 'はい。YouTube（1280×720px）・Twitter・Instagram・ブログアイキャッチなど、各プラットフォームの推奨サイズに対応したテンプレートを用意しています。' } },
        { '@type': 'Question', name: '作成したサムネイルは商用利用できますか？', acceptedAnswer: { '@type': 'Answer', text: '作成したサムネイルはビジネス・商用目的を含む用途でご利用いただけます。' } },
        { '@type': 'Question', name: 'Photoshopなどのデザインソフトは必要ですか？', acceptedAnswer: { '@type': 'Answer', text: '不要です。ブラウザ上で操作が完結します。専門的なデザインソフトは一切必要ありません。' } },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://makers.tokyo/' },
        { '@type': 'ListItem', position: 2, name: 'サムネイルメーカー', item: 'https://makers.tokyo/thumbnail' },
      ],
    },
  ],
};

const features = [
  { icon: Layers, iconClass: 'text-slate-600', bgClass: 'bg-slate-100', title: '豊富なテンプレート', desc: 'YouTube・ブログ・SNS投稿・告知バナーなど、目的別に用意されたテンプレートから選ぶだけ。デザインセンスがなくても見栄えの良い画像が完成します。' },
  { icon: Type, iconClass: 'text-gray-700', bgClass: 'bg-gray-100', title: 'テキスト・画像を自由に編集', desc: 'フォント・文字サイズ・カラーを自由に変更。背景画像の差し替え・テキストの重ねがけも直感的に操作できます。' },
  { icon: Crop, iconClass: 'text-zinc-600', bgClass: 'bg-zinc-100', title: '各プラットフォームのサイズ対応', desc: 'YouTube（1280×720）・Twitter・Instagram・ブログなど、各SNS・プラットフォームの推奨サイズに対応。最適なサイズで出力できます。' },
  { icon: Download, iconClass: 'text-slate-700', bgClass: 'bg-slate-50', title: '高画質でダウンロード', desc: '完成したサムネイルをPNG/JPG形式で高画質ダウンロード。すぐにアップロードして使えます。' },
];

const steps = [
  { num: '01', title: 'テンプレートを選択', desc: '用途・スタイルに合ったテンプレートをギャラリーから選択。', icon: Layers },
  { num: '02', title: 'テキスト・画像を編集', desc: 'タイトル・サブテキスト・背景画像・カラーを変更してオリジナルに。', icon: Palette },
  { num: '03', title: '高画質でダウンロード', desc: '完成したらダウンロードボタンを押すだけ。すぐに投稿・公開できます。', icon: Download },
];

const useCases = [
  { profession: 'YouTuber・動画クリエイター', title: 'YouTube動画サムネイル', desc: 'クリック率を高めるインパクトのあるサムネイルを素早く作成。視聴者の目を引く画像で再生数を増加。', emoji: '▶️', badge: '動画クリック率の向上に' },
  { profession: 'ブロガー・Webライター', title: 'ブログアイキャッチ画像', desc: 'SNSシェア時に表示される魅力的なOGP画像を作成。記事への流入を増やす視覚的訴求を実現。', emoji: '📝', badge: '記事クリック率の向上に' },
  { profession: 'SNSクリエイター', title: 'Instagram・X投稿画像', desc: 'フォロワーの目を引くビジュアルで発信力を強化。ブランドカラーを統一した投稿画像を効率的に作成。', emoji: '📸', badge: 'SNSエンゲージメントの向上に' },
  { profession: 'セミナー・ウェビナー主催', title: 'イベント告知バナー', desc: 'セミナー・ウェビナーの告知画像を即座に作成。SNSでの拡散・集客に使えるビジュアルを量産。', emoji: '🎯', badge: 'イベント集客の強化に' },
];

const faqs = [
  { q: 'サムネイルはどのように作りますか？', a: 'テンプレートを選んでテキスト・画像・カラーを変更するだけで完成します。デザインの知識がなくてもプロ品質のサムネイルが作れます。' },
  { q: 'YouTubeのサムネイルサイズに対応していますか？', a: 'はい。YouTube（1280×720px）・Twitter・Instagram・ブログアイキャッチなど、各プラットフォームの推奨サイズに対応したテンプレートを用意しています。' },
  { q: '作成したサムネイルは商用利用できますか？', a: '作成したサムネイルはビジネス・商用目的を含む用途でご利用いただけます。' },
  { q: 'Photoshopなどのデザインソフトは必要ですか？', a: '不要です。ブラウザ上で操作が完結します。専門的なデザインソフトは一切必要ありません。' },
  { q: '無料で使えますか？', a: '基本的なサムネイル作成・ダウンロードは無料でご利用いただけます。高度な機能はPROプランでご利用いただけます。' },
];

export default function ThumbnailLandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="min-h-screen bg-white">
        <LandingHeader currentService="thumbnail" />

        {/* Hero */}
        <section className="bg-gradient-to-b from-slate-50 to-white">
          <div className="max-w-5xl mx-auto px-4 pt-14 pb-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-semibold mb-6">
              <Image className="w-4 h-4" />
              YouTube・ブログ・SNSクリエイター向け
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              クリックされる<br />
              <span className="text-slate-700">サムネイルを素早く作る</span>
            </h1>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              豊富なテンプレートからデザインを選んで、テキストと画像を変えるだけ。
              <br className="hidden sm:block" />
              デザインの知識不要で、プロ品質のサムネイルが完成します。
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/thumbnail/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-700 hover:bg-slate-800 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Image className="w-5 h-5" />
                無料でサムネイルを作る
              </Link>
              <Link href="/demos" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-600 font-semibold text-lg rounded-xl border border-slate-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]">
                デモを見る <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />無料で作成・ダウンロード</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />デザイン知識不要</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />高画質PNG/JPG出力</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">サムネイルメーカーの特長</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">Photoshop不要。ブラウザ上でプロ品質のサムネイルが作れます。</p>
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
            <p className="text-gray-600 text-center mb-12">テンプレートを選んで編集するだけ。数分でダウンロード可能</p>
            <div className="grid sm:grid-cols-3 gap-8">
              {steps.map((step, i) => (
                <div key={step.num} className="flex flex-col items-center text-center relative">
                  {i < steps.length - 1 && (
                    <div className="hidden sm:flex absolute top-10 left-[calc(50%+48px)] right-0 items-center justify-center">
                      <ChevronRight className="w-6 h-6 text-slate-300" />
                    </div>
                  )}
                  <div className="w-20 h-20 mb-4 bg-slate-700 rounded-2xl flex items-center justify-center shadow-md">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-xs font-bold text-slate-500 mb-1 tracking-widest">STEP {step.num}</div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link href="/thumbnail/editor" className="inline-flex items-center gap-2 px-8 py-4 bg-slate-700 hover:bg-slate-800 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
                <Image className="w-5 h-5" />今すぐ試してみる（無料）
              </Link>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-4">こんな方が使っています</h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">コンテンツを発信するすべてのクリエイターの制作効率を高めます</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {useCases.map((uc) => (
              <div key={uc.profession} className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-start gap-4">
                  <span className="text-4xl flex-shrink-0">{uc.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">{uc.profession}</div>
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
                    <span className="text-slate-500 text-2xl font-light flex-shrink-0 transition-transform duration-200 group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed text-sm border-t border-gray-100 pt-4">{faq.a}</div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-4xl mx-auto px-4 py-20">
          <div className="bg-gradient-to-br from-slate-700 to-gray-800 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">今すぐサムネイルを作ってみよう</h2>
            <p className="text-slate-300 mb-8 text-lg">無料で作成・ダウンロードできます。数分でプロ品質のサムネイルが完成します。</p>
            <Link href="/thumbnail/editor" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-slate-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]">
              <Image className="w-5 h-5" />無料でサムネイルを作る
            </Link>
            <p className="text-slate-400 text-sm mt-4">クレジットカード不要・すぐにダウンロード可能</p>
          </div>
        </section>
      </div>
    </>
  );
}
