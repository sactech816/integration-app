'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, BookOpen, GraduationCap, Briefcase, Share2, Package,
  ArrowRight, CheckCircle2, Clock, Brain, Target, TrendingUp, Star, Crown, FileText
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';

const FEATURES = [
  { icon: BookOpen, label: 'Kindle出版', description: 'あなたの経験を電子書籍にして不労所得を構築', color: 'text-violet-600', bg: 'bg-violet-100' },
  { icon: GraduationCap, label: 'オンライン講座', description: '知識を体系化して教える仕組みを設計', color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { icon: Briefcase, label: 'コンサル・コーチング', description: '個別支援で高単価サービスを構築', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { icon: Share2, label: 'SNS発信', description: 'フォロワーを資産に変える発信戦略', color: 'text-pink-600', bg: 'bg-pink-100' },
  { icon: Package, label: 'デジタル商品', description: 'テンプレート・ツールを量産販売', color: 'text-amber-600', bg: 'bg-amber-100' },
];

const STEPS = [
  { step: 1, title: '質問に答える', description: '過去の経験・強み・未来のビジョンを入力（約5分）', icon: Clock },
  { step: 2, title: 'AI が才能を分析', description: 'Big5性格診断 × 回答内容をAIが総合分析', icon: Brain },
  { step: 3, title: '収益化プランを受け取る', description: '5分野×5件=25の具体的な収益化アイデア', icon: Target },
];

export default function MonetizeDiagnosisAboutPage() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) return;
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) setUser({ email: authUser.email || undefined });
    };
    checkAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <Header
        user={user}
        onLogout={async () => { await supabase?.auth.signOut(); setUser(null); }}
        setShowAuth={setShowAuth}
      />

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
            <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> 無料で各分野1件表示</span>
            <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-gray-400" /> 約5分</span>
          </div>
        </div>
      </section>

      {/* 5分野 */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-8">5つの収益化分野を診断</h2>
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
        <h2 className="text-xl font-bold text-gray-900 text-center mb-8">かんたん3ステップ</h2>
        <div className="space-y-6">
          {STEPS.map((s) => (
            <div key={s.step} className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-md">
                {s.step}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-600">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 料金プラン */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-8">料金プラン</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* 無料 */}
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

          {/* 分野別 */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="text-sm font-medium text-gray-500 mb-2">分野別レポート</div>
            <div className="text-3xl font-bold text-gray-900 mb-1">¥980</div>
            <div className="text-xs text-gray-500 mb-4">1分野あたり・買い切り</div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" /> 無料プランの全機能</li>
              <li className="flex items-center gap-2"><Star className="w-4 h-4 text-violet-500 flex-shrink-0" /> 選んだ分野の5件の提案</li>
              <li className="flex items-center gap-2"><Star className="w-4 h-4 text-violet-500 flex-shrink-0" /> 章構成案・カリキュラム詳細</li>
              <li className="flex items-center gap-2"><Star className="w-4 h-4 text-violet-500 flex-shrink-0" /> 差別化ポイント</li>
              <li className="flex items-center gap-2"><Star className="w-4 h-4 text-violet-500 flex-shrink-0" /> 最初の一歩アクションプラン</li>
            </ul>
          </div>

          {/* 完全診断 */}
          <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border-2 border-violet-300 shadow-md p-6 relative">
            <div className="absolute -top-3 left-6 px-3 py-1 bg-violet-600 text-white text-xs font-bold rounded-full">おすすめ</div>
            <div className="text-sm font-medium text-violet-600 mb-2">完全診断レポート</div>
            <div className="text-3xl font-bold text-gray-900 mb-1">¥3,980</div>
            <div className="text-xs text-gray-500 mb-4">買い切り・永久閲覧 <span className="text-violet-600 font-medium">（¥920お得）</span></div>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-violet-500 flex-shrink-0" /> 全5分野×5件=25提案</li>
              <li className="flex items-center gap-2"><Crown className="w-4 h-4 text-violet-500 flex-shrink-0" /> 総括レポート（限定）</li>
              <li className="flex items-center gap-2"><Crown className="w-4 h-4 text-violet-500 flex-shrink-0" /> 収益化ロードマップ</li>
              <li className="flex items-center gap-2"><Crown className="w-4 h-4 text-violet-500 flex-shrink-0" /> 分野間の連携戦略</li>
              <li className="flex items-center gap-2"><Crown className="w-4 h-4 text-violet-500 flex-shrink-0" /> 30日アクションプラン</li>
            </ul>
          </div>
        </div>

        {/* サンプルレポートリンク */}
        <div className="text-center mt-6">
          <Link
            href="/diagnosis/monetize/sample"
            className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 font-medium text-sm transition-all"
          >
            <FileText className="w-4 h-4" />
            サンプルレポートを見る
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">あなたの才能を、収益に変えよう</h2>
        <p className="text-gray-600 mb-8">まずは無料で診断。あなただけの収益化マップが見つかります。</p>
        <Link
          href="/diagnosis/monetize"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 text-lg"
        >
          <Sparkles className="w-5 h-5" />
          無料で診断する
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        <p>&copy; 集客メーカー All rights reserved.</p>
      </footer>
    </div>
  );
}
