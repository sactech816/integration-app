import { Metadata } from 'next';
import Link from 'next/link';
import {
  MessageCircle,
  Clock,
  TrendingUp,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Zap,
  Users,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: 'AIコンシェルジュ導入ガイド｜既存HPを24時間接客サイトに｜集客メーカー',
  description:
    '既存ホームページにAIコンシェルジュを埋め込むだけで、24時間自動接客が実現。HP活性化におけるコンシェルジュのメリットと導入効果をご紹介します。',
  alternates: { canonical: 'https://makers.tokyo/for/hp-activate/guide/concierge' },
};

const slides = [
  {
    number: '01',
    badge: '課題',
    badgeColor: 'bg-red-50 text-red-600 border-red-200',
    title: 'HPに来ても「聞けない」から帰ってしまう',
    description:
      'せっかくホームページにアクセスがあっても、訪問者は「営業時間外だから聞けない」「電話するほどではないけど知りたい」という理由で離脱しています。特に夜間・休日のアクセスは、問い合わせにつながらないまま流れてしまっているのが現状です。',
    points: [
      '営業時間外の訪問者は質問できずに離脱',
      '「電話するほどではない」小さな疑問が解消されない',
      'よくある質問への対応に人的コストがかかっている',
    ],
    icon: Users,
    iconColor: 'text-red-500',
    iconBg: 'bg-red-50',
  },
  {
    number: '02',
    badge: '解決策',
    badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    title: 'AIコンシェルジュが24時間365日、自動で接客',
    description:
      '御社のサービス情報・FAQ・料金体系をAIに学習させるだけで、訪問者の質問に24時間自動で応答するチャットボットが完成します。既存HPにコード1行を追加するだけで導入でき、サイトのデザインには一切影響しません。',
    points: [
      '深夜・休日でもAIが即座に質問へ回答',
      '御社のビジネスに特化した正確な応答',
      'Shadow DOM技術で既存デザインに影響ゼロ',
    ],
    icon: MessageCircle,
    iconColor: 'text-emerald-500',
    iconBg: 'bg-emerald-50',
  },
  {
    number: '03',
    badge: 'メリット',
    badgeColor: 'bg-blue-50 text-blue-600 border-blue-200',
    title: '問い合わせ数アップ＆対応コスト削減を同時に実現',
    description:
      'AIコンシェルジュは「まず気軽に聞ける」体験を提供するため、電話やメールでは拾えなかった見込み客との接点が生まれます。同時に、よくある質問への自動応答でスタッフの対応工数を大幅に削減できます。',
    points: [
      '営業時間外の問い合わせ獲得（今まで逃していた見込み客）',
      'よくある質問の自動応答でスタッフの負担を軽減',
      '会話ログから「何を知りたがっているか」を分析・改善',
    ],
    icon: TrendingUp,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
  },
  {
    number: '04',
    badge: '導入効果',
    badgeColor: 'bg-purple-50 text-purple-600 border-purple-200',
    title: 'サイトリニューアル不要で、HPが「働くサイト」に変わる',
    description:
      '高額なサイトリニューアルや新規制作をしなくても、AIコンシェルジュを埋め込むだけでHPが「ただの名刺代わり」から「24時間働く営業担当」に変わります。導入後もナレッジの追加・修正はいつでも可能。データに基づいて応答を改善し続けることで、HPの成果が持続的に向上します。',
    points: [
      'サイトリニューアルの数百万円のコストが不要',
      '導入後すぐに効果を実感、段階的に改善可能',
      '分析ダッシュボードで満足度・よくある質問を可視化',
    ],
    icon: Zap,
    iconColor: 'text-purple-500',
    iconBg: 'bg-purple-50',
  },
];

export default function ConciergeGuidePage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader currentService="quiz" />

      {/* Hero */}
      <section className="bg-gradient-to-b from-emerald-50 to-white pt-14 pb-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Link
            href="/for/hp-activate"
            className="inline-flex items-center gap-2 text-emerald-600 text-sm font-semibold mb-6 hover:underline"
          >
            <ArrowLeft size={16} />
            HP活性化ページに戻る
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-6">
            <MessageCircle size={16} />
            AIコンシェルジュ 導入ガイド
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            既存HPを<span className="text-emerald-600">24時間接客サイト</span>に変える
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            AIコンシェルジュを埋め込むだけで、動きのなかったHPが<br className="hidden sm:block" />
            訪問者に自動で応対するサイトに生まれ変わります。
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
                        <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 flex-shrink-0" />
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
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-3xl p-10 sm:p-14 text-center shadow-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            御社のHPにAIコンシェルジュを導入しませんか？
          </h2>
          <p className="text-emerald-100 mb-8 text-lg">
            御社のHP構成に合わせた個別カスタマイズで導入いたします。<br className="hidden sm:block" />
            まずはお気軽にご相談ください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-10 py-4 bg-white text-emerald-700 font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]"
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
