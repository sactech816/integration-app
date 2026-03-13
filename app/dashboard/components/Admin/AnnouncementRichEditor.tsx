'use client';

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import {
  Bold, Italic, Underline as UnderlineIcon,
  Heading2, Heading3,
  List, ListOrdered,
  Link as LinkIcon, Unlink,
  Image as ImageIcon,
  Palette, Type,
} from 'lucide-react';

// フォントサイズ拡張
const FontSize = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (element: HTMLElement) => element.style.fontSize || null,
        renderHTML: (attributes: Record<string, string | null>) => {
          if (!attributes.fontSize) return {};
          return { style: `font-size: ${attributes.fontSize}` };
        },
      },
    };
  },
});

interface AnnouncementRichEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const FONT_SIZES = [
  { label: '小', value: '12px' },
  { label: '標準', value: '14px' },
  { label: '中', value: '16px' },
  { label: '大', value: '18px' },
  { label: '特大', value: '24px' },
];

const COLORS = [
  { label: '黒', value: '#111827' },
  { label: 'グレー', value: '#6B7280' },
  { label: '赤', value: '#DC2626' },
  { label: 'オレンジ', value: '#EA580C' },
  { label: '青', value: '#2563EB' },
  { label: '緑', value: '#16A34A' },
  { label: '紫', value: '#9333EA' },
  { label: 'ピンク', value: '#DB2777' },
];

export default function AnnouncementRichEditor({
  value,
  onChange,
  placeholder = 'お知らせの内容を入力...',
}: AnnouncementRichEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const colorRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'is-editor-empty',
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
      FontSize,
      Color,
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-2',
        },
      }),
    ],
    content: value || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none text-gray-900 px-4 py-3',
        style: 'min-height: 180px',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  // ドロップダウンの外側クリックで閉じる
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (colorRef.current && !colorRef.current.contains(e.target as Node)) setShowColorPicker(false);
      if (sizeRef.current && !sizeRef.current.contains(e.target as Node)) setShowSizePicker(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const setLink = useCallback(() => {
    if (!editor || !linkUrl) return;
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    setLinkUrl('');
    setShowLinkInput(false);
  }, [editor, linkUrl]);

  const removeLink = useCallback(() => {
    if (!editor) return;
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    setShowLinkInput(false);
  }, [editor]);

  const addImage = useCallback(() => {
    if (!editor || !imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl('');
    setShowImageInput(false);
  }, [editor, imageUrl]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;
    // FileをBase64に変換してインライン画像として挿入
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      editor.chain().focus().setImage({ src: base64 }).run();
    };
    reader.readAsDataURL(file);
  }, [editor]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!editor) return null;

  const ToolbarButton = ({
    onClick,
    isActive = false,
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
      className={`p-1.5 rounded transition-colors ${
        isActive
          ? 'bg-indigo-100 text-indigo-700'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {/* ツールバー */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        {/* テキスト装飾 */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="太字"
        >
          <Bold size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="斜体"
        >
          <Italic size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="下線"
        >
          <UnderlineIcon size={16} />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* 文字色 */}
        <div className="relative" ref={colorRef}>
          <ToolbarButton
            onClick={() => { setShowColorPicker(!showColorPicker); setShowSizePicker(false); }}
            isActive={showColorPicker}
            title="文字色"
          >
            <Palette size={16} />
          </ToolbarButton>
          {showColorPicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-50 grid grid-cols-4 gap-1 min-w-[140px]">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setColor(c.value).run();
                    setShowColorPicker(false);
                  }}
                  title={c.label}
                  className="w-7 h-7 rounded-full border border-gray-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: c.value }}
                />
              ))}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetColor().run();
                  setShowColorPicker(false);
                }}
                title="色をリセット"
                className="col-span-4 text-xs text-gray-500 hover:text-gray-700 mt-1 py-1"
              >
                リセット
              </button>
            </div>
          )}
        </div>

        {/* フォントサイズ */}
        <div className="relative" ref={sizeRef}>
          <ToolbarButton
            onClick={() => { setShowSizePicker(!showSizePicker); setShowColorPicker(false); }}
            isActive={showSizePicker}
            title="文字サイズ"
          >
            <Type size={16} />
          </ToolbarButton>
          {showSizePicker && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-1 z-50 min-w-[100px]">
              {FONT_SIZES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => {
                    editor.chain().focus().setMark('textStyle', { fontSize: s.value }).run();
                    setShowSizePicker(false);
                  }}
                  className="block w-full text-left px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded"
                  style={{ fontSize: s.value }}
                >
                  {s.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  editor.chain().focus().unsetMark('textStyle').run();
                  setShowSizePicker(false);
                }}
                className="block w-full text-left px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 border-t border-gray-100 mt-1"
              >
                リセット
              </button>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* 見出し */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="見出し2"
        >
          <Heading2 size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="見出し3"
        >
          <Heading3 size={16} />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* リスト */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="箇条書き"
        >
          <List size={16} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="番号付きリスト"
        >
          <ListOrdered size={16} />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* リンク */}
        <ToolbarButton
          onClick={() => { setShowLinkInput(!showLinkInput); setShowImageInput(false); }}
          isActive={editor.isActive('link')}
          title="リンク"
        >
          <LinkIcon size={16} />
        </ToolbarButton>
        {editor.isActive('link') && (
          <ToolbarButton onClick={removeLink} title="リンク解除">
            <Unlink size={16} />
          </ToolbarButton>
        )}

        <div className="w-px h-5 bg-gray-300 mx-1" />

        {/* 画像 */}
        <ToolbarButton
          onClick={() => { setShowImageInput(!showImageInput); setShowLinkInput(false); }}
          isActive={showImageInput}
          title="画像を挿入"
        >
          <ImageIcon size={16} />
        </ToolbarButton>
      </div>

      {/* リンクURL入力 */}
      {showLinkInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setLink(); } }}
          />
          <button type="button" onClick={setLink} className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700">設定</button>
          <button type="button" onClick={() => { setShowLinkInput(false); setLinkUrl(''); }} className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700">閉じる</button>
        </div>
      )}

      {/* 画像挿入 */}
      {showImageInput && (
        <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="画像URL (https://...)"
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded text-gray-900 placeholder:text-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
          />
          <button type="button" onClick={addImage} className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700">挿入</button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 text-xs font-medium text-indigo-600 border border-indigo-300 rounded hover:bg-indigo-50"
          >
            ファイル選択
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
              e.target.value = '';
            }}
          />
          <button type="button" onClick={() => { setShowImageInput(false); setImageUrl(''); }} className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700">閉じる</button>
        </div>
      )}

      {/* エディタ本体 */}
      <EditorContent editor={editor} />

      <style jsx global>{`
        .is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }
      `}</style>
    </div>
  );
}
