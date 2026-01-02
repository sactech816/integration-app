'use client';

import React, { useEffect, useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { 
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Undo, Redo,
  Check, Loader2, Bot, AlertCircle, X, Sparkles, RefreshCw
} from 'lucide-react';

// 執筆スタイルの定義（APIと同期）
const WRITING_STYLES = {
  toc_default: {
    id: 'toc_default',
    name: '目次スタイル',
    description: '目次で設定したスタイルに従う',
    icon: '📋',
  },
  descriptive: {
    id: 'descriptive',
    name: '説明文',
    description: 'PREP法を基本とした解説形式',
    icon: '📝',
  },
  narrative: {
    id: 'narrative',
    name: '物語',
    description: 'ストーリーテリング形式',
    icon: '📖',
  },
  dialogue: {
    id: 'dialogue',
    name: '対話形式',
    description: '登場人物の会話で進行',
    icon: '💬',
  },
  qa: {
    id: 'qa',
    name: 'Q&A',
    description: '質問と回答の形式',
    icon: '❓',
  },
  workbook: {
    id: 'workbook',
    name: 'ワークブック',
    description: '解説+実践ワーク形式',
    icon: '✏️',
  },
} as const;

type WritingStyleId = keyof typeof WRITING_STYLES;
type ActualWritingStyleId = Exclude<WritingStyleId, 'toc_default'>;

// 目次パターンから執筆スタイルへのマッピング
const PATTERN_TO_STYLE_MAP: Record<string, WritingStyleId> = {
  basic: 'descriptive',
  problem: 'descriptive',
  story: 'narrative',
  qa: 'qa',
  workbook: 'workbook',
  original: 'descriptive',
};

interface BookInfo {
  id: string;
  title: string;
  subtitle: string | null;
}

interface TargetProfile {
  profile?: string;
  merits?: string[];
  benefits?: string[];
  usp?: string;
}

interface TiptapEditorProps {
  initialContent: string;
  sectionId: string;
  sectionTitle: string;
  chapterTitle: string;
  bookInfo: BookInfo;
  targetProfile?: TargetProfile;
  tocPatternId?: string; // 目次で選択したパターンID（デフォルトスタイル決定用）
  onSave: (sectionId: string, content: string) => Promise<void>;
}

// 外部から呼び出せる関数のインターフェース
export interface TiptapEditorRef {
  forceSave: () => Promise<void>;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export const TiptapEditor = forwardRef<TiptapEditorRef, TiptapEditorProps>(({
  initialContent,
  sectionId,
  sectionTitle,
  chapterTitle,
  bookInfo,
  targetProfile,
  tocPatternId,
  onSave,
}, ref) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [isRewriteModalOpen, setIsRewriteModalOpen] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteError, setRewriteError] = useState<string | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');
  // デフォルトは「目次スタイル」（toc_default）
  const [selectedStyle, setSelectedStyle] = useState<WritingStyleId>('toc_default');
  const [rewriteStyle, setRewriteStyle] = useState<WritingStyleId>('toc_default');
  // 要望欄
  const [generateInstruction, setGenerateInstruction] = useState<string>('');
  const [rewriteInstruction, setRewriteInstruction] = useState<string>('');
  
  // 目次パターンから実際のスタイルを取得するヘルパー
  const getActualStyle = useCallback((styleId: WritingStyleId): ActualWritingStyleId => {
    if (styleId === 'toc_default') {
      // 目次パターンからスタイルを決定
      if (tocPatternId && PATTERN_TO_STYLE_MAP[tocPatternId]) {
        return PATTERN_TO_STYLE_MAP[tocPatternId];
      }
      return 'descriptive'; // デフォルト
    }
    return styleId as ActualWritingStyleId;
  }, [tocPatternId]);
  
  // 目次スタイルの表示名を取得
  const getTocStyleName = useCallback((): string => {
    if (tocPatternId && PATTERN_TO_STYLE_MAP[tocPatternId]) {
      const actualStyle = PATTERN_TO_STYLE_MAP[tocPatternId];
      return WRITING_STYLES[actualStyle].name;
    }
    return '説明文';
  }, [tocPatternId]);
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
    immediatelyRender: false, // SSR対応: ハイドレーションミスマッチを防ぐ
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

  // 外部から呼び出せる強制保存関数
  useImperativeHandle(ref, () => ({
    forceSave: async () => {
      if (!editor) return;
      
      // デバウンスタイマーをキャンセル
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      
      const content = editor.getHTML();
      
      // 変更がない場合はスキップ
      if (content === lastSavedContentRef.current) {
        return;
      }
      
      setSaveStatus('saving');
      try {
        await onSave(currentSectionIdRef.current, content);
        lastSavedContentRef.current = content;
        setSaveStatus('saved');
      } catch (error) {
        console.error('Force save error:', error);
        setSaveStatus('error');
        throw error;
      }
    },
  }), [editor, onSave]);

  // AI執筆ボタンクリック時：モーダルを開く
  const handleAIButtonClick = () => {
    if (isGenerating) return;
    setIsStyleModalOpen(true);
  };

  // モーダルでスタイルを選択して執筆開始
  const handleStartGeneration = async (styleId: WritingStyleId, instruction: string) => {
    if (!editor || isGenerating) return;

    // 「目次スタイル」の場合は実際のスタイルに変換
    const actualStyleId = getActualStyle(styleId);

    setIsStyleModalOpen(false);
    setIsGenerating(true);
    setGenerateError(null);
    setGenerateInstruction(''); // 要望欄をクリア

    try {
      const response = await fetch('/api/kdl/generate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          book_id: bookInfo.id,
          book_title: bookInfo.title,
          book_subtitle: bookInfo.subtitle,
          chapter_title: chapterTitle,
          section_title: sectionTitle,
          target_profile: targetProfile,
          writing_style: actualStyleId,
          instruction: instruction.trim() || undefined, // 要望があれば送信
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '生成に失敗しました');
      }

      const data = await response.json();
      
      if (data.content) {
        // 現在のカーソル位置に挿入（または末尾に追加）
        editor.chain().focus().insertContent(data.content).run();
      }
    } catch (error: any) {
      console.error('AI生成エラー:', error);
      setGenerateError(error.message || '本文の生成に失敗しました');
      
      // 5秒後にエラーをクリア
      setTimeout(() => {
        setGenerateError(null);
      }, 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  // 選択テキスト書き換えボタンクリック時
  const handleRewriteButtonClick = () => {
    if (!editor || isRewriting) return;
    
    // 選択されたテキストを取得
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, ' ');
    
    if (!text || text.trim() === '') {
      setRewriteError('テキストを選択してください');
      setTimeout(() => setRewriteError(null), 3000);
      return;
    }
    
    setSelectedText(text);
    setIsRewriteModalOpen(true);
  };

  // 選択テキストを書き換え
  const handleRewriteText = async (styleId: WritingStyleId, instruction: string) => {
    if (!editor || isRewriting || !selectedText) return;

    // 「目次スタイル」の場合は実際のスタイルに変換
    const actualStyleId = getActualStyle(styleId);

    setIsRewriteModalOpen(false);
    setIsRewriting(true);
    setRewriteError(null);
    setRewriteInstruction(''); // 要望欄をクリア

    try {
      const response = await fetch('/api/kdl/rewrite-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: selectedText,
          writing_style: actualStyleId,
          instruction: instruction.trim() || undefined, // 要望があれば送信
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '書き換えに失敗しました');
      }

      const data = await response.json();
      
      if (data.content) {
        // 選択されたテキストを書き換えた内容で置換
        editor.chain().focus().deleteSelection().insertContent(data.content).run();
      }
    } catch (error: any) {
      console.error('書き換えエラー:', error);
      setRewriteError(error.message || 'テキストの書き換えに失敗しました');
      
      setTimeout(() => {
        setRewriteError(null);
      }, 5000);
    } finally {
      setIsRewriting(false);
      setSelectedText('');
    }
  };

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

        <div className="flex items-center gap-1 px-3 border-r border-gray-200">
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

        {/* AI執筆ボタン */}
        <div className="flex items-center gap-2 px-3">
          <button
            type="button"
            onClick={handleAIButtonClick}
            disabled={isGenerating}
            title="AIにこの節を書いてもらう"
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              isGenerating
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-600 hover:to-indigo-600 shadow-md hover:shadow-lg'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>執筆中...</span>
              </>
            ) : (
              <>
                <Bot size={16} />
                <span>AI執筆</span>
              </>
            )}
          </button>

          {/* 選択テキスト書き換えボタン */}
          <button
            type="button"
            onClick={handleRewriteButtonClick}
            disabled={isRewriting}
            title="選択したテキストを別のスタイルで書き換える"
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
              isRewriting
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 shadow-md hover:shadow-lg'
            }`}
          >
            {isRewriting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                <span>書換中...</span>
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                <span>書き換え</span>
              </>
            )}
          </button>
          
          {generateError && (
            <div className="flex items-center gap-1.5 text-red-500 text-sm animate-pulse">
              <AlertCircle size={14} />
              <span>{generateError}</span>
            </div>
          )}
          
          {rewriteError && (
            <div className="flex items-center gap-1.5 text-red-500 text-sm animate-pulse">
              <AlertCircle size={14} />
              <span>{rewriteError}</span>
            </div>
          )}
        </div>
      </div>

      {/* スタイル選択モーダル */}
      {isStyleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
                  <Sparkles className="text-white" size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">AI執筆スタイル</h3>
                  <p className="text-xs text-gray-500">この節の執筆スタイルを選択</p>
                </div>
              </div>
              <button
                onClick={() => setIsStyleModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* スクロール可能なコンテンツ */}
            <div className="overflow-y-auto flex-1">
              {/* スタイル選択 */}
              <div className="p-4 space-y-2">
                {Object.values(WRITING_STYLES).map((style) => {
                  const isSelected = selectedStyle === style.id;
                  const isTocDefault = style.id === 'toc_default';
                  
                  return (
                    <button
                      key={style.id}
                      onClick={() => setSelectedStyle(style.id as WritingStyleId)}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50/50'
                      }`}
                    >
                      <span className="text-2xl">{style.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{style.name}</span>
                          {isTocDefault && (
                            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                              推奨
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {isTocDefault 
                            ? `現在: ${getTocStyleName()}（目次で設定したスタイル）` 
                            : style.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 要望欄 */}
              <div className="px-4 pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  追加の要望（任意）
                </label>
                <textarea
                  value={generateInstruction}
                  onChange={(e) => setGenerateInstruction(e.target.value)}
                  placeholder="例: 具体例を多めに入れてください、初心者向けにやさしく書いてください"
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all resize-none"
                  rows={2}
                />
              </div>
            </div>

            {/* アクションボタン */}
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setIsStyleModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleStartGeneration(selectedStyle, generateInstruction)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium hover:from-purple-600 hover:to-indigo-600 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Sparkles size={16} />
                執筆開始
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 書き換えスタイル選択モーダル */}
      {isRewriteModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* モーダルヘッダー */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
                  <RefreshCw className="text-white" size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">テキスト書き換え</h3>
                  <p className="text-xs text-gray-500">選択部分を別スタイルに変換</p>
                </div>
              </div>
              <button
                onClick={() => setIsRewriteModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            {/* スクロール可能なコンテンツ */}
            <div className="overflow-y-auto flex-1">
              {/* 選択テキストプレビュー */}
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                <p className="text-xs text-gray-500 mb-1">選択中のテキスト:</p>
                <p className="text-sm text-gray-700 line-clamp-3">{selectedText}</p>
              </div>

              {/* スタイル選択 */}
              <div className="p-4 space-y-2">
                {Object.values(WRITING_STYLES).map((style) => {
                  const isSelected = rewriteStyle === style.id;
                  const isTocDefault = style.id === 'toc_default';
                  
                  return (
                    <button
                      key={style.id}
                      onClick={() => setRewriteStyle(style.id as WritingStyleId)}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50'
                          : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/50'
                      }`}
                    >
                      <span className="text-2xl">{style.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{style.name}</span>
                          {isTocDefault && (
                            <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">
                              推奨
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {isTocDefault 
                            ? `現在: ${getTocStyleName()}（目次で設定したスタイル）` 
                            : style.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* 要望欄 */}
              <div className="px-4 pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  追加の要望（任意）
                </label>
                <textarea
                  value={rewriteInstruction}
                  onChange={(e) => setRewriteInstruction(e.target.value)}
                  placeholder="例: もっと簡潔にしてください、専門用語を減らしてください"
                  className="w-full border border-gray-300 rounded-xl p-3 text-sm text-gray-900 placeholder-gray-400 focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-none"
                  rows={2}
                />
              </div>
            </div>

            {/* アクションボタン */}
            <div className="px-5 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setIsRewriteModalOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={() => handleRewriteText(rewriteStyle, rewriteInstruction)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-medium hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                書き換え実行
              </button>
            </div>
          </div>
        </div>
      )}

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
});

TiptapEditor.displayName = 'TiptapEditor';

export default TiptapEditor;

