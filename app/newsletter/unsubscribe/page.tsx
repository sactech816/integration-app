'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MailX, CheckCircle2, Loader2 } from 'lucide-react';

function UnsubscribeContent() {
  const searchParams = useSearchParams();
  const listId = searchParams.get('listId');
  const email = searchParams.get('email');

  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const handleUnsubscribe = async () => {
    if (!listId || !email) return;
    setProcessing(true);
    setError('');

    const res = await fetch('/api/newsletter-maker/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listId, email }),
    });

    if (res.ok) {
      setDone(true);
    } else {
      setError('配信停止処理に失敗しました。もう一度お試しください。');
    }
    setProcessing(false);
  };

  if (!listId || !email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <MailX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">無効なリンクです</h2>
          <p className="text-gray-600">配信停止リンクが正しくありません。</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center bg-white border border-gray-200 rounded-2xl shadow-lg p-8">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">配信停止が完了しました</h2>
          <p className="text-gray-600">
            {email} への配信を停止しました。今後メールは届きません。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-lg p-8 text-center">
        <MailX className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">配信停止</h2>
        <p className="text-gray-600 mb-6">
          <span className="font-medium text-gray-900">{email}</span> への配信を停止しますか？
        </p>

        {error && (
          <p className="text-red-600 text-sm font-medium mb-4">{error}</p>
        )}

        <button
          onClick={handleUnsubscribe}
          disabled={processing}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md disabled:opacity-50 transition-all min-h-[44px]"
        >
          {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : <MailX className="w-5 h-5" />}
          {processing ? '処理中...' : '配信を停止する'}
        </button>
      </div>
    </div>
  );
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-violet-500" /></div>}>
      <UnsubscribeContent />
    </Suspense>
  );
}
