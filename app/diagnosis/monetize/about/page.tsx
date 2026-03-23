'use client';

import React from 'react';
import Link from 'next/link';
import {
  Sparkles, BookOpen, GraduationCap, Briefcase, Share2, Package,
  ArrowRight, CheckCircle2, Clock, Brain, Target, TrendingUp, Star
} from 'lucide-react';

const FEATURES = [
  {
    icon: BookOpen,
    label: 'Kindle出版',
    description: 'あなたの経験を電子書籍にして不労所得を構築',
    color: 'text-violet-600',
    bg: 'bg-violet-100',
  },
  {
    icon: GraduationCap,
    label: 'オンライン講座',
    description: '知識を体系化して教える仕組みを設計',
    color: 'text-indigo-600',
    bg: 'bg-indigo-100',
  },
  {
    icon: Briefcase,
    label: 'コンサル・コーチング',
    description: '個別支援で高単価サービスを構築',
    color: 'text-emerald-600',
    bg: 'bg-emerald-100',
  },
  {
    icon: Share2,
    label: 'SNS発信',
    description: 'フォロワーを資産に変える発信戦略',
    color: 'text-pink-600',
    bg: 'bg-pink-100',
  },
  {
    icon: Package,
    label: 'デジタル商品',
    description: 'テンプレート・ツールを量産販売',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
  },
];

const STEPS = [
  { step: 1, title: '質問に答える', description: '過去の経験・強み・未来のビジョンを入力（約5分）', icon: Clock },
  { step: 2, title: 'AI が才能を分析', description: 'Big5性格診断 × 回答内容をAIが総合分析', icon: Brain },
  { step: 3, title: '収益化プランを受け取る', description: '5分野×5件=25の具体的な収益化アイデア', icon: Target },
];

export default function MonetizeDiagnosisAboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-gray-900">集客メーカー</Link>
          <Link
            href="/diagnosis/monetize"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white font-semibold rounded-xl shadow-md hover:bg-violet-700 transition-all duration-200 text-sm"
          >
            <Sparkles className="w-4 h-4" />
            無料で診断する
          </Link>
        </div>
      </header>

      {/* ヒーロー */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-100 text-violet-700 rounded-full text-sm font-medium mb-6">
          <TrendingUp className="w-4 h-4" />
          AIが25の収益化アイデアを提案
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 leading-tight">
          あなたの才能、<br className="sm:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">
            どう稼げる？
          </span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
          5つの質問に答えるだけで、AIがあなたの才能を分析。
          Kindle出版・講座・コンサル・SNS・デジタル商品の5分野で、
          具体的な収益化プランを提案します。
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/diagnosis/monetize"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 text-lg"
          >
            <Sparkles className="w-5 h-5" />
            無料で診断する
            <ArrowRight className="w-5 h-5" />
          </Link>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> 無料で1件ずつ結果表示</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-gray-400" /> 約5分</span>
          </div>
        </div>
      </section>

      {/* 5分野 */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
          5つの収益化分野を診断
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 text-center hover:shadow-md transition-all">
                <div className={`w-12 h-12 ${f.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">{f.label}</h3>
                <p className="text-xs text-gray-600">{f.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ステップ */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
          かんたん3ステップ
        </h2>
        <div className="space-y-6">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.step} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-md">
                  {s.step}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-gray-600">{s.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 無料/有料 */}
      <section className="max-w-3xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-8">
          料金プラン
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="text-sm font-medium text-gray-500 mb-2">無料プラン</div>
            <div className="text-3xl font-bold text-gray-900 mb-4">¥0</div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> 才能タイプ診断</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> Big5性格特性チャート</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> SWOT分析</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> 各分野1件ずつの提案</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" /> SNSシェア機能</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border-2 border-violet-300 shadow-md p-6 relative">
            <div className="absolute -top-3 left-6 px-3 py-1 bg-violet-600 text-white text-xs font-bold rounded-full">おすすめ</div>
            <div className="text-sm font-medium text-violet-600 mb-2">全分野アンロック</div>
            <div className="text-3xl font-bold text-gray-900 mb-1">¥980</div>
            <div className="text-xs text-gray-500 mb-4">買い切り・永久閲覧</div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" /> 無料プランの全機能</li>
              <li className="flex items-center gap-2"><Star className="w-4 h-4 text-violet-500 flex-shrink-0" /> 全5分野×5件=25提案</li>
              <li className="flex items-center gap-2"><Star className="w-4 h-4 text-violet-500 flex-shrink-0" /> 章構成案・カリキュラム詳細</li>
              <li className="flex items-center gap-2"><Star className="w-4 h-4 text-violet-500 flex-shrink-0" /> 差別化ポイント・想定価格</li>
              <li className="flex items-center gap-2"><Star className="w-4 h-4 text-violet-500 flex-shrink-0" /> 最初の一歩アクションプラン</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          あなたの才能を、収益に変えよう
        </h2>
        <p className="text-gray-600 mb-8">
          まずは無料で診断。あなただけの収益化マップが見つかります。
        </p>
        <Link
          href="/diagnosis/monetize"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 text-lg"
        >
          <Sparkles className="w-5 h-5" />
          無料で診断する
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* フッター */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        <p>&copy; 集客メーカー All rights reserved.</p>
      </footer>
    </div>
  );
}
