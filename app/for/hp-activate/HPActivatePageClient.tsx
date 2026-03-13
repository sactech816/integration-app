'use client';

import { ReactNode } from 'react';
import {
  MessageCircle,
  BookOpen,
  Code,
  Zap,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Check,
  ChevronRight,
  Shield,
  BarChart3,
  MousePointerClick,
  Eye,
  Users,
  HelpCircle,
} from 'lucide-react';
import HomeAuthProvider from '@/components/home/HomeAuthProvider';
import { AuthCTAButton } from '@/components/home/HomeClientButtons';

const siteUrl = 'https://makers.tokyo';

// 構造化データ
const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: '集客メーカー', item: siteUrl },
    { '@type': 'ListItem', position: 2, name: 'ホームページ活性化', item: `${siteUrl}/for/hp-activate` },
  ],
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question', name: '既存のホームページに影響はありませんか？',
      acceptedAnswer: { '@type': 'Answer', text: 'いいえ、Shadow DOM技術を使用しているため、既存サイトのデザインやCSSに一切影響を与えません。コード1行を追加するだけで、独立したウィジェットとして動作します。' },
    },
    {
      '@type': 'Question', name: 'WordPressやWixにも導入できますか？',
      acceptedAnswer: { '@type': 'Answer', text: 'はい、JavaScriptが動作する環境であれば、WordPress、Wix、Squarespace、Shopifyなど、あらゆるサイトビルダーに導入可能です。HTMLにscriptタグを1行追加するだけです。' },
    },
    {
      '@type': 'Question', name: 'AIチャットボットの回答精度は大丈夫ですか？',
      acceptedAnswer: { '@type': 'Answer', text: 'あなたが登録したFAQ・サービス情報・ナレッジをもとにAIが回答するため、ビジネスに特化した正確な回答が可能です。回答内容はいつでも修正・改善できます。' },
    },
  ],
};

const faqs = [
  { q: '既存のホームページに影響はありませんか？', a: 'いいえ、Shadow DOM技術を使用しているため、既存サイトのデザインやCSSに一切影響を与えません。コード1行を追加するだけで、独立したウィジェットとして動作します。' },
  { q: 'WordPressやWixにも導入できますか？', a: 'はい、JavaScriptが動作する環境であれば、WordPress、Wix、Squarespace、Shopifyなど、あらゆるサイトビルダーに導入可能です。HTMLにscriptタグを1行追加するだけです。' },
  { q: 'AIチャットボットの回答精度は大丈夫ですか？', a: 'あなたが登録したFAQ・サービス情報・ナレッジをもとにAIが回答するため、ビジネスに特化した正確な回答が可能です。回答内容はいつでも修正・改善できます。' },
  { q: '導入にどれくらい時間がかかりますか？', a: 'コンシェルジュは最短10分、ガイドメーカーは最短5分で作成完了。生成された埋め込みコードを既存サイトに貼り付ければ即日稼働します。' },
  { q: '月額費用はかかりますか？', a: 'コンシェルジュはフリープランで1日10メッセージまで無料。ガイドメーカーは基本機能を無料でご利用いただけます。本格運用にはStandard以上のプラン（月額1,980円〜）がおすすめです。' },
];

