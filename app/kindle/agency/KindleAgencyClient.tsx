'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  TrendingUp,
  Users,
  Settings,
  CheckCircle,
  Monitor,
  FileText,
  Mail,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  Target
} from 'lucide-react';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';

const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSd8euNVubqlITrCF2_W7VVBjLd2mVxzOIcJ67pNnk3GPLnT_A/viewform';

export default function KindleAgencyClient() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => setOpenFaq(openFaq === index ? null : index);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="font-sans text-slate-800 bg-slate-50 min-h-screen flex flex-col">
      <Header
        setPage={() => {}}
        user={null}
        onLogout={() => {}}
        setShowAuth={() => {}}
      />

      {/* Hero Section */}
      <header className="relative bg-slate-900 text-white pt-32 pb-20 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-blue-600 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-block bg-slate-800/80 backdrop-blur border border-slate-700 rounded-full px-4 py-1.5 mb-6 text-sm text-orange-400 font-semibold tracking-wide">
            【10社限定】第一期代理店パートナー募集
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 tracking-tight">
            Kindle出版支援ビジネスで<br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">新たな収益の柱</span>を構築しませんか？
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            AIを活用した出版システム「KDL」なら、専門知識ゼロでも出版プロデューサーに。<br />
            貴社サービスとの<span className="text-white font-bold border-b-2 border-orange-500">セット販売で高単価パッケージ化</span>を実現します。
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => scrollToSection('contact')} className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 py-4 rounded-full font-bold transition shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2">
              <Mail size={20} /> 資料請求・お問い合わせ
            </button>
            <Link href="/kindle/new?mode=demo" target="_blank" rel="noopener noreferrer" className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 text-lg px-8 py-4 rounded-full font-bold transition flex items-center justify-center gap-2">
              <Monitor size={20} /> 無料デモを体験
            </Link>
          </div>
        </div>
      </header>

      {/* Market Background & Problem */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">なぜ今、Kindle出版ビジネスなのか？</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              経営者や個人の間で「ブランディング」や「リスト獲得」のための電子書籍出版ニーズが急増しています。<br />
              しかし、多くの人が<span className="font-bold text-orange-600">3つの壁</span>に阻まれ、出版を諦めています。
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <FileText size={80} className="text-slate-900" />
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6 text-red-600 font-bold text-xl">1</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">執筆の壁</h3>
              <p className="text-slate-600 leading-relaxed">
                「書きたいけど書けない」「時間がない」<br />
                著者になりたい人の80%以上が、文章作成の段階で挫折しています。
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <Settings size={80} className="text-slate-900" />
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6 text-red-600 font-bold text-xl">2</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">操作の壁</h3>
              <p className="text-slate-600 leading-relaxed">
                EPUB化、KDP登録、表紙設定...。<br />
                専門的なツールや知識が必要で、ITに不慣れな人にはハードルが高い作業です。
              </p>
            </div>

            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
                <Target size={80} className="text-slate-900" />
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-6 text-red-600 font-bold text-xl">3</div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">心理的な壁</h3>
              <p className="text-slate-600 leading-relaxed">
                「自分なんかが本を出していいのか？」<br />
                編集者がいない孤独な作業の中で、自信を失いプロジェクトが頓挫します。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solution (KDL) */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <div className="inline-block bg-orange-500/20 text-orange-400 font-bold px-4 py-1 rounded-full mb-4 text-sm border border-orange-500/30">
                SOLUTION
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
                その全ての壁を<br />
                <span className="text-orange-400">システムが解決</span>します
              </h2>
              <p className="text-slate-300 mb-8 text-lg leading-relaxed">
                「Kindle出版メーカー(KDL)」は、タイトル作成から執筆、出稿までを一気通貫でサポートする半自動システムです。
                AIとの対話形式で進めるだけで、最短1日で原稿が完成します。
              </p>

              <ul className="space-y-4">
                {[
                  "AIによる自動執筆・構成提案機能",
                  "Word / EPUB形式へのワンクリック書き出し",
                  "Amazon SEOに最適化されたタイトル生成",
                  "ネタ発掘診断・著者LP作成機能（新機能）"
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <CheckCircle className="text-orange-500 shrink-0" size={20} />
                    <span className="font-medium text-slate-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:w-1/2 bg-slate-800 rounded-xl p-2 shadow-2xl border border-slate-700 w-full transform rotate-1 hover:rotate-0 transition duration-500">
               {/* Screen Mockup */}
               <div className="bg-slate-900 rounded-lg overflow-hidden flex flex-col h-80 sm:h-96 relative">
                 <div className="bg-slate-800 px-4 py-2 flex items-center gap-2 border-b border-slate-700">
                   <div className="w-3 h-3 rounded-full bg-red-500"></div>
                   <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                   <div className="w-3 h-3 rounded-full bg-green-500"></div>
                   <div className="ml-4 text-xs text-slate-400">Kindle出版メーカー - 執筆画面</div>
                 </div>
                 <div className="p-6 flex-1 flex flex-col gap-4">
                   <div className="w-3/4 h-8 bg-slate-800 rounded animate-pulse"></div>
                   <div className="flex gap-4 h-full">
                     <div className="w-1/3 bg-slate-800/50 rounded p-4 space-y-3 hidden sm:block">
                        <div className="h-4 bg-slate-700 rounded w-full"></div>
                        <div className="h-4 bg-slate-700 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-700 rounded w-4/6"></div>
                     </div>
                     <div className="flex-1 bg-slate-800 rounded p-4 space-y-3 relative overflow-hidden">
                        <div className="flex gap-3 mb-4">
                          <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-xs font-bold">AI</div>
                          <div className="bg-slate-700 rounded-lg rounded-tl-none p-3 text-sm text-slate-200 max-w-[80%]">
                            第2章の構成案を作成しました。この内容で執筆を進めてよろしいですか？
                          </div>
                        </div>
                        <div className="flex gap-3 justify-end">
                          <div className="bg-blue-600 rounded-lg rounded-tr-none p-3 text-sm text-white max-w-[80%]">
                            はい、お願いします。具体例を多めに入れてください。
                          </div>
                        </div>
                        <div className="absolute bottom-4 left-4 right-4 h-12 bg-slate-700/50 rounded border border-slate-600 flex items-center px-4 text-slate-400 text-sm">
                          AIに指示を入力...
                        </div>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Merits Section */}
      <section id="merit" className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-orange-600 font-bold tracking-wider text-sm uppercase">Benefits</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2">代理店パートナーに参加するメリット</h2>
            <p className="mt-4 text-slate-600">システムを販売するだけではありません。<br className="md:hidden"/>貴社のビジネスを加速させる仕組みがあります。</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Merit 1: High Profit */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 flex flex-col">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">高利益率＆ステップアップ報酬</h3>
              <p className="text-slate-600 mb-6 flex-1">
                販売本数に応じて仕入れ価格が下がる「ステップアップ報酬制度」を採用。
                累計販売数が50本を超えると、<span className="font-bold text-orange-600 text-lg">最大40%OFF</span>での仕入れが可能になります。
              </p>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex justify-between items-end mb-2 text-sm text-slate-500">
                  <span>Standardプラン販売時</span>
                  <span className="font-bold text-slate-900">粗利イメージ</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-4 mb-1 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full" style={{ width: '40%' }}></div>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>1件あたり</span>
                  <span className="text-blue-600 text-base">最大 約40,000円</span>
                </div>
              </div>
            </div>

            {/* Merit 2: Set Sales */}
            <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-orange-100 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                推奨モデル
              </div>
              <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                <Zap size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">「セット販売」による高単価化</h3>
              <p className="text-slate-600 mb-6 flex-1">
                KDLのシステム提供だけでなく、貴社独自のサービスを付加価値として乗せることで、
                <span className="font-bold bg-yellow-100 px-1">単価10万〜30万円</span>の高単価パッケージとして販売可能です。
              </p>

              <div className="flex items-center justify-center space-x-2 text-sm font-bold text-center">
                <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 flex-1">
                  <div className="text-slate-500 text-xs mb-1">システム</div>
                  <div className="text-slate-800">KDL利用権</div>
                </div>
                <div className="text-slate-400">+</div>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-200 flex-1">
                  <div className="text-orange-500 text-xs mb-1">貴社独自</div>
                  <div className="text-orange-800">コンサル<br/>制作代行</div>
                </div>
                <div className="text-slate-400">=</div>
                <div className="bg-slate-800 text-white p-3 rounded-lg shadow-lg flex-1">
                  <div className="text-orange-300 text-xs mb-1">高付加価値</div>
                  <div>出版<br/>パック</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex gap-4 items-start">
              <div className="bg-white p-3 rounded-lg shadow-sm text-orange-500 shrink-0">
                <Monitor size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900 mb-2">代理店専用管理画面</h4>
                <p className="text-slate-600 text-sm">
                  専用アカウントから利用者の進捗状況を確認可能。添削やチャット機能も搭載しており、クライアントサポートを効率化できます。
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="bg-white p-3 rounded-lg shadow-sm text-orange-500 shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg text-slate-900 mb-2">販促ツール・デモ提供</h4>
                <p className="text-slate-600 text-sm">
                  提案用のチラシデータや営業資料、お客様に体験してもらうための「無料デモURL」を完備。契約後すぐに営業を開始できます。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audience */}
      <section id="target" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">どんなお客様に喜ばれるのか？</h2>
            <p className="text-slate-600">代理店様がアプローチしやすい、3つの主要ターゲット層</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Award size={40} />,
                title: "経営者・個人事業主",
                desc: "「名刺代わりの1冊」で権威性を高めたい方。競合との差別化や信頼獲得のために、出版ブランディングを求めています。",
                color: "bg-amber-100 text-amber-600"
              },
              {
                icon: <BookOpen size={40} />,
                title: "既存コンテンツ保持者",
                desc: "ブログ、メルマガ、YouTubeなどの過去コンテンツを再利用し、資産化・マネタイズしたいインフルエンサーや講師の方。",
                color: "bg-indigo-100 text-indigo-600"
              },
              {
                icon: <Users size={40} />,
                title: "出版に挫折した方",
                desc: "「書きたい気持ちはあるが書けない」層。AIによる半自動執筆なら、彼らの夢をストレスなく実現できます。",
                color: "bg-emerald-100 text-emerald-600"
              }
            ].map((target, idx) => (
              <div key={idx} className="bg-slate-50 rounded-xl p-8 text-center hover:-translate-y-1 transition duration-300">
                <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${target.color}`}>
                  {target.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{target.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{target.desc}</p>
              </div>
            ))}
          </div>

          {/* Recommended for Agencies */}
          <div className="mt-20 pt-16 border-t border-slate-100">
            <h3 className="text-2xl font-bold text-center text-slate-900 mb-10">このような事業者様に最適です</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "コンサルティング会社", sub: "クライアントのブランディング支援に" },
                { title: "コーチ・講師業", sub: "生徒への出版サポート講座として" },
                { title: "マーケティング代理店", sub: "コンテンツマーケティングの一環として" }
              ].map((item, idx) => (
                <div key={idx} className="bg-white border border-slate-200 p-6 rounded-lg text-center shadow-sm">
                   <div className="font-bold text-lg text-slate-800 mb-1">{item.title}</div>
                   <div className="text-sm text-slate-500">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-amber-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white p-10 rounded-3xl shadow-xl border border-orange-100">
            <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-4 inline-block">FREE DEMO</span>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">営業に使える「デモ環境」を提供</h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              ログイン不要で、AIによるタイトル生成から目次作成までを即座に体験できるデモURLをご用意。<br/>
              お客様の目の前で「魔法のように本ができる様子」を見せるだけで、強力なクロージングになります。
            </p>
            <Link
              href="/kindle/new?mode=demo"
              target="_blank"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-lg px-8 py-4 rounded-full font-bold transition shadow-lg"
            >
              <Monitor size={20} />
              デモ画面を見てみる
            </Link>
            <p className="mt-4 text-xs text-slate-400">※デモ環境はAIを使用しないためコスト0円で何度でも試せます</p>
          </div>
        </div>
      </section>

      {/* Flow Section */}
      <section id="flow" className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">代理店契約までの流れ</h2>
            <p className="text-slate-400">簡単5ステップで、最短1週間でビジネスを開始できます。</p>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-700 -translate-y-1/2 z-0"></div>

            <div className="grid md:grid-cols-5 gap-6 relative z-10">
              {[
                { step: "01", title: "お問い合わせ", desc: "フォームより資料請求" },
                { step: "02", title: "説明・デモ", desc: "詳細説明とデモ体験" },
                { step: "03", title: "ご契約", desc: "契約締結・入金" },
                { step: "04", title: "アカウント発行", desc: "専用管理画面の付与" },
                { step: "05", title: "営業開始", desc: "販促ツールで提案開始" },
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-800 border border-slate-700 p-6 rounded-xl text-center shadow-lg transform hover:-translate-y-2 transition duration-300">
                  <div className="inline-block bg-orange-500 text-white font-bold rounded-lg px-3 py-1 mb-4 shadow-lg shadow-orange-500/30">
                    STEP {item.step}
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">よくある質問</h2>
          <div className="space-y-4">
            {[
              { q: "Kindle出版の知識がなくても大丈夫ですか？", a: "はい、問題ありません。システムの使い方や出版の基礎知識を学べるマニュアルと研修動画をご用意しています。" },
              { q: "代理店になるための初期費用はかかりますか？", a: "詳細な条件につきましては、お問い合わせいただいた方に個別で資料をお送りしております。" },
              { q: "自社の既存サービスと組み合わせて販売してもいいですか？", a: "はい、強く推奨しております。出版プロデュースやコンサルティングなどとパッケージ化することで、より高い価値を提供できます。" },
              { q: "ノルマはありますか？", a: "ノルマは一切ございません。貴社のペースで販売活動を行っていただけます。" }
            ].map((item, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex justify-between items-center p-5 text-left bg-slate-50 hover:bg-slate-100 transition"
                >
                  <span className="font-bold text-slate-800">{item.q}</span>
                  {openFaq === idx ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
                </button>
                {openFaq === idx && (
                  <div className="p-5 bg-white text-slate-600 border-t border-slate-200 text-sm leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section - Google Form */}
      <section id="contact" className="py-24 bg-orange-600 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-slate-900/10"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">ビジネスパートナーになりませんか？</h2>
          <p className="text-orange-100 text-lg mb-10 max-w-2xl mx-auto">
            まずは資料請求・無料デモ体験から。<br />
            不明点やご相談など、お気軽にお問い合わせください。
          </p>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 border border-amber-200 text-center max-w-xl mx-auto shadow-2xl">
            <Mail className="text-amber-500 mx-auto mb-4" size={48} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              メールでお問い合わせ
            </h3>
            <p className="text-gray-600 mb-6">
              代理店契約に関するご質問やお申し込みは、<br />
              お問い合わせフォームよりご連絡ください。
            </p>
            <a
              href={GOOGLE_FORM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-lg text-lg"
            >
              <Mail size={20} />
              お問い合わせフォームへ
            </a>
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
