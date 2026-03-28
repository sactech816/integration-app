import { Metadata } from 'next';
import {
  Check,
  X,
  ArrowRight,
  Sparkles,
  Fingerprint,
  Star,
  CalendarCheck,
  ShoppingBag,
  BookOpen,
  Crown,
} from 'lucide-react';
import Link from 'next/link';
import LandingHeader from '@/components/shared/LandingHeader';

export const metadata: Metadata = {
  title: '無料でできること・プラン比較 | 集客メーカー',
  description: '集客メーカーの無料機能と有料プランの違いを分かりやすく解説。登録なしで使えるツール、フリープランの全機能、有料プランの詳細をご紹介。',
};

// ===== データ定義 =====

const GUEST_FEATURES = {
  title: 'ゲスト（登録なし）',
  subtitle: '今すぐ体験できます',
  color: 'amber',
  badge: '登録不要',
  sections: [
    {
      title: '診断を受ける',
      description: 'あなた自身のことを知る診断ツール',
      items: [
        { name: '性格診断（Big Five）', href: '/bigfive', icon: Fingerprint, note: '科学的な性格分析' },
        { name: '生年月日占い', href: '/fortune', icon: Star, note: '九星気学・数秘術・四柱推命' },
        { name: '才能マネタイズ診断', href: '/diagnosis/monetize', icon: Sparkles, note: '才能を活かした収益化' },
        { name: '補助金診断', href: '/subsidy', icon: ShoppingBag, note: '使える補助金をチェック' },
      ],
    },
    {
      title: 'デモを体験する',
      description: '実際のツールを体験できます',
      items: [
        { name: 'ネタ発掘デモ', href: '/kindle/discovery/demo', icon: BookOpen, note: 'コンテンツのテーマ発見' },
        { name: 'Kindle執筆デモ', href: '/kindle/demo', icon: BookOpen, note: 'AI執筆を体験' },
      ],
    },
    {
      title: '見る・参加する',
      description: '登録なしで使えます',
      items: [
        { name: '出欠メーカー', href: '/attendance', icon: CalendarCheck, note: 'イベント出欠に参加' },
        { name: 'スキルマーケット', href: '/marketplace', icon: ShoppingBag, note: 'スキルを閲覧' },
      ],
    },
  ],
  limitations: [
    'ページやコンテンツの作成（全ツール）',
    '作成したページの編集・更新',
    'AI機能（自動生成）',
    'リサーチツール',
    'アクセス解析',
    'アーケード（ゲーム）',
  ],
};

const FREE_FEATURES = {
  title: 'フリープラン（¥0）',
  subtitle: '無料登録で全ツールが使える',
  color: 'orange',
  badge: 'ずっと無料',
  additions: [
    { icon: Check, text: '全35ツールを各1個ずつ作成可能', highlight: true },
    { icon: Check, text: '作成したページの編集・更新' },
    { icon: Check, text: '診断クイズの作成（1個）' },
    { icon: Check, text: '予約メーカー（1個）' },
    { icon: Check, text: 'アンケート作成（1個）' },
    { icon: Check, text: 'セールスライター（1個）' },
    { icon: Check, text: 'SNS投稿メーカー（1個）' },
    { icon: Check, text: 'SEO（AEO）対策' },
    { icon: Check, text: 'ポータル掲載・URL発行' },
    { icon: Check, text: 'アフィリエイト機能' },
    { icon: Check, text: 'メルマガリスト作成（1件）' },
    { icon: Check, text: 'フォーム決済（手数料5%）' },
  ],
  limitations: [
    'AI機能（テキスト生成・画像生成）',
    '2個目以降の作成',
    'アクセス解析',
    'メルマガ送信',
    'ステップメール',
    'ファネル構築',
    'HTMLダウンロード',
    '埋め込みコード',
    'バナー（集客メーカー表示）の非表示',
  ],
};

