'use client';

import React from 'react';
import {
  Layout, Sparkles, UserCircle, PenTool, BookOpen,
  Palette, FileText, TrendingUp, Video, MessageCircle,
  MoreHorizontal, Grid3X3
} from 'lucide-react';
import { MARKETPLACE_CATEGORIES } from '@/constants/marketplace';

const ICON_MAP: Record<string, React.ElementType> = {
  Layout, Sparkles, UserCircle, PenTool, BookOpen,
  Palette, FileText, TrendingUp, Video, MessageCircle,
  MoreHorizontal,
};

interface CategoryFilterProps {
  selected: string | null;
  onChange: (category: string | null) => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
      <div className="flex gap-2 min-w-max">
        <button
          onClick={() => onChange(null)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
            selected === null
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600'
          }`}
        >
          <Grid3X3 className="w-4 h-4" />
          すべて
        </button>
        {MARKETPLACE_CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon] || MoreHorizontal;
          const isSelected = selected === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onChange(cat.id === selected ? null : cat.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isSelected
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200'
                  : cat.isToolLinked
                    ? 'bg-indigo-50/70 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
