'use client';

import Link from 'next/link';
import {
  ArrowLeft, CreditCard, Shield, Clock, Globe, CheckCircle,
  ChevronRight, Zap, HelpCircle, Building2, Wallet, ArrowRight,
  Smartphone, Mail, FileText, BadgeCheck,
} from 'lucide-react';

const STEPS = [
  {
    step: 1,
    title: 'Stripeアカウントを作成',
    icon: Mail,
    description: 'メールアドレスだけで無料で始められます',
    details: [
      '「Stripeアカウントを接続」ボタンをクリック',
      'メールアドレスを入力（Gmailなど普段お使いのものでOK）',
      'パスワードを設定',
    ],
    tip: 'Stripeアカウント作成は完全無料です。月額料金もかかりません。',
  },
  {
    step: 2,
    title: '本人確認情報を入力',
    icon: FileText,
    description: '氏名・住所・生年月日などを入力します',
    details: [
      '個人の方は「個人事業主」を選択でOK',
      '氏名・住所・生年月日を入力',
      '電話番号を入力（認証コードが届きます）',
    ],
    tip: '法人でなくても個人で登録できます。副業の方も問題ありません。',
  },
  {
    step: 3,
    title: '銀行口座を登録',
    icon: Building2,
    description: '売上の振込先を設定します',
    details: [
      'お持ちの銀行口座の情報を入力',
      '口座名義・口座番号・支店番号を入力',
      'ゆうちょ銀行・ネット銀行も利用可能',
    ],
    tip: '普段お使いの銀行口座でOKです。後から変更もできます。',
  },
  {
    step: 4,
    title: '集客メーカーと接続完了！',
    icon: BadgeCheck,
    description: '自動で接続され、すぐに決済を受け付けられます',
    details: [
      '入力が完了すると自動的に集客メーカーに戻ります',
      '「Stripe接続済み」と表示されればOK',
      'フォームに金額を設定して公開するだけ！',
    ],
    tip: '審査は通常1〜2営業日で完了します。審査中もテスト決済は可能です。',
  },
];

const FAQS = [
  {
    q: 'Stripeの利用料金はかかりますか？',
    a: 'アカウント作成・維持費は完全無料です。決済が発生した時のみ、1件あたり3.6%の手数料がStripeに引かれます。',
  },
  {
    q: '売上はいつ入金されますか？',
    a: 'Stripeの標準では、決済から4営業日後に登録した銀行口座に自動入金されます。',
  },
  {
    q: '個人でも登録できますか？',
    a: 'はい。個人事業主として登録できます。法人登記は不要です。副業の方も問題なく利用できます。',
  },
  {
    q: '手数料の合計はいくらですか？',
    a: 'Stripe手数料 3.6% + プラットフォーム手数料 5% = 合計 8.6% です。例えば1,000円の商品なら、914円があなたの売上になります。Proプランの方はプラットフォーム手数料が0%になり、Stripe手数料の3.6%のみです。',
  },
  {
    q: 'テスト決済はできますか？',
    a: 'Stripe接続後、テストモードで実際にお金を使わずに動作確認ができます。',
  },
  {
    q: 'セキュリティは大丈夫ですか？',
    a: 'Stripeは世界中の数百万の企業が利用する決済サービスです。PCI DSS Level 1（最高レベル）のセキュリティ認証を取得しています。お客様のカード情報は集客メーカーのサーバーには一切保存されません。',
  },
  {
    q: '後から解約できますか？',
    a: 'いつでもStripeアカウントの接続を解除できます。Stripeアカウント自体の削除もStripeダッシュボードから可能です。',
  },
];

