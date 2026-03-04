'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useOnboarding } from '@/lib/hooks/useOnboarding';
import {
  ClipboardCheck, Plus, Trash2, ChevronRight, Globe, Loader2,
  CreditCard, Eye, FileText, BarChart3, BookOpen, Layout,
  ListPlus, Send, Link2,
} from 'lucide-react';
import LandingHeader from '@/components/shared/LandingHeader';
import OnboardingModal from '@/components/shared/OnboardingModal';
import StripeConnectStatus from '@/components/order-form/StripeConnectStatus';

interface OrderForm {
  id: string;
  title: string;
  slug: string;
  price: number;
  payment_type: string;
  status: string;
  submission_count: number;
  created_at: string;
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return '今日';
  if (diffDays === 1) return '昨日';
  if (diffDays < 7) return `${diffDays}日前`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}週間前`;
  return `${Math.floor(diffDays / 30)}ヶ月前`;
}

const ONBOARDING_PAGES = [
  {
    subtitle: '基本の使い方',
    items: [
      { icon: Layout, iconColor: 'green', title: 'フォームを作成', description: 'タイトル・説明文を設定して、申し込みフォームを作成します' },
      { icon: ListPlus, iconColor: 'teal', title: 'フィールドを追加', description: 'テキスト・メール・選択肢など、自由にフィールドを追加できます' },
      { icon: Eye, iconColor: 'blue', title: 'リアルタイムプレビュー', description: '編集しながらプレビューで完成イメージを確認できます' },
      { icon: Send, iconColor: 'purple', title: '公開してシェア', description: '「公開」ボタンでURLを発行、SNSやLINEでシェアできます' },
    ],
  },
  {
    subtitle: '決済・管理機能',
    items: [
      { icon: CreditCard, iconColor: 'green', title: '決済連携', description: 'Stripe / UnivaPay で決済付きの申し込みフォームも作成可能' },
      { icon: Link2, iconColor: 'teal', title: 'Stripe Connect', description: 'Stripe Connectで売上をあなたのアカウントに直接受取' },
      { icon: BarChart3, iconColor: 'amber', title: '申し込み管理', description: 'ダッシュボードで申し込み数・決済状況をまとめて確認' },
      { icon: Globe, iconColor: 'blue', title: 'メルマガ連携', description: '申し込みデータをメルマガの読者リストに取り込み可能' },
    ],
  },
];

export default function OrderFormDashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [forms, setForms] = useState<OrderForm[]>([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const { showOnboarding, setShowOnboarding } = useOnboarding('order-form-onboarding-dismissed');

  useEffect(() => {
    const init = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        await fetchForms(user.id);
      }
      setAuthLoading(false);
    };
    init();
  }, []);

  const fetchForms = async (uid: string) => {
    setFormsLoading(true);
    const res = await fetch(`/api/order-form?userId=${uid}`);
    if (res.ok) {
      const data = await res.json();
      setForms(data.forms || []);
    }
    setFormsLoading(false);
  };

  const handleDelete = async (formId: string) => {
    if (!userId || !confirm('このフォームを削除しますか？')) return;
    const res = await fetch(`/api/order-form/${formId}?userId=${userId}`, { method: 'DELETE' });
    if (res.ok) {
      setForms((prev) => prev.filter((f) => f.id !== formId));
    }
  };

  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ログインが必要です</h2>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl shadow-md hover:bg-emerald-700 transition-all min-h-[44px]">ログインページへ</Link>
        </div>
      </div>
    );
  }

  const totalSubmissions = forms.reduce((sum, f) => sum + f.submission_count, 0);
  const publishedCount = forms.filter((f) => f.status === 'published').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 共通ヘッダー */}
      <LandingHeader currentService="order-form" />

      {/* オンボーディングガイド */}
      {showOnboarding && (
        <OnboardingModal
          storageKey="order-form-onboarding-dismissed"
          title="申し込みフォームの使い方"
          pages={ONBOARDING_PAGES}
          gradientFrom="from-emerald-500"
          gradientTo="to-teal-500"
          onDismiss={() => setShowOnboarding(false)}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span className="bg-emerald-50 p-2.5 rounded-xl">
                <ClipboardCheck className="w-7 h-7 text-emerald-600" />
              </span>
              申し込みフォーム
            </h1>
            <p className="text-gray-600 mt-1.5 text-sm">フォーム作成・申し込み管理</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowOnboarding(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors min-h-[44px]"
            >
              <BookOpen className="w-4 h-4" />
              使い方
            </button>
            <Link href="/order-form/new" className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all min-h-[44px]">
              <Plus className="w-4 h-4" />新しいフォーム
            </Link>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">フォーム数</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{forms.length}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">公開中</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{publishedCount}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">総申し込み</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalSubmissions}</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Stripe</p>
            <div className="mt-1">
              <StripeConnectStatus userId={userId} compact />
            </div>
          </div>
        </div>

        {/* Stripe Connect 詳細ステータス */}
        <div className="mb-6">
          <StripeConnectStatus userId={userId} />
        </div>

        {/* ローディング */}
        {formsLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        )}

        {/* 空状態 */}
        {!formsLoading && forms.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-sm">
            <div className="bg-emerald-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ClipboardCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">まだフォームがありません</h3>
            <p className="text-gray-500 mb-6 text-sm">申し込みフォームを作成して、決済や顧客管理を効率化しましょう</p>
            <Link href="/order-form/new" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]">
              <Plus className="w-4 h-4" />最初のフォームを作成
            </Link>
          </div>
        )}

        {/* フォーム一覧 */}
        {!formsLoading && forms.length > 0 && (
          <div className="grid gap-3">
            {forms.map((form) => (
              <div
                key={form.id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-all duration-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <Link href={`/order-form/editor/${form.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-bold text-gray-900 text-lg truncate">{form.title}</h3>
                      {form.status === 'published' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">
                          <Globe className="w-3 h-3" />公開中
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full">
                          下書き
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        {form.payment_type === 'free' ? (
                          <FileText className="w-4 h-4 text-gray-400" />
                        ) : (
                          <CreditCard className="w-4 h-4 text-emerald-500" />
                        )}
                        {form.payment_type === 'free' ? '無料' : `${form.price.toLocaleString()}円`}
                      </span>
                      <span className="flex items-center gap-1">
                        <BarChart3 className="w-4 h-4 text-gray-400" />
                        {form.submission_count}件
                      </span>
                      <span className="text-gray-400">{formatRelativeDate(form.created_at)}</span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1 ml-4">
                    {form.status === 'published' && (
                      <a
                        href={`/order-form/${form.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(form.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <Link
                      href={`/order-form/editor/${form.id}`}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
