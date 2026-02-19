'use client';

import React from 'react';

const GRADIENT_PRESETS = [
  { from: 'from-amber-500', to: 'to-orange-500', label: 'アンバー' },
  { from: 'from-blue-500', to: 'to-indigo-600', label: 'ブルー' },
  { from: 'from-indigo-600', to: 'to-purple-600', label: 'インディゴ' },
  { from: 'from-purple-600', to: 'to-pink-600', label: 'パープル' },
  { from: 'from-teal-500', to: 'to-cyan-500', label: 'ティール' },
  { from: 'from-emerald-500', to: 'to-teal-600', label: 'エメラルド' },
  { from: 'from-rose-500', to: 'to-pink-600', label: 'ローズ' },
  { from: 'from-red-500', to: 'to-orange-500', label: 'レッド' },
  { from: 'from-gray-700', to: 'to-gray-900', label: 'ダーク' },
  { from: 'from-sky-500', to: 'to-blue-600', label: 'スカイ' },
];

interface GradientSelectorProps {
  gradientFrom: string;
  gradientTo: string;
  onChangeFrom: (value: string) => void;
  onChangeTo: (value: string) => void;
}

export default function GradientSelector({
  gradientFrom,
  gradientTo,
  onChangeFrom,
  onChangeTo,
}: GradientSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-700">グラデーションプリセット</p>
      <div className="grid grid-cols-5 gap-2">
        {GRADIENT_PRESETS.map((preset) => {
          const isSelected = gradientFrom === preset.from && gradientTo === preset.to;
          return (
            <button
              key={`${preset.from}-${preset.to}`}
              type="button"
              onClick={() => {
                onChangeFrom(preset.from);
                onChangeTo(preset.to);
              }}
              className={`relative h-10 rounded-lg bg-gradient-to-r ${preset.from} ${preset.to} transition-all ${
                isSelected ? 'ring-2 ring-offset-2 ring-amber-400 scale-105' : 'hover:scale-105'
              }`}
              title={preset.label}
            />
          );
        })}
      </div>

      {/* カスタム選択 */}
      <div className="flex gap-4 mt-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">開始色</label>
          <select
            value={gradientFrom}
            onChange={(e) => onChangeFrom(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
          >
            <option value="from-amber-500">Amber</option>
            <option value="from-blue-500">Blue</option>
            <option value="from-indigo-600">Indigo</option>
            <option value="from-purple-600">Purple</option>
            <option value="from-teal-500">Teal</option>
            <option value="from-emerald-500">Emerald</option>
            <option value="from-rose-500">Rose</option>
            <option value="from-red-500">Red</option>
            <option value="from-gray-700">Gray</option>
            <option value="from-sky-500">Sky</option>
            <option value="from-orange-500">Orange</option>
            <option value="from-pink-500">Pink</option>
            <option value="from-cyan-500">Cyan</option>
            <option value="from-violet-500">Violet</option>
            <option value="from-green-500">Green</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">終了色</label>
          <select
            value={gradientTo}
            onChange={(e) => onChangeTo(e.target.value)}
            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg"
          >
            <option value="to-orange-500">Orange</option>
            <option value="to-indigo-600">Indigo</option>
            <option value="to-purple-600">Purple</option>
            <option value="to-pink-600">Pink</option>
            <option value="to-cyan-500">Cyan</option>
            <option value="to-teal-600">Teal</option>
            <option value="to-blue-600">Blue</option>
            <option value="to-red-500">Red</option>
            <option value="to-gray-900">Gray</option>
            <option value="to-sky-600">Sky</option>
            <option value="to-amber-500">Amber</option>
            <option value="to-rose-600">Rose</option>
            <option value="to-emerald-600">Emerald</option>
            <option value="to-violet-600">Violet</option>
            <option value="to-green-600">Green</option>
          </select>
        </div>
      </div>

      {/* プレビュー */}
      <div className={`h-8 rounded-lg bg-gradient-to-r ${gradientFrom} ${gradientTo}`} />
    </div>
  );
}
