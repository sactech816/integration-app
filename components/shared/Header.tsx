'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  User,
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  HelpCircle,
  FileText,
  Mail,
  Shield,
  Scale,
  PlusCircle,
  Bell,
  Building2,
  UserCircle,
  ChevronDown,
  Home,
  Magnet,
  TrendingUp,
  Lightbulb,
  Heart,
  LayoutGrid,
  BookOpen,
  ClipboardList,
  Gamepad2,
  Calendar,
  Monitor,
  CalendarCheck,
  PenTool,
  Crown,
  Store,
  MousePointerClick
} from 'lucide-react';
import { ServiceType } from '@/lib/types';

interface HeaderProps {
  setPage?: (page: string) => void;
  user: { email?: string } | null;
  onLogout: () => void;
  setShowAuth: (show: boolean) => void;
  currentService?: ServiceType;
  headerClassName?: string;
}

const Header: React.FC<HeaderProps> = ({
  setPage,
  user,
  onLogout,
  setShowAuth,
  currentService,
  headerClassName
}) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false);
  const [isGuideMenuOpen, setIsGuideMenuOpen] = useState(false);
  const [isKindleMenuOpen, setIsKindleMenuOpen] = useState(false);

  // ESCキーでメニューを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsServiceMenuOpen(false);
        setIsGuideMenuOpen(false);
        setIsKindleMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // メニューを全て閉じるヘルパー
  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsServiceMenuOpen(false);
    setIsGuideMenuOpen(false);
    setIsKindleMenuOpen(false);
  };

  // サービスエディタリンクのクリックハンドラ（同一パス時は新規作成として扱う）
  const handleServiceClick = (e: React.MouseEvent, serviceId: string) => {
    closeMenus();
    const targetPath = `/${serviceId}/editor`;
    if (typeof window !== 'undefined' && window.location.pathname === targetPath) {
      e.preventDefault();
      router.push(`${targetPath}?new=${Date.now()}`);
    }
  };

  const handleLogout = () => {
    onLogout();
    setIsMenuOpen(false);
  };

  const services = [
    { id: 'quiz' as ServiceType, label: '診断クイズメーカー', icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'profile' as ServiceType, label: 'プロフィールメーカー', icon: UserCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'business' as ServiceType, label: 'LPメーカー', icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  // アンケート専用（ServiceTypeに含まれない）
  const surveyService = { id: 'survey', label: 'アンケートメーカー', icon: ClipboardList, color: 'text-teal-600', bg: 'bg-teal-50' };

  // ゲーミフィケーション
  const gamificationService = { id: 'gamification', label: 'ゲーミフィケーション', icon: Gamepad2, color: 'text-purple-600', bg: 'bg-purple-50' };

  // 出欠表メーカー
  const attendanceService = { id: 'attendance', label: '出欠メーカー', icon: CalendarCheck, color: 'text-cyan-600', bg: 'bg-cyan-50' };

  // セールスライター
  const salesletterService = { id: 'salesletter', label: 'セールスライター', icon: PenTool, color: 'text-rose-600', bg: 'bg-rose-50' };

  // はじめかたガイド
  const onboardingService = { id: 'onboarding', label: 'はじめかたメーカー', icon: MousePointerClick, color: 'text-sky-600', bg: 'bg-sky-50' };

  return (
    <>
    <header className={`${headerClassName || 'bg-white/80'} backdrop-blur-md border-b border-gray-100 sticky top-0 z-[100]`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        {/* 左側: ロゴ */}
        <Link
          href="/"
          className="font-bold text-xl flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
            <Magnet className="text-white" size={18} />
          </div>
          <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent group-hover:from-red-600 group-hover:to-pink-600 transition-all font-black text-base sm:text-xl">
            集客メーカー
          </span>
        </Link>

        {/* 中央のスペーサー */}
        <div className="flex-1" />

        {/* 右側: ナビゲーション + アクション */}
        <div className="flex items-center gap-3">
          {/* PC版ナビゲーション */}
          <nav className="hidden lg:flex items-center gap-1 mr-4">

            {/* ===== 新規作成メガメニュー ===== */}
            <div
              className="relative"
              onMouseEnter={() => setIsServiceMenuOpen(true)}
              onMouseLeave={() => setIsServiceMenuOpen(false)}
            >
              <button
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg px-3 py-2 transition-all"
              >
                <PlusCircle size={16} />
                <span>新規作成</span>
                <ChevronDown size={14} className={`transition-transform ${isServiceMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isServiceMenuOpen && (
                <>
                  <div className="absolute top-full left-0 w-full h-2" />
                  <div className="absolute top-full -left-20 pt-2 w-[780px] z-[120]">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-5 animate-fade-in">
                      <div className="grid grid-cols-3 gap-8">
                        {/* コンテンツ作成ツール */}
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">コンテンツ作成</p>
                          <div className="space-y-1">
                            {services.map((service) => (
                              <Link
                                key={service.id}
                                href={`/${service.id}/editor`}
                                onClick={(e) => handleServiceClick(e, service.id)}
                                className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                              >
                                <div className={`p-1.5 rounded-lg ${service.bg} shrink-0`}>
                                  <service.icon size={16} className={service.color} />
                                </div>
                                <span className="font-medium text-gray-900 text-sm whitespace-nowrap">{service.label}</span>
                              </Link>
                            ))}
                            <Link
                              href="/salesletter/editor"
                              onClick={closeMenus}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className={`p-1.5 rounded-lg ${salesletterService.bg} shrink-0`}>
                                <salesletterService.icon size={16} className={salesletterService.color} />
                              </div>
                              <span className="font-medium text-gray-900 text-sm whitespace-nowrap">{salesletterService.label}</span>
                            </Link>
                            <Link
                              href="/onboarding/editor"
                              onClick={(e) => handleServiceClick(e, 'onboarding')}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className={`p-1.5 rounded-lg ${onboardingService.bg} shrink-0`}>
                                <onboardingService.icon size={16} className={onboardingService.color} />
                              </div>
                              <span className="font-medium text-gray-900 text-sm whitespace-nowrap">{onboardingService.label}</span>
                            </Link>
                          </div>
                        </div>

                        {/* 集客・イベントツール */}
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">集客・イベント</p>
                          <div className="space-y-1">
                            <Link
                              href="/booking/new"
                              onClick={closeMenus}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="p-1.5 rounded-lg bg-blue-50 shrink-0">
                                <Calendar size={16} className="text-blue-600" />
                              </div>
                              <span className="font-medium text-gray-900 text-sm whitespace-nowrap">予約メーカー</span>
                            </Link>
                            <Link
                              href="/attendance/new"
                              onClick={closeMenus}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className={`p-1.5 rounded-lg ${attendanceService.bg} shrink-0`}>
                                <attendanceService.icon size={16} className={attendanceService.color} />
                              </div>
                              <span className="font-medium text-gray-900 text-sm whitespace-nowrap">{attendanceService.label}</span>
                            </Link>
                            <Link
                              href="/survey/new"
                              onClick={closeMenus}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className={`p-1.5 rounded-lg ${surveyService.bg} shrink-0`}>
                                <surveyService.icon size={16} className={surveyService.color} />
                              </div>
                              <span className="font-medium text-gray-900 text-sm whitespace-nowrap">{surveyService.label}</span>
                            </Link>
                            <Link
                              href="/gamification/new"
                              onClick={closeMenus}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className={`p-1.5 rounded-lg ${gamificationService.bg} shrink-0`}>
                                <gamificationService.icon size={16} className={gamificationService.color} />
                              </div>
                              <span className="font-medium text-gray-900 text-sm whitespace-nowrap">{gamificationService.label}</span>
                            </Link>
                          </div>
                        </div>

                        {/* デモ・作品・料金 */}
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">デモ・作品</p>
                          <div className="space-y-1">
                            <Link
                              href="/portal"
                              onClick={closeMenus}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="p-1.5 rounded-lg bg-purple-50 shrink-0">
                                <LayoutGrid size={16} className="text-purple-600" />
                              </div>
                              <span className="font-medium text-gray-900 text-sm whitespace-nowrap">作品集（ポータル）</span>
                            </Link>
                            <Link
                              href="/demos"
                              onClick={closeMenus}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="p-1.5 rounded-lg bg-indigo-50 shrink-0">
                                <Monitor size={16} className="text-indigo-600" />
                              </div>
                              <span className="font-medium text-gray-900 text-sm whitespace-nowrap">デモ一覧</span>
                            </Link>
                            <Link
                              href="/tools"
                              onClick={closeMenus}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                              <div className="p-1.5 rounded-lg bg-gray-100 shrink-0">
                                <LayoutGrid size={16} className="text-gray-600" />
                              </div>
                              <span className="font-medium text-gray-900 text-sm whitespace-nowrap">ツール一覧</span>
                            </Link>
                          </div>
                          <div className="border-t border-gray-100 mt-3 pt-3">
                            <Link
                              href="/pricing"
                              onClick={closeMenus}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                            >
                              <div className="p-1.5 rounded-lg bg-purple-50 shrink-0">
                                <Crown size={16} className="text-purple-600" />
                              </div>
                              <span className="font-medium text-purple-700 text-sm whitespace-nowrap">料金プラン</span>
                            </Link>
                          </div>
                        </div>
                      </div>

                      {!user && (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              <Sparkles size={12} className="text-orange-500" />
                              ログインすると便利な機能が使えます
                            </p>
                            <button
                              onClick={() => {
                                setShowAuth(true);
                                setIsServiceMenuOpen(false);
                              }}
                              className="bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm"
                            >
                              ログイン / 新規登録
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ===== 活用ガイドドロップダウン（お知らせ・開発支援を統合） ===== */}
            <div
              className="relative"
              onMouseEnter={() => setIsGuideMenuOpen(true)}
              onMouseLeave={() => setIsGuideMenuOpen(false)}
            >
              <button
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-green-600 hover:bg-green-50 rounded-lg px-3 py-2 transition-all"
              >
                <Lightbulb size={16} />
                <span>活用ガイド</span>
                <ChevronDown size={14} className={`transition-transform ${isGuideMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isGuideMenuOpen && (
                <>
                  <div className="absolute top-full left-0 w-full h-2" />
                  <div className="absolute top-full left-0 pt-2 w-72 z-[120]">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                      <Link
                        href="/announcements"
                        onClick={closeMenus}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-orange-50">
                          <Bell size={18} className="text-orange-500" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">お知らせ</div>
                          <div className="text-xs text-gray-500">最新のお知らせを確認</div>
                        </div>
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      <Link
                        href="/howto"
                        onClick={closeMenus}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-blue-50">
                          <FileText size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">使い方・機能一覧</div>
                          <div className="text-xs text-gray-500">基本操作をわかりやすく解説</div>
                        </div>
                      </Link>
                      <Link
                        href="/effective-use"
                        onClick={closeMenus}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-orange-50">
                          <Lightbulb size={18} className="text-orange-500" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">効果的な活用法9選</div>
                          <div className="text-xs text-gray-500">集客効果を最大化するヒント</div>
                        </div>
                      </Link>
                      <Link
                        href="/selling-content"
                        onClick={closeMenus}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-green-50">
                          <TrendingUp size={18} className="text-green-500" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">売れるコンテンツの作り方</div>
                          <div className="text-xs text-gray-500">心理トリガーを押さえた鉄板ロジック</div>
                        </div>
                      </Link>
                      <Link
                        href="/gamification/effective-use"
                        onClick={closeMenus}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-purple-50">
                          <Gamepad2 size={18} className="text-purple-500" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">ゲーミフィケーション活用法</div>
                          <div className="text-xs text-gray-500">エンゲージメントを高める</div>
                        </div>
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      <Link
                        href="/marketplace"
                        onClick={closeMenus}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-indigo-50">
                          <Store size={18} className="text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">スキルマーケット</div>
                          <div className="text-xs text-gray-500">プロに依頼・スキルを出品</div>
                        </div>
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      <Link
                        href="/faq"
                        onClick={closeMenus}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                      >
                        <HelpCircle size={18} className="text-gray-400 ml-2" />
                        <span className="text-sm text-gray-600">よくある質問</span>
                      </Link>
                      <Link
                        href="/contact"
                        onClick={closeMenus}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                      >
                        <Mail size={18} className="text-gray-400 ml-2" />
                        <span className="text-sm text-gray-600">お問い合わせ</span>
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      <Link
                        href="/donation"
                        onClick={closeMenus}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                      >
                        <Heart size={18} className="text-rose-400 ml-2" />
                        <span className="text-sm text-rose-600 font-medium">開発支援・サポート</span>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ===== Kindle出版ドロップダウン ===== */}
            <div
              className="relative"
              onMouseEnter={() => setIsKindleMenuOpen(true)}
              onMouseLeave={() => setIsKindleMenuOpen(false)}
            >
              <button
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg px-3 py-2 transition-all"
              >
                <BookOpen size={16} />
                <span>Kindle出版</span>
                <ChevronDown size={14} className={`transition-transform ${isKindleMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isKindleMenuOpen && (
                <>
                  <div className="absolute top-full left-0 w-full h-2" />
                  <div className="absolute top-full left-0 pt-2 w-64 z-[120]">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                      <Link
                        href="/kindle/lp"
                        onClick={closeMenus}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-amber-50">
                          <BookOpen size={18} className="text-amber-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">Kindle出版とは</div>
                          <div className="text-xs text-gray-500">AIでKindle本を執筆</div>
                        </div>
                      </Link>
                      <Link
                        href="/kindle/agency"
                        onClick={closeMenus}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-blue-50">
                          <Building2 size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">代理店パートナー募集</div>
                          <div className="text-xs text-gray-500">ビジネスパートナーを募集中</div>
                        </div>
                      </Link>
                      <Link
                        href="/kindle/discovery"
                        onClick={closeMenus}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-yellow-50">
                          <Lightbulb size={18} className="text-yellow-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">ネタ発掘診断</div>
                          <div className="text-xs text-gray-500">AIがあなたの本のテーマを提案</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

          </nav>

          {/* ===== PC版ユーザーアクション（3つの小さなアイコンボタン） ===== */}
          <div className="hidden lg:flex items-center gap-1">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors"
                  title="集客メーカー マイページ"
                >
                  <Magnet size={17} />
                </Link>
                <Link
                  href="/kindle"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                  title="Kindle出版 マイページ"
                >
                  <BookOpen size={17} />
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="ログアウト"
                >
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-full font-semibold hover:bg-gray-800 transition-colors"
              >
                <User size={18} />
                <span>ログイン</span>
              </button>
            )}
          </div>

          {/* ハンバーガーメニュー - 全デバイスで表示 */}
          <button
            className="p-2 text-gray-700 hover:text-orange-600 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

    </header>

      {/* ハンバーガーメニュー - headerの外に配置してスタッキングコンテキストの問題を回避 */}
      {isMenuOpen && (
        <>
          {/* オーバーレイ：クリックでメニューを閉じる */}
          <div
            className="fixed inset-0 top-16 bg-black/20 backdrop-blur-sm z-[190]"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* メニューコンテンツ - 2段構成 */}
          <div className="fixed inset-0 top-16 left-0 right-0 bottom-0 bg-white z-[200] overflow-y-auto animate-fade-in">
            <div className="p-4 sm:p-6 space-y-5">

              {/* ===== 最上部: マイページ・ログアウト ===== */}
              <div>
                {user ? (
                  <div className="space-y-2">
                    <div className="px-3 py-2 bg-gray-50 rounded-xl">
                      <p className="text-xs text-gray-500">ログイン中</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Link
                        href="/dashboard"
                        onClick={closeMenus}
                        className="flex items-center justify-center gap-2 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors text-sm"
                      >
                        <LayoutDashboard size={18} />
                        集客 マイページ
                      </Link>
                      <Link
                        href="/kindle"
                        onClick={closeMenus}
                        className="flex items-center justify-center gap-2 bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors text-sm"
                      >
                        <BookOpen size={18} />
                        Kindle マイページ
                      </Link>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 py-2.5 rounded-xl font-medium hover:bg-red-50 transition-colors text-sm"
                    >
                      <LogOut size={16} />
                      ログアウト
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setShowAuth(true); setIsMenuOpen(false); }}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition-colors"
                  >
                    <User size={20} />
                    ログイン / 新規登録
                  </button>
                )}
              </div>

              {/* ===== コンテンツ作成ツール（2段グリッド） ===== */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">コンテンツ作成</p>
                <div className="grid grid-cols-2 gap-2">
                  {services.map((service) => (
                    <Link
                      key={service.id}
                      href={`/${service.id}/editor`}
                      onClick={(e) => handleServiceClick(e, service.id)}
                      className={`flex items-center gap-2.5 p-3 rounded-xl ${service.bg} transition-all hover:scale-[1.02]`}
                    >
                      <service.icon size={20} className={service.color} />
                      <div className={`font-bold text-sm ${service.color}`}>{service.label}</div>
                    </Link>
                  ))}
                  <Link
                    href="/salesletter/editor"
                    onClick={closeMenus}
                    className={`flex items-center gap-2.5 p-3 rounded-xl ${salesletterService.bg} transition-all hover:scale-[1.02]`}
                  >
                    <salesletterService.icon size={20} className={salesletterService.color} />
                    <div className={`font-bold text-sm ${salesletterService.color}`}>{salesletterService.label}</div>
                  </Link>
                  <Link
                    href="/onboarding/editor"
                    onClick={(e) => handleServiceClick(e, 'onboarding')}
                    className={`flex items-center gap-2.5 p-3 rounded-xl ${onboardingService.bg} transition-all hover:scale-[1.02]`}
                  >
                    <onboardingService.icon size={20} className={onboardingService.color} />
                    <div className={`font-bold text-sm ${onboardingService.color}`}>{onboardingService.label}</div>
                  </Link>
                </div>
              </div>

              {/* ===== 集客・イベントツール（2段グリッド） ===== */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">集客・イベント</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/booking/new"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-blue-50 transition-all hover:scale-[1.02]"
                  >
                    <Calendar size={20} className="text-blue-600" />
                    <div className="font-bold text-sm text-blue-600">予約メーカー</div>
                  </Link>
                  <Link
                    href="/attendance/new"
                    onClick={closeMenus}
                    className={`flex items-center gap-2.5 p-3 rounded-xl ${attendanceService.bg} transition-all hover:scale-[1.02]`}
                  >
                    <attendanceService.icon size={20} className={attendanceService.color} />
                    <div className={`font-bold text-sm ${attendanceService.color}`}>{attendanceService.label}</div>
                  </Link>
                  <Link
                    href="/survey/new"
                    onClick={closeMenus}
                    className={`flex items-center gap-2.5 p-3 rounded-xl ${surveyService.bg} transition-all hover:scale-[1.02]`}
                  >
                    <surveyService.icon size={20} className={surveyService.color} />
                    <div className={`font-bold text-sm ${surveyService.color}`}>{surveyService.label}</div>
                  </Link>
                  <Link
                    href="/gamification/new"
                    onClick={closeMenus}
                    className={`flex items-center gap-2.5 p-3 rounded-xl ${gamificationService.bg} transition-all hover:scale-[1.02]`}
                  >
                    <gamificationService.icon size={20} className={gamificationService.color} />
                    <div className={`font-bold text-sm ${gamificationService.color}`}>{gamificationService.label}</div>
                  </Link>
                </div>
              </div>

              {/* ===== メニュー（2段グリッド） ===== */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">メニュー</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Home size={18} className="text-gray-500" />
                    <span className="font-medium text-gray-700 text-sm">トップページ</span>
                  </Link>
                  <Link
                    href="/announcements"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Bell size={18} className="text-orange-500" />
                    <span className="font-medium text-gray-700 text-sm">お知らせ</span>
                  </Link>
                  <Link
                    href="/portal"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-colors"
                  >
                    <LayoutGrid size={18} className="text-purple-600" />
                    <span className="font-medium text-purple-700 text-sm">作品集（ポータル）</span>
                  </Link>
                  <Link
                    href="/marketplace"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 transition-colors"
                  >
                    <Store size={18} className="text-indigo-600" />
                    <span className="font-medium text-indigo-700 text-sm">スキルマーケット</span>
                  </Link>
                  <Link
                    href="/demos"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Monitor size={18} className="text-indigo-600" />
                    <span className="font-medium text-gray-700 text-sm">デモ一覧</span>
                  </Link>
                  <Link
                    href="/tools"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <LayoutGrid size={18} className="text-gray-500" />
                    <span className="font-medium text-gray-700 text-sm">ツール一覧</span>
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-colors"
                  >
                    <Crown size={18} className="text-purple-600" />
                    <span className="font-medium text-purple-700 text-sm">料金プラン</span>
                  </Link>
                  <Link
                    href="/kindle/lp"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-colors"
                  >
                    <BookOpen size={18} className="text-amber-600" />
                    <span className="font-medium text-amber-700 text-sm">Kindle出版</span>
                  </Link>
                </div>
              </div>

              {/* ===== 集客ノウハウ（2段グリッド） ===== */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TrendingUp size={12} className="text-orange-500" />
                  集客ノウハウ
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/howto"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-colors"
                  >
                    <FileText size={18} className="text-blue-500" />
                    <span className="font-medium text-gray-700 text-sm">使い方・機能一覧</span>
                  </Link>
                  <Link
                    href="/effective-use"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-colors"
                  >
                    <Lightbulb size={18} className="text-yellow-500" />
                    <span className="font-medium text-gray-700 text-sm">効果的な活用法9選</span>
                  </Link>
                  <Link
                    href="/selling-content"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors"
                  >
                    <TrendingUp size={18} className="text-green-500" />
                    <span className="font-medium text-gray-700 text-sm">売れるコンテンツの作り方</span>
                  </Link>
                  <Link
                    href="/gamification/effective-use"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors"
                  >
                    <Gamepad2 size={18} className="text-purple-500" />
                    <span className="font-medium text-gray-700 text-sm">ゲーミフィケーション活用法</span>
                  </Link>
                </div>
              </div>

              {/* ===== Kindleコンテンツ（2段グリッド） ===== */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BookOpen size={12} className="text-amber-500" />
                  Kindleコンテンツ
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/kindle/lp"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <BookOpen size={18} className="text-amber-500" />
                    <span className="font-medium text-gray-700 text-sm">Kindle出版LP</span>
                  </Link>
                  <Link
                    href="/kindle/agency"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Building2 size={18} className="text-blue-500" />
                    <span className="font-medium text-gray-700 text-sm">代理店パートナー募集</span>
                  </Link>
                  <Link
                    href="/kindle/discovery"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 transition-colors col-span-2 sm:col-span-1"
                  >
                    <Lightbulb size={18} className="text-yellow-500" />
                    <span className="font-medium text-gray-700 text-sm">ネタ発掘診断</span>
                  </Link>
                </div>
              </div>

              {/* ===== サポート（2段グリッド） ===== */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">サポート・その他</p>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/donation"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 transition-colors"
                  >
                    <Heart size={18} className="text-rose-500" />
                    <span className="font-medium text-rose-700 text-sm">開発支援・サポート</span>
                  </Link>
                  <Link
                    href="/contact"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Mail size={18} className="text-gray-500" />
                    <span className="font-medium text-gray-700 text-sm">お問い合わせ</span>
                  </Link>
                  <Link
                    href="/faq"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <HelpCircle size={18} className="text-gray-500" />
                    <span className="font-medium text-gray-700 text-sm">よくある質問</span>
                  </Link>
                  <Link
                    href="/sitemap-html"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FileText size={18} className="text-gray-500" />
                    <span className="font-medium text-gray-700 text-sm">サイトマップ</span>
                  </Link>
                  <Link
                    href="/legal"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Scale size={16} className="text-gray-400" />
                    <span className="text-gray-600 text-sm">特定商取引法</span>
                  </Link>
                  <Link
                    href="/privacy"
                    onClick={closeMenus}
                    className="flex items-center gap-2.5 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Shield size={16} className="text-gray-400" />
                    <span className="text-gray-600 text-sm">プライバシーポリシー</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
