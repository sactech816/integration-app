'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useUserPlan } from '@/lib/hooks/useUserPlan';
import {
  FileText, Plus, Trash2, ChevronRight, Globe, Lock, Loader2,
  CreditCard, Eye,
} from 'lucide-react';
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

export default function OrderFormDashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { userPlan, isLoading: planLoading } = useUserPlan(userId);
  const [forms, setForms] = useState<OrderForm[]>([]);

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
    const res = await fetch(`/api/order-form?userId=${uid}`);
    if (res.ok) {
      const data = await res.json();
      setForms(data.forms || []);
    }
  };

  const handleDelete = async (formId: string) => {
    if (!userId || !confirm('このフォームを削除しますか？')) return;
    const res = await fetch(`/api/order-form/${formId}?userId=${userId}`, { method: 'DELETE' });
    if (res.ok) {
      setForms((prev) => prev.filter((f) => f.id !== formId));
    }
  };

  if (authLoading || planLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ログインが必要です</h2>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl shadow-md hover:bg-emerald-700 transition-all min-h-[44px]">ログインページへ</Link>
        </div>
      </div>
    );
  }

  if (!userPlan.isProUser) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <Lock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">PROプラン限定機能</h2>
          <p className="text-gray-600 mb-6">申し込みフォーム機能はPROプラン（月額3,980円）でご利用いただけます。</p>
          <Link href="/order-form" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl shadow-md hover:bg-emerald-700 transition-all min-h-[44px]">詳しく見る</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">申し込みフォーム</h1>
          <p className="text-gray-600 mt-1">フォーム作成・申し込み管理</p>
        </div>
        <Link href="/order-form/new" className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all min-h-[44px]">
          <Plus className="w-4 h-4" />新しいフォーム
        </Link>
      </div>

      {/* Stripe Connect ステータス */}
      <div className="mb-6">
        <StripeConnectStatus userId={userId} />
      </div>

      {forms.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-4">まだフォームがありません</p>
          <Link href="/order-form/new" className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition-all min-h-[44px]">
            <Plus className="w-4 h-4" />最初のフォームを作成
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {forms.map((form) => (
            <div key={form.id} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all duration-200">
              <div className="flex items-center justify-between">
                <Link href={`/order-form/editor/${form.id}`} className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 text-lg truncate">{form.title}</h3>
                    {form.status === 'published' ? (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700 rounded-full">公開中</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-500 rounded-full">下書き</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      {form.payment_type === 'free' ? <FileText className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                      {form.payment_type === 'free' ? '無料' : `${form.price.toLocaleString()}円`}
                    </span>
                    <span>{form.submission_count}件の申し込み</span>
                  </div>
                </Link>
                <div className="flex items-center gap-2 ml-4">
                  {form.status === 'published' && (
                    <a href={`/order-form/${form.slug}`} target="_blank" rel="noopener noreferrer" className="p-2 text-emerald-600 hover:text-emerald-800 min-h-[44px] min-w-[44px] flex items-center justify-center">
                      <Eye className="w-4 h-4" />
                    </a>
                  )}
                  <button onClick={() => handleDelete(form.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <Link href={`/order-form/editor/${form.id}`} className="p-2 text-gray-400 hover:text-emerald-600 min-h-[44px] min-w-[44px] flex items-center justify-center">
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
