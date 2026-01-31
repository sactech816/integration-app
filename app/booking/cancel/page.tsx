'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Loader2,
  Clock,
  Check,
  AlertCircle,
  ArrowLeft,
  XCircle,
} from 'lucide-react';
import ContentFooter from '@/components/shared/ContentFooter';

interface BookingInfo {
  id: string;
  guest_name: string;
  status: string;
  slot: {
    id: string;
    start_time: string;
    end_time: string;
    menu: {
      id: string;
      title: string;
      description?: string;
      duration_min: number;
    };
  };
}

// 日時フォーマット
const formatDateTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  });
};

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Tokyo',
  });
};

export default function CancelBookingPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<BookingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!token) {
        setError('キャンセルトークンが指定されていません');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/booking/cancel?token=${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error === 'Booking not found' ? '予約が見つかりません' : data.error);
          setLoading(false);
          return;
        }

        setBooking(data.booking);
        if (data.booking.status === 'cancelled') {
          setCancelled(true);
        }
      } catch (err) {
        console.error('Failed to fetch booking:', err);
        setError('予約情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [token]);

  const handleCancel = async () => {
    if (!token || cancelling) return;

    setCancelling(true);
    setError(null);

    try {
      const res = await fetch('/api/booking/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cancel_token: token }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'Booking is already cancelled') {
          setCancelled(true);
        } else {
          setError(data.error || 'キャンセルに失敗しました');
        }
        setCancelling(false);
        return;
      }

      setCancelled(true);
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      setError('キャンセル処理中にエラーが発生しました');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
            <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">エラー</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline"
            >
              <ArrowLeft size={18} />
              トップページへ戻る
            </Link>
          </div>
        </div>
        <ContentFooter toolType="booking" variant="light" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-br from-red-500 to-orange-600">
              <XCircle className="text-white" size={28} />
            </div>
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold mb-1 bg-red-100 text-red-700">
                予約キャンセル
              </span>
              <h1 className="text-2xl font-bold text-gray-900">
                {booking?.slot?.menu?.title || '予約のキャンセル'}
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full">
        {cancelled ? (
          /* キャンセル完了画面 */
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">キャンセルが完了しました</h2>
            <p className="text-gray-600 mb-6">
              予約がキャンセルされました。<br />
              確認メールをお送りしましたのでご確認ください。
            </p>
            {booking && (
              <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                <p className="text-sm text-gray-500 mb-2">キャンセルした予約:</p>
                <div className="font-bold text-gray-900">
                  {formatDateTime(booking.slot.start_time)}
                </div>
                <div className="text-gray-600">
                  {formatTime(booking.slot.start_time)} - {formatTime(booking.slot.end_time)}
                </div>
              </div>
            )}
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline"
            >
              <ArrowLeft size={18} />
              トップページへ
            </Link>
          </div>
        ) : (
          /* キャンセル確認画面 */
          <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle size={32} className="text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">予約をキャンセルしますか？</h2>
              <p className="text-gray-600">
                以下の予約をキャンセルします。この操作は取り消せません。
              </p>
            </div>

            {booking && (
              <div className="bg-blue-50 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Calendar size={24} className="text-blue-600 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 mb-1">
                      {booking.slot.menu.title}
                    </div>
                    <div className="text-blue-700 font-semibold">
                      {formatDateTime(booking.slot.start_time)}
                    </div>
                    <div className="text-gray-600 text-sm mt-1">
                      {formatTime(booking.slot.start_time)} - {formatTime(booking.slot.end_time)}
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 text-sm mt-2">
                      <Clock size={14} />
                      <span>{booking.slot.menu.duration_min}分</span>
                    </div>
                    {booking.guest_name && (
                      <div className="text-gray-600 text-sm mt-1">
                        予約者: {booking.guest_name}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2 mb-4">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Link
                href="/"
                className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-xl font-semibold text-center hover:bg-gray-200 transition-colors"
              >
                戻る
              </Link>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    キャンセル中...
                  </>
                ) : (
                  <>
                    <XCircle size={18} />
                    キャンセルする
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* フッター */}
      <ContentFooter toolType="booking" variant="light" />
    </div>
  );
}
