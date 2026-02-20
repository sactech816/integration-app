'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, TABLES } from '@/lib/supabase';
import { getAdminEmails } from '@/lib/constants';
import { ServiceType, Quiz, Profile, BusinessLP, SalesLetter, Thumbnail, Block } from '@/lib/types';
import { generateSlug } from '@/lib/utils';
import { getMultipleAnalytics } from '@/app/actions/analytics';
import { getUserPurchases, checkIsPartner } from '@/app/actions/purchases';
import { fetchMakersSubscriptionStatus, MakersSubscriptionStatus } from '@/lib/subscription';
import { ContentItem } from '../components/MainContent/ContentCard';
import { deleteContent } from '@/app/actions/content';
import { setUserId } from '@/lib/gtag';

type AnalyticsData = {
  views: number;
  clicks: number;
  completions: number;
  avgScrollDepth: number;
  avgTimeSpent: number;
  readRate: number;
  clickRate: number;
};

// コンテンツ取得オプション
type FetchContentsOptions = {
  skipAnalytics?: boolean; // アナリティクス取得をスキップ（無料ユーザー向け高速化）
};

type UseDashboardDataReturn = {
  user: { id: string; email?: string } | null;
  setUser: React.Dispatch<React.SetStateAction<{ id: string; email?: string } | null>>;
  isAdmin: boolean;
  isLoading: boolean;
  contents: ContentItem[];
  contentCounts: {
    quiz: number;
    profile: number;
    business: number;
    salesletter: number;
    booking: number;
    attendance: number;
    survey: number;
    gamification: number;
    onboarding: number;
    thumbnail: number;
  };
  totalViews: number;
  proAccessMap: Record<string, { hasAccess: boolean; reason?: string }>;
  purchases: string[];
  processingId: string | null;
  setProcessingId: React.Dispatch<React.SetStateAction<string | null>>;
  copiedId: string | null;
  setCopiedId: React.Dispatch<React.SetStateAction<string | null>>;
  isPartner: boolean;
  fetchContents: (service: ServiceType, options?: FetchContentsOptions) => Promise<void>;
  fetchPurchases: () => Promise<void>;
  fetchAllContentCounts: () => Promise<void>;
  handleEdit: (item: ContentItem) => void;
  handleView: (item: ContentItem) => void;
  handleCopyUrl: (item: ContentItem) => void;
  handleDelete: (item: ContentItem) => Promise<void>;
  handleDuplicate: (item: ContentItem) => Promise<void>;
  handleEmbed: (item: ContentItem, isUnlocked: boolean) => void;
  handleDownloadHtml: (item: ContentItem) => Promise<void>;
  handlePurchase: (item: ContentItem) => Promise<void>;
  handleLogout: () => Promise<void>;
};

// プロフィール名を取得
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

