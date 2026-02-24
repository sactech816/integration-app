'use client';

import React from 'react';
import { SVGTextElement } from '@/lib/types';
import {
  Plus, Trash2,
  AlignLeft, AlignCenter, AlignRight,
  ChevronUp, ChevronDown,
} from 'lucide-react';

// 利用可能な日本語フォント
const FONT_OPTIONS = [
  { value: 'Noto Sans JP', label: 'Noto Sans JP' },
  { value: 'M PLUS Rounded 1c', label: 'M PLUS 丸ゴシック' },
  { value: 'Zen Kaku Gothic New', label: 'Zen 角ゴシック' },
  { value: 'Kosugi Maru', label: 'コスギ丸' },
];

const WEIGHT_OPTIONS = [
  { value: 400, label: '標準' },
  { value: 700, label: '太字' },
  { value: 900, label: '極太' },
];

// 位置プリセット
const POSITION_PRESETS = [
  { label: '中央', x: 50, y: 50 },
  { label: '上部', x: 50, y: 20 },
  { label: '下部', x: 50, y: 80 },
  { label: '左上', x: 25, y: 20 },
  { label: '右下', x: 75, y: 80 },
];

// カラープリセット
const COLOR_PRESETS = [
  '#FFFFFF', '#000000', '#FF0000', '#FFD700',
  '#00BFFF', '#FF69B4', '#32CD32', '#FF8C00',
];

interface TextEditPanelProps {
  textElements: SVGTextElement[];
  selectedElementId: string | null;
  onUpdateElement: (id: string, updates: Partial<SVGTextElement>) => void;
  onAddElement: () => void;
  onDeleteElement: (id: string) => void;
  onSelectElement: (id: string | null) => void;
}

export default function TextEditPanel({
  textElements,
  selectedElementId,
  onUpdateElement,
  onAddElement,
  onDeleteElement,
  onSelectElement,
}: TextEditPanelProps) {
  const selectedElement = textElements.find(el => el.id === selectedElementId);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* ヘッダー: テキスト要素一覧 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-800">テキスト要素</span>
          <button
            onClick={onAddElement}
            className="flex items-center gap-1 text-xs font-medium text-pink-600 hover:text-pink-700 transition-colors"
          >
            <Plus size={14} />
            追加
          </button>
        </div>

        {/* テキスト要素タブ */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {textElements.map((elem) => (
            <button
              key={elem.id}
              onClick={() => onSelectElement(elem.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedElementId === elem.id
                  ? 'bg-pink-100 text-pink-700 border border-pink-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
              }`}
            >
              {elem.text.length > 8 ? elem.text.slice(0, 8) + '...' : elem.text || '(空)'}
            </button>
          ))}
        </div>
      </div>

      {/* 選択要素の編集パネル */}
      {selectedElement ? (
        <div className="p-4 space-y-4">
          {/* テキスト入力 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">テキスト内容</label>
            <textarea
              value={selectedElement.text}
              onChange={(e) => onUpdateElement(selectedElement.id, { text: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none text-sm text-gray-900 placeholder:text-gray-400 resize-none"
              rows={2}
              placeholder="テキストを入力..."
            />
          </div>

          {/* フォント選択 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">フォント</label>
              <select
                value={selectedElement.fontFamily}
                onChange={(e) => onUpdateElement(selectedElement.id, { fontFamily: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none text-sm text-gray-900"
              >
                {FONT_OPTIONS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">太さ</label>
              <select
                value={selectedElement.fontWeight}
                onChange={(e) => onUpdateElement(selectedElement.id, { fontWeight: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-pink-300 outline-none text-sm text-gray-900"
              >
                {WEIGHT_OPTIONS.map(w => (
                  <option key={w.value} value={w.value}>{w.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* フォントサイズ */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              サイズ: {selectedElement.fontSize}px
            </label>
            <input
              type="range"
              min={16}
              max={120}
              value={selectedElement.fontSize}
              onChange={(e) => onUpdateElement(selectedElement.id, { fontSize: Number(e.target.value) })}
              className="w-full accent-pink-500"
            />
          </div>

          {/* テキスト色 */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">テキスト色</label>
            <div className="flex items-center gap-2">
              <div className="flex flex-wrap gap-1.5">
                {COLOR_PRESETS.map(color => (
                  <button
                    key={color}
                    onClick={() => onUpdateElement(selectedElement.id, { color })}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      selectedElement.color === color ? 'border-pink-400 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={selectedElement.color}
                onChange={(e) => onUpdateElement(selectedElement.id, { color: e.target.value })}
                className="w-8 h-8 rounded cursor-pointer border border-gray-200"
              />
            </div>
          </div>

          {/* 縁取り */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              縁取り: {selectedElement.strokeWidth || 0}px
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={10}
                value={selectedElement.strokeWidth || 0}
                onChange={(e) => onUpdateElement(selectedElement.id, { strokeWidth: Number(e.target.value) })}
                className="flex-1 accent-pink-500"
              />
              {(selectedElement.strokeWidth || 0) > 0 && (
                <input
                  type="color"
                  value={selectedElement.strokeColor || '#000000'}
                  onChange={(e) => onUpdateElement(selectedElement.id, { strokeColor: e.target.value })}
                  className="w-8 h-8 rounded cursor-pointer border border-gray-200"
                />
              )}
            </div>
          </div>

          {/* テキスト揃え */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">テキスト揃え</label>
            <div className="flex gap-1.5">
              {([
                { value: 'left', icon: AlignLeft },
                { value: 'center', icon: AlignCenter },
                { value: 'right', icon: AlignRight },
              ] as const).map(({ value, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => onUpdateElement(selectedElement.id, { textAlign: value })}
                  className={`p-2 rounded-lg transition-all ${
                    (selectedElement.textAlign || 'center') === value
                      ? 'bg-pink-100 text-pink-600'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* 位置プリセット */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">位置プリセット</label>
            <div className="flex flex-wrap gap-1.5">
              {POSITION_PRESETS.map(preset => (
                <button
                  key={preset.label}
                  onClick={() => onUpdateElement(selectedElement.id, { x: preset.x, y: preset.y })}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-pink-100 hover:text-pink-600 transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-1">テキストをドラッグして自由に移動もできます</p>
          </div>

          {/* 順序・削除 */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex gap-1">
              <button
                onClick={() => {
                  const idx = textElements.findIndex(el => el.id === selectedElement.id);
                  if (idx > 0) {
                    const newElements = [...textElements];
                    [newElements[idx - 1], newElements[idx]] = [newElements[idx], newElements[idx - 1]];
                    onUpdateElement(selectedElement.id, {}); // trigger re-render via parent
                  }
                }}
                className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
                title="前面へ"
              >
                <ChevronUp size={14} />
              </button>
              <button
                onClick={() => {
                  const idx = textElements.findIndex(el => el.id === selectedElement.id);
                  if (idx < textElements.length - 1) {
                    const newElements = [...textElements];
                    [newElements[idx], newElements[idx + 1]] = [newElements[idx + 1], newElements[idx]];
                    onUpdateElement(selectedElement.id, {}); // trigger re-render via parent
                  }
                }}
                className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all"
                title="背面へ"
              >
                <ChevronDown size={14} />
              </button>
            </div>
            <button
              onClick={() => {
                if (textElements.length <= 1) return;
                onDeleteElement(selectedElement.id);
              }}
              disabled={textElements.length <= 1}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 size={14} />
              削除
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-sm text-gray-400">
          テキスト要素を選択して編集してください
        </div>
      )}
    </div>
  );
}
