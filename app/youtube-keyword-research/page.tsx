import type { Metadata } from 'next';
import LandingHeader from '@/components/shared/LandingHeader';
import { Search, BarChart3, TrendingUp, Download, Filter, Users } from 'lucide-react';

export const metadata: Metadata = {
  title: 'YouTubeキーワードリサーチ | 集客メーカー',
  description: 'YouTubeキーワード検索で上位動画の再生数・登録者数・再生倍率を一括分析。競合調査やコンテンツ戦略に役立つ無料ツール。',
};

export default function YouTubeKeywordResearchLanding() {
  const features = [
    { icon: Search, title: 'キーワード検索', desc: 'YouTubeの検索結果を一括取得し、上位動画の指標を比較分析できます' },
    { icon: BarChart3, title: '指標比較チャート', desc: '再生数・登録者数・再生倍率をビジュアルチャートで直感的に比較' },
    { icon: TrendingUp, title: '再生倍率分析', desc: '登録者数に対する再生倍率で、バズっている動画を即座に発見' },
    { icon: Filter, title: '高度なフィルター', desc: '公開日・再生倍率・登録者数でフィルタリング。競合分析に最適' },
    { icon: Users, title: 'チャンネル分析', desc: 'チャンネル登録者数も自動取得。大手を除外して同規模の競合を分析' },
    { icon: Download, title: 'CSV出力', desc: '分析結果をCSVでエクスポート。Excel・スプレッドシートで詳細分析' },
  ];

  const steps = [
    { num: '1', title: 'キーワードを入力', desc: '調べたいテーマやジャンルのキーワードを入力します' },
    { num: '2', title: '検索結果を分析', desc: '上位動画の再生数・登録者数・再生倍率がグラフ付きで表示されます' },
    { num: '3', title: 'フィルター・エクスポート', desc: '条件でフィルタリングし、CSVで出力して詳細な分析に活用できます' },
  ];

  return (
    <>
      <LandingHeader />
      <main className="min-h-screen bg-white">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-red-50 pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              <TrendingUp className="w-4 h-4" />
              YouTube競合分析
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
              YouTubeキーワードリサーチ
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              キーワード検索で上位動画の再生数・登録者数・再生倍率を一括分析。<br className="hidden sm:block" />
              競合調査やコンテンツ戦略の策定に最適なツールです。
            </p>
            <a
              href="/youtube-keyword-research/editor"
              className="inline-flex items-center gap-2 px-8 py-4 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg min-h-[52px]"
            >
              <Search className="w-5 h-5" />
              無料で使ってみる
            </a>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-black text-gray-900 text-center mb-12">主な機能</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-rose-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-black text-gray-900 text-center mb-12">使い方 3ステップ</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 bg-rose-500 text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4 shadow-lg">
                    {s.num}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-br from-rose-500 to-red-600">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-black text-white mb-4">今すぐ競合分析を始めよう</h2>
            <p className="text-rose-100 mb-8 text-lg">無料でYouTubeキーワードリサーチを体験できます</p>
            <a
              href="/youtube-keyword-research/editor"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-rose-600 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg min-h-[52px]"
            >
              <Search className="w-5 h-5" />
              無料で始める
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
