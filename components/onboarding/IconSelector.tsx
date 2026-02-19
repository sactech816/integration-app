'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ICON_MAP, ICON_NAMES, ICON_LABELS } from './iconMap';
import { ChevronDown } from 'lucide-react';

interface IconSelectorProps {
  value: string;
  iconColor: string;
  onChange: (iconName: string) => void;
}

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600' },
  amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
  indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
  violet: { bg: 'bg-violet-100', text: 'text-violet-600' },
  rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
};

export default function IconSelector({ value, iconColor, onChange }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = ICON_NAMES.filter((name) => {
    if (!search) return true;
    const lower = search.toLowerCase();
    return name.toLowerCase().includes(lower) || (ICON_LABELS[name] || '').includes(lower);
  });

  const SelectedIcon = ICON_MAP[value] || ICON_MAP.Info;
  const colors = COLOR_MAP[iconColor] || COLOR_MAP.blue;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div className={`w-6 h-6 rounded-full ${colors.bg} flex items-center justify-center`}>
          <SelectedIcon size={14} className={colors.text} />
        </div>
        <span className="text-sm text-gray-700">{value}</span>
        <ChevronDown size={14} className="text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="アイコンを検索..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-6 gap-1 p-2 max-h-48 overflow-y-auto">
            {filtered.map((name) => {
              const Icon = ICON_MAP[name];
              const isSelected = name === value;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange(name);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected
                      ? `${colors.bg} ring-2 ring-amber-400`
                      : 'hover:bg-gray-100'
                  }`}
                  title={`${name} (${ICON_LABELS[name] || ''})`}
                >
                  <Icon size={18} className={isSelected ? colors.text : 'text-gray-600'} />
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-6 text-center text-sm text-gray-400 py-4">該当なし</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
