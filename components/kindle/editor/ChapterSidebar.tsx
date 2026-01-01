'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, FileText, Zap, Loader2 } from 'lucide-react';

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

interface ChapterSidebarProps {
  chapters: Chapter[];
  activeSectionId: string;
  onSectionClick: (sectionId: string) => void;
  bookTitle: string;
  bookSubtitle?: string | null;
  onBatchWrite?: (chapterId: string) => void;
  batchProgress?: BatchWriteProgress;
}

export const ChapterSidebar: React.FC<ChapterSidebarProps> = ({
  chapters,
  activeSectionId,
  onSectionClick,
  bookTitle,
  bookSubtitle,
  onBatchWrite,
  batchProgress,
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

  // アクティブな節がある章を見つける
  const findActiveChapterId = () => {
    for (const chapter of chapters) {
      if (chapter.sections.some(s => s.id === activeSectionId)) {
        return chapter.id;
      }
    }
    return null;
  };

  const activeChapterId = findActiveChapterId();

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

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-amber-50 to-orange-50">
      {/* ヘッダー: 本のタイトル */}
      <div className="p-4 border-b border-amber-100 bg-white/60 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-2 rounded-lg shadow-md flex-shrink-0">
            <BookOpen className="text-white" size={20} />
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">
              {bookTitle}
            </h1>
            {bookSubtitle && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                {bookSubtitle}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 目次ヘッダー */}
      <div className="px-4 py-3 border-b border-amber-100/50">
        <h2 className="text-xs font-bold text-amber-700 uppercase tracking-wider">
          目次
        </h2>
      </div>

      {/* 章・節リスト */}
      <div className="flex-1 overflow-y-auto py-2">
        {chapters.map((chapter, chapterIndex) => {
          const isExpanded = expandedChapters.has(chapter.id);
          const isActiveChapter = chapterHasActiveSection(chapter);
          const unwrittenCount = getUnwrittenCount(chapter);
          const isWriting = isChapterWriting(chapter.id);

          return (
            <div key={chapter.id} className="mb-1">
              {/* 章ヘッダー */}
              <div
                className={`flex items-center gap-2 px-4 py-3 transition-all ${
                  isActiveChapter
                    ? 'bg-amber-100/80 border-l-4 border-amber-500'
                    : 'hover:bg-amber-50/80 border-l-4 border-transparent'
                }`}
              >
                <button
                  onClick={() => toggleChapter(chapter.id)}
                  className="flex items-center gap-2 flex-1 text-left"
                >
                  <span className={`transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`}>
                    <ChevronDown size={14} className="text-amber-600" />
                  </span>
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow-sm">
                    {chapterIndex + 1}
                  </span>
                  <span className={`flex-1 text-sm font-medium truncate ${
                    isActiveChapter ? 'text-amber-900' : 'text-gray-700'
                  }`}>
                    {chapter.title.replace(/^第\d+章[　\s]+/, '')}
                  </span>
                </button>
                
                {/* 一括執筆ボタン */}
                {onBatchWrite && unwrittenCount > 0 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBatchWrite(chapter.id);
                    }}
                    disabled={batchProgress?.isRunning}
                    title={`この章の未執筆節(${unwrittenCount}件)をAIで一括執筆`}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all ${
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
                
                <span className="text-xs text-gray-400 bg-white/60 px-1.5 py-0.5 rounded">
                  {chapter.sections.length}
                </span>
              </div>

              {/* 節リスト */}
              {isExpanded && (
                <div className="bg-white/40 border-l-4 border-amber-100 ml-4 mr-2 my-1 rounded-lg overflow-hidden">
                  {chapter.sections.map((section, sectionIndex) => {
                    const isActive = section.id === activeSectionId;
                    const hasContent = section.content && section.content.trim() !== '';
                    const isSectionWriting = isWriting && batchProgress?.currentSectionTitle === section.title;

                    return (
                      <button
                        key={section.id}
                        onClick={() => onSectionClick(section.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2.5 text-left transition-all group ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md'
                            : isSectionWriting
                            ? 'bg-purple-100 text-purple-700'
                            : 'hover:bg-amber-50 text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {isSectionWriting ? (
                          <Loader2 size={14} className="text-purple-600 animate-spin" />
                        ) : (
                          <FileText 
                            size={14} 
                            className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-amber-500'} 
                          />
                        )}
                        <span className={`text-xs font-medium ${isActive ? 'text-white/80' : 'text-gray-400'}`}>
                          {sectionIndex + 1}.
                        </span>
                        <span className={`flex-1 text-sm truncate ${isActive ? 'font-medium' : ''}`}>
                          {section.title || `節 ${sectionIndex + 1}`}
                        </span>
                        {isSectionWriting && (
                          <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full animate-pulse">
                            生成中
                          </span>
                        )}
                        {hasContent && !isActive && !isSectionWriting && (
                          <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" title="執筆済み" />
                        )}
                        {isActive && (
                          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                            執筆中
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* フッター: 進捗 */}
      <div className="p-4 border-t border-amber-100 bg-white/60 backdrop-blur-sm">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>執筆進捗</span>
          <span>
            {chapters.reduce((acc, ch) => 
              acc + ch.sections.filter(s => s.content && s.content.trim()).length, 0
            )} / {chapters.reduce((acc, ch) => acc + ch.sections.length, 0)} 節
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
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
      </div>
    </div>
  );
};

export default ChapterSidebar;



