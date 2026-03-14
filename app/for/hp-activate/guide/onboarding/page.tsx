import { Metadata } from 'next';
import Link from 'next/link';
import {
  BookOpen,
  MousePointerClick,
  TrendingUp,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  Zap,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'ガイドメーカー導入ガイド｜既存HPの離脱をコンバージョンに変える｜集客メーカー',
  description:
    '既存ホームページにステップガイドを埋め込むだけで、訪問者の離脱を防ぎコンバージョンを向上。ガイドメーカーのHP活性化メリットと導入効果をご紹介します。',
  alternates: { canonical: 'https://makers.tokyo/for/hp-activate/guide/onboarding' },
};

const slides = [
  {
    number: '01',
    badge: '課題',
    badgeColor: 'bg-red-50 text-red-600 border-red-200',
    title: '訪問者は「次に何をすればいいか」が分からない',
    description:
      'ホームページに来た人が、サービス内容を見ても「で、どうすればいいの？」と迷って離脱しています。特に初めての訪問者にとって、情報量が多いサイトほど「何から始めればいいか」が分からず、結局何もせずに帰ってしまいます。',
    points: [
      '情報は載っているが「次のアクション」が不明確',
      '初訪問のユーザーがサイト内で迷子になりやすい',
      'せっかくのサービスページが読まれずに離脱される',
    ],
    icon: MousePointerClick,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-50',
  },
  {
    number: '02',
    badge: '解決策',
    badgeColor: 'bg-blue-50 text-blue-600 border-blue-200',
    title: 'ステップガイドが「迷わせない導線」を自動で表示',
    description:
      'ガイドメーカーは、訪問者に「STEP 1 → 2 → 3」の分かりやすいステップ形式で次のアクションを案内します。ページ読み込み時・スクロール時・ボタンクリック時など、最適なタイミングで自動表示。既存HPにコード1行を追加するだけで導入できます。',
    points: [
      'ステップ形式で「次にやること」を明確に案内',
      'ページ読み込み・スクロール・クリックに連動して表示',
      '「もう表示しない」機能でリピーターには非表示に',
    ],
    icon: BookOpen,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
  },
  {
    number: '03',
    badge: 'メリット',
    badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    title: '離脱率の低下＆コンバージョン率の向上',
    description:
      '訪問者が「何をすればいいか」が分かれば、離脱せずに次のステップに進みます。問い合わせフォームへの誘導、サービス申し込みへの案内、資料請求ページへの導線など、御社の目的に合わせたゴールに訪問者を導きます。',
    points: [
      '問い合わせフォームへの到達率が向上',
      '訪問者の行動を「見る」から「動く」に変える',
      'LPのコンバージョン率を改善（リニューアル不要）',
    ],
    icon: TrendingUp,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
  },
  {
    number: '04',
    badge: '導入効果',
    badgeColor: 'bg-purple-50 text-purple-600 border-purple-200',
    title: '「放置HP」が「成果を出すHP」に変わる',
    description:
      '作ったきりで放置していたHPに、ガイドメーカーを埋め込むだけで「訪問者に自動で案内する仕組み」が加わります。サイトリニューアルの高額な費用をかけずに、今あるHPの成果を最大化。表示回数やクリック率のデータを見ながら、ガイド内容を継続的に改善できます。',
    points: [
      'サイトリニューアル不要、今のHPを最大限に活用',
      'アイコン・カラー・ステップ数を自由にカスタマイズ',
      '表示回数・クリック率でガイドの効果を測定・改善',
    ],
    icon: BarChart3,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-50',
  },
];

export default function OnboardingGuidePage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader currentService="quiz" />

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white pt-14 pb-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Link
            href="/for/hp-activate"
            className="inline-flex items-center gap-2 text-blue-600 text-sm font-semibold mb-6 hover:underline"
          >
            <ArrowLeft size={16} />
            HP活性化ページに戻る
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-bold mb-6">
            <BookOpen size={16} />
            ガイドメーカー 導入ガイド
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            HPの離脱を<span className="text-blue-600">コンバージョン</span>に変える
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            ステップガイドを埋め込むだけで、訪問者を<br className="hidden sm:block" />
            迷わせず目的のアクションへ導きます。
          </p>
        </div>
      </section>

      {/* Slides */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-16">
          {slides.map((slide) => {
            const Icon = slide.icon;
            return (
              <div
                key={slide.number}
                className="bg-white border border-gray-200 rounded-3xl shadow-lg overflow-hidden"
              >
                <div className="p-8 sm:p-10">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl font-black text-gray-200">{slide.number}</span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${slide.badgeColor}`}>
                      {slide.badge}
                    </span>
                  </div>

                  <div className="flex items-start gap-5 mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${slide.iconBg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={28} className={slide.iconColor} />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug pt-2">
                      {slide.title}
                    </h2>
                  </div>

                  <p className="text-gray-600 leading-relaxed mb-6">{slide.description}</p>

                  <ul className="space-y-3">
                    {slide.points.map((point, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <CheckCircle2 size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm font-medium">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            御社のHPにガイドメーカーを導入しませんか？
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            御社のHP構成に合わせた個別カスタマイズで導入いたします。<br className="hidden sm:block" />
            まずはお気軽にご相談ください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]"
            >
              <MessageCircle size={20} />
              導入のご相談・お問い合わせ
            </Link>
            <Link
              href="/for/hp-activate"
              className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold text-lg rounded-xl border border-white/30 hover:bg-white/10 transition-all duration-200 min-h-[44px]"
            >
              HP活性化ページに戻る <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