export function useDashboardData(): UseDashboardDataReturn {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [contentCounts, setContentCounts] = useState({
    quiz: 0,
    profile: 0,
    business: 0,
    salesletter: 0,
    booking: 0,
    attendance: 0,
    survey: 0,
    gamification: 0,
    onboarding: 0,
    thumbnail: 0,
  });
  const [proAccessMap, setProAccessMap] = useState<Record<string, { hasAccess: boolean; reason?: string }>>({});
  const [purchases, setPurchases] = useState<string[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isPartner, setIsPartner] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<MakersSubscriptionStatus | null>(null);
  
  // パートナーステータスのキャッシュ（重複取得防止）
  const partnerCheckedRef = useRef(false);
  const subscriptionCheckedRef = useRef(false);

  // 管理者判定
  const adminEmails = getAdminEmails();
  const isAdmin = user?.email
    ? adminEmails.some((email) => user.email?.toLowerCase() === email.toLowerCase())
    : false;

  // 総PV数計算
  const totalViews = contents.reduce((acc, item) => acc + (item.views_count || 0), 0);

  // 初期化
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const init = async () => {
      if (supabase) {
        const { data: { subscription: sub } } = supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user || null);
          // GA4にUser IDを設定/解除
          setUserId(session?.user?.id || null);
          // ユーザーが変わったらステータスをリセット
          if (!session?.user) {
            partnerCheckedRef.current = false;
            setIsPartner(false);
            subscriptionCheckedRef.current = false;
            setSubscriptionStatus(null);
          }
        });
        subscription = sub;

        // getUser()でサーバー検証（トークン期限切れ時はnullになる可能性あり）
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          setUser(authUser);
        } else {
          // getUser()が失敗した場合、getSession()でローカルセッションを試行
          const { data: { session } } = await supabase.auth.getSession();
          setUser(session?.user || null);
        }
      }
      setIsLoading(false);
    };

    init();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // パートナーステータスを一度だけ取得
  useEffect(() => {
    const fetchPartnerStatus = async () => {
      if (!user || partnerCheckedRef.current) return;
      partnerCheckedRef.current = true;
      
      try {
        const partnerStatus = await checkIsPartner(user.id);
        setIsPartner(partnerStatus);
      } catch (error) {
        console.error('Partner status check error:', error);
      }
    };
    
    fetchPartnerStatus();
  }, [user]);

  // サブスクリプション状態を一度だけ取得
  useEffect(() => {
    const loadSubscriptionStatus = async () => {
      if (!user || subscriptionCheckedRef.current) return;
      subscriptionCheckedRef.current = true;
      
      try {
        // 集客メーカー用のサブスクリプション状態を取得
        const status = await fetchMakersSubscriptionStatus(user.id);
        setSubscriptionStatus(status);
      } catch (error) {
        console.error('Subscription status check error:', error);
      }
    };
    
    loadSubscriptionStatus();
  }, [user]);

  // コンテンツ取得（アナリティクス取得はオプション）
  const fetchContents = useCallback(
    async (selectedService: ServiceType, options?: FetchContentsOptions) => {
      if (!supabase || !user) return;

      const skipAnalytics = options?.skipAnalytics ?? false;
      setIsLoading(true);
      const allContents: ContentItem[] = [];

      try {
        // 診断クイズ取得（カウンターはテーブルに保存済み）
        if (selectedService === 'quiz') {
          const query = isAdmin
            ? supabase.from(TABLES.QUIZZES).select('*').order('created_at', { ascending: false })
            : supabase.from(TABLES.QUIZZES).select('*').eq('user_id', user.id).order('created_at', { ascending: false });

          const { data: quizzes } = await query;
          if (quizzes) {
            allContents.push(
              ...quizzes.map((q: Quiz) => ({
                ...q,
                id: String(q.id),
                title: q.title,
                type: 'quiz' as ServiceType,
                user_id: q.user_id,
                views_count: q.views_count || 0,
                completions_count: q.completions_count || 0,
                clicks_count: q.clicks_count || 0,
              }))
            );
          }
        }

        // プロフィールLP取得
        if (selectedService === 'profile') {
          const query = isAdmin
            ? supabase.from(TABLES.PROFILES).select('*').order('created_at', { ascending: false })
            : supabase.from(TABLES.PROFILES).select('*').eq('user_id', user.id).order('created_at', { ascending: false });

          const { data: profiles } = await query;
          if (profiles) {
            // アナリティクス取得（有料会員のみ）
            let analyticsMapObj: Record<string, AnalyticsData> = {};
            if (!skipAnalytics) {
              const profileIds = profiles.map((p: Profile) => p.id);
              const analyticsResults = await getMultipleAnalytics(profileIds, 'profile');
              analyticsResults.forEach((result) => {
                analyticsMapObj[result.contentId] = result.analytics;
              });
            }

            allContents.push(
              ...profiles.map((p: Profile) => {
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
              })
            );
          }
        }

        // ビジネスLP取得
        if (selectedService === 'business') {
          const query = isAdmin
            ? supabase.from(TABLES.BUSINESS_LPS).select('*').order('created_at', { ascending: false })
            : supabase.from(TABLES.BUSINESS_LPS).select('*').eq('user_id', user.id).order('created_at', { ascending: false });

          const { data: businessLps } = await query;
          if (businessLps) {
            // アナリティクス取得（有料会員のみ）
            let analyticsMapObj: Record<string, AnalyticsData> = {};
            if (!skipAnalytics) {
              const businessSlugs = businessLps.map((b: BusinessLP) => b.slug);
              const analyticsResults = await getMultipleAnalytics(businessSlugs, 'business');
              analyticsResults.forEach((result) => {
                analyticsMapObj[result.contentId] = result.analytics;
              });
            }

            allContents.push(
              ...businessLps.map((b: BusinessLP) => {
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
              })
            );
          }
        }

        // セールスレター取得
        if (selectedService === 'salesletter') {
          const query = isAdmin
            ? supabase.from('sales_letters').select('*').order('created_at', { ascending: false })
            : supabase.from('sales_letters').select('*').eq('user_id', user.id).order('created_at', { ascending: false });

          const { data: salesLetters } = await query;
          if (salesLetters) {
            allContents.push(
              ...salesLetters.map((s: SalesLetter) => ({
                id: s.id,
                slug: s.slug,
                title: s.title || 'セールスレター',
                created_at: s.created_at,
                updated_at: s.updated_at,
                type: 'salesletter' as ServiceType,
                user_id: s.user_id,
                content: s.content,
                settings: s.settings as Record<string, unknown>,
                views_count: s.views_count || 0,
                clicks_count: 0,
                readRate: 0,
                avgTimeSpent: 0,
                clickRate: 0,
              }))
            );
          }
        }

        // はじめかたガイド取得
        if (selectedService === 'onboarding') {
          const query = isAdmin
            ? supabase.from(TABLES.ONBOARDING_MODALS).select('*').order('created_at', { ascending: false })
            : supabase.from(TABLES.ONBOARDING_MODALS).select('*').eq('user_id', user.id).order('created_at', { ascending: false });

          const { data: modals } = await query;
          if (modals) {
            allContents.push(
              ...modals.map((m: any) => ({
                id: String(m.id),
                slug: m.slug,
                title: m.title || 'はじめかたガイド',
                created_at: m.created_at,
                updated_at: m.updated_at,
                type: 'onboarding' as ServiceType,
                user_id: m.user_id,
                views_count: m.views_count || 0,
                clicks_count: 0,
              }))
            );
          }
        }

        // サムネイル取得
        if (selectedService === 'thumbnail') {
          const query = isAdmin
            ? supabase.from(TABLES.THUMBNAILS).select('*').order('created_at', { ascending: false })
            : supabase.from(TABLES.THUMBNAILS).select('*').eq('user_id', user.id).order('created_at', { ascending: false });

          const { data: thumbnails } = await query;
          if (thumbnails) {
            allContents.push(
              ...thumbnails.map((t: Thumbnail) => ({
                id: t.id,
                slug: t.slug,
                title: t.title || 'サムネイル',
                created_at: t.created_at,
                updated_at: t.updated_at,
                type: 'thumbnail' as ServiceType,
                user_id: t.user_id,
                views_count: t.views_count || 0,
                clicks_count: 0,
                readRate: 0,
                avgTimeSpent: 0,
                clickRate: 0,
              }))
            );
          }
        }

        // 作成日時でソート
        allContents.sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB.getTime() - dateA.getTime();
        });

        setContents(allContents);

        // アクセス権を確認（パートナーステータスはキャッシュ済み）
        await fetchProAccessForContents(allContents);
      } catch (error) {
        console.error('Contents fetch error:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [user, isAdmin]
  );

  // Pro機能のアクセス権を確認（最適化版：パートナーステータス、サブスク状態はキャッシュ使用）
  const fetchProAccessForContents = useCallback(
    async (contentItems: ContentItem[]) => {
      if (!user) return;

      // 管理者は全コンテンツにアクセス可能
      if (isAdmin) {
        const accessMap: Record<string, { hasAccess: boolean; reason?: string }> = {};
        contentItems.forEach((item) => {
          accessMap[item.id] = { hasAccess: true, reason: 'admin' };
        });
        setProAccessMap(accessMap);
        return;
      }

      // プロプラン加入者（課金ユーザー・モニターユーザー含む）は全コンテンツにアクセス可能
      if (subscriptionStatus?.hasActiveSubscription) {
        const accessMap: Record<string, { hasAccess: boolean; reason?: string }> = {};
        const reason = subscriptionStatus.isMonitor ? 'monitor' : 'subscription';
        contentItems.forEach((item) => {
          accessMap[item.id] = { hasAccess: true, reason };
        });
        setProAccessMap(accessMap);
        return;
      }

      // パートナーは自分のコンテンツにアクセス可能（キャッシュ済みのisPartnerを使用）
      // 購入履歴は一括取得済みのpurchasesを使用
      const accessMap: Record<string, { hasAccess: boolean; reason?: string }> = {};
      
      contentItems.forEach((item) => {
        // パートナーで自分のコンテンツの場合
        if (isPartner && item.user_id === user.id) {
          accessMap[item.id] = { hasAccess: true, reason: 'partner' };
          return;
        }
        
        // 購入済みの場合
        if (purchases.includes(item.id)) {
          accessMap[item.id] = { hasAccess: true, reason: 'purchased' };
          return;
        }
        
        // それ以外はアクセス不可
        accessMap[item.id] = { hasAccess: false };
      });

      setProAccessMap(accessMap);
    },
    [user, isAdmin, isPartner, purchases, subscriptionStatus]
  );

  // 購入履歴を取得
  const fetchPurchases = useCallback(async () => {
    if (!user) return;
    try {
      const purchaseData = await getUserPurchases(user.id);
      setPurchases(purchaseData.map((p) => p.content_id));
    } catch (error) {
      console.error('Purchases fetch error:', error);
    }
  }, [user]);

  // すべてのコンテンツ数を取得（並列化で高速化）
  const fetchAllContentCounts = useCallback(async () => {
    if (!supabase || !user) return;

    try {
      // 全クエリを並列実行
      const [quizResult, profileResult, businessResult, salesletterResult, bookingResult, attendanceResult, surveyResult, gamificationResult, onboardingResult, thumbnailResult] = await Promise.all([
        // 診断クイズ数
        isAdmin
          ? supabase.from(TABLES.QUIZZES).select('id', { count: 'exact', head: true })
          : supabase.from(TABLES.QUIZZES).select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        // プロフィールLP数
        isAdmin
          ? supabase.from(TABLES.PROFILES).select('id', { count: 'exact', head: true })
          : supabase.from(TABLES.PROFILES).select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        // ビジネスLP数
        isAdmin
          ? supabase.from(TABLES.BUSINESS_LPS).select('id', { count: 'exact', head: true })
          : supabase.from(TABLES.BUSINESS_LPS).select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        // セールスレター数
        isAdmin
          ? supabase.from('sales_letters').select('id', { count: 'exact', head: true })
          : supabase.from('sales_letters').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        // 予約メニュー数
        isAdmin
          ? supabase.from('booking_menus').select('id', { count: 'exact', head: true })
          : supabase.from('booking_menus').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        // 出欠表イベント数
        isAdmin
          ? supabase.from('attendance_events').select('id', { count: 'exact', head: true })
          : supabase.from('attendance_events').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        // アンケート数
        isAdmin
          ? supabase.from('surveys').select('id', { count: 'exact', head: true })
          : supabase.from('surveys').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        // ゲーミフィケーションキャンペーン数（ユーザーが作成したもの）
        supabase.from('gamification_campaigns').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
        // はじめかたガイド数
        isAdmin
          ? supabase.from(TABLES.ONBOARDING_MODALS).select('id', { count: 'exact', head: true })
          : supabase.from(TABLES.ONBOARDING_MODALS).select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        // サムネイル数
        isAdmin
          ? supabase.from(TABLES.THUMBNAILS).select('id', { count: 'exact', head: true })
          : supabase.from(TABLES.THUMBNAILS).select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      setContentCounts({
        quiz: quizResult.count || 0,
        profile: profileResult.count || 0,
        business: businessResult.count || 0,
        salesletter: salesletterResult.count || 0,
        booking: bookingResult.count || 0,
        attendance: attendanceResult.count || 0,
        survey: surveyResult.count || 0,
        gamification: gamificationResult.count || 0,
        onboarding: onboardingResult.count || 0,
        thumbnail: thumbnailResult.count || 0,
      });
    } catch (error) {
      console.error('Content counts fetch error:', error);
    }
  }, [user, isAdmin]);

  // 編集
  const handleEdit = (item: ContentItem) => {
    window.location.href = `/${item.type}/editor?id=${item.slug}`;
  };

  // プレビュー
  const handleView = (item: ContentItem) => {
    window.open(`/${item.type}/${item.slug}`, '_blank');
  };

  // URLコピー
  const handleCopyUrl = (item: ContentItem) => {
    const baseUrl = window.location.origin;
    const url = `${baseUrl}/${item.type}/${item.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // 削除
  const handleDelete = async (item: ContentItem) => {
    if (!user) {
      console.log('[Dashboard] handleDelete: No user');
      return;
    }

    // サーバーアクションで削除（管理者対応）
    const contentType = item.type as 'quiz' | 'profile' | 'business' | 'salesletter' | 'onboarding' | 'thumbnail';
    const contentId = (item.type === 'quiz' || item.type === 'onboarding') ? parseInt(item.id) : item.id;

    console.log('[Dashboard] handleDelete called:', { 
      itemType: item.type, 
      contentType, 
      contentId, 
      userId: user.id, 
      isAdmin 
    });

    try {
      const result = await deleteContent(contentType, contentId, user.id, isAdmin);

      console.log('[Dashboard] deleteContent result:', result);

      if (result.success) {
        setContents((prev) => prev.filter((c) => c.id !== item.id));
        console.log('[Dashboard] Local state updated');
      } else {
        alert(result.error || '削除に失敗しました');
      }
    } catch (error) {
      console.error('[Dashboard] Delete error:', error);
      alert('削除中にエラーが発生しました');
    }
  };

  // 複製
  const handleDuplicate = async (item: ContentItem) => {
    if (!supabase || !user) return;
    if (!confirm(`「${item.title}」を複製しますか？`)) return;

    try {
      const newSlug = generateSlug();
      const tableMap: Record<string, string> = {
        quiz: TABLES.QUIZZES,
        profile: TABLES.PROFILES,
        business: TABLES.BUSINESS_LPS,
        salesletter: 'sales_letters',
      };

      if (item.type === 'quiz') {
        const { data: originalQuiz } = await supabase
          .from(TABLES.QUIZZES)
          .select('*')
          .eq('id', parseInt(item.id))
          .single();

        if (originalQuiz) {
          const { error } = await supabase.from(TABLES.QUIZZES).insert([
            {
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
              slug: newSlug,
            },
          ]);
          if (error) throw error;
        }
      } else if (item.type === 'salesletter') {
        // セールスレターの複製
        const { data: original } = await supabase
          .from('sales_letters')
          .select('*')
          .eq('id', item.id)
          .single();

        if (original) {
          const { error } = await supabase.from('sales_letters').insert([
            {
              user_id: user.id,
              title: `${original.title || 'セールスレター'} のコピー`,
              content: original.content,
              slug: newSlug,
              settings: original.settings,
              template_id: original.template_id,
            },
          ]);
          if (error) throw error;
        }
      } else if (item.type === 'onboarding') {
        // はじめかたガイドの複製
        const { data: original } = await supabase
          .from(TABLES.ONBOARDING_MODALS)
          .select('*')
          .eq('id', parseInt(item.id))
          .single();

        if (original) {
          const { error } = await supabase.from(TABLES.ONBOARDING_MODALS).insert([{
            user_id: user.id,
            title: `${original.title || 'はじめかたガイド'} のコピー`,
            description: original.description,
            pages: original.pages,
            gradient_from: original.gradient_from,
            gradient_to: original.gradient_to,
            trigger_type: original.trigger_type,
            trigger_delay: original.trigger_delay,
            trigger_scroll_percent: original.trigger_scroll_percent,
            trigger_button_text: original.trigger_button_text,
            trigger_button_position: original.trigger_button_position,
            show_dont_show_again: original.show_dont_show_again,
            close_on_overlay_click: original.close_on_overlay_click,
            dont_show_text: original.dont_show_text,
            next_button_text: original.next_button_text,
            back_button_text: original.back_button_text,
            start_button_text: original.start_button_text,
            slug: newSlug,
          }]);
          if (error) throw error;
        }
      } else if (item.type === 'survey') {
        // アンケートの複製
        const { data: original } = await supabase
          .from('surveys')
          .select('*')
          .eq('id', parseInt(item.id))
          .single();

        if (original) {
          const { error } = await supabase.from('surveys').insert([
            {
              user_id: user.id,
              title: `${original.title || 'アンケート'} のコピー`,
              description: original.description,
              questions: original.questions,
              slug: `${original.slug}-copy-${Date.now()}`,
              show_results_after_submission: original.show_results_after_submission,
            },
          ]);
          if (error) throw error;
        }
      } else {
        const { error } = await supabase.from(tableMap[item.type]).insert([
          {
            user_id: user.id,
            content: item.content,
            slug: newSlug,
            settings: item.settings,
          },
        ]);
        if (error) throw error;
      }

      alert('複製しました！');
      // コンテンツを再取得
      await fetchContents(item.type);
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : '不明なエラー';
      alert('複製エラー: ' + errorMessage);
    }
  };

  // 埋め込みコード生成
  const handleEmbed = (item: ContentItem, isUnlocked: boolean) => {
    if (!isUnlocked) return alert('この機能を利用するには、開発支援（購入）によるロック解除が必要です。');
    const url = `${window.location.origin}/${item.type}/${item.slug}`;
    const code = `<iframe src="${url}" width="100%" height="600" style="border:none; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.1);"></iframe>`;
    navigator.clipboard.writeText(code);
    alert('埋め込みコードをコピーしました！\n\nWordPressなどの「カスタムHTML」ブロックに貼り付けてください。');
  };

  // HTMLダウンロード
  const handleDownloadHtml = async (item: ContentItem) => {
    try {
      const pageUrl = `${window.location.origin}/${item.type}/${item.slug}`;
      const response = await fetch(pageUrl);
      if (!response.ok) throw new Error('ページの取得に失敗しました');
      let html = await response.text();

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

  // 機能開放/開発支援
  const handlePurchase = async (item: ContentItem) => {
    const inputPrice = window.prompt(
      `「${item.title}」のPro機能を開放します。\n\n応援・開発支援金額を入力してください（100円〜100,000円）。`,
      '1000'
    );
    if (inputPrice === null) return;
    const price = parseInt(inputPrice, 10);
    if (isNaN(price) || price < 100 || price > 100000) {
      alert('金額は 100円以上、100,000円以下 の半角数字で入力してください。');
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
            email: user?.email,
          },
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

  // ログアウト
  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
      window.location.href = '/';
    }
  };

  return {
    user,
    setUser,
    isAdmin,
    isLoading,
    contents,
    contentCounts,
    totalViews,
    proAccessMap,
    purchases,
    processingId,
    setProcessingId,
    copiedId,
    setCopiedId,
    isPartner,
    fetchContents,
    fetchPurchases,
    fetchAllContentCounts,
    handleEdit,
    handleView,
    handleCopyUrl,
    handleDelete,
    handleDuplicate,
    handleEmbed,
    handleDownloadHtml,
    handlePurchase,
    handleLogout,
  };
}
