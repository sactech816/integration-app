'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useUserPlan } from '@/lib/hooks/useUserPlan';
import NewsletterDashboard from '@/components/newsletter/NewsletterDashboard';
import Link from 'next/link';
import { Mail, Lock, Loader2 } from 'lucide-react';

export default function NewsletterDashboardPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const { userPlan, isLoading: planLoading } = useUserPlan(userId);

  useEffect(() => {
    const init = async () => {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      setAuthLoading(false);
    };
    init();
  }, []);

  if (authLoading || planLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-md text-center">
          <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ログインが必要です</h2>
          <p className="text-gray-600 mb-6">メルマガ機能を利用するにはログインしてください。</p>
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl shadow-md hover:bg-violet-700 transition-all min-h-[44px]">
            ログインページへ
          </Link>
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
          <p className="text-gray-600 mb-6">メルマガ機能はPROプラン（月額3,980円）でご利用いただけます。</p>
          <Link href="/newsletter" className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl shadow-md hover:bg-violet-700 transition-all min-h-[44px]">
            詳しく見る
          </Link>
        </div>
      </div>
    );
  }

  return <NewsletterDashboard />;
}