const PAID_PLANS = [
  {
    name: 'Starter',
    price: '¥4,980',
    period: '/月',
    color: 'blue',
    badge: '個人・副業向け',
    popular: true,
    features: [
      { text: '全ツール各10個', highlight: true },
      { text: 'テキストAI 10回/日', highlight: true },
      { text: 'メルマガ送信 月100通', highlight: true },
      { text: 'アクセス解析' },
      { text: 'バナー非表示' },
      { text: 'HTMLダウンロード' },
      { text: '埋め込みコード' },
      { text: 'メルマガリスト 3件' },
    ],
  },
  {
    name: 'Growth',
    price: '¥14,800',
    period: '/月',
    color: 'purple',
    badge: '事業者向け',
    features: [
      { text: '全ツール無制限', highlight: true },
      { text: '全AI（テキスト50回+画像5回/日）', highlight: true },
      { text: 'メルマガ月500通 + ステップメール', highlight: true },
      { text: 'ファネル無制限' },
      { text: 'ゲーミフィケーション' },
      { text: 'コピーライト非表示' },
      { text: '決済手数料 0%' },
      { text: 'Googleカレンダー連携' },
    ],
  },
  {
    name: 'Partner',
    price: '¥29,800',
    period: '/月',
    color: 'amber',
    badge: '限定10名・伴走型',
    features: [
      { text: 'Growthの全機能', highlight: true },
      { text: 'AI上限拡大（200回+画像20回/日）', highlight: true },
      { text: '月2回の非同期レビュー', highlight: true },
      { text: 'チャットサポート（48h以内）' },
      { text: '集客戦略の提案' },
      { text: 'メルマガ月1,000通' },
      { text: '優先サポート' },
    ],
  },
];

// ===== コンポーネント =====

function FeatureItem({ available, text, highlight }: { available: boolean; text: string; highlight?: boolean }) {
  return (
    <div className="flex items-start gap-2.5 py-1.5">
      {available ? (
        <Check size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
      ) : (
        <X size={16} className="text-gray-300 mt-0.5 flex-shrink-0" />
      )}
      <span className={`text-sm ${available ? (highlight ? 'font-bold text-gray-900' : 'text-gray-700') : 'text-gray-400'}`}>
        {text}
      </span>
    </div>
  );
}

