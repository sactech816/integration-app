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
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CreateBookingMenuInput, BookingMenuType } from '@/types/booking';
import { createBookingMenu } from '@/app/actions/booking';

export default function NewBookingMenuPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      if (!user) {
        router.push('/');
        return;
      }

      setUser({ id: user.id });
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError(null);

    const result = await createBookingMenu(user.id, formData);

    if (result.success && result.data) {
      // 作成成功後、枠設定画面へ遷移
      router.push(`/booking/slots/${result.data.id}`);
    } else {
      setError('error' in result ? result.error : '作成に失敗しました');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/booking"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Calendar className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">新規メニュー作成</h1>
              <p className="text-xs text-gray-500">予約メニューの基本情報を設定</p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-3xl mx-auto px-4 py-8">
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
                  作成して枠を設定
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

