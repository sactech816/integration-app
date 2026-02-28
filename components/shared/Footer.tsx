'use client';

import React from 'react';
import Link from 'next/link';
import { Magnet, Sparkles, Building2, UserCircle, TrendingUp, Lightbulb, Heart, Calendar, ClipboardList, Gamepad2, BookOpen, Monitor, CalendarCheck, PenTool, MousePointerClick, Crown, Image, Store } from 'lucide-react';
import { ServiceType } from '@/lib/types';

interface FooterProps {
  setPage?: (page: string) => void;
  onCreate?: (service?: ServiceType) => void;
  user?: { email?: string } | null;
  setShowAuth?: (show: boolean) => void;
}

const Footer: React.FC<FooterProps> = () => {
  const services = [
    { id: 'quiz' as ServiceType, label: '診断クイズメーカー', icon: Sparkles, href: '/quiz' },
    { id: 'profile' as ServiceType, label: 'プロフィールメーカー', icon: UserCircle, href: '/profile' },
    { id: 'business' as ServiceType, label: 'LPメーカー', icon: Building2, href: '/business' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* ブランド */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                <Magnet className="text-white" size={20} />
              </div>
              <span className="text-white font-bold text-xl">集客メーカー</span>
            </div>
            <p className="text-sm leading-relaxed opacity-80 mb-6">
              診断クイズ・プロフィールLP・ビジネスLPを
              AIの力で簡単に作成。SNS拡散・SEO対策で
              あなたのビジネスに顧客を引き寄せます。
            </p>
          </div>

          {/* サービス */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">サービス</h3>
            <ul className="space-y-3 text-sm">
              {services.map((service) => (
                <li key={service.id}>
                  <Link
                    href={service.href}
                    className="flex items-center gap-2 hover:text-white transition-colors group"
                  >
                    <service.icon size={16} className="opacity-60 group-hover:opacity-100 shrink-0" />
                    <span>{service.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/booking" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Calendar size={16} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  予約メーカー
                </Link>
              </li>
              <li>
                <Link href="/attendance" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <CalendarCheck size={16} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  出欠メーカー
                </Link>
              </li>
              <li>
                <Link href="/survey" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <ClipboardList size={16} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  アンケートメーカー
                </Link>
              </li>
              <li>
                <Link href="/salesletter" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <PenTool size={16} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  セールスライター
                </Link>
              </li>
            </ul>
          </div>

          {/* PROプラン専用 */}
          <div>
            <h3 className="text-purple-300 font-bold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
              <Crown size={14} className="text-purple-400" />
              PROプラン専用
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/onboarding" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <MousePointerClick size={16} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  はじめかたメーカー
                </Link>
              </li>
              <li>
                <Link href="/gamification" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Gamepad2 size={16} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  ゲーミフィケーション
                </Link>
              </li>
              <li>
                <Link href="/thumbnail" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Image size={16} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  サムネイルメーカー
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Store size={16} className="opacity-60 group-hover:opacity-100 shrink-0" />
                  スキルマーケット
                </Link>
              </li>
            </ul>
          </div>

          {/* メニュー */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">メニュー</h3>
            <ul className="space-y-3 text-sm">
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
                <Link href="/demos" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Monitor size={14} className="opacity-60 group-hover:opacity-100" />
                  デモ一覧
                </Link>
              </li>
              <li>
                <Link href="/tools" className="hover:text-white transition-colors">
                  ツール一覧
                </Link>
              </li>
              <li>
                <Link href="/sitemap-html" className="hover:text-white transition-colors">
                  サイトマップ
                </Link>
              </li>
              <li>
                <Link href="/howto" className="hover:text-white transition-colors">
                  使い方・機能一覧
                </Link>
              </li>
              <li>
                <Link href="/announcements" className="hover:text-white transition-colors">
                  お知らせ
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition-colors">
                  料金プラン
                </Link>
              </li>
            </ul>

            <h3 className="text-white font-bold mt-6 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
              <Monitor size={14} className="text-indigo-400" />
              デモページ
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/quiz/demo/kindle-author" className="hover:text-white transition-colors">
                  診断クイズデモ
                </Link>
              </li>
              <li>
                <Link href="/profile/demo/full-set" className="hover:text-white transition-colors">
                  プロフィールLPデモ
                </Link>
              </li>
              <li>
                <Link href="/business/demo/fullset" className="hover:text-white transition-colors">
                  ビジネスLPデモ
                </Link>
              </li>
              <li>
                <Link href="/survey/demo/customer-satisfaction" className="hover:text-white transition-colors">
                  アンケートデモ
                </Link>
              </li>
              <li>
                <Link href="/s/LOSXs" className="hover:text-white transition-colors">
                  セールスレターデモ
                </Link>
              </li>
            </ul>
          </div>

          {/* Kindle出版 & 集客ノウハウ */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={14} className="text-amber-400" />
              Kindle出版
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/kindle/lp" className="hover:text-white transition-colors">
                  Kindle出版LP
                </Link>
              </li>
              <li>
                <Link href="/kindle/agency" className="hover:text-white transition-colors">
                  代理店パートナー募集
                </Link>
              </li>
              <li>
                <Link href="/kindle/discovery" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Lightbulb size={14} className="text-yellow-500 opacity-60 group-hover:opacity-100" />
                  ネタ発掘診断
                </Link>
              </li>
            </ul>

            <h3 className="text-white font-bold mt-6 mb-3 text-sm uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={14} className="text-orange-400" />
              集客ノウハウ
            </h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/effective-use" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Lightbulb size={14} className="text-yellow-500 opacity-60 group-hover:opacity-100" />
                  効果的な活用法9選
                </Link>
              </li>
              <li>
                <Link href="/selling-content" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <TrendingUp size={14} className="text-green-500 opacity-60 group-hover:opacity-100" />
                  売れるコンテンツの作り方
                </Link>
              </li>
              <li>
                <Link href="/gamification/effective-use" className="flex items-center gap-2 hover:text-white transition-colors group">
                  <Gamepad2 size={14} className="text-purple-500 opacity-60 group-hover:opacity-100" />
                  ゲーミフィケーション活用法
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* サポート・規約 */}
        <div className="mt-10 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider">サポート・規約</h3>
            <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <li>
                <Link href="/donation" className="flex items-center gap-1.5 hover:text-white transition-colors group">
                  <Heart size={14} className="text-rose-500 opacity-80 group-hover:opacity-100" />
                  開発支援・サポート
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
            </ul>
          </div>
        </div>

        {/* コピーライト */}
        <div className="mt-12 pt-8 border-t border-gray-800 text-center">
          <p className="text-xs opacity-60">
            &copy; {new Date().getFullYear()} 集客メーカー by ケイショウ株式会社. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
