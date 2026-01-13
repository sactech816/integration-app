'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  BookOpen, 
  FileText, 
  Zap, 
  Loader2,
  MoreVertical,
  Pencil,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Home,
  X,
} from 'lucide-react';
import Link from 'next/link';

interface Section {
  id: string;
  title: string;
  order_index: number;
  content: string;
}

interface Chapter {
  id: string;
  title: string;
  summary: string | null;
  order_index: number;
  sections: Section[];
}

interface BatchWriteProgress {
  isRunning: boolean;
  chapterId: string | null;
  currentIndex: number;
  totalCount: number;
  currentSectionTitle: string;
}

// 構成変更用のハンドラー型
interface StructureHandlers {
  onAddChapter: (title: string) => Promise<void>;
  onAddSection: (chapterId: string, title: string) => Promise<void>;
  onRenameChapter: (chapterId: string, newTitle: string) => Promise<void>;
  onRenameSection: (sectionId: string, newTitle: string) => Promise<void>;
  onDeleteChapter: (chapterId: string) => Promise<void>;
  onDeleteSection: (sectionId: string, chapterId: string) => Promise<void>;
  onMoveChapter: (chapterId: string, direction: 'up' | 'down') => Promise<void>;
  onMoveSection: (sectionId: string, chapterId: string, direction: 'up' | 'down') => Promise<void>;
}

interface ChapterSidebarProps {
  chapters: Chapter[];
  activeSectionId: string;
  onSectionClick: (sectionId: string) => void;
  bookTitle: string;
  bookSubtitle?: string | null;
  bookId: string; // 追加: 書籍ID
  onUpdateBookInfo?: (title: string, subtitle: string | null) => Promise<void>; // 追加: 書籍情報更新ハンドラー
  onBatchWrite?: (chapterId: string) => void;
  batchProgress?: BatchWriteProgress;
  structureHandlers?: StructureHandlers;
  readOnly?: boolean; // 閲覧専用モード（デモ用）
  onCloseSidebar?: () => void; // スマホ用サイドバーを閉じる関数
}

// ドロップダウンメニューコンポーネント
interface DropdownMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }[];
  position: { x: number; y: number };
}

