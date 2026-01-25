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
  Monitor
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // ESCキーでメニューを閉じる
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsServiceMenuOpen(false);
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleNav = (page: string) => {
    setIsMenuOpen(false);
    setIsServiceMenuOpen(false);
    setIsUserMenuOpen(false);
    
    // 直接ルーティング
    if (page === '/' || page === '') {
      router.push('/');
    } else if (page === 'create') {
      // ホームのcreate-sectionにスクロール
      if (typeof window !== 'undefined' && window.location.pathname === '/') {
        document.getElementById('create-section')?.scrollIntoView({ behavior: 'smooth' });
      } else {
        router.push('/#create-section');
      }
    } else {
      router.push(`/${page}`);
    }
  };

  const handleCreate = (service?: ServiceType) => {
    setIsMenuOpen(false);
    if (service) {
      router.push(`/${service}/editor`);
    } else {
      handleNav('create');
    }
  };

  const handleLogout = () => {
    onLogout();
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  const services = [
    { id: 'quiz' as ServiceType, label: '診断クイズ', icon: Sparkles, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'profile' as ServiceType, label: 'プロフィールLP', icon: UserCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'business' as ServiceType, label: 'ビジネスLP', icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  // アンケート専用（ServiceTypeに含まれない）
  const surveyService = { id: 'survey', label: 'アンケート（投票）', icon: ClipboardList, color: 'text-teal-600', bg: 'bg-teal-50' };

  // ゲーミフィケーション
  const gamificationService = { id: 'gamification', label: 'ゲーミフィケーション', icon: Gamepad2, color: 'text-purple-600', bg: 'bg-purple-50' };

  return (
    <>
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-[100]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        {/* 左側: ロゴ */}
        <div 
          className="font-bold text-xl flex items-center gap-2 cursor-pointer group shrink-0"
          onClick={() => handleNav('/')}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
            <Magnet className="text-white" size={18} />
          </div>
          <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent group-hover:from-red-600 group-hover:to-pink-600 transition-all font-black text-base sm:text-xl">
            集客メーカー
          </span>
        </div>

        {/* 中央のスペーサー */}
        <div className="flex-1" />

        {/* 右側: ナビゲーション + アクション */}
        <div className="flex items-center gap-3">
          {/* PC版ナビゲーション */}
          <nav className="hidden lg:flex items-center gap-1 mr-4">
            {/* 新規作成ドロップダウン */}
            <div 
              className="relative"
              onMouseEnter={() => setIsServiceMenuOpen(true)}
              onMouseLeave={() => setIsServiceMenuOpen(false)}
            >
              <button 
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg px-3 py-2 transition-all"
              >
                <PlusCircle size={18} />
                <span>新規作成</span>
                <ChevronDown size={14} className={`transition-transform ${isServiceMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isServiceMenuOpen && (
                <>
                  {/* ボタンとメニューの間の透明なブリッジ */}
                  <div className="absolute top-full left-0 w-full h-2" />
                  <div className="absolute top-full left-0 pt-2 w-56 z-[120]">
                    <div className="bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fade-in">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleCreate(service.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className={`p-2 rounded-lg ${service.bg}`}>
                          <service.icon size={18} className={service.color} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{service.label}</div>
                          <div className="text-xs text-gray-500">新規作成</div>
                        </div>
                      </button>
                    ))}
                    {/* 予約・日程調整 */}
                    <button
                      onClick={() => { setIsServiceMenuOpen(false); router.push('/booking/new'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-t border-gray-100"
                    >
                      <div className="p-2 rounded-lg bg-blue-50">
                        <Calendar size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">予約・日程調整</div>
                        <div className="text-xs text-gray-500">新規作成</div>
                      </div>
                    </button>
                    {/* アンケート */}
                    <button
                      onClick={() => { setIsServiceMenuOpen(false); router.push('/survey/new'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${surveyService.bg}`}>
                        <surveyService.icon size={18} className={surveyService.color} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{surveyService.label}</div>
                        <div className="text-xs text-gray-500">新規作成</div>
                      </div>
                    </button>
                    {/* ゲーミフィケーション */}
                    <button
                      onClick={() => { setIsServiceMenuOpen(false); router.push('/gamification/new'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <div className={`p-2 rounded-lg ${gamificationService.bg}`}>
                        <gamificationService.icon size={18} className={gamificationService.color} />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{gamificationService.label}</div>
                        <div className="text-xs text-gray-500">ガチャ・スタンプラリー等</div>
                      </div>
                    </button>
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

            <button 
              onClick={() => handleNav('kindle/lp')} 
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-amber-600 hover:bg-amber-50 rounded-lg px-3 py-2 transition-all"
            >
              <BookOpen size={16} />
              <span>Kindle出版</span>
            </button>

            <button 
              onClick={() => handleNav('demos')} 
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg px-3 py-2 transition-all"
            >
              <Monitor size={16} />
              <span>デモ一覧</span>
            </button>

            <button 
              onClick={() => handleNav('portal')} 
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg px-3 py-2 transition-all"
            >
              <LayoutGrid size={16} />
              <span>作品集</span>
            </button>

            <button 
              onClick={() => handleNav('announcements')} 
              className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg px-3 py-2 transition-all"
            >
              <Bell size={16} />
              <span>お知らせ</span>
            </button>
          </nav>

          {/* PC版ユーザーアクション */}
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
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[120] animate-fade-in">
                    {/* メールアドレス表示 */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-xs text-gray-500">ログイン中</p>
                      <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                    </div>

                    <button
                      onClick={() => handleNav('dashboard')}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <LayoutDashboard size={18} className="text-gray-500" />
                      <span className="font-medium text-gray-700">マイページ</span>
                    </button>

                    <button
                      onClick={() => { setIsUserMenuOpen(false); router.push('/survey'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    >
                      <ClipboardList size={18} className="text-teal-500" />
                      <span className="font-medium text-gray-700">アンケート（投票）管理</span>
                    </button>

                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={18} className="text-red-500" />
                        <span className="font-medium text-red-600">ログアウト</span>
                      </button>
                    </div>
                  </div>
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

      {/* メニュー - headerの外に配置してスタッキングコンテキストの問題を回避 */}
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
                    <button
                      key={service.id}
                      onClick={() => handleCreate(service.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl ${service.bg} transition-all hover:scale-[1.02]`}
                    >
                      <service.icon size={24} className={service.color} />
                      <div className="text-left">
                        <div className={`font-bold ${service.color}`}>{service.label}</div>
                        <div className="text-xs text-gray-500">新規作成</div>
                      </div>
                    </button>
                  ))}
                  {/* 予約・日程調整 */}
                  <button
                    onClick={() => { setIsMenuOpen(false); router.push('/booking/new'); }}
                    className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 transition-all hover:scale-[1.02]"
                  >
                    <Calendar size={24} className="text-blue-600" />
                    <div className="text-left">
                      <div className="font-bold text-blue-600">予約・日程調整</div>
                      <div className="text-xs text-gray-500">新規作成</div>
                    </div>
                  </button>
                  {/* アンケート */}
                  <button
                    onClick={() => { setIsMenuOpen(false); router.push('/survey/new'); }}
                    className={`flex items-center gap-3 p-4 rounded-xl ${surveyService.bg} transition-all hover:scale-[1.02]`}
                  >
                    <surveyService.icon size={24} className={surveyService.color} />
                    <div className="text-left">
                      <div className={`font-bold ${surveyService.color}`}>{surveyService.label}</div>
                      <div className="text-xs text-gray-500">新規作成</div>
                    </div>
                  </button>
                  {/* ゲーミフィケーション */}
                  <button
                    onClick={() => { setIsMenuOpen(false); router.push('/gamification/new'); }}
                    className={`flex items-center gap-3 p-4 rounded-xl ${gamificationService.bg} transition-all hover:scale-[1.02]`}
                  >
                    <gamificationService.icon size={24} className={gamificationService.color} />
                    <div className="text-left">
                      <div className={`font-bold ${gamificationService.color}`}>{gamificationService.label}</div>
                      <div className="text-xs text-gray-500">ガチャ・スタンプラリー等</div>
                    </div>
                  </button>
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
                  <button 
                    onClick={() => handleNav('/')} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Home size={20} className="text-gray-500" />
                    <span className="font-medium text-gray-700">トップページ</span>
                  </button>
                  <button 
                    onClick={() => handleNav('portal')} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-colors"
                  >
                    <LayoutGrid size={20} className="text-purple-600" />
                    <div className="text-left">
                      <span className="font-medium text-purple-700">作品集（ポータル）</span>
                      <p className="text-xs text-gray-500">みんなの作品を見る</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleNav('demos')} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 transition-colors"
                  >
                    <Monitor size={20} className="text-indigo-600" />
                    <div className="text-left">
                      <span className="font-medium text-indigo-700">デモ一覧</span>
                      <p className="text-xs text-gray-500">テンプレートを見る</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleNav('kindle/lp')} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 transition-colors"
                  >
                    <BookOpen size={20} className="text-amber-600" />
                    <div className="text-left">
                      <span className="font-medium text-amber-700">Kindle出版</span>
                      <p className="text-xs text-gray-500">AIでKindle本を執筆</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleNav('announcements')} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Bell size={20} className="text-gray-500" />
                    <span className="font-medium text-gray-700">お知らせ</span>
                  </button>
                  <button 
                    onClick={() => handleNav('howto')} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FileText size={20} className="text-gray-500" />
                    <span className="font-medium text-gray-700">使い方・機能一覧</span>
                  </button>
                  <button 
                    onClick={() => handleNav('tools')} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <LayoutGrid size={20} className="text-gray-500" />
                    <span className="font-medium text-gray-700">ツール一覧</span>
                  </button>
                  <button 
                    onClick={() => handleNav('sitemap-html')} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FileText size={20} className="text-gray-500" />
                    <span className="font-medium text-gray-700">サイトマップ</span>
                  </button>
                  <button 
                    onClick={() => handleNav('faq')} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <HelpCircle size={20} className="text-gray-500" />
                    <span className="font-medium text-gray-700">よくある質問</span>
                  </button>
                </div>
              </div>

              {/* 集客ノウハウ */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TrendingUp size={12} className="text-orange-500" />
                  集客ノウハウ
                </p>
                <div className="space-y-1">
                  <button 
                    onClick={() => handleNav('effective-use')} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-colors"
                  >
                    <Lightbulb size={20} className="text-yellow-500" />
                    <div className="text-left">
                      <span className="font-medium text-gray-700">効果的な活用法9選</span>
                      <p className="text-xs text-gray-500">集客効果を最大化するヒント</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleNav('selling-content')} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-colors"
                  >
                    <TrendingUp size={20} className="text-green-500" />
                    <div className="text-left">
                      <span className="font-medium text-gray-700">売れるコンテンツの作り方</span>
                      <p className="text-xs text-gray-500">心理トリガーを押さえた鉄板ロジック</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => handleNav('gamification/effective-use')} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 transition-colors"
                  >
                    <Gamepad2 size={20} className="text-purple-500" />
                    <div className="text-left">
                      <span className="font-medium text-gray-700">ゲーミフィケーション活用法</span>
                      <p className="text-xs text-gray-500">エンゲージメントを高める</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Kindleコンテンツ */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <BookOpen size={12} className="text-amber-500" />
                  Kindleコンテンツ
                </p>
                <div className="space-y-1">
                  <button 
                    onClick={() => handleNav('kindle/lp')} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <BookOpen size={20} className="text-amber-500" />
                    <span className="font-medium text-gray-700">Kindle出版LP</span>
                  </button>
                  <button 
                    onClick={() => handleNav('kindle/agency')} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Building2 size={20} className="text-blue-500" />
                    <span className="font-medium text-gray-700">代理店パートナー募集</span>
                  </button>
                </div>
              </div>

              {/* 開発支援・サポート */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">応援・サポート</p>
                <div className="space-y-1">
                  <button 
                    onClick={() => handleNav('donation')} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 transition-colors"
                  >
                    <Heart size={20} className="text-rose-500" />
                    <div className="text-left">
                      <span className="font-medium text-rose-700">❤️ 開発支援・サポート</span>
                      <p className="text-xs text-gray-500">サービスの運営を応援する</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* サポート */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">サポート・規約</p>
                <div className="space-y-1">
                  <button 
                    onClick={() => handleNav('contact')} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Mail size={20} className="text-gray-500" />
                    <span className="font-medium text-gray-700">お問い合わせ</span>
                  </button>
                  <button 
                    onClick={() => handleNav('legal')} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Scale size={18} className="text-gray-400" />
                    <span className="text-gray-600">特定商取引法に基づく表記</span>
                  </button>
                  <button 
                    onClick={() => handleNav('privacy')} 
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Shield size={18} className="text-gray-400" />
                    <span className="text-gray-600">プライバシーポリシー</span>
                  </button>
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
                  <button 
                    onClick={() => handleNav('dashboard')} 
                    className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-3 rounded-xl font-bold hover:bg-orange-700 transition-colors"
                  >
                      <LayoutDashboard size={20} />
                      マイページ
                    </button>
                    <button 
                      onClick={() => { setIsMenuOpen(false); router.push('/survey'); }}
                      className="w-full flex items-center justify-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 py-3 rounded-xl font-bold hover:bg-teal-100 transition-colors"
                    >
                      <ClipboardList size={20} />
                      アンケート（投票）管理
                    </button>
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
