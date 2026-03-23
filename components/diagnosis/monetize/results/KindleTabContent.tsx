'use client';

import React from 'react';
import { BookOpen, Users, Lightbulb, DollarSign, ListOrdered, Zap, Footprints } from 'lucide-react';
import { KindleThemeSuggestion } from '../types';

interface KindleTabContentProps {
  suggestions: KindleThemeSuggestion[];
}

export const KindleTabContent: React.FC<KindleTabContentProps> = ({ suggestions }) => {
  return (
    <div className="space-y-5">
      {suggestions.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-5"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-violet-600" />
            </div>
            <h4 className="text-base font-bold text-gray-900 leading-snug">{item.theme}</h4>
          </div>
          <div className="space-y-3 pl-11">
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

            {/* 章構成案 */}
            {item.chapterOutline && item.chapterOutline.length > 0 && (
              <div className="flex items-start gap-2">
                <ListOrdered className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-1.5">章構成案:</p>
                  <div className="space-y-1">
                    {item.chapterOutline.map((ch, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-5 h-5 bg-violet-50 text-violet-600 text-xs font-bold rounded flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        <span className="text-sm text-gray-700">{ch}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 差別化ポイント */}
            {item.differentiator && (
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-800">差別化:</span> {item.differentiator}
                </p>
              </div>
            )}

            {/* 最初の一歩 */}
            {item.firstStep && (
              <div className="bg-violet-50 rounded-lg p-3 flex items-start gap-2">
                <Footprints className="w-4 h-4 text-violet-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-violet-800">
                  <span className="font-semibold">最初の一歩:</span> {item.firstStep}
                </p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
