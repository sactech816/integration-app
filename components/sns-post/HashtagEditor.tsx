'use client';

import React, { useState } from 'react';
import { X, Plus, Hash } from 'lucide-react';

type HashtagEditorProps = {
  hashtags: string[];
  onChange: (hashtags: string[]) => void;
  limit?: number | null;
};

export default function HashtagEditor({ hashtags, onChange, limit }: HashtagEditorProps) {
  const [input, setInput] = useState('');

  const addHashtag = () => {
    const tag = input.trim().replace(/^#/, '');
    if (!tag) return;
    if (limit && hashtags.length >= limit) return;
    if (!hashtags.includes(tag)) {
      onChange([...hashtags, tag]);
    }
    setInput('');
  };

  const removeHashtag = (index: number) => {
    onChange(hashtags.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addHashtag();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Hash className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-semibold text-gray-700">ハッシュタグ</span>
        <span className="text-xs text-gray-400">
          {hashtags.length}個{limit ? ` / 最大${limit}個` : ''}
        </span>
      </div>

      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {hashtags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-700 rounded-full text-sm border border-sky-200"
            >
              #{tag}
              <button
                onClick={() => removeHashtag(index)}
                className="hover:text-sky-900 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="ハッシュタグを入力"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
          disabled={!!(limit && hashtags.length >= limit)}
        />
        <button
          onClick={addHashtag}
          disabled={!input.trim() || !!(limit && hashtags.length >= limit)}
          className="px-3 py-2 bg-sky-500 text-white rounded-lg text-sm font-semibold hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
