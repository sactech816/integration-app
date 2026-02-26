'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { supabase, TABLES } from '@/lib/supabase';
import { ServiceType, SERVICE_LABELS } from '@/lib/types';
import { getRelativeTime } from '@/lib/utils';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import {
  Sparkles,
  UserCircle,
  Building2,
  Loader2,
  Eye,
  Calendar,
  ChevronDown,
  Search,
  LayoutGrid,
  TrendingUp,
  Users,
  Star,
  Award,
  MousePointerClick,
  FileText,
  PenTool,
  Gamepad2,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getRandomFeaturedContents, FeaturedContentWithDetails } from '@/app/actions/featured';
import { getPopularContents, PopularContent } from '@/app/actions/ranking';

// 1ページあたりの表示数
const ITEMS_PER_PAGE = 20;

// コンテンツアイテムの型
type PortalItem = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  imageUrl?: string;
  created_at?: string;
  type: ServiceType;
  views_count?: number;
  campaign_type?: string; // ゲーミフィケーション用
};

// ゲーミフィケーションのURLパス取得
const getGamificationPath = (campaignType: string, campaignId: string): string => {
  const pathMap: Record<string, string> = {
    'gacha': 'gacha',
    'fukubiki': 'fukubiki',
    'scratch': 'scratch',
    'slot': 'slot',
    'stamp_rally': 'stamp-rally',
    'login_bonus': 'login-bonus',
  };
  const path = pathMap[campaignType] || 'gacha';
  return `/${path}/${campaignId}`;
};

// タブの定義
const TABS: { type: ServiceType | 'all'; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
  { type: 'all', label: 'すべて', icon: LayoutGrid },
  { type: 'quiz', label: '診断クイズ', icon: Sparkles },
  { type: 'profile', label: 'プロフィールLP', icon: UserCircle },
  { type: 'business', label: 'ビジネスLP', icon: Building2 },
  { type: 'survey', label: 'アンケート', icon: FileText },
  { type: 'salesletter', label: 'セールスレター', icon: PenTool },
  { type: 'gamification', label: 'ゲーミフィケーション', icon: Gamepad2 },
  { type: 'onboarding', label: 'はじめかたガイド', icon: BookOpen },
];

// サービスカラー取得
const getServiceColor = (type: ServiceType) => {
  const colors: Record<string, { bg: string; text: string; border: string; gradient: string; hoverText: string }> = {
    quiz: { 
      bg: 'bg-indigo-50', 
      text: 'text-indigo-600', 
      border: 'border-indigo-200', 
      gradient: 'from-indigo-500 via-purple-500 to-pink-500',
      hoverText: 'group-hover:text-indigo-600'
    },
    profile: { 
      bg: 'bg-emerald-50', 
      text: 'text-emerald-600', 
      border: 'border-emerald-200', 
      gradient: 'from-emerald-400 via-teal-500 to-cyan-500',
      hoverText: 'group-hover:text-emerald-600'
    },
    business: { 
      bg: 'bg-amber-50', 
      text: 'text-amber-600', 
      border: 'border-amber-200', 
      gradient: 'from-amber-400 via-orange-500 to-red-500',
      hoverText: 'group-hover:text-amber-600'
    },
    survey: { 
      bg: 'bg-teal-50', 
      text: 'text-teal-600', 
      border: 'border-teal-200', 
      gradient: 'from-teal-500 via-cyan-500 to-blue-500',
      hoverText: 'group-hover:text-teal-600'
    },
    salesletter: { 
      bg: 'bg-rose-50', 
      text: 'text-rose-600', 
      border: 'border-rose-200', 
      gradient: 'from-rose-500 via-pink-500 to-purple-500',
      hoverText: 'group-hover:text-rose-600'
    },
    gamification: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      gradient: 'from-purple-500 via-pink-500 to-orange-500',
      hoverText: 'group-hover:text-purple-600'
    },
    onboarding: {
      bg: 'bg-orange-50',
      text: 'text-orange-600',
      border: 'border-orange-200',
      gradient: 'from-orange-400 via-amber-500 to-yellow-500',
      hoverText: 'group-hover:text-orange-600'
    }
  };
  return colors[type] || colors.quiz;
};

