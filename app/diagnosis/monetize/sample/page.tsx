'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Sparkles, ArrowRight, ArrowLeft, BookOpen, GraduationCap, Briefcase,
  Share2, Package, Crown, Users, Lightbulb, DollarSign, ListOrdered,
  Zap, Footprints, Map, Calendar, Target, CheckCircle2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';

// サンプルデータ
const SAMPLE_ANALYSIS = {
  authorType: '実践型エキスパート',
  authorTypeDescription: '豊富な実務経験を活かし、実践的なノウハウを体系化して届けるタイプ',
  summary: 'あなたは「実践型エキスパート」タイプです。10年以上の営業経験と、人に分かりやすく伝える力が最大の武器。Kindle出版から始めて、講座→コンサルへとステップアップすることで、月収50万円以上のマネタイズが見えてきます。',
};

const SAMPLE_KINDLE = {
  theme: '【営業マン必読】初対面で信頼を勝ち取る「7秒トーク術」',
  targetReader: '営業成績に伸び悩む20〜30代の法人営業マン',
  reason: '10年の営業経験から生まれた独自メソッドは、実践者ならではの説得力があります',
  potentialRevenue: '月2〜5万円（印税）',
  chapterOutline: ['なぜ初対面の7秒が売上を決めるのか', '第一印象を操る5つの要素', '業種別・7秒トークテンプレート', '成功事例と失敗事例の分析', '明日から使える実践ワーク'],
  differentiator: '理論だけでなく「テンプレート」として即使える実践性',
  firstStep: '自分の過去の商談から「うまくいった初対面」を10件書き出し、共通点を分析する',
};

const SAMPLE_SYNERGY = [
  { from: 'Kindle出版', to: 'SNS発信', strategy: 'Kindle執筆の過程をSNSで発信し、発売前からファンを作る' },
  { from: 'SNS発信', to: 'オンライン講座', strategy: 'SNSで反響の大きかったテーマを講座のカリキュラムに反映' },
  { from: 'オンライン講座', to: 'コンサル・コーチング', strategy: '講座受講者の中から個別サポートを希望する人をコンサルへ誘導' },
  { from: 'コンサル・コーチング', to: 'デジタル商品', strategy: 'コンサルで使うワークシートをテンプレート化して販売' },
];

const SAMPLE_ACTION_PLAN = [
  { week: 'Week 1', action: 'Kindle本のテーマ決定＆目次の骨子を作成', field: 'Kindle出版' },
  { week: 'Week 2', action: 'Xで「#営業術」タグで毎日投稿を開始', field: 'SNS発信' },
  { week: 'Week 3', action: 'Kindle本の第1章〜第2章を執筆', field: 'Kindle出版' },
  { week: 'Week 4', action: 'Notionで営業テンプレートの整理を開始', field: 'デジタル商品' },
];

