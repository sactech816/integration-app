'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase, TABLES } from '@/lib/supabase';
import { getAdminEmails } from '@/lib/constants';
import { ServiceType, SERVICE_LABELS, Quiz, Profile, BusinessLP, Block } from '@/lib/types';
import { formatDate, getRelativeTime, generateSlug } from '@/lib/utils';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import { getAnalytics, getMultipleAnalytics } from '@/app/actions/analytics';
import { getUserPurchases, hasProAccess, getAllUsersWithRoles, setPartnerStatus, checkIsPartner } from '@/app/actions/purchases';
import { getFeaturedContents, addFeaturedContent, removeFeaturedContent, FeaturedContent } from '@/app/actions/featured';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  Sparkles,
  UserCircle,
  Building2,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  MoreVertical,
  Search,
  Loader2,
  BarChart3,
  Eye,
  Calendar,
  Link as LinkIcon,
  User,
  LogOut,
  Trophy,
  Table,
  BarChart2,
  Heart,
  MessageCircle,
  Layout,
  Users,
  Play,
  Code,
  Lock,
  Download,
  ShoppingCart,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Bell,
  X,
  FileSpreadsheet,
  Upload,
  Star,
  CheckSquare,
  Square
} from 'lucide-react';

// ページネーション設定
const ITEMS_PER_PAGE = 9;
const ANNOUNCEMENTS_PER_PAGE = 5;

// 拡張コンテンツアイテム型
type ContentItem = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  type: ServiceType;
  user_id?: string | null;
  // 診断クイズ固有
  views_count?: number;
  completions_count?: number;
  clicks_count?: number;
  layout?: string;
  collect_email?: boolean;
  color?: string;
  image_url?: string;
  // プロフィール/ビジネスLP固有
  content?: Block[];
  settings?: {
    theme?: {
      gradient?: string;
      backgroundImage?: string;
    };
  };
  // アナリティクス追加項目
  readRate?: number;
  avgTimeSpent?: number;
  clickRate?: number;
};

