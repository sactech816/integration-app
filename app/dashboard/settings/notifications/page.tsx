'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  getUserGamificationSettings, 
  updateUserNotificationSettings 
} from '@/app/actions/gamification';
import { UserGamificationSettings } from '@/lib/types';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';
import {
  Bell,
  Gift,
  Calendar,
  Stamp,
  Target,
  Coins,
  Save,
  Loader2,
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';

interface NotificationToggleProps {
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

function NotificationToggle({ label, description, icon, enabled, onToggle }: NotificationToggleProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${enabled ? 'bg-teal-100 text-teal-600' : 'bg-gray-100 text-gray-400'}`}>
          {icon}
        </div>
        <div>
          <p className="font-medium text-gray-900">{label}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <button
        onClick={() => onToggle(!enabled)}
        className={`p-1 rounded-lg transition-colors ${enabled ? 'text-teal-600' : 'text-gray-400'}`}
        aria-label={enabled ? '無効にする' : '有効にする'}
      >
        {enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
      </button>
    </div>
  );
}

export default function NotificationSettingsPage() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 設定状態
  const [settings, setSettings] = useState<Partial<UserGamificationSettings>>({
    hide_login_bonus_toast: false,
    hide_welcome_toast: false,
    hide_stamp_notifications: false,
    hide_mission_notifications: false,
    hide_point_notifications: false,
  });

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
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
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
      if (!user) return;
      
      const userSettings = await getUserGamificationSettings(user.id);
      if (userSettings) {
        setSettings({
          hide_login_bonus_toast: userSettings.hide_login_bonus_toast,
          hide_welcome_toast: userSettings.hide_welcome_toast,
          hide_stamp_notifications: userSettings.hide_stamp_notifications,
          hide_mission_notifications: userSettings.hide_mission_notifications,
          hide_point_notifications: userSettings.hide_point_notifications,
        });
      }
    }

    loadSettings();
  }, [user]);

  // 設定を保存
  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setMessage(null);

    try {
      await updateUserNotificationSettings(user.id, settings);
      setMessage({ type: 'success', text: '設定を保存しました' });
      
      // ローカルストレージのキャッシュをクリア
      if (typeof window !== 'undefined') {
        // ウェルカムボーナスのキャッシュをクリア（再表示可能にする）
        if (!settings.hide_welcome_toast) {
          localStorage.removeItem(`welcome_bonus_checked_${user.id}`);
        }
      }
    } catch (error) {
      console.error('Save error:', error);
      setMessage({ type: 'error', text: '設定の保存に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  // トグル変更
  const handleToggle = (key: keyof typeof settings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
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

  // 未ログイン
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header user={user} onAuthClick={() => setShowAuth(true)} />
        <main className="max-w-2xl mx-auto px-4 py-12">
          <div className="text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">ログインが必要です</h1>
            <p className="text-gray-600 mb-6">通知設定を変更するにはログインしてください。</p>
            <button
              onClick={() => setShowAuth(true)}
              className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              ログイン
            </button>
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
      
      <main className="max-w-2xl mx-auto px-4 py-8">
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
                <Bell className="w-7 h-7 text-teal-600" />
                通知設定
              </h1>
              <p className="text-gray-600 mt-1">ゲーミフィケーション関連の通知表示を管理します</p>
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
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {message.text}
          </div>
        )}

        {/* 説明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>💡 ヒント:</strong> 通知を無効にしても、ポイントは通常通り獲得できます。
            再度通知を受け取りたい場合は、こちらで有効に切り替えてください。
          </p>
        </div>

        {/* 設定カード */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-teal-600" />
            ゲーミフィケーション通知
          </h2>

          <NotificationToggle
            label="ログインボーナス通知"
            description="毎日のログインボーナス獲得時のポップアップ"
            icon={<Calendar className="w-5 h-5" />}
            enabled={!settings.hide_login_bonus_toast}
            onToggle={(enabled) => handleToggle('hide_login_bonus_toast', !enabled)}
          />

          <NotificationToggle
            label="ウェルカムボーナス通知"
            description="初回ログイン時のウェルカムボーナスポップアップ"
            icon={<Gift className="w-5 h-5" />}
            enabled={!settings.hide_welcome_toast}
            onToggle={(enabled) => handleToggle('hide_welcome_toast', !enabled)}
          />

          <NotificationToggle
            label="スタンプ獲得通知"
            description="スタンプラリーでスタンプを獲得した時の通知"
            icon={<Stamp className="w-5 h-5" />}
            enabled={!settings.hide_stamp_notifications}
            onToggle={(enabled) => handleToggle('hide_stamp_notifications', !enabled)}
          />

          <NotificationToggle
            label="ミッション達成通知"
            description="デイリーミッション達成時の通知"
            icon={<Target className="w-5 h-5" />}
            enabled={!settings.hide_mission_notifications}
            onToggle={(enabled) => handleToggle('hide_mission_notifications', !enabled)}
          />

          <NotificationToggle
            label="ポイント獲得通知"
            description="各種ポイント獲得時の通知"
            icon={<Coins className="w-5 h-5" />}
            enabled={!settings.hide_point_notifications}
            onToggle={(enabled) => handleToggle('hide_point_notifications', !enabled)}
          />
        </div>

        {/* すべて有効/無効ボタン */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => {
              setSettings({
                hide_login_bonus_toast: false,
                hide_welcome_toast: false,
                hide_stamp_notifications: false,
                hide_mission_notifications: false,
                hide_point_notifications: false,
              });
            }}
            className="flex-1 py-2 border border-teal-600 text-teal-600 rounded-lg hover:bg-teal-50 transition-colors"
          >
            すべて有効にする
          </button>
          <button
            onClick={() => {
              setSettings({
                hide_login_bonus_toast: true,
                hide_welcome_toast: true,
                hide_stamp_notifications: true,
                hide_mission_notifications: true,
                hide_point_notifications: true,
              });
            }}
            className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
          >
            すべて無効にする
          </button>
        </div>
      </main>

      <Footer />
      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}