export default function StripeConnectGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">ダッシュボード</span>
          </Link>
          <div className="flex items-center gap-2">
            <CreditCard className="text-blue-600" size={24} />
            <span className="font-bold text-gray-900">Stripe接続ガイド</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* ヒーロー */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Zap size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Stripeで決済を受け付けよう</h1>
              <p className="text-sm opacity-80">最短5分で設定完了</p>
            </div>
          </div>
          <p className="text-white/90 text-lg leading-relaxed">
            Stripeは世界中で使われている安全な決済サービスです。<br />
            アカウント作成は無料・簡単。あなたのフォームで<br className="hidden sm:block" />
            すぐにクレジットカード決済を受け付けられるようになります。
          </p>
        </div>

        {/* Stripeとは */}
        <section className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <HelpCircle className="text-blue-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Stripeとは？</h2>
          </div>
          <p className="text-gray-700 leading-relaxed mb-5">
            Stripe（ストライプ）は、Amazon・Google・Shopifyなど世界中の企業が採用している<strong>オンライン決済サービス</strong>です。
            日本でも多くの企業・個人事業主が利用しています。
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-bold text-gray-900 text-sm">安全・安心</p>
              <p className="text-xs text-gray-600 mt-1">最高レベルのセキュリティ<br />カード情報は完全保護</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <Wallet className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="font-bold text-gray-900 text-sm">無料で始められる</p>
              <p className="text-xs text-gray-600 mt-1">初期費用・月額費用ゼロ<br />決済時のみ手数料発生</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 text-center">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-bold text-gray-900 text-sm">最短5分で設定</p>
              <p className="text-xs text-gray-600 mt-1">メールアドレスと銀行口座<br />があれば今すぐ開始</p>
            </div>
          </div>
        </section>

        {/* 手数料の説明 */}
        <section className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <CreditCard className="text-amber-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">手数料について</h2>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 mb-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-700">Stripe 決済手数料</span>
                <span className="font-bold text-gray-900">3.6%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-700">プラットフォーム手数料</span>
                <span className="font-bold text-gray-900">5%</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex items-center justify-between">
                <span className="font-bold text-gray-900">合計</span>
                <span className="font-bold text-blue-600 text-lg">8.6%</span>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>例：1,000円の商品の場合</strong><br />
              Stripe手数料 36円 + プラットフォーム手数料 50円 = 手数料合計 86円<br />
              <strong>あなたの売上：914円</strong>
            </p>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 mt-3">
            <p className="text-sm text-amber-800">
              <strong>Proプランなら手数料がお得！</strong><br />
              プラットフォーム手数料が<strong>0%</strong>になり、Stripe手数料の<strong>3.6%のみ</strong>で利用できます。
            </p>
          </div>
        </section>

        {/* ステップ */}
        <section className="mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Globe className="text-green-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">接続の手順（4ステップ）</h2>
          </div>

          <div className="space-y-4">
            {STEPS.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">
                        {s.step}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-5 h-5 text-blue-600" />
                        <h3 className="text-lg font-bold text-gray-900">{s.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{s.description}</p>
                      <ul className="space-y-2 mb-3">
                        {s.details.map((d, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                            {d}
                          </li>
                        ))}
                      </ul>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <p className="text-xs text-amber-800">
                          <strong>ポイント：</strong>{s.tip}
                        </p>
                      </div>
                    </div>
                  </div>
                  {s.step < STEPS.length && (
                    <div className="flex justify-center mt-4">
                      <ArrowRight className="w-5 h-5 text-gray-300 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 必要なもの */}
        <section className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="text-indigo-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">用意するもの</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
              <Mail className="w-6 h-6 text-blue-500 shrink-0" />
              <div>
                <p className="font-bold text-sm text-gray-900">メールアドレス</p>
                <p className="text-xs text-gray-500">Gmail等でOK</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
              <Smartphone className="w-6 h-6 text-green-500 shrink-0" />
              <div>
                <p className="font-bold text-sm text-gray-900">電話番号</p>
                <p className="text-xs text-gray-500">本人確認用</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
              <Building2 className="w-6 h-6 text-purple-500 shrink-0" />
              <div>
                <p className="font-bold text-sm text-gray-900">銀行口座</p>
                <p className="text-xs text-gray-500">売上の振込先</p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-2xl shadow-lg border border-blue-100 p-6 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center">
              <HelpCircle className="text-rose-600" size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">よくある質問</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, i) => (
              <div key={i} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                <p className="font-bold text-gray-900 text-sm mb-1.5">Q. {faq.q}</p>
                <p className="text-sm text-gray-600 leading-relaxed">A. {faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-center text-white shadow-xl mb-8">
          <h2 className="text-xl font-bold mb-2">準備はできましたか？</h2>
          <p className="text-white/80 mb-6 text-sm">
            フォームメーカーの決済設定から「Stripeアカウントを接続」ボタンを押して始めましょう
          </p>
          <Link
            href="/dashboard?view=order-form"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all shadow-lg min-h-[44px]"
          >
            <CreditCard className="w-5 h-5" />
            フォームメーカーを開く
          </Link>
        </div>
      </main>
    </div>
  );
}