// アナリティクスデータ型
type AnalyticsData = {
  views: number;
  clicks: number;
  completions: number;
  avgScrollDepth: number;
  avgTimeSpent: number;
  readRate: number;
  clickRate: number;
};

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceType>('quiz');
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'table'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [purchases, setPurchases] = useState<string[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [analyticsMap, setAnalyticsMap] = useState<Record<string, AnalyticsData>>({});
  const [proAccessMap, setProAccessMap] = useState<Record<string, { hasAccess: boolean; reason?: string }>>({});

  // お知らせ管理用のステート（管理者のみ）
  const [announcements, setAnnouncements] = useState<Array<{
    id: number;
    title: string;
    content: string;
    link_url?: string;
    link_text?: string;
    is_active: boolean;
    announcement_date?: string;
    service_type: string;
    created_at: string;
  }>>([]);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<typeof announcements[0] | null>(null);
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    link_url: '',
    link_text: '',
    is_active: true,
    announcement_date: '',
    service_type: 'all'
  });
  const [announcementPage, setAnnouncementPage] = useState(1);

  // ユーザーエクスポート用のステート（管理者のみ）
  const [exportingCsv, setExportingCsv] = useState(false);
  const [exportingSheets, setExportingSheets] = useState(false);

  // ピックアップコンテンツ管理用のステート（管理者のみ）
  const [featuredContents, setFeaturedContents] = useState<FeaturedContent[]>([]);
  const [showFeaturedManager, setShowFeaturedManager] = useState(false);
  const [featuredService, setFeaturedService] = useState<ServiceType>('quiz');
  const [featuredSearch, setFeaturedSearch] = useState('');
  const [selectedForFeatured, setSelectedForFeatured] = useState<Set<string>>(new Set());
  const [loadingFeatured, setLoadingFeatured] = useState(false);

  // ユーザー管理用のステート（管理者のみ）
  const [allUsers, setAllUsers] = useState<Array<{
    user_id: string;
    email: string;
    is_partner: boolean;
    partner_since: string | null;
    partner_note: string | null;
    user_created_at: string;
    total_purchases: number;
    total_donated: number;
  }>>([]);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [partnerNote, setPartnerNote] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);

  // 管理者かどうかを判定
  const adminEmails = getAdminEmails();
  const isAdmin = user?.email && adminEmails.some(email =>
    user.email?.toLowerCase() === email.toLowerCase()
  );

  // プロフィール名を取得（content配列からheaderブロックを探す）
  const getProfileName = (profile: Profile | BusinessLP): string => {
    if (!profile.content || !Array.isArray(profile.content)) {
      return (profile as BusinessLP).title || `プロフィール ${profile.slug}`;
    }
    const headerBlock = profile.content.find((b: Block) => b.type === 'header');
    if (headerBlock && headerBlock.type === 'header') {
      return headerBlock.data.name || (profile as BusinessLP).title || `プロフィール ${profile.slug}`;
    }
    return (profile as BusinessLP).title || `プロフィール ${profile.slug}`;
  };

  // コンテンツ取得
  const fetchContents = useCallback(async () => {
    if (!supabase || !user) return;

    setIsLoading(true);
    const allContents: ContentItem[] = [];

    try {
      // 診断クイズ取得
      if (selectedService === 'quiz') {
        const query = isAdmin
          ? supabase.from(TABLES.QUIZZES).select('*').order('created_at', { ascending: false })
          : supabase.from(TABLES.QUIZZES).select('*').eq('user_id', user.id).order('created_at', { ascending: false });

        const { data: quizzes } = await query;
        if (quizzes) {
          allContents.push(...quizzes.map((q: Quiz) => ({
            ...q,
            id: String(q.id),
            title: q.title,
            type: 'quiz' as ServiceType,
            user_id: q.user_id,
            views_count: q.views_count || 0,
            completions_count: q.completions_count || 0,
            clicks_count: q.clicks_count || 0,
          })));
        }
      }

      // プロフィールLP取得
      if (selectedService === 'profile') {
        const query = isAdmin
          ? supabase.from(TABLES.PROFILES).select('*').order('created_at', { ascending: false })
          : supabase.from(TABLES.PROFILES).select('*').eq('user_id', user.id).order('created_at', { ascending: false });

        const { data: profiles } = await query;
        if (profiles) {
          // アナリティクスを取得（ViewTrackerはidでイベントを保存しているためidで取得）
          const profileIds = profiles.map((p: Profile) => p.id);
          console.log('[Dashboard] Fetching analytics for profile IDs:', profileIds);
          
          const analyticsResults = await getMultipleAnalytics(profileIds, 'profile');
          console.log('[Dashboard] Analytics results:', analyticsResults);
          
          const analyticsMapObj: Record<string, AnalyticsData> = {};
          analyticsResults.forEach((result) => {
            analyticsMapObj[result.contentId] = result.analytics;
          });
          console.log('[Dashboard] Analytics map:', analyticsMapObj);
          setAnalyticsMap(prev => ({ ...prev, ...analyticsMapObj }));

          allContents.push(...profiles.map((p: Profile) => {
            const analytics = analyticsMapObj[p.id];
            return {
              id: p.id,
              slug: p.slug,
              title: getProfileName(p),
              created_at: p.created_at,
              updated_at: p.updated_at,
              type: 'profile' as ServiceType,
              user_id: p.user_id,
              content: p.content,
              settings: p.settings,
              views_count: analytics?.views || 0,
              clicks_count: analytics?.clicks || 0,
              readRate: analytics?.readRate || 0,
              avgTimeSpent: analytics?.avgTimeSpent || 0,
              clickRate: analytics?.clickRate || 0,
            };
          }));
        }
      }

      // ビジネスLP取得
      if (selectedService === 'business') {
        const query = isAdmin
          ? supabase.from(TABLES.BUSINESS_LPS).select('*').order('created_at', { ascending: false })
          : supabase.from(TABLES.BUSINESS_LPS).select('*').eq('user_id', user.id).order('created_at', { ascending: false });

        const { data: businessLps } = await query;
        if (businessLps) {
          // アナリティクスを取得（ViewTrackerはslugでイベントを保存しているためslugで取得）
          const businessSlugs = businessLps.map((b: BusinessLP) => b.slug);
          console.log('[Dashboard] Fetching analytics for business slugs:', businessSlugs);
          
          const analyticsResults = await getMultipleAnalytics(businessSlugs, 'business');
          console.log('[Dashboard] Business analytics results:', analyticsResults);
          
          const analyticsMapObj: Record<string, AnalyticsData> = {};
          analyticsResults.forEach((result) => {
            analyticsMapObj[result.contentId] = result.analytics;
          });
          console.log('[Dashboard] Business analytics map:', analyticsMapObj);
          setAnalyticsMap(prev => ({ ...prev, ...analyticsMapObj }));

          allContents.push(...businessLps.map((b: BusinessLP) => {
            const analytics = analyticsMapObj[b.slug];
            return {
              id: b.id,
              slug: b.slug,
              title: getProfileName(b),
              description: b.description,
              created_at: b.created_at,
              updated_at: b.updated_at,
              type: 'business' as ServiceType,
              user_id: b.user_id,
              content: b.content,
              settings: b.settings,
              views_count: analytics?.views || 0,
              clicks_count: analytics?.clicks || 0,
              readRate: analytics?.readRate || 0,
              avgTimeSpent: analytics?.avgTimeSpent || 0,
              clickRate: analytics?.clickRate || 0,
            };
          }));
        }
      }

      // 作成日時でソート
      allContents.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      });

      setContents(allContents);
      setCurrentPage(1);
      
      // アクセス権を確認
      await fetchProAccessForContents(allContents);
    } catch (error) {
      console.error('Contents fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedService, isAdmin, fetchProAccessForContents]);

  // 購入履歴を取得
  const fetchPurchases = useCallback(async () => {
    if (!user) return;
    try {
      const purchaseData = await getUserPurchases(user.id);
      setPurchases(purchaseData.map(p => p.content_id));
    } catch (error) {
      console.error('Purchases fetch error:', error);
    }
  }, [user]);

  // Pro機能のアクセス権を確認
  const fetchProAccessForContents = useCallback(async (contentItems: ContentItem[]) => {
    if (!user) return;
    
    const accessMap: Record<string, { hasAccess: boolean; reason?: string }> = {};
    
    for (const item of contentItems) {
      try {
        const result = await hasProAccess(
          user.id,
          user.email,
          item.id,
          item.type,
          item.user_id || undefined
        );
        accessMap[item.id] = result;
      } catch (error) {
        console.error(`[Dashboard] Check access for ${item.id}:`, error);
        accessMap[item.id] = { hasAccess: false };
      }
    }
    
    setProAccessMap(accessMap);
  }, [user]);

  // お知らせを取得（管理者のみ）
  const fetchAnnouncements = useCallback(async () => {
    if (!supabase || !isAdmin) return;
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAnnouncements(data || []);
    } catch (e) {
      console.error('お知らせの取得エラー:', e);
    }
  }, [isAdmin]);

  // 初期化
  useEffect(() => {
    const init = async () => {
      if (supabase) {
        supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null);
          if (!session?.user) {
            setShowAuth(true);
          }
        });

        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        if (!session?.user) {
          setShowAuth(true);
        }
      }
      setIsLoading(false);
    };

    init();
  }, []);

  // ユーザーまたはフィルター変更時にコンテンツ取得
  useEffect(() => {
    if (user) {
      fetchContents();
      fetchPurchases();
    }
  }, [user, selectedService, fetchContents, fetchPurchases]);

  // 管理者の場合、お知らせを取得
  useEffect(() => {
    if (isAdmin) {
      fetchAnnouncements();
      fetchFeaturedContents();
    }
  }, [isAdmin, fetchAnnouncements]);

  // ピックアップコンテンツを取得
  const fetchFeaturedContents = async () => {
    if (!isAdmin) return;
    try {
      const result = await getFeaturedContents();
      if (result.success && result.data) {
        setFeaturedContents(result.data);
      }
    } catch (error) {
      console.error('Featured contents fetch error:', error);
    }
  };

  // ピックアップに追加
  const handleAddFeatured = async () => {
    if (!isAdmin || selectedForFeatured.size === 0) return;
    
    setLoadingFeatured(true);
    try {
      const promises = Array.from(selectedForFeatured).map(contentId => 
        addFeaturedContent(contentId, featuredService)
      );
      
      const results = await Promise.all(promises);
      const successCount = results.filter(r => r.success).length;
      const failedCount = results.length - successCount;
      
      if (successCount > 0) {
        alert(`${successCount}件をピックアップに追加しました${failedCount > 0 ? `（${failedCount}件は追加できませんでした）` : ''}`);
        await fetchFeaturedContents();
        setSelectedForFeatured(new Set());
      } else {
        alert('ピックアップの追加に失敗しました');
      }
    } catch (error) {
      console.error('Add featured error:', error);
      alert('エラーが発生しました');
    } finally {
      setLoadingFeatured(false);
    }
  };

  // ピックアップから削除
  const handleRemoveFeatured = async (id: string) => {
    if (!isAdmin) return;
    if (!confirm('ピックアップから削除しますか？')) return;
    
    try {
      const result = await removeFeaturedContent(id);
      if (result.success) {
        alert('ピックアップから削除しました');
        await fetchFeaturedContents();
      } else {
        alert('削除に失敗しました: ' + result.error);
      }
    } catch (error) {
      console.error('Remove featured error:', error);
      alert('エラーが発生しました');
    }
  };

  // チェックボックストグル
  const toggleFeaturedSelection = (contentId: string) => {
    const newSet = new Set(selectedForFeatured);
    if (newSet.has(contentId)) {
      newSet.delete(contentId);
    } else {
      if (featuredContents.length + newSet.size >= 10) {
        alert('ピックアップは最大10件までです');
        return;
      }
      newSet.add(contentId);
    }
    setSelectedForFeatured(newSet);
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
      window.location.href = '/';
    }
  };

  // CSVエクスポート機能（管理者のみ）
  const handleExportCsv = async () => {
    if (!confirm('全ユーザー情報をCSVでダウンロードしますか？')) return;
    setExportingCsv(true);

    try {
      if (!supabase) throw new Error('Supabaseが設定されていません');

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('認証トークンが取得できません');
      }

      const response = await fetch('/api/export-users-csv', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'CSVエクスポートに失敗しました');
      }

      // CSVファイルをダウンロード
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      alert('CSVファイルをダウンロードしました！');
    } catch (error) {
      console.error('CSV export error:', error);
      alert('CSVエクスポートエラー: ' + (error instanceof Error ? error.message : '不明なエラー'));
    } finally {
      setExportingCsv(false);
    }
  };

  // Googleスプレッドシートエクスポート機能（管理者のみ）
  const handleExportSheets = async () => {
    if (!confirm('全ユーザー情報をGoogleスプレッドシートに送信しますか？')) return;
    setExportingSheets(true);

    try {
      if (!supabase) throw new Error('Supabaseが設定されていません');

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error('認証トークンが取得できません');
      }

      const response = await fetch('/api/export-users-sheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Googleスプレッドシートへの送信に失敗しました');
      }

      const result = await response.json();
      alert(`Googleスプレッドシートに${result.users_count}件のユーザー情報を送信しました！`);
    } catch (error) {
      console.error('Google Sheets export error:', error);
      alert('Googleスプレッドシートエクスポートエラー: ' + (error instanceof Error ? error.message : '不明なエラー'));
    } finally {
      setExportingSheets(false);
    }
  };

  // ユーザー一覧を取得（管理者のみ）
  const fetchAllUsers = async () => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    try {
      const result = await getAllUsersWithRoles();
      if (result.error) {
        console.error('[Dashboard] Fetch users error:', result.error);
        alert('ユーザー一覧の取得に失敗しました: ' + result.error);
      } else {
        setAllUsers(result.users);
      }
    } catch (error) {
      console.error('[Dashboard] Fetch users error:', error);
      alert('ユーザー一覧の取得に失敗しました');
    } finally {
      setLoadingUsers(false);
    }
  };

  // パートナーステータスを切り替え（管理者のみ）
  const handleTogglePartner = async (userId: string, currentStatus: boolean, note: string = '') => {
    if (!isAdmin) return;
    
    const newStatus = !currentStatus;
    const confirmMessage = newStatus 
      ? 'このユーザーを応援パートナーに設定しますか？\n設定すると、このユーザーが作成した全コンテンツでPro機能が利用可能になります。'
      : 'このユーザーの応援パートナー設定を解除しますか？';
    
    if (!confirm(confirmMessage)) return;

    try {
      const result = await setPartnerStatus(userId, newStatus, note || undefined);
      if (result.success) {
        alert(newStatus ? 'パートナーに設定しました' : 'パートナー設定を解除しました');
        await fetchAllUsers(); // 再読み込み
        setEditingUserId(null);
        setPartnerNote('');
      } else {
        alert('エラー: ' + (result.error || '不明なエラー'));
      }
    } catch (error) {
      console.error('[Dashboard] Toggle partner error:', error);
      alert('パートナー設定の変更に失敗しました');
    }
  };

  const navigateTo = (page: string) => {
    if (page === '/' || page === '') {
      window.location.href = '/';
    } else {
      window.location.href = `/${page}`;
    }
  };

  const handleEdit = (item: ContentItem) => {
    window.location.href = `/${item.type}/editor?id=${item.slug}`;
  };

  const handleView = (item: ContentItem) => {
    // 別タブで開く
    window.open(`/${item.type}/${item.slug}`, '_blank');
  };

  // HTMLダウンロード機能（管理者のみ）
  const handleDownloadHtml = async (item: ContentItem) => {
    try {
      // ページのHTMLを取得
      const pageUrl = `${window.location.origin}/${item.type}/${item.slug}`;
      const response = await fetch(pageUrl);
      if (!response.ok) throw new Error('ページの取得に失敗しました');
      let html = await response.text();
      
      // 相対パスを絶対パスに変換
      const baseUrl = window.location.origin;
      html = html.replace(/href="\//g, `href="${baseUrl}/`);
      html = html.replace(/src="\//g, `src="${baseUrl}/`);
      
      const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.title || item.slug}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      alert('HTMLをダウンロードしました！');
    } catch (error) {
      console.error('Download error:', error);
      alert('HTMLのダウンロードに失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
    }
  };

  const handleCopyUrl = (item: ContentItem) => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/${item.type}/${item.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (item: ContentItem) => {
    if (!supabase) return;

    const tableMap = {
      quiz: TABLES.QUIZZES,
      profile: TABLES.PROFILES,
      business: TABLES.BUSINESS_LPS
    };

    try {
      const { error } = await supabase
        .from(tableMap[item.type])
        .delete()
        .eq('id', item.type === 'quiz' ? parseInt(item.id) : item.id);

      if (error) throw error;

      setContents(prev => prev.filter(c => c.id !== item.id));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Delete error:', error);
      alert('削除中にエラーが発生しました');
    }
  };

  // 複製機能
  const handleDuplicate = async (item: ContentItem) => {
    if (!supabase || !user) return;
    if (!confirm(`「${item.title}」を複製しますか？`)) return;

    try {
      const newSlug = generateSlug();
      const tableMap = {
        quiz: TABLES.QUIZZES,
        profile: TABLES.PROFILES,
        business: TABLES.BUSINESS_LPS
      };

      if (item.type === 'quiz') {
        // クイズの元データを取得
        const { data: originalQuiz } = await supabase
          .from(TABLES.QUIZZES)
          .select('*')
          .eq('id', parseInt(item.id))
          .single();

        if (originalQuiz) {
          const { error } = await supabase.from(TABLES.QUIZZES).insert([{
            user_id: user.id,
            title: `${originalQuiz.title} のコピー`,
            description: originalQuiz.description,
            questions: originalQuiz.questions,
            results: originalQuiz.results,
            category: originalQuiz.category,
            mode: originalQuiz.mode,
            layout: originalQuiz.layout,
            color: originalQuiz.color,
            image_url: originalQuiz.image_url,
            collect_email: originalQuiz.collect_email,
            slug: newSlug
          }]);
          if (error) throw error;
        }
      } else {
        const { error } = await supabase.from(tableMap[item.type]).insert([{
          user_id: user.id,
          content: item.content,
          slug: newSlug,
          settings: item.settings
        }]);
        if (error) throw error;
      }

      alert('複製しました！');
      await fetchContents();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '不明なエラー';
      alert('複製エラー: ' + errorMessage);
    }
  };

  // 埋め込みコード生成
  const handleEmbed = (item: ContentItem, isUnlocked: boolean) => {
    if (!isUnlocked) return alert("この機能を利用するには、寄付（購入）によるロック解除が必要です。");
    const url = `${window.location.origin}/${item.type}/${item.slug}`;
    const code = `<iframe src="${url}" width="100%" height="600" style="border:none; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);"></iframe>`;
    navigator.clipboard.writeText(code);
    alert('埋め込みコードをコピーしました！\n\nWordPressなどの「カスタムHTML」ブロックに貼り付けてください。');
  };

  // 機能開放/寄付
  const handlePurchase = async (item: ContentItem) => {
    const inputPrice = window.prompt(`「${item.title}」のPro機能を開放します。\n\n応援・寄付金額を入力してください（100円〜100,000円）。`, "1000");
    if (inputPrice === null) return;
    const price = parseInt(inputPrice, 10);
    if (isNaN(price) || price < 100 || price > 100000) {
      alert("金額は 100円以上、100,000円以下 の半角数字で入力してください。");
      return;
    }

    setProcessingId(item.id);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: item.id,
          contentType: item.type,
          amount: price,
          metadata: {
            contentTitle: item.title,
            userId: user?.id,
            email: user?.email
          }
        }),
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('決済URLの取得に失敗しました');
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '不明なエラー';
      alert('エラー: ' + errorMessage);
      setProcessingId(null);
    }
  };

  // お知らせ送信
  const handleAnnouncementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !isAdmin) return;

    try {
      const payload = {
        title: announcementForm.title,
        content: announcementForm.content,
        link_url: announcementForm.link_url || null,
        link_text: announcementForm.link_text || null,
        is_active: announcementForm.is_active,
        announcement_date: announcementForm.announcement_date || null,
        service_type: announcementForm.service_type || 'all'
      };

      if (editingAnnouncement) {
        const { error } = await supabase
          .from('announcements')
          .update(payload)
          .eq('id', editingAnnouncement.id);
        if (error) throw error;
        alert('お知らせを更新しました');
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert([payload]);
        if (error) throw error;
        alert('お知らせを作成しました');
      }

      setShowAnnouncementForm(false);
      setEditingAnnouncement(null);
      setAnnouncementForm({
        title: '',
        content: '',
        link_url: '',
        link_text: '',
        is_active: true,
        announcement_date: '',
        service_type: 'all'
      });
      await fetchAnnouncements();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '不明なエラー';
      alert('エラー: ' + errorMessage);
    }
  };

  // お知らせ編集
  const handleEditAnnouncement = (announcement: typeof announcements[0]) => {
    setEditingAnnouncement(announcement);
    const displayDate = announcement.announcement_date
      ? new Date(announcement.announcement_date).toISOString().split('T')[0]
      : (announcement.created_at ? new Date(announcement.created_at).toISOString().split('T')[0] : '');
    setAnnouncementForm({
      title: announcement.title,
      content: announcement.content,
      link_url: announcement.link_url || '',
      link_text: announcement.link_text || '',
      is_active: announcement.is_active,
      announcement_date: displayDate,
      service_type: announcement.service_type || 'all'
    });
    setShowAnnouncementForm(true);
  };

  // お知らせ削除
  const handleDeleteAnnouncement = async (id: number) => {
    if (!confirm('本当に削除しますか？')) return;
    if (!supabase || !isAdmin) return;

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      if (error) throw error;
      alert('削除しました');
      await fetchAnnouncements();
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '不明なエラー';
      alert('削除エラー: ' + errorMessage);
    }
  };

  // 検索フィルター
  const filteredContents = contents.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ページネーション計算
  const totalPages = Math.ceil(filteredContents.length / ITEMS_PER_PAGE);
  const paginatedContents = filteredContents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // お知らせページネーション
  const totalAnnouncementPages = Math.ceil(announcements.length / ANNOUNCEMENTS_PER_PAGE);
  const paginatedAnnouncements = announcements.slice(
    (announcementPage - 1) * ANNOUNCEMENTS_PER_PAGE,
    announcementPage * ANNOUNCEMENTS_PER_PAGE
  );

  // グラフデータ生成
  const graphData = filteredContents.map(item => ({
    name: item.title.length > 10 ? item.title.substring(0, 10) + '...' : item.title,
    views: item.views_count || 0,
    completions: item.completions_count || 0,
    clicks: item.clicks_count || 0
  }));

  // サービスアイコン取得
  const getServiceIcon = (type: ServiceType) => {
    const icons = {
      quiz: Sparkles,
      profile: UserCircle,
      business: Building2
    };
    return icons[type];
  };

  // サービスカラー取得
  const getServiceColor = (type: ServiceType) => {
    const colors = {
      quiz: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200', gradient: 'from-indigo-500 to-purple-600' },
      profile: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200', gradient: 'from-emerald-500 to-teal-600' },
      business: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200', gradient: 'from-amber-500 to-orange-600' }
    };
    return colors[type];
  };

  // ページネーションコンポーネント
  const Pagination = ({ currentPage: cp, totalPages: tp, onPageChange, label }: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    label: string;
  }) => {
    if (tp <= 1) return null;
    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => onPageChange(cp - 1)}
          disabled={cp === 1}
          className={`p-2 rounded-lg transition-colors ${cp === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          <ChevronLeft size={18} />
        </button>
        <div className="flex items-center gap-1">
          {Array.from({ length: tp }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 rounded-lg text-sm font-bold transition-colors ${cp === page
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          onClick={() => onPageChange(cp + 1)}
          disabled={cp === tp}
          className={`p-2 rounded-lg transition-colors ${cp === tp
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          <ChevronRight size={18} />
        </button>
        <span className="text-xs text-gray-500 ml-2">
          {label} {cp} / {tp} ページ
        </span>
      </div>
    );
  };

  // 統計サマリー計算
  const totalViews = filteredContents.reduce((acc, item) => acc + (item.views_count || 0), 0);

  // 各サービスのコンテンツ数を計算（選択前でも表示用）
  const [contentCounts, setContentCounts] = useState<Record<ServiceType, number>>({
    quiz: 0,
    profile: 0,
    business: 0
  });

  // すべてのコンテンツ数を取得
  const fetchAllContentCounts = useCallback(async () => {
    if (!supabase || !user) return;

    try {
      // 診断クイズ数
      const quizQuery = isAdmin
        ? supabase.from(TABLES.QUIZZES).select('id', { count: 'exact', head: true })
        : supabase.from(TABLES.QUIZZES).select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      const { count: quizCount } = await quizQuery;

      // プロフィールLP数
      const profileQuery = isAdmin
        ? supabase.from(TABLES.PROFILES).select('id', { count: 'exact', head: true })
        : supabase.from(TABLES.PROFILES).select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      const { count: profileCount } = await profileQuery;

      // ビジネスLP数
      const businessQuery = isAdmin
        ? supabase.from(TABLES.BUSINESS_LPS).select('id', { count: 'exact', head: true })
        : supabase.from(TABLES.BUSINESS_LPS).select('id', { count: 'exact', head: true }).eq('user_id', user.id);
      const { count: businessCount } = await businessQuery;

      setContentCounts({
        quiz: quizCount || 0,
        profile: profileCount || 0,
        business: businessCount || 0
      });
    } catch (error) {
      console.error('Content counts fetch error:', error);
    }
  }, [user, isAdmin]);

  // ユーザー変更時にコンテンツ数を取得
  useEffect(() => {
    if (user) {
      fetchAllContentCounts();
    }
  }, [user, fetchAllContentCounts]);

  if (!user && !isLoading) {
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
          onNavigate={navigateTo}
        />
        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">ログインが必要です</h1>
          <p className="text-gray-600 mb-8">マイページを表示するにはログインしてください</p>
          <button
            onClick={() => setShowAuth(true)}
            className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            ログイン
          </button>
        </div>
        <Footer setPage={navigateTo} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
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
        onNavigate={navigateTo}
      />

      <div className="max-w-6xl mx-auto py-12 px-4">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            <BarChart3 /> マイページ
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => navigateTo('quiz/editor')}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2 transition-colors text-sm"
              >
                <Sparkles size={16} /> 診断クイズ
              </button>
              <button
                onClick={() => navigateTo('profile/editor')}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2 transition-colors text-sm"
              >
                <UserCircle size={16} /> プロフィールLP
              </button>
              <button
                onClick={() => navigateTo('business/editor')}
                className="bg-amber-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-amber-700 flex items-center gap-2 transition-colors text-sm"
              >
                <Building2 size={16} /> ビジネスLP
              </button>
            </div>
            <button onClick={handleLogout} className="text-gray-500 hover:text-red-500 font-bold flex items-center gap-1 text-sm">
              <LogOut size={16} /> ログアウト
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* 左カラム：ログイン情報 + 寄付 */}
          <div className="lg:col-span-1 space-y-4">
            {/* ユーザー情報 */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-4 mb-4">
                <div className="bg-indigo-100 p-3 rounded-full text-indigo-600"><User size={24} /></div>
                <div>
                  <p className="text-xs text-gray-500 font-bold">ログイン中 {isAdmin && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] ml-1">ADMIN</span>}</p>
                  <p className="text-sm font-bold text-gray-900 break-all">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-gray-50 px-3 py-2 rounded-lg">
                  <div className="text-xl font-extrabold text-indigo-600">{filteredContents.length}</div>
                  <div className="text-[10px] text-gray-500 font-bold">作成数</div>
                </div>
                <div className="bg-gray-50 px-3 py-2 rounded-lg">
                  <div className="text-xl font-extrabold text-green-600">{totalViews}</div>
                  <div className="text-[10px] text-gray-500 font-bold">総PV数</div>
                </div>
              </div>
            </div>

            {/* 管理者専用：ユーザー情報エクスポート */}
            {isAdmin && (
              <div className="bg-gradient-to-br from-red-50 to-orange-50 p-5 rounded-2xl shadow-sm border-2 border-red-200">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileSpreadsheet size={18} className="text-red-600" />
                  <span>ユーザー情報エクスポート</span>
                  <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">ADMIN</span>
                </h3>
                <p className="text-xs text-gray-600 mb-4">
                  全ユーザーの登録情報をエクスポートできます
                </p>
                <div className="space-y-2">
                  <button
                    onClick={handleExportCsv}
                    disabled={exportingCsv}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exportingCsv ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>ダウンロード中...</span>
                      </>
                    ) : (
                      <>
                        <Download size={16} />
                        <span>CSVダウンロード</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleExportSheets}
                    disabled={exportingSheets}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {exportingSheets ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>送信中...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} />
                        <span>スプレッドシートに送信</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
                  ※スプレッドシート連携には環境変数<br />
                  <code className="bg-white px-1 py-0.5 rounded text-[9px]">GOOGLE_SHEETS_WEBHOOK_URL</code><br />
                  の設定が必要です
                </p>
              </div>
            )}

            {/* みんなの作品を見るボタン */}
            <button
              onClick={() => {
                const demoUrls = {
                  quiz: '/quiz/demo',
                  profile: '/profile/demo',
                  business: '/business/demo'
                };
                window.open(demoUrls[selectedService], '_blank');
              }}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-3"
            >
              <div className="bg-white/20 p-2 rounded-full">
                <Users size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">みんなの作品を見る</p>
                <p className="text-xs text-white/80">{SERVICE_LABELS[selectedService]}のデモ一覧</p>
              </div>
            </button>

            {/* 寄付・サポートへのリンク */}
            <button
              onClick={() => navigateTo('donation')}
              className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-3"
            >
              <div className="bg-white/20 p-2 rounded-full">
                <Heart size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm">サービスを応援する</p>
                <p className="text-xs text-white/80">寄付・サポートはこちら</p>
              </div>
            </button>
          </div>

          {/* 右カラム：サービス選択 + アクセス解析 */}
          <div className="lg:col-span-2 space-y-4">
            {/* サービス選択タブ（横並び） */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex gap-3">
                {(['quiz', 'profile', 'business'] as ServiceType[]).map((type) => {
                  const Icon = getServiceIcon(type);
                  const colors = getServiceColor(type);
                  const count = contentCounts[type];

                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedService(type);
                        setCurrentPage(1);
                      }}
                      className={`flex-1 p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${selectedService === type
                        ? `${colors.bg} ${colors.border}`
                        : 'bg-white border-gray-100 hover:border-gray-200'
                        }`}
                    >
                      <div className={`p-1.5 rounded-lg ${colors.bg}`}>
                        <Icon size={16} className={colors.text} />
                      </div>
                      <p className="font-bold text-gray-900 text-sm">{SERVICE_LABELS[type]}</p>
                      <div className={`text-lg font-extrabold ${colors.text}`}>{count}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* アクセス解析 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 min-h-[350px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-700 flex items-center gap-2"><Trophy size={18} /> アクセス解析</h3>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button onClick={() => setViewMode('graph')} className={`p-1.5 rounded ${viewMode === 'graph' ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}><BarChart2 size={16} /></button>
                  <button onClick={() => setViewMode('table')} className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-white shadow text-indigo-600' : 'text-gray-400'}`}><Table size={16} /></button>
                </div>
              </div>
              {filteredContents.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-400 text-sm">データがありません</div>
              ) : viewMode === 'graph' ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={graphData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 10 }} height={50} interval={0} angle={-30} textAnchor="end" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="views" name="閲覧数" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      {selectedService === 'quiz' && (
                        <>
                          <Bar dataKey="completions" name="完了数" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="clicks" name="クリック" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </>
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 bg-gray-50">{selectedService === 'quiz' ? 'タイトル' : 'プロフィール名'}</th>
                        {selectedService !== 'quiz' && (
                          <th className="px-4 py-3 bg-gray-50">SLUG</th>
                        )}
                        <th className="px-4 py-3 text-right bg-gray-50">アクセス数</th>
                        <th className="px-4 py-3 text-right bg-gray-50">クリック数</th>
                        <th className="px-4 py-3 text-right bg-gray-50">クリック率</th>
                        {selectedService === 'quiz' && (
                          <>
                            <th className="px-4 py-3 text-right bg-gray-50">完了数</th>
                            <th className="px-4 py-3 text-right bg-gray-50">完了率</th>
                          </>
                        )}
                        {selectedService !== 'quiz' && (
                          <>
                            <th className="px-4 py-3 text-right bg-gray-50">精読率</th>
                            <th className="px-4 py-3 text-right bg-gray-50">滞在時間</th>
                          </>
                        )}
                        <th className="px-4 py-3 text-right bg-gray-50">作成日</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContents.map(item => {
                        const views = item.views_count || 0;
                        const completions = item.completions_count || 0;
                        const clicks = item.clicks_count || 0;
                        const rate = views > 0 ? Math.round((completions / views) * 100) : 0;
                        const ctr = views > 0 ? Math.round((clicks / views) * 100) : 0;
                        const readRate = item.readRate || 0;
                        const avgTime = item.avgTimeSpent || 0;
                        const createdAt = item.created_at ? new Date(item.created_at).toLocaleDateString('ja-JP') : '-';

                        return (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900 truncate max-w-[150px]">{item.title}</td>
                            {selectedService !== 'quiz' && (
                              <td className="px-4 py-3 text-gray-600 font-mono text-xs">{item.slug}</td>
                            )}
                            <td className="px-4 py-3 text-right font-bold text-blue-600">{views}</td>
                            <td className="px-4 py-3 text-right">{clicks}</td>
                            <td className="px-4 py-3 text-right text-green-600 font-bold">{ctr}%</td>
                            {selectedService === 'quiz' && (
                              <>
                                <td className="px-4 py-3 text-right">{completions}</td>
                                <td className="px-4 py-3 text-right text-orange-600 font-bold">{rate}%</td>
                              </>
                            )}
                            {selectedService !== 'quiz' && (
                              <>
                                <td className="px-4 py-3 text-right text-orange-600 font-bold">{readRate}%</td>
                                <td className="px-4 py-3 text-right text-purple-600 font-bold">{avgTime > 0 ? `${avgTime}秒` : '-'}</td>
                              </>
                            )}
                            <td className="px-4 py-3 text-right text-gray-500 text-xs">{createdAt}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 管理者向けお知らせ管理セクション */}
        {isAdmin && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-black border-l-4 border-red-600 pl-4 flex items-center gap-2">
                <Bell size={20} className="text-red-600" /> お知らせ管理
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">ADMIN</span>
              </h2>
              <button
                onClick={() => {
                  setEditingAnnouncement(null);
                  setAnnouncementForm({
                    title: '',
                    content: '',
                    link_url: '',
                    link_text: '',
                    is_active: true,
                    announcement_date: '',
                    service_type: 'all'
                  });
                  setShowAnnouncementForm(true);
                }}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 flex items-center gap-2"
              >
                <Plus size={16} /> 新規作成
              </button>
            </div>

            {showAnnouncementForm && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900">
                    {editingAnnouncement ? 'お知らせを編集' : '新規お知らせを作成'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAnnouncementForm(false);
                      setEditingAnnouncement(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleAnnouncementSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">タイトル *</label>
                    <input
                      type="text"
                      required
                      value={announcementForm.title}
                      onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900"
                      placeholder="お知らせのタイトル"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">内容 *</label>
                    <textarea
                      required
                      value={announcementForm.content}
                      onChange={e => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                      className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900 h-32"
                      placeholder="お知らせの内容"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">リンクURL（オプション）</label>
                      <input
                        type="url"
                        value={announcementForm.link_url}
                        onChange={e => setAnnouncementForm({ ...announcementForm, link_url: e.target.value })}
                        className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900"
                        placeholder="https://..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">リンクテキスト（オプション）</label>
                      <input
                        type="text"
                        value={announcementForm.link_text}
                        onChange={e => setAnnouncementForm({ ...announcementForm, link_text: e.target.value })}
                        className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900"
                        placeholder="詳細はこちら"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-1">表示日付</label>
                      <input
                        type="date"
                        value={announcementForm.announcement_date}
                        onChange={e => setAnnouncementForm({ ...announcementForm, announcement_date: e.target.value })}
                        className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900"
                      />
                      <p className="text-xs text-gray-500 mt-1">空欄の場合は作成日時が表示されます</p>
                    </div>
                    <div className="flex items-center gap-2 pt-8">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={announcementForm.is_active}
                        onChange={e => setAnnouncementForm({ ...announcementForm, is_active: e.target.checked })}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded"
                      />
                      <label htmlFor="is_active" className="text-sm font-bold text-gray-700">表示する</label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">サービス区分</label>
                    <select
                      value={announcementForm.service_type}
                      onChange={e => setAnnouncementForm({ ...announcementForm, service_type: e.target.value })}
                      className="w-full border border-gray-300 p-3 rounded-lg bg-gray-50 text-gray-900"
                    >
                      <option value="all">全サービス共通</option>
                      <option value="quiz">診断クイズメーカー専用</option>
                      <option value="profile">プロフィールLPメーカー専用</option>
                      <option value="business">ビジネスLPメーカー専用</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">どのサービスでお知らせを表示するか選択してください</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      {editingAnnouncement ? '更新する' : '作成する'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAnnouncementForm(false);
                        setEditingAnnouncement(null);
                      }}
                      className="px-6 bg-gray-100 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      キャンセル
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {announcements.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  お知らせがありません
                </div>
              ) : (
                <>
                  <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
                    全 {announcements.length} 件
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">タイトル</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">サービス区分</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">状態</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">作成日</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {paginatedAnnouncements.map(announcement => (
                          <tr key={announcement.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">{announcement.title}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${announcement.service_type === 'all' ? 'bg-blue-100 text-blue-700' :
                                announcement.service_type === 'quiz' ? 'bg-purple-100 text-purple-700' :
                                  announcement.service_type === 'profile' ? 'bg-green-100 text-green-700' :
                                    'bg-amber-100 text-amber-700'
                                }`}>
                                {announcement.service_type === 'all' ? '全サービス' :
                                  announcement.service_type === 'quiz' ? '診断クイズ' :
                                    announcement.service_type === 'profile' ? 'プロフィールLP' :
                                      'ビジネスLP'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${announcement.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                                }`}>
                                {announcement.is_active ? '表示中' : '非表示'}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 text-xs">
                              {announcement.announcement_date
                                ? new Date(announcement.announcement_date).toLocaleDateString('ja-JP')
                                : new Date(announcement.created_at).toLocaleDateString('ja-JP')
                              }
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditAnnouncement(announcement)}
                                  className="text-indigo-600 hover:text-indigo-700 font-bold text-xs"
                                >
                                  編集
                                </button>
                                <button
                                  onClick={() => handleDeleteAnnouncement(announcement.id)}
                                  className="text-red-600 hover:text-red-700 font-bold text-xs"
                                >
                                  削除
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Pagination
                    currentPage={announcementPage}
                    totalPages={totalAnnouncementPages}
                    onPageChange={setAnnouncementPage}
                    label="お知らせ"
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* 管理者向けピックアップコンテンツ管理セクション */}
        {isAdmin && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-black border-l-4 border-orange-600 pl-4 flex items-center gap-2">
                <Star size={20} className="text-orange-600" /> ピックアップコンテンツ管理
                <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">ADMIN</span>
              </h2>
              <button
                onClick={() => setShowFeaturedManager(!showFeaturedManager)}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-700 flex items-center gap-2"
              >
                {showFeaturedManager ? <X size={16} /> : <Plus size={16} />}
                {showFeaturedManager ? '閉じる' : 'コンテンツを追加'}
              </button>
            </div>

            {/* 現在のピックアップ一覧 */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900">
                  現在のピックアップ（{featuredContents.length}/10件）
                </h3>
              </div>
              
              {featuredContents.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  まだピックアップされたコンテンツがありません
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredContents.map((featured) => {
                    const Icon = getServiceIcon(featured.content_type);
                    const colors = getServiceColor(featured.content_type);
                    
                    return (
                      <div key={featured.id} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative">
                        <div className="flex items-start gap-3">
                          <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${colors.bg} flex items-center justify-center`}>
                            <Icon size={20} className={colors.text} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`text-xs ${colors.text} font-bold mb-1`}>
                              {SERVICE_LABELS[featured.content_type]}
                            </div>
                            <div className="text-sm font-bold text-gray-900 line-clamp-2 mb-2">
                              ID: {featured.content_id}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(featured.created_at).toLocaleDateString('ja-JP')}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveFeatured(featured.id)}
                            className="flex-shrink-0 text-red-600 hover:text-red-700 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* コンテンツ追加UI */}
            {showFeaturedManager && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">
                  ピックアップするコンテンツを選択
                </h3>

                {/* サービスタブ */}
                <div className="flex gap-2 mb-4">
                  {(['quiz', 'profile', 'business'] as ServiceType[]).map((type) => {
                    const Icon = getServiceIcon(type);
                    const colors = getServiceColor(type);
                    
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          setFeaturedService(type);
                          setSelectedForFeatured(new Set());
                        }}
                        className={`flex-1 p-3 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                          featuredService === type
                            ? `${colors.bg} ${colors.border}`
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon size={16} className={colors.text} />
                        <span className="font-bold text-sm">{SERVICE_LABELS[type]}</span>
                      </button>
                    );
                  })}
                </div>

                {/* 検索 */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    placeholder="タイトルで検索..."
                    value={featuredSearch}
                    onChange={(e) => setFeaturedSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                </div>

                {/* コンテンツリスト */}
                <div className="max-h-96 overflow-y-auto mb-4 border border-gray-200 rounded-lg">
                  {contents
                    .filter(item => item.type === featuredService)
                    .filter(item => 
                      featuredSearch === '' || 
                      item.title.toLowerCase().includes(featuredSearch.toLowerCase())
                    )
                    .map((item) => {
                      const isSelected = selectedForFeatured.has(item.id);
                      const isFeatured = featuredContents.some(
                        f => f.content_id === item.id && f.content_type === item.type
                      );
                      
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center gap-3 p-3 border-b border-gray-100 hover:bg-gray-50 ${
                            isFeatured ? 'opacity-50' : ''
                          }`}
                        >
                          <button
                            onClick={() => !isFeatured && toggleFeaturedSelection(item.id)}
                            disabled={isFeatured}
                            className="flex-shrink-0"
                          >
                            {isSelected ? (
                              <CheckSquare size={20} className="text-orange-600" />
                            ) : (
                              <Square size={20} className={isFeatured ? 'text-gray-300' : 'text-gray-400'} />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-gray-900 line-clamp-1">
                              {item.title}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {item.id}
                            </div>
                          </div>
                          {isFeatured && (
                            <span className="flex-shrink-0 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded font-bold">
                              登録済み
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>

                {/* 追加ボタン */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {selectedForFeatured.size > 0 && (
                      <span className="font-bold text-orange-600">
                        {selectedForFeatured.size}件選択中
                      </span>
                    )}
                    {featuredContents.length + selectedForFeatured.size > 10 && (
                      <span className="text-red-600 ml-2">
                        （最大10件まで）
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleAddFeatured}
                    disabled={selectedForFeatured.size === 0 || loadingFeatured || featuredContents.length + selectedForFeatured.size > 10}
                    className="bg-orange-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loadingFeatured ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        追加中...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        ピックアップに追加
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 管理者向けユーザー管理セクション */}
        {isAdmin && (
          <div className="mt-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-black border-l-4 border-purple-600 pl-4 flex items-center gap-2">
                <Users size={20} className="text-purple-600" /> ユーザー管理
                <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full">ADMIN</span>
              </h2>
              <button
                onClick={() => {
                  setShowUserManagement(!showUserManagement);
                  if (!showUserManagement && allUsers.length === 0) {
                    fetchAllUsers();
                  }
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-purple-700 flex items-center gap-2"
              >
                {showUserManagement ? (
                  <>
                    <X size={16} /> 閉じる
                  </>
                ) : (
                  <>
                    <Users size={16} /> ユーザー一覧を表示
                  </>
                )}
              </button>
            </div>

            {showUserManagement && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                {loadingUsers ? (
                  <div className="p-8 text-center">
                    <Loader2 size={32} className="animate-spin mx-auto text-purple-600 mb-3" />
                    <p className="text-gray-500">ユーザー情報を読み込み中...</p>
                  </div>
                ) : allUsers.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Users size={48} className="mx-auto mb-3 text-gray-300" />
                    <p>ユーザーが見つかりません</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="px-4 py-3 text-left bg-gray-50 font-bold text-gray-900">メールアドレス</th>
                          <th className="px-4 py-3 text-center bg-gray-50 font-bold text-gray-900">パートナー</th>
                          <th className="px-4 py-3 text-right bg-gray-50 font-bold text-gray-900">総寄付額</th>
                          <th className="px-4 py-3 text-right bg-gray-50 font-bold text-gray-900">購入数</th>
                          <th className="px-4 py-3 text-left bg-gray-50 font-bold text-gray-900">登録日</th>
                          <th className="px-4 py-3 text-center bg-gray-50 font-bold text-gray-900">操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((usr) => {
                          const isEditing = editingUserId === usr.user_id;
                          return (
                            <tr key={usr.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-900 font-medium">
                                {usr.email}
                                {usr.partner_note && (
                                  <div className="text-xs text-gray-500 mt-1">
                                    💬 {usr.partner_note}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {usr.is_partner ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                      ✨ パートナー
                                    </span>
                                    {usr.partner_since && (
                                      <span className="text-[10px] text-gray-500">
                                        {new Date(usr.partner_since).toLocaleDateString('ja-JP')}〜
                                      </span>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs">一般</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right font-bold text-purple-600">
                                ¥{usr.total_donated.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-right text-gray-600">
                                {usr.total_purchases}件
                              </td>
                              <td className="px-4 py-3 text-gray-500 text-xs">
                                {new Date(usr.user_created_at).toLocaleDateString('ja-JP')}
                              </td>
                              <td className="px-4 py-3">
                                {isEditing ? (
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      placeholder="メモ（任意）"
                                      value={partnerNote}
                                      onChange={(e) => setPartnerNote(e.target.value)}
                                      className="w-full text-xs border border-gray-300 p-2 rounded bg-gray-50 text-gray-900"
                                    />
                                    <div className="flex gap-1">
                                      <button
                                        onClick={() => handleTogglePartner(usr.user_id, usr.is_partner, partnerNote)}
                                        className="flex-1 bg-purple-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-purple-700"
                                      >
                                        {usr.is_partner ? '解除' : '設定'}
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingUserId(null);
                                          setPartnerNote('');
                                        }}
                                        className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
                                      >
                                        <X size={12} />
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setEditingUserId(usr.user_id);
                                      setPartnerNote(usr.partner_note || '');
                                    }}
                                    className={`px-3 py-1 rounded text-xs font-bold transition-colors ${
                                      usr.is_partner
                                        ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                    }`}
                                  >
                                    {usr.is_partner ? '解除' : 'パートナーに設定'}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* コンテンツ一覧 */}
        <div className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black border-l-4 border-indigo-600 pl-4 flex items-center gap-2">
              {isAdmin ? `全${SERVICE_LABELS[selectedService]}リスト（管理者）` : `作成した${SERVICE_LABELS[selectedService]}リスト`}
              {isAdmin && <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full">ADMIN</span>}
            </h2>
            {filteredContents.length > 0 && (
              <span className="text-sm text-gray-500">
                全 {filteredContents.length} 件
              </span>
            )}
          </div>

          {/* 検索 */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="タイトルで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-indigo-600" /></div>
          ) : (
            filteredContents.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                <p className="text-gray-500 mb-4">{searchQuery ? '検索結果がありません' : `まだ${SERVICE_LABELS[selectedService]}を作成していません。`}</p>
                {!searchQuery && (
                  <button onClick={() => navigateTo(`${selectedService}/editor`)} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-bold hover:bg-indigo-700">新規作成する</button>
                )}
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedContents.map(item => {
                    const accessInfo = proAccessMap[item.id] || { hasAccess: false };
                    const isUnlocked = accessInfo.hasAccess || isAdmin;
                    const colors = getServiceColor(item.type);
                    const Icon = getServiceIcon(item.type);

                    // サムネイル用のスタイル
                    const thumbnailStyle: React.CSSProperties = {};
                    if (item.settings?.theme?.backgroundImage) {
                      thumbnailStyle.backgroundImage = `url(${item.settings.theme.backgroundImage})`;
                      thumbnailStyle.backgroundSize = 'cover';
                      thumbnailStyle.backgroundPosition = 'center';
                    } else if (item.settings?.theme?.gradient) {
                      thumbnailStyle.background = item.settings.theme.gradient;
                    } else if (item.color) {
                      thumbnailStyle.backgroundColor = item.color;
                    }

                    const defaultBgClass = !item.settings?.theme?.gradient && !item.settings?.theme?.backgroundImage && !item.color
                      ? `bg-gradient-to-br ${colors.gradient}`
                      : '';

                    return (
                      <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow relative group">
                        <div
                          className={`h-32 w-full overflow-hidden relative ${defaultBgClass}`}
                          style={Object.keys(thumbnailStyle).length > 0 ? thumbnailStyle : undefined}
                        >
                          {item.image_url && <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />}
                          <span className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                            {item.type === 'quiz' ? (
                              item.layout === 'chat' ? <><MessageCircle size={10} /> Chat</> : <><Layout size={10} /> Card</>
                            ) : (
                              <><Icon size={10} /> {SERVICE_LABELS[item.type]}</>
                            )}
                          </span>
                          {item.collect_email && (
                            <span className="absolute bottom-2 right-2 bg-green-500 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                              <Users size={10} /> Leads
                            </span>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-bold text-lg mb-2 line-clamp-1 text-black">{item.title}</h3>
                          <div className="flex gap-4 text-xs text-gray-500 font-bold mb-2">
                            <span className="flex items-center gap-1"><Play size={12} /> {item.views_count || 0}</span>
                            <span className="flex items-center gap-1"><ExternalLink size={12} /> {item.clicks_count || 0}</span>
                          </div>

                          {/* URL表示とコピー */}
                          <div className="mb-4 p-2 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/${item.type}/${item.slug}`}
                                readOnly
                                className="flex-1 text-xs bg-transparent border-none outline-none text-gray-600 truncate"
                              />
                              <button
                                onClick={() => handleCopyUrl(item)}
                                className="text-indigo-600 hover:text-indigo-700 p-1"
                              >
                                {copiedId === item.id ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                              </button>
                            </div>
                          </div>

                          {/* 編集・複製ボタン */}
                          <div className="flex gap-2 mb-3">
                            <button onClick={() => handleEdit(item)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors">
                              <Edit size={14} /> 編集
                            </button>
                            <button onClick={() => handleDuplicate(item)} className="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-600 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors">
                              <Copy size={14} /> 複製
                            </button>
                          </div>

                          {/* 埋め込み・削除ボタン */}
                          <div className="flex gap-2 mb-3">
                            <button 
                              onClick={() => handleEmbed(item, isUnlocked)} 
                              className={`flex-1 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors ${isUnlocked ? 'bg-blue-50 hover:bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                              {isUnlocked ? <Code size={14} /> : <Lock size={14} />} 埋め込み
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(item.id)}
                              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                            >
                              <Trash2 size={14} /> 削除
                            </button>
                          </div>

                          {/* プレビューボタン（全ユーザー表示）*/}
                          <button onClick={() => handleView(item)} className="w-full bg-green-500 text-white py-2.5 rounded-lg font-bold text-xs hover:bg-green-600 flex items-center justify-center gap-1 transition-colors">
                            <ExternalLink size={14} /> プレビュー
                          </button>

                          {/* Pro機能ステータス表示 */}
                          {isUnlocked && !isAdmin && (
                            <div className="mt-2 p-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200">
                              <div className="flex items-center gap-1.5 justify-center">
                                {accessInfo.reason === 'partner' ? (
                                  <>
                                    <span className="text-amber-600 text-xs">✨</span>
                                    <span className="text-xs font-bold text-amber-700">応援パートナー特典</span>
                                  </>
                                ) : accessInfo.reason === 'purchased' ? (
                                  <>
                                    <CheckCircle size={12} className="text-green-600" />
                                    <span className="text-xs font-bold text-green-700">Pro機能利用可能</span>
                                  </>
                                ) : null}
                              </div>
                            </div>
                          )}

                          {/* 管理者：HTMLダウンロード */}
                          {isAdmin && (
                            <button onClick={() => handleDownloadHtml(item)} className="w-full mt-2 bg-indigo-500 text-white py-2.5 rounded-lg font-bold text-xs hover:bg-indigo-600 flex items-center justify-center gap-1 transition-colors">
                              <Download size={14} /> HTMLダウンロード
                            </button>
                          )}

                          {/* 未購入時：寄付ボタン */}
                          {!isUnlocked && !isAdmin && (
                            <div className="mt-3 pt-3 border-t border-gray-100">
                              <button onClick={() => handlePurchase(item)} disabled={processingId === item.id} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-2.5 rounded-lg font-bold text-xs hover:from-orange-600 hover:to-amber-600 flex items-center justify-center gap-1 transition-all shadow-sm">
                                {processingId === item.id ? <Loader2 className="animate-spin" size={14} /> : <Heart size={14} />}
                                Pro機能を開放（寄付）
                              </button>
                              <p className="text-[10px] text-gray-400 text-center mt-1.5">埋め込み機能などが利用可能に</p>
                            </div>
                          )}

                          {/* 削除確認 */}
                          {deleteConfirmId === item.id && (
                            <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                              <p className="text-sm text-red-800 mb-3">
                                「{item.title}」を削除しますか？この操作は取り消せません。
                              </p>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleDelete(item)}
                                  className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors text-xs"
                                >
                                  削除する
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmId(null)}
                                  className="flex-1 px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-xs"
                                >
                                  キャンセル
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  label={SERVICE_LABELS[selectedService]}
                />
              </>
            )
          )}
        </div>
      </div>

      <Footer setPage={navigateTo} />
    </div>
  );
}
