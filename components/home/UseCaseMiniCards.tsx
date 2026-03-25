'use client';

import { ArrowRight } from 'lucide-react';
import { USE_CASE_SETS } from '@/lib/tools-data';

export default function UseCaseMiniCards() {
  return (
    <section className="py-16 bg-white border-b" style={{ borderColor: '#ffedd5' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: '#5d4037' }}>
            あなたの業種に合ったツールの組み合わせ
          </h2>
          <p className="text-gray-600 text-sm">
            業種ごとに最適なツールセットをご提案します
          </p>
        </div>

        {/* モバイル: 横スクロール、デスクトップ: グリッド */}
        <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto pb-4 md:pb-0 snap-x snap-mandatory md:snap-none -mx-4 px-4 md:mx-0 md:px-0">
          {USE_CASE_SETS.map((useCase) => (
            <a
              key={useCase.persona}
              href={useCase.href}
              className="flex-shrink-0 w-[280px] md:w-auto snap-start rounded-2xl border-2 bg-white overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1 block"
              style={{ borderColor: `${useCase.color}30` }}
            >
              {/* ヘッダー */}
              <div
                className="px-5 py-3"
                style={{ backgroundColor: useCase.bgColor }}
              >
                <div className="font-black text-sm" style={{ color: useCase.color }}>
                  {useCase.persona}
                </div>
                <p className="text-xs mt-0.5" style={{ color: `${useCase.color}cc` }}>
                  {useCase.description}
                </p>
              </div>

              {/* ツールリスト */}
              <div className="px-5 py-4">
                <div className="flex flex-wrap gap-2">
                  {useCase.tools.map((tool, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200"
                      style={{ color: '#5d4037' }}
                    >
                      {tool}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center gap-1 text-xs font-bold" style={{ color: useCase.color }}>
                  この組み合わせで始める <ArrowRight size={12} />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
