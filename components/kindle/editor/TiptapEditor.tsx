'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Undo, Redo,
  Check, Loader2
} from 'lucide-react';

interface TiptapEditorProps {
  initialContent: string;
  sectionId: string;
  sectionTitle: string;
  onSave: (sectionId: string, content: string) => Promise<void>;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  initialContent,
  sectionId,
  sectionTitle,
  onSave,
}) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedContentRef = useRef<string>(initialContent);
  const currentSectionIdRef = useRef<string>(sectionId);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'ここから執筆を始めましょう...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: initialContent || '',
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[calc(100vh-300px)] px-8 py-6',
      },
    },
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      
      // デバウンス: 入力が止まってから1.5秒後に保存
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        // 内容に変更がない場合はスキップ
        if (content === lastSavedContentRef.current) return;

        setSaveStatus('saving');
        try {
          await onSave(currentSectionIdRef.current, content);
          lastSavedContentRef.current = content;
          setSaveStatus('saved');
          
          // 3秒後にステータスをリセット
          setTimeout(() => {
            setSaveStatus((current) => current === 'saved' ? 'idle' : current);
          }, 3000);
        } catch (error) {
          console.error('Save error:', error);
          setSaveStatus('error');
        }
      }, 1500);
    },
  });

  // sectionIdが変わった時にエディタの内容を更新
  useEffect(() => {
    if (editor && sectionId !== currentSectionIdRef.current) {
      // 未保存の内容があれば先に保存
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        const currentContent = editor.getHTML();
        if (currentContent !== lastSavedContentRef.current) {
          onSave(currentSectionIdRef.current, currentContent);
        }
      }
      
      currentSectionIdRef.current = sectionId;
      lastSavedContentRef.current = initialContent;
      editor.commands.setContent(initialContent || '');
      setSaveStatus('idle');
    }
  }, [sectionId, initialContent, editor, onSave]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-amber-500" size={32} />
      </div>
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
      className={`p-2 rounded-lg transition-all ${
        isActive
          ? 'bg-amber-100 text-amber-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* ヘッダー：節タイトルと保存ステータス */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">執筆中:</span>
          <h2 className="font-bold text-gray-900 text-lg">{sectionTitle}</h2>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === 'saving' && (
            <span className="flex items-center gap-1.5 text-amber-600 text-sm animate-pulse">
              <Loader2 className="animate-spin" size={14} />
              保存中...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="flex items-center gap-1.5 text-green-600 text-sm">
              <Check size={14} />
              保存済み
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-red-500 text-sm">
              保存エラー
            </span>
          )}
        </div>
      </div>

      {/* ツールバー */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-100 bg-white flex-wrap">
        <div className="flex items-center gap-1 pr-3 border-r border-gray-200">
          <ToolButton
            onClick={() => editor.chain().focus().undo().run()}
            title="元に戻す"
          >
            <Undo size={18} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().redo().run()}
            title="やり直す"
          >
            <Redo size={18} />
          </ToolButton>
        </div>

        <div className="flex items-center gap-1 px-3 border-r border-gray-200">
          <ToolButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            title="見出し1"
          >
            <Heading1 size={18} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            title="見出し2"
          >
            <Heading2 size={18} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            title="見出し3"
          >
            <Heading3 size={18} />
          </ToolButton>
        </div>

        <div className="flex items-center gap-1 px-3 border-r border-gray-200">
          <ToolButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            title="太字"
          >
            <Bold size={18} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            title="斜体"
          >
            <Italic size={18} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            title="取り消し線"
          >
            <Strikethrough size={18} />
          </ToolButton>
        </div>

        <div className="flex items-center gap-1 px-3 border-r border-gray-200">
          <ToolButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            title="箇条書き"
          >
            <List size={18} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            title="番号付きリスト"
          >
            <ListOrdered size={18} />
          </ToolButton>
        </div>

        <div className="flex items-center gap-1 px-3">
          <ToolButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            title="引用"
          >
            <Quote size={18} />
          </ToolButton>
          <ToolButton
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="水平線"
          >
            <Minus size={18} />
          </ToolButton>
        </div>
      </div>

      {/* エディタ本体 */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* スタイル */}
      <style jsx global>{`
        .ProseMirror {
          min-height: calc(100vh - 300px);
        }
        
        .ProseMirror:focus {
          outline: none;
        }
        
        .ProseMirror.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        
        .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin: 1.5rem 0 1rem 0;
          color: #1f2937;
        }
        
        .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.25rem 0 0.75rem 0;
          color: #374151;
        }
        
        .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          color: #4b5563;
        }
        
        .ProseMirror p {
          margin: 0.75rem 0;
          line-height: 1.8;
          color: #374151;
        }
        
        .ProseMirror ul, .ProseMirror ol {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }
        
        .ProseMirror li {
          margin: 0.25rem 0;
          line-height: 1.8;
        }
        
        .ProseMirror blockquote {
          border-left: 4px solid #f59e0b;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #6b7280;
          font-style: italic;
          background-color: #fffbeb;
          padding: 0.75rem 1rem;
          border-radius: 0 0.5rem 0.5rem 0;
        }
        
        .ProseMirror hr {
          margin: 1.5rem 0;
          border: none;
          border-top: 2px solid #e5e7eb;
        }
        
        .ProseMirror strong {
          font-weight: 700;
          color: #1f2937;
        }
        
        .ProseMirror em {
          font-style: italic;
        }
        
        .ProseMirror s {
          text-decoration: line-through;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default TiptapEditor;

