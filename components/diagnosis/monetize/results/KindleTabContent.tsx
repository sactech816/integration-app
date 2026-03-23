'use client';

import React from 'react';
import { BookOpen, Users, Lightbulb, DollarSign } from 'lucide-react';
import { KindleThemeSuggestion } from '../types';

interface KindleTabContentProps {
  suggestions: KindleThemeSuggestion[];
}

export const KindleTabContent: React.FC<KindleTabContentProps> = ({ suggestions }) => {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600 mb-4">
        あなたの才能を活かしたKindle出版テーマの提案です。
      </p>
      {suggestions.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-5"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-violet-600" />
            </div>
            <h4 className="text-base font-bold text-gray-900 leading-snug">{item.theme}</h4>
          </div>
          <div className="space-y-2 pl-11">
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-800">ターゲット読者:</span> {item.targetReader}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">{item.reason}</p>
            </div>
            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 font-medium">{item.potentialRevenue}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
