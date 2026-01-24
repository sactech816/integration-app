'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import PointDisplay from '@/components/gamification/PointDisplay';
import PageStampTracker from '@/components/gamification/PageStampTracker';
import {
  Stamp,
  Calendar,
  Gift,
  Zap,
  CreditCard,
  Sparkles,
  HelpCircle,
  ArrowRight,
  CheckCircle,
  Target,
  Users,
  TrendingUp,
  Repeat,
  Gamepad2,
  Trophy,
  Star,
  Coins,
  Play,
  BookOpen,
  Lightbulb,
  Share2,
  FileText,
  Eye,
} from 'lucide-react';

// 機能紹介データ
const FEATURES = [
  {
    id: 'stamp_rally',
    title: 'スタンプラリー',
    icon: Stamp,
    color: 'from-amber-500 to-orange-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-700',
    description: 'ページ閲覧やコンテンツ作成でスタンプを集める。コンプリート特典でリピート訪問を促進！',
    useCases: [
      { icon: Eye, text: '特定ページの閲覧でスタンプ獲得' },
      { icon: FileText, text: 'コンテンツ新規作成でスタンプ獲得' },
      { icon: Share2, text: 'SNSシェアでスタンプ獲得' },
      { icon: Trophy, text: 'コンプリートでボーナスポイント' },
    ],
    tips: 'サイト内の回遊を促進し、様々な機能を体験してもらうきっかけに。コンプリート特典を魅力的にすることで継続利用を促進できます。',
  },
  {
    id: 'login_bonus',
    title: 'ログインボーナス',
    icon: Calendar,
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-700',
    description: '毎日ログインでポイントGET！継続利用を習慣化させる最も効果的な方法。',
    useCases: [
      { icon: Calendar, text: '毎日ログインでポイント付与' },
      { icon: TrendingUp, text: '連続ログインでボーナス増加' },
      { icon: Repeat, text: '習慣化でリテンション向上' },
      { icon: Coins, text: 'ポイントでゲームを楽しめる' },
    ],
    tips: '毎日サイトを訪れる習慣を作ることで、ユーザーとの接点を増やせます。連続ログインボーナスを設定すると効果的です。',
  },
  {
    id: 'gacha',
    title: 'ガチャ / カプセルトイ',
    icon: Gift,
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-700',
    description: 'ポイントを使ってガチャを回す！ワクワク感で再訪問を促進。当たればポイント獲得！',
    useCases: [
      { icon: Gift, text: 'カプセル演出でワクワク体験' },
      { icon: Coins, text: '当たりでポイント報酬獲得' },
      { icon: Star, text: 'SSR/SR/Rなどレアリティ設定' },
      { icon: Target, text: 'ポイント消費先として活用' },
    ],
    tips: 'ポイントの使い道を提供することで、ポイントを貯める動機付けになります。当たりでポイントが増える仕様で、さらにワクワク感UP！',
  },
  {
    id: 'slot',
    title: 'スロット',
    icon: Zap,
    color: 'from-gray-700 to-red-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    textColor: 'text-gray-700',
    description: '絵柄を揃えて大当たり！カジノ気分でドキドキ体験。ジャックポットで大量ポイント！',
    useCases: [
      { icon: Zap, text: 'リール回転の臨場感' },
      { icon: Trophy, text: '7揃いでジャックポット' },
      { icon: Coins, text: '当たりでポイント報酬' },
      { icon: Sparkles, text: '派手な演出で盛り上がる' },
    ],
    tips: 'スロットは視覚的なインパクトが強く、SNSでシェアされやすいゲームです。大当たり時の演出を豪華にすると効果的。',
  },
  {
    id: 'scratch',
    title: 'スクラッチ',
    icon: CreditCard,
    color: 'from-amber-600 to-yellow-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    textColor: 'text-yellow-700',
    description: '銀色の部分を削って当たりを狙う！削る楽しさでワクワク体験。',
    useCases: [
      { icon: CreditCard, text: '指で削るインタラクション' },
      { icon: Sparkles, text: '当たり判明時の演出' },
      { icon: Coins, text: '当たりでポイント獲得' },
      { icon: Target, text: '手軽に楽しめる' },
    ],
    tips: 'スクラッチは操作が直感的で、誰でも楽しめます。削る過程自体が楽しいので、ユーザー体験として優れています。',
  },
  {
    id: 'fukubiki',
    title: '福引',
    icon: Sparkles,
    color: 'from-red-500 to-pink-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-700',
    description: 'ガラガラ回して玉が出る！お祭り気分で盛り上がる抽選体験。',
    useCases: [
      { icon: Sparkles, text: 'ガラガラ演出でお祭り感' },
      { icon: Gift, text: '玉の色で当たり判定' },
      { icon: Coins, text: '金玉で大量ポイント' },
      { icon: Users, text: 'イベント感を演出' },
    ],
    tips: '福引は日本人に馴染みのあるゲームで、親しみやすさがあります。季節イベントと組み合わせると効果的。',
  },
  {
    id: 'point_quiz',
    title: 'ポイントクイズ',
    icon: HelpCircle,
    color: 'from-indigo-500 to-purple-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    textColor: 'text-indigo-700',
    description: 'クイズに答えてポイントGET！楽しく学んでポイントも貯まる。',
    useCases: [
      { icon: HelpCircle, text: '正解でポイント獲得' },
      { icon: BookOpen, text: '知識テストとして活用' },
      { icon: Lightbulb, text: '商品・サービスの理解促進' },
      { icon: Target, text: '教育コンテンツとして' },
    ],
    tips: 'クイズは楽しみながら学べるので、商品知識やサービス理解の促進に最適。正解率に応じたポイント付与で挑戦意欲を刺激。',
  },
];

