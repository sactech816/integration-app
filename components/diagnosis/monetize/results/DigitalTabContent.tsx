'use client';

import React from 'react';
import { Package, Users, Lightbulb, DollarSign, ShoppingBag, ListChecks, Zap, Footprints } from 'lucide-react';
import { DigitalProductSuggestion } from '../types';

interface DigitalTabContentProps {
  suggestions: DigitalProductSuggestion[];
}

export const DigitalTabContent: React.FC<DigitalTabContentProps> = ({ suggestions }) => {
  return (
    <div className="space-y-5">
      {suggestions.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 p-5"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Package className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900 leading-snug">{item.productName}</h4>
              <span className="text-xs px-2 py-0.5 bg-amber-50 text-amber-600 rounded-full border border-amber-200 mt-1 inline-block">
                {item.productType}
              </span>
            </div>
          </div>
          <div className="space-y-3 pl-11">
            <div className="flex items-start gap-2">
              <Users className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-800">購入者:</span> {item.targetBuyer}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600">{item.reason}</p>
            </div>
            {item.features && item.features.length > 0 && (
              <div className="flex items-start gap-2">
                <ListChecks className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-1">含まれるもの:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.features.map((f, i) => (
                      <span key={i} className="text-xs px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {item.salesChannel && (
              <div className="flex items-start gap-2">
                <ShoppingBag className="w-4 h-4 text-sky-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">
                  <span className="font-medium text-gray-800">販売先:</span> {item.salesChannel}
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
              <div className="bg-amber-50 rounded-lg p-3 flex items-start gap-2">
                <Footprints className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">
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
