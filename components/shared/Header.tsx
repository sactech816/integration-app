'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Store,
  MousePointerClick,
  Image,
  PartyPopper,
  GitBranch,
  Video,
  ClipboardCheck,
  Share2,
  Gift,
  Send,
  Globe,
  BarChart3,
  Search,
  ShoppingBag,
  Tv,
  ListOrdered,
  MessageCircle,
  Brain,
  Star
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
  const [isDiagnosisMenuOpen, setIsDiagnosisMenuOpen] = useState(false);
  // ハンバーガーメニュー用アコーディオン state
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);
  const toggleAccordion = (key: string) => setMobileAccordion(prev => prev === key ? null : key);

  // ホバーメニュー遅延クローズ用タイマー
  const serviceMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const guideMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kindleMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const diagnosisMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMenuEnter = useCallback((menu: 'service' | 'guide' | 'kindle' | 'diagnosis') => {
    const timerRef = menu === 'service' ? serviceMenuTimer : menu === 'guide' ? guideMenuTimer : menu === 'diagnosis' ? diagnosisMenuTimer : kindleMenuTimer;
    const setter = menu === 'service' ? setIsServiceMenuOpen : menu === 'guide' ? setIsGuideMenuOpen : menu === 'diagnosis' ? setIsDiagnosisMenuOpen : setIsKindleMenuOpen;
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    setter(true);
  }, []);

  const handleMenuLeave = useCallback((menu: 'service' | 'guide' | 'kindle' | 'diagnosis') => {
    const timerRef = menu === 'service' ? serviceMenuTimer : menu === 'guide' ? guideMenuTimer : menu === 'diagnosis' ? diagnosisMenuTimer : kindleMenuTimer;
    const setter = menu === 'service' ? setIsServiceMenuOpen : menu === 'guide' ? setIsGuideMenuOpen : menu === 'diagnosis' ? setIsDiagnosisMenuOpen : setIsKindleMenuOpen;
    timerRef.current = setTimeout(() => { setter(false); timerRef.current = null; }, 150);
  }, []);

  // タイマークリーンアップ
  useEffect(() => {
    return () => {
      if (serviceMenuTimer.current) clearTimeout(serviceMenuTimer.current);
      if (guideMenuTimer.current) clearTimeout(guideMenuTimer.current);
      if (kindleMenuTimer.current) clearTimeout(kindleMenuTimer.current);
      if (diagnosisMenuTimer.current) clearTimeout(diagnosisMenuTimer.current);
    };
  }, []);

  // ESCキーでメニューを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsServiceMenuOpen(false);
        setIsGuideMenuOpen(false);
        setIsKindleMenuOpen(false);
        setIsDiagnosisMenuOpen(false);
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
    setIsDiagnosisMenuOpen(false);
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
  const onboardingService = { id: 'onboarding', label: 'ガイドメーカー', icon: MousePointerClick, color: 'text-sky-600', bg: 'bg-sky-50' };

  // サムネイルメーカー
  const thumbnailService = { id: 'thumbnail', label: 'サムネイルメーカー', icon: Image, color: 'text-pink-600', bg: 'bg-pink-50' };

  // スキルマーケット
  const marketplaceService = { id: 'marketplace', label: 'スキルマーケット', icon: Store, color: 'text-indigo-600', bg: 'bg-indigo-50' };

  // エンタメ診断
  const entertainmentService = { id: 'entertainment', label: 'エンタメ診断メーカー', icon: PartyPopper, color: 'text-pink-600', bg: 'bg-pink-50' };

  // メルマガ
  const newsletterService = { id: 'newsletter', label: 'メルマガメーカー', icon: Mail, color: 'text-cyan-600', bg: 'bg-cyan-50' };

  // ファネル
  const funnelService = { id: 'funnel', label: 'ファネルメーカー', icon: GitBranch, color: 'text-amber-600', bg: 'bg-amber-50' };

  // ウェビナーLP
  const webinarService = { id: 'webinar', label: 'ウェビナーLPメーカー', icon: Video, color: 'text-violet-600', bg: 'bg-violet-50' };

  // フォームメーカー
  const orderFormService = { id: 'order-form', label: 'フォームメーカー', icon: ClipboardCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' };

  // アフィリエイト
  const affiliateService = { id: 'affiliate', label: 'アフィリエイト', icon: Share2, color: 'text-green-600', bg: 'bg-green-50' };

  // Kindle体験版
  const kindleFreeTrialService = { id: 'kindle-free-trial', label: 'Kindle体験版', icon: Gift, color: 'text-amber-600', bg: 'bg-amber-50' };

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
              onMouseEnter={() => handleMenuEnter('service')}
              onMouseLeave={() => handleMenuLeave('service')}
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
                  {/* ブリッジ: ボタンとパネルの間のホバー切れ防止 */}
                  <div className="fixed left-0 right-0 top-16 h-4 z-[119]" />
                  {/* 全幅メガメニューパネル */}
                  <div
                    className="fixed left-0 right-0 top-[4.25rem] z-[120] animate-fade-in"
                    onMouseEnter={() => handleMenuEnter('service')}
                    onMouseLeave={() => handleMenuLeave('service')}
                  >
                    <div className="border-b border-gray-200 bg-white shadow-xl">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                        <div className="grid grid-cols-6 gap-5">
                        {/* LP・ページ作成 */}
                        <div>
                          <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            LP・ページ作成
                          </p>
                          <div className="space-y-0.5">
                            <Link href="/profile/editor" onClick={(e) => handleServiceClick(e, 'profile')} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                              <div className="p-1 rounded-md bg-indigo-50 shrink-0"><UserCircle size={14} className="text-indigo-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">プロフィール</span>
                            </Link>
                            <Link href="/business/editor" onClick={(e) => handleServiceClick(e, 'business')} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                              <div className="p-1 rounded-md bg-indigo-50 shrink-0"><Building2 size={14} className="text-indigo-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">LPメーカー</span>
                            </Link>
                            <Link href="/webinar/editor" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                              <div className="p-1 rounded-md bg-indigo-50 shrink-0"><Video size={14} className="text-indigo-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">ウェビナーLP</span>
                            </Link>
                            <Link href="/onboarding/editor" onClick={(e) => handleServiceClick(e, 'onboarding')} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                              <div className="p-1 rounded-md bg-indigo-50 shrink-0"><MousePointerClick size={14} className="text-indigo-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">ガイドメーカー</span>
                            </Link>
                            <Link href="/site/editor" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                              <div className="p-1 rounded-md bg-indigo-50 shrink-0"><Globe size={14} className="text-indigo-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">ホームページ</span>
                            </Link>
                            <Link href="/order-form/new" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                              <div className="p-1 rounded-md bg-indigo-50 shrink-0"><ClipboardCheck size={14} className="text-indigo-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">
                                フォーム
                                <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1 py-0.5 rounded-full ml-1">PRO</span>
                              </span>
                            </Link>
                          </div>
                        </div>

                        {/* 診断・クイズ */}
                        <div>
                          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            診断・クイズ
                          </p>
                          <div className="space-y-0.5">
                            <Link href="/quiz/editor" onClick={(e) => handleServiceClick(e, 'quiz')} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
                              <div className="p-1 rounded-md bg-emerald-50 shrink-0"><Sparkles size={14} className="text-emerald-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">診断クイズ</span>
                            </Link>
                            <Link href="/entertainment/create" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
                              <div className="p-1 rounded-md bg-emerald-50 shrink-0"><PartyPopper size={14} className="text-emerald-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">
                                エンタメ診断
                                <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1 py-0.5 rounded-full ml-1">PRO</span>
                              </span>
                            </Link>
                          </div>

                          <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-2 mt-4 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            収益化・販売
                          </p>
                          <div className="space-y-0.5">
                            <Link href="/gamification/new" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                              <div className="p-1 rounded-md bg-purple-50 shrink-0"><Gamepad2 size={14} className="text-purple-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">ゲーミフィケーション</span>
                            </Link>
                            <Link href="/marketplace" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                              <div className="p-1 rounded-md bg-purple-50 shrink-0"><Store size={14} className="text-purple-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">スキルマーケット</span>
                            </Link>
                            <Link href="/affiliate" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                              <div className="p-1 rounded-md bg-purple-50 shrink-0"><Share2 size={14} className="text-purple-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">アフィリエイト</span>
                            </Link>
                          </div>
                        </div>

                        {/* ライティング・制作 */}
                        <div>
                          <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            ライティング・制作
                          </p>
                          <div className="space-y-0.5">
                            <Link href="/salesletter/editor" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">
                              <div className="p-1 rounded-md bg-amber-50 shrink-0"><PenTool size={14} className="text-amber-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">セールスライター</span>
                            </Link>
                            <Link href="/thumbnail/editor" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">
                              <div className="p-1 rounded-md bg-amber-50 shrink-0"><Image size={14} className="text-amber-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">
                                サムネイル
                                <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1 py-0.5 rounded-full ml-1">PRO</span>
                              </span>
                            </Link>
                            <Link href="/sns-post" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">
                              <div className="p-1 rounded-md bg-amber-50 shrink-0"><Send size={14} className="text-amber-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">SNS投稿</span>
                            </Link>
                          </div>
                        </div>

                        {/* 集客・イベント */}
                        <div>
                          <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                            集客・イベント
                          </p>
                          <div className="space-y-0.5">
                            <Link href="/booking/new" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-cyan-50 transition-colors">
                              <div className="p-1 rounded-md bg-cyan-50 shrink-0"><Calendar size={14} className="text-cyan-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">予約メーカー</span>
                            </Link>
                            <Link href="/attendance/new" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-cyan-50 transition-colors">
                              <div className="p-1 rounded-md bg-cyan-50 shrink-0"><CalendarCheck size={14} className="text-cyan-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">出欠メーカー</span>
                            </Link>
                            <Link href="/survey/new" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-cyan-50 transition-colors">
                              <div className="p-1 rounded-md bg-cyan-50 shrink-0"><ClipboardList size={14} className="text-cyan-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">アンケート</span>
                            </Link>
                            <Link href="/newsletter/campaigns/new" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-cyan-50 transition-colors">
                              <div className="p-1 rounded-md bg-cyan-50 shrink-0"><Mail size={14} className="text-cyan-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">
                                メルマガ
                                <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1 py-0.5 rounded-full ml-1">PRO</span>
                              </span>
                            </Link>
                            <Link href="/step-email/sequences/new" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-cyan-50 transition-colors">
                              <div className="p-1 rounded-md bg-cyan-50 shrink-0"><ListOrdered size={14} className="text-cyan-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">ステップメール</span>
                            </Link>
                            <Link href="/funnel/new" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-cyan-50 transition-colors">
                              <div className="p-1 rounded-md bg-cyan-50 shrink-0"><GitBranch size={14} className="text-cyan-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">ファネル</span>
                            </Link>
                            <Link href="/dashboard?view=line" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-green-50 transition-colors">
                              <div className="p-1 rounded-md bg-green-50 shrink-0"><MessageCircle size={14} className="text-green-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">LINE公式連携</span>
                            </Link>
                          </div>
                        </div>

                        {/* リサーチ */}
                        <div>
                          <p className="text-[10px] font-bold text-teal-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                            リサーチ
                          </p>
                          <div className="space-y-0.5">
                            <Link href="/youtube-analysis/editor" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-teal-50 transition-colors">
                              <div className="p-1 rounded-md bg-teal-50 shrink-0"><BarChart3 size={14} className="text-teal-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">YouTube競合分析</span>
                            </Link>
                            <Link href="/youtube-keyword-research/editor" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-teal-50 transition-colors">
                              <div className="p-1 rounded-md bg-teal-50 shrink-0"><Search size={14} className="text-teal-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">YouTubeキーワード</span>
                            </Link>
                            <Link href="/google-keyword-research/editor" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-teal-50 transition-colors">
                              <div className="p-1 rounded-md bg-teal-50 shrink-0"><Search size={14} className="text-teal-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">Googleキーワード</span>
                            </Link>
                            <Link href="/rakuten-research/editor" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors">
                              <div className="p-1 rounded-md bg-rose-50 shrink-0"><ShoppingBag size={14} className="text-rose-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">楽天リサーチ</span>
                            </Link>
                            <Link href="/niconico-keyword-research/editor" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
                              <div className="p-1 rounded-md bg-orange-50 shrink-0"><Tv size={14} className="text-orange-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">ニコニコリサーチ</span>
                            </Link>
                            <Link href="/reddit-keyword-research/editor" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
                              <div className="p-1 rounded-md bg-orange-50 shrink-0"><Globe size={14} className="text-orange-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">Redditリサーチ</span>
                            </Link>
                          </div>
                        </div>

                        {/* Kindle出版 */}
                        <div>
                          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            Kindle出版
                          </p>
                          <div className="space-y-0.5">
                            <Link href="/kindle/lp" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">
                              <div className="p-1 rounded-md bg-amber-50 shrink-0"><BookOpen size={14} className="text-amber-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">Kindle出版とは</span>
                            </Link>
                            <Link href="/kindle/free-trial" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">
                              <div className="p-1 rounded-md bg-amber-50 shrink-0"><Gift size={14} className="text-amber-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">
                                1章無料お試し
                                <span className="text-[9px] font-bold text-green-600 bg-green-100 px-1 py-0.5 rounded-full ml-1">無料</span>
                              </span>
                            </Link>
                            <Link href="/kindle/discovery/demo" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">
                              <div className="p-1 rounded-md bg-amber-50 shrink-0"><Lightbulb size={14} className="text-amber-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">
                                ネタ発掘診断
                                <span className="text-[9px] font-bold text-green-600 bg-green-100 px-1 py-0.5 rounded-full ml-1">無料</span>
                              </span>
                            </Link>
                            <Link href="/kindle-keywords/editor" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">
                              <div className="p-1 rounded-md bg-amber-50 shrink-0"><Search size={14} className="text-amber-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">Kindleキーワードリサーチ</span>
                            </Link>
                            <Link href="/kindle/agency" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">
                              <div className="p-1 rounded-md bg-amber-50 shrink-0"><Building2 size={14} className="text-amber-600" /></div>
                              <span className="font-medium text-gray-900 text-xs whitespace-nowrap">代理店パートナー</span>
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* 下部リンクバー */}
                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-4 flex-wrap">
                        <Link href="/portal" onClick={closeMenus}
                          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                          <LayoutGrid size={13} />
                          <span>作品集</span>
                        </Link>
                        <Link href="/demos" onClick={closeMenus}
                          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                          <Monitor size={13} />
                          <span>デモ一覧</span>
                        </Link>
                        <Link href="/tools" onClick={closeMenus}
                          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                          <LayoutGrid size={13} />
                          <span>ツール一覧</span>
                        </Link>
                        <Link href="/pricing" onClick={closeMenus}
                          className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors">
                          <Sparkles size={13} />
                          <span>料金プラン</span>
                        </Link>
                        <Link href="/donation" onClick={closeMenus}
                          className="flex items-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-600 transition-colors">
                          <Heart size={13} />
                          <span>開発支援</span>
                        </Link>
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
                  </div>
                </>
              )}
            </div>

            {/* ===== 診断ドロップダウン ===== */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuEnter('diagnosis')}
              onMouseLeave={() => handleMenuLeave('diagnosis')}
            >
              <button
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg px-3 py-2 transition-all"
              >
                <Brain size={16} />
                <span>診断</span>
                <ChevronDown size={14} className={`transition-transform ${isDiagnosisMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDiagnosisMenuOpen && (
                <>
                  <div className="absolute top-full left-0 w-full h-4" />
                  <div
                    className="absolute top-full left-0 pt-2 w-64 z-[120]"
                    onMouseEnter={() => handleMenuEnter('diagnosis')}
                    onMouseLeave={() => handleMenuLeave('diagnosis')}
                  >
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                      <Link
                        href="/bigfive"
                        onClick={closeMenus}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-indigo-50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-indigo-50">
                          <Brain size={18} className="text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">性格診断</div>
                          <div className="text-xs text-gray-500">Big Five 科学的性格診断</div>
                        </div>
                      </Link>
                      <Link
                        href="/fortune"
                        onClick={closeMenus}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-indigo-50 transition-colors"
                      >
                        <div className="p-2 rounded-lg bg-indigo-50">
                          <Star size={18} className="text-indigo-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 text-sm">生年月日占い</div>
                          <div className="text-xs text-gray-500">九星気学・数秘術・四柱推命</div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ===== 活用ガイドドロップダウン（お知らせ・開発支援を統合） ===== */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuEnter('guide')}
              onMouseLeave={() => handleMenuLeave('guide')}
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
                  {/* ブリッジ: ボタンとパネルの間のホバー切れ防止 */}
                  <div className="fixed left-0 right-0 top-16 h-4 z-[119]" />
                  {/* 全幅メガメニューパネル */}
                  <div
                    className="fixed left-0 right-0 top-[4.25rem] z-[120] animate-fade-in"
                    onMouseEnter={() => handleMenuEnter('guide')}
                    onMouseLeave={() => handleMenuLeave('guide')}
                  >
                    <div className="border-b border-gray-200 bg-white shadow-xl">
                      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
                        <div className="grid grid-cols-4 gap-6">
                          {/* 基本ガイド */}
                          <div>
                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                              基本ガイド
                            </p>
                            <div className="space-y-0.5">
                              <Link href="/announcements" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
                                <div className="p-1 rounded-md bg-orange-50 shrink-0"><Bell size={14} className="text-orange-500" /></div>
                                <span className="font-medium text-gray-900 text-xs whitespace-nowrap">お知らせ</span>
                              </Link>
                              <Link href="/howto" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                                <div className="p-1 rounded-md bg-blue-50 shrink-0"><FileText size={14} className="text-blue-600" /></div>
                                <span className="font-medium text-gray-900 text-xs whitespace-nowrap">使い方・機能一覧</span>
                              </Link>
                              <Link href="/effective-use" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
                                <div className="p-1 rounded-md bg-orange-50 shrink-0"><Lightbulb size={14} className="text-orange-500" /></div>
                                <span className="font-medium text-gray-900 text-xs whitespace-nowrap">効果的な活用法9選</span>
                              </Link>
                              <Link href="/selling-content" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-green-50 transition-colors">
                                <div className="p-1 rounded-md bg-green-50 shrink-0"><TrendingUp size={14} className="text-green-500" /></div>
                                <span className="font-medium text-gray-900 text-xs whitespace-nowrap">売れるコンテンツの作り方</span>
                              </Link>
                            </div>
                          </div>

                          {/* ジャンル別ガイド */}
                          <div>
                            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              ジャンル別ガイド
                            </p>
                            <div className="space-y-0.5">
                              <Link href="/guide/page-creation" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                                <div className="p-1 rounded-md bg-blue-50 shrink-0"><Globe size={14} className="text-blue-500" /></div>
                                <span className="font-medium text-gray-900 text-xs whitespace-nowrap">LP・ページ作成</span>
                              </Link>
                              <Link href="/guide/quiz-diagnosis" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                                <div className="p-1 rounded-md bg-indigo-50 shrink-0"><Brain size={14} className="text-indigo-500" /></div>
                                <span className="font-medium text-gray-900 text-xs whitespace-nowrap">診断・クイズ</span>
                              </Link>
                              <Link href="/guide/writing" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors">
                                <div className="p-1 rounded-md bg-emerald-50 shrink-0"><PenTool size={14} className="text-emerald-500" /></div>
                                <span className="font-medium text-gray-900 text-xs whitespace-nowrap">ライティング・制作</span>
                              </Link>
                              <Link href="/guide/marketing" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-cyan-50 transition-colors">
                                <div className="p-1 rounded-md bg-cyan-50 shrink-0"><Calendar size={14} className="text-cyan-500" /></div>
                                <span className="font-medium text-gray-900 text-xs whitespace-nowrap">集客・マーケティング</span>
                              </Link>
                              <Link href="/guide/monetization" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-amber-50 transition-colors">
                                <div className="p-1 rounded-md bg-amber-50 shrink-0"><Gift size={14} className="text-amber-500" /></div>
                                <span className="font-medium text-gray-900 text-xs whitespace-nowrap">収益化・販売</span>
                              </Link>
                            </div>
                          </div>

                          {/* その他のガイド */}
                          <div>
                            <p className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                              その他のガイド
                            </p>
                            <div className="space-y-0.5">
                              <Link href="/gamification/effective-use" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-purple-50 transition-colors">
                                <div className="p-1 rounded-md bg-purple-50 shrink-0"><Gamepad2 size={14} className="text-purple-500" /></div>
                                <span className="font-medium text-gray-900 text-xs whitespace-nowrap">ゲーミフィケーション活用法</span>
                              </Link>
                              <Link href="/marketplace" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors">
                                <div className="p-1 rounded-md bg-indigo-50 shrink-0"><Store size={14} className="text-indigo-500" /></div>
                                <span className="font-medium text-gray-900 text-xs whitespace-nowrap">スキルマーケット</span>
                              </Link>
                            </div>
                          </div>

                          {/* サポート */}
                          <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                              サポート
                            </p>
                            <div className="space-y-0.5">
                              <Link href="/faq" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="p-1 rounded-md bg-gray-50 shrink-0"><HelpCircle size={14} className="text-gray-400" /></div>
                                <span className="font-medium text-gray-900 text-xs whitespace-nowrap">よくある質問</span>
                              </Link>
                              <Link href="/contact" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                                <div className="p-1 rounded-md bg-gray-50 shrink-0"><Mail size={14} className="text-gray-400" /></div>
                                <span className="font-medium text-gray-900 text-xs whitespace-nowrap">お問い合わせ</span>
                              </Link>
                              <Link href="/donation" onClick={closeMenus} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-rose-50 transition-colors">
                                <div className="p-1 rounded-md bg-rose-50 shrink-0"><Heart size={14} className="text-rose-400" /></div>
                                <span className="font-medium text-rose-600 text-xs whitespace-nowrap">開発支援・サポート</span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ===== 料金プラン直リンク ===== */}
            <Link
              href="/pricing"
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg px-3 py-2 transition-all"
            >
              <Sparkles size={16} />
              <span>料金プラン</span>
            </Link>

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

              {/* ===== 診断 ===== */}
              <div>
                <button
                  onClick={() => toggleAccordion('diagnosis')}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <Brain size={18} className="text-indigo-600" />
                    <span className="font-bold text-gray-900 text-sm">診断</span>
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${mobileAccordion === 'diagnosis' ? 'rotate-180' : ''}`} />
                </button>
                {mobileAccordion === 'diagnosis' && (
                  <div className="ml-4 space-y-0.5 mt-1 border-l-2 border-indigo-100 pl-3">
                    <Link href="/bigfive" onClick={closeMenus}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors">
                      <Brain size={16} className="text-indigo-500" />
                      <span className="text-gray-700 text-sm">性格診断（Big Five）</span>
                    </Link>
                    <Link href="/fortune" onClick={closeMenus}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-indigo-50 transition-colors">
                      <Star size={16} className="text-indigo-500" />
                      <span className="text-gray-700 text-sm">生年月日占い</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* ===== LP・ページ作成 ===== */}
              <div>
                <button
                  onClick={() => toggleAccordion('page')}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span className="font-bold text-gray-900 text-sm">LP・ページ作成</span>
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${mobileAccordion === 'page' ? 'rotate-180' : ''}`} />
                </button>
                {mobileAccordion === 'page' && (
                  <div className="ml-4 space-y-0.5 mt-1 border-l-2 border-indigo-100 pl-3">
                    <Link href="/profile/editor" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <UserCircle size={16} className="text-indigo-600" /><span className="text-gray-700 text-sm">プロフィール</span>
                    </Link>
                    <Link href="/business/editor" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Building2 size={16} className="text-indigo-600" /><span className="text-gray-700 text-sm">LPメーカー</span>
                    </Link>
                    <Link href="/webinar/editor" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Video size={16} className="text-indigo-600" /><span className="text-gray-700 text-sm">ウェビナーLP</span>
                    </Link>
                    <Link href="/onboarding/editor" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <MousePointerClick size={16} className="text-indigo-600" /><span className="text-gray-700 text-sm">ガイドメーカー</span>
                    </Link>
                    <Link href="/site/editor" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Globe size={16} className="text-indigo-600" /><span className="text-gray-700 text-sm">ホームページ</span>
                    </Link>
                    <Link href="/order-form/new" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <ClipboardCheck size={16} className="text-indigo-600" /><span className="text-gray-700 text-sm">フォーム</span>
                      <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1 py-0.5 rounded-full">PRO</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* ===== 診断・クイズ作成 ===== */}
              <div>
                <button
                  onClick={() => toggleAccordion('quiz')}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-emerald-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-bold text-gray-900 text-sm">診断・クイズ作成</span>
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${mobileAccordion === 'quiz' ? 'rotate-180' : ''}`} />
                </button>
                {mobileAccordion === 'quiz' && (
                  <div className="ml-4 space-y-0.5 mt-1 border-l-2 border-emerald-100 pl-3">
                    <Link href="/quiz/editor" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Sparkles size={16} className="text-emerald-600" /><span className="text-gray-700 text-sm">診断クイズ</span>
                    </Link>
                    <Link href="/entertainment/create" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <PartyPopper size={16} className="text-emerald-600" /><span className="text-gray-700 text-sm">エンタメ診断</span>
                      <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1 py-0.5 rounded-full">PRO</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* ===== ライティング・制作 ===== */}
              <div>
                <button
                  onClick={() => toggleAccordion('writing')}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-bold text-gray-900 text-sm">ライティング・制作</span>
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${mobileAccordion === 'writing' ? 'rotate-180' : ''}`} />
                </button>
                {mobileAccordion === 'writing' && (
                  <div className="ml-4 space-y-0.5 mt-1 border-l-2 border-amber-100 pl-3">
                    <Link href="/salesletter/editor" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <PenTool size={16} className="text-amber-600" /><span className="text-gray-700 text-sm">セールスライター</span>
                    </Link>
                    <Link href="/thumbnail/editor" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Image size={16} className="text-amber-600" /><span className="text-gray-700 text-sm">サムネイル</span>
                      <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1 py-0.5 rounded-full">PRO</span>
                    </Link>
                    <Link href="/sns-post" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Send size={16} className="text-amber-600" /><span className="text-gray-700 text-sm">SNS投稿</span>
                    </Link>
                    <Link href="/kindle/demo" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Gift size={16} className="text-amber-600" /><span className="text-gray-700 text-sm">Kindle執筆</span>
                    </Link>
                    <Link href="/kindle/discovery/demo" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Lightbulb size={16} className="text-amber-600" /><span className="text-gray-700 text-sm">ネタ発掘</span>
                    </Link>
                    <Link href="/kindle-keywords/editor" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <BookOpen size={16} className="text-amber-600" /><span className="text-gray-700 text-sm">Kindleキーワード</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* ===== 集客・イベント ===== */}
              <div>
                <button
                  onClick={() => toggleAccordion('marketing')}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-cyan-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    <span className="font-bold text-gray-900 text-sm">集客・イベント</span>
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${mobileAccordion === 'marketing' ? 'rotate-180' : ''}`} />
                </button>
                {mobileAccordion === 'marketing' && (
                  <div className="ml-4 space-y-0.5 mt-1 border-l-2 border-cyan-100 pl-3">
                    <Link href="/booking/new" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Calendar size={16} className="text-cyan-600" /><span className="text-gray-700 text-sm">予約メーカー</span>
                    </Link>
                    <Link href="/attendance/new" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <CalendarCheck size={16} className="text-cyan-600" /><span className="text-gray-700 text-sm">出欠メーカー</span>
                    </Link>
                    <Link href="/survey/new" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <ClipboardList size={16} className="text-cyan-600" /><span className="text-gray-700 text-sm">アンケート</span>
                    </Link>
                    <Link href="/newsletter/campaigns/new" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Mail size={16} className="text-cyan-600" /><span className="text-gray-700 text-sm">メルマガ</span>
                      <span className="text-[9px] font-bold text-purple-600 bg-purple-100 px-1 py-0.5 rounded-full">PRO</span>
                    </Link>
                    <Link href="/step-email/sequences/new" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <ListOrdered size={16} className="text-cyan-600" /><span className="text-gray-700 text-sm">ステップメール</span>
                    </Link>
                    <Link href="/funnel/new" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <GitBranch size={16} className="text-cyan-600" /><span className="text-gray-700 text-sm">ファネル</span>
                    </Link>
                    <Link href="/dashboard?view=line" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <MessageCircle size={16} className="text-green-600" /><span className="text-gray-700 text-sm">LINE公式連携</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* ===== リサーチ ===== */}
              <div>
                <button
                  onClick={() => toggleAccordion('research')}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-teal-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                    <span className="font-bold text-gray-900 text-sm">リサーチ</span>
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${mobileAccordion === 'research' ? 'rotate-180' : ''}`} />
                </button>
                {mobileAccordion === 'research' && (
                  <div className="ml-4 space-y-0.5 mt-1 border-l-2 border-teal-100 pl-3">
                    <Link href="/youtube-analysis/editor" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <BarChart3 size={16} className="text-teal-600" /><span className="text-gray-700 text-sm">YouTube競合分析</span>
                    </Link>
                    <Link href="/youtube-keyword-research/editor" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Search size={16} className="text-teal-600" /><span className="text-gray-700 text-sm">YouTubeキーワード</span>
                    </Link>
                    <Link href="/google-keyword-research/editor" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Search size={16} className="text-teal-600" /><span className="text-gray-700 text-sm">Googleキーワード</span>
                    </Link>
                    <Link href="/rakuten-research/editor" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <ShoppingBag size={16} className="text-rose-600" /><span className="text-gray-700 text-sm">楽天リサーチ</span>
                    </Link>
                    <Link href="/niconico-keyword-research/editor" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Tv size={16} className="text-orange-600" /><span className="text-gray-700 text-sm">ニコニコリサーチ</span>
                    </Link>
                    <Link href="/reddit-keyword-research/editor" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Globe size={16} className="text-orange-600" /><span className="text-gray-700 text-sm">Redditリサーチ</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* ===== 収益化・販売 ===== */}
              <div>
                <button
                  onClick={() => toggleAccordion('monetize')}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className="font-bold text-gray-900 text-sm">収益化・販売</span>
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${mobileAccordion === 'monetize' ? 'rotate-180' : ''}`} />
                </button>
                {mobileAccordion === 'monetize' && (
                  <div className="ml-4 space-y-0.5 mt-1 border-l-2 border-purple-100 pl-3">
                    <Link href="/gamification/new" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Gamepad2 size={16} className="text-purple-600" /><span className="text-gray-700 text-sm">ゲーミフィケーション</span>
                    </Link>
                    <Link href="/marketplace" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Store size={16} className="text-purple-600" /><span className="text-gray-700 text-sm">スキルマーケット</span>
                    </Link>
                    <Link href="/affiliate" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Share2 size={16} className="text-purple-600" /><span className="text-gray-700 text-sm">アフィリエイト</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* ===== Kindle出版 ===== */}
              <div>
                <button
                  onClick={() => toggleAccordion('kindle')}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-amber-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-bold text-gray-900 text-sm">Kindle出版</span>
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${mobileAccordion === 'kindle' ? 'rotate-180' : ''}`} />
                </button>
                {mobileAccordion === 'kindle' && (
                  <div className="ml-4 space-y-0.5 mt-1 border-l-2 border-amber-100 pl-3">
                    <Link href="/kindle/lp" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <BookOpen size={16} className="text-amber-600" /><span className="text-gray-700 text-sm">Kindle出版とは</span>
                    </Link>
                    <Link href="/kindle/free-trial" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Gift size={16} className="text-amber-600" />
                      <span className="text-gray-700 text-sm">
                        1章無料お試し
                        <span className="text-[9px] font-bold text-green-600 bg-green-100 px-1 py-0.5 rounded-full ml-1">無料</span>
                      </span>
                    </Link>
                    <Link href="/kindle/discovery/demo" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Lightbulb size={16} className="text-amber-600" />
                      <span className="text-gray-700 text-sm">
                        ネタ発掘診断
                        <span className="text-[9px] font-bold text-green-600 bg-green-100 px-1 py-0.5 rounded-full ml-1">無料</span>
                      </span>
                    </Link>
                    <Link href="/kindle/agency" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Building2 size={16} className="text-amber-600" /><span className="text-gray-700 text-sm">代理店パートナー</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* ===== 区切り線 ===== */}
              <div className="border-t border-gray-100" />

              {/* ===== クイックリンク ===== */}
              <div className="space-y-1">
                <Link href="/tools" onClick={closeMenus}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <LayoutGrid size={18} className="text-gray-500" />
                  <span className="font-medium text-gray-700 text-sm">ツール一覧</span>
                </Link>
                <Link href="/portal" onClick={closeMenus}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <LayoutGrid size={18} className="text-purple-600" />
                  <span className="font-medium text-gray-700 text-sm">作品集（ポータル）</span>
                </Link>
                <Link href="/demos" onClick={closeMenus}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Monitor size={18} className="text-indigo-600" />
                  <span className="font-medium text-gray-700 text-sm">デモ一覧</span>
                </Link>
                <Link href="/announcements" onClick={closeMenus}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Bell size={18} className="text-orange-500" />
                  <span className="font-medium text-gray-700 text-sm">お知らせ</span>
                </Link>
                <Link href="/pricing" onClick={closeMenus}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <Sparkles size={18} className="text-purple-600" />
                  <span className="font-medium text-gray-700 text-sm">料金プラン</span>
                </Link>
                <Link href="/donation" onClick={closeMenus}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 transition-colors">
                  <Heart size={18} className="text-rose-500" />
                  <span className="font-medium text-rose-700 text-sm">開発支援</span>
                </Link>
              </div>

              {/* ===== 活用ガイド ===== */}
              <div>
                <button
                  onClick={() => toggleAccordion('guide')}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <TrendingUp size={18} className="text-orange-500" />
                    <span className="font-bold text-gray-900 text-sm">活用ガイド</span>
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${mobileAccordion === 'guide' ? 'rotate-180' : ''}`} />
                </button>
                {mobileAccordion === 'guide' && (
                  <div className="ml-4 space-y-0.5 mt-1 border-l-2 border-orange-100 pl-3">
                    <Link href="/howto" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <FileText size={16} className="text-blue-500" /><span className="text-gray-700 text-sm">使い方・機能一覧</span>
                    </Link>
                    <Link href="/effective-use" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Lightbulb size={16} className="text-yellow-500" /><span className="text-gray-700 text-sm">効果的な活用法9選</span>
                    </Link>
                    <Link href="/selling-content" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <TrendingUp size={16} className="text-green-500" /><span className="text-gray-700 text-sm">売れるコンテンツの作り方</span>
                    </Link>
                    <div className="pt-1 pb-0.5 px-3">
                      <span className="text-xs font-bold text-gray-400">ジャンル別</span>
                    </div>
                    <Link href="/guide/page-creation" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Globe size={16} className="text-blue-500" /><span className="text-gray-700 text-sm">LP・ページ作成</span>
                    </Link>
                    <Link href="/guide/quiz-diagnosis" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Brain size={16} className="text-indigo-500" /><span className="text-gray-700 text-sm">診断・クイズ</span>
                    </Link>
                    <Link href="/guide/writing" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <PenTool size={16} className="text-emerald-500" /><span className="text-gray-700 text-sm">ライティング・制作</span>
                    </Link>
                    <Link href="/guide/marketing" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Calendar size={16} className="text-blue-500" /><span className="text-gray-700 text-sm">集客・マーケティング</span>
                    </Link>
                    <Link href="/guide/monetization" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Gift size={16} className="text-amber-500" /><span className="text-gray-700 text-sm">収益化・販売</span>
                    </Link>
                    <Link href="/gamification/effective-use" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Gamepad2 size={16} className="text-purple-500" /><span className="text-gray-700 text-sm">ゲーミフィケーション活用法</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* ===== サポート・法的情報 ===== */}
              <div>
                <button
                  onClick={() => toggleAccordion('support')}
                  className="w-full flex items-center justify-between px-3 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle size={18} className="text-gray-500" />
                    <span className="font-bold text-gray-900 text-sm">サポート・法的情報</span>
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${mobileAccordion === 'support' ? 'rotate-180' : ''}`} />
                </button>
                {mobileAccordion === 'support' && (
                  <div className="ml-4 space-y-0.5 mt-1 border-l-2 border-gray-200 pl-3">
                    <Link href="/faq" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <HelpCircle size={16} className="text-gray-400" /><span className="text-gray-600 text-sm">よくある質問</span>
                    </Link>
                    <Link href="/contact" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Mail size={16} className="text-gray-400" /><span className="text-gray-600 text-sm">お問い合わせ</span>
                    </Link>
                    <Link href="/legal" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Scale size={16} className="text-gray-400" /><span className="text-gray-600 text-sm">特定商取引法に基づく表記</span>
                    </Link>
                    <Link href="/privacy" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <Shield size={16} className="text-gray-400" /><span className="text-gray-600 text-sm">プライバシーポリシー</span>
                    </Link>
                    <Link href="/sitemap-html" onClick={closeMenus} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                      <FileText size={16} className="text-gray-400" /><span className="text-gray-600 text-sm">サイトマップ</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* ===== ログアウト ===== */}
              {user && (
                <div className="pt-2 border-t border-gray-100">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 border border-red-200 text-red-600 py-2.5 rounded-xl font-medium hover:bg-red-50 transition-colors text-sm"
                  >
                    <LogOut size={16} />
                    ログアウト
                  </button>
                </div>
              )}

            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