export default function StartPage() {
  return (
    <>
      <LandingHeader />
      <main className="min-h-screen bg-gradient-to-b from-orange-50/30 to-white">
        {/* Hero */}
        <section className="pt-28 pb-12 text-center px-4">
          <h1 className="text-3xl md:text-4xl font-black mb-4" style={{ color: '#5d4037' }}>
            集客メーカーで<span style={{ color: '#f97316' }}>できること</span>
          </h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            登録なしですぐ体験 → 無料登録で全ツール解放 → 有料プランで本格運用。<br />
            あなたのペースでステップアップできます。
          </p>
        </section>

        {/* ===== ステップ1: ゲスト ===== */}
        <section className="pb-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-black text-lg">1</div>
              <div>
                <h2 className="text-xl font-black" style={{ color: '#5d4037' }}>
                  {GUEST_FEATURES.title}
                </h2>
                <p className="text-sm text-gray-500">{GUEST_FEATURES.subtitle}</p>
              </div>
              <span className="ml-auto text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                {GUEST_FEATURES.badge}
              </span>
            </div>

            {GUEST_FEATURES.sections.map((section) => (
              <div key={section.title} className="mb-6">
                <h3 className="text-sm font-bold text-gray-500 mb-3">{section.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <a
                        key={item.name}
                        href={item.href}
                        className="group flex items-center gap-3 p-4 rounded-xl bg-white border border-gray-100 hover:border-amber-200 hover:shadow-md transition-all"
                      >
                        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                          <Icon size={20} />
                        </div>
                        <div>
                          <div className="font-bold text-sm text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.note}</div>
                        </div>
                        <ArrowRight size={14} className="ml-auto text-gray-300 group-hover:text-amber-500 transition-colors" />
                      </a>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* ゲストの制限 */}
            <div className="bg-gray-50 rounded-xl p-5 mt-4">
              <p className="text-sm font-bold text-gray-500 mb-2">ゲストではご利用いただけない機能:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {GUEST_FEATURES.limitations.map((text) => (
                  <FeatureItem key={text} available={false} text={text} />
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 mb-2">
                  無料登録すると、これらの機能が使えるようになります
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 矢印 */}
        <div className="flex justify-center pb-4">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center">
              <ArrowRight size={20} className="rotate-90" />
            </div>
            <span className="text-xs text-orange-500 font-bold mt-1">無料登録（30秒）</span>
          </div>
        </div>

        {/* ===== ステップ2: フリープラン ===== */}
        <section className="pb-16 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-black text-lg">2</div>
              <div>
                <h2 className="text-xl font-black" style={{ color: '#5d4037' }}>
                  {FREE_FEATURES.title}
                </h2>
                <p className="text-sm text-gray-500">{FREE_FEATURES.subtitle}</p>
              </div>
              <span className="ml-auto text-xs font-bold bg-orange-100 text-orange-700 px-3 py-1 rounded-full">
                {FREE_FEATURES.badge}
              </span>
            </div>

            <div className="bg-white rounded-2xl border border-orange-200 p-6 shadow-sm">
              <p className="text-sm font-bold text-orange-600 mb-4">ゲストの全機能に加えて:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {FREE_FEATURES.additions.map((item) => (
                  <FeatureItem key={item.text} available={true} text={item.text} highlight={item.highlight} />
                ))}
              </div>

              <div className="border-t border-gray-100 mt-5 pt-5">
                <p className="text-sm font-bold text-gray-500 mb-2">フリープランではご利用いただけない機能:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                  {FREE_FEATURES.limitations.map((text) => (
                    <FeatureItem key={text} available={false} text={text} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 矢印 */}
        <div className="flex justify-center pb-4">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center">
              <ArrowRight size={20} className="rotate-90" />
            </div>
            <span className="text-xs text-blue-500 font-bold mt-1">本格運用するなら</span>
          </div>
        </div>

        {/* ===== ステップ3: 有料プラン ===== */}
        <section className="pb-20 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-lg">3</div>
              <div>
                <h2 className="text-xl font-black" style={{ color: '#5d4037' }}>
                  有料プラン
                </h2>
                <p className="text-sm text-gray-500">成果が出たら、もっと使いこなす</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PAID_PLANS.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative bg-white rounded-2xl border-2 p-6 shadow-sm transition-all hover:shadow-lg ${
                    plan.popular ? 'border-blue-400' : 'border-gray-200'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                      おすすめ
                    </div>
                  )}
                  <div className="text-center mb-4">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      plan.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                      plan.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {plan.badge}
                    </span>
                    <h3 className="text-lg font-black mt-3" style={{ color: '#5d4037' }}>
                      {plan.name}
                    </h3>
                    <div className="mt-2">
                      <span className="text-3xl font-black" style={{ color: '#5d4037' }}>{plan.price}</span>
                      <span className="text-sm text-gray-500">{plan.period}</span>
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    {plan.features.map((f) => (
                      <FeatureItem key={f.text} available={true} text={f.text} highlight={f.highlight} />
                    ))}
                  </div>

                  <div className="mt-5">
                    <Link
                      href="/dashboard"
                      className={`block text-center py-3 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 ${
                        plan.popular
                          ? 'bg-blue-600 text-white shadow-lg hover:bg-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {plan.name === 'Partner' ? '伴走プランに申し込む' : `${plan.name}プランを始める`}
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* 構築代行 */}
            <div className="mt-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Crown size={18} className="text-amber-500" />
                    <h3 className="font-black text-gray-900">構築代行</h3>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">単発</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    診断クイズ・LP・ファネルの設計から構築までプロが代行します
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-2xl font-black text-gray-900">¥49,800<span className="text-sm font-normal text-gray-500">〜/回</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="pb-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-black mb-4" style={{ color: '#5d4037' }}>
              まずは無料で体験しませんか？
            </h2>
            <p className="text-gray-600 text-sm mb-8">
              登録なしで診断を受けて、あなた自身のことを知ってみませんか？<br />
              気に入ったら、無料登録で全35ツールが使えるようになります。
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/bigfive"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-purple-600 text-white font-bold shadow-lg hover:bg-purple-700 hover:-translate-y-0.5 transition-all"
              >
                <Fingerprint size={20} />
                性格診断を受けてみる
              </Link>
              <Link
                href="/fortune"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-white border-2 border-gray-200 text-gray-700 font-bold hover:border-blue-300 hover:-translate-y-0.5 transition-all"
              >
                <Star size={20} />
                生年月日占いを試す
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
