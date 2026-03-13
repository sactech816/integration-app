'use client';

import React from 'react';
import { Sparkles, FileText } from 'lucide-react';
import { CONCIERGE_TEMPLATES, type ConciergeTemplate } from '@/lib/concierge/templates';

interface Props {
  onSelectTemplate: (template: ConciergeTemplate | null) => void;
  onSelectAI: () => void;
}

export default function ConciergeTemplateSelector({ onSelectTemplate, onSelectAI }: Props) {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          コンシェルジュを作成
        </h2>
        <p className="text-gray-600">
          テンプレートから始めるか、AIに作ってもらいましょう
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {/* AIに作ってもらう */}
        <button
          onClick={onSelectAI}
          className="p-5 rounded-2xl border-2 border-teal-200 bg-gradient-to-br from-teal-50 to-cyan-50 hover:border-teal-400 hover:shadow-lg transition-all text-left group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-white">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
                AIに作ってもらう
              </h3>
              <span className="text-xs text-teal-600 font-medium">おすすめ</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            ビジネスの説明やサイトURLを入力するだけで、AIがナレッジ・FAQを自動生成します
          </p>
        </button>

        {/* 空白から始める */}
        <button
          onClick={() => onSelectTemplate(null)}
          className="p-5 rounded-2xl border-2 border-gray-200 bg-white hover:border-gray-400 hover:shadow-lg transition-all text-left group"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                空白から始める
              </h3>
              <span className="text-xs text-gray-500 font-medium">自由に設定</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            すべて手動で設定します。自分のペースでカスタマイズしたい方に
          </p>
        </button>
      </div>

      {/* テンプレート一覧 */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
          テンプレートから選ぶ
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CONCIERGE_TEMPLATES.map(template => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className="p-5 rounded-2xl border-2 border-gray-200 bg-white hover:border-teal-300 hover:shadow-lg transition-all text-left group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl">
                {template.emoji}
              </div>
              <h3 className="font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
                {template.name}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              {template.description}
            </p>
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
              <span>FAQ {template.config.faq_items.length}件</span>
              <span>・</span>
              <span>ナレッジ設定済み</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
