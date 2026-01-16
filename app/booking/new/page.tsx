'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  ArrowLeft,
  Loader2,
  Clock,
  FileText,
  CalendarCheck,
  CalendarClock,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CreateBookingMenuInput, BookingMenuType } from '@/types/booking';
import { createBookingMenu } from '@/app/actions/booking';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';

export default function NewBookingMenuPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showEditKeyModal, setShowEditKeyModal] = useState(false);
  const [createdMenu, setCreatedMenu] = useState<{ id: string; edit_key?: string | null } | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState<CreateBookingMenuInput>({
    title: '',
    description: '',
    duration_min: 60,
    type: 'reservation',
    is_active: true,
  });

  useEffect(() => {
    const checkAuth = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({ id: user.id, email: user.email });
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setUser(null);
    }
  };

  const navigateTo = (page: string) => {
    if (page === '/' || page === '') {
      router.push('/');
    } else {
      router.push(`/${page}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    setError(null);

    try {
      const result = await createBookingMenu(user?.id || null, formData);

      if (result.success && result.data) {
        const menu = result.data;
        
        // 編集キーをローカルストレージに保存
        if (!user && menu.edit_key) {
          const editKeys = JSON.parse(localStorage.getItem('booking_edit_keys') || '[]');
          editKeys.push({ menuId: menu.id, editKey: menu.edit_key, createdAt: new Date().toISOString() });
          localStorage.setItem('booking_edit_keys', JSON.stringify(editKeys));
        }

        setCreatedMenu(menu);

        // 非ログインユーザーの場合、編集キーを表示
        if (!user && menu.edit_key) {
          setShowEditKeyModal(true);
          setSubmitting(false);
        } else {
          // ログインユーザーの場合、直接枠設定画面へ
          router.push(`/booking/slots/${menu.id}`);
        }
      } else {
        setError('error' in result ? result.error : '作成に失敗しました');
        setSubmitting(false);
      }
    } catch (err) {
      console.error('Menu creation error:', err);
      setError('予約メニューの作成中にエラーが発生しました');
      setSubmitting(false);
    }
  };

  const copyEditKey = () => {
    if (createdMenu?.edit_key) {
      navigator.clipboard.writeText(createdMenu.edit_key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const proceedToSlots = () => {
    if (createdMenu) {
      router.push(`/booking/slots/${createdMenu.id}?key=${createdMenu.edit_key}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header 
          setPage={navigateTo}
          user={user}
          onLogout={handleLogout}
          setShowAuth={setShowAuth}
        />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 64px)' }}>
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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

      {/* 編集キー表示モーダル */}
      {showEditKeyModal && createdMenu?.edit_key && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">🎉 予約メニューを作成しました！</h2>
              <button
                onClick={() => setShowEditKeyModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-amber-800 font-semibold mb-2">
                ⚠️ 重要：この編集キーを必ず保存してください
              </p>
              <p className="text-xs text-amber-700">
                ログインしていないため、このキーを使って予約メニューを編集できます。
                このキーを紛失すると、メニューの編集ができなくなります。
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                編集キー
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={createdMenu.edit_key}
                  readOnly
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-gray-900 font-mono text-sm"
                />
                <button
                  onClick={copyEditKey}
                  className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  title="コピー"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={proceedToSlots}
                className="w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                予約枠を設定する
              </button>
              <button
                onClick={() => router.push('/booking')}
                className="w-full py-3 px-6 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
              >
                後で設定する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            <ArrowLeft size={20} />
            戻る
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">新規メニュー作成</h1>
              <p className="text-sm text-gray-500">予約メニューの基本情報を設定</p>
            </div>
          </div>

          {!user && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-blue-800">
                💡 <strong>ログインなしでも作成できます！</strong>
                作成後に編集キーが発行されます。ログインすると、マイページで一括管理できます。
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* メニュータイプ選択 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CalendarCheck size={20} className="text-blue-600" />
              メニュータイプ
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'reservation' })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.type === 'reservation'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    formData.type === 'reservation' ? 'bg-blue-500' : 'bg-gray-200'
                  }`}>
                    <CalendarCheck size={20} className={formData.type === 'reservation' ? 'text-white' : 'text-gray-500'} />
                  </div>
                  <span className={`font-bold ${formData.type === 'reservation' ? 'text-blue-700' : 'text-gray-700'}`}>
                    予約
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  お客様が空いている枠から選んで予約できます
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'adjustment' })}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  formData.type === 'adjustment'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    formData.type === 'adjustment' ? 'bg-purple-500' : 'bg-gray-200'
                  }`}>
                    <CalendarClock size={20} className={formData.type === 'adjustment' ? 'text-white' : 'text-gray-500'} />
                  </div>
                  <span className={`font-bold ${formData.type === 'adjustment' ? 'text-purple-700' : 'text-gray-700'}`}>
                    日程調整
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  複数の候補日から都合の良い日を選んでもらえます
                </p>
              </button>
            </div>
          </div>

          {/* 基本情報 */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} className="text-blue-600" />
              基本情報
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  メニュータイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例: 30分無料相談"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  説明（任意）
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="メニューの説明を入力してください"
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-gray-900 placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  所要時間
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={formData.duration_min}
                    onChange={(e) => setFormData({ ...formData, duration_min: Number(e.target.value) })}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900"
                  >
                    <option value={15}>15分</option>
                    <option value={30}>30分</option>
                    <option value={45}>45分</option>
                    <option value={60}>60分</option>
                    <option value={90}>90分</option>
                    <option value={120}>120分</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* 送信ボタン */}
          <div className="flex gap-4">
            <Link
              href="/booking"
              className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-center"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={submitting || !formData.title.trim()}
              className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  作成中...
                </>
              ) : (
                <>
                  作成して次へ
                </>
              )}
            </button>
          </div>
        </form>
      </main>

      <Footer 
        setPage={navigateTo}
        onCreate={(service) => service && navigateTo(`${service}/editor`)}
        user={user}
        setShowAuth={setShowAuth}
      />
    </div>
  );
}

