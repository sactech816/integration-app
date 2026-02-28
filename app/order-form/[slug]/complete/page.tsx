'use client';

import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function OrderCompletePageWrapper() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-lg p-8 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">お支払いが完了しました</h2>
        <p className="text-gray-600 mb-6">
          お申し込みありがとうございます。確認メールをお送りしました。
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl shadow-md hover:bg-emerald-700 transition-all min-h-[44px]"
        >
          トップに戻る
        </Link>
      </div>
    </div>
  );
}
