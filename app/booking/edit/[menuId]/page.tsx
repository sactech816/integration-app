'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  ArrowLeft,
  Loader2,
  Clock,
  FileText,
  CalendarCheck,
  CalendarClock,
  Save,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BookingMenu, UpdateBookingMenuInput } from '@/types/booking';
import { getBookingMenu, updateBookingMenu } from '@/app/actions/booking';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import AuthModal from '@/components/shared/AuthModal';

export default function EditBookingMenuPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const menuId = params.menuId as string;
  const editKey = searchParams.get('key');

  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [menu, setMenu] = useState<BookingMenu | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const [formData, setFormData] = useState<UpdateBookingMenuInput>({
    title: '',
    description: '',
    duration_min: 60,
    type: 'reservation',
    is_active: true,
  });

  useEffect(() => {
    const loadData = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({ id: user.id, email: user.email });
      }

      const menuData = await getBookingMenu(menuId);
      if (!menuData) {
        router.push('/booking');
        return;
      }

      // 認証チェック: ユーザーIDまたは編集キー
      const isAuthorized = 
        (user && menuData.user_id === user.id) ||
        (editKey && menuData.edit_key === editKey);

      if (!isAuthorized) {
        alert('このメニューを編集する権限がありません');
        router.push('/booking');
        return;
      }

      setMenu(menuData);
      setFormData({
        title: menuData.title,
        description: menuData.description || '',
        duration_min: menuData.duration_min,
        type: menuData.type,
        is_active: menuData.is_active,
      });
      setLoading(false);
    };

    loadData();
  }, [router, menuId, editKey]);

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
    if (!menu) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    const result = await updateBookingMenu(menu.id, user?.id || null, formData, editKey || undefined);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError('error' in result ? result.error : '更新に失敗しました');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header 
          setPage={navigateTo}
          user={user}
          onLogout={handleLogout}
          setShowAuth={setShowAuth}
        />
        <div className="flex-1 flex items-center justify-center">
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

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-3xl mx-auto px-4 py-8 w-full">
        <div className="mb-6">
          <Link
            href="/booking"
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
              <h1 className="text-2xl font-bold text-gray-900">メニュー編集</h1>
              <p className="text-sm text-gray-500">予約メニューの設定を変更</p>
            </div>
          </div>

          {editKey && !user && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm text-amber-800">
                ⚠️ 編集キーで編集しています。ログインすると、マイページで一括管理できます。
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

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                  このメニューを公開する
                </label>
              </div>
            </div>
          </div>

          {/* 成功メッセージ */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl flex items-center gap-2">
              <CalendarCheck size={20} />
              保存しました
            </div>
          )}

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
              戻る
            </Link>
            <button
              type="submit"
              disabled={submitting || !formData.title?.trim()}
              className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save size={20} />
                  保存
                </>
              )}
            </button>
          </div>

          {/* 枠管理へのリンク */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <Link
              href={`/booking/slots/${menuId}${editKey ? `?key=${editKey}` : ''}`}
              className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Calendar size={24} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-blue-700">予約枠を管理</p>
                  <p className="text-sm text-gray-600">
                    カレンダーで予約可能な日時を設定
                  </p>
                </div>
              </div>
              <ArrowLeft size={20} className="text-blue-500 rotate-180" />
            </Link>
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

