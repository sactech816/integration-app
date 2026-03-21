'use client';

import { ArrowRight } from 'lucide-react';
import { INDUSTRIES } from '@/lib/industry-config';

export default function IndustryNavSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full mb-4 border border-blue-200">
            <span className="font-bold text-sm">業種から探す</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-4" style={{ color: '#5d4037' }}>
            あなたの業種に合った集客の型
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            業種ごとに最適なツールの組み合わせと活用方法をご紹介します。
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {INDUSTRIES.map((industry) => {
            const Icon = industry.icon;
            return (
              <a
                key={industry.id}
                href={`/for/${industry.slug}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                  style={{ backgroundColor: industry.bgColor, color: industry.color }}
                >
                  <Icon size={28} />
                </div>
                <div className="text-center">
                  <p className="font-bold text-sm" style={{ color: '#5d4037' }}>
                    {industry.shortLabel}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 hidden sm:block leading-tight">
                    {industry.description}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: industry.color }}>
                  詳しく見る <ArrowRight size={12} />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
