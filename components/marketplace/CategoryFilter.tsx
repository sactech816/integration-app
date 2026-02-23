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
  const buttonClass = (isActive: boolean, isToolLinked?: boolean) => {
    const base = 'inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap';
    if (isActive) return `${base} bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200`;
    if (isToolLinked) return `${base} bg-indigo-50/70 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200`;
    return `${base} bg-white text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-50`;
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange(null)}
        className={buttonClass(selected === null)}
      >
        <Grid3X3 className="w-3.5 h-3.5" />
        すべて
      </button>
      {MARKETPLACE_CATEGORIES.map((cat) => {
        const Icon = ICON_MAP[cat.icon] || MoreHorizontal;
        const isSelected = selected === cat.id;
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id === selected ? null : cat.id)}
            className={buttonClass(isSelected, cat.isToolLinked)}
          >
            <Icon className="w-3.5 h-3.5" />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
