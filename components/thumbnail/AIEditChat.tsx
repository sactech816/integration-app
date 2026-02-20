'use client';

import React, { useState } from 'react';
import { Send, Loader2, Undo2, Sun, Moon, Type, Palette, Sparkles, Crown } from 'lucide-react';

interface AIEditChatProps {
  imageUrl: string;
  aspectRatio: string;
  userId?: string;
  onImageEdited: (newImageUrl: string) => void;
  isPro?: boolean;
}

interface EditHistoryItem {
  imageUrl: string;
  instruction: string;
  timestamp: number;
}

const PRESET_EDITS = [
  { label: '明るくする', instruction: '画像全体を明るくしてください', icon: Sun },
  { label: '暗くする', instruction: '画像全体をやや暗くして、テキストを目立たせてください', icon: Moon },
  { label: '文字を大きく', instruction: 'テキストをもっと大きく、太くしてください', icon: Type },
  { label: '背景を変更', instruction: '背景のデザインを全く違うものに変更してください', icon: Palette },
];

export default function AIEditChat({ imageUrl, aspectRatio, userId, onImageEdited, isPro = false }: AIEditChatProps) {
  const [editInstruction, setEditInstruction] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<EditHistoryItem[]>([]);

  const handleEdit = async (instruction: string) => {
    if (!instruction.trim() || isEditing) return;

    setIsEditing(true);
    setError(null);

    // 現在の画像を履歴に保存
    setHistory(prev => [...prev, { imageUrl, instruction, timestamp: Date.now() }]);

    try {
      const res = await fetch('/api/thumbnail/edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          editInstruction: instruction,
          aspectRatio,
          userId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onImageEdited(data.imageUrl);
        setEditInstruction('');
      } else {
        setError(data.error || '編集に失敗しました');
        // 履歴から最後のアイテムを削除（失敗したため）
        setHistory(prev => prev.slice(0, -1));
      }
    } catch {
      setError('ネットワークエラーが発生しました');
      setHistory(prev => prev.slice(0, -1));
    } finally {
      setIsEditing(false);
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastItem = history[history.length - 1];
    onImageEdited(lastItem.imageUrl);
    setHistory(prev => prev.slice(0, -1));
  };

  if (!isPro) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden opacity-75">
        <div className="px-4 py-4 bg-gradient-to-r from-pink-50 to-purple-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-pink-500" />
            <h3 className="font-bold text-gray-800 text-sm">AI編集</h3>
            <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full font-medium">Pro</span>
          </div>
          <a
            href="/pricing"
            className="flex items-center gap-1.5 text-xs font-medium text-pink-600 hover:text-pink-700"
          >
            <Crown size={14} />
            Proにアップグレード
          </a>
        </div>
        <div className="px-4 py-3 text-center text-sm text-gray-500">
          AI編集はProプラン限定機能です
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* ヘッダー */}
      <div className="px-4 py-3 bg-gradient-to-r from-pink-50 to-purple-50 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-pink-500" />
          <h3 className="font-bold text-gray-800 text-sm">AI編集</h3>
          <span className="text-xs text-gray-500">言葉で指示するだけで修正できます</span>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-pink-500 transition-colors"
          >
            <Undo2 size={14} />
            元に戻す
          </button>
        )}
      </div>

      {/* プリセットボタン */}
      <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-gray-100">
        {PRESET_EDITS.map((preset) => {
          const Icon = preset.icon;
          return (
            <button
              key={preset.label}
              onClick={() => handleEdit(preset.instruction)}
              disabled={isEditing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-pink-50 border border-gray-200 hover:border-pink-200 rounded-full text-xs font-medium text-gray-600 hover:text-pink-600 transition-all disabled:opacity-50"
            >
              <Icon size={12} />
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      {/* 編集中インジケーター */}
      {isEditing && (
        <div className="px-4 py-3 flex items-center gap-2 bg-pink-50">
          <Loader2 size={16} className="animate-spin text-pink-500" />
          <span className="text-sm text-pink-600">AI が画像を編集中...</span>
        </div>
      )}

      {/* テキスト入力 */}
      <div className="p-3 flex items-center gap-2">
        <input
          type="text"
          value={editInstruction}
          onChange={(e) => setEditInstruction(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
              handleEdit(editInstruction);
            }
          }}
          placeholder="例: 背景を宇宙空間にして"
          disabled={isEditing}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 outline-none text-sm text-gray-900 placeholder:text-gray-400 disabled:bg-gray-50"
        />
        <button
          onClick={() => handleEdit(editInstruction)}
          disabled={isEditing || !editInstruction.trim()}
          className="p-2.5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isEditing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>

      {/* 編集履歴 */}
      {history.length > 0 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-400 mb-1">編集履歴（{history.length}回）</p>
          <div className="flex flex-wrap gap-1">
            {history.map((item, i) => (
              <span key={item.timestamp} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                {i + 1}. {item.instruction.slice(0, 20)}{item.instruction.length > 20 ? '...' : ''}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
