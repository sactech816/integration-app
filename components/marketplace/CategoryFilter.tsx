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
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selected === null
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        <Grid3X3 className="w-3.5 h-3.5" />
        すべて
      </button>
      {MARKETPLACE_CATEGORIES.map((cat) => {
        const Icon = ICON_MAP[cat.icon] || MoreHorizontal;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id === selected ? null : cat.id)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selected === cat.id
                ? 'bg-indigo-600 text-white'
                : cat.isToolLinked
                  ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
