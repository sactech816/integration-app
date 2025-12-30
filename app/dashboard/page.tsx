'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase, TABLES } from '@/lib/supabase';
import { getAdminEmails } from '@/lib/constants';
import { ServiceType, SERVICE_LABELS, Quiz, Profile, BusinessLP } from '@/lib/types';
import { formatDate, getRelativeTime } from '@/lib/utils';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import ServiceSelector from '@/components/shared/ServiceSelector';
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
  Filter,
  Loader2,
  BarChart3,
  Eye,
  Calendar,
  Link as LinkIcon
} from 'lucide-react';

type ContentItem = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  type: ServiceType;
};

export default function DashboardPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceType | 'all'>('all');
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // 管理者かどうかを判定
  const adminEmails = getAdminEmails();
  const isAdmin = user?.email && adminEmails.some(email =>
    user.email?.toLowerCase() === email.toLowerCase()
  );

  // コンテンツ取得
  const fetchContents = useCallback(async () => {
    if (!supabase || !user) return;

    setIsLoading(true);
    const allContents: ContentItem[] = [];

    try {
      // 診断クイズ取得
      if (selectedService === 'all' || selectedService === 'quiz') {
        const query = isAdmin
          ? supabase.from(TABLES.QUIZZES).select('*').order('created_at', { ascending: false })
          : supabase.from(TABLES.QUIZZES).select('*').eq('user_id', user.id).order('created_at', { ascending: false });

        const { data: quizzes } = await query;
        if (quizzes) {
          allContents.push(...quizzes.map((q: Quiz) => ({
            ...q,
            id: String(q.id),
            type: 'quiz' as ServiceType
          })));
        }
      }

      // プロフィールLP取得
      if (selectedService === 'all' || selectedService === 'profile') {
        const query = isAdmin
          ? supabase.from(TABLES.PROFILES).select('*').order('created_at', { ascending: false })
          : supabase.from(TABLES.PROFILES).select('*').eq('user_id', user.id).order('created_at', { ascending: false });

        const { data: profiles } = await query;
        if (profiles) {
          allContents.push(...profiles.map((p: Profile) => ({
            id: p.id,
            slug: p.slug,
            title: p.nickname || `プロフィール ${p.slug}`,
            created_at: p.created_at,
            updated_at: p.updated_at,
            type: 'profile' as ServiceType
          })));
        }
      }

      // ビジネスLP取得
      if (selectedService === 'all' || selectedService === 'business') {
        const query = isAdmin
          ? supabase.from(TABLES.BUSINESS_LPS).select('*').order('created_at', { ascending: false })
          : supabase.from(TABLES.BUSINESS_LPS).select('*').eq('user_id', user.id).order('created_at', { ascending: false });

        const { data: businessLps } = await query;
        if (businessLps) {
          allContents.push(...businessLps.map((b: BusinessLP) => ({
            id: b.id,
            slug: b.slug,
            title: b.title || `ビジネスLP ${b.slug}`,
            description: b.description,
            created_at: b.created_at,
            updated_at: b.updated_at,
            type: 'business' as ServiceType
          })));
        }
      }

      // 作成日時でソート
      allContents.sort((a, b) => {
        const dateA = new Date(a.created_at || 0);
        const dateB = new Date(b.created_at || 0);
        return dateB.getTime() - dateA.getTime();
      });

      setContents(allContents);
    } catch (error) {
      console.error('Contents fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, selectedService, isAdmin]);

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
    }
  }, [user, selectedService, fetchContents]);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
      window.location.href = '/';
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
    window.location.href = `/${item.type}/${item.slug}`;
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
        .eq(item.type === 'quiz' ? 'id' : 'id', item.type === 'quiz' ? parseInt(item.id) : item.id);

      if (error) throw error;

      setContents(prev => prev.filter(c => c.id !== item.id));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Delete error:', error);
      alert('削除中にエラーが発生しました');
    }
  };

  // 検索フィルター
  const filteredContents = contents.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      quiz: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-200' },
      profile: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
      business: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' }
    };
    return colors[type];
  };

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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">マイページ</h1>
          <p className="text-gray-600">作成したコンテンツを管理できます</p>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {(['quiz', 'profile', 'business'] as ServiceType[]).map((type) => {
            const Icon = getServiceIcon(type);
            const colors = getServiceColor(type);
            const count = contents.filter(c => c.type === type).length;

            return (
              <button
                key={type}
                onClick={() => setSelectedService(selectedService === type ? 'all' : type)}
                className={`
                  p-6 rounded-2xl border-2 transition-all
                  ${selectedService === type
                    ? `${colors.bg} ${colors.border}`
                    : 'bg-white border-gray-100 hover:border-gray-200'
                  }
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${colors.bg}`}>
                    <Icon size={24} className={colors.text} />
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-black text-gray-900">{count}</p>
                    <p className="text-sm text-gray-600">{SERVICE_LABELS[type]}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ツールバー */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* 検索 */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="タイトルで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* フィルター */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedService('all')}
              className={`px-4 py-3 rounded-xl font-semibold transition-colors ${selectedService === 'all'
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
            >
              すべて
            </button>
          </div>

          {/* 新規作成 */}
          <button
            onClick={() => navigateTo('')}
            className="flex items-center gap-2 bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">新規作成</span>
          </button>
        </div>

        {/* コンテンツ一覧 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-indigo-600" size={48} />
          </div>
        ) : filteredContents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? '検索結果がありません' : 'コンテンツがありません'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? '別のキーワードで検索してみてください' : '新しいコンテンツを作成しましょう'}
            </p>
            {!searchQuery && (
              <button
                onClick={() => navigateTo('')}
                className="inline-flex items-center gap-2 bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Plus size={20} />
                新規作成
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredContents.map((item) => {
              const Icon = getServiceIcon(item.type);
              const colors = getServiceColor(item.type);

              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* アイコン */}
                    <div className={`p-3 rounded-xl ${colors.bg} flex-shrink-0`}>
                      <Icon size={24} className={colors.text} />
                    </div>

                    {/* コンテンツ情報 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                          {SERVICE_LABELS[item.type]}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 truncate mb-1">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="text-sm text-gray-600 truncate mb-2">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {item.created_at ? getRelativeTime(item.created_at) : '日付不明'}
                        </span>
                        <span className="flex items-center gap-1">
                          <LinkIcon size={12} />
                          {item.slug}
                        </span>
                      </div>
                    </div>

                    {/* アクション */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleView(item)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="プレビュー"
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        onClick={() => handleCopyUrl(item)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="URLをコピー"
                      >
                        {copiedId === item.id ? (
                          <Check size={20} className="text-green-500" />
                        ) : (
                          <Copy size={20} />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="編集"
                      >
                        <Edit size={20} />
                      </button>

                      {/* その他メニュー */}
                      <div className="relative">
                        <button
                          onClick={() => setMenuOpenId(menuOpenId === item.id ? null : item.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical size={20} />
                        </button>

                        {menuOpenId === item.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setMenuOpenId(null)}
                            />
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                              <button
                                onClick={() => {
                                  window.open(`/${item.type}/${item.slug}`, '_blank');
                                  setMenuOpenId(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                <ExternalLink size={16} />
                                新しいタブで開く
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteConfirmId(item.id);
                                  setMenuOpenId(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                                削除
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 削除確認 */}
                  {deleteConfirmId === item.id && (
                    <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
                      <p className="text-sm text-red-800 mb-3">
                        「{item.title}」を削除しますか？この操作は取り消せません。
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDelete(item)}
                          className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                        >
                          削除する
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-4 py-2 bg-white text-gray-700 font-semibold rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          キャンセル
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer setPage={navigateTo} />
    </div>
  );
}
