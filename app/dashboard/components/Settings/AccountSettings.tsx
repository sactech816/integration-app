'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';

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

  // 状態管理
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

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
