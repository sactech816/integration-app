import { Metadata } from 'next';
import Link from 'next/link';
import {
  Sparkles, CheckCircle2, ChevronRight, Heart, Target,
  UserCircle, TrendingUp, Calendar, ClipboardList,
  PenTool, ArrowRight,
  Award, Link2, Wrench, Zap,
  Lightbulb, GraduationCap,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';
import Footer from '@/components/shared/Footer';
import PersonaTabs from './PersonaTabs';

export const metadata: Metadata = {
  title: 'LINKメンバー専用｜集客メーカー - あなたの声から生まれた集客プラットフォーム',
  description: 'LINKコミュニティの皆さんの要望をすべてまとめて作った集客ウェブアプリ。プロフィールLP・診断クイズ・予約管理・セールスレターなど、ビジネスに必要なツールが無料で使えます。',
  openGraph: {
    title: 'LINKメンバー専用｜集客メーカー',
    description: 'LINKコミュニティの皆さんの要望をすべてまとめて作った集客プラットフォーム。',
    type: 'website',
    url: 'https://makers.tokyo/link-co',
    siteName: '集客メーカー',
  },
  alternates: { canonical: 'https://makers.tokyo/link-co' },
};

export default function LinkCoPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      {/* ========== Hero ========== */}
      <section className="bg-gradient-to-b from-blue-50 via-indigo-50/50 to-white">
        <div className="max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
            <Heart className="w-4 h-4" />
            LINKコミュニティ限定ページ
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            LINKの皆さんの声から<br />
            <span className="text-blue-600">すべて作りました。</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            「こんなツールが欲しい」「これが無料で使えたら」
            <br className="hidden sm:block" />
            — そんな要望をひとつひとつ形にした集客プラットフォームです。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]"
            >
              <Sparkles className="w-5 h-5" />
              無料で始める
            </Link>
            <a
              href="#tools"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-semibold text-lg rounded-xl border border-blue-200 shadow hover:shadow-md transition-all duration-200 min-h-[44px]"
            >
              ツール一覧を見る <ChevronRight className="w-5 h-5" />
            </a>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />ずっと無料</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />クレジットカード不要</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-500" />スマホで完結</span>
          </div>
        </div>
      </section>

      {/* ========== Empathy Section ========== */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-4">
            こんなお悩み、ありませんか？
          </h2>
          <p className="text-center text-gray-500 mb-10">LINKメンバーから実際に聞いた声です</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { text: 'プロフィールページを作りたいけど、業者に頼むと高い…', icon: UserCircle },
              { text: 'SNSだけの集客に限界を感じている', icon: TrendingUp },
              { text: '予約管理をLINEでやっていて追いきれない', icon: Calendar },
              { text: '診断コンテンツを作りたいけど、プログラミングができない', icon: ClipboardList },
              { text: 'セールスページの文章が書けない', icon: PenTool },
              { text: '何から始めていいかわからない', icon: Lightbulb },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <item.icon className="w-5 h-5 text-gray-400 mt-0.5 shrink-0" />
                <p className="text-gray-700">{item.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 rounded-full font-semibold">
              <ArrowRight className="w-4 h-4" />
              これらすべてを解決するのが「集客メーカー」です
            </div>
          </div>
        </div>
      </section>

      {/* ========== Tools by Persona (Tabs) ========== */}
      <section id="tools" className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-3">
            あなたのビジネスに合うツールを
          </h2>
          <p className="text-center text-gray-500 mb-10">タップして、あなたに合うツールセットを確認してください</p>
          <PersonaTabs />
        </div>
      </section>

      {/* ========== 3 Steps ========== */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">
            使い方はとてもシンプル
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'テンプレートを選ぶ', desc: '目的に合ったテンプレートを選択。AIが雛形を自動生成します。', icon: Target, color: 'bg-blue-600' },
              { step: '2', title: 'テキストと画像を変更', desc: 'スマホからでも簡単に編集。専門知識は一切不要です。', icon: Zap, color: 'bg-indigo-600' },
              { step: '3', title: '公開してシェア', desc: 'ボタンひとつで公開完了。URLをSNSやLINEでシェアするだけ。', icon: Sparkles, color: 'bg-violet-600' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className={`w-14 h-14 ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <item.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-sm font-bold text-blue-600 mb-1">STEP {item.step}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]"
            >
              <Sparkles className="w-5 h-5" />
              無料で始める（30秒で登録完了）
            </Link>
            <p className="text-xs text-gray-500 mt-3">※ クレジットカード登録不要</p>
          </div>
        </div>
      </section>

      {/* ========== Supporters (Compact) ========== */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200 p-8 sm:p-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold mb-4">
                <Award className="w-4 h-4" />
                LINKメンバーにおすすめ
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                サポーターとして活動しませんか？
              </h2>
              <p className="text-gray-600 max-w-xl mx-auto">
                集客メーカーの使い方を教えたり、制作代行したり、紹介するだけで収益化できるプログラムです。
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6 mb-8">
              {[
                { icon: GraduationCap, title: '教える', desc: 'セミナー・個別指導で使い方をレクチャー', color: 'text-blue-600', bg: 'bg-blue-100' },
                { icon: Wrench, title: '作る', desc: 'クライアントの制作代行で報酬を得る', color: 'text-emerald-600', bg: 'bg-emerald-100' },
                { icon: Link2, title: '紹介する', desc: '紹介リンクで高額アフィリエイト報酬', color: 'text-amber-600', bg: 'bg-amber-100' },
              ].map((item) => (
                <div key={item.title} className="bg-white rounded-xl p-5 text-center shadow-sm border border-gray-100">
                  <div className={`w-12 h-12 ${item.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                    <item.icon className={`w-6 h-6 ${item.color}`} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link
                href="/supporters"
                className="inline-flex items-center gap-2 px-8 py-4 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 min-h-[44px]"
              >
                <Award className="w-5 h-5" />
                サポーター制度の詳細を見る
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Final CTA ========== */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            LINKメンバーのあなたへ
          </h2>
          <p className="text-blue-100 text-lg mb-8 leading-relaxed">
            皆さんの「あったらいいな」を全部詰め込みました。
            <br className="hidden sm:block" />
            まずは無料で、あなたのビジネスに合うツールを試してみてください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-blue-700 text-lg font-bold py-4 px-12 rounded-full shadow-2xl transition transform hover:-translate-y-1 min-h-[44px]"
            >
              <Sparkles className="w-5 h-5" />
              無料で始める
            </Link>
          </div>
          <p className="text-sm text-blue-200">※ 登録は30秒で完了 / クレジットカード不要 / いつでも無料で使えます</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
