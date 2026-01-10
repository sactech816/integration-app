'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Handshake, 
  ArrowLeft, 
  Check, 
  Rocket, 
  Users, 
  TrendingUp, 
  Gift, 
  MessageSquare,
  PlayCircle,
  Copy,
  ExternalLink,
  Mail,
  Building2,
  Star
} from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

export default function KindleAgencyPage() {
  const demoUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/kindle/new?mode=demo` 
    : 'https://makers.tokyo/kindle/new?mode=demo';

  const copyDemoUrl = () => {
    navigator.clipboard.writeText(demoUrl);
    alert('デモURLをコピーしました！');
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: '高い報酬率',
      description: '紹介した顧客の月額料金から継続的に報酬をお支払いします。',
    },
    {
      icon: Users,
      title: '専用サポート',
      description: '代理店専用の問い合わせ窓口と、営業資料を提供します。',
    },
    {
      icon: Gift,
      title: '無料デモ提供',
      description: 'お客様への説明用にデモモードを自由にお使いいただけます。',
    },
    {
      icon: Star,
      title: '優先機能リクエスト',
      description: '代理店様からの機能リクエストを優先的に検討します。',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'お問い合わせ',
      description: '下記フォームよりお問い合わせください。担当者より詳細をご連絡します。',
    },
    {
      num: '02',
      title: '審査・契約',
      description: '簡単な審査の後、代理店契約を締結します。',
    },
    {
      num: '03',
      title: '営業開始',
      description: 'デモURLと営業資料を使って、お客様へのご提案を開始できます。',
    },
  ];

  const useCases = [
    {
      icon: Building2,
      title: 'コンサルティング会社',
      description: 'クライアントのブランディング・情報発信支援として',
    },
    {
      icon: Users,
      title: 'コーチ・講師業',
      description: '生徒・クライアントへの出版サポートサービスとして',
    },
    {
      icon: MessageSquare,
      title: 'マーケティング代理店',
      description: 'コンテンツマーケティングの一環としてKindle出版を提案',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100">
      <Header 
        setPage={() => {}}
        user={null}
        onLogout={() => {}}
        setShowAuth={() => {}}
      />

      {/* ヒーローセクション */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <Link 
            href="/kindle/lp"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft size={18} />
            KDL LPに戻る
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <div className="bg-amber-500 p-3 rounded-xl">
              <Handshake size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black">
                代理店パートナー募集
              </h1>
              <p className="text-gray-400 mt-1">
                キンドルダイレクトライト（KDL）
              </p>
            </div>
          </div>

          <p className="text-xl text-gray-300 max-w-2xl mb-8">
            KDLを活用して、お客様のKindle出版をサポートする<br />
            ビジネスパートナーを募集しています。
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg"
            >
              <Mail size={20} />
              お問い合わせ
            </a>
            <Link
              href="/kindle/new?mode=demo"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-xl transition-all border border-white/20"
            >
              <PlayCircle size={20} />
              デモを体験
            </Link>
          </div>
        </div>
      </section>

      {/* 代理店のメリット */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              代理店パートナーのメリット
            </h2>
            <p className="text-gray-600">
              KDL代理店として活動いただくことで、以下のメリットがあります
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, i) => (
              <div 
                key={i}
                className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-amber-100 p-3 rounded-xl flex-shrink-0">
                    <benefit.icon size={24} className="text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* デモリンクの活用 */}
      <section className="py-20 bg-gradient-to-b from-amber-50 to-orange-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              デモリンクの活用
            </h2>
            <p className="text-gray-600">
              お客様への説明時に、以下のデモリンクをご活用ください
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-amber-200">
            <div className="flex items-center gap-3 mb-4">
              <PlayCircle className="text-amber-500" size={28} />
              <h3 className="text-xl font-bold text-gray-900">デモURL</h3>
            </div>

            <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-between gap-4 mb-6">
              <code className="text-sm text-gray-700 break-all flex-1">
                {demoUrl}
              </code>
              <button
                onClick={copyDemoUrl}
                className="bg-amber-500 hover:bg-amber-600 text-white p-2 rounded-lg transition-colors flex-shrink-0"
                title="コピー"
              >
                <Copy size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-gray-900">デモモードの特徴：</h4>
              <ul className="space-y-2">
                {[
                  'ログイン不要で即座に体験可能',
                  'AIを使わずサンプルデータで動作（コスト0円）',
                  'タイトル生成〜目次作成までの全工程を体験',
                  '最後に製品版への誘導あり',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <Check size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link
                href="/kindle/new?mode=demo"
                target="_blank"
                className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
              >
                <ExternalLink size={16} />
                デモを新しいタブで開く
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* こんな方におすすめ */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              こんな方におすすめ
            </h2>
            <p className="text-gray-600">
              以下のような事業者様に最適です
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((useCase, i) => (
              <div 
                key={i}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 text-center border border-gray-200"
              >
                <div className="bg-amber-100 p-4 rounded-2xl inline-block mb-4">
                  <useCase.icon size={32} className="text-amber-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{useCase.title}</h3>
                <p className="text-gray-600 text-sm">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 導入の流れ */}
      <section className="py-20 bg-gradient-to-b from-slate-800 to-slate-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-4">
              代理店契約までの流れ
            </h2>
            <p className="text-gray-400">
              簡単3ステップで代理店活動を開始できます
            </p>
          </div>

          <div className="space-y-6">
            {steps.map((step, i) => (
              <div 
                key={i}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex items-start gap-6 border border-white/10"
              >
                <div className="bg-amber-500 text-white font-black text-xl w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-300">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* お問い合わせ */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              お問い合わせ
            </h2>
            <p className="text-gray-600">
              代理店契約にご興味のある方は、以下よりお問い合わせください
            </p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200 text-center">
            <Mail className="text-amber-500 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              メールでお問い合わせ
            </h3>
            <p className="text-gray-600 mb-6">
              代理店契約に関するご質問やお申し込みは、<br />
              お問い合わせフォームよりご連絡ください。
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg"
            >
              <MessageSquare size={20} />
              お問い合わせフォームへ
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-4">
            まずはデモを体験してみませんか？
          </h2>
          <p className="text-white/80 mb-8">
            KDLの機能を無料で体験いただけます
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/kindle/new?mode=demo"
              className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 font-bold px-8 py-4 rounded-xl hover:bg-orange-50 transition-all shadow-lg"
            >
              <PlayCircle size={22} />
              デモを体験する
            </Link>
            <Link
              href="/kindle/lp"
              className="inline-flex items-center justify-center gap-2 bg-white/20 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/30 transition-all border border-white/30"
            >
              <BookOpen size={22} />
              KDL LPを見る
            </Link>
          </div>
        </div>
      </section>

      <Footer 
        setPage={() => {}}
        onCreate={() => {}}
        user={null}
        setShowAuth={() => {}}
      />
    </div>
  );
}













