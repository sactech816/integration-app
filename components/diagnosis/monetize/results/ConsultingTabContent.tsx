'use client';

import React from 'react';
import { Briefcase, Users, Package, Lightbulb, DollarSign } from 'lucide-react';
import { ConsultingSuggestion } from '../types';

interface ConsultingTabContentProps {
  suggestions: ConsultingSuggestion[];
}

export const ConsultingTabContent: React.FC<ConsultingTabContentProps> = ({ suggestions }) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        あなたの強みを活かしたコンサルティング・コーチングメニューの提案です。
      </p>
      {suggestions.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-5"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="text-base font-bold text-gray-900 leading-snug">{item.menuName}</h4>
          </div>
          <div className="space-y-2 pl-11">
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-800">対象クライアント:</span> {item.targetClient}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Package className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800 mb-1">提供内容:</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.deliverables.map((d, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">{item.reason}</p>
            </div>
            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 font-medium">想定価格: {item.pricingHint}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
