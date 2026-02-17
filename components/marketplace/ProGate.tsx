'use client';

import React from 'react';
import { Crown, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ProGate() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Crown className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          プロプラン限定機能
        </h2>
        <p className="text-gray-600 mb-6">
          スキルマーケットプレイスはプロプランユーザー限定の機能です。
          プロプランに登録して、スキルの出品・依頼をはじめましょう。
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          プロプランを見る
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
