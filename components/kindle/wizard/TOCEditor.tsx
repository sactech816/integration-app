'use client';

import React, { useState } from 'react';
import { 
  List, ChevronDown, ChevronUp, Trash2, MoveUp, MoveDown, ArrowLeftRight
} from 'lucide-react';
import { Chapter } from './types';

interface TOCEditorProps {
  chapters: Chapter[];
  onUpdate: (chapters: Chapter[]) => void;
  patternName?: string;
  estimatedWords?: string;
  onCopyChapterTo?: (chapterIndex: number) => void;
  isFullWidth?: boolean;
  otherSlotLabel?: string;
}

export const TOCEditor: React.FC<TOCEditorProps> = ({ 
  chapters, 
  onUpdate, 
  patternName, 
  estimatedWords, 
  onCopyChapterTo, 
  isFullWidth = false, 
  otherSlotLabel 
}) => {
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set([0]));

  const toggleChapter = (index: number) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const expandAll = () => setExpandedChapters(new Set(chapters.map((_, i) => i)));
  const collapseAll = () => setExpandedChapters(new Set());

  const updateChapterTitle = (chapterIndex: number, title: string) => {
    onUpdate(chapters.map((ch, i) => i === chapterIndex ? { ...ch, title } : ch));
  };

  const updateChapterSummary = (chapterIndex: number, summary: string) => {
    onUpdate(chapters.map((ch, i) => i === chapterIndex ? { ...ch, summary } : ch));
  };

  const updateSectionTitle = (chapterIndex: number, sectionIndex: number, title: string) => {
    onUpdate(chapters.map((ch, i) => 
      i === chapterIndex 
        ? { ...ch, sections: ch.sections.map((sec, j) => j === sectionIndex ? { ...sec, title } : sec) } 
        : ch
    ));
  };

  const addSection = (chapterIndex: number) => {
    onUpdate(chapters.map((ch, i) => 
      i === chapterIndex ? { ...ch, sections: [...ch.sections, { title: '' }] } : ch
    ));
  };

  const removeSection = (chapterIndex: number, sectionIndex: number) => {
    onUpdate(chapters.map((ch, i) => 
      i === chapterIndex ? { ...ch, sections: ch.sections.filter((_, j) => j !== sectionIndex) } : ch
    ));
  };

  const moveSectionUp = (chapterIndex: number, sectionIndex: number) => {
    if (sectionIndex === 0) return;
    onUpdate(chapters.map((ch, i) => {
      if (i !== chapterIndex) return ch;
      const newSections = [...ch.sections];
      [newSections[sectionIndex - 1], newSections[sectionIndex]] = [newSections[sectionIndex], newSections[sectionIndex - 1]];
      return { ...ch, sections: newSections };
    }));
  };

  const moveSectionDown = (chapterIndex: number, sectionIndex: number) => {
    const chapter = chapters[chapterIndex];
    if (sectionIndex >= chapter.sections.length - 1) return;
    onUpdate(chapters.map((ch, i) => {
      if (i !== chapterIndex) return ch;
      const newSections = [...ch.sections];
      [newSections[sectionIndex], newSections[sectionIndex + 1]] = [newSections[sectionIndex + 1], newSections[sectionIndex]];
      return { ...ch, sections: newSections };
    }));
  };

  const addChapter = () => {
    onUpdate([...chapters, { 
      title: `第${chapters.length}章　`, 
      summary: '', 
      sections: [{ title: '本章の概要' }, { title: '' }, { title: '本章のまとめ' }] 
    }]);
  };

  const removeChapter = (chapterIndex: number) => {
    if (chapters.length <= 1) return;
    const chapter = chapters[chapterIndex];
    if (!window.confirm(`「${chapter.title}」を削除しますか？`)) return;
    onUpdate(chapters.filter((_, i) => i !== chapterIndex));
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      newSet.delete(chapterIndex);
      return newSet;
    });
  };

  const handleCopyChapterTo = (chapterIndex: number) => {
    if (!onCopyChapterTo) return;
    const chapter = chapters[chapterIndex];
    if (!window.confirm(`「${chapter.title}」を目次案${otherSlotLabel}にコピーしますか？`)) return;
    onCopyChapterTo(chapterIndex);
  };

  const moveChapterUp = (chapterIndex: number) => {
    if (chapterIndex === 0) return;
    const newChapters = [...chapters];
    [newChapters[chapterIndex - 1], newChapters[chapterIndex]] = [newChapters[chapterIndex], newChapters[chapterIndex - 1]];
    onUpdate(newChapters);
  };

  const moveChapterDown = (chapterIndex: number) => {
    if (chapterIndex >= chapters.length - 1) return;
    const newChapters = [...chapters];
    [newChapters[chapterIndex], newChapters[chapterIndex + 1]] = [newChapters[chapterIndex + 1], newChapters[chapterIndex]];
    onUpdate(newChapters);
  };

  if (chapters.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <List className="mx-auto text-gray-300 mb-3" size={40} />
        <p className="text-gray-500">目次を生成してください</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ヘッダー情報 */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {patternName && (
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
              📚 {patternName}
            </span>
          )}
          {estimatedWords && (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              📝 {estimatedWords}
            </span>
          )}
          <span className="text-sm text-gray-500 font-medium">{chapters.length}章</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={expandAll} className="text-xs text-gray-500 hover:text-amber-600 px-2 py-1 rounded hover:bg-amber-50">
            すべて展開
          </button>
          <button onClick={collapseAll} className="text-xs text-gray-500 hover:text-amber-600 px-2 py-1 rounded hover:bg-amber-50">
            すべて閉じる
          </button>
        </div>
      </div>
      
      {/* 章リスト */}
      <div className={`space-y-2 overflow-y-auto pr-1 ${isFullWidth ? 'max-h-[600px]' : 'max-h-[500px]'}`}>
        {chapters.map((chapter, chapterIndex) => (
          <div key={chapterIndex} className="border-2 border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            {/* 章ヘッダー */}
            <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-gray-50 to-white">
              {/* 並び替えボタン */}
              <div className="flex flex-col gap-0.5">
                <button 
                  onClick={() => moveChapterUp(chapterIndex)}
                  disabled={chapterIndex === 0}
                  className="text-gray-300 hover:text-amber-500 disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
                >
                  <MoveUp size={12} />
                </button>
                <button 
                  onClick={() => moveChapterDown(chapterIndex)}
                  disabled={chapterIndex >= chapters.length - 1}
                  className="text-gray-300 hover:text-amber-500 disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
                >
                  <MoveDown size={12} />
                </button>
              </div>
              
              {/* 展開トグル */}
              <button 
                onClick={() => toggleChapter(chapterIndex)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                {expandedChapters.has(chapterIndex) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              
              {/* 章番号 */}
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded">
                {chapterIndex + 1}
              </span>
              
              {/* タイトル入力 */}
              <input
                type="text"
                value={chapter.title}
                onChange={(e) => updateChapterTitle(chapterIndex, e.target.value)}
                className="flex-1 bg-transparent font-bold text-gray-900 outline-none focus:bg-white focus:px-2 focus:rounded focus:ring-2 focus:ring-amber-200 transition-all"
              />
              
              {/* 節数 */}
              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                {chapter.sections.length}節
              </span>
              
              {/* 他方へコピー */}
              {onCopyChapterTo && (
                <button 
                  onClick={() => handleCopyChapterTo(chapterIndex)}
                  className="text-blue-500 hover:text-blue-600 p-1.5 rounded hover:bg-blue-50 transition-colors flex items-center gap-1"
                  title={`この章を目次案${otherSlotLabel}にコピー`}
                >
                  <ArrowLeftRight size={14} />
                  <span className="text-xs font-medium hidden sm:inline">→{otherSlotLabel}</span>
                </button>
              )}
              
              {/* 削除 */}
              {chapters.length > 1 && (
                <button
                  onClick={() => removeChapter(chapterIndex)}
                  className="text-gray-300 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {/* 章の内容（展開時） */}
            {expandedChapters.has(chapterIndex) && (
              <div className="p-4 space-y-3 border-t border-gray-100 bg-gray-50/50">
                {/* 概要 */}
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">章の概要</label>
                  <input
                    type="text"
                    value={chapter.summary}
                    onChange={(e) => updateChapterSummary(chapterIndex, e.target.value)}
                    placeholder="この章で何を伝えるか..."
                    className="w-full text-sm border-2 border-gray-200 rounded-lg p-2.5 text-gray-700 placeholder-gray-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
                  />
                </div>

                {/* 節リスト */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">節（見出し）</label>
                  {chapter.sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="flex items-center gap-2 pl-2 group">
                      {/* 節の並び替えボタン */}
                      <div className="flex flex-col gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => moveSectionUp(chapterIndex, sectionIndex)}
                          disabled={sectionIndex === 0}
                          className="text-gray-300 hover:text-amber-500 disabled:opacity-30 p-0"
                        >
                          <MoveUp size={10} />
                        </button>
                        <button 
                          onClick={() => moveSectionDown(chapterIndex, sectionIndex)}
                          disabled={sectionIndex >= chapter.sections.length - 1}
                          className="text-gray-300 hover:text-amber-500 disabled:opacity-30 p-0"
                        >
                          <MoveDown size={10} />
                        </button>
                      </div>
                      
                      <span className="text-gray-300 text-sm">├</span>
                      <span className="text-xs text-gray-400 w-6">{sectionIndex + 1}.</span>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => updateSectionTitle(chapterIndex, sectionIndex, e.target.value)}
                        placeholder={`節${sectionIndex + 1}のタイトル`}
                        className="flex-1 text-sm border border-gray-200 rounded-lg p-2 text-gray-700 placeholder-gray-400 focus:border-amber-400 focus:ring-1 focus:ring-amber-100 outline-none bg-white"
                      />
                      {chapter.sections.length > 1 && (
                        <button
                          onClick={() => removeSection(chapterIndex, sectionIndex)}
                          className="text-gray-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addSection(chapterIndex)}
                    className="ml-8 text-amber-600 text-sm font-medium hover:text-amber-700 flex items-center gap-1"
                  >
                    + 節を追加
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 章追加ボタン */}
      <button
        onClick={addChapter}
        className="w-full py-3 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-bold hover:bg-amber-50 hover:border-amber-400 hover:text-amber-600 transition-all"
      >
        + 章を追加
      </button>
    </div>
  );
};

export default TOCEditor;
















