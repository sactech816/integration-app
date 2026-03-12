'use client';

import { Rocket, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface MakersPromoBannerProps {
  /** バナーの文脈に合わせたキャッチコピー */
  headline?: string;
  /** サブテキスト */
  description?: string;
}

/**
 * 集客メーカーへの導線バナー（診断結果ページ等に設置）
 */
export default function MakersPromoBanner({
  headline = '自分の強みを知ったら、次はビジネスに活かそう',
  description = '診断・LP・セールスレター・予約フォームなど、集客に必要なツールがすべて揃う集客プラットフォーム',
}: MakersPromoBannerProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-2xl shadow-lg">
      {/* 背景装飾 */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="relative px-6 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
            <Rocket className="text-white" size={28} />
          </div>

          <div className="flex-1 text-center sm:text-left">
            <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
              {headline}
            </h3>
            <p className="text-sm text-blue-100 mt-2 leading-relaxed">
              {description}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-700 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all text-sm sm:text-base flex-shrink-0"
          >
            無料で始める
            <ArrowRight size={18} />
          </Link>
        </div>

        <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-5 ml-0 sm:ml-20">
          {['診断クイズ', 'プロフィールLP', 'セールスレター', '予約フォーム', 'メルマガ'].map((tool) => (
            <span
              key={tool}
              className="text-xs bg-white/15 text-white/90 px-3 py-1 rounded-full backdrop-blur-sm"
            >
              {tool}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
