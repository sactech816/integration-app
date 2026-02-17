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
  Store
} from 'lucide-react';
import { ServiceType } from '@/lib/types';

interface HeaderProps {
  setPage?: (page: string) => void;
  user: { email?: string } | null;
  onLogout: () => void;
  setShowAuth: (show: boolean) => void;
  currentService?: ServiceType;
}

const Header: React.FC<HeaderProps> = ({
  setPage,
  user,
  onLogout,
  setShowAuth,
  currentService
}) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServiceMenuOpen, setIsServiceMenuOpen] = useState(false);
  const [isGuideMenuOpen, setIsGuideMenuOpen] = useState(false);
  const [isKindleMenuOpen, setIsKindleMenuOpen] = useState(false);
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // ESCキーでメニューを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsServiceMenuOpen(false);
        setIsGuideMenuOpen(false);
        setIsKindleMenuOpen(false);
        setIsDemoMenuOpen(false);
        setIsUserMenuOpen(false);
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
    setIsDemoMenuOpen(false);
    setIsUserMenuOpen(false);
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
    setIsUserMenuOpen(false);
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

  return (
    <>
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-[100]">
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

            {/* ===== 新規作成ドロップダウン ===== */}
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
                  <div className="absolute top-full left-0 pt-2 w-64 z-[120]">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                    {services.map((service) => (
                      <Link
                        key={service.id}
                        href={`/${service.id}/editor`}
                        onClick={(e) => handleServiceClick(e, service.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${service.bg}`}>
                          <service.icon size={18} className={service.color} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm whitespace-nowrap">{service.label}</div>
                          <div className="text-xs text-gray-500">新規作成</div>
                        </div>
                      </Link>
                    ))}
                    <Link
                      href="/booking/new"
                      onClick={closeMenus}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-t border-gray-100"
                    >
                      <div className="p-2 rounded-lg bg-blue-50">
                        <Calendar size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm whitespace-nowrap">予約メーカー</div>
                        <div className="text-xs text-gray-500">新規作成</div>
                      </div>
                    </Link>
                    <Link
                      href="/attendance/new"
                      onClick={closeMenus}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${attendanceService.bg}`}>
                        <attendanceService.icon size={18} className={attendanceService.color} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm whitespace-nowrap">{attendanceService.label}</div>
                        <div className="text-xs text-gray-500">新規作成</div>
                      </div>
                    </Link>
                    <Link
                      href="/survey/new"
                      onClick={closeMenus}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${surveyService.bg}`}>
                        <surveyService.icon size={18} className={surveyService.color} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm whitespace-nowrap">{surveyService.label}</div>
                        <div className="text-xs text-gray-500">新規作成</div>
                      </div>
                    </Link>
                    <Link
                      href="/salesletter/editor"
                      onClick={closeMenus}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${salesletterService.bg}`}>
                        <salesletterService.icon size={18} className={salesletterService.color} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm whitespace-nowrap">{salesletterService.label}</div>
                        <div className="text-xs text-gray-500">新規作成</div>
                      </div>
                    </Link>
                    <Link
                      href="/gamification/new"
                      onClick={closeMenus}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${gamificationService.bg}`}>
                        <gamificationService.icon size={18} className={gamificationService.color} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm whitespace-nowrap">{gamificationService.label}</div>
                        <div className="text-xs text-gray-500">ガチャ・スタンプラリー等</div>
                      </div>
                    </Link>
                    {!user && (
                      <div className="px-4 py-3 border-t border-gray-100 mt-1">
                        <p className="text-xs text-gray-600 mb-2 flex items-center gap-1 text-left">
                          <Sparkles size={12} className="text-orange-500" />
                          ログインすると便利な機能が使えます
                        </p>
                        <button
                          onClick={() => {
                            setShowAuth(true);
                            setIsServiceMenuOpen(false);
                          }}
                          className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm"
                        >
                          ログイン / 新規登録
                        </button>
                      </div>
                    )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ===== 活用ガイドドロップダウン ===== */}
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

            {/* ===== デモ・作品ドロップダウン ===== */}
            <div
              className="relative"
              onMouseEnter={() => setIsDemoMenuOpen(true)}
              onMouseLeave={() => setIsDemoMenuOpen(false)}
            >
              <button
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg px-3 py-2 transition-all"
              >
                <LayoutGrid size={16} />
                <span>デモ・作品</span>
                <ChevronDown size={14} className={`transition-transform ${isDemoMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDemoMenuOpen && (
                <>
                  <div className="absolute top-full left-0 w-full h-2" />
                  <div className="absolute top-full left-0 pt-2 w-64 z-[120]">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                      <Link
                        href="/portal"
                        onClick={closeMenus}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-purple-50">
                          <LayoutGrid size={18} className="text-purple-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">作品集（ポータル）</div>
                          <div className="text-xs text-gray-500">みんなの作品を見る</div>
                        </div>
                      </Link>
                      <Link
                        href="/demos"
                        onClick={closeMenus}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-indigo-50">
                          <Monitor size={18} className="text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">デモ一覧</div>
                          <div className="text-xs text-gray-500">テンプレートを見る</div>
                        </div>
                      </Link>
                      <Link
                        href="/tools"
                        onClick={closeMenus}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-gray-100">
                          <LayoutGrid size={18} className="text-gray-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">ツール一覧</div>
                          <div className="text-xs text-gray-500">全ツールを一覧で確認</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ===== スキルマーケット（単独リンク） ===== */}
            <Link
              href="/marketplace"
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg px-3 py-2 transition-all"
            >
              <Store size={16} />
              <span>スキルマーケット</span>
            </Link>

            {/* ===== お知らせ（単独リンク） ===== */}
            <Link
              href="/announcements"
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg px-3 py-2 transition-all"
            >
              <Bell size={16} />
              <span>お知らせ</span>
            </Link>

            {/* ===== 料金プラン（単独リンク） ===== */}
            <Link
              href="/pricing"
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg px-3 py-2 transition-all"
            >
              <Crown size={16} />
              <span>料金プラン</span>
            </Link>

          </nav>

          {/* ===== PC版ユーザーアクション ===== */}
          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <div
                className="relative"
                onMouseEnter={() => setIsUserMenuOpen(true)}
                onMouseLeave={() => setIsUserMenuOpen(false)}
              >
                <button
                  className="flex items-center gap-2 bg-orange-50 text-orange-700 px-4 py-2 rounded-full font-semibold hover:bg-orange-100 transition-colors"
                >
                  <LayoutDashboard size={18} />
                  <span>マイページ</span>
                  <ChevronDown size={14} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="absolute top-full right-0 w-full h-2" />
                    <div className="absolute top-full right-0 pt-2 w-64 z-[120]">
                      <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                        {/* メールアドレス表示 */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-xs text-gray-500">ログイン中</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                        </div>

                        <Link
                          href="/dashboard"
                          onClick={closeMenus}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="p-2 rounded-lg bg-orange-50">
                            <Magnet size={18} className="text-orange-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">集客メーカー マイページ</div>
                            <div className="text-xs text-gray-500">作成した作品を管理</div>
                          </div>
                        </Link>

                        <Link
                          href="/kindle"
                          onClick={closeMenus}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                        >
                          <div className="p-2 rounded-lg bg-amber-50">
                            <BookOpen size={18} className="text-amber-600" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">Kindle出版 マイページ</div>
                            <div className="text-xs text-gray-500">執筆中の本を管理</div>
                          </div>
                        </Link>

                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition-colors"
                          >
                            <LogOut size={18} className="text-red-500 ml-2" />
                            <span className="font-medium text-red-600">ログアウト</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
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

          {/* メニューコンテンツ */}
          <div className="fixed inset-0 top-16 left-0 right-0 bottom-0 bg-white z-[200] overflow-y-auto animate-fade-in">
            <div className="p-6 space-y-6">
              {/* 作成セクション */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">新規作成</p>
                <div className="grid grid-cols-1 gap-2">
                  {services.map((service) => (
                    <Link
                      key={service.id}
                      href={`/${service.id}/editor`}
                      onClick={(e) => handleServiceClick(e, service.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl ${service.bg} transition-all hover:scale-[1.02]`}
                    >
                      <service.icon size={24} className={service.color} />
                      <div>
                        <div className={`font-bold ${service.color}`}>{service.label}</div>
                        <div className="text-xs text-gray-500">新規作成</div>
                      </div>
                    </Link>
                  ))}
                  {/* 予約メーカー */}
                  <Link
                    href="/booking/new"
                    onClick={closeMenus}
                    className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 transition-all hover:scale-[1.02]"
                  >
                    <Calendar size={24} className="text-blue-600" />
                    <div>
                      <div className="font-bold text-blue-600">予約メーカー</div>
                      <div className="text-xs text-gray-500">新規作成</div>
                    </div>
                  </Link>
                  {/* 出欠メーカー */}
                  <Link
                    href="/attendance/new"
                    onClick={closeMenus}
                    className={`flex items-center gap-3 p-4 rounded-xl ${attendanceService.bg} transition-all hover:scale-[1.02]`}
                  >
                    <attendanceService.icon size={24} className={attendanceService.color} />
                    <div>
                      <div className={`font-bold ${attendanceService.color}`}>{attendanceService.label}</div>
                      <div className="text-xs text-gray-500">新規作成</div>
                    </div>
                  </Link>
                  {/* アンケートメーカー */}
                  <Link
                    href="/survey/new"
                    onClick={closeMenus}
                    className={`flex items-center gap-3 p-4 rounded-xl ${surveyService.bg} transition-all hover:scale-[1.02]`}
                  >
                    <surveyService.icon size={24} className={surveyService.color} />
                    <div>
                      <div className={`font-bold ${surveyService.color}`}>{surveyService.label}</div>
                      <div className="text-xs text-gray-500">新規作成</div>
                    </div>
                  </Link>
                  {/* セールスライター */}
                  <Link
                    href="/salesletter/editor"
                    onClick={closeMenus}
                    className={`flex items-center gap-3 p-4 rounded-xl ${salesletterService.bg} transition-all hover:scale-[1.02]`}
                  >
                    <salesletterService.icon size={24} className={salesletterService.color} />
                    <div>
                      <div className={`font-bold ${salesletterService.color}`}>{salesletterService.label}</div>
                      <div className="text-xs text-gray-500">新規作成</div>
                    </div>
                  </Link>
                  {/* ゲーミフィケーション */}
                  <Link
                    href="/gamification/new"
                    onClick={closeMenus}
                    className={`flex items-center gap-3 p-4 rounded-xl ${gamificationService.bg} transition-all hover:scale-[1.02]`}
                  >
                    <gamificationService.icon size={24} className={gamificationService.color} />
                    <div>
                      <div className={`font-bold ${gamificationService.color}`}>{gamificationService.label}</div>
                      <div className="text-xs text-gray-500">ガチャ・スタンプラリー等</div>
                    </div>
                  </Link>
                </div>
                {!user && (
                  <div className="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-xs text-gray-600 mb-3 flex items-center gap-1 text-left">
                      <Sparkles size={12} className="text-orange-500" />
                      ログインすると便利な機能が使えます
                    </p>
                    <button
                      onClick={() => {
                        setShowAuth(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors text-sm"
                    >
                      ログイン / 新規登録
                    </button>
                  </div>
                )}
              </div>

              {/* ナビゲーション */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">メニュー</p>
                <div className="space-y-1">
                  <Link
                    href="/"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Home size={20} className="text-gray-500" />
                    <span className="font-medium text-gray-700">トップページ</span>
                  </Link>
                  <Link
                    href="/portal"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-colors"
                  >
                    <LayoutGrid size={20} className="text-purple-600" />
                    <div className="text-left">
                      <span className="font-medium text-purple-700">作品集（ポータル）</span>
                      <p className="text-xs text-gray-500">みんなの作品を見る</p>
                    </div>
                  </Link>
                  <Link
                    href="/marketplace"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 transition-colors"
                  >
                    <Store size={20} className="text-indigo-600" />
                    <div className="text-left">
                      <span className="font-medium text-indigo-700">スキルマーケット</span>
                      <p className="text-xs text-gray-500">プロに依頼・スキルを出品</p>
                    </div>
                  </Link>
                  <Link
                    href="/demos"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 transition-colors"
                  >
                    <Monitor size={20} className="text-indigo-600" />
                    <div className="text-left">
                      <span className="font-medium text-indigo-700">デモ一覧</span>
                      <p className="text-xs text-gray-500">テンプレートを見る</p>
                    </div>
                  </Link>
                  <Link
                    href="/kindle/lp"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-colors"
                  >
                    <BookOpen size={20} className="text-amber-600" />
                    <div className="text-left">
                      <span className="font-medium text-amber-700">Kindle出版</span>
                      <p className="text-xs text-gray-500">AIでKindle本を執筆</p>
                    </div>
                  </Link>
                  <Link
                    href="/announcements"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Bell size={20} className="text-gray-500" />
                    <span className="font-medium text-gray-700">お知らせ</span>
                  </Link>
                  <Link
                    href="/howto"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FileText size={20} className="text-gray-500" />
                    <span className="font-medium text-gray-700">使い方・機能一覧</span>
                  </Link>
                  <Link
                    href="/tools"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <LayoutGrid size={20} className="text-gray-500" />
                    <span className="font-medium text-gray-700">ツール一覧</span>
                  </Link>
                  <Link
                    href="/sitemap-html"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FileText size={20} className="text-gray-500" />
                    <span className="font-medium text-gray-700">サイトマップ</span>
                  </Link>
                  <Link
                    href="/faq"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <HelpCircle size={20} className="text-gray-500" />
                    <span className="font-medium text-gray-700">よくある質問</span>
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-colors"
                  >
                    <Crown size={20} className="text-purple-600" />
                    <div className="text-left">
                      <span className="font-medium text-purple-700">料金プラン</span>
                      <p className="text-xs text-gray-500">Proプランのご案内</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* 集客ノウハウ */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TrendingUp size={12} className="text-orange-500" />
                  集客ノウハウ
                </p>
                <div className="space-y-1">
                  <Link
                    href="/effective-use"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-colors"
                  >
                    <Lightbulb size={20} className="text-yellow-500" />
                    <div className="text-left">
                      <span className="font-medium text-gray-700">効果的な活用法9選</span>
                      <p className="text-xs text-gray-500">集客効果を最大化するヒント</p>
                    </div>
                  </Link>
                  <Link
                    href="/selling-content"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors"
                  >
                    <TrendingUp size={20} className="text-green-500" />
                    <div className="text-left">
                      <span className="font-medium text-gray-700">売れるコンテンツの作り方</span>
                      <p className="text-xs text-gray-500">心理トリガーを押さえた鉄板ロジック</p>
                    </div>
                  </Link>
                  <Link
                    href="/gamification/effective-use"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors"
                  >
                    <Gamepad2 size={20} className="text-purple-500" />
                    <div className="text-left">
                      <span className="font-medium text-gray-700">ゲーミフィケーション活用法</span>
                      <p className="text-xs text-gray-500">エンゲージメントを高める</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Kindleコンテンツ */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BookOpen size={12} className="text-amber-500" />
                  Kindleコンテンツ
                </p>
                <div className="space-y-1">
                  <Link
                    href="/kindle/lp"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <BookOpen size={20} className="text-amber-500" />
                    <span className="font-medium text-gray-700">Kindle出版LP</span>
                  </Link>
                  <Link
                    href="/kindle/agency"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Building2 size={20} className="text-blue-500" />
                    <span className="font-medium text-gray-700">代理店パートナー募集</span>
                  </Link>
                  <Link
                    href="/kindle/discovery"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100 transition-colors"
                  >
                    <Lightbulb size={20} className="text-yellow-500" />
                    <div className="text-left">
                      <span className="font-medium text-gray-700">ネタ発掘診断</span>
                      <p className="text-xs text-gray-500">AIがあなたの本のテーマを提案</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* 開発支援・サポート */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">応援・サポート</p>
                <div className="space-y-1">
                  <Link
                    href="/donation"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 transition-colors"
                  >
                    <Heart size={20} className="text-rose-500" />
                    <div className="text-left">
                      <span className="font-medium text-rose-700">❤️ 開発支援・サポート</span>
                      <p className="text-xs text-gray-500">サービスの運営を応援する</p>
                    </div>
                  </Link>
                </div>
              </div>

              {/* サポート */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">サポート・規約</p>
                <div className="space-y-1">
                  <Link
                    href="/contact"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Mail size={20} className="text-gray-500" />
                    <span className="font-medium text-gray-700">お問い合わせ</span>
                  </Link>
                  <Link
                    href="/legal"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Scale size={18} className="text-gray-400" />
                    <span className="text-gray-600">特定商取引法に基づく表記</span>
                  </Link>
                  <Link
                    href="/privacy"
                    onClick={closeMenus}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Shield size={18} className="text-gray-400" />
                    <span className="text-gray-600">プライバシーポリシー</span>
                  </Link>
                </div>
              </div>

              {/* ユーザーアクション */}
              <div className="pt-4 border-t border-gray-100">
                {user ? (
                  <div className="space-y-2">
                    {/* メールアドレス表示 */}
                    <div className="px-4 py-2 bg-gray-50 rounded-xl mb-3">
                      <p className="text-xs text-gray-500">ログイン中</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                    </div>
                  <Link
                    href="/dashboard"
                    onClick={closeMenus}
                    className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors"
                  >
                      <LayoutDashboard size={20} />
                      集客メーカー マイページ
                    </Link>
                    <Link
                      href="/kindle"
                      onClick={closeMenus}
                      className="w-full flex items-center justify-center gap-2 bg-amber-500 text-white py-3 rounded-xl font-bold hover:bg-amber-600 transition-colors"
                    >
                      <BookOpen size={20} />
                      Kindle出版 マイページ
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 py-3 rounded-xl font-medium hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={20} />
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
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
