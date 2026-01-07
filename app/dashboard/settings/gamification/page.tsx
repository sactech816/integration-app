'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  getAllAdminGamificationSettings, 
  updateAdminGamificationSetting 
} from '@/app/actions/gamification';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import { getAdminEmails } from '@/lib/constants';
import {
  Settings,
  Gift,
  Calendar,
  Gamepad2,
  Target,
  Save,
  Loader2,
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  Coins,
  MessageSquare,
  Dice6,
  Stamp,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

interface SettingCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  children?: React.ReactNode;
}

function SettingCard({ title, description, icon, enabled, onToggle, children }: SettingCardProps) {
  return (
    <div className={`bg-white rounded-xl border ${enabled ? 'border-teal-200' : 'border-gray-200'} p-6 transition-all`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${enabled ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'}`}>
            {icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          className={`p-1 rounded-lg transition-colors ${enabled ? 'text-teal-600' : 'text-gray-400'}`}
        >
          {enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
        </button>
      </div>
      {enabled && children && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

export default function GamificationSettingsPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 設定状態
  const [settings, setSettings] = useState<Record<string, Record<string, unknown>>>({});

  // 認証チェック
  useEffect(() => {
    async function checkAuth() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const adminEmails = getAdminEmails();
        setIsAdmin(adminEmails.includes(session.user.email || ''));
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
          const adminEmails = getAdminEmails();
          setIsAdmin(adminEmails.includes(session.user.email || ''));
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      });

      setLoading(false);
      return () => subscription.unsubscribe();
    }

    checkAuth();
  }, []);

  // 設定を読み込み
  useEffect(() => {
    async function loadSettings() {
      if (!isAdmin) return;
      
      const allSettings = await getAllAdminGamificationSettings();
      setSettings(allSettings);
    }

    loadSettings();
  }, [isAdmin]);

  // 設定を保存
  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setMessage(null);

    try {
      for (const [key, value] of Object.entries(settings)) {
        await updateAdminGamificationSetting(key, value, user.id);
      }
      setMessage({ type: 'success', text: '設定を保存しました' });
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: '設定の保存に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  // 個別設定の更新
  const updateSetting = (key: string, field: string, value: unknown) => {
    setSettings(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  // ローディング表示
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  // 未ログインまたは非管理者
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onAuthClick={() => setShowAuth(true)} />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center">
            <ShieldCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">アクセス権限がありません</h1>
            <p className="text-gray-600 mb-6">この設定ページは管理者のみアクセスできます。</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700"
            >
              <ArrowLeft className="w-4 h-4" />
              ダッシュボードに戻る
            </Link>
          </div>
        </main>
        <Footer />
        <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onAuthClick={() => setShowAuth(true)} />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            ダッシュボードに戻る
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Settings className="w-7 h-7 text-teal-600" />
                ゲーミフィケーション設定
              </h1>
              <p className="text-gray-600 mt-1">各機能のON/OFFやポイント数を管理します</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              保存
            </button>
          </div>
        </div>

        {/* メッセージ */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* 設定カード */}
        <div className="space-y-6">
          {/* ウェルカムボーナス */}
          <SettingCard
            title="ウェルカムボーナス"
            description="新規ユーザーへの初回ポイント付与"
            icon={<Gift className="w-5 h-5" />}
            enabled={(settings.welcome_bonus?.enabled as boolean) ?? true}
            onToggle={(enabled) => updateSetting('welcome_bonus', 'enabled', enabled)}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Coins className="w-4 h-4 inline mr-1" />
                  付与ポイント
                </label>
                <input
                  type="number"
                  value={(settings.welcome_bonus?.points as number) ?? 100}
                  onChange={(e) => updateSetting('welcome_bonus', 'points', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MessageSquare className="w-4 h-4 inline mr-1" />
                  メッセージ
                </label>
                <input
                  type="text"
                  value={(settings.welcome_bonus?.message as string) ?? 'ようこそ！100ポイントをプレゼント！'}
                  onChange={(e) => updateSetting('welcome_bonus', 'message', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          </SettingCard>

          {/* デイリーログインボーナス */}
          <SettingCard
            title="デイリーログインボーナス"
            description="毎日ログイン時のポイント付与"
            icon={<Calendar className="w-5 h-5" />}
            enabled={(settings.daily_login_bonus?.enabled as boolean) ?? true}
            onToggle={(enabled) => updateSetting('daily_login_bonus', 'enabled', enabled)}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Coins className="w-4 h-4 inline mr-1" />
                付与ポイント（1日あたり）
              </label>
              <input
                type="number"
                value={(settings.daily_login_bonus?.points as number) ?? 10}
                onChange={(e) => updateSetting('daily_login_bonus', 'points', parseInt(e.target.value) || 0)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                min="0"
              />
            </div>
          </SettingCard>

          {/* スタンプラリー連動 */}
          <SettingCard
            title="スタンプラリー連動"
            description="クイズ・プロフィール作成時のスタンプ付与"
            icon={<Stamp className="w-5 h-5" />}
            enabled={(settings.stamp_rally_events?.enabled as boolean) ?? true}
            onToggle={(enabled) => updateSetting('stamp_rally_events', 'enabled', enabled)}
          >
            <p className="text-sm text-gray-600">
              有効にすると、クイズやプロフィールの作成時にスタンプが自動的に付与されます。
            </p>
          </SettingCard>

          {/* デイリーミッション */}
          <SettingCard
            title="デイリーミッション"
            description="毎日のミッションによるポイント獲得"
            icon={<Target className="w-5 h-5" />}
            enabled={(settings.daily_missions?.enabled as boolean) ?? true}
            onToggle={(enabled) => updateSetting('daily_missions', 'enabled', enabled)}
          >
            <p className="text-sm text-gray-600">
              有効にすると、ユーザーはデイリーミッションをクリアしてポイントを獲得できます。
            </p>
          </SettingCard>

          {/* スロットゲーム */}
          <SettingCard
            title="スロットゲーム"
            description="スロットマシン形式のガチャ"
            icon={<Dice6 className="w-5 h-5" />}
            enabled={(settings.slot_game?.enabled as boolean) ?? true}
            onToggle={(enabled) => updateSetting('slot_game', 'enabled', enabled)}
          >
            <p className="text-sm text-gray-600">
              スロットマシン形式でポイントを消費して景品を獲得できます。
            </p>
          </SettingCard>

          {/* 福引きゲーム */}
          <SettingCard
            title="福引きゲーム"
            description="福引き形式のガチャ"
            icon={<Sparkles className="w-5 h-5" />}
            enabled={(settings.fukubiki_game?.enabled as boolean) ?? true}
            onToggle={(enabled) => updateSetting('fukubiki_game', 'enabled', enabled)}
          >
            <p className="text-sm text-gray-600">
              ガラガラ抽選形式でポイントを消費して景品を獲得できます。
            </p>
          </SettingCard>

          {/* スクラッチゲーム */}
          <SettingCard
            title="スクラッチゲーム"
            description="スクラッチカード形式のガチャ"
            icon={<Gamepad2 className="w-5 h-5" />}
            enabled={(settings.scratch_game?.enabled as boolean) ?? true}
            onToggle={(enabled) => updateSetting('scratch_game', 'enabled', enabled)}
          >
            <p className="text-sm text-gray-600">
              スクラッチカードを削って景品を確認できます。
            </p>
          </SettingCard>

          {/* ポイントクイズ */}
          <SettingCard
            title="ポイントクイズ"
            description="クイズ正解でポイント獲得"
            icon={<Target className="w-5 h-5" />}
            enabled={(settings.point_quiz?.enabled as boolean) ?? true}
            onToggle={(enabled) => updateSetting('point_quiz', 'enabled', enabled)}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Coins className="w-4 h-4 inline mr-1" />
                正解1問あたりのポイント
              </label>
              <input
                type="number"
                value={(settings.point_quiz?.points_per_correct as number) ?? 10}
                onChange={(e) => updateSetting('point_quiz', 'points_per_correct', parseInt(e.target.value) || 0)}
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                min="0"
              />
            </div>
          </SettingCard>
        </div>
      </main>

      <Footer />
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}

