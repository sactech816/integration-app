'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/shared/Header';
import { MonetizeDiagnosis } from '@/components/diagnosis/monetize/MonetizeDiagnosis';
import { Sparkles, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function MonetizeDiagnosisPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser({ id: authUser.id, email: authUser.email || undefined });
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
        <div className="flex items-center justify-center pt-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
        <Header user={null} onLogout={handleLogout} setShowAuth={setShowAuth} />
        <div className="max-w-lg mx-auto px-4 pt-32 text-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <Sparkles className="w-12 h-12 text-violet-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">才能マネタイズ診断</h2>
            <p className="text-gray-600 mb-6">
              あなたの才能を分析し、Kindle出版・オンライン講座・コンサルなど最適な収益化ルートを提案します。
            </p>
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-semibold rounded-xl shadow-md hover:bg-violet-700 transition-all duration-200"
            >
              <LogIn className="w-5 h-5" />
              ログインして診断を始める
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-indigo-50">
      <Header user={user} onLogout={handleLogout} setShowAuth={setShowAuth} />
      <MonetizeDiagnosis userId={user.id} />
    </div>
  );
}
