'use client';

import React from 'react';
import Link from 'next/link';
import {
  Magnet, Sparkles, Building2, UserCircle, TrendingUp, Lightbulb, Heart,
  Calendar, ClipboardList, Gamepad2, BookOpen, Monitor, CalendarCheck,
  PenTool, MousePointerClick, Image, Store, PartyPopper, Mail, GitBranch,
  Video, ClipboardCheck, Share2, Gift, Send, Globe, BarChart3, Search,
  ShoppingBag, Tv, ListOrdered, MessageCircle, Brain
} from 'lucide-react';
import { ServiceType } from '@/lib/types';

interface FooterProps {
  setPage?: (page: string) => void;
  onCreate?: (service?: ServiceType) => void;
  user?: { email?: string } | null;
  setShowAuth?: (show: boolean) => void;
}

const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ブランドセクション */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-12 pb-8 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Magnet className="text-white" size={24} />
            </div>
            <div>
              <span className="text-white font-black text-2xl block">集客メーカー</span>
              <span className="text-xs text-gray-500">makers.tokyo</span>
            </div>
          </div>
          <p className="text-sm leading-relaxed opacity-80 sm:ml-auto sm:max-w-md sm:text-right">
            診断クイズ・LP・セールスレター・ファネルなど30以上のツールをAIで簡単に作成。
            あなたのビジネスに顧客を引き寄せます。
          </p>
        </div>

        {/* ツールグリッド */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">

          {/* LP・ページ作成 */}
          <div>
            <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              LP・ページ作成
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/profile" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <UserCircle size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  プロフィール
                </Link>
              </li>
              <li>
                <Link href="/business" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Building2 size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  LPメーカー
                </Link>
              </li>
              <li>
                <Link href="/webinar/editor" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Video size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  ウェビナーLP
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <MousePointerClick size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  ガイドメーカー
                </Link>
              </li>
              <li>
                <Link href="/site/editor" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Globe size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  ホームページメーカー
                </Link>
              </li>
              <li>
                <Link href="/order-form/new" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <ClipboardCheck size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  フォームメーカー
                </Link>
              </li>
            </ul>
          </div>

          {/* 診断・クイズ + ライティング */}
          <div>
            <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              診断・クイズ
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/quiz" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Sparkles size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  診断クイズ
                </Link>
              </li>
              <li>
                <Link href="/entertainment/create" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <PartyPopper size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  エンタメ診断
                </Link>
              </li>
              <li>
                <Link href="/bigfive" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Brain size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  性格診断
                </Link>
              </li>
            </ul>

            <h3 className="text-white font-bold mt-6 mb-3 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              ライティング
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/salesletter" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <PenTool size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  セールスライター
                </Link>
              </li>
              <li>
                <Link href="/thumbnail" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Image size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  サムネイル
                </Link>
              </li>
              <li>
                <Link href="/sns-post" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Send size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  SNS投稿
                </Link>
              </li>
              <li>
                <Link href="/kindle/free-trial" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Gift size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  Kindle体験版
                </Link>
              </li>
            </ul>
          </div>

          {/* 集客・イベント */}
          <div>
            <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-500" />
              集客・イベント
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/booking" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Calendar size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  予約メーカー
                </Link>
              </li>
              <li>
                <Link href="/attendance" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <CalendarCheck size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  出欠メーカー
                </Link>
              </li>
              <li>
                <Link href="/survey" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <ClipboardList size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  アンケート
                </Link>
              </li>
              <li>
                <Link href="/newsletter/campaigns/new" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Mail size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  メルマガ
                </Link>
              </li>
              <li>
                <Link href="/step-email/sequences/new" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <ListOrdered size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  ステップメール
                </Link>
              </li>
              <li>
                <Link href="/funnel/new" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <GitBranch size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  ファネル
                </Link>
              </li>
              <li>
                <Link href="/dashboard?view=line" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <MessageCircle size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  LINE公式連携
                </Link>
              </li>
            </ul>
          </div>

          {/* リサーチ */}
          <div>
            <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              リサーチ
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/youtube-analysis/editor" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <BarChart3 size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  YouTube競合分析
                </Link>
              </li>
              <li>
                <Link href="/youtube-keyword-research/editor" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Search size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  YouTubeキーワード
                </Link>
              </li>
              <li>
                <Link href="/google-keyword-research/editor" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Search size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  Googleキーワード
                </Link>
              </li>
              <li>
                <Link href="/kindle-keywords/editor" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <BookOpen size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  Kindleキーワード
                </Link>
              </li>
              <li>
                <Link href="/rakuten-research/editor" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <ShoppingBag size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  楽天リサーチ
                </Link>
              </li>
              <li>
                <Link href="/niconico-keyword-research/editor" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Tv size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  ニコニコリサーチ
                </Link>
              </li>
              <li>
                <Link href="/reddit-keyword-research/editor" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Globe size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  Redditリサーチ
                </Link>
              </li>
            </ul>
          </div>

          {/* 収益化・販売 */}
          <div>
            <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              収益化・販売
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/gamification" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Gamepad2 size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  ゲーミフィケーション
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Store size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  スキルマーケット
                </Link>
              </li>
              <li>
                <Link href="/dashboard?view=affiliate" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Share2 size={14} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  アフィリエイト
                </Link>
              </li>
            </ul>

            <h3 className="text-white font-bold mt-6 mb-3 text-xs uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Kindle出版
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/kindle/lp" className="hover:text-white transition-colors">
                  Kindle出版LP
                </Link>
              </li>
              <li>
                <Link href="/kindle/agency" className="hover:text-white transition-colors">
                  代理店パートナー
                </Link>
              </li>
              <li>
                <Link href="/kindle/discovery" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Lightbulb size={14} className="text-yellow-500 opacity-60 group-hover:opacity-100" />
                  ネタ発掘診断
                </Link>
              </li>
            </ul>
          </div>

          {/* メニュー・ガイド */}
          <div>
            <h3 className="text-white font-bold mb-4 text-xs uppercase tracking-wider">メニュー</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  マイページ
                </Link>
              </li>
              <li>
                <Link href="/portal" className="hover:text-white transition-colors">
                  作品集（ポータル）
                </Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-white transition-colors">
                  ツール一覧
                </Link>
              </li>
              <li>
                <Link href="/demos" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Monitor size={14} className="opacity-60 group-hover:opacity-100" />
                  デモ一覧
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  料金プラン
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="hover:text-white transition-colors">
                  お知らせ
                </Link>
              </li>
            </ul>

            <h3 className="text-white font-bold mt-6 mb-3 text-xs uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={12} className="text-orange-400" />
              集客ノウハウ
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/howto" className="hover:text-white transition-colors">
                  使い方・機能一覧
                </Link>
              </li>
              <li>
                <Link href="/effective-use" className="hover:text-white transition-colors">
                  効果的な活用法9選
                </Link>
              </li>
              <li>
                <Link href="/selling-content" className="hover:text-white transition-colors">
                  売れるコンテンツの作り方
                </Link>
              </li>
              <li>
                <Link href="/gamification/effective-use" className="hover:text-white transition-colors">
                  ゲーミフィケーション活用法
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* サポート・規約 */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <li>
                <Link href="/donation" className="flex items-center gap-1.5 hover:text-white transition-colors group">
                  <Heart size={14} className="text-rose-500 opacity-80 group-hover:opacity-100" />
                  開発支援
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  よくある質問
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  お問い合わせ
                </Link>
              </li>
              <li>
                <Link href="/legal" className="hover:text-white transition-colors">
                  特定商取引法に基づく表記
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/sitemap-html" className="hover:text-white transition-colors">
                  サイトマップ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* コピーライト */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center">
          <p className="text-xs opacity-60">
            &copy; {new Date().getFullYear()} 集客メーカー. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
