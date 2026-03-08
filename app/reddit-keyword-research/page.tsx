import type { Metadata } from 'next';
import LandingHeader from '@/components/shared/LandingHeader';
import { Search, BarChart3, TrendingUp, Download, Filter, Globe } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Redditキーワードリサーチ | 集客メーカー',
  description: 'Redditのキーワード検索で人気投稿のスコア・コメント数・エンゲージメントを一括分析。海外マーケティング戦略に最適な無料ツール。',
};

export default function RedditKeywordResearchLanding() {
  const features = [
    { icon: Search, title: 'キーワード検索', desc: 'Redditの検索結果を一括取得し、人気投稿のスコアやコメント数を比較分析' },
    { icon: BarChart3, title: '指標比較チャート', desc: 'スコア・コメント数・upvote率をビジュアルチャートで直感的に比較' },
    { icon: Globe, title: 'サブレディット分析', desc: '投稿元のサブレディットを分析し、最適な投稿先を特定' },
    { icon: Filter, title: '高度なフィルター', desc: '期間・スコア・サブレディットでフィルタリング。ターゲット市場の分析に最適' },
    { icon: TrendingUp, title: 'エンゲージメント分析', desc: 'スコア/時間やコメント比率で、急上昇中のトレンドを発見' },
    { icon: Download, title: 'CSV出力', desc: '分析結果をCSVでエクスポート。Excel・スプレッドシートで詳細分析' },
  ];

  const steps = [
    { num: '1', title: 'キーワードを入力', desc: '調べたいテーマのキーワードを英語または日本語で入力します' },
    { num: '2', title: '検索結果を分析', desc: '人気投稿のスコア・コメント数・エンゲージメントがグラフ付きで表示されます' },
    { num: '3', title: 'フィルター・エクスポート', desc: '条件でフィルタリングし、CSVで出力して詳細な分析に活用できます' },
  ];

  return (
    <>
      <LandingHeader />
      <main className="min-h-screen bg-white">
        <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-red-50 pt-24 pb-16">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              <Globe className="w-4 h-4" />
              海外マーケティング分析
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 leading-tight">
              Redditキーワードリサーチ
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Redditのキーワード検索で人気投稿のスコア・コメント数を一括分析。<br className="hidden sm:block" />
              海外マーケティング戦略やトレンドリサーチに最適なツールです。
            </p>
            <a
              href="/reddit-keyword-research/editor"
              className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg min-h-[52px]"
            >
              <Search className="w-5 h-5" />
              無料で使ってみる
            </a>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-black text-gray-900 text-center mb-12">主な機能</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
                    <f.icon className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-black text-gray-900 text-center mb-12">使い方 3ステップ</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {steps.map((s, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 bg-orange-600 text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4 shadow-lg">
                    {s.num}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-br from-orange-600 to-red-600">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-black text-white mb-4">今すぐ海外トレンドを分析しよう</h2>
            <p className="text-orange-100 mb-8 text-lg">無料でRedditキーワードリサーチを体験できます</p>
            <a
              href="/reddit-keyword-research/editor"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all text-lg min-h-[52px]"
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
