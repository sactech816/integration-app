'use client';

import React from 'react';
import { Share2, Users, Lightbulb, TrendingUp, MessageSquare, Zap, Footprints } from 'lucide-react';
import { SnsSuggestion } from '../types';

interface SnsTabContentProps {
  suggestions: SnsSuggestion[];
}

export const SnsTabContent: React.FC<SnsTabContentProps> = ({ suggestions }) => {
  return (
    <div className="space-y-5">
      {suggestions.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-5"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Share2 className="w-4 h-4 text-pink-600" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900 leading-snug">{item.themeName}</h4>
              <span className="text-xs px-2 py-0.5 bg-pink-50 text-pink-600 rounded-full border border-pink-200 mt-1 inline-block">
                {item.platform}
              </span>
            </div>
          </div>
          <div className="space-y-3 pl-11">
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-800">ターゲット:</span> {item.targetFollower}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">{item.reason}</p>
            </div>
            {item.contentIdeas && item.contentIdeas.length > 0 && (
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-1.5">投稿ネタ例:</p>
                  <div className="space-y-1">
                    {item.contentIdeas.map((idea, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-pink-400 rounded-full flex-shrink-0" />
                        <span className="text-sm text-gray-700">{idea}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {item.monetizeRoute && (
              <div className="flex items-start gap-2">
                <TrendingUp className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-800">収益化ルート:</span> {item.monetizeRoute}
                </p>
              </div>
            )}
            {item.differentiator && (
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-800">差別化:</span> {item.differentiator}
                </p>
              </div>
            )}
            {item.firstStep && (
              <div className="bg-pink-50 rounded-lg p-3 flex items-start gap-2">
                <Footprints className="w-4 h-4 text-pink-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-pink-800">
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