export default function HPActivatePageClient() {
  return (
    <HomeAuthProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ========== Hero ========== */}
      <section
        className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #f0fdf4 0%, #dcfce7 50%, #bbf7d0 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#059669 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.05 }} />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center gap-2 py-2 px-5 rounded-full bg-white/80 backdrop-blur text-sm font-bold mb-8 border border-emerald-200 shadow-sm text-emerald-600">
            <Zap size={16} />
            既存HPをお持ちの法人・事業者の方へ
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight mb-6" style={{ color: '#5d4037' }} data-speakable>
            HPをつくって終わり、<br />
            <span className="text-emerald-600">になっていませんか？</span>
          </h1>

          <p className="text-base md:text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed" data-speakable>
            せっかくのホームページに来た人が、<span className="font-bold text-emerald-600">何もせず帰っている</span>。<br className="hidden md:block" />
            それ、<span className="font-bold">コード1行</span>で変えられます。
          </p>

          <p className="text-sm text-gray-500 mb-10 max-w-xl mx-auto">
            AIコンシェルジュ（24時間チャット接客）とガイドメーカー（操作案内）を<br className="hidden md:block" />
            既存のHPに埋め込むだけ。<strong>新しくサイトを作り直す必要はありません。</strong>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <AuthCTAButton
              className="text-white text-lg font-bold py-4 px-10 rounded-full shadow-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl inline-flex items-center gap-2 bg-emerald-600"
            >
              <Sparkles size={20} />
              無料で導入してみる
            </AuthCTAButton>
            <a href="#how-it-works" className="text-emerald-600 text-lg font-bold py-4 px-10 rounded-full border-2 border-emerald-200 bg-white hover:-translate-y-1 transition-all inline-flex items-center gap-2">
              導入方法を見る
              <ArrowRight size={18} />
            </a>
          </div>

          <p className="text-xs text-gray-500">※ クレジットカード不要・既存サイトへの影響ゼロ</p>
        </div>
      </section>

      {/* ========== 問題提起 ========== */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-10" style={{ color: '#5d4037' }} data-speakable>
            こんな状態、放置していませんか？
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              'ホームページのアクセスはあるが、問い合わせにつながらない',
              'お客様が「何をすればいいか」分からず離脱している',
              'よくある質問に毎回同じ返答をしている（人件費のムダ）',
              '営業時間外のお問い合わせを取りこぼしている',
              'LPを作ったけど、コンバージョン率が低いまま放置',
              'サイトのリニューアルは高額すぎて手が出ない',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-red-50/50 border border-red-100">
                <span className="text-red-400 mt-0.5 flex-shrink-0">●</span>
                <span className="text-gray-700 text-sm font-medium leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <p className="text-lg font-bold" style={{ color: '#5d4037' }}>
              サイトを作り直す必要はありません。<br />
              <span className="text-emerald-600">「埋め込むだけ」で解決できます。</span>
            </p>
          </div>
        </div>
      </section>

      {/* ========== 2つのソリューション ========== */}
      <section className="py-20" style={{ backgroundColor: '#fffbf0' }}>
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-black mb-4" style={{ color: '#5d4037' }} data-speakable>
              既存HPを<span className="text-emerald-600">「動くサイト」</span>に変える2つのツール
            </h2>
            <p className="text-gray-600">どちらも既存サイトにコード1行を追加するだけ。サイトのデザインに影響しません。</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* コンシェルジュ */}
            <div className="bg-white rounded-3xl border-2 border-emerald-200 p-8 relative overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 bg-emerald-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                  <MessageCircle size={32} />
                </div>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold mb-4 border border-emerald-200">
                  24時間対応
                </div>
                <h3 className="text-2xl font-black mb-3" style={{ color: '#5d4037' }}>AIコンシェルジュ</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6" data-speakable>
                  あなたのビジネスに特化したAIチャットボットが、訪問者の質問に<strong>24時間365日</strong>自動で回答。
                  営業時間外でも、お客様を逃しません。
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    '「営業時間は？」「料金は？」に即答',
                    'FAQ・サービス情報を登録するだけで自動学習',
                    'デザイン・アバター・トーンをカスタマイズ',
                    '会話ログ＆満足度を分析ダッシュボードで確認',
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{text}</span>
                    </li>
                  ))}
                </ul>
                <a href="/concierge" className="inline-flex items-center gap-2 text-emerald-600 font-bold text-sm hover:underline">
                  コンシェルジュの詳細を見る <ArrowRight size={14} />
                </a>
              </div>
            </div>

            {/* ガイドメーカー */}
            <div className="bg-white rounded-3xl border-2 border-blue-200 p-8 relative overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 bg-blue-500" />
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                  <BookOpen size={32} />
                </div>
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold mb-4 border border-blue-200">
                  離脱防止
                </div>
                <h3 className="text-2xl font-black mb-3" style={{ color: '#5d4037' }}>ガイドメーカー</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6" data-speakable>
                  訪問者に「次に何をすればいいか」をステップ形式で案内。
                  <strong>迷わせない → 離脱しない → コンバージョンする</strong>流れを自動でつくります。
                </p>
                <ul className="space-y-3 mb-6">
                  {[
                    '「STEP1 → 2 → 3」の分かりやすいガイド表示',
                    'ページ読み込み時・スクロール時・ボタンクリック時に自動表示',
                    'アイコン・カラー・ステップ数を自由にカスタマイズ',
                    '「もう表示しない」機能で既存ユーザーには非表示',
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{text}</span>
                    </li>
                  ))}
                </ul>
                <a href="/onboarding" className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm hover:underline">
                  ガイドメーカーの詳細を見る <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== なぜ効果があるのか ========== */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-2xl md:text-3xl font-black mb-4" style={{ color: '#5d4037' }} data-speakable>
              なぜ「埋め込むだけ」で<span className="text-emerald-600">成果が変わる</span>のか
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: MousePointerClick,
                title: '離脱を接客に変える',
                description: '訪問者がページを閉じようとした瞬間にガイドが表示。「何をすればいいか」が分かれば、離脱が問い合わせに変わります。',
                color: '#10b981',
              },
              {
                icon: Clock,
                title: '24時間を稼働に変える',
                description: '深夜2時の問い合わせにもAIが即答。「営業時間外だから明日にしよう」→「もういいや」の機会損失をゼロに。',
                color: '#3b82f6',
              },
              {
                icon: BarChart3,
                title: 'データで改善し続ける',
                description: '「よく聞かれる質問」「離脱ポイント」が可視化。データに基づいてFAQやガイドを改善し、サイトの成果が上がり続けます。',
                color: '#8b5cf6',
              },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="text-center group">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition"
                    style={{ backgroundColor: `${item.color}15`, color: item.color }}
                  >
                    <Icon size={32} />
                  </div>
                  <h3 className="text-lg font-bold mb-3" style={{ color: '#5d4037' }}>{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed" data-speakable>{item.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== 導入方法 ========== */}
      <section id="how-it-works" className="py-20" style={{ backgroundColor: '#fffbf0' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold mb-4 bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Code size={16} />
              導入はたったの3ステップ
            </div>
            <h2 className="text-2xl md:text-3xl font-black mb-4" style={{ color: '#5d4037' }} data-speakable>
              既存HPへの導入方法
            </h2>
            <p className="text-gray-600">プログラミング知識は一切不要。最短10分で稼働開始。</p>
          </div>

          <div className="space-y-8">
            {[
              {
                number: 1,
                title: 'コンシェルジュ/ガイドを作成する',
                description: '集客メーカーにログインし、テンプレートを選んでFAQ・ガイド内容を入力。AIが回答パターンを自動生成するので、5〜10分で完成します。',
                color: '#10b981',
              },
              {
                number: 2,
                title: '埋め込みコードをコピーする',
                description: '作成完了後に表示される「埋め込みコード」をコピー。scriptタグ1行だけなので、コピー＆ペーストするだけです。',
                color: '#3b82f6',
              },
              {
                number: 3,
                title: '既存HPのHTMLに貼り付ける',
                description: 'WordPressならカスタムHTMLブロック、Wixならカスタムコード設定に貼り付け。保存した瞬間から、あなたのHPにAI接客とガイドが稼働します。',
                color: '#8b5cf6',
              },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-6 p-6 sm:p-8 rounded-3xl border border-gray-100 bg-white hover:shadow-lg transition-all duration-300">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 text-white text-xl font-black shadow-lg"
                  style={{ backgroundColor: step.color }}
                >
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#5d4037' }}>{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed" data-speakable>{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 埋め込みコード例 */}
          <div className="mt-12 bg-gray-900 rounded-2xl p-6 overflow-x-auto">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-gray-400 text-xs ml-2">埋め込みコード例</span>
            </div>
            <code className="text-green-400 text-sm font-mono whitespace-pre">
{`<!-- AIコンシェルジュ -->
<script src="https://makers.tokyo/embed/concierge/loader.js"
  data-id="your-id" async></script>

<!-- ガイドメーカー -->
<script src="https://makers.tokyo/embed/onboarding/loader.js"
  data-modal-id="your-id" async></script>`}
            </code>
          </div>
        </div>
      </section>

      {/* ========== 活用シーン ========== */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-14" style={{ color: '#5d4037' }}>
            こんなサイトに効果的
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: 'コーポレートサイト', description: '会社概要ページに訪問するが問い合わせに至らない → AIコンシェルジュが「何かお探しですか？」と声をかけ、適切なページに案内', icon: Users },
              { title: 'サービスLP', description: 'LPのコンバージョン率が低い → ガイドメーカーで「こんな方におすすめ」を表示し、自分ごと化を促進', icon: TrendingUp },
              { title: 'ECサイト', description: '商品ページで悩んで離脱 → 「あなたにぴったりの商品は？」をAIがチャットで提案', icon: Eye },
              { title: 'SaaS・Webサービス', description: '新規登録後の離脱が多い → ガイドメーカーで初期設定をステップ案内し、定着率を向上', icon: HelpCircle },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-all duration-300 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold mb-1" style={{ color: '#5d4037' }}>{item.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== ビフォーアフター ========== */}
      <section className="py-20" style={{ backgroundColor: '#fffbf0' }}>
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-10" style={{ color: '#5d4037' }}>
            導入前後の変化
          </h2>
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-lg">
            <div className="grid md:grid-cols-2">
              <div className="p-8 border-b md:border-b-0 md:border-r border-gray-100">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-bold mb-4">BEFORE</div>
                <p className="text-gray-600 leading-relaxed text-sm">
                  月間3,000PVのコーポレートサイト。アクセスはあるが問い合わせは月2〜3件。営業時間外の訪問者は何もできずに帰っている。サイトリニューアルの見積もりは200万円で予算が合わなかった。
                </p>
              </div>
              <div className="p-8 bg-emerald-50/30">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold mb-4">AFTER</div>
                <p className="text-gray-700 leading-relaxed text-sm font-medium" data-speakable>
                  AIコンシェルジュを導入したら、営業時間外の問い合わせが月15件に。ガイドメーカーでサービス紹介を自動表示したら、問い合わせフォームへの到達率が2.5倍に。導入費用はゼロ、月額1,980円で運用中。
                </p>
              </div>
            </div>
            <div className="px-8 py-4 border-t border-gray-100 text-center">
              <span className="text-xs text-gray-400">Web制作会社（従業員8名）の導入イメージ</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========== FAQ ========== */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-10" style={{ color: '#5d4037' }}>よくある質問</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-emerald-50 bg-white">
                <details className="group">
                  <summary data-speakable="question" className="flex justify-between items-center px-6 py-5 font-bold cursor-pointer select-none list-none" style={{ color: '#5d4037' }}>
                    <span>{faq.q}</span>
                    <span className="transition group-open:rotate-180 text-emerald-500">▼</span>
                  </summary>
                  <div data-speakable="answer" className="px-6 pb-5 text-sm text-gray-600 leading-relaxed border-t pt-4 border-emerald-50">{faq.a}</div>
                </details>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-20 relative overflow-hidden bg-emerald-600">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute top-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-64 h-64 bg-emerald-300 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-black mb-6 text-white leading-tight" data-speakable>
            サイトを作り直さなくても、<br />成果は変えられる。
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto leading-relaxed text-emerald-100">
            コード1行で、あなたのHPが24時間働く営業マンに。<br />
            まずは無料で、効果を実感してください。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
            <AuthCTAButton className="bg-white text-lg font-bold py-4 px-12 rounded-full shadow-2xl transition transform hover:-translate-y-1 inline-flex items-center gap-2 text-emerald-600">
              <Sparkles size={20} />無料で導入する
            </AuthCTAButton>
          </div>
          <p className="text-sm text-emerald-200">※ クレジットカード不要 / 既存サイトへの影響ゼロ / いつでも解除可能</p>
        </div>
      </section>

      {/* ========== 他のタイプ ========== */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <h3 className="text-xl font-bold text-center mb-8" style={{ color: '#5d4037' }}>
            他のビジネスタイプの方はこちら
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { label: 'これから起業する方', href: '/for/starter' },
              { label: 'フリーランス・SNS発信者', href: '/for/freelance' },
              { label: 'コーチ・コンサル・講師', href: '/for/coach' },
              { label: 'コンテンツ販売者', href: '/for/creator' },
              { label: '店舗・教室・サロン', href: '/for/shop' },
              { label: '法人・チーム', href: '/for/business' },
            ].map((type, i) => (
              <a
                key={i}
                href={type.href}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <span className="font-bold text-sm" style={{ color: '#5d4037' }}>{type.label}</span>
                <ChevronRight size={16} className="text-gray-300 group-hover:text-emerald-500 transition" />
              </a>
            ))}
          </div>
          <div className="text-center mt-8">
            <a href="/" className="text-sm font-bold hover:underline transition text-emerald-600">
              ← トップページに戻る
            </a>
          </div>
        </div>
      </section>
    </HomeAuthProvider>
  );
}