// 活用のコツ
const TIPS = [
  {
    icon: Target,
    title: 'ポイントの価値を明確に',
    description: 'ポイントで何ができるかを明確にすることで、貯める動機が生まれます。ガチャやスロットなど、ポイントの使い道を用意しましょう。',
  },
  {
    icon: Repeat,
    title: '毎日訪れる理由を作る',
    description: 'ログインボーナスやデイリーミッションで、毎日サイトを訪れる習慣を作りましょう。継続的な接点がエンゲージメントを高めます。',
  },
  {
    icon: Trophy,
    title: '達成感を演出する',
    description: 'スタンプラリーのコンプリートや、ガチャの当たり演出など、達成感を感じられる仕掛けを用意しましょう。',
  },
  {
    icon: Share2,
    title: 'シェアしたくなる体験を',
    description: '大当たり時の派手な演出や、珍しい結果は、SNSでシェアされやすくなります。バイラル効果で新規ユーザー獲得にも。',
  },
];

export default function EffectiveUseClient() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
      
      {/* スタンプトラッカー（ページ閲覧でスタンプ獲得） */}
      <PageStampTracker pageUrl="/gamification/effective-use" user={user} />

      <main className="container mx-auto px-4 py-12">
        {/* ヘッダーセクション */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Gamepad2 className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-medium">ゲーミフィケーション活用ガイド</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            ゲーミフィケーションの<br className="md:hidden" />
            <span className="text-yellow-400">効果的な利用方法</span>
          </h1>
          <p className="text-lg text-purple-200 max-w-2xl mx-auto mb-8">
            7つのゲーム機能を活用して、ユーザーエンゲージメントを最大化。
            <br className="hidden md:block" />
            リピート訪問を促進し、ファンを増やすための具体的なアイデアを紹介します。
          </p>

          {/* ポイント表示 */}
          <div className="flex justify-center mb-8">
            <PointDisplay size="lg" showTotal />
          </div>

          {/* CTAボタン */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/arcade"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-6 py-3 rounded-full font-bold hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Play className="w-5 h-5" />
              ゲームセンターで遊ぶ
            </Link>
            <Link
              href="/gamification/new"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-bold transition-all border border-white/20"
            >
              <Gamepad2 className="w-5 h-5" />
              ゲームを作成する
            </Link>
          </div>
        </div>

        {/* 機能紹介セクション */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            7つのゲーミフィケーション機能
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              const isExpanded = expandedFeature === feature.id;

              return (
                <div
                  key={feature.id}
                  className="bg-white/95 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl"
                >
                  {/* ヘッダー */}
                  <div className={`bg-gradient-to-r ${feature.color} p-4`}>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-white">{feature.title}</h3>
                    </div>
                  </div>

                  {/* コンテンツ */}
                  <div className="p-4">
                    <p className="text-gray-600 text-sm mb-4">{feature.description}</p>

                    {/* 活用例 */}
                    <div className="space-y-2 mb-4">
                      {feature.useCases.slice(0, isExpanded ? undefined : 2).map((useCase, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <useCase.icon className={`w-4 h-4 ${feature.textColor}`} />
                          <span className="text-gray-700">{useCase.text}</span>
                        </div>
                      ))}
                    </div>

                    {/* 展開/折りたたみ */}
                    <button
                      onClick={() => setExpandedFeature(isExpanded ? null : feature.id)}
                      className={`text-sm font-medium ${feature.textColor} hover:underline`}
                    >
                      {isExpanded ? '閉じる' : '詳しく見る'}
                    </button>

                    {/* 展開時のコンテンツ */}
                    {isExpanded && (
                      <div className={`mt-4 p-3 rounded-lg ${feature.bgColor} border ${feature.borderColor}`}>
                        <p className={`text-sm ${feature.textColor}`}>
                          <strong>活用のコツ:</strong> {feature.tips}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 活用のコツセクション */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            効果を最大化する4つのコツ
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {TIPS.map((tip, i) => {
              const Icon = tip.icon;
              return (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{tip.title}</h3>
                      <p className="text-purple-200 text-sm">{tip.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* メリットセクション */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm rounded-3xl p-8 max-w-4xl mx-auto border border-yellow-500/30">
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              ゲーミフィケーションで得られる効果
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="font-bold text-white mb-1">リテンション向上</h3>
                <p className="text-sm text-purple-200">毎日訪れる理由を作り、継続利用を促進</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
                  <Users className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="font-bold text-white mb-1">エンゲージメント</h3>
                <p className="text-sm text-purple-200">ゲーム要素で楽しみながらサービスを利用</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-3">
                  <Share2 className="w-8 h-8 text-yellow-400" />
                </div>
                <h3 className="font-bold text-white mb-1">バイラル効果</h3>
                <p className="text-sm text-purple-200">シェアしたくなる体験で新規ユーザー獲得</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTAセクション */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            さっそく始めてみましょう
          </h2>
          <p className="text-purple-200 mb-8 max-w-xl mx-auto">
            ゲームセンターで実際に遊んでみるか、自分でゲームを作成してみましょう。
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/arcade"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:from-yellow-300 hover:to-orange-400 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Gamepad2 className="w-6 h-6" />
              ゲームセンターで遊ぶ
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/gamification/new"
              className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-lg"
            >
              <Gift className="w-6 h-6" />
              ゲームを作成する
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
      {showAuth && <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} setUser={setUser} />}
    </div>
  );
}