const DropdownMenu: React.FC<DropdownMenuProps> = ({ isOpen, onClose, items, position }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // 画面外にはみ出さないように位置調整
  const adjustedX = Math.min(position.x, window.innerWidth - 180);
  const adjustedY = Math.min(position.y, window.innerHeight - 200);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-1 min-w-[160px] animate-fade-in"
      style={{ 
        top: adjustedY,
        left: adjustedX,
      }}
    >
      {items.map((item, index) => (
        <button
          key={index}
          onClick={() => {
            item.onClick();
            onClose();
          }}
          className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
            item.danger 
              ? 'text-red-600 hover:bg-red-50' 
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
};

// インライン編集用コンポーネント
interface InlineEditProps {
  value: string;
  onSave: (value: string) => Promise<void> | void;
  onCancel: () => void;
  className?: string;
}

const InlineEdit: React.FC<InlineEditProps> = ({ value, onSave, onCancel, className }) => {
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const hasSavedRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const handleSave = async () => {
    if (isSaving || hasSavedRef.current) return;
    
    const trimmedValue = editValue.trim();
    if (trimmedValue && trimmedValue !== value) {
      hasSavedRef.current = true;
      setIsSaving(true);
      try {
        await onSave(trimmedValue);
      } catch (error) {
        console.error('Save error:', error);
        // エラーでも編集モードを終了
      } finally {
        setIsSaving(false);
      }
    } else {
      hasSavedRef.current = true;
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      hasSavedRef.current = true;
      onCancel();
    }
  };

  const handleBlur = () => {
    // 少し遅延させて、クリック等のイベントが先に処理されるようにする
    setTimeout(() => {
      if (!hasSavedRef.current) {
        handleSave();
      }
    }, 100);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      disabled={isSaving}
      className={`bg-white border-2 border-amber-400 rounded px-2 py-1 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 ${isSaving ? 'opacity-50' : ''} ${className}`}
      onClick={(e) => e.stopPropagation()}
    />
  );
};

export const ChapterSidebar: React.FC<ChapterSidebarProps> = ({
  chapters,
  activeSectionId,
  onSectionClick,
  bookTitle,
  bookSubtitle,
  bookId,
  onUpdateBookInfo,
  onBatchWrite,
  batchProgress,
  structureHandlers,
  readOnly = false,
  onCloseSidebar,
}) => {
  // 初期状態: アクティブな節を含む章を展開
  const getInitialExpandedChapters = () => {
    const expandedSet = new Set<string>();
    for (const chapter of chapters) {
      if (chapter.sections.some(s => s.id === activeSectionId)) {
        expandedSet.add(chapter.id);
        break;
      }
    }
    // 最初の章は常に展開
    if (chapters.length > 0) {
      expandedSet.add(chapters[0].id);
    }
    return expandedSet;
  };

  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(getInitialExpandedChapters);
  const [dropdownState, setDropdownState] = useState<{
    type: 'chapter' | 'section' | null;
    id: string | null;
    chapterId?: string;
    position: { x: number; y: number };
  }>({ type: null, id: null, position: { x: 0, y: 0 } });
  
  const [editState, setEditState] = useState<{
    type: 'chapter' | 'section' | 'book-title' | 'book-subtitle' | null;
    id: string | null;
    chapterId?: string;
  }>({ type: null, id: null });

  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [addingSectionChapterId, setAddingSectionChapterId] = useState<string | null>(null);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addChapterInputRef = useRef<HTMLInputElement>(null);
  const addSectionInputRef = useRef<HTMLInputElement>(null);
  const hasAddedChapterRef = useRef(false);
  const hasAddedSectionRef = useRef(false);

  useEffect(() => {
    if (isAddingChapter) {
      addChapterInputRef.current?.focus();
      hasAddedChapterRef.current = false; // 新しく章追加モードに入った時にリセット
    }
  }, [isAddingChapter]);

  useEffect(() => {
    if (addingSectionChapterId) {
      addSectionInputRef.current?.focus();
      hasAddedSectionRef.current = false; // 新しく節追加モードに入った時にリセット
    }
  }, [addingSectionChapterId]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  // 章がアクティブな節を含むかチェック
  const chapterHasActiveSection = (chapter: Chapter) => {
    return chapter.sections.some(s => s.id === activeSectionId);
  };

  // 章の未執筆節の数を取得
  const getUnwrittenCount = (chapter: Chapter) => {
    return chapter.sections.filter(s => !s.content || s.content.trim() === '').length;
  };

  // 章が一括執筆中かどうか
  const isChapterWriting = (chapterId: string) => {
    return batchProgress?.isRunning && batchProgress?.chapterId === chapterId;
  };

  // メニューを開く
  const openChapterMenu = (e: React.MouseEvent, chapter: Chapter) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDropdownState({
      type: 'chapter',
      id: chapter.id,
      position: { x: rect.right + 4, y: rect.top },
    });
  };

  const openSectionMenu = (e: React.MouseEvent, section: Section, chapterId: string) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDropdownState({
      type: 'section',
      id: section.id,
      chapterId,
      position: { x: rect.right + 4, y: rect.top },
    });
  };

  // 章メニューの項目
  const getChapterMenuItems = (chapter: Chapter, chapterIndex: number): { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }[] => {
    if (!structureHandlers) return [];
    
    const items: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }[] = [
      {
        label: 'タイトル変更',
        icon: <Pencil size={14} />,
        onClick: () => setEditState({ type: 'chapter', id: chapter.id }),
      },
      {
        label: '節を追加',
        icon: <Plus size={14} />,
        onClick: () => {
          setAddingSectionChapterId(chapter.id);
          setExpandedChapters(prev => new Set(prev).add(chapter.id));
        },
      },
    ];

    // 上へ移動（最初の章でなければ）
    if (chapterIndex > 0) {
      items.push({
        label: '上へ移動',
        icon: <ArrowUp size={14} />,
        onClick: () => structureHandlers.onMoveChapter(chapter.id, 'up'),
      });
    }

    // 下へ移動（最後の章でなければ）
    if (chapterIndex < chapters.length - 1) {
      items.push({
        label: '下へ移動',
        icon: <ArrowDown size={14} />,
        onClick: () => structureHandlers.onMoveChapter(chapter.id, 'down'),
      });
    }

    items.push({
      label: '削除',
      icon: <Trash2 size={14} />,
      onClick: () => {
        if (confirm('この章と含まれる全ての節を削除しますか？\nこの操作は取り消せません。')) {
          structureHandlers.onDeleteChapter(chapter.id);
        }
      },
      danger: true,
    });

    return items;
  };

  // 節メニューの項目
  const getSectionMenuItems = (section: Section, sectionIndex: number, chapter: Chapter): { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }[] => {
    if (!structureHandlers) return [];
    
    const items: { label: string; icon: React.ReactNode; onClick: () => void; danger?: boolean }[] = [
      {
        label: 'タイトル変更',
        icon: <Pencil size={14} />,
        onClick: () => setEditState({ type: 'section', id: section.id, chapterId: chapter.id }),
      },
    ];

    // 上へ移動（最初の節でなければ）
    if (sectionIndex > 0) {
      items.push({
        label: '上へ移動',
        icon: <ArrowUp size={14} />,
        onClick: () => structureHandlers.onMoveSection(section.id, chapter.id, 'up'),
      });
    }

    // 下へ移動（最後の節でなければ）
    if (sectionIndex < chapter.sections.length - 1) {
      items.push({
        label: '下へ移動',
        icon: <ArrowDown size={14} />,
        onClick: () => structureHandlers.onMoveSection(section.id, chapter.id, 'down'),
      });
    }

    items.push({
      label: '削除',
      icon: <Trash2 size={14} />,
      onClick: () => {
        if (confirm('この節を削除しますか？\n執筆済みの内容も全て削除されます。')) {
          structureHandlers.onDeleteSection(section.id, chapter.id);
        }
      },
      danger: true,
    });

    return items;
  };

  // 新しい章を追加（引数でタイトルを受け取れるように）
  const handleAddChapter = async (titleOverride?: string) => {
    // 二重呼び出し防止
    if (hasAddedChapterRef.current || isSubmitting) return;
    
    const titleToUse = titleOverride ?? newChapterTitle;
    
    if (!titleToUse.trim() || !structureHandlers) {
      setIsAddingChapter(false);
      setNewChapterTitle('');
      return;
    }
    
    hasAddedChapterRef.current = true;
    setIsSubmitting(true);
    try {
      await structureHandlers.onAddChapter(titleToUse.trim());
      setNewChapterTitle('');
      setIsAddingChapter(false);
    } catch (error) {
      console.error('章の追加に失敗:', error);
      hasAddedChapterRef.current = false; // エラー時は再試行可能にする
    } finally {
      setIsSubmitting(false);
    }
  };

  // 新しい節を追加（引数でタイトルとchapterIdを受け取れるように）
  const handleAddSection = async (titleOverride?: string, chapterIdOverride?: string) => {
    // 二重呼び出し防止
    if (hasAddedSectionRef.current || isSubmitting) return;
    
    const titleToUse = titleOverride ?? newSectionTitle;
    const chapterIdToUse = chapterIdOverride ?? addingSectionChapterId;
    
    if (!titleToUse.trim() || !chapterIdToUse || !structureHandlers) {
      setAddingSectionChapterId(null);
      setNewSectionTitle('');
      return;
    }
    
    hasAddedSectionRef.current = true;
    setIsSubmitting(true);
    try {
      await structureHandlers.onAddSection(chapterIdToUse, titleToUse.trim());
      setNewSectionTitle('');
      setAddingSectionChapterId(null);
    } catch (error) {
      console.error('節の追加に失敗:', error);
      hasAddedSectionRef.current = false; // エラー時は再試行可能にする
    } finally {
      setIsSubmitting(false);
    }
  };

  // 章のリネーム
  const handleRenameChapter = async (chapterId: string, newTitle: string) => {
    if (!structureHandlers) return;
    try {
      await structureHandlers.onRenameChapter(chapterId, newTitle);
    } finally {
      setEditState({ type: null, id: null });
    }
  };

  // 節のリネーム
  const handleRenameSection = async (sectionId: string, newTitle: string) => {
    if (!structureHandlers) return;
    try {
      await structureHandlers.onRenameSection(sectionId, newTitle);
    } finally {
      setEditState({ type: null, id: null });
    }
  };

  // 書籍情報のリネーム
  const handleUpdateBookInfo = async (newTitle: string, newSubtitle: string | null) => {
    if (!onUpdateBookInfo) return;
    try {
      await onUpdateBookInfo(newTitle, newSubtitle || '');
    } finally {
      setEditState({ type: null, id: null });
    }
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-amber-50 to-orange-50">
      {/* ヘッダー: 本のタイトル */}
      <div className="p-3 sm:p-4 border-b border-amber-100 bg-white/60 backdrop-blur-sm">
        <div className="flex items-start gap-2 sm:gap-3">
          {/* スマホ用閉じるボタン */}
          {onCloseSidebar && (
            <button
              onClick={onCloseSidebar}
              className="lg:hidden p-1.5 rounded-lg hover:bg-amber-100 transition-colors flex-shrink-0 -ml-1"
              title="閉じる"
            >
              <X size={18} className="text-gray-600" />
            </button>
          )}
          
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2 rounded-lg shadow-md flex-shrink-0">
            <BookOpen className="text-white" size={18} />
          </div>
          <div className="min-w-0 flex-1">
            {editState.type === 'book-title' ? (
              <InlineEdit
                value={bookTitle}
                onSave={(newValue) => handleUpdateBookInfo(newValue, bookSubtitle || null)}
                onCancel={() => setEditState({ type: null, id: null })}
                className="w-full text-xs sm:text-sm font-bold"
              />
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-gray-900 text-xs sm:text-sm leading-tight line-clamp-2 flex-1">
                  {bookTitle}
                </h1>
                {!readOnly && onUpdateBookInfo && (
                  <button
                    onClick={() => setEditState({ type: 'book-title', id: bookId })}
                    className="text-gray-400 hover:text-amber-600 transition-colors p-1 rounded hover:bg-amber-50 flex-shrink-0"
                    title="タイトルを編集"
                  >
                    <Pencil size={14} />
                  </button>
                )}
              </div>
            )}
            {editState.type === 'book-subtitle' ? (
              <InlineEdit
                value={bookSubtitle || ''}
                onSave={(newValue) => handleUpdateBookInfo(bookTitle, newValue || null)}
                onCancel={() => setEditState({ type: null, id: null })}
                className="w-full text-xs"
              />
            ) : bookSubtitle ? (
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs text-gray-500 line-clamp-1 flex-1">
                  {bookSubtitle}
                </p>
                {!readOnly && onUpdateBookInfo && (
                  <button
                    onClick={() => setEditState({ type: 'book-subtitle', id: bookId })}
                    className="text-gray-400 hover:text-amber-600 transition-colors p-1 rounded hover:bg-amber-50 flex-shrink-0"
                    title="サブタイトルを編集"
                  >
                    <Pencil size={12} />
                  </button>
                )}
              </div>
            ) : !readOnly && onUpdateBookInfo ? (
              <button
                onClick={() => setEditState({ type: 'book-subtitle', id: bookId })}
                className="text-xs text-gray-400 hover:text-amber-600 transition-colors mt-1"
              >
                + サブタイトルを追加
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* 目次ヘッダー */}
      <div className="px-3 sm:px-4 py-2 sm:py-3 border-b border-amber-100/50">
        <h2 className="text-xs font-bold text-amber-700 uppercase tracking-wider">
          目次
        </h2>
      </div>

      {/* 章・節リスト */}
      <div className="flex-1 overflow-y-auto py-2 px-1 sm:px-0">
        {chapters.map((chapter, chapterIndex) => {
          const isExpanded = expandedChapters.has(chapter.id);
          const isActiveChapter = chapterHasActiveSection(chapter);
          const unwrittenCount = getUnwrittenCount(chapter);
          const isWriting = isChapterWriting(chapter.id);
          const isEditing = editState.type === 'chapter' && editState.id === chapter.id;

          return (
            <div key={chapter.id} className="mb-1">
              {/* 章ヘッダー */}
              <div
                className={`group flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-3 transition-all ${
                  isActiveChapter
                    ? 'bg-amber-100/80 border-l-4 border-amber-500'
                    : 'hover:bg-amber-50/80 border-l-4 border-transparent'
                }`}
              >
                <button
                  onClick={() => !isEditing && toggleChapter(chapter.id)}
                  className="flex items-center gap-2 flex-1 text-left min-w-0"
                >
                  <span className={`transition-transform flex-shrink-0 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                    <ChevronDown size={14} className="text-amber-600" />
                  </span>
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow-sm flex-shrink-0">
                    {chapterIndex + 1}
                  </span>
                  
                  {isEditing ? (
                    <InlineEdit
                      value={chapter.title.replace(/^第\d+章[　\s]+/, '')}
                      onSave={(value) => handleRenameChapter(chapter.id, value)}
                      onCancel={() => setEditState({ type: null, id: null })}
                      className="flex-1 min-w-0 text-xs sm:text-sm"
                    />
                  ) : (
                    <span className={`flex-1 text-xs sm:text-sm font-medium truncate ${
                      isActiveChapter ? 'text-amber-900' : 'text-gray-700'
                    }`}>
                      {chapter.title.replace(/^第\d+章[　\s]+/, '')}
                    </span>
                  )}
                </button>
                
                {/* 一括執筆ボタン */}
                {onBatchWrite && unwrittenCount > 0 && !isEditing && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBatchWrite(chapter.id);
                    }}
                    disabled={batchProgress?.isRunning}
                    title={`この章の未執筆節(${unwrittenCount}件)をAIで一括執筆`}
                    className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-xs font-medium transition-all flex-shrink-0 ${
                      isWriting
                        ? 'bg-purple-500 text-white animate-pulse'
                        : batchProgress?.isRunning
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                    }`}
                  >
                    {isWriting ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>{batchProgress?.currentIndex}/{batchProgress?.totalCount}</span>
                      </>
                    ) : (
                      <>
                        <Zap size={12} />
                        <span>{unwrittenCount}</span>
                      </>
                    )}
                  </button>
                )}

                {/* メニューボタン */}
                {structureHandlers && !isEditing && (
                  <button
                    onClick={(e) => openChapterMenu(e, chapter)}
                    className="opacity-0 group-hover:opacity-100 lg:opacity-0 p-1 rounded hover:bg-amber-200/50 transition-all flex-shrink-0 text-gray-500 hover:text-gray-700"
                    title="章のオプション"
                  >
                    <MoreVertical size={14} className="sm:w-4 sm:h-4" />
                  </button>
                )}
                
                <span className="text-xs text-gray-500 bg-white/60 px-1 sm:px-1.5 py-0.5 rounded flex-shrink-0">
                  {chapter.sections.length}
                </span>
              </div>

              {/* 節リスト */}
              {isExpanded && (
                <div className="bg-white/40 border-l-4 border-amber-100 ml-2 sm:ml-4 mr-1 sm:mr-2 my-1 rounded-lg overflow-hidden">
                  {chapter.sections.map((section, sectionIndex) => {
                    const isActive = section.id === activeSectionId;
                    const hasContent = section.content && section.content.trim() !== '';
                    const isSectionWriting = isWriting && batchProgress?.currentSectionTitle === section.title;
                    const isSectionEditing = editState.type === 'section' && editState.id === section.id;

                    return (
                      <div
                        key={section.id}
                        className={`group flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 transition-all cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md'
                            : isSectionWriting
                            ? 'bg-purple-100 text-purple-700'
                            : 'hover:bg-amber-50 text-gray-700 hover:text-gray-900'
                        }`}
                        onClick={() => !isSectionEditing && onSectionClick(section.id)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {isSectionWriting ? (
                            <Loader2 size={14} className="text-purple-600 animate-spin flex-shrink-0" />
                          ) : (
                            <FileText 
                              size={14} 
                              className={`flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-amber-500'}`} 
                            />
                          )}
                          <span className={`text-xs font-medium flex-shrink-0 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                            {sectionIndex + 1}.
                          </span>
                          
                          {isSectionEditing ? (
                            <InlineEdit
                              value={section.title}
                              onSave={(value) => handleRenameSection(section.id, value)}
                              onCancel={() => setEditState({ type: null, id: null })}
                              className="flex-1 min-w-0"
                            />
                          ) : (
                            <span className={`flex-1 text-xs sm:text-sm truncate ${isActive ? 'font-medium text-white' : ''}`}>
                              {section.title || `節 ${sectionIndex + 1}`}
                            </span>
                          )}
                        </div>

                        {isSectionWriting && (
                          <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full animate-pulse flex-shrink-0">
                            生成中
                          </span>
                        )}
                        {hasContent && !isActive && !isSectionWriting && !isSectionEditing && (
                          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-400 flex-shrink-0" title="執筆済み" />
                        )}
                        {isActive && !isSectionEditing && (
                          <span className="text-xs bg-white/20 text-white px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0">
                            執筆中
                          </span>
                        )}

                        {/* 節のメニューボタン */}
                        {structureHandlers && !isSectionEditing && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openSectionMenu(e, section, chapter.id);
                            }}
                            className={`opacity-0 group-hover:opacity-100 lg:opacity-0 p-1 rounded transition-all flex-shrink-0 ${
                              isActive 
                                ? 'hover:bg-white/20 text-white/70 hover:text-white' 
                                : 'hover:bg-amber-200/50 text-gray-500 hover:text-gray-700'
                            }`}
                            title="節のオプション"
                          >
                            <MoreVertical size={12} className="sm:w-3.5 sm:h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* 節を追加中 */}
                  {addingSectionChapterId === chapter.id && (
                    <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 bg-amber-50 border-t border-amber-100">
                      <Plus size={12} className="sm:w-3.5 sm:h-3.5 text-amber-500 flex-shrink-0" />
                      <input
                        ref={addSectionInputRef}
                        type="text"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const inputValue = (e.target as HTMLInputElement).value;
                            handleAddSection(inputValue, chapter.id);
                          } else if (e.key === 'Escape') {
                            setAddingSectionChapterId(null);
                            setNewSectionTitle('');
                          }
                        }}
                        onBlur={(e) => {
                          // イベント発生時点の値とchapterIdをキャプチャ
                          const capturedValue = e.target.value;
                          const capturedChapterId = chapter.id;
                          // 少し遅延させて、クリック等のイベントが先に処理されるようにする
                          setTimeout(() => {
                            if (capturedValue.trim()) {
                              handleAddSection(capturedValue, capturedChapterId);
                            } else {
                              setAddingSectionChapterId(null);
                            }
                          }, 100);
                        }}
                        disabled={isSubmitting}
                        placeholder="新しい節のタイトル..."
                        className="flex-1 bg-white border-2 border-amber-300 rounded px-2 py-1 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* 新しい章を追加 */}
        {structureHandlers && (
          <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-amber-100/50 mt-2">
            {isAddingChapter ? (
              <div className="flex items-center gap-2">
                <input
                  ref={addChapterInputRef}
                  type="text"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const inputValue = (e.target as HTMLInputElement).value;
                      handleAddChapter(inputValue);
                    } else if (e.key === 'Escape') {
                      setIsAddingChapter(false);
                      setNewChapterTitle('');
                    }
                  }}
                  onBlur={(e) => {
                    // イベント発生時点の値をキャプチャ
                    const capturedValue = e.target.value;
                    // 少し遅延させて、クリック等のイベントが先に処理されるようにする
                    setTimeout(() => {
                      if (capturedValue.trim()) {
                        handleAddChapter(capturedValue);
                      } else {
                        setIsAddingChapter(false);
                      }
                    }, 100);
                  }}
                  disabled={isSubmitting}
                  placeholder="新しい章のタイトル..."
                  className="flex-1 bg-white border-2 border-amber-300 rounded px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:opacity-50"
                />
              </div>
            ) : (
              <button
                onClick={() => setIsAddingChapter(true)}
                className="w-full flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-amber-100/80 hover:bg-amber-200/80 text-amber-700 font-medium text-xs sm:text-sm transition-all"
              >
                <Plus size={14} className="sm:w-4 sm:h-4" />
                <span>新しい章を追加</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* フッター: 進捗 */}
      <div className="p-3 sm:p-4 border-t border-amber-100 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
          <span>執筆進捗</span>
          <span className="text-xs">
            {chapters.reduce((acc, ch) => 
              acc + ch.sections.filter(s => s.content && s.content.trim()).length, 0
            )} / {chapters.reduce((acc, ch) => acc + ch.sections.length, 0)} 節
          </span>
        </div>
        <div className="w-full h-1.5 sm:h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
            style={{
              width: `${
                (chapters.reduce((acc, ch) => 
                  acc + ch.sections.filter(s => s.content && s.content.trim()).length, 0
                ) / Math.max(1, chapters.reduce((acc, ch) => acc + ch.sections.length, 0))) * 100
              }%`
            }}
          />
        </div>
        
        {/* ナビゲーションリンク */}
        <div className="flex items-center justify-center gap-2 sm:gap-4 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-amber-100 text-xs">
          <Link
            href="/"
            className="flex items-center gap-1 text-gray-500 hover:text-amber-600 transition-colors"
          >
            <Home size={10} className="sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">集客メーカー</span>
          </Link>
          <span className="text-gray-300 hidden sm:inline">|</span>
          <Link
            href="/kindle"
            className="flex items-center gap-1 text-gray-500 hover:text-amber-600 transition-colors"
          >
            <BookOpen size={10} className="sm:w-3 sm:h-3" />
            <span className="hidden sm:inline">KDL一覧</span>
          </Link>
        </div>
      </div>

      {/* ドロップダウンメニュー */}
      {dropdownState.type === 'chapter' && dropdownState.id && (
        <DropdownMenu
          isOpen={true}
          onClose={() => setDropdownState({ type: null, id: null, position: { x: 0, y: 0 } })}
          items={getChapterMenuItems(
            chapters.find(c => c.id === dropdownState.id)!,
            chapters.findIndex(c => c.id === dropdownState.id)
          )}
          position={dropdownState.position}
        />
      )}
      
      {dropdownState.type === 'section' && dropdownState.id && dropdownState.chapterId && (
        <DropdownMenu
          isOpen={true}
          onClose={() => setDropdownState({ type: null, id: null, position: { x: 0, y: 0 } })}
          items={getSectionMenuItems(
            chapters
              .find(c => c.id === dropdownState.chapterId)!
              .sections.find(s => s.id === dropdownState.id)!,
            chapters
              .find(c => c.id === dropdownState.chapterId)!
              .sections.findIndex(s => s.id === dropdownState.id),
            chapters.find(c => c.id === dropdownState.chapterId)!
          )}
          position={dropdownState.position}
        />
      )}
    </div>
  );
};

export default ChapterSidebar;
