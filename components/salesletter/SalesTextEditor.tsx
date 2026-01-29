'use client';

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Palette,
  Smile,
} from 'lucide-react';

// アイコンプリセット（カテゴリ別）
const iconPresets = {
  features: {
    label: '特徴・メリット',
    icons: ['🏆', '🤝', '📊', '💡', '✨', '🎯', '🚀', '⭐', '💪', '🔥', '✓', '💎', '🌟', '📈', '🎁', '🛡️', '⚡', '🔑', '💼', '🌈']
  },
  problems: {
    label: 'お悩み・課題',
    icons: ['😰', '😓', '🤔', '😢', '💭', '❓', '😟', '😩', '⚠️', '💔', '😥', '😤', '🤷', '😔', '💦', '❌', '😵', '🆘', '😫', '🥺']
  },
  bonus: {
    label: '特典・プレゼント',
    icons: ['🎁', '📚', '🎉', '✨', '💝', '🏅', '🎊', '💰', '📖', '🎬', '📝', '🎮', '🎵', '📱', '💻', '🎨', '📦', '🌸', '👑', '🍀']
  },
  check: {
    label: 'チェック・確認',
    icons: ['✓', '✔️', '☑️', '👍', '👌', '💯', '⭕', '🔵', '🟢', '✅']
  },
  general: {
    label: 'その他',
    icons: ['📌', '💬', '🗓️', '📞', '✉️', '🔔', '⏰', '📍', '🏠', '💳', '🎓', '🏋️', '🍽️', '☕', '🧘', '💼', '🌍', '🎤', '📸', '🛒']
  }
};

interface SalesTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function SalesTextEditor({
  content,
  onChange,
  placeholder = 'ここに本文を入力してください...',
}: SalesTextEditorProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [activeIconCategory, setActiveIconCategory] = useState<keyof typeof iconPresets>('features');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false, // 見出しは別ブロックで対応
      }),
      Underline,
      TextStyle,
      Color,
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: content || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // 外部からcontentが変更された場合に同期
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="border border-gray-300 rounded-lg min-h-[120px] animate-pulse bg-gray-50" />
    );
  }

  const ToolButton = ({
    onClick,
    isActive,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-all ${
        isActive
          ? 'bg-rose-100 text-rose-700'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-rose-500 focus-within:border-rose-500">
      {/* ツールバー */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-gray-50 border-b border-gray-200 flex-wrap">
        {/* 太字・斜体・下線・取り消し線 */}
        <div className="flex items-center gap-0.5 pr-2 border-r border-gray-200">
          <ToolButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="太字"
          >
            <Bold size={16} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="斜体"
          >
            <Italic size={16} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            title="下線"
          >
            <UnderlineIcon size={16} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="取り消し線"
          >
            <Strikethrough size={16} />
          </ToolButton>
        </div>

        {/* リスト */}
        <div className="flex items-center gap-0.5 px-2 border-r border-gray-200">
          <ToolButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="箇条書き"
          >
            <List size={16} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="番号付きリスト"
          >
            <ListOrdered size={16} />
          </ToolButton>
        </div>

        {/* 文字色 */}
        <div className="flex items-center gap-1 px-2 border-r border-gray-200">
          <Palette size={14} className="text-gray-400" />
          <input
            type="color"
            onChange={(e) => editor.chain().focus().setColor(e.target.value).run()}
            className="w-6 h-6 rounded cursor-pointer border-0"
            title="文字色"
          />
          <button
            onClick={() => editor.chain().focus().unsetColor().run()}
            className="text-xs text-gray-500 hover:text-gray-700 px-1"
            title="色をリセット"
          >
            ×
          </button>
        </div>

        {/* アイコン挿入 */}
        <div className="relative px-2">
          <ToolButton
            onClick={() => setShowIconPicker(!showIconPicker)}
            isActive={showIconPicker}
            title="アイコンを挿入"
          >
            <Smile size={16} />
          </ToolButton>

          {showIconPicker && (
            <div className="absolute z-50 top-full left-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-72">
              {/* カテゴリタブ */}
              <div className="flex flex-wrap gap-1 mb-3 border-b border-gray-100 pb-2">
                {Object.entries(iconPresets).map(([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveIconCategory(key as keyof typeof iconPresets)}
                    className={`text-xs px-2 py-1 rounded-full transition-colors ${
                      activeIconCategory === key 
                        ? 'bg-rose-100 text-rose-700 font-bold' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
              
              {/* アイコングリッド */}
              <div className="grid grid-cols-8 gap-1">
                {iconPresets[activeIconCategory].icons.map((icon, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      editor.chain().focus().insertContent(icon).run();
                      setShowIconPicker(false);
                    }}
                    className="w-8 h-8 text-lg rounded hover:bg-rose-50 flex items-center justify-center transition-colors"
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* エディタ本体 */}
      <EditorContent editor={editor} />

      {/* スタイル */}
      <style jsx global>{`
        .ProseMirror {
          min-height: 120px;
        }
        
        .ProseMirror:focus {
          outline: none;
        }
        
        .ProseMirror.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
        
        .ProseMirror p {
          margin: 0.5rem 0;
          line-height: 1.8;
          color: #374151;
        }
        
        .ProseMirror ul {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
          list-style-type: disc;
          color: #1f2937;
        }
        
        .ProseMirror ol {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
          list-style-type: decimal;
          color: #1f2937;
        }
        
        .ProseMirror li {
          margin: 0.25rem 0;
          line-height: 1.6;
          display: list-item;
          color: #1f2937;
        }
        
        .ProseMirror ul li {
          list-style-type: disc;
          color: #1f2937;
        }
        
        .ProseMirror ol li {
          list-style-type: decimal;
          color: #1f2937;
        }
        
        .ProseMirror strong {
          font-weight: 700;
          color: #1f2937;
        }
        
        .ProseMirror em {
          font-style: italic;
        }
        
        .ProseMirror u {
          text-decoration: underline;
        }
        
        .ProseMirror s {
          text-decoration: line-through;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
