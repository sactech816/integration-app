'use client';

import React from 'react';
import { GraduationCap, Users, ListChecks, Lightbulb, DollarSign, Monitor, Zap, Footprints } from 'lucide-react';
import { CourseSuggestion } from '../types';

interface CourseTabContentProps {
  suggestions: CourseSuggestion[];
}

export const CourseTabContent: React.FC<CourseTabContentProps> = ({ suggestions }) => {
  return (
    <div className="space-y-5">
      {suggestions.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-5"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
            </div>
            <h4 className="text-base font-bold text-gray-900 leading-snug">{item.courseName}</h4>
          </div>
          <div className="space-y-3 pl-11">
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-800">対象:</span> {item.targetAudience}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">{item.reason}</p>
            </div>
            <div className="flex items-start gap-2">
              <ListChecks className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-800 mb-1">カリキュラム:</p>
                <div className="flex flex-wrap gap-1.5">
                  {item.curriculum.map((module, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200">
                      {i + 1}. {module}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            {item.format && (
              <div className="flex items-start gap-2">
                <Monitor className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-800">形式:</span> {item.format}
                </p>
              </div>
            )}
            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 font-medium">想定価格: {item.pricingHint}</p>
            </div>
            {item.differentiator && (
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-800">差別化:</span> {item.differentiator}
                </p>
              </div>
            )}
            {item.firstStep && (
              <div className="bg-indigo-50 rounded-lg p-3 flex items-start gap-2">
                <Footprints className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-indigo-800">
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
