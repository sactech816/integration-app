'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  User,
  Mail,
  Lock,
  Bell,
  Trash2,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  Crown,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { fetchSubscriptionStatus, SubscriptionStatus } from '@/lib/subscription';

type AccountSettingsProps = {
  user: { id: string; email?: string } | null;
  onLogout: () => void;
};

export default function AccountSettings({ user, onLogout }: AccountSettingsProps) {
  // 基本設定
  const [displayName, setDisplayName] = useState('');
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // 通知設定
  const [emailNotifications, setEmailNotifications] = useState(true);

  // サブスクリプション状態
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  // 状態管理
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // サブスクリプション状態を取得
  useEffect(() => {
    const loadSubscriptionStatus = async () => {
      if (!user?.id) {
        setLoadingSubscription(false);
        return;
      }
      try {
        const status = await fetchSubscriptionStatus(user.id);
        setSubscriptionStatus(status);
      } catch (error) {
        console.error('Failed to load subscription status:', error);
      } finally {
        setLoadingSubscription(false);
      }
    };
    loadSubscriptionStatus();
  }, [user?.id]);

  // メッセージ
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setErrorMessage('');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setSuccessMessage('');
    setTimeout(() => setErrorMessage(''), 5000);
  };

  // メールアドレス変更
  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase || !newEmail) return;

    setSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      showSuccess('確認メールを送信しました。メール内のリンクをクリックして変更を完了してください。');
    } catch (error) {
      showError('メールアドレスの変更に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
    } finally {
      setSavingEmail(false);
    }
  };

  // パスワード変更
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    if (newPassword !== confirmPassword) {
      showError('新しいパスワードが一致しません');
      return;
    }

    if (newPassword.length < 6) {
      showError('パスワードは6文字以上で入力してください');
      return;
    }

    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      showSuccess('パスワードを変更しました');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      showError('パスワードの変更に失敗しました: ' + (error instanceof Error ? error.message : '不明なエラー'));
    } finally {
      setSavingPassword(false);
    }
  };

  // 通知設定保存
  const handleNotificationsSave = async () => {
    setSavingNotifications(true);
    try {
      // TODO: 通知設定をデータベースに保存する処理を実装
      await new Promise(resolve => setTimeout(resolve, 500)); // 仮の遅延
      showSuccess('通知設定を保存しました');
    } catch (error) {
      showError('通知設定の保存に失敗しました');
    } finally {
      setSavingNotifications(false);
    }
  };

  // アカウント削除
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== '削除する') {
      showError('「削除する」と入力してください');
      return;
    }

    setDeletingAccount(true);
    try {
      // TODO: アカウント削除APIを呼び出す
      // 現在はSupabaseの管理者権限が必要なため、APIルートを作成する必要がある
      showError('アカウント削除機能は現在準備中です。お問い合わせフォームからご連絡ください。');
    } catch (error) {
      showError('アカウントの削除に失敗しました');
    } finally {
      setDeletingAccount(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500">ログインが必要です</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
        <User size={28} className="text-indigo-600" />
        アカウント設定
      </h1>

      {/* 成功/エラーメッセージ */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <CheckCircle size={18} />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
          <AlertTriangle size={18} />
          {errorMessage}
        </div>
      )}

      {/* 現在のプラン */}
      <div className={`p-6 rounded-2xl shadow-sm border ${
        subscriptionStatus?.hasActiveSubscription 
          ? 'bg-gradient-to-r from-orange-50 to-pink-50 border-orange-200' 
          : 'bg-white border-gray-200'
      }`}>
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Crown size={20} className={subscriptionStatus?.hasActiveSubscription ? 'text-orange-500' : 'text-gray-400'} />
          現在のプラン
        </h2>
        
        {loadingSubscription ? (
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 size={16} className="animate-spin" />
            読み込み中...
          </div>
        ) : subscriptionStatus?.hasActiveSubscription ? (
          // プロプラン表示
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold text-sm">
                ビジネス向け
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                プロプラン
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">¥3,980</span>
              <span className="text-gray-500">/月</span>
            </div>
            <p className="text-gray-600">
              本格的なビジネス運用に。制限なしで使い放題。
            </p>
            <div className="bg-white/60 rounded-xl p-4 space-y-2">
              <p className="text-sm font-bold text-gray-700 mb-2">ご利用中の機能</p>
              <ul className="space-y-1.5 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  新規作成・編集・更新
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  ポータル掲載・URL発行
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  アフィリエイト機能
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  アクセス解析
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  AI利用（優先）
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  HTMLダウンロード
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  埋め込みコード発行
                </li>
              </ul>
            </div>
            {subscriptionStatus.isMonitor && (
              <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-lg text-sm">
                <span className="font-bold">モニター特典適用中</span>
                {subscriptionStatus.monitorExpiresAt && (
                  <span className="ml-2">
                    （{new Date(subscriptionStatus.monitorExpiresAt).toLocaleDateString('ja-JP')}まで）
                  </span>
                )}
              </div>
            )}
          </div>
        ) : (
          // フリープラン表示 + プロプランへの誘導
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-full font-bold text-sm">
                標準
              </div>
              <span className="text-2xl font-bold text-indigo-700">
                フリープラン
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-gray-900">¥0</span>
              <span className="text-gray-500">/月</span>
            </div>
            <p className="text-gray-600">
              15秒でできるアカウント登録だけでOK！ずっと無料で使い放題。
            </p>
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              <p className="text-sm font-bold text-gray-700 mb-2">ご利用中の機能</p>
              <ul className="space-y-1.5 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  新規作成
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  ポータル掲載
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  URL発行
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  編集・更新
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  アフィリエイト機能
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  アクセス解析
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  AI利用（回数制限）
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <span className="w-3.5 h-3.5 flex items-center justify-center">×</span>
                  HTMLダウンロード
                </li>
                <li className="flex items-center gap-2 text-gray-400">
                  <span className="w-3.5 h-3.5 flex items-center justify-center">×</span>
                  埋め込みコード発行
                </li>
              </ul>
            </div>

            {/* プロプランへの誘導 */}
            <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl p-5 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={20} />
                <span className="font-bold">プロプランにアップグレード</span>
              </div>
              <p className="text-sm text-white/90 mb-4">
                HTMLダウンロード、埋め込みコード発行、AI優先利用など、
                ビジネスに必要な全機能が使い放題！
              </p>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-bold">¥3,980</span>
                <span className="text-white/80">/月</span>
              </div>
              <a
                href="/dashboard?tab=subscription"
                className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors"
              >
                プロプラン詳細
                <ArrowRight size={18} />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 基本情報 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Mail size={20} className="text-blue-600" />
          メールアドレス
        </h2>
        <form onSubmit={handleEmailChange} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              現在のメールアドレス
            </label>
            <p className="text-gray-600 bg-gray-50 px-4 py-3 rounded-lg">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              新しいメールアドレス
            </label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="新しいメールアドレス"
            />
          </div>
          <button
            type="submit"
            disabled={savingEmail || newEmail === user.email}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {savingEmail ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            メールアドレスを変更
          </button>
        </form>
      </div>

      {/* パスワード変更 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Lock size={20} className="text-purple-600" />
          パスワード変更
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              新しいパスワード
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-12"
                placeholder="6文字以上"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              新しいパスワード（確認）
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 px-4 py-3 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="もう一度入力"
            />
          </div>
          <button
            type="submit"
            disabled={savingPassword || !newPassword || !confirmPassword}
            className="bg-purple-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {savingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
            パスワードを変更
          </button>
        </form>
      </div>

      {/* 通知設定 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Bell size={20} className="text-amber-600" />
          通知設定
        </h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-bold text-gray-900">メール通知</p>
              <p className="text-sm text-gray-500">予約通知、お知らせなどをメールで受け取る</p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-14 h-7 rounded-full transition-colors ${
                  emailNotifications ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
                onClick={() => setEmailNotifications(!emailNotifications)}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-1 ${
                    emailNotifications ? 'translate-x-8' : 'translate-x-1'
                  }`}
                />
              </div>
            </div>
          </label>
          <button
            onClick={handleNotificationsSave}
            disabled={savingNotifications}
            className="bg-amber-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {savingNotifications ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            通知設定を保存
          </button>
        </div>
      </div>

      {/* アカウント削除 */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-200">
        <h2 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
          <Trash2 size={20} />
          アカウント削除
        </h2>
        <p className="text-gray-600 mb-4">
          アカウントを削除すると、作成したすべてのコンテンツ（診断クイズ、プロフィールLP、ビジネスLPなど）が完全に削除されます。この操作は取り消せません。
        </p>
        
        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="bg-red-100 text-red-600 px-6 py-2.5 rounded-lg font-bold hover:bg-red-200 flex items-center gap-2"
          >
            <Trash2 size={16} />
            アカウントを削除する
          </button>
        ) : (
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <p className="text-red-700 font-bold mb-3">
              本当に削除しますか？確認のため「削除する」と入力してください。
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="w-full border border-red-300 px-4 py-3 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 mb-3"
              placeholder="削除する"
            />
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount || deleteConfirmText !== '削除する'}
                className="bg-red-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {deletingAccount ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                完全に削除する
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteConfirmText('');
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg font-bold hover:bg-gray-300"
              >
                キャンセル
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