export default function SampleReportPage() {
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

      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">サンプルレポート</h1>
          <p className="text-violet-100">才能マネタイズ診断で受け取れるレポートのサンプルです</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 戻るリンク */}
        <Link href="/diagnosis/monetize/about" className="inline-flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> 診断の説明に戻る
        </Link>

        {/* 無料で見れる部分 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">無料</span>
            <h2 className="text-lg font-bold text-gray-900">基本分析</h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
            <div className="text-center">
              <div className="inline-block bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-6 py-2 rounded-full text-lg font-bold shadow-lg mb-2">
                {SAMPLE_ANALYSIS.authorType}
              </div>
              <p className="text-gray-600 text-sm">{SAMPLE_ANALYSIS.authorTypeDescription}</p>
            </div>
            <div className="bg-violet-50 rounded-xl p-4">
              <p className="text-sm text-violet-800 leading-relaxed">{SAMPLE_ANALYSIS.summary}</p>
            </div>
            <p className="text-xs text-gray-500 text-center">※ 実際のレポートにはBig5レーダーチャート・SWOT分析も含まれます</p>
          </div>
        </div>

        {/* 分野別レポートサンプル */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-violet-100 text-violet-700 text-xs font-bold rounded-full">分野別 ¥980</span>
            <h2 className="text-lg font-bold text-gray-900">Kindle出版レポート（サンプル）</h2>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-violet-600" />
              </div>
              <h4 className="text-base font-bold text-gray-900">{SAMPLE_KINDLE.theme}</h4>
            </div>
            <div className="space-y-3 pl-11">
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700"><span className="font-medium">ターゲット:</span> {SAMPLE_KINDLE.targetReader}</p>
              </div>
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-600">{SAMPLE_KINDLE.reason}</p>
              </div>
              <div className="flex items-start gap-2">
                <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 font-medium">{SAMPLE_KINDLE.potentialRevenue}</p>
              </div>
              <div className="flex items-start gap-2">
                <ListOrdered className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-1.5">章構成案:</p>
                  <div className="space-y-1">
                    {SAMPLE_KINDLE.chapterOutline.map((ch, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-violet-50 text-violet-600 text-xs font-bold rounded flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        <span className="text-sm text-gray-700">{ch}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700"><span className="font-medium">差別化:</span> {SAMPLE_KINDLE.differentiator}</p>
              </div>
              <div className="bg-violet-50 rounded-lg p-3 flex items-start gap-2">
                <Footprints className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-violet-800"><span className="font-semibold">最初の一歩:</span> {SAMPLE_KINDLE.firstStep}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">※ 実際のレポートでは5件の提案が含まれます</p>
          </div>
        </div>

        {/* 総括レポートサンプル */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-xs font-bold rounded-full">完全診断 ¥3,980 限定</span>
            <h2 className="text-lg font-bold text-gray-900">総括レポート（サンプル）</h2>
          </div>

          <div className="bg-gradient-to-br from-violet-50 via-white to-indigo-50 rounded-2xl border-2 border-violet-200 shadow-lg p-6 space-y-5">
            {/* 推奨順序 */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Map className="w-4 h-4 text-violet-600" />
                <h3 className="font-bold text-gray-900 text-sm">推奨実行順序</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {['SNS発信', 'Kindle出版', 'デジタル商品', 'オンライン講座', 'コンサル'].map((f, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <ArrowRight className="w-4 h-4 text-gray-400" />}
                    <span className="text-xs px-3 py-1.5 rounded-full border font-semibold bg-violet-100 text-violet-700 border-violet-200">
                      {i + 1}. {f}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* 分野間連携 */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Target className="w-4 h-4 text-violet-600" />
                <h3 className="font-bold text-gray-900 text-sm">分野間連携戦略</h3>
              </div>
              <div className="space-y-3">
                {SAMPLE_SYNERGY.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                      <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-violet-100 text-violet-700 border-violet-200">{item.from}</span>
                      <ArrowRight className="w-3 h-3 text-gray-400" />
                      <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-indigo-100 text-indigo-700 border-indigo-200">{item.to}</span>
                    </div>
                    <p className="text-sm text-gray-700">{item.strategy}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 30日プラン */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-violet-600" />
                <h3 className="font-bold text-gray-900 text-sm">30日アクションプラン</h3>
              </div>
              <div className="space-y-3">
                {SAMPLE_ACTION_PLAN.map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-16 bg-violet-100 text-violet-700 text-xs font-bold rounded-lg px-2 py-1.5 text-center flex-shrink-0">{step.week}</div>
                    <div>
                      <p className="text-sm text-gray-800">{step.action}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full border mt-1 inline-block bg-violet-50 text-violet-600 border-violet-200">{step.field}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">あなただけの収益化プランを受け取りましょう</p>
          <Link
            href="/diagnosis/monetize"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg hover:from-violet-700 hover:to-indigo-700 transition-all duration-200 text-lg"
          >
            <Sparkles className="w-5 h-5" />
            無料で診断する
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
