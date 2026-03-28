'use client';

import { ArrowRight } from 'lucide-react';
import { POPULAR_TOOLS } from '@/lib/tools-data';

export default function PopularToolsGrid() {
  return (
    <section className="py-16 bg-white border-b" style={{ borderColor: '#ffedd5' }}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-black mb-3" style={{ color: '#5d4037' }}>
            ログインして、人気のツールをすぐに使う
          </h2>
          <p className="text-gray-600 text-sm">
            登録不要・無料で今すぐ作成できます
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {POPULAR_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <a
                key={tool.name}
                href={tool.href}
                className="group flex flex-col p-5 rounded-2xl border border-gray-100 bg-white hover:border-orange-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 rounded-xl ${tool.iconBg} ${tool.iconColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                >
                  <Icon size={24} />
                </div>
                <h3 className="font-bold text-sm mb-1.5" style={{ color: '#5d4037' }}>
                  {tool.name}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed flex-1">
                  {tool.description}
                </p>
                <div className="flex items-center gap-1 mt-3 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#f97316' }}>
                  作成する <ArrowRight size={12} />
                </div>
              </a>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <a
            href="/tools"
            className="inline-flex items-center gap-2 text-sm font-bold hover:underline transition" style={{ color: '#f97316' }}
          >
            全ツール一覧を見る <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
}