// サービスアイコン取得
const getServiceIcon = (type: ServiceType) => {
  const icons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
    quiz: Sparkles,
    profile: UserCircle,
    business: Building2,
    survey: FileText,
    salesletter: PenTool,
    gamification: Gamepad2,
    onboarding: BookOpen
  };
  return icons[type] || Sparkles;
};

function PortalPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as ServiceType | 'all') || 'all';

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [selectedTab, setSelectedTab] = useState<ServiceType | 'all'>(initialTab);
  const [items, setItems] = useState<PortalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCounts, setTotalCounts] = useState<Record<ServiceType | 'all', number>>({
    all: 0,
    quiz: 0,
    profile: 0,
    business: 0,
    survey: 0,
    salesletter: 0,
    gamification: 0,
    attendance: 0,
    booking: 0,
    onboarding: 0,
    thumbnail: 0,
  });
  const [featuredContents, setFeaturedContents] = useState<FeaturedContentWithDetails[]>([]);
  const [popularContents, setPopularContents] = useState<PopularContent[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);

  // 認証初期化
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      if (supabase) {
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null);
        });
        subscription = sub;

        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
      }
    };

    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // 累計カウンターテーブルから各サービスの総数を取得（グロス：削除してもカウントダウンしない）
  const fetchTotalCounts = useCallback(async () => {
    if (!supabase) return;

    try {
      const { data, error } = await supabase
        .from('content_creation_counts')
        .select('content_type, total_count');

      if (error) {
        console.error('Count fetch error:', error);
        return;
      }

      if (data) {
        // content_typeをキーにしてカウントを取得
        const counts = data.reduce((acc, row) => {
          acc[row.content_type] = row.total_count;
          return acc;
        }, {} as Record<string, number>);

        setTotalCounts({
          all: Object.values(counts).reduce((a, b) => a + b, 0),
          quiz: counts.quiz || 0,
          profile: counts.profile || 0,
          business: counts.lp || 0,  // LP = business_projects
          survey: counts.survey || 0,
          booking: counts.booking || 0,
          attendance: counts.attendance || 0,
          salesletter: counts.salesletter || 0,
          gamification: counts.game || 0,
          onboarding: counts.onboarding || 0,
          thumbnail: counts.thumbnail || 0,
        });
      }
    } catch (error) {
      console.error('Count fetch error:', error);
    }
  }, []);

  // コンテンツ取得
  const fetchItems = useCallback(async (reset = false) => {
    if (!supabase) return;

    const currentPage = reset ? 0 : page;
    if (reset) {
      setIsLoading(true);
      setPage(0);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const allItems: PortalItem[] = [];
      const offset = currentPage * ITEMS_PER_PAGE;

      // クイズ取得（show_in_portalがtrueのもののみ）
      if (selectedTab === 'all' || selectedTab === 'quiz') {
        const { data: quizzes } = await supabase
          .from(TABLES.QUIZZES)
          .select('id, slug, title, description, image_url, created_at, views_count')
          .eq('show_in_portal', true)
          .order('created_at', { ascending: false })
          .range(offset, offset + ITEMS_PER_PAGE - 1);

        if (quizzes) {
          allItems.push(...quizzes.map((q) => ({
            id: String(q.id),
            slug: q.slug,
            title: q.title,
            description: q.description,
            imageUrl: q.image_url,
            created_at: q.created_at,
            type: 'quiz' as ServiceType,
            views_count: q.views_count
          })));
        }
      }

      // プロフィールLP取得（settings.showInPortalがfalseでないもの）
      if (selectedTab === 'all' || selectedTab === 'profile') {
        const { data: profiles } = await supabase
          .from(TABLES.PROFILES)
          .select('id, slug, nickname, content, settings, created_at')
          .eq('featured_on_top', true)
          .order('created_at', { ascending: false })
          .range(offset, offset + ITEMS_PER_PAGE - 1);

        if (profiles) {
          // settings.showInPortalがfalseでないものだけをフィルタリング
          const filteredProfiles = profiles.filter(p => p.settings?.showInPortal !== false);
          
          allItems.push(...filteredProfiles.map((p) => {
            const headerBlock = p.content?.find((b: { type: string }) => b.type === 'header');
            return {
              id: p.id,
              slug: p.slug,
              title: headerBlock?.data?.name || p.nickname || 'プロフィール',
              description: headerBlock?.data?.title || '',
              imageUrl: headerBlock?.data?.avatar,
              created_at: p.created_at,
              type: 'profile' as ServiceType
            };
          }));
        }
      }

      // ビジネスLP取得（settings.showInPortalがfalseでないもの）
      if (selectedTab === 'all' || selectedTab === 'business') {
        const { data: businessLps } = await supabase
          .from('business_projects')
          .select('id, slug, settings, content, created_at')
          .order('created_at', { ascending: false })
          .range(offset, offset + ITEMS_PER_PAGE - 1);

        if (businessLps) {
          // settings.showInPortalがfalseでないものだけをフィルタリング
          const filteredBusinessLps = businessLps.filter(b => b.settings?.showInPortal !== false);
          
          allItems.push(...filteredBusinessLps.map((b) => {
            // ヘッダーブロックを探す（名前・タイトル情報）
            const headerBlock = b.content?.find((block: { type: string }) => block.type === 'header');
            // ヒーローブロックを探す（背景画像・ヘッドライン）
            const heroBlock = b.content?.find((block: { type: string }) => 
              block.type === 'hero' || block.type === 'hero_fullwidth'
            );
            
            // タイトル優先順位: settings.title > header.name > hero.headline > settings.name
            const title = b.settings?.title 
              || headerBlock?.data?.name 
              || heroBlock?.data?.headline 
              || b.settings?.name
              || 'ビジネスLP';
            
            // 説明文優先順位: settings.description > header.title > hero.subheadline
            const description = b.settings?.description 
              || headerBlock?.data?.title 
              || heroBlock?.data?.subheadline 
              || '';
            
            // 画像優先順位: header.avatar > hero.backgroundImage > hero.imageUrl
            const imageUrl = headerBlock?.data?.avatar 
              || heroBlock?.data?.backgroundImage 
              || heroBlock?.data?.imageUrl;
            
            return {
              id: b.id,
              slug: b.slug,
              title,
              description,
              imageUrl,
              created_at: b.created_at,
              type: 'business' as ServiceType
            };
          }));
        }
      }

      // アンケート取得（show_in_portalがtrueのもののみ）
      if (selectedTab === 'all' || selectedTab === 'survey') {
        const { data: surveys } = await supabase
          .from('surveys')
          .select('id, slug, title, description, created_at')
          .eq('show_in_portal', true)
          .order('created_at', { ascending: false })
          .range(offset, offset + ITEMS_PER_PAGE - 1);

        if (surveys) {
          allItems.push(...surveys.map((s) => ({
            id: String(s.id),
            slug: s.slug,
            title: s.title,
            description: s.description,
            imageUrl: undefined,
            created_at: s.created_at,
            type: 'survey' as ServiceType,
            views_count: 0
          })));
        }
      }

      // セールスレター取得（settings.showInPortalがfalseでないもの）
      if (selectedTab === 'all' || selectedTab === 'salesletter') {
        const { data: salesLetters } = await supabase
          .from('sales_letters')
          .select('id, slug, title, settings, created_at, views_count')
          .order('created_at', { ascending: false })
          .range(offset, offset + ITEMS_PER_PAGE - 1);

        if (salesLetters) {
          // settings.showInPortalがfalseでないものだけをフィルタリング
          const filteredSalesLetters = salesLetters.filter(s => s.settings?.showInPortal !== false);
          
          allItems.push(...filteredSalesLetters.map((s) => ({
            id: s.id,
            slug: s.slug,
            title: s.title || 'セールスレター',
            description: s.settings?.description || '',
            imageUrl: undefined,
            created_at: s.created_at,
            type: 'salesletter' as ServiceType,
            views_count: s.views_count
          })));
        }
      }

      // ゲーミフィケーション取得（statusがactiveのもの）
      if (selectedTab === 'all' || selectedTab === 'gamification') {
        const { data: gamifications } = await supabase
          .from('gamification_campaigns')
          .select('id, title, description, campaign_type, settings, created_at')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .range(offset, offset + ITEMS_PER_PAGE - 1);

        if (gamifications) {
          // settings.showInPortalがfalseでないものだけをフィルタリング
          const filteredGamifications = gamifications.filter(g => g.settings?.showInPortal !== false);
          
          allItems.push(...filteredGamifications.map((g) => ({
            id: g.id,
            slug: g.id, // ゲーミフィケーションはIDをslugとして使用
            title: g.title,
            description: g.description || '',
            imageUrl: undefined,
            created_at: g.created_at,
            type: 'gamification' as ServiceType,
            views_count: 0,
            campaign_type: g.campaign_type
          })));
        }
      }

      // はじめかたガイド取得（show_in_portalがtrueのもののみ）
      if (selectedTab === 'all' || selectedTab === 'onboarding') {
        const { data: onboardings } = await supabase
          .from('onboarding_modals')
          .select('id, slug, title, description, created_at')
          .eq('show_in_portal', true)
          .order('created_at', { ascending: false })
          .range(offset, offset + ITEMS_PER_PAGE - 1);

        if (onboardings) {
          allItems.push(...onboardings.map((o) => ({
            id: String(o.id),
            slug: o.slug,
            title: o.title || 'はじめかたガイド',
            description: o.description,
            imageUrl: undefined,
            created_at: o.created_at,
            type: 'onboarding' as ServiceType,
            views_count: 0
          })));
        }
      }

      // 作成日時でソート
      allItems.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      });

      // 表示件数を制限
      const limitedItems = allItems.slice(0, ITEMS_PER_PAGE);

      if (reset) {
        setItems(limitedItems);
      } else {
        setItems(prev => [...prev, ...limitedItems]);
      }

      setHasMore(limitedItems.length === ITEMS_PER_PAGE);
      if (!reset) {
        setPage(currentPage + 1);
      }
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [selectedTab, page]);

  // タブ変更時
  useEffect(() => {
    fetchItems(true);
    fetchTotalCounts();
    
    // URLを更新
    const newUrl = selectedTab === 'all' ? '/portal' : `/portal?tab=${selectedTab}`;
    router.replace(newUrl, { scroll: false });
  }, [selectedTab, fetchTotalCounts, router]);

  // ピックアップコンテンツを取得
  const loadFeaturedContents = useCallback(async () => {
    setLoadingFeatured(true);
    try {
      const result = await getRandomFeaturedContents(3);
      console.log('[Portal] Featured contents API result:', result);
      if (result.success && result.data) {
        setFeaturedContents(result.data);
      } else {
        setFeaturedContents([]);
      }
    } catch (error) {
      console.error('[Portal] Featured contents fetch error:', error);
      setFeaturedContents([]);
    } finally {
      setLoadingFeatured(false);
    }
  }, []);

  // 初回読み込み
  useEffect(() => {
    fetchTotalCounts();
    loadFeaturedContents();
  }, [fetchTotalCounts, loadFeaturedContents]);

  // 人気ランキングを取得（タブ変更時）
  const loadPopularContents = async (type: ServiceType) => {
    setLoadingPopular(true);
    try {
      const result = await getPopularContents(type, 3, 30);
      if (result.success && result.data) {
        setPopularContents(result.data);
      }
    } catch (error) {
      console.error('Popular contents fetch error:', error);
    } finally {
      setLoadingPopular(false);
    }
  };

  // タブ変更時に人気ランキングを更新
  useEffect(() => {
    loadPopularContents(selectedTab === 'all' ? 'quiz' : selectedTab);
  }, [selectedTab]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const navigateTo = (path: string) => {
    if (path === '/' || path === '') {
      window.location.href = '/';
    } else {
      window.location.href = `/${path}`;
    }
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      setPage(prev => prev + 1);
      fetchItems(false);
    }
  };

  // 検索フィルター
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        setPage={navigateTo}
        user={user}
        onLogout={handleLogout}
        setShowAuth={setShowAuth}
      />

      <AuthModal
        isOpen={showAuth}
        onClose={() => setShowAuth(false)}
        setUser={setUser}
        isPasswordReset={showPasswordReset}
        setShowPasswordReset={setShowPasswordReset}
        onNavigate={navigateTo}
      />

      {/* ヒーローセクション */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <LayoutGrid size={20} className="text-yellow-300" />
              <span className="font-bold">ポータル</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
              みんなの
              <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                作品
              </span>
              を見る
            </h1>
            <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
              集客メーカーで作成された診断クイズ・プロフィールLP・ビジネスLPを<br className="hidden sm:block" />
              チェックしてインスピレーションを得よう
            </p>

            {/* 統計（累計作成数） */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-center">
              <div className="min-w-[60px]">
                <div className="text-2xl sm:text-3xl font-black">{totalCounts.all.toLocaleString()}</div>
                <div className="text-xs sm:text-sm opacity-80">総作品数</div>
              </div>
              <div className="min-w-[60px]">
                <div className="text-2xl sm:text-3xl font-black">{totalCounts.quiz.toLocaleString()}</div>
                <div className="text-xs sm:text-sm opacity-80">クイズ</div>
              </div>
              <div className="min-w-[60px]">
                <div className="text-2xl sm:text-3xl font-black">{totalCounts.profile.toLocaleString()}</div>
                <div className="text-xs sm:text-sm opacity-80">プロフィール</div>
              </div>
              <div className="min-w-[60px]">
                <div className="text-2xl sm:text-3xl font-black">{totalCounts.business.toLocaleString()}</div>
                <div className="text-xs sm:text-sm opacity-80">LP</div>
              </div>
              <div className="min-w-[60px]">
                <div className="text-2xl sm:text-3xl font-black">{totalCounts.survey.toLocaleString()}</div>
                <div className="text-xs sm:text-sm opacity-80">アンケート</div>
              </div>
              <div className="min-w-[60px]">
                <div className="text-2xl sm:text-3xl font-black">{totalCounts.booking.toLocaleString()}</div>
                <div className="text-xs sm:text-sm opacity-80">予約</div>
              </div>
              <div className="min-w-[60px]">
                <div className="text-2xl sm:text-3xl font-black">{totalCounts.attendance.toLocaleString()}</div>
                <div className="text-xs sm:text-sm opacity-80">出欠</div>
              </div>
              <div className="min-w-[60px]">
                <div className="text-2xl sm:text-3xl font-black">{totalCounts.salesletter.toLocaleString()}</div>
                <div className="text-xs sm:text-sm opacity-80">セールスレター</div>
              </div>
              <div className="min-w-[60px]">
                <div className="text-2xl sm:text-3xl font-black">{totalCounts.gamification.toLocaleString()}</div>
                <div className="text-xs sm:text-sm opacity-80">ゲーム</div>
              </div>
              <div className="min-w-[60px]">
                <div className="text-2xl sm:text-3xl font-black">{totalCounts.onboarding.toLocaleString()}</div>
                <div className="text-xs sm:text-sm opacity-80">ガイド</div>
              </div>
            </div>
          </div>
        </div>

        {/* 波形装飾 */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 80L60 70C120 60 240 40 360 30C480 20 600 20 720 25C840 30 960 40 1080 45C1200 50 1320 50 1380 50L1440 50V80H1380C1320 80 1200 80 1080 80C960 80 840 80 720 80C600 80 480 80 360 80C240 80 120 80 60 80H0Z"
              fill="#f9fafb"
            />
          </svg>
        </div>
      </section>

      {/* 今月のトピックセクション */}
      {featuredContents.length > 0 && (
        <section className="bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-4 py-2 rounded-full mb-4">
                <Star size={20} className="text-yellow-300" />
                <span className="font-bold">今月のトピック</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
                注目のコンテンツ
              </h2>
              <p className="text-gray-600">
                おすすめのコンテンツをピックアップしました
              </p>
            </div>

            {loadingFeatured ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-purple-600" size={32} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredContents.map((item) => {
                  const Icon = getServiceIcon(item.content_type);
                  const colors = getServiceColor(item.content_type);

                  return (
                    <Link
                      key={item.id}
                      href={`/${item.content_type}/${item.slug}`}
                      className="group bg-white rounded-2xl border-2 border-purple-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 relative"
                    >
                      {/* ピックアップバッジ */}
                      <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-lg">
                        <Sparkles size={12} />
                        PICK UP
                      </div>

                      {/* サムネイル */}
                      <div className={`aspect-[16/10] bg-gradient-to-br ${colors.gradient} relative overflow-hidden`}>
                        {item.imageUrl ? (
                          <>
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                              <Icon size={32} className="text-white" />
                            </div>
                          </div>
                        )}
                        {/* タイプバッジ */}
                        <div className={`absolute bottom-3 right-3 ${colors.bg} ${colors.text} px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm`}>
                          <Icon size={12} />
                          {SERVICE_LABELS[item.content_type]}
                        </div>
                      </div>

                      {/* コンテンツ */}
                      <div className="p-5">
                        <h3 className={`font-bold text-xl mb-2 line-clamp-2 text-gray-900 ${colors.hoverText} transition-colors`}>
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                          {item.views_count !== undefined && item.views_count > 0 && (
                            <span className="flex items-center gap-1.5 font-bold">
                              <Eye size={12} />
                              {item.views_count.toLocaleString()} 回表示
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 人気ランキングセクション */}
      <section className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full mb-4">
              <Award size={20} className="text-yellow-300" />
              <span className="font-bold">人気ランキング</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2">
              {SERVICE_LABELS[selectedTab === 'all' ? 'quiz' : selectedTab]} TOP3
            </h2>
            <p className="text-gray-600">
              過去30日間で最も人気のあるコンテンツ
            </p>
          </div>

          {loadingPopular ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-orange-600" size={32} />
            </div>
          ) : popularContents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              まだランキングデータがありません
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {popularContents.map((item, index) => {
                const Icon = getServiceIcon(item.type);
                const colors = getServiceColor(item.type);
                const rankEmoji = index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉';
                const rankColor = index === 0 ? 'from-yellow-400 to-yellow-600' : index === 1 ? 'from-gray-300 to-gray-500' : 'from-orange-400 to-orange-600';

                return (
                  <Link
                    key={item.id}
                    href={`/${item.type}/${item.slug}`}
                    className="group flex items-center gap-4 bg-gradient-to-r from-gray-50 to-white p-5 rounded-2xl border-2 border-gray-200 hover:border-orange-300 hover:shadow-lg transition-all"
                  >
                    {/* ランキングバッジ */}
                    <div className={`flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-br ${rankColor} flex items-center justify-center text-white font-black text-2xl shadow-lg`}>
                      {rankEmoji}
                    </div>

                    {/* サムネイル */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center`}>
                          <Icon size={24} className="text-white" />
                        </div>
                      )}
                    </div>

                    {/* コンテンツ情報 */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-bold text-lg mb-1 line-clamp-1 text-gray-900 group-hover:${colors.text} transition-colors`}>
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1 font-bold">
                          <Eye size={12} />
                          {item.views_count.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1 font-bold">
                          <MousePointerClick size={12} />
                          {item.clicks_count.toLocaleString()}
                        </span>
                        {item.completions_count !== undefined && item.completions_count > 0 && (
                          <span className="flex items-center gap-1 font-bold text-green-600">
                            <TrendingUp size={12} />
                            {item.completions_count.toLocaleString()} 完了
                          </span>
                        )}
                      </div>
                    </div>

                    {/* スコア表示 */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-2xl font-black text-orange-600">
                        {item.popularityScore.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 font-bold">
                        スコア
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* タブ & 検索 */}
      <section className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* クイックナビゲーション */}
          <div className="py-3 border-b border-gray-100">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mb-1">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider flex-shrink-0 mr-1">クイックリンク:</span>
              <Link
                href="/tools"
                className="text-xs font-medium text-indigo-600 hover:text-white hover:bg-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md flex-shrink-0 flex items-center gap-1.5 transition-colors"
              >
                <LayoutGrid size={13} />
                全ツール一覧
              </Link>
              <Link
                href="/howto"
                className="text-xs font-medium text-indigo-600 hover:text-white hover:bg-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md flex-shrink-0 transition-colors"
              >
                使い方ガイド
              </Link>
              <Link
                href="/faq"
                className="text-xs font-medium text-indigo-600 hover:text-white hover:bg-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md flex-shrink-0 transition-colors"
              >
                よくある質問
              </Link>
              <Link
                href="/effective-use"
                className="text-xs font-medium text-indigo-600 hover:text-white hover:bg-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-md flex-shrink-0 transition-colors"
              >
                効果的な活用法
              </Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-3">
            {/* タブ */}
            <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide lg:flex-wrap lg:overflow-x-visible">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = selectedTab === tab.type;
                const count = totalCounts[tab.type];

                return (
                  <button
                    key={tab.type}
                    onClick={() => setSelectedTab(tab.type)}
                    className={`
                      flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all border
                      ${isActive
                        ? 'bg-gray-900 text-white shadow-md border-gray-900'
                        : 'bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300 border-gray-200'
                      }
                    `}
                  >
                    <Icon size={15} className={isActive ? 'text-white' : 'text-gray-400'} />
                    <span>{tab.label}</span>
                    <span className={`text-xs font-semibold ml-0.5 px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* 検索 */}
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="タイトルで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-60 pl-9 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm transition-shadow hover:shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* コンテンツ一覧 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-purple-600" size={48} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LayoutGrid size={40} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? '検索結果がありません' : 'まだ作品がありません'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? '別のキーワードで検索してみてください' : '最初の作品を作成してみましょう！'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigateTo('')}
                className="inline-flex items-center gap-2 bg-purple-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors"
              >
                作成する
              </button>
            )}
          </div>
        ) : (
          <>
            {/* グリッド */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => {
                const Icon = getServiceIcon(item.type);
                const colors = getServiceColor(item.type);
                // ゲーミフィケーションの場合はcampaign_typeに基づいてURLを生成
                const itemHref = item.type === 'gamification' && item.campaign_type
                  ? getGamificationPath(item.campaign_type, item.id)
                  : `/${item.type}/${item.slug}`;

                return (
                  <Link
                    key={`${item.type}-${item.id}`}
                    href={itemHref}
                    className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-gray-200"
                  >
                    {/* サムネイル */}
                    <div className={`aspect-[16/10] bg-gradient-to-br ${colors.gradient} relative overflow-hidden`}>
                      {item.imageUrl ? (
                        <>
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          {/* オーバーレイ */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </>
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Icon size={32} className="text-white" />
                          </div>
                          <span className="text-white/80 text-sm font-medium">
                            {SERVICE_LABELS[item.type]}
                          </span>
                        </div>
                      )}
                      {/* タイプバッジ */}
                      <div className={`absolute top-3 left-3 ${colors.bg} ${colors.text} px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm`}>
                        <Icon size={12} />
                        {SERVICE_LABELS[item.type]}
                      </div>
                    </div>

                    {/* コンテンツ */}
                    <div className="p-5">
                      <h3 className={`font-bold text-gray-900 text-lg mb-2 line-clamp-2 ${colors.hoverText} transition-colors`}>
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={12} />
                          {item.created_at ? getRelativeTime(item.created_at) : '日付不明'}
                        </span>
                        {item.views_count !== undefined && item.views_count > 0 && (
                          <span className="flex items-center gap-1.5">
                            <Eye size={12} />
                            {item.views_count.toLocaleString()} 回表示
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* もっと見る */}
            {hasMore && !searchQuery && (
              <div className="text-center mt-12">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 bg-white text-gray-700 font-bold px-8 py-4 rounded-full border-2 border-gray-200 hover:border-purple-300 hover:text-purple-600 transition-all disabled:opacity-50"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      読み込み中...
                    </>
                  ) : (
                    <>
                      <ChevronDown size={20} />
                      もっと見る
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* SEOテキスト・カテゴリ説明（内部リンク強化） */}
      <section className="py-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            集客メーカーで作れるコンテンツ
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <article className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-bold text-lg text-indigo-700 mb-2">診断クイズ</h3>
              <p className="text-sm text-gray-600 mb-3">
                性格診断・タイプ診断・心理テストをAIで自動生成。SNSでシェアされやすい診断コンテンツで集客を加速します。
              </p>
              <div className="flex gap-3">
                <Link href="/portal?tab=quiz" className="text-sm font-semibold text-indigo-600 hover:underline">
                  クイズ一覧
                </Link>
                <Link href="/quiz/demo" className="text-sm font-semibold text-indigo-600 hover:underline">
                  デモを見る
                </Link>
              </div>
            </article>
            <article className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-bold text-lg text-emerald-700 mb-2">プロフィールLP</h3>
              <p className="text-sm text-gray-600 mb-3">
                SNSリンクをまとめたプロフィールページを簡単作成。lit.linkやLinktreeの代替として、自分だけのプロフィールサイトを公開。
              </p>
              <div className="flex gap-3">
                <Link href="/portal?tab=profile" className="text-sm font-semibold text-emerald-600 hover:underline">
                  プロフィール一覧
                </Link>
                <Link href="/profile/demo" className="text-sm font-semibold text-emerald-600 hover:underline">
                  デモを見る
                </Link>
              </div>
            </article>
            <article className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-bold text-lg text-amber-700 mb-2">ビジネスLP</h3>
              <p className="text-sm text-gray-600 mb-3">
                商品・サービス紹介のランディングページを作成。PASONA・AIDMAなどのマーケティングフレームワークに対応しています。
              </p>
              <div className="flex gap-3">
                <Link href="/portal?tab=business" className="text-sm font-semibold text-amber-600 hover:underline">
                  LP一覧
                </Link>
                <Link href="/business/demo" className="text-sm font-semibold text-amber-600 hover:underline">
                  デモを見る
                </Link>
              </div>
            </article>
            <article className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-bold text-lg text-teal-700 mb-2">アンケート</h3>
              <p className="text-sm text-gray-600 mb-3">
                顧客満足度調査・イベントアンケートを作成。Googleフォームの代替として、リアルタイム集計・結果分析が可能です。
              </p>
              <div className="flex gap-3">
                <Link href="/portal?tab=survey" className="text-sm font-semibold text-teal-600 hover:underline">
                  アンケート一覧
                </Link>
                <Link href="/survey/demo/customer-satisfaction" className="text-sm font-semibold text-teal-600 hover:underline">
                  デモを見る
                </Link>
              </div>
            </article>
            <article className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-bold text-lg text-rose-700 mb-2">セールスレター</h3>
              <p className="text-sm text-gray-600 mb-3">
                商品販売・告知用のセールスレターを作成。AIによる文章生成支援で、効果的なコピーライティングが可能です。
              </p>
              <Link href="/portal?tab=salesletter" className="text-sm font-semibold text-rose-600 hover:underline">
                セールスレター一覧
              </Link>
            </article>
            <article className="p-6 bg-gray-50 rounded-xl">
              <h3 className="font-bold text-lg text-purple-700 mb-2">ゲーミフィケーション</h3>
              <p className="text-sm text-gray-600 mb-3">
                ガチャ・福引き・スクラッチ・スロット・スタンプラリーなどの集客ゲームを作成。来店促進・リピート集客に活用できます。
              </p>
              <div className="flex gap-3">
                <Link href="/portal?tab=gamification" className="text-sm font-semibold text-purple-600 hover:underline">
                  ゲーム一覧
                </Link>
                <Link href="/gamification" className="text-sm font-semibold text-purple-600 hover:underline">
                  詳しく見る
                </Link>
              </div>
            </article>
          </div>
          <div className="mt-8 text-center">
            <Link href="/tools" className="text-sm font-semibold text-indigo-600 hover:underline">
              全ツール一覧を見る →
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-black mb-4">
            あなたも作品を公開しよう
          </h2>
          <p className="text-lg opacity-90 mb-8">
            診断クイズ・プロフィールLP・ビジネスLPを<br className="sm:hidden" />
            無料で作成できます
          </p>
          <button
            onClick={() => navigateTo('')}
            className="inline-flex items-center justify-center gap-2 bg-white text-purple-600 font-bold px-8 py-4 rounded-full text-lg hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <Sparkles size={22} />
            無料で作成する
          </button>
        </div>
      </section>

      <Footer setPage={navigateTo} />
    </div>
  );
}

export default function PortalPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    }>
      <PortalPageContent />
    </Suspense>
  );
}

